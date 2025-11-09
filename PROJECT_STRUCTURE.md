# 프로젝트 구조 설명

## 📁 전체 구조 개요

```
final/
├── frontend/          # React 프론트엔드 (Vite)
├── backend/           # Node.js Lambda 백엔드 (Serverless Framework)
├── ocr-service/       # Python OCR Lambda (Serverless Framework)
├── DATABASE_SCHEMA_STATUS.md    # 데이터베이스 스키마 문서
├── DEPLOYMENT_COMPLETE.md       # OCR 서비스 배포 완료 문서
└── TEST_RESULTS.md              # 테스트 결과 문서
```

---

## 🎨 Frontend (`/frontend`)

**기술 스택**: React 18 + Vite + TailwindCSS

### 폴더 구조

```
frontend/
├── src/
│   ├── components/      # 재사용 가능한 React 컴포넌트
│   ├── pages/          # 라우팅 페이지 컴포넌트
│   ├── utils/          # 유틸리티 함수 (API, 저장소)
│   ├── assets/         # 이미지, 아이콘 등 정적 파일
│   ├── App.jsx         # 메인 앱 컴포넌트
│   └── main.jsx        # 진입점
├── public/             # 정적 파일 (favicon 등)
├── dist/               # 빌드 결과물
├── .env.local          # 환경 변수 (API URL)
├── package.json        # 의존성 패키지
├── vite.config.js      # Vite 설정
└── tailwind.config.js  # TailwindCSS 설정
```

### 주요 파일 설명

#### `src/components/` - 컴포넌트

| 폴더/파일 | 설명 | 주요 기능 |
|----------|------|----------|
| `Sidebar/` | 사이드바 네비게이션 | 메뉴, 과목 필터 |
| `UploadModal/` | 이미지 업로드 모달 | OCR 처리, 문서 저장 |
| `DocumentCard.jsx` | 문서 카드 | 문서 목록 표시 |
| `ReviewCard.jsx` | 복습 카드 | 망각곡선 기반 복습 |

#### `src/pages/` - 페이지

| 파일 | 경로 | 설명 |
|------|------|------|
| `Home.jsx` | `/` | 홈 대시보드 (통계, 복습 카드) |
| `DocumentLibrary.jsx` | `/library` | 문서 라이브러리 (목록, 검색) |
| `AIQuestionGenerator.jsx` | `/questions` | AI 문제 생성 |
| `MyPage.jsx` | `/mypage` | 마이페이지 (프로필, 설정) |

#### `src/utils/` - 유틸리티

| 파일 | 설명 | 주요 함수 |
|------|------|----------|
| `documentStorage.js` | LocalStorage 문서 관리 | `saveDocument()`, `getAllDocuments()`, `recordReview()` |
| `ocrAPI.js` | OCR API 호출 | `processOCR()`, `processOCRWithLLM()`, `generateQuestions()` |

#### 환경 변수 (`.env.local`)

```bash
# AWS Lambda OCR API
VITE_API_BASE_URL=https://3asa7jtr4j.execute-api.ap-northeast-2.amazonaws.com/dev
```

---

## 🖥️ Backend (`/backend`)

**기술 스택**: Node.js 18 + AWS Lambda + DynamoDB + S3

### 폴더 구조

```
backend/
├── src/
│   ├── config/         # AWS 설정 (S3, DynamoDB, Bedrock 클라이언트)
│   ├── services/       # 비즈니스 로직 레이어
│   ├── models/         # 데이터 모델 (TypeScript 타입)
│   ├── routes/         # API 라우터 (로컬 서버용)
│   └── utils/          # 공통 유틸리티
├── lambda/
│   ├── health.js       # 헬스체크 엔드포인트
│   ├── notes/          # 노트 관련 Lambda 함수
│   ├── questions/      # 문제 생성 Lambda 함수
│   ├── rag/            # RAG 벡터 검색 Lambda 함수
│   └── chat/           # AI 튜터 챗봇 Lambda 함수
├── scripts/            # 배포 스크립트
├── .env                # 환경 변수
├── serverless.yml      # Serverless Framework 설정
└── package.json        # 의존성 패키지
```

### Lambda 함수 목록

#### Notes (노트 관리)

| 함수 | 엔드포인트 | 설명 |
|------|----------|------|
| `createUploadUrl` | `POST /notes/upload-url` | S3 Pre-signed URL 생성 |
| `processUpload` | S3 트리거 | 이미지 업로드 시 자동 OCR 처리 |
| `getNotes` | `GET /notes` | 사용자 노트 목록 조회 |
| `getNote` | `GET /notes/{noteId}` | 노트 상세 조회 |

#### RAG (벡터 검색)

| 함수 | 엔드포인트 | 설명 |
|------|----------|------|
| `indexNote` | `POST /rag/index-note` | 노트 벡터화 (임베딩) |
| `ragAsk` | `POST /rag/ask` | RAG 기반 질의응답 |

#### Questions (문제 생성)

| 함수 | 엔드포인트 | 설명 |
|------|----------|------|
| `generateQuestions` | `POST /questions/generate` | AI 문제 생성 |
| `getQuestions` | `GET /questions` | 문제 목록 조회 |

#### Chat (AI 튜터)

| 함수 | 엔드포인트 | 설명 |
|------|----------|------|
| `chatAsk` | `POST /chat/ask` | 일반 챗봇 |
| `chatTutor` | `POST /chat/tutor` | AI 튜터 (RAG 기반) |

### 서비스 레이어 (`src/services/`)

| 파일 | 설명 | 주요 메서드 |
|------|------|------------|
| `s3Service.js` | S3 업로드/다운로드 | `generatePresignedUrl()`, `uploadFile()` |
| `textractService.js` | OCR 처리 | `extractText()` |
| `bedrockService.js` | Claude LLM | `generateText()`, `generateQuestions()` |
| `dynamodbService.js` | DynamoDB CRUD | `putNote()`, `getNote()`, `queryNotes()` |
| `embeddingService.js` | 텍스트 임베딩 | `createEmbedding()` (Titan Embeddings) |
| `vectorServiceDynamoDB.js` | RAG 벡터 검색 | `indexDocument()`, `search()` |

### 환경 변수 (`.env`)

⚠️ **중요**: 실제 AWS 자격 증명은 절대 Git에 커밋하지 마세요. `.env` 파일에만 보관하세요.

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here

S3_BUCKET_NAME=learning-notes-bucket
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-5-20250929-v1:0
DYNAMODB_TABLE_NAME=learning-notes-table-dev

PORT=3001
NODE_ENV=development
```

---

## 🔍 OCR Service (`/ocr-service`)

**기술 스택**: Python 3.12 + AWS Lambda + Textract + Bedrock

### 폴더 구조

```
ocr-service/
├── handler.py              # Lambda 핸들러 (OCR, 문제 생성)
├── textract_ocr.py         # AWS Textract OCR 모듈
├── bedrock_llm.py          # AWS Bedrock Claude 모듈
├── note_llm_postprocessor.py  # LLM 텍스트 정제 (레거시)
├── requirements.txt        # Python 패키지
├── serverless.yml          # Serverless Framework 설정
├── package.json            # Serverless 플러그인
├── .env                    # 환경 변수
└── DEPLOY_TEXTRACT.md      # 배포 가이드
```

### Lambda 함수 목록

| 함수 | 엔드포인트 | 설명 |
|------|----------|------|
| `processOCR` | `POST /api/ocr` | 이미지 → 텍스트 추출 (Textract) |
| `generateQuestions` | `POST /api/generate-questions` | 텍스트 → AI 문제 생성 (Claude) |
| `processOCRWithLLM` | `POST /api/ocr-llm` | OCR + LLM 통합 처리 |

### 주요 파일 설명

#### `handler.py` - Lambda 핸들러

```python
"""
AWS Lambda Handler - OCR 및 AI 문제 생성 서버리스 함수

주요 함수:
1. process_ocr() - 이미지 → 텍스트 추출
2. generate_questions() - 텍스트 → AI 문제 생성
3. process_ocr_with_llm() - OCR + LLM 통합
"""
```

#### `textract_ocr.py` - AWS Textract OCR

```python
"""
AWS Textract OCR 모듈

주요 클래스:
- TextractOCR: Textract 클라이언트 래퍼

주요 메서드:
- detect_handwriting(image_bytes): 손글씨 인식
  → 반환: {full_text, confidence, character_count, line_count}
"""
```

#### `bedrock_llm.py` - AWS Bedrock Claude

```python
"""
AWS Bedrock LLM 모듈 (Claude Sonnet 4.5)

주요 클래스:
- BedrockLLM: Bedrock 클라이언트 래퍼

주요 메서드:
- postprocess_text(raw_text): OCR 텍스트 정제
- generate_questions(text, subject, difficulty, count): AI 문제 생성
"""
```

### 환경 변수 (`.env`)

```bash
# AWS 자격 증명 (로컬 테스트용)
# Lambda 배포 시에는 IAM 역할 자동 사용
OUTPUT_DIRECTORY=output

# ✅ OpenAI API 키 불필요 - AWS Bedrock 사용!
```

---

## 📊 데이터 흐름

### 1. 이미지 업로드 → OCR → 저장

```
사용자
  ↓ 이미지 업로드
Frontend (UploadModal)
  ↓ POST /api/ocr-llm
OCR Service Lambda
  ↓ AWS Textract (OCR)
  ↓ AWS Bedrock Claude (정제)
  ↓ 결과 반환
Frontend
  ↓ LocalStorage 저장
브라우저
```

### 2. AI 문제 생성

```
사용자
  ↓ 문제 생성 요청
Frontend (AIQuestionGenerator)
  ↓ POST /api/generate-questions
OCR Service Lambda
  ↓ AWS Bedrock Claude
  ↓ 문제 생성
  ↓ JSON 반환
Frontend
  ↓ 화면 표시
```

### 3. Backend RAG (계획됨, 미배포)

```
사용자
  ↓ 질문 입력
Frontend
  ↓ POST /rag/ask
Backend Lambda
  ↓ Vector Search (DynamoDB)
  ↓ AWS Bedrock Claude (RAG)
  ↓ 답변 생성
Frontend
```

---

## 🔑 주요 설정 파일

### Frontend

#### `vite.config.js`
```javascript
// Vite 빌드 설정
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: 'dist' }
})
```

#### `tailwind.config.js`
```javascript
// TailwindCSS 설정
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} }
}
```

### Backend

#### `serverless.yml`
```yaml
# Serverless Framework 설정
service: learning-notes-api
provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
functions:
  # Lambda 함수 정의...
resources:
  # DynamoDB 테이블, S3 버킷 정의...
```

### OCR Service

#### `serverless.yml`
```yaml
# Serverless Framework 설정
service: ai-learning-ocr
provider:
  name: aws
  runtime: python3.12
  region: ap-northeast-2  # 서울 리전
functions:
  # OCR Lambda 함수 정의...
```

---

## 🚀 배포 및 실행

### Frontend

```bash
# 개발 서버 실행
cd frontend
npm run dev          # http://localhost:5174

# 프로덕션 빌드
npm run build        # dist/ 폴더 생성
```

### Backend (미배포)

```bash
# Lambda 배포
cd backend
serverless deploy --stage dev

# 로컬 테스트
serverless offline start
```

### OCR Service (✅ 배포됨)

```bash
# Lambda 배포
cd ocr-service
serverless deploy --stage dev

# 로그 확인
serverless logs -f processOCR -t
```

---

## 📝 문서 위치

| 문서 | 위치 | 설명 |
|------|------|------|
| 데이터베이스 스키마 | `/DATABASE_SCHEMA_STATUS.md` | DynamoDB 스키마, LocalStorage 구조 |
| OCR 배포 완료 | `/DEPLOYMENT_COMPLETE.md` | OCR 서비스 배포 결과 |
| 테스트 결과 | `/TEST_RESULTS.md` | API 테스트 결과 |
| Backend 아키텍처 | `/backend/ARCHITECTURE.md` | Backend 설계 문서 |
| Backend DynamoDB | `/backend/DYNAMODB_DESIGN.md` | DynamoDB 상세 설계 |
| OCR 배포 가이드 | `/ocr-service/DEPLOY_TEXTRACT.md` | OCR 배포 방법 |

---

## 🎯 다음 단계

1. **Backend 배포** (선택사항)
   ```bash
   cd backend
   serverless deploy --stage dev
   ```

2. **Frontend-Backend 연동** (선택사항)
   - LocalStorage → DynamoDB + S3 마이그레이션
   - `documentStorage.js` 수정

3. **인증 추가** (추후)
   - AWS Cognito 연동

---

**작성일**: 2025-01-15
**프로젝트**: AI 학습 노트 관리 시스템
**기술 스택**: React + AWS Lambda + DynamoDB + Textract + Bedrock
