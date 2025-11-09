/**
 * @file BlankReview.jsx
 * @description 백지복습 페이지 - 백지에 학습 내용을 작성하며 복습
 *
 * @author AI Development Team
 * @created 2025-11-09
 *
 * @route /blank-review
 *
 * @concept
 * 백지복습(Blank Sheet Review)은 학습한 내용을 아무것도 보지 않고
 * 백지에 적어보는 복습 방법으로, 능동적 회상(Active Recall)을 통해
 * 학습 효과를 극대화하는 검증된 학습 기법입니다.
 *
 * @future_features
 * - 캔버스 또는 텍스트 에디터 제공
 * - 작성한 내용 자동 저장
 * - AI를 통한 내용 검토 및 피드백
 * - 학습 주제별 분류 및 관리
 * - 작성 시간 추적
 */

import React from "react";

/**
 * @component BlankReview
 * @description 백지복습 페이지 컴포넌트
 *
 * @returns {JSX.Element} 백지복습 페이지 UI
 *
 * @example
 * <Route path="/blank-review" element={<BlankReview />} />
 */
export const BlankReview = () => {
  return (
    <div className="flex-1 p-8">
      {/* 페이지 타이틀 */}
      <h1 className="text-3xl font-bold text-[#00c288] mb-4">백지복습</h1>

      {/* 페이지 설명 */}
      <p className="text-gray-700">
        백지에 학습한 내용을 자유롭게 작성하며 복습하세요.
      </p>

      {/*
        TODO: 백지복습 에디터 UI 구현
        - 마크다운 에디터 또는 리치 텍스트 에디터
        - 드로잉 캔버스 (손글씨/그림 지원)
        - 주제 선택 드롭다운
        - 타이머 기능
        - 저장/불러오기 기능
      */}
    </div>
  );
};

export default BlankReview;
