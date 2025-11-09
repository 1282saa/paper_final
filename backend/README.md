# 오늘 한 장 - 백엔드 서버

AWS Bedrock의 Claude 모델을 활용한 학습 관리 시스템 백엔드 API

## 기술 스택

- **Node.js** + **Express**: 웹 서버 프레임워크
- **AWS Bedrock**: Claude AI 모델 호스팅
- **AWS SDK v3**: Bedrock Runtime 클라이언트

## 설치 및 실행

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 AWS 자격증명을 입력합니다:

```bash
cp .env.example .env
```

`.env` 파일 내용:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
PORT=3001
```

### 3. 서버 실행

**개발 모드** (nodemon으로 자동 재시작):

```bash
npm run dev
```

**프로덕션 모드**:

```bash
npm start
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

## API 엔드포인트

### 헬스체크

**GET** `/health`

서버 상태를 확인합니다.

**응답 예시:**

```json
{
  "status": "ok",
  "message": "오늘 한 장 백엔드 서버가 정상 작동중입니다.",
  "timestamp": "2025-11-09T06:00:00.000Z"
}
```

### 1. 일반 질문-답변

**POST** `/api/chat/ask`

Claude에게 질문하고 답변을 받습니다.

**요청 본문:**

```json
{
  "question": "파이썬에서 리스트와 튜플의 차이점은 무엇인가요?",
  "options": {
    "temperature": 1,
    "max_tokens": 4096
  }
}
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "question": "파이썬에서 리스트와 튜플의 차이점은 무엇인가요?",
    "answer": "리스트와 튜플의 주요 차이점은...",
    "timestamp": "2025-11-09T06:00:00.000Z"
  }
}
```

### 2. AI 튜터 질문

**POST** `/api/chat/tutor`

AI 튜터에게 학습 관련 질문을 합니다. 교육에 특화된 시스템 프롬프트가 적용됩니다.

**요청 본문:**

```json
{
  "question": "이차방정식의 근의 공식을 설명해주세요",
  "subject": "수학",
  "difficulty": "중급"
}
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "question": "이차방정식의 근의 공식을 설명해주세요",
    "answer": "이차방정식의 근의 공식은...",
    "subject": "수학",
    "difficulty": "중급",
    "timestamp": "2025-11-09T06:00:00.000Z"
  }
}
```

### 3. 문제 생성

**POST** `/api/chat/generate-questions`

학습 주제를 바탕으로 문제를 생성합니다.

**요청 본문:**

```json
{
  "topic": "자바스크립트 배열 메서드",
  "count": 5,
  "questionType": "객관식"
}
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "topic": "자바스크립트 배열 메서드",
    "questionType": "객관식",
    "count": 5,
    "questions": "생성된 문제들...",
    "timestamp": "2025-11-09T06:00:00.000Z"
  }
}
```

## 프로젝트 구조

```
backend/
├── src/
│   ├── index.js              # 메인 서버 파일
│   ├── routes/
│   │   └── chat.js          # Chat API 라우트
│   └── services/
│       └── bedrockService.js # AWS Bedrock 서비스 로직
├── .env.example              # 환경변수 예시
├── .gitignore
├── package.json
└── README.md
```

## AWS Bedrock 설정

### 필요한 IAM 권한

AWS IAM 사용자에게 다음 권한이 필요합니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
    }
  ]
}
```

### Bedrock 모델 액세스 활성화

1. AWS Console에서 Bedrock 서비스로 이동
2. 좌측 메뉴에서 "Model access" 선택
3. "Modify model access" 클릭
4. "Anthropic Claude 3.5 Sonnet" 체크
5. "Save changes" 클릭

## 에러 처리

모든 API는 일관된 에러 응답 형식을 사용합니다:

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

**에러 상태 코드:**
- `400`: 잘못된 요청 (필수 파라미터 누락, 유효하지 않은 입력 등)
- `404`: 엔드포인트를 찾을 수 없음
- `500`: 서버 내부 오류 (Bedrock API 오류 포함)

## 환경변수 설명

| 변수명 | 필수 | 기본값 | 설명 |
|--------|------|--------|------|
| `AWS_REGION` | ✅ | `us-east-1` | AWS Bedrock을 사용할 리전 |
| `AWS_ACCESS_KEY_ID` | ✅ | - | AWS IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | ✅ | - | AWS IAM Secret Key |
| `BEDROCK_MODEL_ID` | ❌ | `anthropic.claude-3-5-sonnet-20241022-v2:0` | 사용할 Claude 모델 ID |
| `PORT` | ❌ | `3001` | 서버 포트 |
| `NODE_ENV` | ❌ | `development` | 환경 (development/production) |

## 개발 팁

### CORS 설정

기본적으로 모든 도메인에서 API 접근이 허용됩니다. 프로덕션 환경에서는 `src/index.js`에서 CORS 설정을 수정하세요:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

### 로그 확인

서버는 모든 요청을 콘솔에 로깅합니다:

```
[2025-11-09T06:00:00.000Z] POST /api/chat/ask
```

## 라이선스

SW 창업경진대회 출품작
