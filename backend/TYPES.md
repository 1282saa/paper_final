# 타입 정의 및 데이터 구조

AI 인덱싱 및 개발 효율성을 위한 타입 시스템 문서

## 📋 목차

- [데이터베이스 모델](#데이터베이스-모델)
- [API 요청/응답 타입](#api-요청응답-타입)
- [서비스 타입](#서비스-타입)
- [유틸리티 타입](#유틸리티-타입)

---

## 데이터베이스 모델

### Note (학습 노트)

```typescript
interface Note {
  _id: ObjectId;                    // MongoDB ID
  userId: string;                   // 사용자 ID
  title: string;                    // 노트 제목
  subject?: string;                 // 과목 (선택)
  content: string;                  // OCR로 추출된 전체 텍스트
  imageUrl: string;                 // S3 이미지 URL
  s3Key: string;                    // S3 객체 키 (예: "notes/user123/uuid.jpg")
  chunks: NoteChunk[];              // RAG를 위한 텍스트 청크
  metadata: NoteMetadata;           // 메타데이터
  tags: string[];                   // 태그 배열
  isIndexed: boolean;               // RAG 인덱싱 완료 여부
  createdAt: Date;                  // 생성 시간
  updatedAt: Date;                  // 수정 시간
}

interface NoteChunk {
  text: string;                     // 청크 텍스트
  vectorId?: string;                // 벡터 DB ID
  startIndex?: number;              // 원본 텍스트 시작 위치
  endIndex?: number;                // 원본 텍스트 종료 위치
}

interface NoteMetadata {
  uploadDate: Date;                 // 업로드 날짜
  ocrConfidence: number;            // OCR 신뢰도 (0.0 ~ 1.0)
  pageCount: number;                // 페이지 수 (기본 1)
  fileSize?: number;                // 파일 크기 (bytes)
  mimeType?: string;                // MIME 타입 (예: "image/jpeg")
}
```

**사용 예시:**
```javascript
// 노트 생성
const note = new Note({
  userId: "user123",
  title: "수학 노트",
  subject: "수학",
  content: "이차방정식의 근의 공식은...",
  imageUrl: "https://s3.amazonaws.com/...",
  s3Key: "notes/user123/uuid.jpg",
  metadata: {
    ocrConfidence: 0.95,
    fileSize: 1024000
  },
  tags: ["1학기", "중간고사"]
});
```

### QuestionSet (문제 세트)

```typescript
interface QuestionSet {
  _id: ObjectId;                    // MongoDB ID
  noteId: ObjectId;                 // 참조 노트 ID
  userId: string;                   // 사용자 ID
  title?: string;                   // 문제 세트 제목
  subject?: string;                 // 과목
  questions: QuestionItem[];        // 문제 배열
  metadata: QuestionMetadata;       // 메타데이터
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionItem {
  type: "객관식" | "주관식" | "OX" | "단답형";  // 문제 유형
  question: string;                 // 문제 내용
  options?: string[];               // 객관식 선택지 (객관식만)
  answer: string;                   // 정답
  explanation?: string;             // 해설
  difficulty: "쉬움" | "보통" | "어려움";  // 난이도
  points: number;                   // 배점 (기본 10)
}

interface QuestionMetadata {
  totalQuestions: number;           // 총 문제 수
  difficulty: string;               // 전체 난이도
  estimatedTime?: number;           // 예상 소요 시간 (분)
}
```

**사용 예시:**
```javascript
const questionSet = new QuestionSet({
  noteId: noteId,
  userId: "user123",
  questions: [
    {
      type: "객관식",
      question: "이차방정식의 근의 공식은?",
      options: ["x = ...", "x = ...", "x = ...", "x = ..."],
      answer: "1",
      explanation: "근의 공식은...",
      difficulty: "보통",
      points: 10
    }
  ]
});
```

---

## API 요청/응답 타입

### 공통 응답 형식

```typescript
interface APIResponse<T = any> {
  success: boolean;                 // 성공 여부
  data?: T;                         // 성공 시 데이터
  error?: string;                   // 실패 시 에러 메시지
}

interface PaginatedResponse<T> extends APIResponse<{
  items: T[];
  pagination: Pagination;
}> {}

interface Pagination {
  total: number;                    // 전체 아이템 수
  page: number;                     // 현재 페이지
  limit: number;                    // 페이지당 아이템 수
  totalPages: number;               // 전체 페이지 수
}
```

### 노트 API

```typescript
// POST /api/notes/upload
interface UploadNoteRequest {
  image: File;                      // (FormData) 이미지 파일
  title: string;                    // 노트 제목
  subject?: string;                 // 과목
  tags?: string;                    // 쉼표로 구분된 태그
  userId?: string;                  // 사용자 ID (기본: "test-user")
}

interface UploadNoteResponse extends APIResponse<{
  noteId: string;
  title: string;
  subject?: string;
  extractedText: string;            // OCR로 추출된 텍스트
  textLength: number;               // 텍스트 길이
  ocrConfidence: number;            // OCR 신뢰도
  imageUrl: string;                 // S3 이미지 URL
  createdAt: string;                // ISO 8601 날짜
}> {}

// GET /api/notes
interface GetNotesRequest {
  userId?: string;
  subject?: string;                 // 과목 필터
  page?: number;                    // 페이지 번호 (기본: 1)
  limit?: number;                   // 페이지당 개수 (기본: 10)
}

interface GetNotesResponse extends PaginatedResponse<Note> {}
```

### RAG API

```typescript
// POST /api/rag/index-note
interface IndexNoteRequest {
  noteId: string;                   // 벡터화할 노트 ID
}

interface IndexNoteResponse extends APIResponse<{
  message: string;
  chunkCount: number;               // 생성된 청크 수
}> {}

// POST /api/rag/ask
interface RAGAskRequest {
  question: string;                 // 질문
  noteIds?: string[];               // 특정 노트만 검색 (선택)
  userId?: string;
  topK?: number;                    // 반환할 청크 수 (기본: 3)
}

interface RAGAskResponse extends APIResponse<{
  question: string;
  answer: string;                   // Claude의 답변
  sources: RAGSource[];             // 참고한 소스들
}> {}

interface RAGSource {
  noteId: string;
  noteTitle: string;
  subject?: string;
  relevantText: string;             // 관련 텍스트 일부
  similarity: number;               // 유사도 (0.0 ~ 1.0)
}
```

### 문제 생성 API

```typescript
// POST /api/questions/generate
interface GenerateQuestionsRequest {
  noteId: string;                   // 노트 ID
  count?: number;                   // 생성할 문제 수 (기본: 5)
  questionType?: "객관식" | "주관식" | "OX" | "단답형";
  difficulty?: "쉬움" | "보통" | "어려움";
  userId?: string;
}

interface GenerateQuestionsResponse extends APIResponse<{
  questionSetId: string;
  noteId: string;
  noteTitle: string;
  questionType: string;
  count: number;
  difficulty: string;
  questions: QuestionItem[];
  createdAt: string;
}> {}
```

### 채팅 API

```typescript
// POST /api/chat/ask
interface ChatAskRequest {
  question: string;
  options?: ChatOptions;
}

interface ChatOptions {
  temperature?: number;             // 0.0 ~ 1.0 (기본: 1.0)
  max_tokens?: number;              // 최대 토큰 수 (기본: 4096)
  system?: string;                  // 시스템 프롬프트
}

interface ChatAskResponse extends APIResponse<{
  question: string;
  answer: string;
  timestamp: string;
}> {}

// POST /api/chat/tutor
interface ChatTutorRequest {
  question: string;
  subject?: string;                 // 과목
  difficulty?: string;              // 난이도
}
```

---

## 서비스 타입

### Bedrock Service

```typescript
interface BedrockServiceMethods {
  /**
   * Claude에게 질문
   * @param question 질문 텍스트
   * @param options 옵션 (temperature, max_tokens, system)
   * @returns Claude의 답변 텍스트
   */
  askQuestion(question: string, options?: ChatOptions): Promise<string>;
}
```

### Textract Service

```typescript
interface TextractResult {
  text: string;                     // 전체 추출 텍스트
  lines: string[];                  // 라인별 텍스트
  confidence: number;               // 평균 신뢰도 (0.0 ~ 1.0)
  blockCount: number;               // 총 블록 수
}

interface TextractServiceMethods {
  /**
   * 이미지에서 텍스트 추출
   * @param imageBuffer 이미지 버퍼
   * @returns OCR 결과
   */
  extractTextFromImage(imageBuffer: Buffer): Promise<TextractResult>;

  /**
   * S3 이미지에서 텍스트 추출
   * @param bucketName S3 버킷 이름
   * @param objectKey S3 객체 키
   * @returns OCR 결과
   */
  extractTextFromS3(bucketName: string, objectKey: string): Promise<TextractResult>;
}
```

### S3 Service

```typescript
interface S3UploadResult {
  s3Key: string;                    // S3 객체 키
  imageUrl: string;                 // 공개 URL
  bucket: string;                   // 버킷 이름
}

interface S3ServiceMethods {
  /**
   * S3에 이미지 업로드
   * @param fileBuffer 파일 버퍼
   * @param fileName 파일명
   * @param mimeType MIME 타입
   * @param userId 사용자 ID
   * @returns 업로드 결과
   */
  uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: string
  ): Promise<S3UploadResult>;

  /**
   * S3에서 이미지 가져오기
   * @param s3Key S3 객체 키
   * @returns 이미지 버퍼
   */
  getImage(s3Key: string): Promise<Buffer>;
}
```

### Embedding Service

```typescript
interface EmbeddingServiceMethods {
  /**
   * 텍스트를 벡터로 변환
   * @param text 임베딩할 텍스트
   * @returns 1024차원 벡터
   */
  embedText(text: string): Promise<number[]>;

  /**
   * 배치 임베딩
   * @param texts 텍스트 배열
   * @returns 벡터 배열
   */
  embedBatch(texts: string[]): Promise<number[][]>;

  /**
   * 코사인 유사도 계산
   * @param vecA 벡터 A
   * @param vecB 벡터 B
   * @returns 유사도 (0.0 ~ 1.0)
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number;
}
```

### Vector Service

```typescript
interface VectorSearchResult {
  vectorId: string;                 // 벡터 ID
  noteId: string;                   // 노트 ID
  chunkIndex: number;               // 청크 인덱스
  text: string;                     // 텍스트
  similarity: number;               // 유사도 (0.0 ~ 1.0)
}

interface VectorServiceMethods {
  /**
   * 노트 벡터화
   * @param noteId 노트 ID
   * @param chunks 텍스트 청크 배열
   * @returns 벡터 ID 배열
   */
  indexNoteChunks(noteId: string, chunks: string[]): Promise<string[]>;

  /**
   * 유사 벡터 검색
   * @param query 검색 쿼리
   * @param topK 반환할 개수
   * @param filters 필터 옵션
   * @returns 검색 결과
   */
  search(
    query: string,
    topK?: number,
    filters?: { noteIds?: string[] }
  ): Promise<VectorSearchResult[]>;

  /**
   * 노트 벡터 삭제
   * @param noteId 노트 ID
   * @returns 삭제된 벡터 수
   */
  deleteNoteVectors(noteId: string): number;

  /**
   * 통계 조회
   * @returns 벡터 저장소 통계
   */
  getStats(): { totalVectors: number; uniqueNotes: number };
}
```

---

## 유틸리티 타입

### Text Chunker

```typescript
interface TextChunkerMethods {
  /**
   * 길이 기반 청킹
   * @param text 원본 텍스트
   * @param maxChunkSize 최대 청크 크기 (문자 수)
   * @param overlap 청크 간 중복 크기
   * @returns 청크 배열
   */
  chunkByLength(
    text: string,
    maxChunkSize?: number,
    overlap?: number
  ): string[];

  /**
   * 문장 기반 청킹
   * @param text 원본 텍스트
   * @param sentencesPerChunk 청크당 문장 수
   * @returns 청크 배열
   */
  chunkBySentences(text: string, sentencesPerChunk?: number): string[];

  /**
   * 문단 기반 청킹
   * @param text 원본 텍스트
   * @returns 청크 배열
   */
  chunkByParagraphs(text: string): string[];

  /**
   * 자동 최적 청킹
   * @param text 원본 텍스트
   * @param maxChunkSize 최대 청크 크기
   * @returns 청크 배열
   */
  autoChunk(text: string, maxChunkSize?: number): string[];
}
```

---

## Lambda 이벤트 타입

### API Gateway 이벤트

```typescript
interface APIGatewayEvent {
  body: string;                     // JSON 문자열
  headers: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  pathParameters?: Record<string, string>;
  requestContext: {
    requestId: string;
    // ...
  };
}
```

### S3 이벤트

```typescript
interface S3Event {
  Records: S3Record[];
}

interface S3Record {
  s3: {
    bucket: {
      name: string;                 // 버킷 이름
    };
    object: {
      key: string;                  // 객체 키
      size: number;                 // 파일 크기
    };
  };
}
```

---

## 환경변수 타입

```typescript
interface EnvironmentVariables {
  // AWS
  AWS_REGION: string;               // 예: "us-east-1"
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;

  // S3
  S3_BUCKET_NAME: string;           // 예: "learning-notes-bucket"

  // Bedrock
  BEDROCK_MODEL_ID: string;         // 예: "us.anthropic.claude-sonnet-4-5..."

  // MongoDB
  MONGODB_URI: string;              // 예: "mongodb+srv://..."

  // 서버
  PORT?: string;                    // 예: "3001"
  NODE_ENV?: "development" | "production";
  STAGE?: "dev" | "prod";
}
```

---

## 사용 예시

### TypeScript 프로젝트에서 사용

```typescript
// types/index.d.ts 파일 생성
import { Note, QuestionSet } from './models';
import { APIResponse, PaginatedResponse } from './api';

// 타입 안전성 확보
const response: APIResponse<Note> = await fetch('/api/notes/123');
```

### JSDoc으로 타입 힌트

```javascript
/**
 * 노트 업로드
 * @param {UploadNoteRequest} request
 * @returns {Promise<UploadNoteResponse>}
 */
async function uploadNote(request) {
  // IDE가 자동완성 제공
}
```

---

## 💡 AI 인덱싱 키워드

이 문서의 주요 키워드:
- **Note**: 학습 노트 모델
- **QuestionSet**: 문제 세트 모델
- **APIResponse**: 공통 응답 형식
- **VectorSearchResult**: RAG 검색 결과
- **TextractResult**: OCR 결과
- **EmbeddingService**: 벡터화 서비스
- **VectorService**: 벡터 검색 서비스
