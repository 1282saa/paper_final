import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * S3 Pre-signed URL 생성 Lambda
 * 프론트엔드가 이 URL로 직접 S3에 업로드
 */
export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { fileName, fileType, userId = "test-user", title, subject, tags } = body;

    if (!fileName || !title) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "fileName과 title이 필요합니다.",
        }),
      };
    }

    // 고유한 파일명 생성
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const s3Key = `notes/${userId}/${uniqueFileName}`;

    // Pre-signed URL 생성 (5분 유효)
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType || "image/jpeg",
      Metadata: {
        originalName: fileName,
        uploadedBy: userId,
        title: title,
        subject: subject || "",
        tags: tags || "",
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        data: {
          uploadUrl,
          s3Key,
          fileName: uniqueFileName,
        },
      }),
    };
  } catch (error) {
    console.error("Upload URL 생성 오류:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
