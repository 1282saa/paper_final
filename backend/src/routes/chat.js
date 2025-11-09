import express from "express";
import bedrockService from "../services/bedrockService.js";

const router = express.Router();

/**
 * POST /api/chat/ask
 * 질문을 받아서 Claude의 답변을 반환합니다
 */
router.post("/ask", async (req, res) => {
  try {
    const { question, options } = req.body;

    // 입력 검증
    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "질문을 입력해주세요.",
      });
    }

    // 질문 길이 검증 (너무 긴 질문 방지)
    if (question.length > 10000) {
      return res.status(400).json({
        success: false,
        error: "질문이 너무 깁니다. 10,000자 이내로 입력해주세요.",
      });
    }

    // Claude에게 질문하기
    const answer = await bedrockService.askQuestion(question, options);

    // 성공 응답
    res.json({
      success: true,
      data: {
        question,
        answer,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Chat API 오류:", error);
    res.status(500).json({
      success: false,
      error: error.message || "답변 생성 중 오류가 발생했습니다.",
    });
  }
});

/**
 * POST /api/chat/tutor
 * AI 튜터 전용 엔드포인트 (특화된 시스템 프롬프트 사용)
 */
router.post("/tutor", async (req, res) => {
  try {
    const { question, subject, difficulty } = req.body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "질문을 입력해주세요.",
      });
    }

    // AI 튜터용 시스템 프롬프트
    const tutorSystemPrompt = `당신은 학습을 돕는 전문 AI 튜터입니다.

역할:
- 학생의 질문에 명확하고 이해하기 쉽게 답변합니다
- 단순히 답을 알려주기보다는, 학생이 스스로 이해할 수 있도록 설명합니다
- 필요시 예시나 비유를 들어 설명합니다
- 학생의 수준에 맞춰 적절한 난이도로 설명합니다

답변 형식:
1. 핵심 개념 설명
2. 구체적인 예시 제공
3. 추가 학습 팁 (필요시)

${subject ? `과목: ${subject}` : ""}
${difficulty ? `난이도: ${difficulty}` : ""}`;

    const answer = await bedrockService.askQuestion(question, {
      system: tutorSystemPrompt,
      temperature: 0.7,
    });

    res.json({
      success: true,
      data: {
        question,
        answer,
        subject,
        difficulty,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Tutor API 오류:", error);
    res.status(500).json({
      success: false,
      error: error.message || "답변 생성 중 오류가 발생했습니다.",
    });
  }
});

/**
 * POST /api/chat/generate-questions
 * 학습 내용을 바탕으로 문제를 생성합니다
 */
router.post("/generate-questions", async (req, res) => {
  try {
    const { topic, count = 5, questionType = "객관식" } = req.body;

    if (!topic || typeof topic !== "string" || topic.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "학습 주제를 입력해주세요.",
      });
    }

    const questionPrompt = `다음 주제에 대한 ${questionType} 문제를 ${count}개 생성해주세요.

주제: ${topic}

요구사항:
- 문제는 학습한 내용을 제대로 이해했는지 확인할 수 있어야 합니다
- 난이도는 중급 수준으로 맞춰주세요
${questionType === "객관식" ? "- 각 문제는 4개의 선택지를 포함해야 합니다\n- 정답과 해설을 함께 제공해주세요" : ""}
${questionType === "주관식" ? "- 예시 답안과 채점 기준을 함께 제공해주세요" : ""}

JSON 형식으로 응답해주세요.`;

    const answer = await bedrockService.askQuestion(questionPrompt, {
      system: "당신은 교육 전문가이자 문제 출제 전문가입니다. 학습 효과가 높은 양질의 문제를 생성해주세요.",
      temperature: 0.8,
    });

    res.json({
      success: true,
      data: {
        topic,
        questionType,
        count,
        questions: answer,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Question Generation API 오류:", error);
    res.status(500).json({
      success: false,
      error: error.message || "문제 생성 중 오류가 발생했습니다.",
    });
  }
});

export default router;
