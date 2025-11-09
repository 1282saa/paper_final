/**
 * @file CalendarWithDocuments.jsx
 * @description 학습 동기부여 캘린더 + 문서 리스트 통합 컴포넌트
 *
 * @design_philosophy
 * - "학습량을 시각화하여 성취감을 주는 동기부여 시스템"
 * - GitHub contributions 스타일 히트맵 + Apple/Notion 미니멀리즘
 * - 버튼 느낌 제거 → 자연스러운 카드 느낌
 *
 * @visual_design
 * - 학습 강도별 색상 그라데이션 (emerald 50 → 600)
 * - 얇은 테두리, 충분한 패딩, subtle 애니메이션
 * - hover 시 부드러운 scale-up + 그림자 변화
 * - 5개 이상 문서 시 숫자 배지 표시
 *
 * @layout
 * - Left 30%: 문서 리스트 (스크롤 가능)
 * - Right 70%: react-day-picker 기반 캘린더
 */

import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export const CalendarWithDocuments = () => {
  // ==========================================
  // STATE
  // ==========================================
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);

  // ==========================================
  // MOCK DATA - 학습 데이터
  // ==========================================
  const mockDocuments = {
    "2025-1-9": [
      {
        id: 1,
        title: "미적분학 정리노트",
        subject: "수학",
        pages: 12,
        color: "emerald",
      },
      {
        id: 2,
        title: "영문법 핵심요약",
        subject: "영어",
        pages: 8,
        color: "violet",
      },
      {
        id: 3,
        title: "화학 실험 보고서",
        subject: "화학",
        pages: 5,
        color: "amber",
      },
    ],
    "2025-1-10": [
      {
        id: 4,
        title: "한국사 연표 정리",
        subject: "역사",
        pages: 15,
        color: "rose",
      },
    ],
    "2025-1-5": [
      {
        id: 5,
        title: "물리학 운동방정식",
        subject: "물리",
        pages: 10,
        color: "emerald",
      },
      {
        id: 6,
        title: "영어 독해 연습",
        subject: "영어",
        pages: 6,
        color: "violet",
      },
    ],
    "2025-1-6": [
      {
        id: 7,
        title: "생물 세포구조",
        subject: "생물",
        pages: 8,
        color: "emerald",
      },
    ],
    "2025-1-7": [
      {
        id: 8,
        title: "한국사 근대사",
        subject: "역사",
        pages: 12,
        color: "rose",
      },
      {
        id: 9,
        title: "수학 확률통계",
        subject: "수학",
        pages: 9,
        color: "emerald",
      },
      {
        id: 10,
        title: "영어 작문",
        subject: "영어",
        pages: 7,
        color: "violet",
      },
      {
        id: 11,
        title: "화학 반응식",
        subject: "화학",
        pages: 5,
        color: "amber",
      },
    ],
    "2025-1-8": [
      {
        id: 12,
        title: "물리 전자기학",
        subject: "물리",
        pages: 14,
        color: "emerald",
      },
      {
        id: 13,
        title: "수학 기하학",
        subject: "수학",
        pages: 11,
        color: "emerald",
      },
    ],
    "2025-1-11": [
      {
        id: 14,
        title: "생물 유전학",
        subject: "생물",
        pages: 9,
        color: "emerald",
      },
      {
        id: 15,
        title: "영어 문법 심화",
        subject: "영어",
        pages: 7,
        color: "violet",
      },
      {
        id: 16,
        title: "한국사 현대사",
        subject: "역사",
        pages: 10,
        color: "rose",
      },
      {
        id: 17,
        title: "화학 유기화학",
        subject: "화학",
        pages: 8,
        color: "amber",
      },
      {
        id: 18,
        title: "물리 광학",
        subject: "물리",
        pages: 6,
        color: "emerald",
      },
    ],
    "2025-1-3": [
      {
        id: 19,
        title: "수학 미분",
        subject: "수학",
        pages: 13,
        color: "emerald",
      },
    ],
  };

  // ==========================================
  // CONSTANTS
  // ==========================================
  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-400",
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-400",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-400",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-400",
    },
  };

  // ==========================================
  // UTILS - 학습 강도 계산
  // ==========================================
  const getLearningIntensity = (date) => {
    const dateKey = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;
    const docs = mockDocuments[dateKey];
    return docs ? docs.length : 0;
  };

  // GitHub 스타일 히트맵 색상 (0-5+)
  const getIntensityColorClass = (intensity) => {
    if (intensity === 0) return "";
    if (intensity === 1) return "bg-emerald-50/80 border-emerald-100";
    if (intensity === 2) return "bg-emerald-100/90 border-emerald-200";
    if (intensity <= 4)
      return "bg-emerald-200 border-emerald-300 text-emerald-900";
    // 5+ 문서: 최고 강도
    return "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white border-emerald-400";
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // ==========================================
  // DATA for Selected Date
  // ==========================================
  const dateKey = `${selectedDate.getFullYear()}-${
    selectedDate.getMonth() + 1
  }-${selectedDate.getDate()}`;
  const selectedDocuments = mockDocuments[dateKey] || [];

  // ==========================================
  // CUSTOM MODIFIERS for react-day-picker
  // ==========================================
  const modifiers = {
    hasDocuments: (date) => getLearningIntensity(date) > 0,
  };

  // ==========================================
  // CUSTOM DAY RENDERER
  // ==========================================
  const DayContent = (props) => {
    const { date } = props;
    const intensity = getLearningIntensity(date);
    const isSelected =
      selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();

    const isToday =
      date.getDate() === new Date().getDate() &&
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear();

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className="relative z-10">{date.getDate()}</span>
        {intensity >= 5 && !isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm z-20">
            {intensity}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* ==========================================
            LEFT SECTION (20%): Document List
            ========================================== */}
        <div className="w-full lg:w-[20%] bg-gradient-to-b from-gray-50/50 to-white p-4 lg:p-5 xl:p-6 border-r lg:border-r border-b lg:border-b-0 border-gray-100">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              학습 문서
            </h3>
            <p className="text-sm text-gray-500">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            </p>
            {selectedDocuments.length > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg">
                <svg
                  className="w-4 h-4 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-medium text-emerald-700">
                  {selectedDocuments.length}개 문서
                </span>
              </div>
            )}
          </div>

          {/* Document List */}
          <div
            className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {selectedDocuments.length > 0 ? (
              selectedDocuments.map((doc) => {
                const colors = colorClasses[doc.color] || colorClasses.emerald;
                return (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-xl p-4 border-l-4 ${colors.border} shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate mb-1.5">
                          {doc.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}
                          >
                            {doc.subject}
                          </span>
                          <span className="text-xs text-gray-500">
                            {doc.pages}장
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Empty State
              <div className="text-center py-16">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  문서가 없습니다
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            RIGHT SECTION (70%): Calendar
            ========================================== */}
        <div className="flex-1 p-4 lg:p-6 xl:p-8">
          {/* Header with Stats */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              학습 성취 캘린더
            </h2>
            <p className="text-sm text-gray-500">
              학습량에 따라 색이 진해져요. 꾸준히 학습하면 캘린더가 빛나요! ✨
            </p>
          </div>

          {/* react-day-picker Calendar */}
          <div className="calendar-container">
            <style jsx>{`
              .calendar-container :global(.rdp) {
                --rdp-accent-color: #10b981;
                --rdp-background-color: #f0fdf4;
                margin: 0;
                width: 100%;
                display: block;
              }

              .calendar-container :global(.rdp-months) {
                width: 100%;
                display: flex;
                justify-content: flex-start;
              }

              .calendar-container :global(.rdp-month) {
                width: 100%;
                max-width: none;
                margin-left: 0;
                margin-right: 0;
              }

              .calendar-container :global(.rdp-table) {
                width: 100%;
                max-width: none;
              }

              .calendar-container :global(.rdp-caption) {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0 0 24px 0;
              }

              .calendar-container :global(.rdp-caption_label) {
                font-size: 1.25rem;
                font-weight: 600;
                color: #111827;
              }

              .calendar-container :global(.rdp-nav) {
                position: absolute;
                right: 0;
                top: 0;
              }

              .calendar-container :global(.rdp-nav_button) {
                width: 36px;
                height: 36px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                background: white;
                transition: all 0.2s;
              }

              .calendar-container :global(.rdp-nav_button:hover) {
                background: #f9fafb;
                border-color: #d1d5db;
              }

              .calendar-container :global(.rdp-head_cell) {
                font-size: 0.75rem;
                font-weight: 600;
                color: #6b7280;
                padding: 8px;
              }

              .calendar-container :global(.rdp-cell) {
                padding: 6px;
              }

              .calendar-container :global(.rdp-day) {
                width: 100%;
                height: 0;
                padding-bottom: 100%;
                position: relative;
                border-radius: 14px;
                border: 1px solid transparent;
                font-size: 1rem;
                font-weight: 500;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                background: white;
                color: #374151;
              }

              .calendar-container :global(.rdp-day) > * {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
              }

              /* 학습 강도별 색상 - 자연스러운 그라데이션 */
              .calendar-container :global(.rdp-day[data-intensity="1"]) {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border-color: #bbf7d0;
                color: #065f46;
              }

              .calendar-container :global(.rdp-day[data-intensity="2"]) {
                background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                border-color: #86efac;
                color: #065f46;
              }

              .calendar-container :global(.rdp-day[data-intensity="3"]),
              .calendar-container :global(.rdp-day[data-intensity="4"]) {
                background: linear-gradient(135deg, #86efac 0%, #4ade80 100%);
                border-color: #22c55e;
                color: white;
              }

              .calendar-container :global(.rdp-day[data-intensity="5"]) {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                border-color: #047857;
                color: white;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
              }

              /* Hover 효과 - 부드러운 scale-up */
              .calendar-container
                :global(.rdp-day:not(.rdp-day_disabled):hover) {
                transform: scale(1.08);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                border-color: #d1d5db;
              }

              /* Today */
              .calendar-container :global(.rdp-day_today) {
                background: linear-gradient(
                  135deg,
                  #0ea5e9 0%,
                  #0284c7 100%
                ) !important;
                border-color: #0369a1 !important;
                color: white !important;
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
              }

              /* Selected */
              .calendar-container :global(.rdp-day_selected) {
                background: linear-gradient(
                  135deg,
                  #f59e0b 0%,
                  #d97706 100%
                ) !important;
                border-color: #b45309 !important;
                color: white !important;
                transform: scale(1.05);
                box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
              }

              .calendar-container :global(.rdp-day_selected:hover) {
                transform: scale(1.1);
              }

              /* Outside month */
              .calendar-container :global(.rdp-day_outside) {
                color: #d1d5db;
                opacity: 0.4;
              }

              /* Disabled */
              .calendar-container :global(.rdp-day_disabled) {
                opacity: 0.3;
                cursor: not-allowed;
              }
            `}</style>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              modifiers={modifiers}
              showOutsideDays
              formatters={{
                formatCaption: (date) => {
                  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
                },
              }}
              components={{
                DayContent: (props) => {
                  const intensity = getLearningIntensity(props.date);
                  return (
                    <div
                      data-intensity={
                        intensity > 0 ? Math.min(intensity, 5) : 0
                      }
                    >
                      <DayContent {...props} />
                    </div>
                  );
                },
              }}
              modifiersClassNames={{
                selected: "rdp-day_selected",
                today: "rdp-day_today",
              }}
              onDayMouseEnter={(date) => setHoveredDate(date)}
              onDayMouseLeave={() => setHoveredDate(null)}
            />
          </div>

          {/* Legend - 학습 강도 가이드 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600">
                학습 강도
              </span>
              <span className="text-xs text-gray-400">
                더 많이 학습할수록 진한 초록색
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">적음</span>
              <div className="flex gap-1.5">
                <div className="w-6 h-6 rounded-md bg-white border border-gray-200"></div>
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200"></div>
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300"></div>
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-200 to-emerald-300 border border-emerald-400"></div>
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-500 border border-emerald-500 shadow-sm"></div>
              </div>
              <span className="text-xs text-gray-500">많음</span>
            </div>

            {/* Additional info */}
            <div className="flex items-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500"></div>
                <span className="text-gray-600">오늘</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500"></div>
                <span className="text-gray-600">선택됨</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
