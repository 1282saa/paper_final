/**
 * @file BlankReviewPage.jsx
 * @description 백지 복습 실행 페이지 - 원본 이미지와 빈 화면을 비교하며 복습
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentById, recordReview } from "../utils/documentStorage";

// Mock 데이터 - 실제로는 라우팅 파라미터나 상태로 받아옴
const mockDocument = {
  id: 1,
  subject: "수학",
  title: "미분의 정의와 기본 공식",
  tags: ["#미분", "#극한"],
  savedDate: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
  imageUrl: "https://via.placeholder.com/800x1000/f0f0f0/666?text=Original+Handwritten+Notes",
  extractedText: `미분의 정의

함수 f(x)의 x=a에서의 미분계수는 다음과 같이 정의된다.

f'(a) = lim(h→0) [f(a+h) - f(a)] / h

체인룰 (Chain Rule)
합성함수의 미분: (f∘g)'(x) = f'(g(x)) · g'(x)

미분의 기본 공식
1. (x^n)' = nx^(n-1)
2. (sin x)' = cos x
3. (cos x)' = -sin x
4. (e^x)' = e^x
5. (ln x)' = 1/x`,
};

const BlankReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [mode, setMode] = useState("split"); // "split" | "original" | "blank"
  const [isRevealed, setIsRevealed] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (id) {
      const doc = getDocumentById(id);
      if (doc) {
        setDocument(doc);
      } else {
        navigate("/review-priority");
      }
    }
  }, [id, navigate]);

  const handleComplete = () => {
    if (document) {
      try {
        recordReview(document.id);
        setShowCompletion(true);
      } catch (error) {
        console.error("복습 기록 실패:", error);
      }
    }
  };

  const handleNextDocument = () => {
    navigate("/review-priority");
  };

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-500">문서를 불러오는 중...</div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-12 text-center shadow-xl">
          {/* 성공 애니메이션 */}
          <div className="relative mb-8 inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">복습 완료!</h2>
          <p className="text-lg text-gray-600 mb-8">
            {document.title}을(를) 성공적으로 복습했습니다
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl">
            <div>
              <div className="text-2xl font-bold text-[#00c288]">{document.reviewCount}/4</div>
              <div className="text-sm text-gray-600">복습 횟수</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {document.reviewStage === 0 ? '1일' : document.reviewStage === 1 ? '3일' : document.reviewStage === 2 ? '7일' : '14일'}
              </div>
              <div className="text-sm text-gray-600">다음 복습</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">{Math.min(85 + document.reviewCount * 5, 100)}%</div>
              <div className="text-sm text-gray-600">예상 기억률</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleNextDocument}
              className="w-full py-4 bg-[#00c288] text-white font-bold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none"
            >
              다음 문서 복습하기
            </button>
            <button
              onClick={() => navigate("/review-priority")}
              className="w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border-0 outline-none"
            >
              복습 목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 상단 헤더 */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate("/review-priority")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-0 outline-none"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                {document.subject}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
            </div>
            <div className="flex gap-2 ml-12">
              {document.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-[#00c288] text-white font-bold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none"
          >
            복습 완료
          </button>
        </div>
      </div>

      {/* 뷰 모드 선택 */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">보기 모드:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("split")}
              className={`px-4 py-2 rounded-lg font-medium transition-all border-0 outline-none ${
                mode === "split"
                  ? "bg-[#00c288] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              분할 보기
            </button>
            <button
              onClick={() => setMode("blank")}
              className={`px-4 py-2 rounded-lg font-medium transition-all border-0 outline-none ${
                mode === "blank"
                  ? "bg-[#00c288] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              백지 모드
            </button>
            <button
              onClick={() => setMode("original")}
              className={`px-4 py-2 rounded-lg font-medium transition-all border-0 outline-none ${
                mode === "original"
                  ? "bg-[#00c288] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              원본 보기
            </button>
          </div>

          {mode === "blank" && (
            <button
              onClick={() => setIsRevealed(!isRevealed)}
              className="ml-auto px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all border-0 outline-none"
            >
              {isRevealed ? "답안 숨기기" : "답안 보기"}
            </button>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {mode === "split" && (
            <div className="grid grid-cols-2 gap-8">
              {/* 원본 이미지 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  원본 노트
                </h3>
                <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={document.imageUrl}
                    alt="원본 노트"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* 백지 작성 영역 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#00c288] rounded-full"></span>
                  내가 작성한 내용
                </h3>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="기억나는 내용을 작성해보세요..."
                  className="w-full h-[calc(100%-3rem)] p-4 bg-gray-50 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#00c288] transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {mode === "blank" && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  기억나는 내용을 자유롭게 작성하세요
                </h3>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="백지에 기억나는 내용을 모두 작성해보세요..."
                  className="w-full h-[600px] p-6 bg-gray-50 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#00c288] transition-all text-gray-900 text-lg leading-relaxed placeholder-gray-400"
                />

                {isRevealed && (
                  <div className="mt-6 p-6 bg-blue-50 rounded-xl">
                    <h4 className="text-lg font-bold text-blue-900 mb-4">정답:</h4>
                    <pre className="text-blue-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {document.extractedText}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === "original" && (
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">원본 노트</h3>
                <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={document.imageUrl}
                    alt="원본 노트"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="mt-6 p-6 bg-gray-50 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">추출된 텍스트:</h4>
                  <pre className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {document.extractedText}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlankReviewPage;
