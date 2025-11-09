/**
 * @file ReviewPriority.jsx
 * @description 망각곡선 기반 복습 우선순위 페이지
 */

import React, { useState, useEffect } from "react";
import { getDocumentsByPriority, getTodayReviewDocuments, getAllDocuments } from "../utils/documentStorage";

// Mock 데이터 (실제로는 서버/로컬스토리지에서 가져옴)
const mockDocuments = [
  {
    id: 1,
    subject: "수학",
    title: "미분의 정의와 기본 공식",
    tags: ["#미분", "#극한"],
    savedDate: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // 오늘
    lastReviewDate: null,
    reviewCount: 0,
    totalReviews: 4,
  },
  {
    id: 2,
    subject: "물리",
    title: "뉴턴의 운동 법칙",
    tags: ["#역학", "#힘"],
    savedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
    lastReviewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    reviewCount: 1,
    totalReviews: 4,
  },
  {
    id: 3,
    subject: "화학",
    title: "산화환원반응 정리",
    tags: ["#산화", "#환원"],
    savedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
    lastReviewDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    reviewCount: 2,
    totalReviews: 4,
  },
  {
    id: 4,
    subject: "영어",
    title: "고급 문법 - 가정법",
    tags: ["#문법", "#가정법"],
    savedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14일 전
    lastReviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    reviewCount: 3,
    totalReviews: 4,
  },
  {
    id: 5,
    subject: "수학",
    title: "적분의 기본 정리",
    tags: ["#적분", "#미적분"],
    savedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
    lastReviewDate: null,
    reviewCount: 0,
    totalReviews: 4,
  },
];

const ReviewPriority = () => {
  const [activeTab, setActiveTab] = useState("today"); // "today" | "all"
  const [documents, setDocuments] = useState([]);
  const [todayDocs, setTodayDocs] = useState([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const allDocs = getDocumentsByPriority(); // 이미 priority 정보 포함
    const today = getTodayReviewDocuments();

    setDocuments(allDocs);
    setTodayDocs(today.map(doc => {
      const docWithPriority = allDocs.find(d => d.id === doc.id);
      return docWithPriority || doc;
    }));
  };

  const displayDocs = activeTab === "today" ? todayDocs : documents;

  // 통계
  const stats = {
    totalDocs: documents.length,
    todayDocs: todayDocs.length,
    completedThisWeek: documents.filter(d => {
      if (!d.lastReviewDate) return false;
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(d.lastReviewDate).getTime() > weekAgo;
    }).length,
    streak: 5, // TODO: 실제 streak 계산 로직 구현
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">복습 관리</h1>
          <p className="text-gray-600">망각곡선 기반으로 최적의 복습 타이밍을 알려드려요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">오늘 복습할 문서</div>
            <div className="text-3xl font-bold text-[#00c288]">{stats.todayDocs}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">전체 문서</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalDocs}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">이번 주 복습</div>
            <div className="text-3xl font-bold text-blue-500">{stats.completedThisWeek}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">연속 복습 일수</div>
            <div className="text-3xl font-bold text-orange-500">{stats.streak}일</div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all border-0 outline-none ${
              activeTab === "today"
                ? "bg-[#00c288] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            오늘의 복습 ({stats.todayDocs})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all border-0 outline-none ${
              activeTab === "all"
                ? "bg-[#00c288] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            전체 문서 ({stats.totalDocs})
          </button>
        </div>

        {/* 문서 리스트 */}
        <div className="space-y-4">
          {displayDocs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="text-gray-400 text-lg">복습할 문서가 없습니다</div>
            </div>
          ) : (
            displayDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentCard = ({ doc }) => {
  const { priority } = doc;

  const priorityStyles = {
    urgent: "bg-red-50 border-red-200 text-red-700",
    important: "bg-orange-50 border-orange-200 text-orange-700",
    recommended: "bg-yellow-50 border-yellow-200 text-yellow-700",
    optional: "bg-green-50 border-green-200 text-green-700",
    completed: "bg-gray-50 border-gray-200 text-gray-500",
  };

  const totalReviews = 4; // 망각곡선 기준: 1일, 3일, 7일, 14일 = 총 4회
  const progressPercentage = (doc.reviewCount / totalReviews) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {/* 우선순위 배지 */}
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold ${priorityStyles[priority.level]}`}
            >
              {priority.label} - {priority.daysLabel}
            </span>

            {/* 과목 배지 */}
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
              {doc.subject}
            </span>
          </div>

          {/* 제목 */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{doc.title}</h3>

          {/* 태그 */}
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

          {/* 날짜 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>저장일: {new Date(doc.savedDate).toLocaleDateString("ko-KR")}</span>
            {doc.lastReviewDate && (
              <span>마지막 복습: {new Date(doc.lastReviewDate).toLocaleDateString("ko-KR")}</span>
            )}
          </div>

          {/* 진행률 */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                복습 진행률: {doc.reviewCount}/{totalReviews}회
              </span>
              <span className="text-sm font-bold text-[#00c288]">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00c288] transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 복습 시작 버튼 */}
        <button
          onClick={() => window.location.href = `/blank-review/${doc.id}`}
          className="ml-6 px-6 py-3 bg-[#00c288] text-white font-semibold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none whitespace-nowrap"
        >
          복습 시작
        </button>
      </div>
    </div>
  );
};

export default ReviewPriority;
