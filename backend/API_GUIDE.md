# 오늘 한 장 - API 가이드

## 개요

필기노트 업로드, OCR, RAG 기반 질의응답, AI 문제 생성 기능을 제공하는 백엔드 API

## 시작하기

### 1. MongoDB 실행

```bash
# MongoDB가 설치되어 있다면
mongod --dbpath=/path/to/data
```

### 2. 환경변수 설정

`.env` 파일이 이미 설정되어 있습니다.

### 3. 서버 실행

```bash
npm run dev
```

서버는 `http://localhost:3001`에서 실행됩니다.

## API 엔드포인트

### 기본 엔드포인트

#### 헬스체크
```
GET /health
```

**응답:**
```json
{
  "status": "ok",
  "message": "오늘 한 장 백엔드 서버가 정상 작동중입니다.",
  "timestamp": "2025-11-09T06:00:00.000Z"
}
```

---

## 1. 노트 관리 API (`/api/notes`)

### 1.1 노트 업로드 (이미지 → OCR)

**핵심 기능**: 필기노트 이미지를 업로드하면 자동으로 OCR 처리하여 텍스트 추출

```
POST /api/notes/upload
Content-Type: multipart/form-data
```

**요청 (FormData):**
- `image` (file, required): 이미지 파일
- `title` (string, required): 노트 제목
- `subject` (string, optional): 과목
- `tags` (string, optional): 태그 (쉼표로 구분)
- `userId` (string, optional): 사용자 ID (기본값: "test-user")

**응답:**
```json
{
  "success": true,
  "data": {
    "noteId": "67891234abc...",
    "title": "수학 노트",
    "subject": "수학",
    "extractedText": "추출된 전체 텍스트...",
    "textLength": 1234,
    "ocrConfidence": 0.95,
    "imageUrl": "https://s3.amazonaws.com/...",
    "createdAt": "2025-11-09T06:00:00.000Z"
  }
}
```

**curl 예시:**
```bash
curl -X POST http://localhost:3001/api/notes/upload \
  -F "image=@/path/to/image.jpg" \
  -F "title=수학 노트" \
  -F "subject=수학" \
  -F "tags=1학기,중간고사"
```

### 1.2 노트 목록 조회

```
GET /api/notes?userId=test-user&subject=수학&page=1&limit=10
```

**쿼리 파라미터:**
- `userId`: 사용자 ID (기본값: "test-user")
- `subject`: 과목 필터 (optional)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 개수 (기본값: 10)

**응답:**
```json
{
  "success": true,
  "data": {
    "notes": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### 1.3 노트 상세 조회

```
GET /api/notes/:noteId
```

**응답:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "수학 노트",
    "subject": "수학",
    "content": "전체 텍스트 내용...",
    "imageUrl": "...",
    "metadata": {...},
    "chunks": [...]
  }
}
```

### 1.4 노트 삭제

```
DELETE /api/notes/:noteId
```

---

## 2. RAG (검색 증강 생성) API (`/api/rag`)

### 2.1 노트 인덱싱 (벡터화)

**핵심 기능**: 노트를 벡터화하여 RAG 검색이 가능하도록 인덱싱

```
POST /api/rag/index-note
```

**요청:**
```json
{
  "noteId": "67891234abc..."
}
```

**응답:**
```json
{
  "success": true,
  "message": "노트가 성공적으로 인덱싱되었습니다.",
  "chunkCount": 5
}
```

**curl 예시:**
```bash
curl -X POST http://localhost:3001/api/rag/index-note \
  -H "Content-Type: application/json" \
  -d '{"noteId":"67891234abc..."}'
```

### 2.2 RAG 기반 질의응답

**핵심 기능**: 저장된 학습 노트를 검색하여 관련 내용을 기반으로 AI가 답변

```
POST /api/rag/ask
```

**요청:**
```json
{
  "question": "이차방정식의 근의 공식은 무엇인가요?",
  "noteIds": ["noteId1", "noteId2"],  // optional
  "userId": "test-user",
  "topK": 3  // 검색할 청크 개수
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "question": "이차방정식의 근의 공식은 무엇인가요?",
    "answer": "학습 노트를 기반으로 생성된 답변...",
    "sources": [
      {
        "noteId": "...",
        "noteTitle": "수학 노트",
        "subject": "수학",
        "relevantText": "관련 텍스트 일부...",
        "similarity": 0.85
      }
    ]
  }
}
```

**curl 예시:**
```bash
curl -X POST http://localhost:3001/api/rag/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "이차방정식의 근의 공식은?",
    "topK": 3
  }'
```

### 2.3 벡터 저장소 통계

```
GET /api/rag/stats
```

**응답:**
```json
{
  "success": true,
  "data": {
    "totalVectors": 150,
    "uniqueNotes": 30
  }
}
```

---

## 3. 문제 생성 API (`/api/questions`)

### 3.1 노트 기반 문제 생성

**핵심 기능**: 학습 노트 내용을 바탕으로 AI가 자동으로 문제 생성

```
POST /api/questions/generate
```

**요청:**
```json
{
  "noteId": "67891234abc...",
  "count": 5,
  "questionType": "객관식",  // "객관식" | "주관식" | "OX" | "단답형"
  "difficulty": "보통",  // "쉬움" | "보통" | "어려움"
  "userId": "test-user"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "questionSetId": "...",
    "noteId": "...",
    "noteTitle": "수학 노트",
    "questionType": "객관식",
    "count": 5,
    "difficulty": "보통",
    "questions": [
      {
        "type": "객관식",
        "question": "문제 내용",
        "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
        "answer": "1",
        "explanation": "상세한 해설",
        "difficulty": "보통",
        "points": 10
      }
    ],
    "createdAt": "2025-11-09T06:00:00.000Z"
  }
}
```

**curl 예시:**
```bash
curl -X POST http://localhost:3001/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "noteId": "67891234abc...",
    "count": 5,
    "questionType": "객관식",
    "difficulty": "보통"
  }'
```

### 3.2 문제 세트 조회

```
GET /api/questions/:questionSetId
```

### 3.3 문제 세트 목록

```
GET /api/questions?userId=test-user&noteId=...&page=1&limit=10
```

---

## 4. 채팅 API (`/api/chat`)

### 4.1 일반 질문

```
POST /api/chat/ask
```

**요청:**
```json
{
  "question": "파이썬이란 무엇인가요?"
}
```

### 4.2 AI 튜터

```
POST /api/chat/tutor
```

**요청:**
```json
{
  "question": "이차방정식을 설명해주세요",
  "subject": "수학",
  "difficulty": "중급"
}
```

---

## 사용 흐름 예시

### 완전한 워크플로우

```bash
# 1. 노트 업로드
curl -X POST http://localhost:3001/api/notes/upload \
  -F "image=@note.jpg" \
  -F "title=수학 노트" \
  -F "subject=수학"

# 응답에서 noteId 복사: "67891234abc..."

# 2. 노트 인덱싱 (RAG 활성화)
curl -X POST http://localhost:3001/api/rag/index-note \
  -H "Content-Type: application/json" \
  -d '{"noteId":"67891234abc..."}'

# 3. RAG 기반 질문
curl -X POST http://localhost:3001/api/rag/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "이 노트의 핵심 내용은?"
  }'

# 4. 문제 생성
curl -X POST http://localhost:3001/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "noteId": "67891234abc...",
    "count": 5,
    "questionType": "객관식"
  }'
```

---

## 에러 응답

모든 API는 오류 시 다음 형식을 반환합니다:

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

**HTTP 상태 코드:**
- `200`: 성공
- `400`: 잘못된 요청
- `404`: 리소스 없음
- `500`: 서버 오류

---

## 주의사항

1. **S3 버킷**: `.env`의 `S3_BUCKET_NAME`에 실제 S3 버킷 이름을 설정해야 합니다
2. **MongoDB**: 로컬 MongoDB가 실행 중이어야 합니다
3. **파일 크기**: 이미지 업로드는 최대 10MB로 제한됩니다
4. **API 제한**: Textract와 Bedrock API 호출은 AWS 계정의 제한을 받습니다

---

## 기술 스택

- **OCR**: AWS Textract
- **임베딩**: AWS Bedrock Titan Embeddings v2 (1024차원)
- **LLM**: AWS Bedrock Claude Sonnet 4.5
- **벡터 검색**: 메모리 기반 (프로덕션에서는 FAISS/Pinecone 권장)
- **데이터베이스**: MongoDB
- **파일 저장**: AWS S3
