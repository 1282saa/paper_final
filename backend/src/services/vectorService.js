import embeddingService from "./embeddingService.js";
import Note from "../models/Note.js";
import { v4 as uuidv4 } from "uuid";

/**
 * 메모리 기반 벡터 검색 서비스
 * (실제 프로덕션에서는 FAISS, Pinecone, OpenSearch 등 사용 권장)
 */
class VectorService {
  constructor() {
    // 메모리에 벡터 저장: { vectorId: { embedding, noteId, chunkIndex, text } }
    this.vectors = new Map();
  }

  /**
   * 노트의 텍스트를 벡터화하여 저장
   * @param {string} noteId - 노트 ID
   * @param {string[]} chunks - 텍스트 청크 배열
   * @returns {Promise<string[]>} - 생성된 벡터 ID 배열
   */
  async indexNoteChunks(noteId, chunks) {
    try {
      const vectorIds = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // 임베딩 생성
        const embedding = await embeddingService.embedText(chunk);

        // 벡터 ID 생성
        const vectorId = uuidv4();

        // 메모리에 저장
        this.vectors.set(vectorId, {
          embedding,
          noteId,
          chunkIndex: i,
          text: chunk,
        });

        vectorIds.push(vectorId);

        // API 제한을 위한 딜레이
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

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
   * @param {Object} filters - 필터 옵션 { noteIds, userId, subject }
   * @returns {Promise<Array>} - 유사한 청크들
   */
  async search(query, topK = 5, filters = {}) {
    try {
      // 질문 벡터화
      const queryEmbedding = await embeddingService.embedText(query);

      // 모든 벡터와 유사도 계산
      const results = [];

      for (const [vectorId, vector] of this.vectors.entries()) {
        // 필터 적용
        if (filters.noteIds && !filters.noteIds.includes(vector.noteId)) {
          continue;
        }

        // 코사인 유사도 계산
        const similarity = embeddingService.cosineSimilarity(
          queryEmbedding,
          vector.embedding
        );

        results.push({
          vectorId,
          noteId: vector.noteId,
          chunkIndex: vector.chunkIndex,
          text: vector.text,
          similarity,
        });
      }

      // 유사도 순으로 정렬
      results.sort((a, b) => b.similarity - a.similarity);

      // 상위 K개 반환
      return results.slice(0, topK);
    } catch (error) {
      console.error("벡터 검색 오류:", error);
      throw new Error(`벡터 검색 실패: ${error.message}`);
    }
  }

  /**
   * 특정 노트의 벡터 삭제
   * @param {string} noteId - 노트 ID
   */
  deleteNoteVectors(noteId) {
    let deleted = 0;

    for (const [vectorId, vector] of this.vectors.entries()) {
      if (vector.noteId === noteId) {
        this.vectors.delete(vectorId);
        deleted++;
      }
    }

    console.log(`🗑️  노트 ${noteId}의 벡터 ${deleted}개 삭제됨`);
    return deleted;
  }

  /**
   * 모든 벡터 삭제
   */
  clearAll() {
    const count = this.vectors.size;
    this.vectors.clear();
    console.log(`🗑️  모든 벡터 삭제됨 (${count}개)`);
  }

  /**
   * 벡터 저장소 통계
   */
  getStats() {
    const noteIds = new Set();

    for (const vector of this.vectors.values()) {
      noteIds.add(vector.noteId);
    }

    return {
      totalVectors: this.vectors.size,
      uniqueNotes: noteIds.size,
    };
  }
}

export default new VectorService();
