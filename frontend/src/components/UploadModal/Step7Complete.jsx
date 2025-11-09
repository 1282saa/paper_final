/**
 * @file Step7Complete.jsx
 * @description 첫 복습 완료 확인 및 다음 복습일 안내
 */

import React from "react";

const Step7Complete = ({ documentData, onClose }) => {
  // 다음 복습일 계산 (3일 후)
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + 3);
  const formattedDate = nextReviewDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const reviewSchedule = [
    { day: "1일", date: "오늘 (완료 ✅)", color: "emerald", completed: true },
    { day: "3일", date: formattedDate, color: "blue", completed: false },
    { day: "7일", date: "그 다음", color: "purple", completed: false },
    { day: "14일", date: "그 다음", color: "orange", completed: false },
    { day: "30일", date: "마지막", color: "pink", completed: false },
  ];

  return (
    <div className="relative space-y-6">{/* 축하 애니메이션 (CSS 기반) */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-10">
        <div className="text-6xl animate-bounce">🎉</div>
      </div>

      {/* 완료 메시지 */}
      <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-emerald-200 text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          저장 완료! 🎉
        </h2>
        <p className="text-lg text-gray-700 mb-2">
          <span className="font-bold text-emerald-600">{documentData.title || "새 문서"}</span>
        </p>
        <p className="text-sm text-gray-600">
          첫 복습까지 완료했어요. 수고하셨습니다!
        </p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-2xl font-bold text-gray-900 mb-1">1회</div>
          <div className="text-xs text-gray-500">복습 완료</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-emerald-600 mb-1">25%</div>
          <div className="text-xs text-gray-500">전체 진행률</div>
        </div>
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
          <div className="text-4xl mb-2">⏰</div>
          <div className="text-2xl font-bold text-blue-600 mb-1">3일 후</div>
          <div className="text-xs text-gray-500">다음 복습</div>
        </div>
      </div>

      {/* 복습 스케줄 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          에빙하우스 망각곡선 복습 스케줄
        </h3>

        <div className="space-y-3">
          {reviewSchedule.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                item.completed
                  ? "bg-emerald-50 border-emerald-200"
                  : `bg-${item.color}-50 border-${item.color}-200 opacity-70`
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  item.completed
                    ? "bg-emerald-500"
                    : `bg-${item.color}-400`
                }`}
              >
                {item.completed ? "✓" : index + 1}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">
                  {item.day} 후 복습
                </div>
                <div className="text-sm text-gray-600">{item.date}</div>
              </div>
              {item.completed && (
                <div className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  완료
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 다음 복습 알림 */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-2">다음 복습 알림</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-bold text-blue-600">{formattedDate}</span>에
              "오늘의 복습"에서 이 문서를 다시 만나요.
              홈 화면에서 알림을 확인하세요!
            </p>
          </div>
        </div>
      </div>

      {/* 학습 팁 */}
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              효과적인 복습 팁
            </p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• 정해진 복습일에 꼭 복습하세요 (망각 방지)</li>
              <li>• 백지 복습과 AI 대화를 번갈아 사용하세요</li>
              <li>• 이해가 안 되는 부분은 메모해두세요</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 완료 버튼 */}
      <div className="pt-4">
        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-lg font-bold rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          홈으로 돌아가기 🏠
        </button>
      </div>
    </div>
  );
};

export default Step7Complete;
