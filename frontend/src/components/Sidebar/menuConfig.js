/**
 * @file menuConfig.js
 * @description 사이드바 메뉴 설정 파일 - 모든 메뉴 항목과 네비게이션 구조를 정의
 *
 * @author AI Development Team
 * @created 2025-11-09
 *
 * @purpose
 * - 메뉴 구조를 코드에서 분리하여 유지보수성 향상
 * - 메뉴 항목 추가/수정/삭제를 이 파일에서만 관리
 * - 아이콘, 경로, 라벨 등을 한 곳에서 중앙 관리
 *
 * @usage
 * import { menuSections, bottomMenuItems } from './menuConfig';
 *
 * @structure
 * menuSections: 메인 메뉴 섹션들 (학습 관리, 빠른 실행 등)
 * bottomMenuItems: 하단 메뉴 (설정, FAQ, 로그아웃 등)
 */

// ============================================
// 아이콘 컴포넌트 Import
// ============================================
import { AcademicCap2 } from "../../icons/AcademicCap2";
import { IconCalendar1 } from "../../icons/IconCalendar1";
import { IconChartBar1 } from "../../icons/IconChartBar1";
import { IconChat1 } from "../../icons/IconChat1";
import { IconClipboardCheck } from "../../icons/IconClipboardCheck";
import { IconClipboardList1 } from "../../icons/IconClipboardList1";
import { IconCog } from "../../icons/IconCog";
import { IconEmojiHappy1 } from "../../icons/IconEmojiHappy1";
import { IconLogout } from "../../icons/IconLogout";
import { IconSparkles1 } from "../../icons/IconSparkles1";

// ============================================
// 메인 메뉴 섹션 설정
// ============================================

/**
 * @constant menuSections
 * @type {Array<Object>}
 * @description 사이드바의 메인 메뉴 섹션들을 정의
 *
 * @structure
 * [{
 *   id: string,          // 섹션 고유 ID
 *   title: string,       // 섹션 제목
 *   items: [{            // 섹션 내 메뉴 아이템들
 *     id: string,        // 아이템 고유 ID
 *     label: string,     // 화면에 표시될 텍스트
 *     icon: Component,   // 아이콘 컴포넌트
 *     path: string,      // 라우팅 경로
 *     badge?: number     // 배지 숫자 (선택사항)
 *   }]
 * }]
 *
 * @example
 * // 새로운 메뉴 아이템 추가하기
 * {
 *   id: "new-feature",
 *   label: "새 기능",
 *   icon: NewIcon,
 *   path: "/new-feature",
 *   badge: 5  // 선택사항
 * }
 */
export const menuSections = [
  // ============================================
  // 학습 관리 섹션
  // ============================================
  {
    id: "learning",
    title: "학습 관리",
    items: [
      {
        id: "home",
        label: "홈",
        icon: AcademicCap2,
        path: "/",
        // 대시보드, 학습 진행 상황 등을 표시하는 메인 페이지
      },
      {
        id: "blank-review",
        label: "백지복습",
        icon: IconClipboardCheck,
        path: "/blank-review",
        // 백지에 학습 내용을 적으며 복습하는 페이지
      },
      {
        id: "today-learning",
        label: "오늘의 학습",
        icon: IconCalendar1,
        path: "/today-learning",
        badge: 2,
        // 오늘 학습할 항목들을 표시
        // badge: 학습해야 할 항목 개수 (동적으로 업데이트 가능)
      },
      {
        id: "statistics",
        label: "학습 통계",
        icon: IconChartBar1,
        path: "/statistics",
        // 학습 시간, 완료율, 진행 상황 등의 통계를 차트로 표시
      },
    ],
  },

  // ============================================
  // 빠른 실행 섹션
  // ============================================
  {
    id: "quick-actions",
    title: "빠른 실행",
    items: [
      {
        id: "ai-questions",
        label: "AI 문제 생성",
        icon: IconClipboardList1,
        path: "/ai-questions",
        // AI가 학습 내용 기반으로 문제를 자동 생성하는 기능
      },
      {
        id: "ai-tutor",
        label: "AI 튜터 복습이",
        icon: IconSparkles1,
        path: "/ai-tutor",
        // AI 튜터와 대화하며 학습 내용을 복습하는 기능
      },
    ],
  },
];

// ============================================
// 하단 메뉴 아이템 설정
// ============================================

/**
 * @constant bottomMenuItems
 * @type {Array<Object>}
 * @description 사이드바 하단에 표시되는 부가 기능 메뉴들
 *
 * @structure
 * [{
 *   id: string,          // 아이템 고유 ID
 *   label: string,       // 화면에 표시될 텍스트
 *   icon: Component,     // 아이콘 컴포넌트
 *   path?: string,       // 라우팅 경로 (선택사항)
 *   onClick?: Function   // 커스텀 클릭 핸들러 (선택사항)
 * }]
 *
 * @note
 * - path와 onClick 중 하나만 사용
 * - path가 있으면 해당 경로로 라우팅
 * - onClick이 있으면 커스텀 동작 실행 (예: 로그아웃, 모달 열기)
 */
export const bottomMenuItems = [
  {
    id: "settings",
    label: "계정 설정",
    icon: IconCog,
    path: "/settings",
    // 사용자 프로필, 비밀번호 변경, 알림 설정 등
  },
  {
    id: "faq",
    label: "FAQ",
    icon: IconChat1,
    path: "/faq",
    // 자주 묻는 질문과 답변 페이지
  },
  {
    id: "pricing",
    label: "요금제 비교",
    icon: IconEmojiHappy1,
    path: "/pricing",
    // 무료/유료 요금제 비교 및 업그레이드 페이지
  },
  {
    id: "logout",
    label: "로그아웃",
    icon: IconLogout,
    // path가 아닌 onClick 사용
    onClick: () => {
      // ==========================================
      // TODO: 로그아웃 로직 구현
      // ==========================================
      // 1. 로컬 스토리지에서 토큰 제거
      //    localStorage.removeItem('authToken');
      //
      // 2. 백엔드 API 호출 (세션 무효화)
      //    await fetch('/api/auth/logout', { method: 'POST' });
      //
      // 3. 전역 상태 초기화 (Redux/Context 등)
      //    dispatch(clearUserData());
      //
      // 4. 로그인 페이지로 리다이렉트
      //    window.location.href = '/login';
      // ==========================================
      console.log("로그아웃");
    },
  },
];

// ============================================
// 유틸리티 함수 (필요시 추가)
// ============================================

/**
 * @function findMenuItemById
 * @description 메뉴 아이템 ID로 해당 아이템을 찾는 함수
 *
 * @param {string} id - 찾을 메뉴 아이템의 ID
 * @returns {Object|null} 찾은 메뉴 아이템 객체 또는 null
 *
 * @example
 * const homeItem = findMenuItemById('home');
 */
export const findMenuItemById = (id) => {
  // 메인 섹션에서 검색
  for (const section of menuSections) {
    const found = section.items.find((item) => item.id === id);
    if (found) return found;
  }

  // 하단 메뉴에서 검색
  const found = bottomMenuItems.find((item) => item.id === id);
  return found || null;
};

/**
 * @function getAllPaths
 * @description 모든 메뉴 아이템의 경로를 배열로 반환
 *
 * @returns {Array<string>} 모든 메뉴 경로 배열
 *
 * @example
 * const paths = getAllPaths();
 * // ['/', '/blank-review', '/today-learning', ...]
 */
export const getAllPaths = () => {
  const paths = [];

  // 메인 섹션에서 경로 수집
  menuSections.forEach((section) => {
    section.items.forEach((item) => {
      if (item.path) paths.push(item.path);
    });
  });

  // 하단 메뉴에서 경로 수집
  bottomMenuItems.forEach((item) => {
    if (item.path) paths.push(item.path);
  });

  return paths;
};
