/**
 * @file Step1ImageUpload.jsx
 * @description 1단계: 이미지 드래그앤드롭 또는 파일 선택
 */

import React, { useState, useRef } from "react";

const Step1ImageUpload = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onUpload(previewUrl);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          필기 사진을 업로드하세요
        </h3>
        <p className="text-sm text-gray-500">
          사진을 붙여넣기 하거나 마우스로 끌어 놓으세요
        </p>
      </div>

      {!previewUrl ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full h-[400px] rounded-[32px] border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? 'border-[#00c288] bg-gradient-to-br from-[#00c28808] to-[#00c28815]'
              : 'border-gray-300 hover:border-[#00c288] hover:bg-gray-50'
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            {/* Upload Icon */}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragging ? 'bg-[#00c288] scale-110' : 'bg-gray-100'
            }`}>
              <svg
                className={`w-12 h-12 transition-colors ${
                  isDragging ? 'text-white' : 'text-gray-400'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragging ? '여기에 놓으세요' : '이미지를 드래그하여 업로드'}
              </p>
              <p className="text-sm text-gray-500 mb-4">또는</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-[#00c288] text-white font-semibold rounded-xl hover:bg-[#00a875] transition-colors border-0 outline-none"
              >
                파일 선택하기
              </button>
            </div>

            <p className="text-xs text-gray-400">
              지원 형식: JPG, PNG, HEIC (최대 10MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="w-full flex flex-col gap-6">
          {/* 미리보기 */}
          <div className="relative w-full h-[400px] rounded-[32px] overflow-hidden border-2 border-[#00c288] bg-gray-50">
            <img
              src={previewUrl}
              alt="업로드된 이미지"
              className="w-full h-full object-contain"
            />
            <button
              onClick={handleReset}
              className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 확인 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors border-0 outline-none"
            >
              다시 선택
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-4 bg-[#00c288] text-white font-semibold rounded-xl hover:bg-[#00a875] transition-colors shadow-lg border-0 outline-none"
            >
              다음 단계로
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1ImageUpload;
