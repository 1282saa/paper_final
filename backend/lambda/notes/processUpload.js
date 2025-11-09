import {
  TextractClient,
  DetectDocumentTextCommand,
} from "@aws-sdk/client-textract";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import mongoose from "mongoose";

const textractClient = new TextractClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

// MongoDB 연결 (Lambda에서는 전역으로 재사용)
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = mongoose.connection;
  return cachedDb;
}

// Note 모델 정의 (간단 버전)
const NoteSchema = new mongoose.Schema(
  {
    userId: String,
    title: String,
    subject: String,
    content: String,
    imageUrl: String,
    s3Key: String,
    metadata: {
      ocrConfidence: Number,
      fileSize: Number,
      mimeType: String,
    },
    tags: [String],
    isIndexed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Note = mongoose.models.Note || mongoose.model("Note", NoteSchema);

/**
 * S3 업로드 트리거 Lambda
 * 이미지가 S3에 업로드되면 자동으로 OCR 처리
 */
export const handler = async (event) => {
  try {
    console.log("S3 이벤트 수신:", JSON.stringify(event, null, 2));

    // MongoDB 연결
    await connectToDatabase();

    for (const record of event.Records) {
      const bucket = record.s3.bucket.name;
      const s3Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

      console.log(`처리 중: ${bucket}/${s3Key}`);

      // S3에서 메타데이터 조회
      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      });

      const s3Object = await s3Client.send(getCommand);
      const metadata = s3Object.Metadata || {};

      // 이미지를 바이트로 읽기
      const imageBytes = await streamToBuffer(s3Object.Body);

      // Textract OCR 처리
      console.log("OCR 처리 시작...");
      const textractCommand = new DetectDocumentTextCommand({
        Document: {
          S3Object: {
            Bucket: bucket,
            Name: s3Key,
          },
        },
      });

      const textractResponse = await textractClient.send(textractCommand);

      // 텍스트 추출
      const lines = textractResponse.Blocks.filter(
        (block) => block.BlockType === "LINE"
      ).map((block) => block.Text);

      const fullText = lines.join("\n");

      // 신뢰도 계산
      const confidenceScores = textractResponse.Blocks.filter(
        (b) => b.BlockType === "LINE" && b.Confidence
      ).map((b) => b.Confidence);

      const avgConfidence =
        confidenceScores.length > 0
          ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length / 100
          : 0;

      console.log(`OCR 완료: ${fullText.length}자, 신뢰도: ${avgConfidence.toFixed(2)}`);

      // MongoDB에 저장
      const note = new Note({
        userId: metadata.uploadedby || "test-user",
        title: metadata.title || "제목 없음",
        subject: metadata.subject || "",
        content: fullText,
        imageUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
        s3Key: s3Key,
        metadata: {
          ocrConfidence: avgConfidence,
          fileSize: record.s3.object.size,
          mimeType: s3Object.ContentType,
        },
        tags: metadata.tags ? metadata.tags.split(",") : [],
      });

      await note.save();

      console.log(`✅ 노트 저장 완료 (ID: ${note._id})`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "OCR 처리 완료" }),
    };
  } catch (error) {
    console.error("OCR 처리 오류:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};

// Stream을 Buffer로 변환
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
