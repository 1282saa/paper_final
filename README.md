# 오늘 한 장 - 학습 관리 시스템

Figma 디자인을 기반으로 제작된 React 학습 관리 시스템의 사이드바 컴포넌트입니다.

## 프로젝트 구조

```
final/
├── src/
│   ├── components/
│   │   └── Sidebar/
│   │       ├── Sidebar.jsx        # 메인 사이드바 컴포넌트
│   │       ├── menuConfig.js      # 메뉴 설정 파일
│   │       └── index.js           # Export 파일
│   ├── icons/                     # 아이콘 컴포넌트들
│   ├── pages/                     # 페이지 컴포넌트들
│   │   ├── Home.jsx
│   │   ├── BlankReview.jsx
│   │   ├── TodayLearning.jsx
│   │   ├── Statistics.jsx
│   │   ├── AIQuestions.jsx
│   │   └── AITutor.jsx
│   ├── App.jsx                    # 메인 App 컴포넌트
│   └── index.jsx                  # 진입점
├── index.html
├── package.json
├── tailwind.config.js
├── tailwind.css
└── vite.config.js
```

## 설치 및 실행

### 1. 의존성 설치

```bash
cd "/Users/yeong-gwang/Documents/배움 오전 1.38.42/외부/공모전/sw 창업경진/final"
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 빌드

```bash
npm run build
```

## 주요 기능

### 사이드바 컴포넌트 (Sidebar)

- **재사용 가능한 구조**: 컴포넌트 기반으로 설계되어 쉽게 커스터마이징 가능
- **React Router 통합**: 페이지 네비게이션 자동 처리
- **활성 상태 관리**: 현재 경로에 따라 자동으로 메뉴 아이템 활성화
- **배지 시스템**: 알림 개수 표시 기능
- **모듈화된 메뉴 설정**: `menuConfig.js`에서 메뉴 항목 관리

### 메뉴 구성

#### 학습 관리
- 홈
- 백지복습
- 오늘의 학습 (배지 표시)
- 학습 통계

#### 빠른 실행
- AI 문제 생성
- AI 튜터 복습이

#### 하단 메뉴
- 계정 설정
- FAQ
- 요금제 비교
- 로그아웃

## 커스터마이징

### 메뉴 항목 수정

`src/components/Sidebar/menuConfig.js` 파일에서 메뉴 항목을 쉽게 추가/수정할 수 있습니다:

```javascript
export const menuSections = [
  {
    id: "learning",
    title: "학습 관리",
    items: [
      {
        id: "home",
        label: "홈",
        icon: AcademicCap2,
        path: "/",
      },
      // 새로운 메뉴 항목 추가
    ],
  },
];
```

### 색상 테마 수정

`tailwind.css` 파일의 CSS 변수를 수정하여 색상 테마를 변경할 수 있습니다:

```css
:root {
  --basewhite: rgba(255, 255, 255, 1);
  --main: rgba(0, 194, 136, 1);        /* 메인 컬러 (그린) */
  --second: rgba(241, 112, 109, 1);    /* 세컨더리 컬러 (레드) */
  --sub-1: rgba(33, 33, 47, 1);
  --sub-2: rgba(229, 249, 255, 1);
}
```

## 사용된 기술 스택

- **React 18.2.0**: UI 라이브러리
- **React Router DOM 6.8.1**: 클라이언트 사이드 라우팅
- **Tailwind CSS 3.4.16**: 유틸리티 우선 CSS 프레임워크
- **Vite 6.0.4**: 빌드 도구 및 개발 서버
- **Pretendard Variable Font**: 한글 웹폰트

## 컴포넌트 사용 예시

### App.jsx에서 Sidebar 사용

```javascript
import { Sidebar } from "./components/Sidebar";

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        {/* 메인 콘텐츠 */}
      </main>
    </div>
  );
}
```

### 새로운 페이지 추가

1. `src/pages/` 폴더에 새 페이지 컴포넌트 생성
2. `src/components/Sidebar/menuConfig.js`에 메뉴 항목 추가
3. `src/App.jsx`에 라우트 추가

```javascript
// App.jsx
import NewPage from "./pages/NewPage";

<Routes>
  <Route path="/new-page" element={<NewPage />} />
</Routes>
```

## 라이선스

이 프로젝트는 Figma 디자인을 기반으로 제작되었으며, SW 창업경진대회 출품작입니다.
