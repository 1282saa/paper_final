/**
 * @file Home.jsx
 * @description 홈 페이지 - 메인 대시보드
 *
 * @layout
 * ┌─────────────────────────────────────────┐
 * │  [필기 업로드]    [복습하기]           │  ← 상단 카드 영역
 * ├─────────────────────────────────────────┤
 * │  [캘린더]    │  [선택된 날짜 문서]    │  ← 하단 영역
 * └─────────────────────────────────────────┘
 */

import React from "react";
import { ImageUploadCard } from "../components/ImageUploadCard";
import { ReviewStartCard } from "../components/ReviewStartCard";
import { UploadModal } from "../components/UploadModal/UploadModal";

export const Home = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date(2025, 10, 1)); // 2025년 11월
  const [selectedDate, setSelectedDate] = React.useState(new Date(2025, 10, 9)); // 2025년 11월 9일
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);

  // Mock 데이터: 날짜별 문서 + 복습 성취도 (다양한 복습율 시각화)
  const mockDocuments = {
    // 11월 - 복습율 100% (가장 진한 초록)
    "2025-11-1": [
      { id: 101, title: "영어 단어장", subject: "영어", pages: 8, color: "purple", reviewed: true },
      { id: 102, title: "수학 연습", subject: "수학", pages: 6, color: "blue", reviewed: true },
    ],
    "2025-11-2": [
      { id: 103, title: "물리 공식", subject: "물리", pages: 5, color: "green", reviewed: true },
    ],

    // 복습율 90% 이상 (진한 초록)
    "2025-11-3": [
      { id: 10, title: "영어 단어장", subject: "영어", pages: 4, color: "purple", reviewed: true },
      { id: 104, title: "화학 반응", subject: "화학", pages: 7, color: "orange", reviewed: true },
      { id: 105, title: "역사 정리", subject: "역사", pages: 5, color: "pink", reviewed: true },
      { id: 106, title: "생물 세포", subject: "생물", pages: 4, color: "green", reviewed: false },
    ],

    // 복습율 60-89% (중간 초록)
    "2025-11-4": [
      { id: 11, title: "수학 미분", subject: "수학", pages: 8, color: "blue", reviewed: true },
      { id: 12, title: "화학 원소", subject: "화학", pages: 6, color: "orange", reviewed: true },
      { id: 107, title: "영어 문법", subject: "영어", pages: 4, color: "purple", reviewed: false },
    ],
    "2025-11-5": [
      { id: 5, title: "물리학 운동방정식", subject: "물리", pages: 10, color: "green", reviewed: true },
      { id: 6, title: "영어 독해 연습", subject: "영어", pages: 6, color: "purple", reviewed: true },
    ],

    // 복습율 30-59% (연한 초록)
    "2025-11-6": [
      { id: 13, title: "한국사 근현대", subject: "역사", pages: 11, color: "pink", reviewed: false },
      { id: 14, title: "물리 전자기", subject: "물리", pages: 9, color: "green", reviewed: false },
      { id: 15, title: "영어 문법", subject: "영어", pages: 5, color: "purple", reviewed: true },
    ],
    "2025-11-11": [
      { id: 108, title: "수학 확률", subject: "수학", pages: 7, color: "blue", reviewed: true },
      { id: 109, title: "화학 실험", subject: "화학", pages: 8, color: "orange", reviewed: false },
      { id: 110, title: "물리 역학", subject: "물리", pages: 6, color: "green", reviewed: false },
    ],

    // 복습율 1-29% (아주 연한 초록)
    "2025-11-7": [
      { id: 7, title: "수학 확률통계", subject: "수학", pages: 9, color: "blue", reviewed: true },
      { id: 8, title: "화학 반응식", subject: "화학", pages: 5, color: "orange", reviewed: false },
      { id: 111, title: "영어 독해", subject: "영어", pages: 4, color: "purple", reviewed: false },
      { id: 112, title: "역사 근대", subject: "역사", pages: 6, color: "pink", reviewed: false },
    ],
    "2025-11-12": [
      { id: 113, title: "생물 유전", subject: "생물", pages: 9, color: "green", reviewed: false },
      { id: 114, title: "화학 구조", subject: "화학", pages: 7, color: "orange", reviewed: false },
      { id: 115, title: "물리 전기", subject: "물리", pages: 8, color: "green", reviewed: false },
      { id: 116, title: "영어 작문", subject: "영어", pages: 5, color: "purple", reviewed: true },
    ],

    // 복습율 0% (흰색 배경)
    "2025-11-8": [
      { id: 9, title: "생물 세포구조", subject: "생물", pages: 7, color: "green", reviewed: false },
    ],
    "2025-11-13": [
      { id: 117, title: "수학 기하", subject: "수학", pages: 6, color: "blue", reviewed: false },
      { id: 118, title: "영어 듣기", subject: "영어", pages: 4, color: "purple", reviewed: false },
    ],

    // 최근 날짜들 - 다양한 복습율
    "2025-11-9": [
      { id: 1, title: "미적분학 정리노트", subject: "수학", pages: 12, color: "blue", reviewed: true },
      { id: 2, title: "영문법 핵심요약", subject: "영어", pages: 8, color: "purple", reviewed: true },
      { id: 3, title: "화학 실험 보고서", subject: "화학", pages: 5, color: "orange", reviewed: false },
    ],
    "2025-11-10": [
      { id: 4, title: "한국사 연표 정리", subject: "역사", pages: 15, color: "pink", reviewed: true },
    ],

    // 추가 날짜들
    "2025-11-14": [
      { id: 119, title: "물리 광학", subject: "물리", pages: 10, color: "green", reviewed: true },
      { id: 120, title: "화학 평형", subject: "화학", pages: 8, color: "orange", reviewed: true },
      { id: 121, title: "수학 벡터", subject: "수학", pages: 7, color: "blue", reviewed: true },
      { id: 122, title: "영어 회화", subject: "영어", pages: 5, color: "purple", reviewed: false },
    ],
    "2025-11-15": [
      { id: 123, title: "생물 진화", subject: "생물", pages: 9, color: "green", reviewed: true },
      { id: 124, title: "역사 현대", subject: "역사", pages: 11, color: "pink", reviewed: true },
    ],
    "2025-11-16": [
      { id: 125, title: "수학 행렬", subject: "수학", pages: 8, color: "blue", reviewed: false },
      { id: 126, title: "영어 문학", subject: "영어", pages: 6, color: "purple", reviewed: true },
    ],
    "2025-11-17": [
      { id: 127, title: "화학 유기", subject: "화학", pages: 12, color: "orange", reviewed: true },
      { id: 128, title: "물리 파동", subject: "물리", pages: 9, color: "green", reviewed: true },
      { id: 129, title: "생물 생태", subject: "생물", pages: 7, color: "green", reviewed: true },
    ],
    "2025-11-18": [
      { id: 130, title: "수학 적분", subject: "수학", pages: 10, color: "blue", reviewed: true },
      { id: 131, title: "영어 독해", subject: "영어", pages: 7, color: "purple", reviewed: true },
    ],
    "2025-11-19": [
      { id: 132, title: "화학 산화", subject: "화학", pages: 8, color: "orange", reviewed: false },
      { id: 133, title: "물리 열역학", subject: "물리", pages: 9, color: "green", reviewed: true },
      { id: 134, title: "생물 광합성", subject: "생물", pages: 6, color: "green", reviewed: false },
    ],
    "2025-11-20": [
      { id: 135, title: "역사 고대", subject: "역사", pages: 12, color: "pink", reviewed: true },
      { id: 136, title: "수학 통계", subject: "수학", pages: 8, color: "blue", reviewed: true },
      { id: 137, title: "영어 작문", subject: "영어", pages: 5, color: "purple", reviewed: true },
    ],
    "2025-11-21": [
      { id: 138, title: "물리 전자", subject: "물리", pages: 11, color: "green", reviewed: false },
      { id: 139, title: "화학 분석", subject: "화학", pages: 9, color: "orange", reviewed: false },
    ],
    "2025-11-22": [
      { id: 140, title: "생물 유전자", subject: "생물", pages: 10, color: "green", reviewed: true },
    ],
    "2025-11-23": [
      { id: 141, title: "수학 함수", subject: "수학", pages: 7, color: "blue", reviewed: true },
      { id: 142, title: "영어 회화", subject: "영어", pages: 6, color: "purple", reviewed: true },
      { id: 143, title: "화학 실험", subject: "화학", pages: 8, color: "orange", reviewed: true },
      { id: 144, title: "물리 운동", subject: "물리", pages: 5, color: "green", reviewed: false },
    ],
    "2025-11-24": [
      { id: 145, title: "역사 중세", subject: "역사", pages: 13, color: "pink", reviewed: false },
      { id: 146, title: "생물 진화론", subject: "생물", pages: 9, color: "green", reviewed: false },
    ],
    "2025-11-25": [
      { id: 147, title: "수학 기하학", subject: "수학", pages: 11, color: "blue", reviewed: true },
      { id: 148, title: "영어 문법", subject: "영어", pages: 7, color: "purple", reviewed: true },
      { id: 149, title: "물리 광학", subject: "물리", pages: 8, color: "green", reviewed: true },
    ],
  };

  // 업로드한 문서 개수를 반환 (학습 이행도 시각화용)
  const getDocumentCount = (date) => {
    if (!date) return 0;
    const docs = getDocumentsForDate(date);
    return docs.length;
  };

  // 문서 개수에 따른 배경 그라데이션 (성취감 시각화)
  const getDocumentCountGradient = (count) => {
    if (count === 0) return 'bg-gray-50'; // 문서 없음
    if (count === 1) return 'bg-gradient-to-br from-emerald-50 to-emerald-100'; // 연한 초록
    if (count === 2) return 'bg-gradient-to-br from-emerald-100 to-emerald-200'; // 중간 초록
    if (count === 3) return 'bg-gradient-to-br from-emerald-200 to-emerald-300'; // 진한 초록
    return 'bg-gradient-to-br from-emerald-300 to-emerald-400'; // 가장 진한 초록 (4개 이상)
  };

  // 문서 개수를 퍼센테이지로 변환 (최대 4개 = 100%)
  const getDocumentPercentage = (count) => {
    if (count === 0) return 0;
    return Math.min((count / 4) * 100, 100);
  };

  // 문서 개수에 따른 원형 링 색상
  const getProgressColor = (count) => {
    if (count === 0) return '#e5e7eb'; // 회색
    if (count === 1) return '#3b82f6'; // 파란색 (blue-500)
    if (count === 2) return '#06b6d4'; // 하늘색 (cyan-500)
    if (count === 3) return '#10b981'; // 초록색 (emerald-500)
    return '#eab308'; // 금색 (yellow-500) - 4개 이상
  };

  // 복습 성취도 계산 함수 (0-100%) - 문서 리스트에서만 사용
  const getReviewAchievement = (date) => {
    if (!date) return 0;
    const docs = getDocumentsForDate(date);
    if (docs.length === 0) return 0;
    const reviewedCount = docs.filter(doc => doc.reviewed).length;
    return Math.round((reviewedCount / docs.length) * 100);
  };

  // 성취도에 따른 링 색상
  const getAchievementRingColor = (achievement) => {
    if (achievement === 0) return 'border-gray-200';
    if (achievement < 30) return 'border-emerald-200';
    if (achievement < 60) return 'border-emerald-300';
    if (achievement < 90) return 'border-emerald-400';
    return 'border-emerald-500';
  };

  // 과목별 색상
  const subjectColors = {
    blue: { bg: "bg-blue-500", light: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-400" },
    purple: { bg: "bg-purple-500", light: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-400" },
    orange: { bg: "bg-orange-500", light: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", dot: "bg-orange-400" },
    pink: { bg: "bg-pink-500", light: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", dot: "bg-pink-400" },
    green: { bg: "bg-green-500", light: "bg-green-50", border: "border-green-200", text: "text-green-700", dot: "bg-green-400" },
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const getDocumentsForDate = (date) => {
    if (!date) return [];
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    return mockDocuments[dateKey] || [];
  };

  const selectedDocuments = getDocumentsForDate(selectedDate);

  return (
    <div className="flex-1 py-8 pl-4 lg:pl-6 xl:pl-8 pr-0 bg-gray-50">
      <div className="w-full max-w-[1224px]">

        {/* 상단 카드 */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div onClick={() => setIsUploadModalOpen(true)} className="cursor-pointer">
            <ImageUploadCard />
          </div>
          <ReviewStartCard />
        </div>

        {/* 업로드 모달 */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />

        {/* 하단: 캘린더 + 문서 리스트 */}
        <div className="w-full flex flex-col lg:flex-row gap-6">

          {/* 좌측: 캘린더 */}
          <div className="flex-1 bg-white rounded-[40px] shadow-lg border border-gray-100 p-8">

            {/* 헤더 */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-0.5 tracking-tight">
                  {currentDate.getMonth() + 1}월
                </h2>
                <p className="text-xs text-gray-400 font-medium">
                  {currentDate.getFullYear()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={goToPreviousMonth}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 hover:border-[#00c288] hover:bg-gradient-to-br hover:from-[#00c28808] hover:to-[#00c28815] transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-[#00c288] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNextMonth}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 hover:border-[#00c288] hover:bg-gradient-to-br hover:from-[#00c28808] hover:to-[#00c28815] transition-all duration-200 group"
                >
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-[#00c288] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {weekDays.map((day, idx) => (
                <div key={day} className={`text-center text-[11px] font-semibold py-2 ${
                  idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const docCount = getDocumentCount(date);
                const hasDocuments = docCount > 0;
                const documentGradient = getDocumentCountGradient(docCount);

                return (
                  <div
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    style={
                      date && isSelected(date)
                        ? { background: 'linear-gradient(135deg, #00c288 0%, #00b880 50%, #00a572 100%)' }
                        : {}
                    }
                    className={`
                      relative h-12 rounded-2xl flex flex-col items-center justify-center
                      transition-all duration-300 ease-out overflow-hidden
                      ${!date ? 'invisible' : 'cursor-pointer group'}
                      ${date && !isSelected(date) ? documentGradient : ''}
                      ${date && !isSelected(date) && !hasDocuments ? 'hover:bg-gray-100 hover:shadow-md' : ''}
                      ${date && !isSelected(date) && hasDocuments ? 'hover:shadow-2xl hover:scale-[1.08] border-2 border-emerald-300' : ''}
                      ${date && isSelected(date) ? 'shadow-2xl scale-[1.12] ring-4 ring-[#00c28840]' : ''}
                    `}
                  >
                    {date && (
                      <>
                        {/* 배경 패턴 (문서 있을 때) */}
                        {hasDocuments && !isSelected(date) && (
                          <div className="absolute inset-0 opacity-5">
                            <div className="absolute top-0 right-0 w-8 h-8 bg-[#00c288] rounded-full blur-xl"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 bg-emerald-400 rounded-full blur-lg"></div>
                          </div>
                        )}

                        {/* 날짜 숫자 - 원형 링과 같은 색상 */}
                        <span className={`relative z-10 text-base font-semibold transition-all duration-200 ${
                          isSelected(date)
                            ? 'text-white scale-110 drop-shadow-lg'
                            : isToday(date)
                              ? 'text-[#00c288] font-bold'
                              : docCount === 4 || docCount > 4
                                ? 'text-yellow-600 font-bold'
                                : docCount === 3
                                  ? 'text-emerald-600 font-bold'
                                  : docCount === 2
                                    ? 'text-cyan-600 font-semibold'
                                    : docCount === 1
                                      ? 'text-blue-600'
                                      : 'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </span>

                        {/* 오늘 표시 - 펄스 링 */}
                        {isToday(date) && !isSelected(date) && (
                          <>
                            <div className="absolute inset-0 rounded-2xl border-3 border-[#00c288] opacity-60 animate-pulse"></div>
                            <div className="absolute inset-0 rounded-2xl bg-[#00c28815]"></div>
                          </>
                        )}

                        {/* 호버 시 글로우 효과 */}
                        {!isSelected(date) && hasDocuments && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00c28808] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        )}

                        {/* 옵션 1: 우측 하단 원형 프로그레스 */}
                        {/* {hasDocuments && !isSelected(date) && (
                          <div className="absolute bottom-1 right-1 w-4 h-4">
                            <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 36 36">
                              <circle
                                cx="18"
                                cy="18"
                                r="15"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="3"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="15"
                                fill="none"
                                stroke="#00c288"
                                strokeWidth="3"
                                strokeDasharray={`${getDocumentPercentage(docCount) * 0.942} 100`}
                                strokeLinecap="round"
                                className="transition-all duration-500"
                              />
                            </svg>
                          </div>
                        )} */}

                        {/* 옵션 2: 날짜 숫자 주변 원형 링 (다양한 색상) */}
                        {hasDocuments && !isSelected(date) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="absolute w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                              {/* 배경 원 */}
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="2.5"
                              />
                              {/* 진행 원 - 문서 개수에 따라 색상 변화 */}
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke={getProgressColor(docCount)}
                                strokeWidth="2.5"
                                strokeDasharray={`${getDocumentPercentage(docCount) * 1.005} 100`}
                                strokeLinecap="round"
                                className="transition-all duration-500"
                                style={{
                                  filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.1))'
                                }}
                              />
                            </svg>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 학습 이행도 범례 */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-medium">일별 학습량</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">적음</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300"></div>
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-200 to-emerald-300 border border-emerald-400"></div>
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-300 to-emerald-400 border border-emerald-500"></div>
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-400 to-emerald-500 border border-emerald-600"></div>
                  </div>
                  <span className="text-[10px] text-gray-400">많음</span>
                </div>
              </div>
            </div>
          </div>

          {/* 애니메이션 스타일 */}
          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            @keyframes bounce-slow {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-4px);
              }
            }
            .animate-bounce-slow {
              animation: bounce-slow 2s infinite;
            }
          `}</style>

          {/* 우측: 선택된 날짜의 문서 리스트 */}
          <div className="w-full lg:w-96 bg-white rounded-[40px] shadow-lg border border-gray-100 p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                </h3>
                {selectedDocuments.length > 0 && (
                  <div className="px-3 py-1 bg-gradient-to-r from-[#00c288] to-[#00a572] rounded-full">
                    <span className="text-xs font-bold text-white">{selectedDocuments.length}개</span>
                  </div>
                )}
              </div>
              {selectedDocuments.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00c288] to-[#00a572] rounded-full transition-all duration-500"
                      style={{ width: `${getReviewAchievement(selectedDate)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-[#00c288]">
                    {getReviewAchievement(selectedDate)}%
                  </span>
                </div>
              )}
            </div>

            {/* 문서 리스트 */}
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              {selectedDocuments.length > 0 ? (
                selectedDocuments.map((doc, idx) => {
                  const colors = subjectColors[doc.color];
                  return (
                    <div
                      key={doc.id}
                      className={`group relative p-5 rounded-3xl border-2 ${colors.light} ${colors.border} hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden`}
                      style={{
                        animation: `slideUp 0.4s ease-out ${idx * 0.1}s both`
                      }}
                    >
                      {/* 배경 장식 */}
                      <div className={`absolute top-0 right-0 w-20 h-20 ${colors.dot} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-gray-900 text-base leading-snug pr-2">{doc.title}</h4>
                          <div className={`w-3 h-3 rounded-full ${colors.dot} flex-shrink-0 mt-1 shadow-md ring-2 ring-white`}></div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${colors.light} ${colors.text} border ${colors.border}`}>
                              {doc.subject}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">{doc.pages}장</span>
                          </div>

                          {/* 복습 완료 뱃지 */}
                          {doc.reviewed ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                              <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-[10px] font-bold text-emerald-600">복습완료</span>
                            </div>
                          ) : (
                            <div className="px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-[10px] font-bold text-gray-400">미완료</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-400">업로드한 문서가 없습니다</p>
                  <p className="text-xs text-gray-300 mt-1">오늘 공부한 내용을 기록해보세요</p>
                </div>
              )}
            </div>
          </div>

          {/* 추가 애니메이션 */}
          <style jsx>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .scrollbar-thin::-webkit-scrollbar {
              width: 6px;
            }
            .scrollbar-thin::-webkit-scrollbar-track {
              background: transparent;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 3px;
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}</style>

        </div>
      </div>
    </div>
  );
};

export default Home;
