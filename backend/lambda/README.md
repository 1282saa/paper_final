# lambda/ - AWS Lambda 핸들러

AWS Lambda에 배포되는 서버리스 함수들

## 📁 디렉토리 구조

```
lambda/
├── health.js        # 헬스체크
├── notes/           # 노트 관련 Lambda
│   ├── createUploadUrl.js    # Pre-signed URL 생성
│   ├── processUpload.js      # S3 트리거 OCR
│   ├── getNotes.js          # 목록 조회 (TODO)
│   └── getNote.js           # 상세 조회 (TODO)
├── rag/             # RAG 시스템
│   ├── indexNote.js         # 벡터화 (TODO)
│   └── ask.js               # 질의응답 (TODO)
├── questions/       # 문제 생성
│   ├── generate.js          # 문제 생성 (TODO)
│   └── getQuestions.js      # 조회 (TODO)
└── chat/            # 채팅
    ├── ask.js               # 일반 질문 (TODO)
    └── tutor.js             # AI 튜터 (TODO)
```

## 🎯 Lambda 함수 패턴

### 기본 구조

```javascript
/**
 * Lambda 핸들러 함수
 * @param {Object} event - API Gateway 이벤트 또는 S3 이벤트
 * @param {Object} context - Lambda 실행 컨텍스트
 * @returns {Object} HTTP 응답 또는 처리 결과
 */
export const handler = async (event, context) => {
  try {
    // 1. 입력 검증
    const body = JSON.parse(event.body || '{}');

    // 2. 비즈니스 로직
    const result = await doSomething(body);

    // 3. 응답 반환
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
```

### MongoDB 연결 (Lambda 최적화)

```javascript
// Lambda는 컨테이너를 재사용하므로 전역 변수로 연결 캐싱
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;  // 재사용
  }

  await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = mongoose.connection;
  return cachedDb;
}

export const handler = async (event) => {
  await connectToDatabase();  // 매번 호출하지만 캐시 사용
  // ...
};
```

## 📝 개발 가이드

### 새로운 Lambda 함수 추가

1. **핸들러 작성**
   ```javascript
   // lambda/yourFunction.js
   export const handler = async (event) => {
     // 로직 구현
   };
   ```

2. **serverless.yml에 등록**
   ```yaml
   functions:
     yourFunction:
       handler: lambda/yourFunction.handler
       events:
         - httpApi:
             path: /your/path
             method: post
             cors: true
   ```

3. **배포**
   ```bash
   npm run deploy:dev
   ```

### src/ 코드 재사용

Lambda에서 src/ 의 서비스 사용 가능:

```javascript
// lambda/yourFunction.js
import bedrockService from "../src/services/bedrockService.js";

export const handler = async (event) => {
  const answer = await bedrockService.askQuestion("질문");
  // ...
};
```

## 🔧 환경변수

Lambda는 `serverless.yml`에 정의된 환경변수 사용:

```javascript
const region = process.env.AWS_REGION;
const bucket = process.env.S3_BUCKET_NAME;
const modelId = process.env.BEDROCK_MODEL_ID;
```

## 🐛 디버깅

### 로컬 테스트

```bash
# 로컬에서 Lambda 실행
serverless invoke local -f yourFunction -d '{"body": "{}"}'
```

### 로그 확인

```bash
# 실시간 로그
serverless logs -f yourFunction --tail

# CloudWatch 직접 확인
aws logs tail /aws/lambda/learning-notes-api-dev-yourFunction --follow
```

## ⚡ 성능 최적화

### Cold Start 줄이기

```javascript
// ❌ 나쁜 예: 핸들러 안에서 import
export const handler = async (event) => {
  const Service = await import('./service.js');
  // ...
};

// ✅ 좋은 예: 파일 상단에서 import
import Service from './service.js';

export const handler = async (event) => {
  // ...
};
```

### 메모리 설정

```yaml
functions:
  yourFunction:
    memorySize: 1024  # MB (기본 1024)
    timeout: 300      # 초 (최대 900 = 15분)
```

## 🔐 보안

### IAM 권한 최소화

```yaml
# serverless.yml
provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - s3:GetObject  # 필요한 것만
          Resource: "arn:aws:s3:::bucket-name/*"
```

### 환경변수 암호화

```bash
# AWS Systems Manager Parameter Store 사용
aws ssm put-parameter \
  --name /learning-notes/db-password \
  --value "secret" \
  --type SecureString
```

## 📊 모니터링

### CloudWatch 메트릭

- Invocations (호출 수)
- Duration (실행 시간)
- Errors (오류 수)
- Throttles (제한 수)

### X-Ray 트레이싱 (선택사항)

```yaml
provider:
  tracing:
    lambda: true
```

## ⚠️ 주의사항

1. **Stateless**: Lambda는 상태를 저장하지 않음 (메모리 데이터는 휘발)
2. **Cold Start**: 처음 실행 시 지연 발생 (2-5초)
3. **동시성 제한**: AWS 계정당 기본 1,000개 동시 실행
4. **타임아웃**: 최대 15분, 초과 시 강제 종료
5. **페이로드 제한**: 요청/응답 최대 6MB

## 🎯 TODO Lambda 함수들

아래 함수들은 아직 구현 필요:

- [ ] `lambda/notes/getNotes.js`
- [ ] `lambda/notes/getNote.js`
- [ ] `lambda/rag/indexNote.js`
- [ ] `lambda/rag/ask.js`
- [ ] `lambda/questions/generate.js`
- [ ] `lambda/questions/getQuestions.js`
- [ ] `lambda/chat/ask.js`
- [ ] `lambda/chat/tutor.js`

`src/routes/` 코드를 참고하여 구현하면 됩니다.
