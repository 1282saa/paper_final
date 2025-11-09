# 서버리스 아키텍처 설계

## 개요

AWS Lambda + API Gateway를 사용한 완전 서버리스 백엔드

## 아키텍처

```
┌─────────────────┐
│  프론트엔드      │
│  (React)        │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────────────────────────────┐
│     AWS API Gateway (REST API)          │
│  - /notes/upload                        │
│  - /notes                               │
│  - /rag/index-note                      │
│  - /rag/ask                             │
│  - /questions/generate                  │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│         AWS Lambda Functions            │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  uploadNoteLambda              │    │
│  │  - Multipart 파일 수신         │    │
│  │  - S3 업로드                   │    │
│  │  - Textract OCR                │    │
│  │  - MongoDB Atlas 저장          │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  indexNoteLambda               │    │
│  │  - 텍스트 청킹                 │    │
│  │  - Bedrock Embeddings          │    │
│  │  - DynamoDB/S3 벡터 저장       │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  ragAskLambda                  │    │
│  │  - 벡터 유사도 검색            │    │
│  │  - Bedrock Claude 답변 생성    │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  generateQuestionsLambda       │    │
│  │  - Bedrock Claude 문제 생성    │    │
│  │  - MongoDB Atlas 저장          │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│         AWS Services                     │
│  - S3 (이미지 저장)                     │
│  - Textract (OCR)                       │
│  - Bedrock (Claude + Embeddings)        │
│  - MongoDB Atlas (메타데이터)           │
│  - DynamoDB or S3 (벡터 저장)          │
└─────────────────────────────────────────┘
```

## 서버리스 스택 선택

### Option 1: Serverless Framework (추천)
- 간단한 설정
- 로컬 테스트 용이
- 플러그인 생태계 풍부

### Option 2: AWS SAM
- AWS 공식 도구
- CloudFormation 기반

### Option 3: AWS CDK
- TypeScript/Python으로 인프라 정의
- 더 복잡하지만 유연함

**선택: Serverless Framework**

## 주요 변경사항

### 1. 데이터베이스
- ❌ 로컬 MongoDB → ✅ **MongoDB Atlas** (클라우드)
- 이유: Lambda는 stateless, 영구 연결 불가

### 2. 벡터 저장소
- ❌ 메모리 기반 → ✅ **DynamoDB** or **S3 + Athena**
- 이유: Lambda 메모리는 함수 종료 시 사라짐

### 3. 파일 업로드
- Lambda는 10MB 페이로드 제한
- 해결: **S3 Pre-signed URL** 사용
  1. Lambda에서 S3 업로드 URL 생성
  2. 프론트엔드가 직접 S3에 업로드
  3. Lambda가 S3 이벤트 트리거로 OCR 처리

### 4. 실행 시간
- Lambda 최대 15분 타임아웃
- OCR, Embeddings는 충분
- 큰 파일은 Step Functions 사용 고려

## 예상 비용 (월 1,000 요청 기준)

**Lambda:**
- 1,000 요청 × 평균 3초 실행 × 1GB 메모리
- 무료 티어 내 (월 100만 요청, 40만 GB-초)
- **$0**

**API Gateway:**
- 1,000 API 호출
- 무료 티어 후 $3.50/백만 요청
- **$0.004**

**S3:**
- 1,000 이미지 × 1MB = 1GB
- $0.023/GB
- **$0.023**

**Textract:**
- 1,000 페이지
- $1.50/1,000 페이지
- **$1.50**

**Bedrock:**
- Claude Sonnet 4.5: 약 $30-50
- Titan Embeddings: $0.10

**MongoDB Atlas:**
- 무료 티어 (M0): 512MB
- **$0**

**총 예상 비용: 약 $32-52/월**

## 다음 단계

1. Serverless Framework 설치
2. Lambda 핸들러 작성
3. serverless.yml 설정
4. MongoDB Atlas 설정
5. 배포 및 테스트
