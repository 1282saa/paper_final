# 🎉 OCR 서비스 배포 완료!

## ✅ 배포 완료 사항

### 1. AWS Lambda 서버리스 배포 성공
- **배포 날짜**: 2025-11-09
- **환경**: dev (개발 환경)
- **리전**: ap-northeast-2 (서울)
- **스택**: ai-learning-ocr-dev

### 2. API 엔드포인트
**Base URL**: `https://3asa7jtr4j.execute-api.ap-northeast-2.amazonaws.com/dev`

#### 사용 가능한 API

1. **OCR 처리** - `/api/ocr`
   - Method: POST
   - 기능: 이미지 → 텍스트 추출 (AWS Textract)
   - 입력: `{"image": "data:image/jpeg;base64,..."}`
   - 출력: `{"success": true, "text": "...", "confidence": 0.95}`

2. **AI 문제 생성** - `/api/generate-questions`
   - Method: POST
   - 기능: 텍스트 → AI 학습 문제 생성 (Claude Sonnet 4.5)
   - 입력: `{"text": "...", "subject": "수학", "difficulty": "medium", "count": 3}`
   - 출력: `{"success": true, "questions": [...]}`

3. **OCR + LLM 통합** - `/api/ocr-llm`
   - Method: POST
   - 기능: 이미지 → OCR → LLM 정제 (원스톱 처리)
   - 입력: `{"image": "data:image/jpeg;base64,..."}`
   - 출력: `{"success": true, "original": {...}, "processed": {...}}`

### 3. Lambda 함수
- ✅ `processOCR` (21 MB) - OCR 처리
- ✅ `generateQuestions` (21 MB) - 문제 생성
- ✅ `processOCRWithLLM` (21 MB) - 통합 처리

### 4. IAM 권한 (자동 설정됨)
- ✅ CloudWatch Logs (로깅)
- ✅ AWS Textract (OCR)
- ✅ AWS Bedrock (Claude Sonnet 4.5 LLM)

## 🔧 기술 스택 변경

### OpenAI → AWS Bedrock 전환 완료

**변경 이유**:
- ✅ OpenAI API 키 불필요 (월 $30-50 절약)
- ✅ backend와 동일한 Claude Sonnet 4.5 사용 (일관성)
- ✅ AWS 통합 관리 (IAM 기반 인증)
- ✅ 비용 효율적

**변경된 파일**:
1. `bedrock_llm.py` (신규) - Bedrock Claude 모듈
2. `handler.py` - OpenAI → Bedrock 전환
3. `requirements.txt` - `openai` 제거
4. `serverless.yml` - Bedrock 권한 추가, OpenAI 환경 변수 제거
5. `.env` - OpenAI API 키 불필요 표시

## 💰 예상 비용

### 무료 티어 사용 시 (월 ~100회)
- **AWS Textract**: $0 (무료 1,000 페이지/월)
- **AWS Lambda**: $0 (무료 100만 요청/월)
- **AWS Bedrock**: ~$5-10 (Claude Sonnet 4.5)

**총 예상 비용**: 월 $5-10

### 실 사용 시 (월 ~1,000회)
- **AWS Textract**: $0 (무료)
- **AWS Lambda**: $0 (무료)
- **AWS Bedrock**: ~$30-50

**총 예상**: 월 $30-50

## 🚀 프론트엔드 연동

### 환경 변수 설정 완료
파일: `frontend/.env.local`
```bash
VITE_API_BASE_URL=https://3asa7jtr4j.execute-api.ap-northeast-2.amazonaws.com/dev
```

### API 호출 자동화
- `frontend/src/utils/ocrAPI.js`가 자동으로 프로덕션 API 호출
- Mock 데이터 비활성화됨
- 실제 AWS Lambda와 연결됨

## 📊 배포 상태

```
✔ Service deployed to stack ai-learning-ocr-dev (289s)
```

### Lambda Layer
- `pythonRequirements`: arn:aws:lambda:ap-northeast-2:887078546492:layer:ai-learning-ocr-dev-python-requirements:1
- 크기: 21 MB (boto3, Pillow 포함)

## 🧪 테스트 방법

### 1. 프론트엔드에서 테스트
```bash
cd frontend
npm run dev
```

1. 브라우저에서 `http://localhost:5173` 접속
2. "이미지 업로드" 클릭
3. 손글씨 노트 이미지 업로드
4. OCR 결과 확인 (실제 AWS Textract 사용)
5. "AI 문제 생성" 클릭
6. Claude Sonnet 4.5가 생성한 문제 확인

### 2. cURL로 직접 테스트

#### OCR 테스트
```bash
# 테스트 이미지를 Base64로 인코딩
base64 -i test.jpg | tr -d '\n' > img.txt

# API 호출
curl -X POST https://3asa7jtr4j.execute-api.ap-northeast-2.amazonaws.com/dev/api/ocr \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,'$(cat img.txt)'"}'
```

#### AI 문제 생성 테스트
```bash
curl -X POST https://3asa7jtr4j.execute-api.ap-northeast-2.amazonaws.com/dev/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "text": "미분의 정의: f'\''(a) = lim(h→0) [f(a+h) - f(a)] / h",
    "subject": "수학",
    "difficulty": "medium",
    "count": 3
  }'
```

## 📝 로그 확인

```bash
# 실시간 로그
cd ocr-service
serverless logs -f processOCR -t

# 또는
npm run logs:ocr
```

## 🔄 재배포 방법

코드 수정 후:
```bash
cd ocr-service
serverless deploy --stage dev
```

## 🗑️ 삭제 방법

서비스 삭제 시:
```bash
cd ocr-service
serverless remove --stage dev
```

## ⚠️ 참고사항

### Python 3.12 경고
```
Warning: Invalid configuration encountered
  at 'provider.runtime': must be equal to one of the allowed values
```
- 이 경고는 무시해도 됩니다
- Python 3.12는 정상 작동하며 배포 성공
- Serverless Framework가 아직 3.12를 공식 목록에 추가하지 않았을 뿐

### CORS 설정
- 모든 API에 CORS 활성화됨 (`Access-Control-Allow-Origin: *`)
- OPTIONS 프리플라이트 요청 지원

## 🎯 다음 단계

1. ✅ **실제 OCR 테스트** - 프론트엔드에서 이미지 업로드 테스트
2. **사용자 피드백 수집** - OCR 정확도 및 문제 생성 품질 확인
3. **프로덕션 배포** (선택) - `serverless deploy --stage prod`
4. **모니터링 설정** (선택) - CloudWatch 대시보드 구성

---

**배포 완료!** 🚀

이제 사용자들이 실제로 손글씨 노트를 업로드하고 AI 문제를 생성할 수 있습니다.

**테스트해보세요**:
1. `http://localhost:5173` 접속
2. 이미지 업로드
3. OCR + AI 문제 생성 확인!
