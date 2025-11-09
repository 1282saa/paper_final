# DynamoDB 설정 및 배포 가이드

AWS Lambda + DynamoDB 서버리스 환경 설정 완벽 가이드입니다.

---

## ✅ DynamoDB로 전환 완료!

이제 프로젝트는 **MongoDB 대신 DynamoDB**를 사용합니다.

### 변경 사항 요약
- ✅ **serverless.yml**: DynamoDB 테이블 정의 추가
- ✅ **DynamoDB 서비스**: `src/services/dynamodbService.js`
- ✅ **DynamoDB 모델**: `src/models/dynamodb/Note.js`, `Question.js`
- ✅ **벡터 저장소**: `src/services/vectorServiceDynamoDB.js`
- ✅ **Lambda 함수**: `getNotes`, `getNote`, `ragAsk` 구현
- ✅ **.env**: `DYNAMODB_TABLE_NAME` 추가

---

## 🚀 빠른 시작

### 1. 환경변수 확인

⚠️ **중요**: 실제 AWS 자격 증명은 `.env` 파일에만 보관하고 절대 Git에 커밋하지 마세요!

`.env` 파일이 다음과 같이 설정되어 있는지 확인:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
S3_BUCKET_NAME=learning-notes-bucket
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-5-20250929-v1:0
DYNAMODB_TABLE_NAME=learning-notes-table-dev
```

### 2. DynamoDB 테이블 자동 생성

Serverless Framework가 자동으로 테이블을 생성합니다.

```bash
# 개발 환경 배포
npm run deploy:dev
```

배포 시 CloudFormation이 다음 테이블을 생성:
- **테이블명**: `learning-notes-table-dev`
- **Primary Key**: PK (Partition), SK (Sort)
- **GSI1**: GSI1PK, GSI1SK (과목별/사용자별 쿼리용)
- **Billing**: On-Demand (사용량 기반 과금)

### 3. 배포 완료 확인

배포 후 다음과 같은 출력을 확인:

```
✔ Service deployed to stack learning-notes-api-dev

endpoints:
  GET - https://xxx.execute-api.us-east-1.amazonaws.com/health
  POST - https://xxx.execute-api.us-east-1.amazonaws.com/notes/upload-url
  GET - https://xxx.execute-api.us-east-1.amazonaws.com/notes
  GET - https://xxx.execute-api.us-east-1.amazonaws.com/notes/{noteId}
  POST - https://xxx.execute-api.us-east-1.amazonaws.com/rag/ask

functions:
  health: learning-notes-api-dev-health
  getNotes: learning-notes-api-dev-getNotes
  getNote: learning-notes-api-dev-getNote
  ragAsk: learning-notes-api-dev-ragAsk
  ...
```

---

## 📊 DynamoDB 테이블 구조

### Primary Key
- **PK** (Partition Key): `USER#userId`, `NOTE#noteId`
- **SK** (Sort Key): `NOTE#timestamp#noteId`, `METADATA`, `VECTOR#vectorId`, `QUESTION#timestamp#qId`

### Global Secondary Index (GSI1)
- **GSI1PK**: `SUBJECT#수학`, `USER#userId`
- **GSI1SK**: `timestamp`, `QUESTION#timestamp`

### 데이터 예시

#### 사용자별 노트 (목록용)
```json
{
  "PK": "USER#user123",
  "SK": "NOTE#2025-01-15T10:00:00.000Z#note001",
  "Type": "NOTE",
  "noteId": "note001",
  "title": "수학 노트",
  "subject": "수학",
  "content": "OCR 텍스트...",
  "GSI1PK": "SUBJECT#수학",
  "GSI1SK": "2025-01-15T10:00:00.000Z"
}
```

#### 노트 상세 (조회용)
```json
{
  "PK": "NOTE#note001",
  "SK": "METADATA",
  "Type": "NOTE",
  "noteId": "note001",
  "title": "수학 노트",
  "content": "OCR 텍스트..."
}
```

#### 벡터 청크 (RAG용)
```json
{
  "PK": "NOTE#note001",
  "SK": "VECTOR#chunk001",
  "Type": "VECTOR",
  "vectorId": "chunk001",
  "text": "이차방정식은...",
  "embedding": [0.1, 0.2, ...],  // 1024차원
  "chunkIndex": 0
}
```

---

## 🔍 쿼리 패턴

### 1. 사용자의 모든 노트 조회
```javascript
// Lambda: getNotes.js
PK = "USER#user123"
SK begins_with "NOTE#"
```

### 2. 특정 노트 상세 조회
```javascript
// Lambda: getNote.js
PK = "NOTE#note001"
SK = "METADATA"
```

### 3. 노트의 벡터 청크 조회 (RAG)
```javascript
// Lambda: ragAsk.js
PK = "NOTE#note001"
SK begins_with "VECTOR#"
```

### 4. 과목별 노트 조회 (GSI)
```javascript
GSI1PK = "SUBJECT#수학"
GSI1SK (정렬: 최신순)
```

---

## 📝 API 사용 예시

### 1. 노트 목록 조회

```bash
curl "https://xxx.execute-api.us-east-1.amazonaws.com/notes?userId=user123&limit=10"
```

**응답:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "noteId": "note001",
        "title": "수학 노트",
        "subject": "수학",
        "createdAt": 1705315800000
      }
    ],
    "count": 10,
    "hasMore": true,
    "lastEvaluatedKey": "..."
  }
}
```

### 2. 노트 상세 조회

```bash
curl "https://xxx.execute-api.us-east-1.amazonaws.com/notes/note001"
```

### 3. RAG 질의응답

```bash
curl -X POST https://xxx.execute-api.us-east-1.amazonaws.com/rag/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "이차방정식의 근의 공식은?",
    "noteIds": ["note001", "note002"],
    "topK": 5
  }'
```

**응답:**
```json
{
  "success": true,
  "data": {
    "answer": "이차방정식 ax²+bx+c=0의 근의 공식은 x = (-b ± √(b²-4ac)) / 2a 입니다...",
    "sources": [
      {
        "noteId": "note001",
        "text": "이차방정식은...",
        "similarity": 0.892,
        "chunkIndex": 2
      }
    ],
    "confidence": 0.892,
    "totalChunksSearched": 5
  }
}
```

---

## 🔧 로컬 개발

### DynamoDB Local 사용 (선택사항)

로컬에서 DynamoDB를 테스트하려면:

```bash
# DynamoDB Local 설치
docker run -p 8000:8000 amazon/dynamodb-local

# 테이블 생성
aws dynamodb create-table \
  --table-name learning-notes-table-dev \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    '[{
      "IndexName": "GSI1",
      "KeySchema": [
        {"AttributeName": "GSI1PK", "KeyType": "HASH"},
        {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"}
    }]' \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000
```

`.env`에 로컬 엔드포인트 추가:
```env
DYNAMODB_ENDPOINT=http://localhost:8000
```

---

## 💰 비용 예상

### DynamoDB On-Demand 요금

| 항목 | 무료 티어 | 이후 요금 |
|------|----------|----------|
| **저장소** | 25GB 무료 | $0.25/GB/월 |
| **쓰기 요청** | 월 25 WCU 무료 | $1.25/백만 요청 |
| **읽기 요청** | 월 25 RCU 무료 | $0.25/백만 요청 |

### 월 1만 요청 예상 비용
- 노트 업로드 (쓰기): 1,000회 → $0.001
- 노트 조회 (읽기): 5,000회 → $0.001
- RAG 검색 (읽기): 4,000회 → $0.001
- 저장소: 1GB → $0 (무료 티어)

**총: ~$0.003/월** (거의 무료!)

---

## 🐛 트러블슈팅

### 1. "ResourceNotFoundException: Table not found"

**원인**: 테이블이 아직 생성되지 않음

**해결**:
```bash
# 배포 확인
npm run deploy:dev

# AWS 콘솔에서 DynamoDB 테이블 확인
aws dynamodb list-tables --region us-east-1
```

### 2. "AccessDeniedException"

**원인**: Lambda에 DynamoDB 권한 없음

**해결**: `serverless.yml`에 IAM 권한이 있는지 확인
```yaml
iam:
  role:
    statements:
      - Effect: Allow
        Action:
          - dynamodb:PutItem
          - dynamodb:GetItem
          - dynamodb:Query
        Resource: !GetAtt LearningNotesTable.Arn
```

### 3. "ValidationException: The provided key element does not match the schema"

**원인**: PK 또는 SK 형식이 잘못됨

**해결**: PK/SK 헬퍼 함수 사용
```javascript
// ❌ 잘못된 예
PK: userId
SK: noteId

// ✅ 올바른 예
PK: dynamodbService.getUserPK(userId)  // "USER#user123"
SK: dynamodbService.getNoteSK(timestamp, noteId)  // "NOTE#2025-01-15T...#note001"
```

---

## 📖 추가 구현 필요한 Lambda 함수

아직 구현되지 않은 함수들:

- [ ] `lambda/rag/indexNote.js` - 노트 벡터화
- [ ] `lambda/questions/generate.js` - 문제 생성
- [ ] `lambda/questions/getQuestions.js` - 문제 조회
- [ ] `lambda/chat/ask.js` - 일반 채팅
- [ ] `lambda/chat/tutor.js` - AI 튜터

**참고**: `getNotes`, `getNote`, `ragAsk`를 참고하여 구현하면 됩니다.

---

## 🎯 DynamoDB vs MongoDB 비교 (이 프로젝트)

| 기능 | MongoDB Atlas | DynamoDB |
|------|---------------|----------|
| **Lambda 성능** | ⚠️ Cold Start 2-3초 | ✅ 100ms |
| **비용 (무료)** | 512MB | 25GB |
| **자동 스케일링** | ⚠️ 수동 업그레이드 | ✅ 자동 |
| **쿼리 유연성** | ✅ 매우 높음 | ⚠️ PK/SK 기반 |
| **벡터 검색** | ✅ Atlas Vector Search | ⚠️ 수동 구현 |
| **AWS 통합** | ⚠️ 외부 서비스 | ✅ 네이티브 |

---

## ✅ 체크리스트

배포 전 확인:

- [x] `.env` 파일에 `DYNAMODB_TABLE_NAME` 설정
- [x] `serverless.yml`에 DynamoDB 테이블 정의
- [x] IAM 권한에 DynamoDB 추가
- [x] DynamoDB 모델 구현 (`Note.js`, `Question.js`)
- [x] 벡터 서비스 DynamoDB로 변경
- [x] Lambda 함수 예시 구현 (3개)
- [ ] 배포 실행: `npm run deploy:dev`
- [ ] API 테스트
- [ ] CloudWatch 로그 확인

---

## 🔗 참고 자료

- **DynamoDB Single Table Design**: https://www.alexdebrie.com/posts/dynamodb-single-table/
- **AWS DynamoDB 문서**: https://docs.aws.amazon.com/dynamodb/
- **Serverless Framework**: https://www.serverless.com/framework/docs
- **DynamoDB Toolbox**: https://github.com/jeremydaly/dynamodb-toolbox

---

## 🎉 완료!

이제 AWS Lambda + DynamoDB로 완전한 서버리스 백엔드가 준비되었습니다!

다음 단계:
1. `npm run deploy:dev` 실행
2. API 엔드포인트 테스트
3. 프론트엔드 연동
4. 나머지 Lambda 함수 구현
