/**
 * @file Step2OCRProcessing.jsx
 * @description 2단계: OCR 텍스트 추출 진행 중
 */

import React from "react";

const Step2OCRProcessing = ({ progress }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-20">
      {/* AI 아이콘 애니메이션 */}
      <div className="relative">
        <div className="w-32 h-32 bg-gradient-to-br from-[#00c288] to-[#00a572] rounded-full flex items-center justify-center animate-pulse">
          <svg
            className="w-16 h-16 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        {/* 회전하는 링 */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00c288] animate-spin"></div>
      </div>

      {/* 메시지 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          AI가 필기를 분석하고 있어요
        </h3>
        <p className="text-sm text-gray-500">
          필기체 인식률 95%, 3초 내 변환 완료!
        </p>
      </div>

      {/* 진행률 바 */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">처리 중...</span>
          <span className="text-sm font-bold text-[#00c288]">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00c288] to-[#00a572] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 프로세스 단계 */}
      <div className="w-full max-w-md mt-4">
        <div className="flex flex-col gap-3">
          <ProcessStep
            iconPath="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            title="이미지 전처리"
            completed={progress > 20}
            active={progress <= 20}
          />
          <ProcessStep
            iconPath="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            title="텍스트 영역 감지"
            completed={progress > 40}
            active={progress > 20 && progress <= 40}
          />
          <ProcessStep
            iconPath="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            title="필기체 인식"
            completed={progress > 70}
            active={progress > 40 && progress <= 70}
          />
          <ProcessStep
            iconPath="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            title="AI 교정 및 구조화"
            completed={progress > 90}
            active={progress > 70 && progress <= 90}
          />
        </div>
      </div>
    </div>
  );
};

const ProcessStep = ({ iconPath, title, completed, active }) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-[#00c28815] to-[#00c28808] border-2 border-[#00c288]'
          : completed
          ? 'bg-emerald-50 border-2 border-emerald-200'
          : 'bg-gray-50 border-2 border-gray-200'
      }`}
    >
      <svg
        className={`w-6 h-6 ${
          active ? 'text-[#00c288]' : completed ? 'text-emerald-600' : 'text-gray-400'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconPath}
        />
      </svg>
      <span
        className={`font-medium ${
          active ? 'text-[#00c288]' : completed ? 'text-emerald-700' : 'text-gray-500'
        }`}
      >
        {title}
      </span>
      {completed && (
        <svg
          className="w-5 h-5 text-emerald-500 ml-auto"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {active && (
        <div className="ml-auto">
          <div className="w-4 h-4 border-2 border-[#00c288] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default Step2OCRProcessing;
