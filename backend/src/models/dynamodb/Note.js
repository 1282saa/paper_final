/**
 * DynamoDB Note 모델
 *
 * 학습 노트를 DynamoDB에 저장/조회하는 모델
 *
 * AI 인덱싱 키워드: Note, DynamoDB Model, Single Table Design, OCR
 */

import dynamodbService from "../../services/dynamodbService.js";
import { v4 as uuidv4 } from "uuid";

class NoteModel {
  /**
   * 노트 생성
   * @param {Object} noteData - 노트 데이터
   * @param {string} noteData.userId - 사용자 ID
   * @param {string} noteData.title - 제목
   * @param {string} noteData.subject - 과목
   * @param {string} noteData.content - 내용
   * @param {string} noteData.imageUrl - 이미지 URL
   * @param {string} noteData.s3Key - S3 키
   * @param {Object} noteData.metadata - 메타데이터
   * @param {Array<string>} noteData.tags - 태그
   * @returns {Promise<Object>} 생성된 노트
   */
  async create(noteData) {
    const noteId = uuidv4();
    const now = Date.now();
    const timestamp = new Date().toISOString();

    const note = {
      noteId,
      userId: noteData.userId,
      title: noteData.title,
      subject: noteData.subject || "",
      content: noteData.content,
      imageUrl: noteData.imageUrl,
      s3Key: noteData.s3Key,
      metadata: noteData.metadata || {},
      tags: noteData.tags || [],
      isIndexed: false,
      createdAt: now,
      updatedAt: now,
    };

    // 1. 사용자별 노트 목록 아이템 (PK: USER#userId, SK: NOTE#timestamp#noteId)
    const userNoteItem = {
      PK: dynamodbService.getUserPK(noteData.userId),
      SK: dynamodbService.getNoteSK(timestamp, noteId),
      Type: "NOTE",
      ...note,
      // GSI for subject-based queries
      GSI1PK: `SUBJECT#${noteData.subject || "기타"}`,
      GSI1SK: timestamp,
    };

    // 2. 노트 메타데이터 아이템 (PK: NOTE#noteId, SK: METADATA)
    const noteMetadataItem = {
      PK: dynamodbService.getNotePK(noteId),
      SK: "METADATA",
      Type: "NOTE",
      ...note,
    };

    // 두 아이템 동시 저장
    await dynamodbService.batchWriteItems([userNoteItem, noteMetadataItem]);

    return note;
  }

  /**
   * 노트 ID로 조회
   * @param {string} noteId - 노트 ID
   * @returns {Promise<Object|null>} 노트 데이터
   */
  async findById(noteId) {
    const result = await dynamodbService.getItem(
      dynamodbService.getNotePK(noteId),
      "METADATA"
    );

    if (!result) return null;

    // Type, PK, SK 제거하고 순수 데이터만 반환
    const { Type, PK, SK, ...noteData } = result;
    return noteData;
  }

  /**
   * 사용자 ID로 노트 목록 조회
   * @param {string} userId - 사용자 ID
   * @param {Object} options - 쿼리 옵션
   * @param {number} options.limit - 결과 개수 제한
   * @param {Object} options.lastEvaluatedKey - 페이지네이션 키
   * @returns {Promise<Object>} { notes, lastEvaluatedKey }
   */
  async findByUserId(userId, options = {}) {
    const result = await dynamodbService.query(dynamodbService.getUserPK(userId), {
      skBeginsWith: "NOTE#",
      limit: options.limit,
      lastEvaluatedKey: options.lastEvaluatedKey,
      scanIndexForward: false, // 최신순 정렬
    });

    const notes = result.items.map((item) => {
      const { Type, PK, SK, GSI1PK, GSI1SK, ...noteData } = item;
      return noteData;
    });

    return {
      notes,
      lastEvaluatedKey: result.lastEvaluatedKey,
      count: result.count,
    };
  }

  /**
   * 과목별 노트 조회 (GSI 사용)
   * @param {string} subject - 과목
   * @param {Object} options - 쿼리 옵션
   * @returns {Promise<Object>} { notes, lastEvaluatedKey }
   */
  async findBySubject(subject, options = {}) {
    const result = await dynamodbService.queryGSI("GSI1", `SUBJECT#${subject}`, {
      limit: options.limit,
      lastEvaluatedKey: options.lastEvaluatedKey,
      scanIndexForward: false, // 최신순
    });

    const notes = result.items.map((item) => {
      const { Type, PK, SK, GSI1PK, GSI1SK, ...noteData } = item;
      return noteData;
    });

    return {
      notes,
      lastEvaluatedKey: result.lastEvaluatedKey,
      count: result.count,
    };
  }

  /**
   * 노트 업데이트
   * @param {string} noteId - 노트 ID
   * @param {Object} updates - 업데이트할 필드
   * @returns {Promise<Object>} 업데이트된 노트
   */
  async update(noteId, updates) {
    // NOTE#noteId의 METADATA 업데이트
    const result = await dynamodbService.updateItem(
      dynamodbService.getNotePK(noteId),
      "METADATA",
      updates
    );

    // USER#userId의 NOTE# 아이템도 업데이트해야 함 (일관성 유지)
    // 실제 구현 시 트랜잭션 사용 권장

    const { Type, PK, SK, ...noteData } = result;
    return noteData;
  }

  /**
   * 노트 삭제
   * @param {string} noteId - 노트 ID
   * @param {string} userId - 사용자 ID
   * @returns {Promise<void>}
   */
  async delete(noteId, userId) {
    // 1. NOTE#noteId의 METADATA 삭제
    await dynamodbService.deleteItem(dynamodbService.getNotePK(noteId), "METADATA");

    // 2. NOTE#noteId의 모든 VECTOR# 청크 삭제
    const vectors = await dynamodbService.query(dynamodbService.getNotePK(noteId), {
      skBeginsWith: "VECTOR#",
    });

    for (const vector of vectors.items) {
      await dynamodbService.deleteItem(vector.PK, vector.SK);
    }

    // 3. NOTE#noteId의 모든 QUESTION# 삭제
    const questions = await dynamodbService.query(dynamodbService.getNotePK(noteId), {
      skBeginsWith: "QUESTION#",
    });

    for (const question of questions.items) {
      await dynamodbService.deleteItem(question.PK, question.SK);
    }

    // 4. USER#userId의 NOTE# 아이템 삭제
    // SK를 정확히 알아야 하므로, 먼저 조회 필요
    const userNotes = await dynamodbService.query(dynamodbService.getUserPK(userId), {
      skBeginsWith: "NOTE#",
      filterExpression: "noteId = :noteId",
      expressionAttributeValues: { ":noteId": noteId },
    });

    if (userNotes.items.length > 0) {
      const userNote = userNotes.items[0];
      await dynamodbService.deleteItem(userNote.PK, userNote.SK);
    }
  }

  /**
   * 노트에 청크 추가 (RAG용)
   * @param {string} noteId - 노트 ID
   * @param {Array<Object>} chunks - 텍스트 청크 배열
   * @returns {Promise<void>}
   */
  async addChunks(noteId, chunks) {
    const chunkItems = chunks.map((chunk, index) => ({
      PK: dynamodbService.getNotePK(noteId),
      SK: dynamodbService.getVectorSK(chunk.vectorId || `chunk${index}`),
      Type: "VECTOR",
      vectorId: chunk.vectorId || `chunk${index}`,
      noteId,
      text: chunk.text,
      embedding: chunk.embedding || [],
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex,
      createdAt: Date.now(),
    }));

    await dynamodbService.batchWriteItems(chunkItems);

    // 노트의 isIndexed를 true로 업데이트
    await this.update(noteId, { isIndexed: true });
  }

  /**
   * 노트의 청크 조회
   * @param {string} noteId - 노트 ID
   * @returns {Promise<Array<Object>>} 청크 배열
   */
  async getChunks(noteId) {
    const result = await dynamodbService.query(dynamodbService.getNotePK(noteId), {
      skBeginsWith: "VECTOR#",
    });

    return result.items.map((item) => {
      const { Type, PK, SK, ...chunkData } = item;
      return chunkData;
    });
  }

  /**
   * S3 키로 노트 조회 (OCR 처리용)
   * @param {string} s3Key - S3 객체 키
   * @returns {Promise<Object|null>} 노트 데이터
   */
  async findByS3Key(s3Key) {
    // DynamoDB는 직접 s3Key로 조회 불가능
    // 실제 구현 시 GSI2를 s3Key로 만들거나, 메타데이터에 s3Key를 PK로 저장
    // 여기서는 간단히 스캔 (비효율적, 프로덕션에서는 GSI 사용)

    // 임시 방편: noteId가 s3Key에 포함되어 있다고 가정
    // 실제로는 GSI를 추가하거나 S3 이벤트에서 noteId를 메타데이터로 전달
    throw new Error("findByS3Key는 GSI2 구현 필요 - S3 이벤트에서 noteId를 전달하세요");
  }
}

export default new NoteModel();
