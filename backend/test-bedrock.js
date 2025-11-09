import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

// 환경변수 로드
dotenv.config();

async function testBedrock() {
  console.log("=".repeat(50));
  console.log("AWS Bedrock 연결 테스트");
  console.log("=".repeat(50));
  console.log(`AWS Region: ${process.env.AWS_REGION}`);
  console.log(`Model ID: ${process.env.BEDROCK_MODEL_ID}`);
  console.log(`Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 10)}...`);
  console.log("=".repeat(50));

  try {
    // Bedrock 클라이언트 초기화
    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log("\n✅ Bedrock 클라이언트 초기화 성공");

    // 테스트 질문
    const testQuestion = "안녕하세요! 간단하게 자기소개 해주세요.";
    console.log(`\n📤 테스트 질문: "${testQuestion}"`);

    // API 요청 페이로드
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1024,
      temperature: 1,
      system: "당신은 친절한 AI 어시스턴트입니다.",
      messages: [
        {
          role: "user",
          content: testQuestion,
        },
      ],
    };

    console.log("\n⏳ Claude 모델 호출 중...");

    // API 호출
    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.log("\n✅ 응답 수신 성공!");
    console.log("\n" + "=".repeat(50));
    console.log("📥 Claude의 답변:");
    console.log("=".repeat(50));

    if (responseBody.content && responseBody.content.length > 0) {
      console.log(responseBody.content[0].text);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Bedrock 연결 테스트 완료!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("\n❌ 오류 발생:", error.message);
    console.error("\n상세 오류:", error);
    process.exit(1);
  }
}

testBedrock();
