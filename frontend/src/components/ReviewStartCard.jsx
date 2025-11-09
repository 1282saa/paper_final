import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconClipboardCheck } from "./IconClipboardCheck";
import { getTodayReviewDocuments, getStatistics } from "../utils/documentStorage";

export const ReviewStartCard = () => {
  const navigate = useNavigate();
  const [todayReviews, setTodayReviews] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // 오늘 복습할 문서 불러오기
    const reviews = getTodayReviewDocuments();
    setTodayReviews(reviews);

    // 통계 불러오기
    const statistics = getStatistics();
    setStats(statistics);
  }, []);

  // 망각곡선 단계별 메시지
  const getMotivationMessage = () => {
    if (todayReviews.length === 0) {
      return "완벽해요! 오늘은 복습할 내용이 없어요. 새로운 공부를 시작해볼까요?";
    }

    const urgent = todayReviews.filter(doc => {
      const daysSince = Math.floor((Date.now() - new Date(doc.savedDate).getTime()) / (1000 * 60 * 60 * 24));
      return daysSince <= 1 && doc.reviewCount === 0;
    });

    if (urgent.length > 0) {
      return `오늘은 ${todayReviews.length}개 문서를 복습할 시간이에요! 특히 ${urgent.length}개는 24시간 내 복습이 필요해요.`;
    }

    return `오늘 복습할 문서가 ${todayReviews.length}개 있어요. 에빙하우스 망각곡선에 따라 지금이 최적의 복습 시간이에요!`;
  };

  return (
    <div className="relative w-[600px] h-[480px] bg-gradient-to-br from-white via-white to-emerald-50 rounded-[40px] overflow-hidden shadow-lg border border-emerald-100">
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-transparent opacity-30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-transparent opacity-20 rounded-full blur-2xl" />

      {/* 이미지 */}
      <img
        className="absolute top-[165px] left-[20px] w-[320px] h-[295px] aspect-[1.13] object-cover z-10"
        alt="Review Image"
        src="https://c.animaapp.com/lBqFBRLr/img/image-16@2x.png"
      />

      {/* 제목 */}
      <div className="absolute top-10 left-11 z-20">
        <h2 className="font-['Pretendard_Variable'] font-bold text-gray-900 text-3xl tracking-[-0.60px] leading-[33.6px]">
          오늘의 복습
        </h2>
        {todayReviews.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md animate-pulse">
              <span className="text-white text-sm font-bold">{todayReviews.length}개 대기중</span>
            </div>
            <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-md">
              <span className="text-white text-sm font-bold">복습률 {Math.round((stats.reviewedDocuments / stats.totalDocuments * 100) || 0)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <button
        onClick={() => navigate("/review-priority")}
        className={`absolute top-[365px] left-[calc(50.00%_+_25px)] w-[230px] h-[75px] flex ${
          todayReviews.length > 0
            ? 'bg-gradient-to-r from-[#00c288] to-[#00a572] hover:from-[#00b077] hover:to-[#009566]'
            : 'bg-[#21212f] hover:bg-[#2a2a3a]'
        } rounded-[32px] shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 outline-none transform hover:scale-105 z-20`}
      >
        <div className="inline-flex mt-6 w-[165px] h-[26px] ml-8 relative items-center gap-1">
          <IconClipboardCheck
            className="!aspect-[1] !relative !left-[unset] !top-[unset]"
            iconClipboardCheck="https://c.animaapp.com/lBqFBRLr/img/icon-clipboard-check-1.svg"
          />
          <div className="relative w-fit mt-[-1.00px] font-['Pretendard'] font-semibold text-white text-lg tracking-[-0.40px] leading-[22.4px] whitespace-nowrap">
            {todayReviews.length > 0 ? '지금 복습하기' : '복습 목록 보기'}
          </div>

          {todayReviews.length > 0 && (
            <div className="absolute top-1 left-[15px] w-1.5 h-1.5 bg-[#f1706d] rounded-[3px] animate-ping" />
          )}
        </div>
      </button>

      {/* 동기부여 메시지 */}
      <div className="absolute top-[88px] left-11 w-[500px] z-20">
        <p className="font-['Pretendard'] font-medium text-[#555] text-lg tracking-[-0.40px] leading-[28.0px]">
          {getMotivationMessage()}
        </p>

        {/* 망각곡선 설명 */}
        {todayReviews.length > 0 && (
          <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs font-bold text-gray-700">에빙하우스 망각곡선</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              복습 주기: <span className="font-bold text-emerald-600">1일</span> → <span className="font-bold text-blue-600">3일</span> → <span className="font-bold text-purple-600">7일</span> → <span className="font-bold text-orange-600">14일</span> → <span className="font-bold text-pink-600">30일</span>
            </p>
          </div>
        )}
      </div>

      {/* 오늘 복습할 문서 미리보기 (최대 3개) */}
      {todayReviews.length > 0 && (
        <div className="absolute bottom-6 left-11 right-11 z-20">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-md border border-gray-200">
            <h4 className="text-xs font-bold text-gray-700 mb-3">오늘 복습할 내용 미리보기</h4>
            <div className="space-y-2">
              {todayReviews.slice(0, 3).map((doc, idx) => (
                <div key={doc.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    doc.reviewStage === 0 ? 'bg-red-500' :
                    doc.reviewStage === 1 ? 'bg-orange-500' :
                    doc.reviewStage === 2 ? 'bg-yellow-500' :
                    doc.reviewStage === 3 ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <span className="font-medium text-gray-700 truncate flex-1">{doc.title}</span>
                  <span className="text-gray-500 text-[10px]">
                    {doc.reviewStage === 0 ? '1일차' :
                     doc.reviewStage === 1 ? '3일차' :
                     doc.reviewStage === 2 ? '7일차' :
                     doc.reviewStage === 3 ? '14일차' : '30일차'}
                  </span>
                </div>
              ))}
              {todayReviews.length > 3 && (
                <div className="text-center text-[10px] text-gray-400 pt-1">
                  +{todayReviews.length - 3}개 더보기
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
