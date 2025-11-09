/**
 * Lambda: 노트 목록 조회
 *
 * 사용자의 모든 노트를 조회합니다.
 *
 * AI 인덱싱 키워드: Lambda, DynamoDB Query, Pagination
 */

import NoteModel from "../../src/models/dynamodb/Note.js";

/**
 * 노트 목록 조회 핸들러
 * @param {Object} event - API Gateway 이벤트
 * @returns {Object} HTTP 응답
 */
export const handler = async (event) => {
  try {
    console.log("노트 목록 조회 요청:", event);

    // 쿼리 파라미터 추출
    const userId = event.queryStringParameters?.userId;
    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit)
      : 20;
    const lastEvaluatedKey = event.queryStringParameters?.lastKey
      ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey))
      : null;

    // userId 필수 검증
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "userId는 필수입니다.",
        }),
      };
    }

    // DynamoDB에서 노트 조회
    const result = await NoteModel.findByUserId(userId, {
      limit,
      lastEvaluatedKey,
    });

    console.log(`✅ 노트 ${result.notes.length}개 조회 완료`);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        data: {
          notes: result.notes,
          count: result.count,
          lastEvaluatedKey: result.lastEvaluatedKey
            ? encodeURIComponent(JSON.stringify(result.lastEvaluatedKey))
            : null,
          hasMore: !!result.lastEvaluatedKey,
        },
      }),
    };
  } catch (error) {
    console.error("노트 조회 오류:", error);

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
