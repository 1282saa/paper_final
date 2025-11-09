/**
 * @file index.jsx
 * @description 애플리케이션 진입점 (Entry Point) - React 앱을 DOM에 마운트
 *
 * @author AI Development Team
 * @created 2025-11-09
 *
 * @purpose
 * - React 애플리케이션을 HTML DOM에 렌더링
 * - StrictMode를 통한 개발 시 잠재적 문제 감지
 * - 전체 앱의 시작점 역할
 *
 * @dependencies
 * - react: React 라이브러리
 * - react-dom/client: React 18+ DOM 렌더링
 * - App: 메인 애플리케이션 컴포넌트
 *
 * @flow
 * 1. HTML에서 id="app"인 DOM 요소를 찾음
 * 2. 해당 요소에 React root 생성
 * 3. App 컴포넌트를 StrictMode로 감싸서 렌더링
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

/**
 * React 18의 createRoot API를 사용하여 앱을 렌더링
 *
 * @constant root
 * @description DOM에 React 앱을 마운트하는 루트
 *
 * @note
 * - StrictMode: 개발 모드에서만 동작하며 다음을 체크합니다:
 *   1. 안전하지 않은 생명주기 메서드 사용
 *   2. 레거시 string ref API 사용
 *   3. 권장되지 않는 findDOMNode 사용
 *   4. 예상치 못한 부작용 감지
 *   5. 레거시 context API 사용
 *
 * @see https://react.dev/reference/react/StrictMode
 */
createRoot(document.getElementById("app")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
