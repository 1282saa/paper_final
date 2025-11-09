/**
 * @file ForgettingCurve.jsx
 * @description 망각곡선 시각화 및 복습 스케줄 페이지
 */

import React, { useState } from "react";

// Mock 데이터
const mockUserData = {
  totalDocuments: 24,
  reviewedToday: 8,
  streak: 12,
  weeklyGoal: 50,
  weeklyProgress: 38,
  averageRetention: 87,
};

const mockReviewSchedule = [
  { date: "2025-01-09", count: 8, completed: 8 },
  { date: "2025-01-10", count: 6, completed: 0 },
  { date: "2025-01-11", count: 4, completed: 0 },
  { date: "2025-01-12", count: 7, completed: 0 },
  { date: "2025-01-13", count: 5, completed: 0 },
  { date: "2025-01-14", count: 3, completed: 0 },
  { date: "2025-01-15", count: 9, completed: 0 },
];

const ForgettingCurve = () => {
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">망각곡선 분석</h1>
          <p className="text-gray-600">과학적 복습 스케줄로 장기 기억을 만들어보세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">오늘 복습</div>
                <div className="text-2xl font-bold text-gray-900">{mockUserData.reviewedToday}</div>
              </div>
            </div>
            <div className="text-xs text-emerald-600 font-medium">목표 달성!</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">연속 복습</div>
                <div className="text-2xl font-bold text-gray-900">{mockUserData.streak}일</div>
              </div>
            </div>
            <div className="text-xs text-orange-600 font-medium">최고 기록!</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">이번 주 목표</div>
                <div className="text-2xl font-bold text-gray-900">{mockUserData.weeklyProgress}/{mockUserData.weeklyGoal}</div>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(mockUserData.weeklyProgress / mockUserData.weeklyGoal) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">평균 기억률</div>
                <div className="text-2xl font-bold text-gray-900">{mockUserData.averageRetention}%</div>
              </div>
            </div>
            <div className="text-xs text-purple-600 font-medium">우수!</div>
          </div>
        </div>

        {/* 망각곡선 그래프 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">에빙하우스 망각곡선</h2>

          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-900 leading-relaxed">
              <strong>망각곡선이란?</strong> 독일 심리학자 에빙하우스가 발견한 기억 감소 패턴입니다.
              학습 후 1일차에 67%, 7일차에 75%를 망각하지만, 적절한 타이밍에 복습하면 장기 기억으로 전환됩니다.
            </p>
          </div>

          {/* 망각곡선 시각화 */}
          <div className="relative h-80 mb-8">
            {/* Y축 라벨 */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* 그래프 영역 */}
            <div className="ml-16 h-full relative border-l-2 border-b-2 border-gray-200">
              {/* 망각곡선 (복습 없이) */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path
                  d="M 0,0 Q 100,80 200,140 T 400,180 T 600,200 T 800,220"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  opacity="0.6"
                />
              </svg>

              {/* 복습 후 기억 곡선 */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                {/* 1일차 복습 */}
                <path
                  d="M 0,0 Q 100,80 200,100"
                  fill="none"
                  stroke="#00c288"
                  strokeWidth="4"
                />
                <path
                  d="M 200,10 Q 300,60 400,80"
                  fill="none"
                  stroke="#00c288"
                  strokeWidth="4"
                />
                {/* 3일차 복습 */}
                <path
                  d="M 400,20 Q 500,50 600,60"
                  fill="none"
                  stroke="#00c288"
                  strokeWidth="4"
                />
                {/* 7일차 복습 */}
                <path
                  d="M 600,25 Q 700,40 800,45"
                  fill="none"
                  stroke="#00c288"
                  strokeWidth="4"
                />
              </svg>

              {/* 복습 타이밍 마커 */}
              <div className="absolute" style={{ left: '25%', top: '12%' }}>
                <div className="w-4 h-4 bg-[#00c288] rounded-full border-4 border-white shadow-lg"></div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="px-2 py-1 bg-[#00c288] text-white text-xs font-bold rounded">1일차</div>
                </div>
              </div>
              <div className="absolute" style={{ left: '50%', top: '25%' }}>
                <div className="w-4 h-4 bg-[#00c288] rounded-full border-4 border-white shadow-lg"></div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="px-2 py-1 bg-[#00c288] text-white text-xs font-bold rounded">3일차</div>
                </div>
              </div>
              <div className="absolute" style={{ left: '75%', top: '31%' }}>
                <div className="w-4 h-4 bg-[#00c288] rounded-full border-4 border-white shadow-lg"></div>
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="px-2 py-1 bg-[#00c288] text-white text-xs font-bold rounded">7일차</div>
                </div>
              </div>
            </div>

            {/* X축 라벨 */}
            <div className="ml-16 flex justify-between text-xs text-gray-500 mt-2">
              <span>학습 직후</span>
              <span>1일</span>
              <span>3일</span>
              <span>7일</span>
              <span>14일</span>
              <span>30일</span>
            </div>
          </div>

          {/* 범례 */}
          <div className="flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-red-400" style={{ opacity: 0.6 }}></div>
              <span className="text-sm text-gray-600">복습 없이 (자연 망각)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-[#00c288]"></div>
              <span className="text-sm text-gray-600">체계적 복습 후</span>
            </div>
          </div>
        </div>

        {/* 복습 스케줄 캘린더 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">이번 주 복습 스케줄</h2>

          <div className="grid grid-cols-7 gap-4">
            {mockReviewSchedule.map((day, index) => {
              const date = new Date(day.date);
              const dayName = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
              const isToday = index === 0;
              const progress = day.count > 0 ? (day.completed / day.count) * 100 : 0;

              return (
                <div
                  key={day.date}
                  className={`p-4 rounded-xl transition-all ${
                    isToday
                      ? "bg-gradient-to-br from-[#00c288] to-[#00b077] text-white shadow-lg"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday ? "text-white" : "text-gray-500"}`}>
                    {dayName}요일
                  </div>
                  <div className={`text-2xl font-bold mb-3 ${isToday ? "text-white" : "text-gray-900"}`}>
                    {date.getDate()}
                  </div>

                  <div className={`text-sm font-semibold mb-2 ${isToday ? "text-white" : "text-gray-700"}`}>
                    {day.completed}/{day.count} 완료
                  </div>

                  <div className={`h-2 rounded-full overflow-hidden ${isToday ? "bg-white/30" : "bg-gray-200"}`}>
                    <div
                      className={`h-full ${isToday ? "bg-white" : "bg-[#00c288]"}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgettingCurve;
