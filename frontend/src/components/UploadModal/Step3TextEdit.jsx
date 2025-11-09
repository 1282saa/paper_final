/**
 * @file Step3TextEdit.jsx
 * @description 3단계: 추출된 텍스트 확인 및 수정
 */

import React, { useState } from "react";

const Step3TextEdit = ({ image, text, onNext, onBack }) => {
  const [editedText, setEditedText] = useState(text);

  const handleNext = () => {
    onNext(editedText);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          추출 결과를 확인하고 수정하세요
        </h3>
        <p className="text-sm text-gray-500">
          AI가 인식한 텍스트를 편집할 수 있습니다
        </p>
      </div>

      {/* 인식률 표시 */}
      <div className="flex items-center justify-center gap-4 px-6 py-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-emerald-700">인식률:</span>
          <span className="text-2xl font-bold text-emerald-600">95%</span>
        </div>
        <div className="h-6 w-px bg-emerald-300"></div>
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-semibold text-emerald-700">처리 시간:</span>
          <span className="text-xl font-bold text-emerald-600">2.8초</span>
        </div>
      </div>

      {/* 좌우 분할: 원본 이미지 vs 추출된 텍스트 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 왼쪽: 원본 이미지 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            원본 이미지
          </h4>
          <div className="relative h-[450px] rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50">
            <img
              src={image}
              alt="원본"
              className="w-full h-full object-contain"
            />
            <button className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700 hover:bg-white transition-colors shadow-md border-0 outline-none flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              확대
            </button>
          </div>
        </div>

        {/* 오른쪽: 추출된 텍스트 */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00c288] rounded-full"></span>
            추출된 텍스트 (편집 가능)
          </h4>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="h-[450px] px-5 py-4 border-2 border-[#00c288] rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-[#00c28820] transition-all font-['Pretendard'] text-gray-800 leading-relaxed"
            placeholder="추출된 텍스트가 여기에 표시됩니다..."
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>자유롭게 수정하세요</span>
            <span>{editedText.length} 글자</span>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors border-0 outline-none"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-4 bg-[#00c288] text-white font-semibold rounded-xl hover:bg-[#00a875] transition-colors shadow-lg border-0 outline-none"
        >
          다음 단계로
        </button>
      </div>
    </div>
  );
};

export default Step3TextEdit;
