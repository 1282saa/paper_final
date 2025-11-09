# src/ - Express 서버 소스코드

로컬 개발 및 테스트를 위한 Express 기반 백엔드 서버

## 📁 디렉토리 구조

```
src/
├── config/          # 애플리케이션 설정
├── models/          # MongoDB 데이터 모델
├── routes/          # API 라우트 핸들러
├── services/        # 비즈니스 로직 및 외부 서비스 연동
├── utils/           # 유틸리티 함수
└── index.js         # 서버 진입점
```

## 🎯 각 디렉토리 설명

### config/
데이터베이스 연결 등 애플리케이션 전역 설정

**파일:**
- `database.js` - MongoDB 연결 관리

### models/
Mongoose 스키마 정의 (데이터 구조)

**파일:**
- `Note.js` - 학습 노트 스키마
- `Question.js` - 문제 세트 스키마

### routes/
HTTP API 엔드포인트 정의

**파일:**
- `chat.js` - 채팅 API (`/api/chat/*`)
- `notes.js` - 노트 관리 API (`/api/notes/*`)
- `rag.js` - RAG API (`/api/rag/*`)
- `questions.js` - 문제 생성 API (`/api/questions/*`)

### services/
재사용 가능한 비즈니스 로직 및 외부 API 연동

**파일:**
- `bedrockService.js` - AWS Bedrock (Claude)
- `textractService.js` - AWS Textract (OCR)
- `s3Service.js` - AWS S3 (파일 저장)
- `embeddingService.js` - Bedrock Titan Embeddings
- `vectorService.js` - 벡터 검색 엔진

### utils/
공통 유틸리티 함수

**파일:**
- `textChunker.js` - 텍스트 분할 (청킹)

## 🚀 로컬 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

## 📝 코딩 가이드

### 새로운 API 추가

1. **모델 정의** (필요시)
   ```javascript
   // src/models/YourModel.js
   import mongoose from "mongoose";

   const YourSchema = new mongoose.Schema({...});
   export default mongoose.model("YourModel", YourSchema);
   ```

2. **서비스 로직** (필요시)
   ```javascript
   // src/services/yourService.js
   class YourService {
     async doSomething() {...}
   }
   export default new YourService();
   ```

3. **라우트 추가**
   ```javascript
   // src/routes/your.js
   import express from "express";
   const router = express.Router();

   router.post("/endpoint", async (req, res) => {...});

   export default router;
   ```

4. **라우트 등록**
   ```javascript
   // src/index.js
   import yourRoutes from "./routes/your.js";
   app.use("/api/your", yourRoutes);
   ```

## 🔍 디버깅

```javascript
// 로깅 추가
console.log("디버그:", data);

// MongoDB 쿼리 디버깅
mongoose.set('debug', true);
```

## ⚠️ 주의사항

- `.env` 파일은 절대 Git에 커밋하지 말 것
- 모든 비동기 함수는 try-catch로 에러 처리
- API 응답은 일관된 형식 유지 (`{success, data/error}`)
