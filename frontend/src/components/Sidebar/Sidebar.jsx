/**
 * @file Sidebar.jsx
 * @description 좌측 사이드바 컴포넌트 - 메인 네비게이션을 담당하는 핵심 UI 컴포넌트
 *
 * @author AI Development Team
 * @created 2025-11-09
 *
 * @dependencies
 * - react-router-dom: 페이지 라우팅 기능
 * - menuConfig.js: 메뉴 설정 데이터
 * - icons: 각종 아이콘 컴포넌트들
 *
 * @features
 * - 동적 메뉴 렌더링
 * - 현재 페이지에 따른 활성 상태 자동 관리
 * - 배지 시스템 (알림 개수 표시)
 * - React Router 기반 네비게이션
 *
 * @structure
 * Sidebar (Main Component)
 *   ├── Logo Section (로고 영역)
 *   ├── MenuSection[] (메뉴 섹션들)
 *   │   └── MenuItem[] (개별 메뉴 아이템들)
 *   └── BottomMenuItem[] (하단 메뉴)
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AcademicCap2 } from "../../icons/AcademicCap2";
import { menuSections, bottomMenuItems } from "./menuConfig";

/**
 * @component MenuItem
 * @description 개별 메뉴 아이템 컴포넌트
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.item - 메뉴 아이템 데이터
 * @param {string} props.item.id - 메뉴 아이템 고유 ID
 * @param {string} props.item.label - 메뉴 아이템 표시 텍스트
 * @param {Component} props.item.icon - 아이콘 컴포넌트
 * @param {string} props.item.path - 라우팅 경로
 * @param {number} [props.item.badge] - 배지에 표시할 숫자 (선택사항)
 * @param {boolean} props.isActive - 현재 활성화 상태 여부
 * @param {Function} props.onClick - 클릭 이벤트 핸들러
 *
 * @example
 * <MenuItem
 *   item={{ id: 'home', label: '홈', icon: HomeIcon, path: '/' }}
 *   isActive={true}
 *   onClick={() => navigate('/')}
 * />
 */
const MenuItem = ({ item, isActive, onClick }) => {
  // 아이콘 컴포넌트를 동적으로 할당
  const Icon = item.icon;

  return (
    <div
      className="flex h-14 items-center gap-2 pl-8 pr-0 py-0 relative w-full cursor-pointer"
      onClick={onClick}
      role="menuitem"
      aria-current={isActive ? "page" : undefined}
    >
      {/* 활성 상태일 때 배경 하이라이트 */}
      {isActive && (
        <div className="absolute top-0 left-5 w-[220px] h-14 bg-[#00c288] rounded-xl" />
      )}

      {/* 아이콘 - 활성 상태에 따라 색상 변경 */}
      <Icon
        className="!relative !w-5 !h-5"
        color={isActive ? "white" : "#999999"}
      />

      {/* 메뉴 레이블 - 활성 상태에 따라 폰트와 색상 변경 */}
      <div
        className={`relative w-fit font-medium text-base tracking-[-0.40px] leading-[22.4px] whitespace-nowrap ${
          isActive
            ? "[font-family:'Pretendard_Variable-SemiBold',Helvetica] text-basewhite"
            : "[font-family:'Pretendard_Variable-Medium',Helvetica] text-[#505050]"
        }`}
      >
        {item.label}
      </div>

      {/* 배지 (알림 개수 표시) - item.badge가 있을 때만 렌더링 */}
      {item.badge && (
        <div className="absolute top-[19px] left-[220px] w-[18px] h-[18px] bg-second rounded-[9px]">
          <div className="absolute top-0 left-[5px] [font-family:'Pretendard_Variable-Regular',Helvetica] font-normal text-white text-[13px] tracking-[-0.33px] leading-[18.2px] whitespace-nowrap">
            {item.badge}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @component MenuSection
 * @description 메뉴 섹션 컴포넌트 (예: '학습 관리', '빠른 실행')
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.section - 섹션 데이터
 * @param {string} props.section.id - 섹션 고유 ID
 * @param {string} props.section.title - 섹션 제목
 * @param {Array} props.section.items - 섹션에 속한 메뉴 아이템 배열
 * @param {string} props.activeItemId - 현재 활성화된 메뉴 아이템 ID
 * @param {Function} props.onItemClick - 메뉴 아이템 클릭 핸들러
 *
 * @example
 * <MenuSection
 *   section={{ id: 'learning', title: '학습 관리', items: [...] }}
 *   activeItemId="home"
 *   onItemClick={handleItemClick}
 * />
 */
const MenuSection = ({ section, activeItemId, onItemClick }) => {
  return (
    <div className="relative w-full h-[264px]">
      {/* 메뉴 아이템들을 세로로 나열 */}
      <div className="flex flex-col w-[260px] items-start absolute top-10 left-0">
        {section.items.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>

      {/* 섹션 제목 */}
      <div className="absolute top-0 left-8 [font-family:'Pretendard_Variable-Medium',Helvetica] font-medium text-[#00c288] text-sm tracking-[-0.35px] leading-[19.6px] whitespace-nowrap">
        {section.title}
      </div>
    </div>
  );
};

/**
 * @component BottomMenuItem
 * @description 사이드바 하단 메뉴 아이템 컴포넌트 (예: 설정, FAQ, 로그아웃)
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.item - 메뉴 아이템 데이터
 * @param {string} props.item.id - 메뉴 아이템 고유 ID
 * @param {string} props.item.label - 메뉴 아이템 표시 텍스트
 * @param {Component} props.item.icon - 아이콘 컴포넌트
 * @param {Function} props.onClick - 클릭 이벤트 핸들러
 */
const BottomMenuItem = ({ item, onClick }) => {
  const Icon = item.icon;

  return (
    <div
      className="inline-flex items-start gap-2 relative flex-[0_0_auto] cursor-pointer"
      onClick={onClick}
      role="menuitem"
    >
      <Icon className="!relative !w-5 !h-5" color="#999999" />
      <div className="mt-[-1.00px] [font-family:'Pretendard_Variable-Medium',Helvetica] font-medium text-[#505050] text-[13px] tracking-[-0.33px] leading-[18.2px] relative w-fit whitespace-nowrap">
        {item.label}
      </div>
    </div>
  );
};

/**
 * @component Sidebar
 * @description 메인 사이드바 컴포넌트
 *
 * @returns {JSX.Element} 사이드바 UI
 *
 * @example
 * // App.jsx에서 사용
 * <Sidebar />
 *
 * @features
 * - 현재 경로 자동 감지 및 해당 메뉴 활성화
 * - React Router를 통한 페이지 네비게이션
 * - 메뉴 설정 파일(menuConfig.js) 기반 동적 렌더링
 * - 로고 클릭 시 홈으로 이동 가능 (추가 구현 가능)
 */
export const Sidebar = () => {
  // React Router Hooks
  const navigate = useNavigate(); // 페이지 이동을 위한 hook
  const location = useLocation(); // 현재 경로 정보를 가져오는 hook

  /**
   * @function getActiveItemId
   * @description 현재 URL 경로에 해당하는 활성 메뉴 아이템 ID를 찾는 함수
   *
   * @returns {string} 활성화된 메뉴 아이템의 ID (찾지 못하면 'home' 반환)
   *
   * @algorithm
   * 1. menuSections 배열을 순회
   * 2. 각 섹션의 items 배열에서 현재 경로와 일치하는 item 찾기
   * 3. 찾으면 해당 item.id 반환
   * 4. 못 찾으면 기본값 'home' 반환
   */
  const getActiveItemId = () => {
    for (const section of menuSections) {
      const activeItem = section.items.find(
        (item) => item.path === location.pathname
      );
      if (activeItem) return activeItem.id;
    }
    return "home"; // 기본값: 매칭되는 경로가 없으면 홈을 활성화
  };

  // 현재 활성화된 메뉴 아이템 ID
  const activeItemId = getActiveItemId();

  /**
   * @function handleItemClick
   * @description 메인 메뉴 아이템 클릭 핸들러
   *
   * @param {Object} item - 클릭된 메뉴 아이템 객체
   *
   * @logic
   * 1. item.onClick이 있으면 해당 함수 실행 (커스텀 동작)
   * 2. 없으면 item.path로 페이지 이동 (일반 네비게이션)
   */
  const handleItemClick = (item) => {
    if (item.onClick) {
      // 커스텀 onClick 함수가 있으면 실행 (예: 모달 열기, API 호출 등)
      item.onClick();
    } else if (item.path) {
      // path가 있으면 해당 경로로 이동
      navigate(item.path);
    }
  };

  /**
   * @function handleBottomItemClick
   * @description 하단 메뉴 아이템 클릭 핸들러
   *
   * @param {Object} item - 클릭된 하단 메뉴 아이템 객체
   *
   * @logic handleItemClick과 동일
   */
  const handleBottomItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div
      className="hidden lg:flex lg:w-[280px] xl:w-[309px] h-screen flex-col bg-white flex-shrink-0 border-r border-gray-200"
      data-sidebar="main"
      role="navigation"
      aria-label="Main Navigation"
    >
      {/*
        로고 영역
        - 브랜드 아이덴티티를 표시
        - 클릭 시 홈으로 이동하는 기능 추가 가능
      */}
      <div className="inline-flex ml-[58px] w-48 h-[50px] relative mt-20 items-center gap-4 flex-shrink-0">
        {/* 로고 아이콘 배경 */}
        <div className="relative w-[50px] h-[50px] bg-main rounded-lg overflow-hidden aspect-[1]">
          <AcademicCap2
            className="!absolute !top-[5px] !left-[5px] !w-10 !h-10 !aspect-[1]"
            color="white"
          />
        </div>

        {/* 서비스 이름 */}
        <div className="[font-family:'Pretendard_Variable-Bold',Helvetica] font-bold text-black text-[32px] tracking-[0] leading-[normal] relative w-fit whitespace-nowrap">
          오늘 한 장
        </div>
      </div>

      {/*
        메뉴 섹션들 - 스크롤 가능 영역
        - menuConfig.js에서 정의된 섹션들을 동적으로 렌더링
        - 각 섹션은 제목과 여러 개의 메뉴 아이템을 포함
      */}
      <div className="flex-1 overflow-y-auto mt-[60px] min-h-0">
        <div className="flex w-[260px] flex-col items-start gap-[52px] pb-8">
          {menuSections.map((section) => (
            <MenuSection
              key={section.id}
              section={section}
              activeItemId={activeItemId}
              onItemClick={handleItemClick}
            />
          ))}
        </div>
      </div>

      {/*
        하단 메뉴 - 하단 고정
        - 설정, FAQ, 요금제, 로그아웃 등 부가 기능
        - 레이아웃: 왼쪽 3개 세로 배치 + 오른쪽 1개 (로그아웃)
      */}
      <div className="inline-flex ml-[35px] w-[190px] h-[92px] relative mb-8 items-end gap-8 flex-shrink-0 border-t border-gray-100 pt-6">
        {/* 왼쪽 그룹: 설정, FAQ, 요금제 (처음 3개) */}
        <div className="flex flex-col w-[86px] items-start gap-4 relative">
          {bottomMenuItems.slice(0, 3).map((item) => (
            <BottomMenuItem
              key={item.id}
              item={item}
              onClick={() => handleBottomItemClick(item)}
            />
          ))}
        </div>

        {/* 오른쪽: 로그아웃 (4번째 아이템) */}
        <BottomMenuItem
          item={bottomMenuItems[3]}
          onClick={() => handleBottomItemClick(bottomMenuItems[3])}
        />
      </div>
    </div>
  );
};

export default Sidebar;
