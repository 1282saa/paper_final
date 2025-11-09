/**
 * Lambda: RAG 기반 질의응답
 *
 * 벡터 검색으로 관련 노트를 찾고 Claude가 답변을 생성합니다.
 *
 * AI 인덱싱 키워드: Lambda, RAG, Vector Search, Claude AI, DynamoDB
 */

import vectorServiceDynamoDB from "../../src/services/vectorServiceDynamoDB.js";
import bedrockService from "../../src/services/bedrockService.js";
import NoteModel from "../../src/models/dynamodb/Note.js";

/**
 * RAG 질의응답 핸들러
 * @param {Object} event - API Gateway 이벤트
 * @returns {Object} HTTP 응답
 */
export const handler = async (event) => {
  try {
    console.log("RAG 질의응답 요청:", event);

    // 요청 body 파싱
    const body = JSON.parse(event.body || "{}");
    const { question, userId, noteIds, topK = 5 } = body;

    // 필수 파라미터 검증
    if (!question) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "question은 필수입니다.",
        }),
      };
    }

    if (!noteIds || noteIds.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "noteIds는 필수입니다. 검색할 노트 ID 배열을 제공하세요.",
        }),
      };
    }

    console.log(`🔍 질문: "${question}"`);
    console.log(`📚 검색 대상 노트: ${noteIds.length}개`);

    // 1. 벡터 검색으로 유사한 청크 찾기
    const searchResults = await vectorServiceDynamoDB.search(question, topK, { noteIds });

    if (searchResults.length === 0) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: true,
          data: {
            answer: "관련된 노트 내용을 찾을 수 없습니다. 먼저 노트를 인덱싱해주세요.",
            sources: [],
            confidence: 0,
          },
        }),
      };
    }

    console.log(`✅ 유사한 청크 ${searchResults.length}개 발견`);

    // 2. 검색된 청크들을 컨텍스트로 조합
    const context = searchResults
      .map((result, index) => {
        return `[청크 ${index + 1}] (유사도: ${result.similarity.toFixed(3)})\n${result.text}`;
      })
      .join("\n\n---\n\n");

    // 3. Claude에게 RAG 프롬프트 전달
    const ragPrompt = `다음은 사용자의 학습 노트에서 검색된 내용입니다. 이 내용을 바탕으로 질문에 답변해주세요.

<학습 노트 내용>
${context}
</학습 노트 내용>

<질문>
${question}
</질문>

위 노트 내용을 참고하여 정확하고 도움이 되는 답변을 작성해주세요.
만약 노트 내용에 없는 정보라면 솔직하게 말씀해주세요.`;

    const answer = await bedrockService.askQuestion(ragPrompt, {
      maxTokens: 1000,
      temperature: 0.3, // 낮은 temperature로 정확성 향상
      system:
        "당신은 학습 노트를 분석하여 질문에 답변하는 AI 튜터입니다. 제공된 노트 내용을 기반으로 정확하고 명확하게 답변하세요.",
    });

    console.log(`✅ RAG 답변 생성 완료`);

    // 4. 출처 정보 추가
    const sources = searchResults.map((result) => ({
      noteId: result.noteId,
      text: result.text.substring(0, 200) + "...", // 미리보기
      similarity: result.similarity,
      chunkIndex: result.chunkIndex,
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        data: {
          answer,
          sources,
          confidence: searchResults[0]?.similarity || 0,
          totalChunksSearched: searchResults.length,
        },
      }),
    };
  } catch (error) {
    console.error("RAG 질의응답 오류:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
