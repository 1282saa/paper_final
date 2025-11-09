# MongoDB Atlas 설정 가이드

서버리스 배포를 위한 MongoDB Atlas 클러스터 설정 가이드입니다.

---

## 🎯 왜 MongoDB Atlas인가?

- **무료 티어**: M0 클러스터 (512MB 저장소)
- **글로벌 접근**: Lambda에서 안정적 연결
- **자동 백업**: 데이터 보호
- **클라우드 네이티브**: 서버리스 환경에 최적

---

## 📝 단계별 설정

### 1. MongoDB Atlas 계정 생성

1. https://www.mongodb.com/cloud/atlas 접속
2. **Try Free** 클릭
3. 이메일로 계정 생성 (또는 Google/GitHub 로그인)

### 2. 클러스터 생성

#### 2-1. Create a Deployment

1. **Create** 버튼 클릭
2. **M0 (FREE)** 선택
3. **Provider**: AWS 선택
4. **Region**: `us-east-1` (버지니아) 선택
   - ⚠️ Lambda와 같은 리전 권장 (지연시간 최소화)
5. **Cluster Name**: `learning-notes-cluster` (원하는 이름)
6. **Create** 클릭

#### 2-2. 데이터베이스 사용자 생성

자동으로 나타나는 Security Quickstart에서:

1. **Username**: 원하는 이름 (예: `admin`)
2. **Password**: 강력한 비밀번호 생성 (저장 필수!)
3. **Create User** 클릭

### 3. 네트워크 접근 허용

#### 3-1. IP 화이트리스트 설정

1. **Network Access** 탭으로 이동
2. **Add IP Address** 클릭
3. 두 가지 옵션:

   **옵션 A: 모든 IP 허용 (개발용)**
   ```
   0.0.0.0/0
   ```
   - 장점: Lambda, 로컬 모두 접근 가능
   - 단점: 보안 약함 (프로덕션 비추천)

   **옵션 B: Lambda IP만 허용 (프로덕션)**
   - Lambda의 고정 IP를 찾아서 추가
   - VPC 설정 필요

4. **Confirm** 클릭

### 4. Connection String 가져오기

1. **Databases** 탭으로 이동
2. 클러스터의 **Connect** 버튼 클릭
3. **Drivers** 선택
4. **Node.js** 드라이버 선택
5. Connection String 복사:

```
mongodb+srv://admin:<password>@learning-notes-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 5. .env 파일에 추가

```env
# 로컬 개발용 (선택사항)
# MONGODB_URI=mongodb://localhost:27017/learning-notes

# MongoDB Atlas (프로덕션)
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@learning-notes-cluster.xxxxx.mongodb.net/learning-notes?retryWrites=true&w=majority
```

⚠️ **주의사항:**
- `<password>` 부분을 실제 비밀번호로 교체
- 데이터베이스 이름 추가: `...mongodb.net/learning-notes?...`
- 특수문자가 있는 비밀번호는 URL 인코딩 필요

### 6. 연결 테스트

로컬에서 테스트:

```bash
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB Atlas 연결 성공!')).catch(err => console.error('❌ 연결 실패:', err));"
```

또는 Express 서버 실행:

```bash
npm run dev
```

콘솔에 "MongoDB 연결 성공!" 메시지 확인

---

## 🔧 데이터베이스 인덱스 생성

성능 최적화를 위한 인덱스를 생성합니다.

### 자동 인덱스 생성 스크립트

프로젝트 루트에 `scripts/createIndexes.js` 파일을 만들어두었습니다:

```bash
node scripts/createIndexes.js
```

### 수동 인덱스 생성 (Atlas UI)

1. **Database** → **Browse Collections** 클릭
2. 컬렉션 선택 (notes, questionsets)
3. **Indexes** 탭 → **Create Index** 클릭
4. 아래 인덱스 추가:

**notes 컬렉션:**
```json
{ "userId": 1, "createdAt": -1 }
{ "isIndexed": 1 }
{ "tags": 1 }
{ "subject": 1 }
```

**questionsets 컬렉션:**
```json
{ "userId": 1, "createdAt": -1 }
{ "noteId": 1 }
```

---

## 🚀 서버리스 배포 시 주의사항

### 1. Connection Pooling

Lambda는 컨테이너를 재사용하므로 연결을 캐싱해야 합니다:

```javascript
// ❌ 나쁜 예: 매번 새로운 연결
export const handler = async (event) => {
  await mongoose.connect(process.env.MONGODB_URI);
  // ...
};

// ✅ 좋은 예: 전역 변수로 캐싱
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // 타임아웃 5초
  });

  cachedDb = mongoose.connection;
  return cachedDb;
}

export const handler = async (event) => {
  await connectToDatabase();
  // ...
};
```

### 2. 환경변수 설정

`serverless.yml`에 MongoDB URI 추가:

```yaml
provider:
  environment:
    MONGODB_URI: ${env:MONGODB_URI}
```

배포 전 `.env` 파일이 있어야 합니다.

### 3. VPC 설정 (선택사항)

보안 강화를 위해 Lambda를 VPC에 배치:

```yaml
provider:
  vpc:
    securityGroupIds:
      - sg-xxxxxx
    subnetIds:
      - subnet-xxxxxx
      - subnet-yyyyyy
```

⚠️ VPC 사용 시 NAT Gateway 비용 발생 (~$30/월)

---

## 📊 모니터링

### Atlas에서 확인할 수 있는 정보

1. **Metrics** 탭
   - 연결 수
   - 쿼리 성능
   - 저장소 사용량

2. **Real-time Performance** 탭
   - 느린 쿼리 추적
   - 인덱스 사용률

3. **Alerts** 설정
   - 저장소 90% 초과 시 이메일 알림
   - 연결 실패 알림

---

## 💰 비용 (무료 티어)

### M0 클러스터 제한
- 저장소: 512MB
- RAM: 공유
- vCPU: 공유
- 동시 연결: 500개
- 백업: 없음

### 언제 업그레이드?
- 저장소 500MB 초과
- 동시 연결 500개 초과
- 전용 리소스 필요
- 자동 백업 필요

→ **M10 클러스터** (~$57/월)

---

## 🐛 트러블슈팅

### 1. "MongoNetworkError: connection timed out"

**원인**: IP 화이트리스트 미설정

**해결**:
1. Atlas → Network Access
2. 현재 IP 추가 또는 `0.0.0.0/0` 추가

### 2. "Authentication failed"

**원인**: 잘못된 사용자명/비밀번호

**해결**:
1. Atlas → Database Access
2. 사용자 확인, 비밀번호 재설정
3. `.env` 파일 업데이트

### 3. "Server selection timed out"

**원인**: 잘못된 Connection String

**해결**:
1. Connection String 재확인
2. 데이터베이스 이름 추가: `...mongodb.net/learning-notes?...`
3. 특수문자 URL 인코딩

### 4. Lambda에서만 연결 실패

**원인**: VPC 설정 오류

**해결**:
1. Lambda를 VPC 외부로 이동 (개발 단계)
2. 또는 NAT Gateway 설정

---

## ✅ 체크리스트

배포 전 확인사항:

- [ ] MongoDB Atlas 클러스터 생성 (M0 무료)
- [ ] 데이터베이스 사용자 생성
- [ ] IP 화이트리스트 설정 (`0.0.0.0/0` 또는 Lambda IP)
- [ ] Connection String 복사
- [ ] `.env` 파일에 `MONGODB_URI` 추가
- [ ] 로컬에서 연결 테스트 성공
- [ ] 인덱스 생성 (성능 최적화)
- [ ] `serverless.yml`에 환경변수 설정
- [ ] Lambda에서 연결 캐싱 구현

---

## 🔗 유용한 링크

- **MongoDB Atlas 문서**: https://www.mongodb.com/docs/atlas/
- **Mongoose 문서**: https://mongoosejs.com/docs/
- **Lambda + MongoDB 가이드**: https://www.mongodb.com/developer/products/atlas/aws-lambda-mongodb/
- **Connection String 형식**: https://www.mongodb.com/docs/manual/reference/connection-string/

---

## 📝 다음 단계

1. 인덱스 생성 스크립트 실행 (`node scripts/createIndexes.js`)
2. 초기 데이터 시딩 (선택사항)
3. 서버리스 배포 (`npm run deploy:dev`)
4. Atlas 모니터링 설정
