# AI 학습 플랫폼 - 서버리스 OCR 통합 가이드

## 아키텍처 개요

```
┌─────────────────┐
│  React Frontend │
│  (Vite + React) │
└────────┬────────┘
         │ HTTP POST
         ↓
┌─────────────────────────────────┐
│  AWS API Gateway                │
│  /api/ocr                       │
│  /api/generate-questions        │
│  /api/ocr-llm                   │
└────────┬────────────────────────┘
         │ Lambda Invoke
         ↓
┌─────────────────────────────────┐
│  AWS Lambda (Python 3.12)       │
│  - handler.process_ocr          │
│  - handler.generate_questions   │
│  - handler.process_ocr_with_llm │
└────────┬────────────────────────┘
         │
         ├─→ Google Cloud Vision API (OCR)
         └─→ OpenAI GPT-4 API (LLM)
```

## 주요 특징

### 1. 서버리스 아키텍처
- **AWS Lambda**: 사용한 만큼만 과금 (100만 요청 무료)
- **API Gateway**: RESTful API 엔드포인트
- **Lambda Layer**: 패키지 분리로 배포 속도 향상

### 2. 실제 OCR 통합
- **Google Cloud Vision API**: 손글씨 인식 (94% 정확도)
- **DocAligner**: 노트 경계 자동 검출
- **LLM 후처리**: GPT-4로 오타 교정 및 구조화

### 3. 개발/프로덕션 자동 전환
- **개발 모드**: Mock 데이터 사용 (API 키 불필요)
- **프로덕션**: 실제 AWS Lambda API 호출
- **환경 변수로 자동 전환**: `VITE_API_BASE_URL`

## 디렉토리 구조

```
final/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   └── UploadModal/
│   │   │       ├── UploadModal.jsx        # OCR API 호출
│   │   │       └── Step2OCRProcessing.jsx # 진행률 표시
│   │   ├── pages/
│   │   │   └── AIQuestionGenerator.jsx    # AI 문제 생성
│   │   └── utils/
│   │       ├── ocrAPI.js                  # API 호출 유틸리티
│   │       └── documentStorage.js         # LocalStorage 관리
│   ├── .env.example                       # 환경 변수 예시
│   └── package.json
│
└── ocr-service/                 # 서버리스 백엔드
    ├── handler.py               # Lambda 함수 (실제 OCR/LLM 코드)
    ├── note_ocr_processor.py    # Google Vision API 연동
    ├── note_llm_postprocessor.py# OpenAI GPT-4 연동
    ├── serverless.yml           # AWS 배포 설정
    ├── package.json             # Serverless Framework
    ├── requirements.txt         # Python 패키지
    ├── .env.example             # API 키 예시
    └── DEPLOY.md                # 배포 가이드
```

## 설치 및 실행

### 1. 프론트엔드 실행 (개발 모드)

```bash
cd frontend
npm install
npm run dev
```

개발 모드에서는 Mock 데이터가 자동으로 사용됩니다.

### 2. 백엔드 배포 (AWS Lambda)

#### 사전 준비
```bash
# AWS CLI 설치 및 설정
aws configure

# Serverless Framework 설치
npm install -g serverless

# Node.js 패키지 설치
cd ocr-service
npm install
```

#### API 키 발급

**Google Cloud Vision API**
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 → Cloud Vision API 활성화
3. 서비스 계정 생성 → JSON 키 다운로드
4. `google-credentials.json`으로 저장

**OpenAI API**
1. [OpenAI Platform](https://platform.openai.com) 접속
2. API Keys → Create new secret key
3. 키 복사 (한 번만 표시됨!)

#### 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 편집
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json
OPENAI_API_KEY=sk-proj-your-api-key
```

#### 배포
```bash
# 개발 환경 배포
npm run deploy:dev

# 배포 정보 확인
serverless info

# 출력 예시:
# endpoints:
#   POST - https://abc123.execute-api.ap-northeast-2.amazonaws.com/dev/api/ocr
#   POST - https://abc123.execute-api.ap-northeast-2.amazonaws.com/dev/api/generate-questions
```

### 3. 프론트엔드에서 실제 API 사용

```bash
cd frontend

# .env.local 파일 생성
echo "VITE_API_BASE_URL=https://abc123.execute-api.ap-northeast-2.amazonaws.com/dev" > .env.local

# 프로덕션 모드로 실행
npm run dev
```

## API 엔드포인트

### 1. OCR 처리
```http
POST /api/ocr
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**응답:**
```json
{
  "success": true,
  "text": "미분의 정의\n\nf'(a) = lim(h→0) [f(a+h) - f(a)] / h",
  "confidence": 0.95,
  "character_count": 245,
  "line_count": 15
}
```

### 2. OCR + LLM 통합 처리
```http
POST /api/ocr-llm
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**응답:**
```json
{
  "success": true,
  "original": {
    "text": "원본 OCR 텍스트...",
    "confidence": 0.92
  },
  "processed": {
    "title": "미분의 기본 개념",
    "content": "# 미분의 정의\n\n깔끔하게 정리된 텍스트..."
  }
}
```

### 3. AI 문제 생성
```http
POST /api/generate-questions
Content-Type: application/json

{
  "text": "미분의 정의는...",
  "subject": "수학",
  "difficulty": "medium",
  "count": 3
}
```

**응답:**
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question": "함수 f(x)의 미분계수를 구하는 공식은?",
      "type": "short-answer",
      "difficulty": "medium",
      "answer": "f'(a) = lim(h→0) [f(a+h) - f(a)] / h",
      "explanation": "극한의 정의를 이용한 미분계수 공식입니다."
    }
  ]
}
```

## 데이터 흐름

### 이미지 업로드 → OCR → 저장
```
1. 사용자가 이미지 업로드
   ↓
2. UploadModal.jsx - handleImageUpload()
   ↓
3. ocrAPI.js - processOCRWithLLM()
   ↓
4. AWS Lambda - handler.process_ocr_with_llm()
   ↓
5. Google Vision API → OCR 수행
   ↓
6. OpenAI GPT-4 → 텍스트 정제
   ↓
7. 프론트엔드로 결과 반환
   ↓
8. documentStorage.js - saveDocument()
   ↓
9. LocalStorage에 저장
```

### 문서 선택 → AI 문제 생성
```
1. AIQuestionGenerator.jsx - 문서 선택
   ↓
2. handleGenerateQuestions(doc)
   ↓
3. ocrAPI.js - generateQuestions()
   ↓
4. AWS Lambda - handler.generate_questions()
   ↓
5. OpenAI GPT-4 → 문제 생성
   ↓
6. 프론트엔드로 결과 반환
   ↓
7. 문제 풀이 화면 표시
```

## 비용 산정

### AWS Lambda (서울 리전)
- **요청**: 100만 건/월 무료
- **컴퓨팅**: 400,000 GB-초/월 무료
- **예상 비용**: 월 1000회 사용 시 거의 무료

### Google Cloud Vision API
- **Text Detection**: 1,000 유닛/월 무료
- **이후**: $1.50 / 1,000 유닛
- **예상 비용**: 월 100장 처리 시 무료

### OpenAI GPT-4o API
- **Input**: $2.50 / 1M tokens
- **Output**: $10.00 / 1M tokens
- **예상 비용**: 월 100회 사용 시 약 $5

**총 예상 비용**: 월 $5~10 (소규모 사용 시)

## 개발 vs 프로덕션

### 개발 모드 (로컬)
- Mock 데이터 자동 사용
- API 키 불필요
- 빠른 테스트 가능
- `IS_DEV = true` 자동 감지

### 프로덕션 모드 (배포 후)
- 실제 AWS Lambda 호출
- Google Vision + OpenAI 사용
- 실제 OCR 및 AI 기능
- `VITE_API_BASE_URL` 설정 필요

## 문제 해결

### Q1. "OCR 처리 실패" 오류
**해결**:
- `.env` 파일에 `GOOGLE_APPLICATION_CREDENTIALS` 확인
- Google Cloud Vision API 활성화 확인
- 서비스 계정 권한 확인

### Q2. "문제 생성 실패" 오류
**해결**:
- `.env` 파일에 `OPENAI_API_KEY` 확인
- OpenAI 계정 크레딧 잔액 확인
- API 키 유효성 확인

### Q3. "CORS 오류"
**해결**:
- `serverless.yml`에서 CORS 설정 확인
- API Gateway에서 CORS 활성화
- 프론트엔드 URL이 허용 목록에 있는지 확인

### Q4. "Lambda 타임아웃"
**해결**:
- `serverless.yml`에서 `timeout` 값 증가 (현재 30초)
- 이미지 크기 줄이기 (2MB 이하 권장)
- Lambda 메모리 증가 (현재 1024MB)

## 추가 기능 구현 가이드

### 1. 문제 난이도 선택 추가
```javascript
// AIQuestionGenerator.jsx
const [difficulty, setDifficulty] = useState("medium");

const result = await generateQuestions(
  doc.extractedText,
  doc.subject,
  difficulty,  // "easy", "medium", "hard"
  3
);
```

### 2. 문제 개수 커스터마이징
```javascript
const [questionCount, setQuestionCount] = useState(3);

const result = await generateQuestions(
  doc.extractedText,
  doc.subject,
  "medium",
  questionCount  // 1~10
);
```

### 3. 이미지 압축 추가
```javascript
// ocrAPI.js - imageToBase64() 함수 수정
const compressImage = async (file) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  return new Promise((resolve) => {
    img.onload = () => {
      const MAX_WIDTH = 1920;
      const scale = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = URL.createObjectURL(file);
  });
};
```

## 참고 자료

- [AWS Lambda 공식 문서](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework 가이드](https://www.serverless.com/framework/docs)
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [React Vite 공식 문서](https://vitejs.dev/)

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
