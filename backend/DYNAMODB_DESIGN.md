# DynamoDB 테이블 설계

AWS 서버리스 환경에 최적화된 DynamoDB 테이블 구조입니다.

---

## 🎯 DynamoDB 설계 원칙

### Single Table Design
- 모든 데이터를 **하나의 테이블**에 저장 (AWS 권장)
- Partition Key (PK) + Sort Key (SK)로 다양한 쿼리 패턴 지원
- GSI (Global Secondary Index)로 추가 쿼리 지원

### 장점
- ✅ 비용 절감 (테이블당 과금)
- ✅ 빠른 조회 (밀리초 단위)
- ✅ 자동 스케일링
- ✅ Lambda와 완벽 호환

---

## 📊 테이블 구조

### 메인 테이블: `LearningNotesTable`

| 속성 | 타입 | 설명 |
|------|------|------|
| **PK** (Partition Key) | String | `USER#userId` 또는 `NOTE#noteId` |
| **SK** (Sort Key) | String | `METADATA` 또는 `QUESTION#timestamp` |
| **Type** | String | 엔티티 타입 (NOTE, QUESTION, VECTOR) |
| **Data** | Map | 실제 데이터 (JSON) |
| **GSI1PK** | String | 보조 인덱스 1 |
| **GSI1SK** | String | 보조 인덱스 1 정렬 키 |
| **createdAt** | Number | Unix timestamp |
| **updatedAt** | Number | Unix timestamp |

---

## 🔑 Access Patterns (쿼리 패턴)

### 1. 노트 관련

#### 1-1. 특정 사용자의 모든 노트 조회
```
PK = USER#user123
SK begins_with NOTE#
```

#### 1-2. 특정 노트 상세 조회
```
PK = NOTE#noteId
SK = METADATA
```

#### 1-3. 특정 과목의 노트 조회 (GSI)
```
GSI1PK = SUBJECT#수학
GSI1SK = 2025-01-15T...
```

### 2. 문제 관련

#### 2-1. 특정 노트의 모든 문제 조회
```
PK = NOTE#noteId
SK begins_with QUESTION#
```

#### 2-2. 특정 사용자의 모든 문제 조회 (GSI)
```
GSI1PK = USER#user123
GSI1SK begins_with QUESTION#
```

### 3. 벡터 검색 (RAG)

#### 3-1. 특정 노트의 벡터 청크 조회
```
PK = NOTE#noteId
SK begins_with VECTOR#
```

---

## 📝 데이터 구조 예시

### Note 아이템

```json
{
  "PK": "USER#user123",
  "SK": "NOTE#2025-01-15T10:30:00.000Z#note001",
  "Type": "NOTE",
  "noteId": "note001",
  "userId": "user123",
  "title": "수학 노트",
  "subject": "수학",
  "content": "OCR로 추출된 텍스트...",
  "imageUrl": "https://s3.amazonaws.com/...",
  "s3Key": "notes/user123/note001.jpg",
  "metadata": {
    "ocrConfidence": 0.95,
    "fileSize": 1024000,
    "mimeType": "image/jpeg"
  },
  "tags": ["중간고사", "1학기"],
  "isIndexed": true,
  "GSI1PK": "SUBJECT#수학",
  "GSI1SK": "2025-01-15T10:30:00.000Z",
  "createdAt": 1705315800000,
  "updatedAt": 1705315800000
}
```

### Note Metadata 아이템 (상세 조회용)

```json
{
  "PK": "NOTE#note001",
  "SK": "METADATA",
  "Type": "NOTE",
  "noteId": "note001",
  "userId": "user123",
  "title": "수학 노트",
  "subject": "수학",
  "content": "OCR로 추출된 텍스트...",
  "imageUrl": "https://s3.amazonaws.com/...",
  "s3Key": "notes/user123/note001.jpg",
  "metadata": {
    "ocrConfidence": 0.95,
    "fileSize": 1024000
  },
  "tags": ["중간고사", "1학기"],
  "isIndexed": true,
  "createdAt": 1705315800000,
  "updatedAt": 1705315800000
}
```

### Vector 청크 아이템

```json
{
  "PK": "NOTE#note001",
  "SK": "VECTOR#chunk001",
  "Type": "VECTOR",
  "vectorId": "chunk001",
  "noteId": "note001",
  "text": "이차방정식은 ax^2 + bx + c = 0 형태...",
  "embedding": [0.123, -0.456, 0.789, ...], // 1024차원 벡터
  "startIndex": 0,
  "endIndex": 100,
  "createdAt": 1705315800000
}
```

### Question 아이템

```json
{
  "PK": "NOTE#note001",
  "SK": "QUESTION#2025-01-15T11:00:00.000Z#q001",
  "Type": "QUESTION",
  "questionSetId": "q001",
  "noteId": "note001",
  "userId": "user123",
  "questions": [
    {
      "type": "객관식",
      "question": "이차방정식의 근의 공식은?",
      "options": ["1번", "2번", "3번", "4번"],
      "answer": "2",
      "explanation": "근의 공식은...",
      "difficulty": "보통"
    }
  ],
  "GSI1PK": "USER#user123",
  "GSI1SK": "QUESTION#2025-01-15T11:00:00.000Z",
  "createdAt": 1705317600000
}
```

---

## 🔍 인덱스 구조

### Primary Index
- **PK**: Partition Key
- **SK**: Sort Key

### GSI1 (Global Secondary Index 1)
- **GSI1PK**: 보조 Partition Key
- **GSI1SK**: 보조 Sort Key
- **용도**: 과목별 조회, 사용자별 문제 조회

---

## 💰 비용 최적화

### On-Demand vs Provisioned

#### On-Demand (추천)
- 사용한 만큼만 과금
- 자동 스케일링
- 초기 프로젝트에 적합

#### Provisioned
- RCU/WCU 미리 설정
- 예측 가능한 트래픽에 적합
- 비용 절감 (일정 규모 이상)

### 무료 티어
- 25 GB 저장소
- 25 RCU (Read Capacity Units)
- 25 WCU (Write Capacity Units)
- **월 2억 요청까지 무료!**

---

## 🚀 DynamoDB vs MongoDB Atlas 비교

### 이 프로젝트에서의 차이

| 기능 | MongoDB Atlas | DynamoDB |
|------|---------------|----------|
| **노트 저장** | ✅ Document | ✅ Item |
| **벡터 저장** | ✅ Array 필드 | ✅ List 타입 |
| **벡터 검색** | ✅ Atlas Vector Search | ⚠️ 수동 구현 필요 |
| **복잡한 쿼리** | ✅ 자유로움 | ⚠️ PK/SK 기반만 |
| **Lambda 성능** | ⚠️ Cold Start 2-3초 | ✅ 100ms |
| **비용 (무료)** | 512MB | 25GB |

### 벡터 검색 구현 방법

DynamoDB는 네이티브 벡터 검색이 없으므로:

**옵션 1: 메모리 기반 (현재 구현)**
- Lambda 메모리에서 코사인 유사도 계산
- 적은 데이터(수백 개)에 적합

**옵션 2: Amazon OpenSearch**
- 벡터 검색 전용 서비스
- 대규모 데이터에 적합
- 추가 비용 발생

**옵션 3: DynamoDB + 클라이언트 필터링**
- 모든 벡터 조회 후 Lambda에서 정렬
- 이 프로젝트 규모에 충분

---

## 📖 참고 문서

- **DynamoDB Single Table Design**: https://www.alexdebrie.com/posts/dynamodb-single-table/
- **AWS DynamoDB 모범 사례**: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html
- **DynamoDB Toolbox**: https://github.com/jeremydaly/dynamodb-toolbox

---

## 🎯 다음 단계

1. ✅ 테이블 설계 완료
2. ⏳ DynamoDB 서비스 레이어 구현
3. ⏳ Lambda 함수 수정
4. ⏳ serverless.yml에 테이블 정의
5. ⏳ 배포 및 테스트
