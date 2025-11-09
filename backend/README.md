# 오늘 한 장 - 백엔드

**필기노트 기반 AI 학습 관리 시스템 백엔드**

AWS Bedrock (Claude + Titan Embeddings), Textract, S3를 활용한 서버리스 백엔드

---

## 🎯 핵심 기능

1. **📸 필기노트 업로드 & OCR**
   - 이미지 → AWS Textract → 텍스트 추출
   - S3 저장, MongoDB 메타데이터 관리

2. **🤖 RAG (검색 증강 생성) 기반 질의응답**
   - 학습 노트 벡터화 (Titan Embeddings)
   - 유사도 검색으로 관련 노트 찾기
   - Claude가 노트 기반으로 답변 생성

3. **📝 AI 문제 자동 생성**
   - Claude가 노트 내용 분석
   - 객관식/주관식 문제 생성
   - 정답 및 해설 포함

4. **💬 AI 챗봇 & 튜터**
   - 일반 질의응답
   - 교육 특화 AI 튜터
   - 과목별/난이도별 맞춤 설명

---

## 🏗️ 아키텍처

### 두 가지 배포 방식 지원

#### 1. Express 서버 (로컬 개발)
```
프론트엔드 → Express API → AWS Services
                        → MongoDB
```

#### 2. 서버리스 (프로덕션)
```
프론트엔드 → API Gateway → Lambda Functions → AWS Services
                                            → DynamoDB
```

### 기술 스택

**백엔드:**
- Node.js 18.x + Express
- Mongoose (MongoDB ODM)
- AWS SDK v3

**AWS 서비스:**
- **Bedrock** - Claude Sonnet 4.5 (LLM), Titan Embeddings (벡터화)
- **Textract** - OCR (이미지 → 텍스트)
- **S3** - 이미지 저장
- **Lambda + API Gateway** - 서버리스 배포
- **DynamoDB** - NoSQL 데이터베이스 (서버리스)

**서버리스 도구:**
- Serverless Framework
- serverless-offline (로컬 테스트)

---

## 📁 프로젝트 구조

```
backend/
├── 📂 src/                      # Express 서버 (로컬 개발용)
│   ├── config/                  # 데이터베이스 설정
│   ├── models/                  # MongoDB 스키마 (Note, Question)
│   ├── routes/                  # API 라우트 (chat, notes, rag, questions)
│   ├── services/                # AWS 서비스 연동 (Bedrock, Textract, S3, Embeddings)
│   ├── utils/                   # 유틸리티 (textChunker)
│   └── index.js                 # 서버 진입점
│
├── 📂 lambda/                   # Lambda 핸들러 (서버리스 배포용)
│   ├── health.js                # 헬스체크
│   ├── notes/                   # 노트 업로드 및 OCR
│   ├── rag/                     # RAG 질의응답 (TODO)
│   ├── questions/               # 문제 생성 (TODO)
│   └── chat/                    # 챗봇 (TODO)
│
├── 📂 문서/
│   ├── PROJECT_STRUCTURE.md     # 📚 상세 구조 설명
│   ├── TYPES.md                 # 📋 타입 정의 (데이터 구조)
│   ├── ARCHITECTURE.md          # 🏗️ Express 아키텍처
│   ├── SERVERLESS_ARCHITECTURE.md # ☁️ 서버리스 아키텍처
│   ├── API_GUIDE.md             # 🔌 API 사용 가이드
│   └── DEPLOYMENT_GUIDE.md      # 🚀 배포 가이드
│
├── .env                         # 환경변수 (⚠️ Git 제외)
├── .env.example                 # 환경변수 예시
├── package.json                 # 의존성 및 스크립트
├── serverless.yml               # Serverless Framework 설정
└── README.md                    # 이 파일
```

**📖 각 폴더별 상세 설명:**
- [src/ README](src/README.md)
- [lambda/ README](lambda/README.md)

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env` 파일이 이미 설정되어 있습니다:

⚠️ **중요**: 실제 AWS 자격 증명은 절대 Git에 커밋하지 마세요. `.env` 파일에만 보관하세요.

```env
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here

# S3
S3_BUCKET_NAME=learning-notes-bucket

# Bedrock (Claude Sonnet 4.5)
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-5-20250929-v1:0

# MongoDB
MONGODB_URI=mongodb://localhost:27017/learning-notes
# 또는 MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/learning-notes

# 서버
PORT=3001
NODE_ENV=development
```

### 3. 로컬 개발 서버 실행

```bash
# MongoDB 실행 (로컬)
mongod

# 개발 서버 시작
npm run dev
```

서버: `http://localhost:3001`

### 4. Bedrock 테스트

```bash
node test-bedrock.js
```

---

## 🌐 서버리스 배포

### 사전 준비

1. **S3 버킷 생성** (이미지 저장용)
   ```bash
   aws s3 mb s3://learning-notes-bucket --region us-east-1
   ```

2. **DynamoDB 테이블**
   - Serverless Framework가 자동 생성
   - `serverless.yml`에 정의됨

### 배포 명령

```bash
# 개발 환경
npm run deploy:dev

# 프로덕션
npm run deploy:prod
```

**배포 후 출력 예시:**
```
endpoints:
  GET - https://xxx.execute-api.us-east-1.amazonaws.com/health
  POST - https://xxx.execute-api.us-east-1.amazonaws.com/notes/upload-url
  POST - https://xxx.execute-api.us-east-1.amazonaws.com/rag/ask
  ...
```

자세한 내용: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 📖 문서

### 필수 문서
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - 📁 디렉토리 구조 및 파일 설명
- **[TYPES.md](TYPES.md)** - 📋 데이터 타입 및 인터페이스 정의
- **[API_GUIDE.md](API_GUIDE.md)** - 🔌 API 사용법 및 예시

### 아키텍처 문서
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Express 기반 아키텍처
- **[SERVERLESS_ARCHITECTURE.md](SERVERLESS_ARCHITECTURE.md)** - Lambda 서버리스 아키텍처

### 데이터베이스 가이드
- **[DYNAMODB_DESIGN.md](DYNAMODB_DESIGN.md)** - 🗄️ DynamoDB 테이블 설계
- **[DYNAMODB_SETUP_GUIDE.md](DYNAMODB_SETUP_GUIDE.md)** - 🚀 DynamoDB 설정 및 배포 완벽 가이드

### 배포 가이드
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - 단계별 배포 가이드

---

## 📡 API 엔드포인트 (요약)

### 노트 관리
- `POST /api/notes/upload` - 이미지 업로드 + OCR
- `GET /api/notes` - 노트 목록
- `GET /api/notes/:id` - 노트 상세

### RAG (검색 증강 생성)
- `POST /api/rag/index-note` - 노트 벡터화
- `POST /api/rag/ask` - RAG 기반 질의응답

### 문제 생성
- `POST /api/questions/generate` - 노트 기반 문제 생성
- `GET /api/questions` - 문제 목록

### 채팅
- `POST /api/chat/ask` - 일반 질문
- `POST /api/chat/tutor` - AI 튜터

자세한 API 문서: [API_GUIDE.md](API_GUIDE.md)

---

## 🛠️ 개발 스크립트

```json
{
  "start": "node src/index.js",           // Express 서버 (프로덕션)
  "dev": "nodemon src/index.js",          // Express 서버 (개발 - 자동 재시작)
  "deploy": "serverless deploy",          // Lambda 배포
  "deploy:dev": "serverless deploy --stage dev",
  "deploy:prod": "serverless deploy --stage prod",
  "remove": "serverless remove",          // Lambda 삭제
  "logs": "serverless logs -f",           // Lambda 로그
  "invoke": "serverless invoke -f"        // Lambda 직접 호출
}
```

---

## 🧪 테스트

### Bedrock 연결 테스트

```bash
node test-bedrock.js
```

### API 테스트 (로컬)

```bash
# 헬스체크
curl http://localhost:3001/health

# 채팅
curl -X POST http://localhost:3001/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "안녕하세요"}'
```

### Lambda 로컬 테스트

```bash
serverless invoke local -f health
```

---

## 📊 데이터 모델

### Note (학습 노트)

```javascript
{
  userId: "user123",
  title: "수학 노트",
  subject: "수학",
  content: "OCR로 추출된 텍스트...",
  imageUrl: "https://s3.amazonaws.com/...",
  s3Key: "notes/user123/uuid.jpg",
  chunks: [],              // RAG용 텍스트 청크
  metadata: {
    ocrConfidence: 0.95,   // OCR 신뢰도
    fileSize: 1024000
  },
  tags: ["1학기", "중간고사"],
  isIndexed: false,        // RAG 벡터화 여부
  createdAt: Date,
  updatedAt: Date
}
```

### QuestionSet (문제 세트)

```javascript
{
  noteId: ObjectId,        // 참조 노트
  userId: "user123",
  questions: [
    {
      type: "객관식",
      question: "문제 내용",
      options: ["1번", "2번", "3번", "4번"],
      answer: "1",
      explanation: "해설...",
      difficulty: "보통"
    }
  ],
  createdAt: Date
}
```

전체 타입 정의: [TYPES.md](TYPES.md)

---

## 💡 AI 인덱싱 키워드

**프로젝트 핵심 개념:**
- OCR (Optical Character Recognition)
- RAG (Retrieval-Augmented Generation)
- Vector Search (벡터 검색)
- Embeddings (임베딩, 벡터화)
- AWS Bedrock (Claude, Titan)
- Serverless (Lambda, API Gateway)

**주요 파일:**
- `src/services/bedrockService.js` - Claude AI
- `src/services/textractService.js` - OCR
- `src/services/embeddingService.js` - 벡터화
- `src/services/vectorService.js` - 벡터 검색
- `lambda/notes/processUpload.js` - S3 트리거 OCR

---

## 🔒 보안

- `.env` 파일은 `.gitignore`에 포함 (Git 제외)
- AWS 자격증명은 절대 노출 금지
- API는 CORS 설정 필요 (프로덕션)
- MongoDB는 IP 화이트리스트 설정 권장

---

## 💰 예상 비용 (월 1,000 요청)

- Lambda: $0 (무료 티어)
- API Gateway: $0.004
- S3: $0.023
- Textract: $1.50
- Bedrock (Claude + Embeddings): $30-50
- DynamoDB: $0 (무료 티어 25GB)

**총: 약 $32-52/월**

### DynamoDB 무료 티어
- 25GB 저장소
- 25 RCU/WCU (읽기/쓰기 용량)
- 월 2억 요청까지 무료!

---

## 🐛 트러블슈팅

### DynamoDB 테이블 없음
- `npm run deploy:dev` 실행하여 자동 생성
- AWS 콘솔에서 테이블 확인

### Bedrock 권한 오류
- IAM 사용자에게 `bedrock:InvokeModel` 권한 확인
- Model Access에서 Claude 모델 활성화 확인

### Lambda 타임아웃
- `serverless.yml`에서 `timeout` 값 증가
- 기본 300초 (5분), 최대 900초 (15분)

### DynamoDB AccessDenied
- Lambda IAM 역할에 DynamoDB 권한 확인
- `serverless.yml`의 IAM 설정 확인

---

## 🤝 기여

이 프로젝트는 SW 창업경진대회 출품작입니다.

---

## 📝 라이선스

SW 창업경진대회 출품작
