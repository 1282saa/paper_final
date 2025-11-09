/**
 * @file Step6AIChat.jsx
 * @description AI 튜터와 대화하며 학습 내용 복습
 */

import React, { useState, useRef, useEffect } from "react";
import { askRAGQuestion } from "../../utils/ragAPI";

const Step6AIChat = ({ extractedText, documentTitle, onNext, onBack }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `안녕하세요! 저는 AI 튜터 복습이에요 😊\n\n방금 학습하신 **"${documentTitle}"** 내용에 대해 무엇이든 물어보세요!\n\n예시 질문:\n- 핵심 개념이 무엇인가요?\n- 이 내용을 쉽게 설명해주세요\n- 예시 문제를 내주세요\n- 암기 팁을 알려주세요`,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setQuestionCount(questionCount + 1);

    // 사용자 메시지 추가
    const newMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // RAG API 호출 (실제 구현)
      const response = await askRAGQuestion({
        question: userMessage,
        context: extractedText,
        conversationHistory: messages.slice(-4), // 최근 4개 메시지만 컨텍스트로
      });

      if (response.success) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: response.answer },
        ]);
      } else {
        // 실패 시 간단한 응답
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "죄송합니다. 잠시 문제가 발생했어요. 다시 질문해주시겠어요?",
          },
        ]);
      }
    } catch (error) {
      console.error("AI 응답 오류:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "오류가 발생했습니다. 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "핵심 개념을 정리해주세요",
    "예시 문제를 내주세요",
    "암기 팁을 알려주세요",
    "실생활 적용 사례는?",
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              AI 튜터와 대화하며 복습해요
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              궁금한 점을 질문하며 능동적으로 복습하세요.
              <span className="font-bold text-purple-600"> 최소 3번 이상</span> 대화하면
              더욱 효과적입니다!
            </p>
          </div>
        </div>
      </div>

      {/* 진행 상황 */}
      <div className="flex items-center gap-3 px-4">
        <div className="text-sm font-medium text-gray-700">대화 횟수:</div>
        <div className="flex gap-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                questionCount >= num
                  ? "bg-purple-500 text-white scale-110"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {num}
            </div>
          ))}
        </div>
        {questionCount >= 3 && (
          <div className="ml-auto text-sm font-bold text-purple-600 animate-bounce">
            🎉 충분히 복습했어요!
          </div>
        )}
      </div>

      {/* 채팅 영역 */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-inner">
        {/* 메시지 리스트 */}
        <div className="h-[400px] overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 질문 버튼 */}
        {questionCount === 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">💡 빠른 질문:</div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-1.5 bg-white text-gray-700 text-xs rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-purple-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="궁금한 점을 질문해보세요..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              전송
            </button>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          ← 이전
        </button>
        <button
          onClick={onNext}
          disabled={questionCount < 1}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {questionCount >= 3 ? "복습 완료! 저장하기 →" : "다음 단계로 →"}
        </button>
      </div>

      {questionCount < 3 && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-xs text-yellow-700">
            💡 <strong>권장:</strong> 최소 3번 이상 대화하면 학습 효과가 높아집니다.
            지금까지 {questionCount}번 대화했어요.
          </p>
        </div>
      )}
    </div>
  );
};

export default Step6AIChat;
