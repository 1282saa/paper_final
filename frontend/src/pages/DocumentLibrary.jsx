/**
 * @file DocumentLibrary.jsx
 * @description 문서 보관함 페이지 - 업로드한 모든 문서 관리
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDocuments, deleteDocument as deleteDoc, getStatistics } from "../utils/documentStorage";

// Mock 데이터 (나중에 LocalStorage로 대체)
const mockDocuments = [
  {
    id: 1,
    subject: "수학",
    title: "미분의 정의와 기본 공식",
    tags: ["#미분", "#극한"],
    savedDate: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
    imageUrl: "https://via.placeholder.com/400x500/f0f0f0/666?text=Math+Notes",
    extractedText: "미분의 정의\n\n함수 f(x)의 x=a에서의 미분계수...",
    reviewCount: 0,
    lastReviewDate: null,
  },
  {
    id: 2,
    subject: "물리",
    title: "뉴턴의 운동 법칙",
    tags: ["#역학", "#힘"],
    savedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    imageUrl: "https://via.placeholder.com/400x500/f0f0f0/666?text=Physics+Notes",
    extractedText: "뉴턴의 제1법칙: 관성의 법칙...",
    reviewCount: 1,
    lastReviewDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    subject: "화학",
    title: "산화환원반응 정리",
    tags: ["#산화", "#환원"],
    savedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    imageUrl: "https://via.placeholder.com/400x500/f0f0f0/666?text=Chemistry+Notes",
    extractedText: "산화: 전자를 잃는 반응...",
    reviewCount: 2,
    lastReviewDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    subject: "영어",
    title: "고급 문법 - 가정법",
    tags: ["#문법", "#가정법"],
    savedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    imageUrl: "https://via.placeholder.com/400x500/f0f0f0/666?text=English+Notes",
    extractedText: "가정법 과거: If + 주어 + 과거동사...",
    reviewCount: 3,
    lastReviewDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

const DocumentLibrary = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [statistics, setStatistics] = useState({
    totalDocuments: 0,
    thisWeekAdded: 0,
    reviewedDocuments: 0,
    pendingReviews: 0,
  });
  const [filterSubject, setFilterSubject] = useState("전체");
  const [sortBy, setSortBy] = useState("최신순");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const subjects = ["전체", "수학", "영어", "화학", "물리", "역사", "생물", "국어", "기타"];

  // 문서 및 통계 로드
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = getAllDocuments();
    const stats = getStatistics();
    setDocuments(docs);
    setStatistics(stats);
  };

  // 필터링 및 정렬
  const filteredAndSortedDocs = documents
    .filter((doc) => filterSubject === "전체" || doc.subject === filterSubject)
    .sort((a, b) => {
      if (sortBy === "최신순") return b.savedDate - a.savedDate;
      if (sortBy === "오래된순") return a.savedDate - b.savedDate;
      if (sortBy === "제목순") return a.title.localeCompare(b.title);
      return 0;
    });

  const handleDelete = (id) => {
    if (window.confirm("정말로 이 문서를 삭제하시겠습니까?")) {
      try {
        deleteDoc(id);
        loadDocuments(); // 삭제 후 다시 로드
      } catch (error) {
        console.error("문서 삭제 실패:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">문서 보관함</h1>
          <p className="text-gray-600">업로드한 모든 문서를 한 곳에서 관리하세요</p>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">전체 문서</div>
            <div className="text-3xl font-bold text-gray-900">{statistics.totalDocuments}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">이번 주 추가</div>
            <div className="text-3xl font-bold text-[#00c288]">
              {statistics.thisWeekAdded}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">복습 완료</div>
            <div className="text-3xl font-bold text-blue-500">
              {statistics.reviewedDocuments}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">복습 대기</div>
            <div className="text-3xl font-bold text-orange-500">
              {statistics.pendingReviews}
            </div>
          </div>
        </div>

        {/* 필터 및 정렬 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">과목:</span>
              <div className="flex gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setFilterSubject(subject)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all border-0 outline-none ${
                      filterSubject === subject
                        ? "bg-[#00c288] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-[#00c288] transition-all"
              >
                <option value="최신순">최신순</option>
                <option value="오래된순">오래된순</option>
                <option value="제목순">제목순</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg border-0 outline-none ${
                    viewMode === "grid" ? "bg-[#00c288] text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg border-0 outline-none ${
                    viewMode === "list" ? "bg-[#00c288] text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 문서 목록 */}
        {filteredAndSortedDocs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-gray-400 text-lg mb-4">문서가 없습니다</div>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#00c288] text-white font-semibold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none"
            >
              문서 업로드하기
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-6">
            {filteredAndSortedDocs.map((doc) => (
              <DocumentCardGrid key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedDocs.map((doc) => (
              <DocumentCardList key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 그리드 뷰 카드
const DocumentCardGrid = ({ doc, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
        <img src={doc.imageUrl} alt={doc.title} className="w-full h-full object-cover" />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {doc.subject}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(doc.savedDate).toLocaleDateString("ko-KR")}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{doc.title}</h3>

        <div className="flex flex-wrap gap-1 mb-3">
          {doc.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs">
              {tag}
            </span>
          ))}
          {doc.tags.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              +{doc.tags.length - 2}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 mb-3">
          복습 {doc.reviewCount}회 완료
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/blank-review/${doc.id}`)}
            className="flex-1 py-2 bg-[#00c288] text-white text-sm font-semibold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none"
          >
            복습하기
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all border-0 outline-none"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// 리스트 뷰 카드
const DocumentCardList = ({ doc, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-6">
      <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <img src={doc.imageUrl} alt={doc.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            {doc.subject}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(doc.savedDate).toLocaleDateString("ko-KR")}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">{doc.title}</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {doc.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>

        <div className="text-sm text-gray-600">
          복습 {doc.reviewCount}회 완료
          {doc.lastReviewDate && (
            <span className="ml-3">
              마지막 복습: {new Date(doc.lastReviewDate).toLocaleDateString("ko-KR")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => navigate(`/blank-review/${doc.id}`)}
          className="px-6 py-3 bg-[#00c288] text-white font-semibold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none whitespace-nowrap"
        >
          복습하기
        </button>
        <button
          onClick={() => navigate(`/ai-question-generator?doc=${doc.id}`)}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all border-0 outline-none whitespace-nowrap"
        >
          문제 생성
        </button>
        <button
          onClick={() => onDelete(doc.id)}
          className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all border-0 outline-none"
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default DocumentLibrary;
