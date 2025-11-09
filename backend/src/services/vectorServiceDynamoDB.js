/**
 * DynamoDB 기반 벡터 검색 서비스
 *
 * 벡터를 DynamoDB에 저장하고 검색합니다.
 * Lambda 메모리에서 유사도 계산을 수행합니다.
 *
 * AI 인덱싱 키워드: Vector Search, DynamoDB, RAG, Embeddings, Similarity
 */

import embeddingService from "./embeddingService.js";
import dynamodbService from "./dynamodbService.js";
import { v4 as uuidv4 } from "uuid";

class VectorServiceDynamoDB {
  /**
   * 노트의 텍스트를 벡터화하여 DynamoDB에 저장
   * @param {string} noteId - 노트 ID
   * @param {Array<Object>} chunks - 텍스트 청크 배열 [{ text, startIndex, endIndex }]
   * @returns {Promise<string[]>} - 생성된 벡터 ID 배열
   */
  async indexNoteChunks(noteId, chunks) {
    try {
      const vectorIds = [];
      const vectorItems = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // 임베딩 생성
        const embedding = await embeddingService.embedText(chunk.text);

        // 벡터 ID 생성
        const vectorId = uuidv4();

        // DynamoDB 아이템 생성
        const vectorItem = {
          PK: dynamodbService.getNotePK(noteId),
          SK: dynamodbService.getVectorSK(vectorId),
          Type: "VECTOR",
          vectorId,
          noteId,
          text: chunk.text,
          embedding, // 1024차원 배열
          startIndex: chunk.startIndex || 0,
          endIndex: chunk.endIndex || chunk.text.length,
          chunkIndex: i,
          createdAt: Date.now(),
        };

        vectorItems.push(vectorItem);
        vectorIds.push(vectorId);

        // API 제한을 위한 딜레이
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // 배치로 DynamoDB에 저장 (최대 25개씩)
      await dynamodbService.batchWriteItems(vectorItems);

      console.log(`✅ ${chunks.length}개 청크 벡터화 완료 (노트 ${noteId})`);

      return vectorIds;
    } catch (error) {
      console.error("벡터 인덱싱 오류:", error);
      throw new Error(`벡터 인덱싱 실패: ${error.message}`);
    }
  }

  /**
   * 질문과 유사한 벡터 검색
   * @param {string} query - 검색 질문
   * @param {number} topK - 반환할 최대 결과 수
   * @param {Object} filters - 필터 옵션
   * @param {Array<string>} filters.noteIds - 특정 노트들만 검색
   * @param {string} filters.userId - 사용자 ID (전체 노트 검색 시)
   * @returns {Promise<Array>} - 유사한 청크들
   */
  async search(query, topK = 5, filters = {}) {
    try {
      // 1. 질문 벡터화
      const queryEmbedding = await embeddingService.embedText(query);

      // 2. DynamoDB에서 벡터 조회
      let allVectors = [];

      if (filters.noteIds && filters.noteIds.length > 0) {
        // 특정 노트들의 벡터만 조회
        for (const noteId of filters.noteIds) {
          const result = await dynamodbService.query(dynamodbService.getNotePK(noteId), {
            skBeginsWith: "VECTOR#",
          });
          allVectors = allVectors.concat(result.items);
        }
      } else {
        // 전체 벡터 조회 (비효율적, 실제로는 사용자별 노트 목록 먼저 조회 권장)
        console.warn("⚠️  전체 벡터 검색은 비효율적입니다. noteIds 필터 사용 권장");
        // 실제 구현 시: 사용자 노트 목록 → 각 노트의 벡터 조회
        throw new Error("전체 벡터 검색은 지원하지 않습니다. noteIds를 제공하세요.");
      }

      // 3. 코사인 유사도 계산
      const results = allVectors.map((vector) => {
        const similarity = embeddingService.cosineSimilarity(queryEmbedding, vector.embedding);

        return {
          vectorId: vector.vectorId,
          noteId: vector.noteId,
          chunkIndex: vector.chunkIndex,
          text: vector.text,
          similarity,
          startIndex: vector.startIndex,
          endIndex: vector.endIndex,
        };
      });

      // 4. 유사도 순으로 정렬
      results.sort((a, b) => b.similarity - a.similarity);

      // 5. 상위 K개 반환
      const topResults = results.slice(0, topK);

      console.log(`🔍 벡터 검색 완료: ${allVectors.length}개 중 상위 ${topResults.length}개`);

      return topResults;
    } catch (error) {
      console.error("벡터 검색 오류:", error);
      throw new Error(`벡터 검색 실패: ${error.message}`);
    }
  }

  /**
   * 특정 노트의 모든 벡터 조회
   * @param {string} noteId - 노트 ID
   * @returns {Promise<Array>} - 벡터 배열
   */
  async getNoteVectors(noteId) {
    try {
      const result = await dynamodbService.query(dynamodbService.getNotePK(noteId), {
        skBeginsWith: "VECTOR#",
      });

      const vectors = result.items.map((item) => {
        const { Type, PK, SK, ...vectorData } = item;
        return vectorData;
      });

      return vectors;
    } catch (error) {
      console.error("벡터 조회 오류:", error);
      throw new Error(`벡터 조회 실패: ${error.message}`);
    }
  }

  /**
   * 특정 노트의 벡터 삭제
   * @param {string} noteId - 노트 ID
   * @returns {Promise<number>} - 삭제된 벡터 개수
   */
  async deleteNoteVectors(noteId) {
    try {
      // 1. 노트의 모든 벡터 조회
      const result = await dynamodbService.query(dynamodbService.getNotePK(noteId), {
        skBeginsWith: "VECTOR#",
      });

      // 2. 각 벡터 삭제
      for (const vector of result.items) {
        await dynamodbService.deleteItem(vector.PK, vector.SK);
      }

      const deletedCount = result.items.length;
      console.log(`🗑️  노트 ${noteId}의 벡터 ${deletedCount}개 삭제됨`);

      return deletedCount;
    } catch (error) {
      console.error("벡터 삭제 오류:", error);
      throw new Error(`벡터 삭제 실패: ${error.message}`);
    }
  }

  /**
   * 벡터 저장소 통계
   * @param {string} userId - 사용자 ID (선택사항)
   * @returns {Promise<Object>} - { totalVectors, uniqueNotes }
   */
  async getStats(userId = null) {
    try {
      // DynamoDB에서 전체 통계를 효율적으로 구하기는 어려움
      // 실제 구현 시: CloudWatch 메트릭 또는 별도 카운터 테이블 사용 권장

      console.warn("⚠️  DynamoDB 전체 통계는 비효율적입니다. 사용자별 노트 조회 권장");

      return {
        message: "DynamoDB 전체 스캔은 지원하지 않습니다. 특정 노트의 벡터를 조회하세요.",
        totalVectors: null,
        uniqueNotes: null,
      };
    } catch (error) {
      console.error("통계 조회 오류:", error);
      throw new Error(`통계 조회 실패: ${error.message}`);
    }
  }

  /**
   * 벡터 ID로 직접 조회
   * @param {string} noteId - 노트 ID
   * @param {string} vectorId - 벡터 ID
   * @returns {Promise<Object|null>} - 벡터 데이터
   */
  async getVectorById(noteId, vectorId) {
    try {
      const result = await dynamodbService.getItem(
        dynamodbService.getNotePK(noteId),
        dynamodbService.getVectorSK(vectorId)
      );

      if (!result) return null;

      const { Type, PK, SK, ...vectorData } = result;
      return vectorData;
    } catch (error) {
      console.error("벡터 조회 오류:", error);
      throw new Error(`벡터 조회 실패: ${error.message}`);
    }
  }

  /**
   * 여러 노트의 벡터를 한 번에 검색 (최적화)
   * @param {string} query - 검색 질문
   * @param {Array<string>} noteIds - 노트 ID 배열
   * @param {number} topK - 반환할 최대 결과 수
   * @returns {Promise<Array>} - 유사한 청크들
   */
  async searchMultipleNotes(query, noteIds, topK = 5) {
    return this.search(query, topK, { noteIds });
  }
}

export default new VectorServiceDynamoDB();
