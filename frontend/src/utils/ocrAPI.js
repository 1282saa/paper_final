/**
 * OCR API 호출 유틸리티
 *
 * 로컬 개발 시: Mock 데이터 사용
 * 프로덕션: 실제 AWS Lambda API 호출
 */

// API 기본 URL (환경 변수로 설정 가능)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// 개발 모드 여부
const IS_DEV = import.meta.env.DEV;

/**
 * 이미지를 Base64로 변환
 */
const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * OCR 처리 (이미지 → 텍스트 추출)
 *
 * @param {File|string} imageInput - File 객체 또는 이미지 URL
 * @param {Function} onProgress - 진행률 콜백 (0-100)
 * @returns {Promise<{success: boolean, text: string, confidence: number}>}
 */
export const processOCR = async (imageInput, onProgress = null) => {
  try {
    // 진행률 업데이트
    const updateProgress = (progress) => {
      if (onProgress) onProgress(progress);
    };

    updateProgress(10);

    // 이미지를 Base64로 변환
    let imageData;
    if (typeof imageInput === "string") {
      // 이미지 URL인 경우
      imageData = imageInput;
    } else {
      // File 객체인 경우
      imageData = await imageToBase64(imageInput);
    }

    updateProgress(30);

    // 개발 모드: Mock 데이터 반환
    if (IS_DEV && !API_BASE_URL.includes("amazonaws")) {
      console.log("[DEV MODE] Using mock OCR data");

      // 진행률 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      updateProgress(50);

      await new Promise(resolve => setTimeout(resolve, 500));
      updateProgress(70);

      await new Promise(resolve => setTimeout(resolve, 500));
      updateProgress(90);

      await new Promise(resolve => setTimeout(resolve, 300));
      updateProgress(100);

      return {
        success: true,
        text: `미분의 정의

함수 f(x)의 x=a에서의 미분계수는 다음과 같이 정의된다.

f'(a) = lim(h→0) [f(a+h) - f(a)] / h

체인룰 (Chain Rule)
합성함수의 미분: (f∘g)'(x) = f'(g(x)) · g'(x)

미분의 기본 공식
1. (x^n)' = nx^(n-1)
2. (sin x)' = cos x
3. (cos x)' = -sin x
4. (e^x)' = e^x
5. (ln x)' = 1/x`,
        confidence: 0.95,
        character_count: 245,
        line_count: 15
      };
    }

    // 프로덕션: 실제 API 호출
    updateProgress(50);

    const response = await fetch(`${API_BASE_URL}/api/ocr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageData,
      }),
    });

    updateProgress(80);

    if (!response.ok) {
      throw new Error(`OCR API Error: ${response.statusText}`);
    }

    const result = await response.json();

    updateProgress(100);

    return result;

  } catch (error) {
    console.error("OCR 처리 오류:", error);
    throw error;
  }
};

/**
 * OCR + LLM 통합 처리 (이미지 → OCR → AI 정제)
 *
 * @param {File|string} imageInput - File 객체 또는 이미지 URL
 * @param {Function} onProgress - 진행률 콜백 (0-100)
 * @returns {Promise<{success: boolean, original: object, processed: object}>}
 */
export const processOCRWithLLM = async (imageInput, onProgress = null) => {
  try {
    const updateProgress = (progress) => {
      if (onProgress) onProgress(progress);
    };

    updateProgress(10);

    // 이미지를 Base64로 변환
    let imageData;
    if (typeof imageInput === "string") {
      imageData = imageInput;
    } else {
      imageData = await imageToBase64(imageInput);
    }

    updateProgress(20);

    // 개발 모드: Mock 데이터 반환
    if (IS_DEV && !API_BASE_URL.includes("amazonaws")) {
      console.log("[DEV MODE] Using mock OCR+LLM data");

      await new Promise(resolve => setTimeout(resolve, 800));
      updateProgress(50);

      await new Promise(resolve => setTimeout(resolve, 800));
      updateProgress(80);

      await new Promise(resolve => setTimeout(resolve, 500));
      updateProgress(100);

      return {
        success: true,
        original: {
          text: "미분의 정의\n\nf'(a) = lim(h→0) [f(a+h) - f(a)] / h\n\n체인룰...",
          confidence: 0.92,
          character_count: 245
        },
        processed: {
          title: "미분의 기본 개념",
          content: `# 미분의 정의

함수 f(x)의 x=a에서의 미분계수는 다음과 같이 정의된다.

f'(a) = lim(h→0) [f(a+h) - f(a)] / h

## 체인룰 (Chain Rule)
합성함수의 미분: (f∘g)'(x) = f'(g(x)) · g'(x)

## 미분의 기본 공식
1. (x^n)' = nx^(n-1)
2. (sin x)' = cos x
3. (cos x)' = -sin x
4. (e^x)' = e^x
5. (ln x)' = 1/x`
        }
      };
    }

    // 프로덕션: 실제 API 호출
    updateProgress(40);

    const response = await fetch(`${API_BASE_URL}/api/ocr-llm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageData,
      }),
    });

    updateProgress(90);

    if (!response.ok) {
      throw new Error(`OCR+LLM API Error: ${response.statusText}`);
    }

    const result = await response.json();

    updateProgress(100);

    return result;

  } catch (error) {
    console.error("OCR+LLM 처리 오류:", error);
    throw error;
  }
};

/**
 * AI 문제 생성
 *
 * @param {string} text - 학습 내용 텍스트
 * @param {string} subject - 과목 (예: "수학", "과학", "영어")
 * @param {string} difficulty - 난이도 ("easy", "medium", "hard")
 * @param {number} count - 생성할 문제 개수
 * @returns {Promise<{success: boolean, questions: Array}>}
 */
export const generateQuestions = async (text, subject = "일반", difficulty = "medium", count = 3) => {
  try {
    // 개발 모드: Mock 데이터 반환
    if (IS_DEV && !API_BASE_URL.includes("amazonaws")) {
      console.log("[DEV MODE] Using mock question generation data");

      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        questions: [
          {
            id: 1,
            question: `${text.substring(0, 30)}... 에서 핵심 개념은?`,
            type: "short-answer",
            difficulty: difficulty,
            answer: "미분의 정의와 기본 공식",
            explanation: "제공된 텍스트의 주요 내용을 요약한 것입니다."
          },
          {
            id: 2,
            question: "다음 중 미분의 기본 성질로 옳은 것은?",
            type: "multiple-choice",
            difficulty: difficulty,
            options: [
              "(f + g)' = f' + g'",
              "(fg)' = f'g'",
              "(f/g)' = f'/g'",
              "(f∘g)' = f'∘g'"
            ],
            answer: "(f + g)' = f' + g'",
            explanation: "미분의 선형성에 따라 합의 미분은 미분의 합과 같습니다."
          },
          {
            id: 3,
            question: "체인룰(연쇄법칙)을 설명하고, 예시를 들어 적용하시오.",
            type: "essay",
            difficulty: difficulty,
            answer: "합성함수 (f∘g)(x)의 미분은 (f∘g)'(x) = f'(g(x)) · g'(x)입니다. 예: h(x) = (x²+1)³일 때, h'(x) = 3(x²+1)² · 2x = 6x(x²+1)²",
            explanation: "체인룰은 바깥 함수의 미분과 안쪽 함수의 미분을 곱하는 규칙입니다."
          }
        ].slice(0, count)
      };
    }

    // 프로덕션: 실제 API 호출
    const response = await fetch(`${API_BASE_URL}/api/generate-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        subject,
        difficulty,
        count,
      }),
    });

    if (!response.ok) {
      throw new Error(`Question Generation API Error: ${response.statusText}`);
    }

    const result = await response.json();

    return result;

  } catch (error) {
    console.error("문제 생성 오류:", error);
    throw error;
  }
};
