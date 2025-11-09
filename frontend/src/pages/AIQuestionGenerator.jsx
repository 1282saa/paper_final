/**
 * @file AIQuestionGenerator.jsx
 * @description AI 문제 생성 페이지 - 저장된 노트 기반 문제 생성 및 풀이
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDocuments } from "../utils/documentStorage";
import { generateQuestions } from "../utils/ocrAPI";

// Mock 데이터
const mockDocuments = [
  {
    id: 1,
    subject: "수학",
    title: "미분의 정의와 기본 공식",
    tags: ["#미분", "#극한"],
  },
  {
    id: 2,
    subject: "물리",
    title: "뉴턴의 운동 법칙",
    tags: ["#역학", "#힘"],
  },
  {
    id: 3,
    subject: "화학",
    title: "산화환원반응 정리",
    tags: ["#산화", "#환원"],
  },
];

const mockGeneratedQuestions = [
  {
    id: 1,
    question: "함수 f(x) = x³ + 2x² - 5x + 1의 도함수 f'(x)를 구하시오.",
    type: "short-answer",
    difficulty: "중",
    answer: "f'(x) = 3x² + 4x - 5",
    explanation: "멱함수의 미분 공식 (x^n)' = nx^(n-1)을 각 항에 적용합니다.",
  },
  {
    id: 2,
    question: "다음 중 미분의 기본 성질로 옳은 것은?",
    type: "multiple-choice",
    difficulty: "하",
    options: [
      "(f + g)' = f' + g'",
      "(fg)' = f'g'",
      "(f/g)' = f'/g'",
      "(f∘g)' = f'∘g'",
    ],
    answer: "(f + g)' = f' + g'",
    explanation: "미분의 선형성에 따라 합의 미분은 미분의 합과 같습니다.",
  },
  {
    id: 3,
    question: "체인룰(연쇄법칙)을 설명하고, 예시를 들어 적용하시오.",
    type: "essay",
    difficulty: "상",
    answer: "합성함수 (f∘g)(x)의 미분은 (f∘g)'(x) = f'(g(x)) · g'(x)입니다. 예: h(x) = (x²+1)³일 때, h'(x) = 3(x²+1)² · 2x = 6x(x²+1)²",
    explanation: "체인룰은 바깥 함수의 미분과 안쪽 함수의 미분을 곱하는 규칙입니다.",
  },
];

const AIQuestionGenerator = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const docs = getAllDocuments();
    setDocuments(docs);
  }, []);

  const handleGenerateQuestions = async (doc) => {
    setSelectedDoc(doc);
    setIsGenerating(true);

    try {
      // 실제 AI 문제 생성 API 호출 (개발 모드에서는 Mock 데이터 사용)
      const result = await generateQuestions(
        doc.extractedText || "문서 내용 없음",
        doc.subject || "일반",
        "medium",  // 난이도
        3  // 문제 개수
      );

      if (result.success) {
        setQuestions(result.questions);
      } else {
        console.error("문제 생성 실패:", result.error);
        alert("문제 생성에 실패했습니다. 다시 시도해주세요.");
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error("문제 생성 오류:", error);
      alert("문제 생성 중 오류가 발생했습니다.");
      setSelectedDoc(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer,
    });
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  // 문서 선택 화면
  if (!selectedDoc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">AI 문제 생성</h1>
            <p className="text-gray-600">저장된 노트를 선택하면 AI가 맞춤 문제를 생성합니다</p>
          </div>

          {documents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="text-gray-400 text-lg mb-4">저장된 문서가 없습니다</div>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-[#00c288] text-white font-semibold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none"
              >
                문서 업로드하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleGenerateQuestions(doc)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    {doc.subject}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{doc.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full py-3 bg-[#00c288] text-white font-semibold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none">
                  문제 생성하기
                </button>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI 생성 중 화면
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-[#00c288] to-[#00a572] rounded-full flex items-center justify-center animate-pulse mx-auto mb-6">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">AI가 문제를 생성하고 있습니다</h2>
          <p className="text-gray-600">{selectedDoc.title} 내용을 분석 중...</p>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
            <div className="text-center mb-8">
              <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
                score >= 80 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                score >= 60 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                'bg-gradient-to-br from-orange-400 to-orange-600'
              }`}>
                <span className="text-5xl font-bold text-white">{score}점</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {score >= 80 ? '훌륭해요!' : score >= 60 ? '잘했어요!' : '다시 도전!'}
              </h2>
              <p className="text-gray-600">
                {questions.length}문제 중 {Object.keys(userAnswers).filter(id => userAnswers[id] === questions.find(q => q.id === parseInt(id))?.answer).length}개 정답
              </p>
            </div>

            <div className="space-y-6">
              {questions.map((q, index) => {
                const isCorrect = userAnswers[q.id] === q.answer;
                return (
                  <div key={q.id} className={`p-6 rounded-xl ${isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        문제 {index + 1}
                      </span>
                      <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700">
                        난이도: {q.difficulty}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-4">{q.question}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">내 답:</span>
                        <span className={`font-medium ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                          {userAnswers[q.id] || '(답변 없음)'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-600">정답:</span>
                          <span className="font-medium text-emerald-700">{q.answer}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white rounded-lg">
                      <p className="text-sm text-gray-600">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setQuestions([]);
                  setUserAnswers({});
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                }}
                className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border-0 outline-none"
              >
                다른 문서 선택
              </button>
              <button
                onClick={() => navigate('/review-priority')}
                className="flex-1 py-4 bg-[#00c288] text-white font-semibold rounded-lg hover:bg-[#00b077] transition-colors border-0 outline-none"
              >
                복습하러 가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 문제 풀이 화면
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedDoc.title}</h1>
              <p className="text-sm text-gray-600">
                문제 {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold">
              난이도: {currentQuestion.difficulty}
            </span>
          </div>

          {/* 진행률 바 */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00c288] transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 문제 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h2>

          {currentQuestion.type === "multiple-choice" && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(currentQuestion.id, option)}
                  className={`w-full p-4 rounded-lg text-left font-medium transition-all border-2 outline-none ${
                    userAnswers[currentQuestion.id] === option
                      ? 'bg-[#00c288] text-white border-[#00c288]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#00c288]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "short-answer" && (
            <input
              type="text"
              value={userAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="답을 입력하세요"
              className="w-full px-5 py-4 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c288] transition-all text-gray-900 placeholder-gray-400"
            />
          )}

          {currentQuestion.type === "essay" && (
            <textarea
              value={userAnswers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="자세히 설명해주세요"
              className="w-full h-48 px-5 py-4 bg-gray-50 border-0 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#00c288] transition-all text-gray-900 placeholder-gray-400"
            />
          )}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전 문제
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="flex-1 py-4 bg-[#00c288] text-white font-semibold rounded-lg hover:bg-[#00b077] transition-colors border-0 outline-none"
            >
              다음 문제
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 py-4 bg-gradient-to-r from-[#00c288] to-[#00a572] text-white font-bold rounded-lg hover:shadow-lg transition-all border-0 outline-none"
            >
              제출하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGenerator;
