# Frontend - AI 학습 노트 관리 시스템

## 📋 개요

React 기반 학습 노트 관리 프론트엔드 애플리케이션

**기술 스택**: React 18.2 + Vite 6.0 + TailwindCSS 3.4

---

## 📁 폴더 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Sidebar/        # 사이드바 네비게이션
│   ├── UploadModal/    # 이미지 업로드 & OCR 모달
│   ├── DocumentCard.jsx  # 문서 카드
│   └── ReviewCard.jsx    # 복습 카드 (망각곡선)
│
├── pages/              # 라우팅 페이지
│   ├── Home.jsx            # 대시보드 (통계, 복습)
│   ├── DocumentLibrary.jsx # 문서 라이브러리
│   ├── AIQuestionGenerator.jsx  # AI 문제 생성
│   └── MyPage.jsx          # 마이페이지
│
├── utils/              # 유틸리티 함수
│   ├── documentStorage.js  # LocalStorage 관리
│   └── ocrAPI.js           # OCR API 호출
│
├── icons/              # SVG 아이콘 컴포넌트
├── App.jsx             # 메인 앱 컴포넌트 (라우터)
└── main.jsx            # 진입점
```

---

## 🎨 주요 컴포넌트 설명

### 1. `components/Sidebar/`

**파일**:
- `Sidebar.jsx` - 메인 사이드바 컨테이너
- `menuConfig.js` - 메뉴 설정 데이터

**기능**:
- 네비게이션 메뉴 (홈, 라이브러리, AI 문제, 마이페이지)
- 과목별 필터 (전체, 수학, 과학, 영어 등)
- 통계 표시 (총 문서 수, 이번 주 추가된 문서)

**주요 Props**:
```javascript
<Sidebar
  activeMenu="홈"           // 현재 활성 메뉴
  onMenuClick={handleMenu}  // 메뉴 클릭 핸들러
  selectedSubject="전체"    // 선택된 과목
  onSubjectChange={handleSubject}  // 과목 변경 핸들러
/>
```

---

### 2. `components/UploadModal/`

**파일**:
- `UploadModal.jsx` - 메인 모달 컨테이너
- `StepIndicator.jsx` - 진행 상태 표시
- `ImageUploadStep.jsx` - 이미지 업로드 UI
- `OCRProcessingStep.jsx` - OCR 처리 중 UI
- `DocumentInfoStep.jsx` - 문서 정보 입력 UI

**기능**:
1. 이미지 드래그 앤 드롭 업로드
2. OCR 자동 처리 (AWS Textract + Bedrock)
3. 진행률 표시 (0% → 100%)
4. 문서 정보 입력 (제목, 과목, 태그)
5. LocalStorage 저장

**데이터 플로우**:
```
이미지 업로드
  ↓
processOCRWithLLM() 호출 (ocrAPI.js)
  ↓ POST /api/ocr-llm
AWS Lambda (OCR Service)
  ↓ Textract (OCR)
  ↓ Bedrock Claude (정제)
  ↓ 결과 반환 {original, processed}
Frontend
  ↓ extractedText 설정
  ↓ saveDocument() (documentStorage.js)
LocalStorage
```

**사용 예시**:
```javascript
<UploadModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={(document) => console.log('저장됨:', document)}
/>
```

---

### 3. `components/DocumentCard.jsx`

**기능**:
- 문서 카드 UI (제목, 과목, 날짜, 태그)
- 클릭 시 상세 보기
- 삭제 버튼

**Props**:
```javascript
<DocumentCard
  document={{
    id: 1,
    title: "미분의 기본 개념",
    subject: "수학",
    tags: ["중간고사"],
    savedDate: "2025-01-15T...",
    imageUrl: "blob:..."
  }}
  onClick={handleClick}
  onDelete={handleDelete}
/>
```

---

### 4. `components/ReviewCard.jsx`

**기능**:
- 복습 카드 UI (망각곡선 기반)
- 복습 우선순위 표시 (긴급, 중요, 권장, 선택)
- 복습 완료 버튼

**망각곡선 간격**:
- Stage 0: 1일 후
- Stage 1: 3일 후
- Stage 2: 7일 후
- Stage 3: 14일 후
- Stage 4: 30일 후

**Props**:
```javascript
<ReviewCard
  document={{
    id: 1,
    title: "미분의 기본 개념",
    subject: "수학",
    priority: { level: "urgent", label: "긴급", color: "red" },
    nextReviewDate: "2025-01-16T..."
  }}
  onReview={handleReview}
/>
```

---

## 📄 주요 페이지 설명

### 1. `pages/Home.jsx`

**경로**: `/`

**기능**:
- 통계 카드 (총 문서, 이번 주 추가, 복습 예정)
- 오늘 복습할 문서 목록
- 최근 업로드한 문서 목록
- 이미지 업로드 카드

**주요 컴포넌트**:
- `ImageUploadCard` - 업로드 버튼
- `ReviewStartCard` - 복습 시작 카드
- `DocumentCard` - 문서 카드 목록

---

### 2. `pages/DocumentLibrary.jsx`

**경로**: `/library`

**기능**:
- 전체 문서 목록 표시
- 과목별 필터링
- 검색 기능 (제목, 내용)
- 정렬 (최신순, 오래된순)

**필터링 로직**:
```javascript
// 과목 필터
const filtered = selectedSubject === "전체"
  ? documents
  : documents.filter(doc => doc.subject === selectedSubject);

// 검색
const searched = filtered.filter(doc =>
  doc.title.includes(searchTerm) ||
  doc.extractedText.includes(searchTerm)
);
```

---

### 3. `pages/AIQuestionGenerator.jsx`

**경로**: `/questions`

**기능**:
- 문서 선택
- AI 문제 생성 (Claude Sonnet 4.5)
- 문제 유형: 객관식, 주관식, 서술형
- 난이도 선택: 쉬움, 보통, 어려움
- 문제 개수 선택: 1-10개

**API 호출**:
```javascript
const result = await generateQuestions(
  doc.extractedText,    // 문서 내용
  doc.subject,          // 과목
  "medium",             // 난이도
  3                     // 문제 개수
);

// 결과
{
  success: true,
  questions: [{
    id: 1,
    question: "문제 내용",
    type: "multiple-choice",
    options: ["1번", "2번", "3번", "4번"],
    answer: "2번",
    explanation: "해설"
  }]
}
```

---

### 4. `pages/MyPage.jsx`

**경로**: `/mypage`

**기능**:
- 사용자 프로필 (이름, 이메일)
- 학습 통계 (총 문서, 복습 횟수)
- 설정 (알림, 테마)

---

## 🛠️ 유틸리티 함수

### 1. `utils/documentStorage.js`

**목적**: LocalStorage 기반 문서 관리

**주요 함수**:

#### `getAllDocuments()`
모든 문서 가져오기
```javascript
const documents = getAllDocuments();
// 반환: [{ id, title, subject, extractedText, savedDate, ... }]
```

#### `saveDocument(documentData)`
새 문서 저장
```javascript
const newDoc = saveDocument({
  subject: "수학",
  title: "미분의 기본 개념",
  tags: ["중간고사"],
  imageUrl: "blob:...",
  extractedText: "OCR 텍스트..."
});
```

#### `recordReview(id, score)`
복습 완료 기록
```javascript
// 복습 완료 → reviewStage 증가 → nextReviewDate 업데이트
recordReview(1, 5);  // id=1, score=5점
```

#### `getTodayReviewDocuments()`
오늘 복습할 문서 조회
```javascript
const todayReviews = getTodayReviewDocuments();
// 반환: nextReviewDate <= 오늘인 문서 목록
```

#### `getDocumentsBySubject(subject)`
과목별 문서 조회
```javascript
const mathDocs = getDocumentsBySubject("수학");
```

**망각곡선 로직**:
```javascript
const reviewIntervals = [1, 3, 7, 14, 30];  // 일 단위

// 복습 완료 시
doc.reviewStage = Math.min(doc.reviewStage + 1, 4);  // 최대 Stage 4
const nextInterval = reviewIntervals[doc.reviewStage];
doc.nextReviewDate = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000);
```

---

### 2. `utils/ocrAPI.js`

**목적**: OCR Lambda API 호출

**환경 변수**:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// 개발: http://localhost:8000 (mock)
// 프로덕션: https://3asa7jtr4j.execute-api.ap-northeast-2.amazonaws.com/dev
```

**주요 함수**:

#### `processOCR(imageInput, onProgress)`
단순 OCR (텍스트만 추출)
```javascript
const result = await processOCR(imageFile, (progress) => {
  console.log(`진행률: ${progress}%`);
});

// 결과
{
  success: true,
  text: "추출된 텍스트",
  confidence: 0.95,
  character_count: 245,
  line_count: 15
}
```

#### `processOCRWithLLM(imageInput, onProgress)`
OCR + LLM 정제 (추천)
```javascript
const result = await processOCRWithLLM(imageFile, (progress) => {
  console.log(`진행률: ${progress}%`);
});

// 결과
{
  success: true,
  original: {
    text: "원본 OCR 텍스트",
    confidence: 0.92
  },
  processed: {
    title: "자동 생성된 제목",
    content: "정제된 텍스트 (오타 수정, 구조화)"
  }
}
```

#### `generateQuestions(text, subject, difficulty, count)`
AI 문제 생성
```javascript
const result = await generateQuestions(
  "미분의 정의는...",
  "수학",
  "medium",
  3
);

// 결과
{
  success: true,
  questions: [{
    id: 1,
    question: "문제 내용",
    type: "multiple-choice",
    difficulty: "medium",
    options: [...],
    answer: "정답",
    explanation: "해설"
  }]
}
```

**Dev/Prod 자동 전환**:
```javascript
const IS_DEV = import.meta.env.DEV;

if (IS_DEV && !API_BASE_URL.includes("amazonaws")) {
  // 개발 모드: Mock 데이터 반환
  return { success: true, text: "Mock OCR 결과..." };
} else {
  // 프로덕션: 실제 Lambda 호출
  const response = await fetch(`${API_BASE_URL}/api/ocr`, {...});
  return await response.json();
}
```

---

## 🎯 환경 변수

**파일**: `.env.local`

```bash
# AWS Lambda OCR API
VITE_API_BASE_URL=https://3asa7jtr4j.execute-api.ap-northeast-2.amazonaws.com/dev
```

**사용법**:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const isDev = import.meta.env.DEV;
```

---

## 🚀 실행 방법

### 개발 서버
```bash
npm run dev
# http://localhost:5174
```

### 프로덕션 빌드
```bash
npm run build
# dist/ 폴더 생성
```

### 프리뷰
```bash
npm run preview
# 빌드 결과물 미리보기
```

---

## 📦 주요 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `react` | 18.2.0 | UI 라이브러리 |
| `react-router-dom` | 6.22.1 | 라우팅 |
| `vite` | 6.0.4 | 빌드 도구 |
| `tailwindcss` | 3.4.16 | CSS 프레임워크 |
| `lucide-react` | 0.469.0 | 아이콘 |
| `date-fns` | 4.1.0 | 날짜 유틸리티 |

---

## 🔧 주요 설정 파일

### `vite.config.js`
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
```

### `tailwind.config.js`
```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",  // 파란색
        secondary: "#10b981"  // 초록색
      }
    }
  }
}
```

---

## 📝 다음 단계

1. **Backend API 연동** (선택사항)
   - LocalStorage → DynamoDB + S3 마이그레이션
   - `documentStorage.js` 수정

2. **인증 추가** (추후)
   - AWS Cognito
   - 로그인/회원가입 페이지

3. **실시간 동기화** (추후)
   - WebSocket
   - DynamoDB Streams

---

**작성일**: 2025-01-15
**프레임워크**: React 18 + Vite 6
**스타일**: TailwindCSS 3
