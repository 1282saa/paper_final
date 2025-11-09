/**
 * @file ragAPI.js
 * @description RAG (Retrieval-Augmented Generation) API 호출
 */

const API_BASE_URL = import.meta.env.VITE_OCR_API_URL || "https://3asa7jtr4j.execute-api.ap-northeast-2.amazonaws.com/dev";

/**
 * AI 튜터에게 질문하기 (RAG 기반)
 */
export const askRAGQuestion = async ({ question, context, conversationHistory = [] }) => {
  try {
    // 개발 모드에서는 Mock 응답 사용
    if (import.meta.env.MODE === "development") {
      // 간단한 AI 응답 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 키워드 기반 간단한 응답
      const responses = {
        "핵심": `주요 핵심 개념은 다음과 같습니다:\n\n${context.substring(0, 200)}...\n\n위 내용에서 가장 중요한 개념을 정리하면 이해하기 쉬울 거예요!`,
        "예시": `좋은 질문이에요! 예시를 통해 설명드리겠습니다.\n\n실생활 예시:\n- 이 개념은 실제로 이렇게 적용됩니다...\n- 예를 들어...\n\n이해가 되셨나요?`,
        "암기": `효과적인 암기 팁을 알려드릴게요!\n\n1. 핵심 키워드를 먼저 외우세요\n2. 그림이나 도표로 시각화하세요\n3. 자주 떠올리며 복습하세요\n\n특히 에빙하우스 망각곡선에 따라 복습하면 효과적입니다!`,
        "적용": `실생활 적용 사례를 말씀드리겠습니다.\n\n이 개념은 다음과 같은 상황에서 활용됩니다:\n- 일상생활에서...\n- 직업에서...\n- 문제 해결에서...\n\n더 궁금한 점이 있으신가요?`,
        default: `좋은 질문이네요!\n\n${question}에 대해 답변드리겠습니다.\n\n${context.substring(0, 150)}...\n\n이 부분을 중심으로 설명하면, 핵심은 이해하셨나요? 더 궁금한 점이 있으면 물어보세요!`,
      };

      // 질문에서 키워드 찾기
      let response = responses.default;
      for (const [keyword, answer] of Object.entries(responses)) {
        if (question.includes(keyword)) {
          response = answer;
          break;
        }
      }

      return {
        success: true,
        answer: response,
      };
    }

    // 프로덕션: 실제 RAG API 호출
    const response = await fetch(`${API_BASE_URL}/rag/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        context,
        conversationHistory: conversationHistory.slice(-4), // 최근 4개만
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      answer: data.answer || data.response || "답변을 생성하는 중 문제가 발생했습니다.",
    };

  } catch (error) {
    console.error("RAG API 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
