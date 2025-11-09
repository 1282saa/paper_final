# 학습 노트 관리 시스템 아키텍처

## 시스템 개요

필기노트 업로드 → 텍스트 추출 → 저장 → RAG 기반 질의응답 + 문제 생성

## 핵심 기능

### 1. 필기노트 업로드 & 텍스트 추출
- **입력**: 이미지 파일 (JPG, PNG 등)
- **처리**: OCR (Optical Character Recognition)
- **출력**: 추출된 텍스트

### 2. 텍스트 문서 저장
- **저장소**: 파일 시스템 + 메타데이터 DB
- **구조화**: 과목별, 날짜별, 주제별 분류

### 3. RAG (Retrieval-Augmented Generation) 시스템
- **벡터화**: 저장된 텍스트를 임베딩으로 변환
- **검색**: 질문과 관련된 문서 검색
- **생성**: 검색된 문서를 컨텍스트로 Claude가 답변 생성

### 4. 문제 생성
- **입력**: 저장된 학습 노트
- **처리**: Claude가 노트 내용 기반 문제 생성
- **출력**: 객관식/주관식 문제 + 정답 + 해설

## 기술 스택 제안

### A. AWS 기반 (추천)
```
필기노트 이미지
    ↓
[Amazon Textract] - OCR (한글 지원 우수)
    ↓
텍스트 추출
    ↓
[Amazon Bedrock - Titan Embeddings] - 벡터 임베딩
    ↓
[Amazon OpenSearch / FAISS] - 벡터 저장 & 검색
    ↓
[Amazon Bedrock - Claude] - RAG 답변 생성
```

**장점:**
- AWS 생태계 통합
- Textract: 한글 OCR 성능 우수
- Bedrock: Claude + Titan Embeddings 한 곳에서 사용
- 스케일링 용이

**비용:**
- Textract: 이미지 1,000장당 $1.50
- Bedrock Embeddings: 입력 1M 토큰당 $0.10
- OpenSearch Serverless: 시간당 약 $0.24

### B. 오픈소스 기반 (저비용)
```
필기노트 이미지
    ↓
[Tesseract OCR / EasyOCR] - 무료 OCR
    ↓
텍스트 추출
    ↓
[Amazon Bedrock - Titan Embeddings]
or [OpenAI Embeddings]
or [로컬 모델: sentence-transformers]
    ↓
[FAISS / Chroma / Pinecone] - 벡터 DB
    ↓
[Amazon Bedrock - Claude] - RAG 답변 생성
```

**장점:**
- 비용 절감
- 커스터마이징 가능

**단점:**
- OCR 성능이 AWS Textract보다 낮음 (특히 한글 손글씨)
- 인프라 관리 필요

## 추천 아키텍처 (하이브리드)

```
┌─────────────────┐
│  프론트엔드      │
│  (React)        │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│         Express 백엔드 (Node.js)        │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  1. 이미지 업로드 API          │    │
│  │     - Multer로 파일 수신       │    │
│  │     - S3 업로드 (원본 보관)    │    │
│  └────────┬───────────────────────┘    │
│           ↓                              │
│  ┌────────────────────────────────┐    │
│  │  2. OCR 처리                   │    │
│  │     - AWS Textract 호출        │    │
│  │     - 텍스트 추출              │    │
│  └────────┬───────────────────────┘    │
│           ↓                              │
│  ┌────────────────────────────────┐    │
│  │  3. 문서 저장                  │    │
│  │     - MongoDB/PostgreSQL       │    │
│  │     - 메타데이터 저장          │    │
│  └────────┬───────────────────────┘    │
│           ↓                              │
│  ┌────────────────────────────────┐    │
│  │  4. 벡터 임베딩                │    │
│  │     - Bedrock Titan Embeddings │    │
│  │     - FAISS에 벡터 저장        │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  5. RAG 질의응답 API           │    │
│  │     - FAISS 유사도 검색        │    │
│  │     - Claude에 컨텍스트 전달   │    │
│  │     - 답변 생성                │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  6. 문제 생성 API              │    │
│  │     - 저장된 노트 조회         │    │
│  │     - Claude로 문제 생성       │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│         외부 서비스                      │
│  - AWS Textract (OCR)                   │
│  - AWS Bedrock (Claude + Embeddings)    │
│  - AWS S3 (이미지 저장)                 │
│  - MongoDB/PostgreSQL (메타데이터)      │
│  - FAISS (벡터 검색)                    │
└─────────────────────────────────────────┘
```

## 데이터베이스 스키마 (MongoDB 예시)

```javascript
// 학습 노트 컬렉션
{
  _id: ObjectId,
  userId: String,           // 사용자 ID
  title: String,            // 노트 제목
  subject: String,          // 과목 (예: "수학", "영어")
  content: String,          // OCR로 추출된 텍스트
  imageUrl: String,         // S3 원본 이미지 URL
  chunks: [                 // 텍스트 청크 (RAG용)
    {
      text: String,
      embedding: Array,     // 벡터 임베딩 (선택사항)
      vectorId: String      // FAISS 벡터 ID
    }
  ],
  metadata: {
    uploadDate: Date,
    ocrConfidence: Number,  // OCR 신뢰도
    pageCount: Number
  },
  tags: [String],           // 태그 (예: ["중간고사", "1학기"])
  createdAt: Date,
  updatedAt: Date
}

// 생성된 문제 컬렉션
{
  _id: ObjectId,
  noteId: ObjectId,         // 참조 노트
  userId: String,
  questions: [
    {
      type: String,         // "객관식" | "주관식"
      question: String,
      options: [String],    // 객관식 선택지
      answer: String,
      explanation: String,
      difficulty: String    // "쉬움" | "보통" | "어려움"
    }
  ],
  createdAt: Date
}
```

## API 엔드포인트 설계

### 1. 노트 업로드 & OCR
```
POST /api/notes/upload
Content-Type: multipart/form-data

Request:
- file: 이미지 파일
- title: 노트 제목
- subject: 과목
- tags: 태그 배열

Response:
{
  "success": true,
  "data": {
    "noteId": "...",
    "extractedText": "...",
    "ocrConfidence": 0.95
  }
}
```

### 2. 노트 목록 조회
```
GET /api/notes?subject=수학&page=1&limit=10

Response:
{
  "success": true,
  "data": {
    "notes": [...],
    "total": 50,
    "page": 1
  }
}
```

### 3. RAG 기반 질의응답
```
POST /api/chat/ask-with-context

Request:
{
  "question": "이차방정식의 근의 공식은?",
  "noteIds": ["noteId1", "noteId2"],  // 특정 노트 지정 (선택)
  "subject": "수학"  // 또는 과목별 검색
}

Response:
{
  "success": true,
  "data": {
    "answer": "...",
    "sources": [  // 참고한 노트들
      {
        "noteId": "...",
        "title": "...",
        "relevantChunk": "..."
      }
    ]
  }
}
```

### 4. 노트 기반 문제 생성
```
POST /api/questions/generate

Request:
{
  "noteId": "...",
  "count": 5,
  "questionType": "객관식",
  "difficulty": "보통"
}

Response:
{
  "success": true,
  "data": {
    "questions": [...]
  }
}
```

## 구현 단계 (우선순위)

### Phase 1: MVP (최소 기능)
1. ✅ Claude 연동 완료
2. 이미지 업로드 (Multer)
3. OCR (AWS Textract 또는 EasyOCR)
4. 텍스트 저장 (MongoDB/파일시스템)
5. 저장된 텍스트 기반 문제 생성

### Phase 2: RAG 구현
1. 텍스트 청킹 (문단/문장 단위 분리)
2. 벡터 임베딩 (Bedrock Titan Embeddings)
3. 벡터 DB 구축 (FAISS)
4. 유사도 검색 구현
5. RAG 기반 질의응답

### Phase 3: 고도화
1. 손글씨 OCR 정확도 개선
2. 멀티모달 (이미지 + 텍스트 동시 분석)
3. 문제 난이도 자동 조정
4. 학습 진도 추적
5. 개인화된 복습 스케줄링

## 비용 예측 (월간 사용자 100명 기준)

- 노트 업로드: 100명 × 10장 = 1,000장/월
  - Textract: $1.50
- 벡터 임베딩: 1,000 노트 × 1,000 토큰 = 1M 토큰
  - Bedrock Embeddings: $0.10
- Claude 호출: 10,000 요청 × 평균 2,000 토큰
  - Bedrock Claude: 약 $30-50
- 저장소: S3 + MongoDB
  - 약 $5-10

**총 예상 비용: 월 $50-100**

## 다음 단계

1. OCR 방식 결정 (AWS Textract vs 오픈소스)
2. 데이터베이스 선택 (MongoDB vs PostgreSQL)
3. 벡터 DB 선택 (FAISS vs OpenSearch vs Pinecone)
4. 구현 시작

어떤 방향으로 진행하시겠습니까?
