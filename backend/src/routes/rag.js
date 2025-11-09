import express from "express";
import Note from "../models/Note.js";
import vectorService from "../services/vectorService.js";
import bedrockService from "../services/bedrockService.js";
import { autoChunk } from "../utils/textChunker.js";

const router = express.Router();

/**
 * POST /api/rag/index-note
 * 노트를 벡터화하여 인덱싱
 */
router.post("/index-note", async (req, res) => {
  try {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        error: "노트 ID가 필요합니다.",
      });
    }

    // 노트 조회
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        error: "노트를 찾을 수 없습니다.",
      });
    }

    // 이미 인덱싱된 경우
    if (note.isIndexed) {
      return res.json({
        success: true,
        message: "이미 인덱싱된 노트입니다.",
        chunkCount: note.chunks.length,
      });
    }

    console.log(`\n🔍 노트 인덱싱 시작: ${note.title}`);

    // 텍스트 청킹
    const chunks = autoChunk(note.content, 500);
    console.log(`📦 ${chunks.length}개 청크 생성`);

    // 벡터화
    const vectorIds = await vectorService.indexNoteChunks(noteId, chunks);

    // MongoDB에 청크 정보 저장
    note.chunks = chunks.map((text, index) => ({
      text,
      vectorId: vectorIds[index],
      startIndex: 0,
      endIndex: 0,
    }));
    note.isIndexed = true;

    await note.save();

    console.log(`✅ 노트 인덱싱 완료`);

    res.json({
      success: true,
      message: "노트가 성공적으로 인덱싱되었습니다.",
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error("노트 인덱싱 오류:", error);
    res.status(500).json({
      success: false,
      error: error.message || "노트 인덱싱 중 오류가 발생했습니다.",
    });
  }
});

/**
 * POST /api/rag/ask
 * RAG 기반 질의응답
 */
router.post("/ask", async (req, res) => {
  try {
    const { question, noteIds, userId = "test-user", topK = 3 } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "질문을 입력해주세요.",
      });
    }

    console.log(`\n❓ RAG 질문: "${question}"`);

    // 유사한 청크 검색
    const filters = {};
    if (noteIds && noteIds.length > 0) {
      filters.noteIds = noteIds;
    }

    const searchResults = await vectorService.search(question, topK, filters);

    if (searchResults.length === 0) {
      return res.json({
        success: true,
        data: {
          answer: "관련된 학습 노트를 찾을 수 없습니다. 먼저 노트를 업로드하고 인덱싱해주세요.",
          sources: [],
        },
      });
    }

    console.log(`🔍 ${searchResults.length}개의 관련 청크 발견`);
    searchResults.forEach((r, i) => {
      console.log(`  ${i + 1}. 유사도: ${(r.similarity * 100).toFixed(1)}%`);
    });

    // 컨텍스트 구성
    const context = searchResults
      .map((r, i) => `[참고 ${i + 1}]\n${r.text}`)
      .join("\n\n");

    // RAG 프롬프트 구성
    const ragPrompt = `다음은 학생의 학습 노트에서 추출한 내용입니다:

${context}

위의 학습 노트 내용을 바탕으로 다음 질문에 답변해주세요. 답변은 학습 노트의 내용을 기반으로 하되, 필요시 추가 설명을 덧붙여주세요.

질문: ${question}`;

    // Claude에게 답변 요청
    const answer = await bedrockService.askQuestion(ragPrompt, {
      system:
        "당신은 학습을 돕는 AI 튜터입니다. 제공된 학습 노트를 기반으로 학생의 질문에 답변하되, 노트에 없는 내용은 추가로 설명해줄 수 있습니다.",
      temperature: 0.7,
    });

    // 소스 노트 정보 조회
    const uniqueNoteIds = [...new Set(searchResults.map((r) => r.noteId))];
    const sourceNotes = await Note.find({ _id: { $in: uniqueNoteIds } }).select(
      "title subject"
    );

    const sources = searchResults.map((r) => {
      const note = sourceNotes.find((n) => n._id.toString() === r.noteId);
      return {
        noteId: r.noteId,
        noteTitle: note?.title || "Unknown",
        subject: note?.subject,
        relevantText: r.text.substring(0, 200) + "...",
        similarity: r.similarity,
      };
    });

    res.json({
      success: true,
      data: {
        question,
        answer,
        sources,
      },
    });
  } catch (error) {
    console.error("RAG 질의응답 오류:", error);
    res.status(500).json({
      success: false,
      error: error.message || "질의응답 중 오류가 발생했습니다.",
    });
  }
});

/**
 * GET /api/rag/stats
 * 벡터 저장소 통계
 */
router.get("/stats", (req, res) => {
  try {
    const stats = vectorService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("통계 조회 오류:", error);
    res.status(500).json({
      success: false,
      error: "통계 조회 중 오류가 발생했습니다.",
    });
  }
});

export default router;
