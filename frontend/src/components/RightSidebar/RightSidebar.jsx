/**
 * @file RightSidebar.jsx
 * @description 우측 랭킹 사이드바 컴포넌트 - 필기왕/복습왕 순위 표시
 *
 * @author AI Development Team
 * @created 2025-11-09
 *
 * @purpose
 * - 일일 학습 랭킹 시각화
 * - 필기왕/복습왕 탭 전환
 * - TOP 3 차트 및 전체 순위 리스트
 * - 날짜별 랭킹 조회
 *
 * @features
 * - 탭 전환 (필기왕 ↔ 복습왕)
 * - 날짜 네비게이션 (이전/다음 날)
 * - TOP 3 시각적 바 차트 (동적 데이터 연동)
 * - 4위 이하 스크롤 가능한 리스트
 * - 프로필 이미지, 닉네임, 학교 정보 표시
 *
 * @future_api
 * - GET /api/ranking?date=YYYY-MM-DD&type=writing|review
 *   - Response: { rankings: [{ rank, userId, nickname, school, count }] }
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconCheveronLeft } from "../IconCheveronLeft";
import { IconCheveronRight } from "../IconCheveronRight";

/**
 * @constant MOCK_RANKINGS
 * @description 랭킹 목업 데이터 (20개)
 * 실제 구현 시 API에서 가져올 데이터
 */
const MOCK_RANKINGS = [
  {
    rank: 1,
    name: "김철수",
    school: "서울고 2학년",
    count: 12,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-1.svg",
  },
  {
    rank: 2,
    name: "이영희",
    school: "강남고 3학년",
    count: 9,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506.svg",
  },
  {
    rank: 3,
    name: "박민수",
    school: "대치고 2학년",
    count: 7,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-2.svg",
  },
  {
    rank: 4,
    name: "최지훈",
    school: "서울고 2학년",
    count: 6,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-3.svg",
  },
  {
    rank: 5,
    name: "정수진",
    school: "강남고 1학년",
    count: 5,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-4.svg",
  },
  {
    rank: 6,
    name: "강동원",
    school: "대치고 3학년",
    count: 4,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-5.svg",
  },
  {
    rank: 7,
    name: "윤서연",
    school: "서울고 1학년",
    count: 3,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-6.svg",
  },
  {
    rank: 8,
    name: "임재현",
    school: "강남고 2학년",
    count: 3,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-7.svg",
  },
  {
    rank: 9,
    name: "한예슬",
    school: "대치고 1학년",
    count: 2,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-8.svg",
  },
  {
    rank: 10,
    name: "오준혁",
    school: "서울고 3학년",
    count: 2,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-3.svg",
  },
  {
    rank: 11,
    name: "송지아",
    school: "강남고 2학년",
    count: 2,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-4.svg",
  },
  {
    rank: 12,
    name: "배성준",
    school: "대치고 2학년",
    count: 2,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-5.svg",
  },
  {
    rank: 13,
    name: "신유나",
    school: "서울고 1학년",
    count: 1,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-6.svg",
  },
  {
    rank: 14,
    name: "류지원",
    school: "강남고 3학년",
    count: 1,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-7.svg",
  },
  {
    rank: 15,
    name: "홍민기",
    school: "대치고 1학년",
    count: 1,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-8.svg",
  },
  {
    rank: 16,
    name: "장서윤",
    school: "서울고 2학년",
    count: 1,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-3.svg",
  },
  {
    rank: 17,
    name: "안태양",
    school: "강남고 1학년",
    count: 1,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-4.svg",
  },
  {
    rank: 18,
    name: "문하늘",
    school: "대치고 3학년",
    count: 1,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-5.svg",
  },
  {
    rank: 19,
    name: "권나래",
    school: "서울고 3학년",
    count: 1,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-6.svg",
  },
  {
    rank: 20,
    name: "조아름",
    school: "강남고 2학년",
    count: 1,
    image: "https://c.animaapp.com/635adaII/img/ellipse-506-7.svg",
  },
];

/**
 * @component TopRankCard
 * @description TOP 3 개별 카드 컴포넌트
 *
 * @param {Object} props
 * @param {Object} props.user - 사용자 데이터
 * @param {number} props.rank - 순위 (1, 2, 3)
 */
const TopRankCard = ({ user, rank }) => {
  // 순위별 바 높이 설정
  const getBarHeight = () => {
    if (rank === 1) return "h-[140px]";
    if (rank === 2) return "h-[100px]";
    return "h-[66px]";
  };

  // 순위별 배경색 설정
  const getBarColor = () => {
    if (rank === 1) return "bg-[#00c288]";
    if (rank === 2) return "bg-[#00c28899]";
    return "bg-[#00c2884c]";
  };

  // 순위별 텍스트 위치
  const getTextPosition = () => {
    if (rank === 1) return "top-14 left-3";
    if (rank === 2) return "top-9 left-4";
    return "top-[19px] left-[17px]";
  };

  return (
    <div className="flex flex-col w-[61px] items-center gap-3">
      {/* 프로필 & 정보 */}
      <div className="flex flex-col items-center gap-1 w-full">
        <img
          className="w-12 h-12 aspect-[1] object-cover rounded-full"
          alt={`${user.name} 프로필`}
          src={user.image}
        />
        <div className="flex flex-col items-center w-full">
          <div className="font-['Pretendard'] font-medium text-black text-[15px] text-center tracking-[-0.38px] leading-[21.0px] truncate max-w-full">
            {user.name}
          </div>
          <div className="font-['Pretendard'] font-normal text-[#666] text-xs tracking-[-0.30px] leading-[16.8px] text-center truncate max-w-full">
            {user.school}
          </div>
        </div>
      </div>

      {/* 랭킹 바 */}
      <div
        className={`relative w-full ${getBarHeight()} ${getBarColor()} rounded-xl overflow-hidden`}
      >
        <div
          className={`absolute ${getTextPosition()} font-['Pretendard'] font-medium text-white text-xl tracking-[-0.50px] leading-[28.0px] whitespace-nowrap`}
        >
          {user.count}장
        </div>
      </div>
    </div>
  );
};

/**
 * @component RightSidebar
 * @description 우측 랭킹 사이드바 메인 컴포넌트
 *
 * @returns {JSX.Element} 랭킹 사이드바 UI
 *
 * @state
 * - activeTab: 현재 활성 탭 ('writing' | 'review')
 * - selectedDate: 선택된 날짜 (Date 객체)
 */
export const RightSidebar = () => {
  const navigate = useNavigate();

  // ==========================================
  // State 관리
  // ==========================================

  /** @state 현재 활성화된 탭 (필기왕 or 복습왕) */
  const [activeTab, setActiveTab] = useState("writing");

  /** @state 선택된 날짜 */
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 10, 5));

  // ==========================================
  // 이벤트 핸들러
  // ==========================================

  /**
   * @function handleTabClick
   * @description 탭 클릭 시 활성 탭 변경
   * @param {string} tab - 'writing' 또는 'review'
   */
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // TODO: API 호출하여 해당 탭의 랭킹 데이터 가져오기
    console.log(`탭 전환: ${tab === "writing" ? "필기왕" : "복습왕"}`);
  };

  /**
   * @function handleDateChange
   * @description 날짜 변경 (이전/다음 날)
   * @param {number} days - 변경할 일수 (-1: 이전날, +1: 다음날)
   */
  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    // TODO: API 호출하여 해당 날짜의 랭킹 데이터 가져오기
    console.log(`날짜 변경: ${newDate.toLocaleDateString("ko-KR")}`);
  };

  /**
   * @function handleBack
   * @description 뒤로 가기 (홈으로 이동)
   */
  const handleBack = () => {
    navigate("/");
  };

  /**
   * @function formatDate
   * @description 날짜를 "MM월 DD일" 형식으로 포맷팅
   * @param {Date} date - 포맷팅할 날짜 객체
   * @returns {string} 포맷된 날짜 문자열
   */
  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  // 데이터 추출
  const top3 = MOCK_RANKINGS.slice(0, 3);
  const restRankings = MOCK_RANKINGS.slice(3);

  return (
    <div className="hidden xl:block xl:w-[480px] lg:w-[400px] h-screen bg-white flex-shrink-0 border-l border-gray-200 overflow-hidden relative">
      <div className="flex flex-col h-full w-full bg-white overflow-hidden py-10 px-8 pb-[163px]">
        {/* ==========================================
            헤더: 뒤로 가기 + 제목
            ========================================== */}
        <div className="flex items-center justify-between mb-4">
          {/* 뒤로 가기 버튼 */}
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-solid border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="뒤로 가기"
          >
            <IconCheveronLeft
              className="h-6 w-6"
              iconCheveronLeft="https://c.animaapp.com/635adaII/img/icon-cheveron-left-1.svg"
            />
          </button>

          {/* 제목 */}
          <h1 className="font-['Pretendard'] font-medium text-black text-2xl tracking-[-0.60px] leading-[33.6px] whitespace-nowrap">
            오늘 한 장 랭킹
          </h1>

          {/* 우측 공간 균형 */}
          <div className="w-9"></div>
        </div>

        {/* ==========================================
            탭 전환 버튼 (필기왕 / 복습왕)
            ========================================== */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-[197px] h-[58px] flex items-center gap-1 bg-[#eaeaea] rounded-[100px] p-1 shadow-[inset_-1px_-1px_1px_#ffffff,inset_1px_1px_2px_#11007426]">
            {/* 필기왕 탭 */}
            <button
              onClick={() => handleTabClick("writing")}
              className={`flex-1 h-[50px] flex items-center justify-center rounded-[100px] transition-all cursor-pointer border-none outline-none ${
                activeTab === "writing"
                  ? "bg-white shadow-[0px_2px_8px_#11111133]"
                  : "bg-transparent hover:bg-gray-100/50"
              }`}
            >
              <span
                className={`font-['Pretendard'] font-medium text-xl tracking-[-0.50px] leading-[28.0px] whitespace-nowrap ${
                  activeTab === "writing" ? "text-gray-900" : "text-[#999999]"
                }`}
              >
                필기왕
              </span>
            </button>

            {/* 복습왕 탭 */}
            <button
              onClick={() => handleTabClick("review")}
              className={`flex-1 h-[50px] flex items-center justify-center rounded-[100px] transition-all cursor-pointer border-none outline-none ${
                activeTab === "review"
                  ? "bg-white shadow-[0px_2px_8px_#11111133]"
                  : "bg-transparent hover:bg-gray-100/50"
              }`}
            >
              <span
                className={`font-['Pretendard'] font-medium text-xl tracking-[-0.50px] leading-[28.0px] whitespace-nowrap ${
                  activeTab === "review" ? "text-gray-900" : "text-[#999999]"
                }`}
              >
                복습왕
              </span>
            </button>
          </div>
        </div>

        {/* ==========================================
            날짜 선택 네비게이션
            ========================================== */}
        <div className="flex w-[160px] items-center gap-5 mx-auto mb-6">
          {/* 이전 날 버튼 */}
          <button
            onClick={() => handleDateChange(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-solid border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="이전 날"
          >
            <IconCheveronLeft
              className="h-5 w-5"
              iconCheveronLeft="https://c.animaapp.com/635adaII/img/icon-cheveron-left-1.svg"
            />
          </button>

          {/* 선택된 날짜 표시 */}
          <div className="font-['Pretendard'] font-normal text-black text-base text-center tracking-[-0.40px] leading-[22.4px] whitespace-nowrap flex-1">
            {formatDate(selectedDate)}
          </div>

          {/* 다음 날 버튼 */}
          <button
            onClick={() => handleDateChange(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-solid border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="다음 날"
          >
            <IconCheveronRight
              className="h-5 w-5"
              iconCheveronRight="https://c.animaapp.com/635adaII/img/icon-cheveron-right-2.svg"
            />
          </button>
        </div>

        {/* ==========================================
            TOP 3 차트 (동적 데이터 연동)
            ========================================== */}
        <div className="mb-8">
          {/* TOP 3 카드들 */}
          <div className="flex items-end justify-center gap-8 lg:gap-12 mb-3">
            {/* 2위 (왼쪽) */}
            <TopRankCard user={top3[1]} rank={2} />

            {/* 1위 (중앙, 가장 높음) */}
            <TopRankCard user={top3[0]} rank={1} />

            {/* 3위 (오른쪽) */}
            <TopRankCard user={top3[2]} rank={3} />
          </div>

          {/* 순위 번호 */}
          <div className="flex justify-center gap-[90px] mt-3">
            <div className="font-['Pretendard'] font-medium text-[#00c288] text-base tracking-[-0.40px] leading-[22.4px] text-center w-[61px]">
              02
            </div>
            <div className="font-['Pretendard'] font-medium text-[#00c288] text-base tracking-[-0.40px] leading-[22.4px] text-center w-[61px]">
              01
            </div>
            <div className="font-['Pretendard'] font-medium text-[#00c288] text-base tracking-[-0.40px] leading-[22.4px] text-center w-[61px]">
              03
            </div>
          </div>
        </div>

        {/* ==========================================
            4위 이하 랭킹 리스트 (스크롤 가능)
            ========================================== */}
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 min-h-0">
          <div className="flex flex-col w-full gap-3 pb-6">
            {restRankings.map((user, index) => (
              <div
                key={user.rank}
                className="flex items-center justify-between w-full hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* 순위 번호 */}
                  <div className="font-['Pretendard'] font-semibold text-[#767676] text-lg tracking-[-0.50px] leading-[28.0px] text-center min-w-[30px]">
                    {String(user.rank).padStart(2, "0")}
                  </div>

                  {/* 프로필 이미지 */}
                  <img
                    className="w-10 h-10 aspect-[1] object-cover rounded-full flex-shrink-0"
                    alt={`${user.name} 프로필`}
                    src={user.image}
                  />

                  {/* 사용자 정보 */}
                  <div className="flex flex-col">
                    <div className="font-['Pretendard'] font-medium text-black text-[15px] tracking-[-0.38px] leading-[21.0px]">
                      {user.name}
                    </div>
                    <div className="font-['Pretendard'] font-normal text-[#666] text-xs tracking-[-0.30px] leading-[16.8px]">
                      {user.school}
                    </div>
                  </div>
                </div>

                {/* 학습 장수 */}
                <div className="font-['Pretendard'] font-medium text-[#111111] text-lg tracking-[-0.50px] leading-[28.0px] whitespace-nowrap">
                  {user.count}장
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          사용자 프로필 카드 (하단 고정 - absolute)
          ========================================== */}
      <div className="absolute bottom-10 left-8 right-8 h-[123px] bg-[#f1706d] rounded-[20px] overflow-hidden shadow-lg">
        {/* 왼쪽: 프로필 이미지 + 이름 */}
        <div className="absolute left-8 top-6 flex flex-col items-center gap-0.5 w-[52px]">
          <img
            className="w-full aspect-[1] object-cover rounded-full"
            alt="프로필"
            src="https://c.animaapp.com/9a7ZrCfQ/img/ellipse-3.svg"
          />
          <div className="w-full font-['Pretendard'] font-medium text-white text-base tracking-[-0.40px] leading-[22.4px] text-center">
            양은별
          </div>
        </div>

        {/* 중앙: 순위 정보 */}
        <div className="absolute left-[119px] top-8 inline-flex items-start gap-[25px]">
          {/* 필기 순위 */}
          <div className="flex flex-col items-center w-[88px]">
            <div className="w-full font-['Pretendard'] font-medium text-white text-sm tracking-[-0.40px] leading-[22.4px] text-center">
              나의 필기 순위
            </div>
            <div className="w-full font-['Pretendard'] font-semibold text-white text-2xl tracking-[-0.60px] leading-[33.6px] text-center">
              60 등
            </div>
          </div>

          {/* 구분선 */}
          <img
            className="h-[59px] w-px object-cover"
            alt="Line"
            src="https://c.animaapp.com/9a7ZrCfQ/img/line-27.svg"
          />

          {/* 복습 순위 */}
          <div className="flex flex-col items-center w-[88px]">
            <div className="w-full font-['Pretendard'] font-medium text-white text-sm tracking-[-0.40px] leading-[22.4px] text-center">
              나의 복습 순위
            </div>
            <div className="w-full font-['Pretendard'] font-semibold text-white text-2xl tracking-[-0.60px] leading-[33.6px] text-center">
              81 등
            </div>
          </div>
        </div>

        {/* 우측 하단: 복습 연속 일수 */}
        <p className="absolute left-[249px] top-[89px] font-['Pretendard'] font-medium text-white text-[13px] tracking-[-0.33px] leading-[18.2px] text-center whitespace-nowrap">
          🔥 복습 연속 12일 째
        </p>
      </div>

      {/* 커스텀 스크롤바 스타일 */}
      <style jsx>{`
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
  );
};
