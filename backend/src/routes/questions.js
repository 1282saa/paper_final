import express from "express";
import Note from "../models/Note.js";
import QuestionSet from "../models/Question.js";
import bedrockService from "../services/bedrockService.js";

const router = express.Router();

/**
 * POST /api/questions/generate
 * 노트 기반 문제 생성
 */
router.post("/generate", async (req, res) => {
  try {
    const {
      noteId,
      count = 5,
      questionType = "객관식",
      difficulty = "보통",
      userId = "test-user",
    } = req.body;

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

    console.log(`\n📝 문제 생성 시작`);
    console.log(`  노트: ${note.title}`);
    console.log(`  개수: ${count}개`);
    console.log(`  유형: ${questionType}`);
    console.log(`  난이도: ${difficulty}`);

    // 문제 생성 프롬프트
    const questionPrompt = `다음은 학생의 학습 노트 내용입니다:

---
제목: ${note.title}
과목: ${note.subject || "미지정"}

내용:
${note.content}
---

위 학습 노트의 내용을 바탕으로 **${questionType}** 문제를 **${count}개** 생성해주세요.

요구사항:
1. 난이도: **${difficulty}**
2. 문제는 학습 내용을 제대로 이해했는지 확인할 수 있어야 합니다
3. 각 문제는 학습 노트의 다른 부분을 다루어야 합니다
${
  questionType === "객관식"
    ? "4. 각 객관식 문제는 4개의 선택지를 포함해야 합니다\n5. 정답과 상세한 해설을 함께 제공해주세요"
    : ""
}
${
  questionType === "주관식"
    ? "4. 예시 답안과 채점 기준을 함께 제공해주세요"
    : ""
}

**중요: 반드시 다음 JSON 형식으로만 응답해주세요 (다른 설명 없이):**

\`\`\`json
{
  "questions": [
    {
      "type": "${questionType}",
      "question": "문제 내용",
      ${questionType === "객관식" ? '"options": ["선택지1", "선택지2", "선택지3", "선택지4"],' : ""}
      "answer": "${questionType === "객관식" ? "정답 선택지 번호 (1-4)" : "예시 답안"}",
      "explanation": "상세한 해설",
      "difficulty": "${difficulty}",
      "points": 10
    }
  ]
}
\`\`\``;

    // Claude에게 문제 생성 요청
    const response = await bedrockService.askQuestion(questionPrompt, {
      system:
        "당신은 교육 전문가이자 문제 출제 전문가입니다. 학습 효과가 높은 양질의 문제를 JSON 형식으로 생성해주세요.",
      temperature: 0.8,
      max_tokens: 4096,
    });

    console.log(`✅ Claude 응답 수신`);

    // JSON 파싱
    let parsedQuestions;
    try {
      // ```json ... ``` 블록에서 JSON 추출
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : response;

      parsedQuestions = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);

      // 파싱 실패시 원본 응답 반환
      return res.json({
        success: true,
        data: {
          noteId,
          noteTitle: note.title,
          questionType,
          count,
          difficulty,
          rawResponse: response,
          warning:
            "문제가 JSON 형식으로 파싱되지 않았습니다. rawResponse를 확인해주세요.",
        },
      });
    }

    // QuestionSet 저장
    const questionSet = new QuestionSet({
      noteId,
      userId,
      title: `${note.title} - ${questionType} 문제`,
      subject: note.subject,
      questions: parsedQuestions.questions,
      metadata: {
        totalQuestions: parsedQuestions.questions.length,
        difficulty,
        estimatedTime: parsedQuestions.questions.length * 3, // 문제당 3분 예상
      },
    });

    await questionSet.save();

    console.log(`✅ 문제 세트 저장 완료 (ID: ${questionSet._id})`);

    res.json({
      success: true,
      data: {
        questionSetId: questionSet._id,
        noteId,
        noteTitle: note.title,
        questionType,
        count: parsedQuestions.questions.length,
        difficulty,
        questions: parsedQuestions.questions,
        createdAt: questionSet.createdAt,
      },
    });
  } catch (error) {
    console.error("문제 생성 오류:", error);
    res.status(500).json({
      success: false,
      error: error.message || "문제 생성 중 오류가 발생했습니다.",
    });
  }
});

/**
 * GET /api/questions/:questionSetId
 * 문제 세트 조회
 */
router.get("/:questionSetId", async (req, res) => {
  try {
    const { questionSetId } = req.params;

    const questionSet = await QuestionSet.findById(questionSetId).populate(
      "noteId",
      "title subject"
    );

    if (!questionSet) {
      return res.status(404).json({
        success: false,
        error: "문제 세트를 찾을 수 없습니다.",
      });
    }

    res.json({
      success: true,
      data: questionSet,
    });
  } catch (error) {
    console.error("문제 세트 조회 오류:", error);
    res.status(500).json({
      success: false,
      error: "문제 세트 조회 중 오류가 발생했습니다.",
    });
  }
});

/**
 * GET /api/questions
 * 문제 세트 목록 조회
 */
router.get("/", async (req, res) => {
  try {
    const { userId = "test-user", noteId, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (noteId) {
      query.noteId = noteId;
    }

    const skip = (page - 1) * limit;

    const [questionSets, total] = await Promise.all([
      QuestionSet.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("noteId", "title subject"),
      QuestionSet.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        questionSets,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("문제 세트 목록 조회 오류:", error);
    res.status(500).json({
      success: false,
      error: "문제 세트 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

export default router;
