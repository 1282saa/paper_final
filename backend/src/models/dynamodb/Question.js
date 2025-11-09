/**
 * DynamoDB Question 모델
 *
 * AI 생성 문제를 DynamoDB에 저장/조회하는 모델
 *
 * AI 인덱싱 키워드: Question, DynamoDB Model, AI Generated Questions
 */

import dynamodbService from "../../services/dynamodbService.js";
import { v4 as uuidv4 } from "uuid";

class QuestionModel {
  /**
   * 문제 세트 생성
   * @param {Object} questionData - 문제 데이터
   * @param {string} questionData.noteId - 노트 ID
   * @param {string} questionData.userId - 사용자 ID
   * @param {Array<Object>} questionData.questions - 문제 배열
   * @returns {Promise<Object>} 생성된 문제 세트
   */
  async create(questionData) {
    const questionSetId = uuidv4();
    const now = Date.now();
    const timestamp = new Date().toISOString();

    const questionSet = {
      questionSetId,
      noteId: questionData.noteId,
      userId: questionData.userId,
      questions: questionData.questions,
      createdAt: now,
    };

    // 1. 노트별 문제 아이템 (PK: NOTE#noteId, SK: QUESTION#timestamp#questionSetId)
    const noteQuestionItem = {
      PK: dynamodbService.getNotePK(questionData.noteId),
      SK: dynamodbService.getQuestionSK(timestamp, questionSetId),
      Type: "QUESTION",
      ...questionSet,
      // GSI for user-based queries
      GSI1PK: dynamodbService.getUserPK(questionData.userId),
      GSI1SK: `QUESTION#${timestamp}`,
    };

    await dynamodbService.putItem(noteQuestionItem);

    return questionSet;
  }

  /**
   * 문제 세트 ID로 조회
   * @param {string} noteId - 노트 ID
   * @param {string} questionSetId - 문제 세트 ID
   * @returns {Promise<Object|null>} 문제 세트
   */
  async findById(noteId, questionSetId) {
    // SK를 정확히 알려면 timestamp가 필요
    // 대신 noteId로 모든 문제 조회 후 필터링
    const result = await dynamodbService.query(dynamodbService.getNotePK(noteId), {
      skBeginsWith: "QUESTION#",
      filterExpression: "questionSetId = :questionSetId",
      expressionAttributeValues: { ":questionSetId": questionSetId },
    });

    if (result.items.length === 0) return null;

    const { Type, PK, SK, GSI1PK, GSI1SK, ...questionData } = result.items[0];
    return questionData;
  }

  /**
   * 노트 ID로 모든 문제 조회
   * @param {string} noteId - 노트 ID
   * @param {Object} options - 쿼리 옵션
   * @returns {Promise<Object>} { questionSets, lastEvaluatedKey }
   */
  async findByNoteId(noteId, options = {}) {
    const result = await dynamodbService.query(dynamodbService.getNotePK(noteId), {
      skBeginsWith: "QUESTION#",
      limit: options.limit,
      lastEvaluatedKey: options.lastEvaluatedKey,
      scanIndexForward: false, // 최신순
    });

    const questionSets = result.items.map((item) => {
      const { Type, PK, SK, GSI1PK, GSI1SK, ...questionData } = item;
      return questionData;
    });

    return {
      questionSets,
      lastEvaluatedKey: result.lastEvaluatedKey,
      count: result.count,
    };
  }

  /**
   * 사용자 ID로 모든 문제 조회 (GSI 사용)
   * @param {string} userId - 사용자 ID
   * @param {Object} options - 쿼리 옵션
   * @returns {Promise<Object>} { questionSets, lastEvaluatedKey }
   */
  async findByUserId(userId, options = {}) {
    const result = await dynamodbService.queryGSI("GSI1", dynamodbService.getUserPK(userId), {
      gsiSkBeginsWith: "QUESTION#",
      limit: options.limit,
      lastEvaluatedKey: options.lastEvaluatedKey,
      scanIndexForward: false, // 최신순
    });

    const questionSets = result.items.map((item) => {
      const { Type, PK, SK, GSI1PK, GSI1SK, ...questionData } = item;
      return questionData;
    });

    return {
      questionSets,
      lastEvaluatedKey: result.lastEvaluatedKey,
      count: result.count,
    };
  }

  /**
   * 문제 세트 삭제
   * @param {string} noteId - 노트 ID
   * @param {string} questionSetId - 문제 세트 ID
   * @returns {Promise<void>}
   */
  async delete(noteId, questionSetId) {
    // SK를 정확히 찾기 위해 먼저 조회
    const result = await dynamodbService.query(dynamodbService.getNotePK(noteId), {
      skBeginsWith: "QUESTION#",
      filterExpression: "questionSetId = :questionSetId",
      expressionAttributeValues: { ":questionSetId": questionSetId },
    });

    if (result.items.length > 0) {
      const item = result.items[0];
      await dynamodbService.deleteItem(item.PK, item.SK);
    }
  }
}

export default new QuestionModel();
