# 서버리스 배포 가이드

## 사전 준비사항

### 1. AWS CLI 설치 및 설정

```bash
# AWS CLI 설치 확인
aws --version

# AWS 자격증명 설정 (이미 완료됨)
# ⚠️ 실제 AWS 자격 증명은 로컬 환경에서만 사용하고 절대 Git에 커밋하지 마세요!
aws configure
# Access Key ID: your-access-key-here
# Secret Access Key: your-secret-key-here
# Region: us-east-1
```

### 2. Node.js 및 Serverless Framework

```bash
# 이미 설치됨
npm install

# Serverless CLI 전역 설치 (선택사항)
npm install -g serverless
```

### 3. MongoDB Atlas 설정

**무료 M0 클러스터 생성:**

1. https://www.mongodb.com/cloud/atlas 접속
2. 무료 계정 생성
3. M0 (무료) 클러스터 생성
   - Provider: AWS
   - Region: us-east-1 (Virginia)
4. Database Access에서 사용자 생성
5. Network Access에서 `0.0.0.0/0` 추가 (모든 IP 허용)
6. "Connect" 클릭 → "Connect your application" 선택
7. Connection String 복사:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/learning-notes?retryWrites=true&w=majority
   ```

### 4. S3 버킷 생성

```bash
# S3 버킷 생성
aws s3 mb s3://learning-notes-bucket --region us-east-1

# CORS 설정
aws s3api put-bucket-cors --bucket learning-notes-bucket --cors-configuration file://cors.json
```

`cors.json` 내용:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 5. 환경변수 설정

`.env` 파일에 MongoDB Atlas URI 업데이트:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/learning-notes?retryWrites=true&w=majority
```

---

## 배포 단계

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 환경 배포

```bash
npm run deploy:dev
```

또는

```bash
serverless deploy --stage dev
```

**출력 예시:**
```
✔ Service deployed to stack learning-notes-api-dev

endpoints:
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/health
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/notes/upload-url
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/rag/ask
  ...

functions:
  health: learning-notes-api-dev-health
  createUploadUrl: learning-notes-api-dev-createUploadUrl
  processUpload: learning-notes-api-dev-processUpload
  ...
```

### 3. API 엔드포인트 확인

배포 후 표시되는 API Gateway URL을 복사하세요:
```
https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
```

### 4. 헬스체크 테스트

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/health
```

**응답:**
```json
{
  "success": true,
  "message": "오늘 한 장 서버리스 API가 정상 작동중입니다.",
  "timestamp": "2025-11-09T...",
  "stage": "dev"
}
```

---

## 사용 방법

### 1. 노트 업로드 (2단계 프로세스)

**Step 1: Pre-signed URL 생성**

```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/notes/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "note.jpg",
    "fileType": "image/jpeg",
    "title": "수학 노트",
    "subject": "수학",
    "tags": "1학기,중간고사"
  }'
```

**응답:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://learning-notes-bucket.s3.amazonaws.com/...",
    "s3Key": "notes/test-user/uuid.jpg",
    "fileName": "uuid.jpg"
  }
}
```

**Step 2: S3에 직접 업로드**

```bash
curl -X PUT "<uploadUrl>" \
  --upload-file /path/to/note.jpg \
  -H "Content-Type: image/jpeg"
```

업로드 후 자동으로:
1. Lambda가 S3 이벤트 트리거
2. Textract OCR 처리
3. MongoDB에 저장

### 2. 노트 목록 조회

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/notes
```

### 3. RAG 질의응답

먼저 노트 인덱싱:

```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/rag/index-note \
  -H "Content-Type: application/json" \
  -d '{"noteId": "67891234abc..."}'
```

질문하기:

```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/rag/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "이차방정식의 근의 공식은?",
    "topK": 3
  }'
```

### 4. 문제 생성

```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "noteId": "67891234abc...",
    "count": 5,
    "questionType": "객관식",
    "difficulty": "보통"
  }'
```

---

## 로그 확인

### 특정 함수 로그

```bash
# 실시간 로그 스트리밍
serverless logs -f processUpload --tail

# 최근 로그 조회
serverless logs -f processUpload --startTime 5m
```

### CloudWatch에서 직접 확인

```bash
aws logs tail /aws/lambda/learning-notes-api-dev-processUpload --follow
```

---

## 프로덕션 배포

### 1. 환경변수 분리

`.env.production` 파일 생성:

```env
AWS_REGION=us-east-1
S3_BUCKET_NAME=learning-notes-bucket-prod
BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-5-20250929-v1:0
MONGODB_URI=mongodb+srv://...
```

### 2. 프로덕션 배포

```bash
npm run deploy:prod
```

또는

```bash
serverless deploy --stage prod
```

---

## 배포 롤백

문제가 발생하면 이전 버전으로 롤백:

```bash
serverless rollback --timestamp <timestamp>
```

---

## 삭제

모든 리소스 삭제:

```bash
npm run remove

# 또는
serverless remove --stage dev
```

**주의:** S3 버킷은 수동으로 삭제해야 합니다.

```bash
# S3 버킷 비우기
aws s3 rm s3://learning-notes-bucket --recursive

# S3 버킷 삭제
aws s3 rb s3://learning-notes-bucket
```

---

## 비용 최적화

### Lambda
- 메모리: 1024MB → 512MB로 줄이기 (가능한 경우)
- 타임아웃: 300초 → 필요한 만큼만

### S3
- 30일 후 자동 삭제 정책 설정
- Glacier로 아카이브

### MongoDB Atlas
- M0 (무료) 클러스터 사용
- 512MB 제한 주의

---

## 트러블슈팅

### 1. MongoDB 연결 실패

```
Error: Unable to connect to MongoDB
```

**해결:**
- Network Access에서 `0.0.0.0/0` 추가
- Connection String 확인
- Lambda VPC 설정 확인 (기본은 VPC 없음)

### 2. Textract 권한 오류

```
AccessDeniedException: User is not authorized to perform: textract:DetectDocumentText
```

**해결:**
- `serverless.yml`의 IAM 권한 확인
- AWS 계정에 Textract 사용 권한 확인

### 3. S3 업로드 실패

```
SignatureDoesNotMatch
```

**해결:**
- Pre-signed URL 유효기간 확인 (5분)
- Content-Type 일치 확인

---

## 모니터링

### CloudWatch 대시보드

AWS Console → CloudWatch → Dashboards

주요 메트릭:
- Lambda 호출 횟수
- Lambda 오류율
- Lambda 실행 시간
- API Gateway 4xx/5xx 오류

### 알람 설정

```bash
# 오류율 알람
aws cloudwatch put-metric-alarm \
  --alarm-name lambda-errors \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

---

## 다음 단계

1. ✅ 서버리스 배포 완료
2. 프론트엔드 연동
3. CI/CD 파이프라인 구축 (GitHub Actions)
4. 도메인 연결 (Route 53)
5. HTTPS 인증서 (ACM)
6. 사용자 인증 (Cognito)

축하합니다! 서버리스 백엔드가 준비되었습니다! 🎉
