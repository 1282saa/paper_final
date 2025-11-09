/**
 * Lambda: 노트 상세 조회
 *
 * 특정 노트의 상세 정보를 조회합니다.
 *
 * AI 인덱싱 키워드: Lambda, DynamoDB GetItem, Note Detail
 */

import NoteModel from "../../src/models/dynamodb/Note.js";

/**
 * 노트 상세 조회 핸들러
 * @param {Object} event - API Gateway 이벤트
 * @returns {Object} HTTP 응답
 */
export const handler = async (event) => {
  try {
    console.log("노트 상세 조회 요청:", event);

    // Path 파라미터에서 noteId 추출
    const noteId = event.pathParameters?.noteId;

    if (!noteId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "noteId는 필수입니다.",
        }),
      };
    }

    // DynamoDB에서 노트 조회
    const note = await NoteModel.findById(noteId);

    if (!note) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          error: "노트를 찾을 수 없습니다.",
        }),
      };
    }

    console.log(`✅ 노트 ${noteId} 조회 완료`);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        data: note,
      }),
    };
  } catch (error) {
    console.error("노트 상세 조회 오류:", error);

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
