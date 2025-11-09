import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

class BedrockService {
  constructor() {
    // AWS Bedrock 클라이언트 초기화
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Claude 모델 ID (Claude 3.5 Sonnet)
    this.modelId = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";
  }

  /**
   * Claude 모델에 질문을 보내고 답변을 받습니다
   * @param {string} question - 사용자 질문
   * @param {Object} options - 추가 옵션 (temperature, max_tokens 등)
   * @returns {Promise<string>} - Claude의 답변
   */
  async askQuestion(question, options = {}) {
    try {
      const {
        temperature = 1,
        max_tokens = 4096,
        system = "당신은 학습을 돕는 친절한 AI 튜터입니다. 학생들의 질문에 명확하고 이해하기 쉽게 답변해주세요.",
      } = options;

      // Claude API 요청 페이로드
      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens,
        temperature,
        system,
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
      };

      // Bedrock 명령 생성
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      });

      // API 호출
      const response = await this.client.send(command);

      // 응답 파싱
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // Claude의 답변 추출
      if (responseBody.content && responseBody.content.length > 0) {
        return responseBody.content[0].text;
      } else {
        throw new Error("응답에서 답변을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("Bedrock API 호출 오류:", error);
      throw new Error(`Claude API 오류: ${error.message}`);
    }
  }

  /**
   * 스트리밍 방식으로 답변을 받습니다 (향후 확장용)
   * @param {string} question - 사용자 질문
   * @param {Function} onChunk - 청크 데이터를 받을 콜백 함수
   * @param {Object} options - 추가 옵션
   */
  async askQuestionStream(question, onChunk, options = {}) {
    // 스트리밍 구현은 추후 필요시 추가
    throw new Error("스트리밍 기능은 아직 구현되지 않았습니다.");
  }
}

export default new BedrockService();
