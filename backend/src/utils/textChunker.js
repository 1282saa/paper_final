/**
 * 텍스트를 작은 청크로 분할하는 유틸리티
 */

/**
 * 텍스트를 문장 단위로 청킹
 * @param {string} text - 원본 텍스트
 * @param {number} maxChunkSize - 최대 청크 크기 (문자 수)
 * @param {number} overlap - 청크 간 중복 크기
 * @returns {string[]} - 청크 배열
 */
export function chunkByLength(text, maxChunkSize = 500, overlap = 50) {
  if (!text || text.trim() === "") {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxChunkSize;

    // 마지막 청크가 아니면 문장 끝에서 자르기
    if (end < text.length) {
      // 마침표, 느낌표, 물음표, 줄바꿈 등에서 자르기
      const sentenceEnd = text.substring(start, end).lastIndexOf(".");
      const exclamEnd = text.substring(start, end).lastIndexOf("!");
      const questionEnd = text.substring(start, end).lastIndexOf("?");
      const newlineEnd = text.substring(start, end).lastIndexOf("\n");

      const breakPoint = Math.max(sentenceEnd, exclamEnd, questionEnd, newlineEnd);

      if (breakPoint > 0) {
        end = start + breakPoint + 1;
      }
    }

    const chunk = text.substring(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = end - overlap;
  }

  return chunks;
}

/**
 * 텍스트를 문장 단위로 청킹 (더 정교함)
 * @param {string} text - 원본 텍스트
 * @param {number} sentencesPerChunk - 청크당 문장 수
 * @returns {string[]} - 청크 배열
 */
export function chunkBySentences(text, sentencesPerChunk = 3) {
  if (!text || text.trim() === "") {
    return [];
  }

  // 문장 분리 (간단한 정규식, 필요시 개선 가능)
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const chunks = [];

  for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
    const chunk = sentences.slice(i, i + sentencesPerChunk).join(" ");
    chunks.push(chunk);
  }

  return chunks;
}

/**
 * 텍스트를 문단 단위로 청킹
 * @param {string} text - 원본 텍스트
 * @returns {string[]} - 청크 배열
 */
export function chunkByParagraphs(text) {
  if (!text || text.trim() === "") {
    return [];
  }

  // 두 개 이상의 연속된 줄바꿈을 문단 구분자로 사용
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphs;
}

/**
 * 자동으로 가장 적절한 청킹 방식 선택
 * @param {string} text - 원본 텍스트
 * @param {number} maxChunkSize - 최대 청크 크기
 * @returns {string[]} - 청크 배열
 */
export function autoChunk(text, maxChunkSize = 500) {
  if (!text || text.trim() === "") {
    return [];
  }

  // 문단이 명확하게 구분되어 있는 경우
  const paragraphs = chunkByParagraphs(text);
  if (paragraphs.length > 1 && paragraphs.every((p) => p.length <= maxChunkSize)) {
    return paragraphs;
  }

  // 문장 단위 청킹
  const sentenceChunks = chunkBySentences(text, 3);
  if (sentenceChunks.every((c) => c.length <= maxChunkSize)) {
    return sentenceChunks;
  }

  // 길이 기반 청킹 (폴백)
  return chunkByLength(text, maxChunkSize);
}

export default {
  chunkByLength,
  chunkBySentences,
  chunkByParagraphs,
  autoChunk,
};
