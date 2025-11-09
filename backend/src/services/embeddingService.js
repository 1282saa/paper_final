import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

class EmbeddingService {
  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Titan Embeddings 모델 ID
    this.modelId = "amazon.titan-embed-text-v2:0";
  }

  /**
   * 텍스트를 벡터 임베딩으로 변환
   * @param {string} text - 임베딩할 텍스트
   * @returns {Promise<number[]>} - 임베딩 벡터
   */
  async embedText(text) {
    try {
      if (!text || text.trim() === "") {
        throw new Error("임베딩할 텍스트가 비어있습니다.");
      }

      // 텍스트 길이 제한 (Titan Embeddings v2: 최대 8192 토큰)
      const maxLength = 8000;
      const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

      const payload = {
        inputText: truncatedText,
      };

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // Titan Embeddings v2는 1024차원 벡터 반환
      return responseBody.embedding;
    } catch (error) {
      console.error("임베딩 생성 오류:", error);
      throw new Error(`임베딩 생성 실패: ${error.message}`);
    }
  }

  /**
   * 여러 텍스트를 배치로 임베딩 (순차 처리)
   * @param {string[]} texts - 임베딩할 텍스트 배열
   * @returns {Promise<number[][]>} - 임베딩 벡터 배열
   */
  async embedBatch(texts) {
    try {
      const embeddings = [];

      for (const text of texts) {
        const embedding = await this.embedText(text);
        embeddings.push(embedding);

        // API 제한을 위한 약간의 딜레이
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return embeddings;
    } catch (error) {
      console.error("배치 임베딩 오류:", error);
      throw new Error(`배치 임베딩 실패: ${error.message}`);
    }
  }

  /**
   * 두 벡터 간의 코사인 유사도 계산
   * @param {number[]} vecA - 벡터 A
   * @param {number[]} vecB - 벡터 B
   * @returns {number} - 유사도 (0~1)
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error("벡터 길이가 일치하지 않습니다.");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }
}

export default new EmbeddingService();
