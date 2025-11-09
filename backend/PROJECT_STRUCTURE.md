# 프로젝트 구조 및 파일 설명

## 📁 전체 디렉토리 구조

```
backend/
├── src/                        # Express 서버 소스 코드 (로컬 개발용)
│   ├── config/                 # 설정 파일들
│   ├── models/                 # MongoDB 스키마 정의
│   ├── routes/                 # API 라우트 핸들러
│   ├── services/               # 비즈니스 로직 및 외부 서비스 연동
│   ├── utils/                  # 유틸리티 함수들
│   └── index.js                # Express 서버 진입점
│
├── lambda/                     # AWS Lambda 핸들러 (서버리스 배포용)
│   ├── health.js               # 헬스체크
│   ├── notes/                  # 노트 관련 Lambda
│   ├── rag/                    # RAG 관련 Lambda
│   ├── questions/              # 문제 생성 Lambda
│   └── chat/                   # 채팅 Lambda
│
├── .env                        # 환경변수 (보안 정보)
├── .env.example                # 환경변수 예시
├── .gitignore                  # Git 제외 파일
├── package.json                # Node.js 의존성 및 스크립트
├── serverless.yml              # Serverless Framework 설정
│
└── 문서/
    ├── README.md               # 프로젝트 개요
    ├── ARCHITECTURE.md         # Express 아키텍처 설명
    ├── SERVERLESS_ARCHITECTURE.md  # 서버리스 아키텍처 설명
    ├── API_GUIDE.md            # API 사용 가이드
    ├── DEPLOYMENT_GUIDE.md     # 배포 가이드
    └── PROJECT_STRUCTURE.md    # 이 파일
```

---

## 📂 src/ - Express 서버 (로컬 개발)

### src/config/
**목적**: 데이터베이스 연결 등 애플리케이션 설정

- `database.js`: MongoDB 연결 설정
  - MongoDB Atlas 또는 로컬 MongoDB 연결
  - 연결 상태 로깅
  - 에러 핸들링

### src/models/
**목적**: MongoDB 데이터 구조 정의 (Mongoose 스키마)

- `Note.js`: 학습 노트 모델
  ```javascript
  {
    userId: String,        // 사용자 ID
    title: String,         // 노트 제목
    subject: String,       // 과목
    content: String,       // OCR로 추출된 텍스트
    imageUrl: String,      // S3 이미지 URL
    s3Key: String,         // S3 객체 키
    chunks: [],            // 벡터화를 위한 텍스트 청크
    metadata: {},          // OCR 신뢰도 등
    tags: [String],        // 태그
    isIndexed: Boolean     // RAG 인덱싱 여부
  }
  ```

- `Question.js`: 생성된 문제 모델
  ```javascript
  {
    noteId: ObjectId,      // 참조 노트
    userId: String,        // 사용자 ID
    questions: [{          // 문제 배열
      type: String,        // 객관식/주관식
      question: String,    // 문제 내용
      options: [String],   // 선택지
      answer: String,      // 정답
      explanation: String  // 해설
    }]
  }
  ```

### src/routes/
**목적**: HTTP 요청을 처리하는 라우트 정의

- `chat.js`: 채팅 API
  - `/api/chat/ask` - 일반 질문
  - `/api/chat/tutor` - AI 튜터
  - `/api/chat/generate-questions` - 문제 생성 (구버전)

- `notes.js`: 노트 관리 API
  - `POST /api/notes/upload` - 이미지 업로드 + OCR
  - `GET /api/notes` - 노트 목록
  - `GET /api/notes/:noteId` - 노트 상세
  - `DELETE /api/notes/:noteId` - 노트 삭제

- `rag.js`: RAG (검색 증강 생성) API
  - `POST /api/rag/index-note` - 노트 벡터화
  - `POST /api/rag/ask` - RAG 기반 질의응답
  - `GET /api/rag/stats` - 벡터 저장소 통계

- `questions.js`: 문제 생성 API
  - `POST /api/questions/generate` - 노트 기반 문제 생성
  - `GET /api/questions` - 문제 목록
  - `GET /api/questions/:id` - 문제 상세

### src/services/
**목적**: 외부 서비스 연동 및 핵심 비즈니스 로직

- `bedrockService.js`: AWS Bedrock (Claude) 연동
  - Claude Sonnet 4.5 모델 호출
  - 텍스트 생성 (질의응답, 문제 생성)
  - 프롬프트 엔지니어링

- `textractService.js`: AWS Textract OCR 서비스
  - 이미지에서 텍스트 추출
  - 신뢰도 계산
  - S3 이미지 직접 처리 지원

- `s3Service.js`: AWS S3 파일 저장
  - 이미지 업로드
  - Pre-signed URL 생성 (서버리스)
  - 파일 다운로드

- `embeddingService.js`: Bedrock Titan Embeddings
  - 텍스트 → 벡터 변환 (1024차원)
  - 배치 임베딩
  - 코사인 유사도 계산

- `vectorService.js`: 벡터 검색 엔진
  - 메모리 기반 벡터 저장소
  - 유사도 검색 (RAG 핵심)
  - 벡터 CRUD

### src/utils/
**목적**: 재사용 가능한 유틸리티 함수

- `textChunker.js`: 텍스트 분할 (청킹)
  - 길이 기반 청킹
  - 문장 기반 청킹
  - 문단 기반 청킹
  - 자동 최적 청킹

### src/index.js
**목적**: Express 서버 진입점

- 미들웨어 설정 (CORS, JSON 파싱)
- 라우트 등록
- MongoDB 연결
- 서버 시작

---

## 📂 lambda/ - AWS Lambda (서버리스 배포)

### lambda/health.js
**목적**: API 상태 확인

- 간단한 헬스체크 엔드포인트
- 서버 응답 시간 확인용

### lambda/notes/
**목적**: 노트 업로드 및 OCR 처리

- `createUploadUrl.js`: S3 Pre-signed URL 생성
  - 프론트엔드가 S3에 직접 업로드할 URL 제공
  - Lambda 10MB 제한 우회
  - 메타데이터 포함

- `processUpload.js`: S3 트리거 OCR
  - S3에 이미지 업로드되면 자동 실행
  - Textract OCR 처리
  - MongoDB에 저장

- `getNotes.js`: 노트 목록 조회 (TODO)
- `getNote.js`: 노트 상세 조회 (TODO)

### lambda/rag/
**목적**: RAG 시스템

- `indexNote.js`: 노트 벡터화 (TODO)
  - 텍스트 청킹
  - Titan Embeddings
  - DynamoDB/S3에 벡터 저장

- `ask.js`: RAG 질의응답 (TODO)
  - 질문 벡터화
  - 유사 벡터 검색
  - Claude에 컨텍스트 전달
  - 답변 생성

### lambda/questions/
**목적**: AI 문제 생성

- `generate.js`: 노트 기반 문제 생성 (TODO)
  - 노트 내용 조회
  - Claude로 문제 생성
  - MongoDB에 저장

- `getQuestions.js`: 문제 조회 (TODO)

### lambda/chat/
**목적**: 일반 채팅

- `ask.js`: 일반 질문 (TODO)
- `tutor.js`: AI 튜터 (TODO)

---

## 🔧 설정 파일

### .env
**목적**: 환경변수 (절대 Git에 커밋하지 말 것!)

```env
# AWS 자격증명
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# S3
S3_BUCKET_NAME=learning-notes-bucket

# Bedrock 모델
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-5-20250929-v1:0

# MongoDB
MONGODB_URI=mongodb+srv://...

# 서버
PORT=3001
NODE_ENV=development
```

### serverless.yml
**목적**: Serverless Framework 배포 설정

- Lambda 함수 정의
- API Gateway 라우트
- IAM 권한
- 환경변수
- 플러그인 설정

### package.json
**목적**: Node.js 프로젝트 설정

```json
{
  "scripts": {
    "start": "node src/index.js",        // Express 서버 실행
    "dev": "nodemon src/index.js",       // 개발 모드
    "deploy": "serverless deploy",       // Lambda 배포
    "deploy:dev": "...",                 // 개발 환경 배포
    "deploy:prod": "..."                 // 프로덕션 배포
  }
}
```

---

## 🔄 데이터 흐름

### 1. 노트 업로드 (서버리스)

```
프론트엔드
  → Lambda (createUploadUrl) → Pre-signed URL 생성
  → 프론트엔드가 S3에 직접 업로드
  → S3 트리거
  → Lambda (processUpload) → Textract OCR
  → MongoDB 저장
```

### 2. RAG 질의응답

```
사용자 질문
  → Lambda (indexNote) → 텍스트 청킹
  → Titan Embeddings → 벡터 저장 (DynamoDB/S3)
  → Lambda (ask) → 질문 벡터화
  → 유사 벡터 검색
  → Claude에 컨텍스트 전달
  → 답변 생성
```

### 3. 문제 생성

```
노트 선택
  → Lambda (generate) → 노트 내용 조회
  → Claude로 문제 생성 프롬프트
  → JSON 파싱
  → MongoDB 저장
```

---

## 🎯 각 계층의 역할

### Models (데이터 계층)
- MongoDB 스키마 정의
- 데이터 유효성 검사
- 인덱스 설정

### Services (비즈니스 로직 계층)
- 외부 API 호출 (AWS 서비스)
- 복잡한 비즈니스 로직
- 재사용 가능한 함수

### Routes (API 계층)
- HTTP 요청 처리
- 입력 검증
- 응답 포맷팅

### Lambda (서버리스 계층)
- Routes와 동일한 역할 (서버리스 환경)
- 이벤트 기반 처리 (S3 트리거 등)
- 상태 비저장 (stateless)

### Utils (유틸리티 계층)
- 공통 헬퍼 함수
- 데이터 변환
- 알고리즘

---

## 📝 코딩 컨벤션

### 파일명
- camelCase: `bedrockService.js`
- 복수형: `routes/notes.js` (여러 엔드포인트)
- 단수형: `models/Note.js` (하나의 모델)

### 함수명
- 동사로 시작: `createUploadUrl()`, `getNotes()`
- camelCase 사용

### 주석
- JSDoc 스타일 사용
- 모든 export 함수에 설명 추가
- 복잡한 로직은 인라인 주석

### 에러 처리
- try-catch 사용
- 의미 있는 에러 메시지
- 클라이언트 친화적 응답

---

## 🚀 개발 vs 프로덕션

### 로컬 개발 (Express)
```bash
npm run dev
# http://localhost:3001
```

- 빠른 테스트
- 디버깅 용이
- MongoDB 로컬 또는 Atlas

### 서버리스 배포 (Lambda)
```bash
npm run deploy:dev
# https://xxx.execute-api.us-east-1.amazonaws.com
```

- 자동 스케일링
- 비용 최적화
- MongoDB Atlas 필수

---

## 📚 다음 단계

1. ✅ 기본 구조 완성
2. ⏳ 나머지 Lambda 핸들러 구현
3. ⏳ DynamoDB 벡터 저장소 구현
4. ⏳ 프론트엔드 연동
5. ⏳ 테스트 코드 작성
6. ⏳ CI/CD 파이프라인

---

## 💡 AI 인덱싱을 위한 핵심 키워드

- **OCR**: `textractService.js`, `processUpload.js`
- **RAG**: `ragRoutes.js`, `vectorService.js`, `embeddingService.js`
- **문제생성**: `questions/generate.js`, `bedrockService.js`
- **벡터검색**: `vectorService.js`, `embeddingService.js`
- **파일업로드**: `s3Service.js`, `createUploadUrl.js`
- **데이터베이스**: `models/`, `config/database.js`
- **AI**: `bedrockService.js` (Claude, Titan)
