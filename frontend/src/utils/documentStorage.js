/**
 * @file documentStorage.js
 * @description LocalStorage 기반 문서 저장 및 관리 유틸리티
 */

const STORAGE_KEY = "ai_learning_documents";

/**
 * 모든 문서 가져오기
 */
export const getAllDocuments = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const documents = JSON.parse(data);
    // Date 객체로 변환
    return documents.map(doc => ({
      ...doc,
      savedDate: new Date(doc.savedDate),
      lastReviewDate: doc.lastReviewDate ? new Date(doc.lastReviewDate) : null,
    }));
  } catch (error) {
    console.error("문서 로드 실패:", error);
    return [];
  }
};

/**
 * ID로 문서 가져오기
 */
export const getDocumentById = (id) => {
  const documents = getAllDocuments();
  return documents.find(doc => doc.id === parseInt(id));
};

/**
 * 새 문서 저장
 */
export const saveDocument = (documentData) => {
  try {
    const documents = getAllDocuments();

    // 새 문서 ID 생성 (기존 최대 ID + 1)
    const newId = documents.length > 0
      ? Math.max(...documents.map(d => d.id)) + 1
      : 1;

    const newDocument = {
      id: newId,
      subject: documentData.subject,
      title: documentData.title,
      tags: documentData.tags,
      imageUrl: documentData.imageUrl,
      extractedText: documentData.extractedText,
      savedDate: new Date().toISOString(),
      reviewCount: 0,
      lastReviewDate: null,
      reviewHistory: [],
      // 망각곡선 관련
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1일 후
      reviewStage: 0, // 0: 1일, 1: 3일, 2: 7일, 3: 14일, 4: 30일
    };

    documents.push(newDocument);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));

    return newDocument;
  } catch (error) {
    console.error("문서 저장 실패:", error);
    throw error;
  }
};

/**
 * 문서 업데이트
 */
export const updateDocument = (id, updates) => {
  try {
    const documents = getAllDocuments();
    const index = documents.findIndex(doc => doc.id === parseInt(id));

    if (index === -1) {
      throw new Error("문서를 찾을 수 없습니다.");
    }

    documents[index] = {
      ...documents[index],
      ...updates,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    return documents[index];
  } catch (error) {
    console.error("문서 업데이트 실패:", error);
    throw error;
  }
};

/**
 * 복습 완료 기록
 */
export const recordReview = (id, score = null) => {
  try {
    const documents = getAllDocuments();
    const doc = documents.find(d => d.id === parseInt(id));

    if (!doc) {
      throw new Error("문서를 찾을 수 없습니다.");
    }

    // 복습 횟수 증가
    doc.reviewCount = (doc.reviewCount || 0) + 1;
    doc.lastReviewDate = new Date().toISOString();

    // 복습 히스토리에 추가
    if (!doc.reviewHistory) doc.reviewHistory = [];
    doc.reviewHistory.push({
      date: new Date().toISOString(),
      score: score,
      stage: doc.reviewStage,
    });

    // 망각곡선 단계 업데이트
    const reviewIntervals = [1, 3, 7, 14, 30]; // 일 단위
    doc.reviewStage = Math.min(doc.reviewStage + 1, reviewIntervals.length - 1);

    // 다음 복습 날짜 설정
    const nextInterval = reviewIntervals[doc.reviewStage];
    doc.nextReviewDate = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    return doc;
  } catch (error) {
    console.error("복습 기록 실패:", error);
    throw error;
  }
};

/**
 * 문서 삭제
 */
export const deleteDocument = (id) => {
  try {
    const documents = getAllDocuments();
    const filtered = documents.filter(doc => doc.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("문서 삭제 실패:", error);
    throw error;
  }
};

/**
 * 과목별 문서 가져오기
 */
export const getDocumentsBySubject = (subject) => {
  const documents = getAllDocuments();
  if (subject === "전체") return documents;
  return documents.filter(doc => doc.subject === subject);
};

/**
 * 오늘 복습할 문서 가져오기
 */
export const getTodayReviewDocuments = () => {
  const documents = getAllDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return documents.filter(doc => {
    const nextReview = new Date(doc.nextReviewDate);
    nextReview.setHours(0, 0, 0, 0);
    return nextReview <= today;
  });
};

/**
 * 복습 우선순위별 문서 가져오기
 */
export const getDocumentsByPriority = () => {
  const documents = getAllDocuments();
  const now = Date.now();

  return documents.map(doc => {
    const daysSinceLastReview = doc.lastReviewDate
      ? Math.floor((now - new Date(doc.lastReviewDate).getTime()) / (1000 * 60 * 60 * 24))
      : Math.floor((now - new Date(doc.savedDate).getTime()) / (1000 * 60 * 60 * 24));

    let priority;
    if (daysSinceLastReview <= 1 && doc.reviewCount === 0) {
      priority = { level: "urgent", label: "긴급", color: "red", daysLabel: "1일차" };
    } else if (daysSinceLastReview >= 1 && daysSinceLastReview <= 3) {
      priority = { level: "important", label: "중요", color: "orange", daysLabel: "3일차" };
    } else if (daysSinceLastReview >= 4 && daysSinceLastReview <= 7) {
      priority = { level: "recommended", label: "권장", color: "yellow", daysLabel: "7일차" };
    } else {
      priority = { level: "optional", label: "선택", color: "green", daysLabel: "14일차" };
    }

    return { ...doc, priority, daysSinceLastReview };
  }).sort((a, b) => a.daysSinceLastReview - b.daysSinceLastReview);
};

/**
 * 통계 데이터 가져오기
 */
export const getStatistics = () => {
  const documents = getAllDocuments();
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  return {
    totalDocuments: documents.length,
    thisWeekAdded: documents.filter(d => new Date(d.savedDate).getTime() > weekAgo).length,
    reviewedDocuments: documents.filter(d => d.reviewCount > 0).length,
    pendingReviews: documents.filter(d => d.reviewCount === 0).length,
    todayReviews: getTodayReviewDocuments().length,
  };
};
