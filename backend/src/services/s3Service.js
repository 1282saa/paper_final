import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

class S3Service {
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.S3_BUCKET_NAME || "learning-notes-bucket";
  }

  /**
   * S3에 이미지 업로드
   * @param {Buffer} fileBuffer - 파일 버퍼
   * @param {string} fileName - 원본 파일명
   * @param {string} mimeType - MIME 타입
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} - S3 키와 URL
   */
  async uploadImage(fileBuffer, fileName, mimeType, userId) {
    try {
      // 고유한 파일명 생성
      const fileExtension = fileName.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const s3Key = `notes/${userId}/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          originalName: fileName,
          uploadedBy: userId,
          uploadDate: new Date().toISOString(),
        },
      });

      await this.client.send(command);

      const imageUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

      return {
        s3Key,
        imageUrl,
        bucket: this.bucketName,
      };
    } catch (error) {
      console.error("S3 업로드 오류:", error);
      throw new Error(`S3 업로드 실패: ${error.message}`);
    }
  }

  /**
   * S3에서 이미지 가져오기
   * @param {string} s3Key - S3 객체 키
   * @returns {Promise<Buffer>} - 이미지 버퍼
   */
  async getImage(s3Key) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await this.client.send(command);

      // Stream을 Buffer로 변환
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error("S3 다운로드 오류:", error);
      throw new Error(`S3 다운로드 실패: ${error.message}`);
    }
  }
}

export default new S3Service();
