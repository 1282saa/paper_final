# 데이터베이스 및 저장소 현황

## 📊 현재 상태 요약

### ✅ 준비된 것
1. **AWS DynamoDB 설계** - 완료
2. **AWS S3 이미지 저장소** - 설정됨
3. **Backend Lambda 함수** - 구현됨
4. **Frontend LocalStorage** - 구현됨 (임시)

### ⏳ 배포 대기 중
- Backend API (Lambda + DynamoDB + S3)

---

## 🗄️ 데이터 저장 구조

### 현재: Frontend만 사용 (LocalStorage)

**위치**: `frontend/src/utils/documentStorage.js`

**저장 방식**: 브라우저 LocalStorage (최대 5-10MB)

**데이터 스키마**:
\`\`\`javascript
{
  id: 1,                          // 문서 ID
  subject: "수학",                 // 과목
  title: "미분의 기본 개념",       // 제목
  tags: ["중간고사", "1학기"],    // 태그
  imageUrl: "blob:...",           // 이미지 URL (브라우저 메모리)
  extractedText: "OCR 텍스트...", // 추출된 텍스트
  savedDate: "2025-01-15T...",   // 저장 날짜
  reviewCount: 0,                 // 복습 횟수
  lastReviewDate: null,          // 마지막 복습 날짜
  reviewHistory: [],             // 복습 히스토리
  nextReviewDate: "2025-01-16T...", // 다음 복습 날짜
  reviewStage: 0                  // 망각곡선 단계 (0-4)
}
\`\`\`

**망각곡선 간격**: `[1, 3, 7, 14, 30]` 일

**한계점**:
- ⚠️ 브라우저 종료 시 이미지 URL 사라짐 (blob:)
- ⚠️ 저장 용량 제한 (5-10MB)
- ⚠️ 다른 기기에서 접근 불가
- ⚠️ 데이터 백업 불가

---

## 🚀 계획된 것: Backend (AWS 서버리스)

### 아키텍처

\`\`\`
사용자
  ↓ 이미지 업로드
Frontend
  ↓ /notes/upload-url (Pre-signed URL 요청)
Lambda: createUploadUrl
  ↓ Pre-signed URL 반환
Frontend
  ↓ S3에 직접 업로드
AWS S3
  ↓ S3 트리거
Lambda: processUpload (자동 실행)
  ↓ AWS Textract (OCR)
  ↓ AWS Bedrock Claude (정제)
  ↓ DynamoDB 저장
AWS DynamoDB
\`\`\`

### 1. AWS S3 (이미지 저장소)

**버킷 이름**: `learning-notes-bucket`

**저장 경로**:
\`\`\`
s3://learning-notes-bucket/
  └── notes/
      └── {userId}/
          └── {noteId}.jpg
\`\`\`

**기능**:
- 이미지 원본 저장
- Pre-signed URL로 보안 업로드
- CloudFront CDN 연동 가능

### 2. AWS DynamoDB (메타데이터 저장소)

**테이블 이름**: `learning-notes-table-dev`

**설계 방식**: Single Table Design (AWS 권장)

#### Primary Key 구조

| 속성 | 타입 | 예시 | 설명 |
|------|------|------|------|
| **PK** | String | `USER#user123` | Partition Key |
| **SK** | String | `NOTE#2025-01-15T...#note001` | Sort Key |

#### 데이터 스키마

##### Note 아이템
\`\`\`json
{
  "PK": "USER#user123",
  "SK": "NOTE#2025-01-15T10:30:00.000Z#note001",
  "Type": "NOTE",
  "noteId": "note001",
  "userId": "user123",
  "title": "수학 노트",
  "subject": "수학",
  "content": "OCR로 추출된 텍스트...",
  "imageUrl": "https://s3.amazonaws.com/learning-notes-bucket/notes/user123/note001.jpg",
  "s3Key": "notes/user123/note001.jpg",
  "metadata": {
    "ocrConfidence": 0.95,
    "fileSize": 1024000,
    "mimeType": "image/jpeg"
  },
  "tags": ["중간고사", "1학기"],
  "isIndexed": true,
  "GSI1PK": "SUBJECT#수학",
  "GSI1SK": "2025-01-15T10:30:00.000Z",
  "createdAt": 1705315800000,
  "updatedAt": 1705315800000,

  // 망각곡선 필드
  "reviewCount": 0,
  "lastReviewDate": null,
  "nextReviewDate": 1705402200000,
  "reviewStage": 0,
  "reviewHistory": []
}
\`\`\`

##### Question 아이템
\`\`\`json
{
  "PK": "NOTE#note001",
  "SK": "QUESTION#2025-01-15T11:00:00.000Z#q001",
  "Type": "QUESTION",
  "questionSetId": "q001",
  "noteId": "note001",
  "userId": "user123",
  "questions": [
    {
      "type": "객관식",
      "question": "이차방정식의 근의 공식은?",
      "options": ["1번", "2번", "3번", "4번"],
      "answer": "2",
      "explanation": "근의 공식은...",
      "difficulty": "보통"
    }
  ],
  "GSI1PK": "USER#user123",
  "GSI1SK": "QUESTION#2025-01-15T11:00:00.000Z",
  "createdAt": 1705317600000
}
\`\`\`

##### Vector 아이템 (RAG용)
\`\`\`json
{
  "PK": "NOTE#note001",
  "SK": "VECTOR#chunk001",
  "Type": "VECTOR",
  "vectorId": "chunk001",
  "noteId": "note001",
  "text": "이차방정식은 ax^2 + bx + c = 0 형태...",
  "embedding": [0.123, -0.456, 0.789, ...], // 1024차원 벡터
  "startIndex": 0,
  "endIndex": 100,
  "createdAt": 1705315800000
}
\`\`\`

#### 인덱스 구조

**Primary Index**:
- PK: Partition Key
- SK: Sort Key

**GSI1 (Global Secondary Index)**:
- GSI1PK: 과목별 조회 (`SUBJECT#수학`)
- GSI1SK: 시간순 정렬

#### 쿼리 패턴

1. **사용자의 모든 노트 조회**:
   \`\`\`javascript
   PK = "USER#user123"
   SK begins_with "NOTE#"
   \`\`\`

2. **특정 노트 상세 조회**:
   \`\`\`javascript
   PK = "NOTE#note001"
   SK = "METADATA"
   \`\`\`

3. **과목별 노트 조회** (GSI1):
   \`\`\`javascript
   GSI1PK = "SUBJECT#수학"
   GSI1SK sort by timestamp
   \`\`\`

4. **특정 노트의 문제 조회**:
   \`\`\`javascript
   PK = "NOTE#note001"
   SK begins_with "QUESTION#"
   \`\`\`

5. **RAG 벡터 조회**:
   \`\`\`javascript
   PK = "NOTE#note001"
   SK begins_with "VECTOR#"
   \`\`\`

### 3. Backend Lambda 함수 (이미 구현됨)

**위치**: `backend/lambda/`

**구현된 함수**:

| 함수 | 경로 | 기능 |
|------|------|------|
| `createUploadUrl` | POST /notes/upload-url | Pre-signed URL 생성 |
| `processUpload` | S3 트리거 | OCR + 저장 |
| `getNotes` | GET /notes | 노트 목록 조회 |
| `getNote` | GET /notes/{noteId} | 노트 상세 조회 |
| `indexNote` | POST /rag/index-note | 벡터 인덱싱 |
| `ragAsk` | POST /rag/ask | RAG 질의응답 |
| `generateQuestions` | POST /questions/generate | AI 문제 생성 |
| `getQuestions` | GET /questions | 문제 조회 |

**서비스 레이어** (`backend/src/services/`):
- ✅ `s3Service.js` - S3 업로드/다운로드
- ✅ `textractService.js` - OCR 처리
- ✅ `bedrockService.js` - Claude LLM
- ✅ `dynamodbService.js` - DynamoDB CRUD
- ✅ `embeddingService.js` - 벡터 임베딩
- ✅ `vectorServiceDynamoDB.js` - RAG 벡터 검색

---

## 💰 비용 산정

### AWS 무료 티어 (12개월)

| 서비스 | 무료 티어 | 초과 시 비용 |
|--------|----------|-------------|
| **S3** | 5GB 저장소, 2만 GET, 2천 PUT | $0.023/GB/월 |
| **DynamoDB** | 25GB 저장소, 25 RCU, 25 WCU | $1.25/백만 RCU |
| **Lambda** | 100만 요청/월, 40만 GB-초/월 | $0.20/백만 요청 |
| **Textract** | 1,000 페이지/월 | $1.50/1,000 페이지 |
| **Bedrock Claude** | 무료 없음 | $3/백만 입력 토큰 |

### 예상 월 비용 (100명 사용 시)

- 사용자: 100명
- 월 이미지 업로드: 1,000장 (사용자당 10장)
- 월 API 호출: 10,000회

| 항목 | 계산 | 비용 |
|------|------|------|
| S3 저장소 | 1,000 * 2MB = 2GB | $0.05 |
| DynamoDB | 10,000 요청 (무료) | $0 |
| Lambda | 10,000 요청 (무료) | $0 |
| Textract | 1,000 페이지 (무료) | $0 |
| Bedrock | ~100,000 토큰 | $0.30 |
| **총계** | | **~$0.35/월** |

**결론**: 무료 티어 내에서 충분히 운영 가능!

---

## 🔄 현재 → Backend 마이그레이션 계획

### Phase 1: Backend 배포 (우선)

1. **DynamoDB 테이블 생성**
   \`\`\`bash
   cd backend
   serverless deploy --stage dev
   \`\`\`

2. **S3 버킷 생성** (이미 존재: `learning-notes-bucket`)

3. **Lambda 함수 배포**
   - 자동으로 배포됨

### Phase 2: Frontend 연동

**변경할 파일**: `frontend/src/utils/documentStorage.js`

**변경 방법**:
\`\`\`javascript
// Before: LocalStorage
const saveDocument = (documentData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
};

// After: Backend API
const saveDocument = async (documentData, imageFile) => {
  // 1. Pre-signed URL 요청
  const urlResponse = await fetch(\`\${API_URL}/notes/upload-url\`, {
    method: 'POST',
    body: JSON.stringify({ fileName: imageFile.name })
  });
  const { uploadUrl, noteId } = await urlResponse.json();

  // 2. S3에 이미지 업로드
  await fetch(uploadUrl, {
    method: 'PUT',
    body: imageFile
  });

  // 3. Lambda가 자동으로 OCR → DynamoDB 저장
  // 4. 노트 ID 반환
  return noteId;
};
\`\`\`

### Phase 3: 데이터 동기화

**옵션 A: 점진적 마이그레이션**
- 새 문서는 Backend에 저장
- 기존 LocalStorage 데이터는 그대로 유지
- 사용자가 수동으로 재업로드

**옵션 B: 일괄 마이그레이션**
- LocalStorage 데이터를 Backend로 일괄 전송
- 마이그레이션 API 생성

---

## 📝 데이터 흐름 비교

### 현재: LocalStorage만 사용

\`\`\`
사용자 → 이미지 업로드
    ↓
Frontend (UploadModal)
    ↓ OCR API (Lambda)
    ↓ 텍스트 추출
    ↓
LocalStorage 저장 (브라우저)
    ↓
DocumentLibrary에서 조회
\`\`\`

**문제점**:
- 이미지가 blob URL로 저장 → 새로고침 시 사라짐
- 다른 기기에서 접근 불가

### 계획: Backend + LocalStorage 하이브리드

\`\`\`
사용자 → 이미지 업로드
    ↓
Frontend
    ↓ POST /notes/upload-url
Lambda: createUploadUrl
    ↓ Pre-signed URL
Frontend
    ↓ PUT to S3
AWS S3 (영구 저장)
    ↓ S3 트리거
Lambda: processUpload
    ↓ Textract OCR
    ↓ Bedrock 정제
    ↓ DynamoDB 저장
Frontend
    ↓ GET /notes
DynamoDB
    ↓ 노트 목록 반환
Frontend (캐싱)
\`\`\`

**장점**:
- ✅ 이미지 영구 저장 (S3)
- ✅ 여러 기기에서 접근
- ✅ 자동 백업
- ✅ RAG 벡터 검색 가능

---

## 🎯 다음 단계

### 즉시 가능

1. **Backend 배포**
   \`\`\`bash
   cd backend
   npm install
   serverless deploy --stage dev
   \`\`\`

2. **API 테스트**
   \`\`\`bash
   curl https://your-api-url/health
   \`\`\`

3. **Frontend 연동**
   - `.env.local`에 API URL 추가
   - `documentStorage.js` 수정

### 추후 고려

1. **인증 추가** (AWS Cognito)
2. **이미지 CDN** (CloudFront)
3. **실시간 동기화** (DynamoDB Streams)
4. **벡터 검색 최적화** (Amazon OpenSearch)

---

## 📚 관련 문서

- `backend/DYNAMODB_DESIGN.md` - DynamoDB 상세 설계
- `backend/DYNAMODB_SETUP_GUIDE.md` - 배포 가이드
- `backend/MIGRATION_TO_DYNAMODB.md` - 마이그레이션 방법
- `backend/serverless.yml` - 인프라 코드
- `frontend/src/utils/documentStorage.js` - 현재 LocalStorage 구현

---

**작성일**: 2025-01-15
**상태**: Backend 준비 완료, Frontend는 LocalStorage 사용 중
**다음 작업**: Backend 배포 → Frontend 연동
