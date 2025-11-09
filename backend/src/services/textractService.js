import {
  TextractClient,
  DetectDocumentTextCommand,
  AnalyzeDocumentCommand,
} from "@aws-sdk/client-textract";

class TextractService {
  constructor() {
    this.client = new TextractClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * 이미지에서 텍스트 추출 (간단한 방식)
   * @param {Buffer} imageBuffer - 이미지 버퍼
   * @returns {Promise<Object>} - 추출된 텍스트와 메타데이터
   */
  async extractTextFromImage(imageBuffer) {
    try {
      const command = new DetectDocumentTextCommand({
        Document: {
          Bytes: imageBuffer,
        },
      });

      const response = await this.client.send(command);

      // 텍스트 라인 추출
      const lines = response.Blocks.filter((block) => block.BlockType === "LINE")
        .map((block) => block.Text);

      // 전체 텍스트 조합
      const fullText = lines.join("\n");

      // 평균 신뢰도 계산
      const confidenceScores = response.Blocks.filter(
        (block) => block.BlockType === "LINE" && block.Confidence
      ).map((block) => block.Confidence);

      const avgConfidence =
        confidenceScores.length > 0
          ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length / 100
          : 0;

      return {
        text: fullText,
        lines,
        confidence: avgConfidence,
        blockCount: response.Blocks.length,
      };
    } catch (error) {
      console.error("Textract 오류:", error);
      throw new Error(`OCR 처리 실패: ${error.message}`);
    }
  }

  /**
   * 고급 문서 분석 (테이블, 폼 등 포함)
   * @param {Buffer} imageBuffer - 이미지 버퍼
   * @returns {Promise<Object>} - 분석된 데이터
   */
  async analyzeDocument(imageBuffer) {
    try {
      const command = new AnalyzeDocumentCommand({
        Document: {
          Bytes: imageBuffer,
        },
        FeatureTypes: ["TABLES", "FORMS"],
      });

      const response = await this.client.send(command);

      // 텍스트 추출
      const lines = response.Blocks.filter((block) => block.BlockType === "LINE")
        .map((block) => block.Text);

      // 테이블 추출
      const tables = this.extractTables(response.Blocks);

      // 키-값 쌍 추출 (폼 데이터)
      const keyValues = this.extractKeyValues(response.Blocks);

      return {
        text: lines.join("\n"),
        lines,
        tables,
        keyValues,
        confidence:
          response.Blocks.filter((b) => b.Confidence).reduce(
            (acc, b) => acc + b.Confidence,
            0
          ) /
          response.Blocks.filter((b) => b.Confidence).length /
          100,
      };
    } catch (error) {
      console.error("Textract Analyze 오류:", error);
      throw new Error(`문서 분석 실패: ${error.message}`);
    }
  }

  /**
   * S3에 있는 이미지에서 텍스트 추출
   * @param {string} bucketName - S3 버킷 이름
   * @param {string} objectKey - S3 객체 키
   * @returns {Promise<Object>} - 추출된 텍스트와 메타데이터
   */
  async extractTextFromS3(bucketName, objectKey) {
    try {
      const command = new DetectDocumentTextCommand({
        Document: {
          S3Object: {
            Bucket: bucketName,
            Name: objectKey,
          },
        },
      });

      const response = await this.client.send(command);

      const lines = response.Blocks.filter((block) => block.BlockType === "LINE")
        .map((block) => block.Text);

      const fullText = lines.join("\n");

      const confidenceScores = response.Blocks.filter(
        (block) => block.BlockType === "LINE" && block.Confidence
      ).map((block) => block.Confidence);

      const avgConfidence =
        confidenceScores.length > 0
          ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length / 100
          : 0;

      return {
        text: fullText,
        lines,
        confidence: avgConfidence,
        blockCount: response.Blocks.length,
      };
    } catch (error) {
      console.error("Textract S3 오류:", error);
      throw new Error(`S3 OCR 처리 실패: ${error.message}`);
    }
  }

  /**
   * 테이블 데이터 추출 (헬퍼 함수)
   */
  extractTables(blocks) {
    // 간단한 구현 - 필요시 확장 가능
    const tables = [];
    // TODO: 테이블 파싱 로직 구현
    return tables;
  }

  /**
   * 키-값 쌍 추출 (헬퍼 함수)
   */
  extractKeyValues(blocks) {
    // 간단한 구현 - 필요시 확장 가능
    const keyValues = {};
    // TODO: 키-값 파싱 로직 구현
    return keyValues;
  }
}

export default new TextractService();
