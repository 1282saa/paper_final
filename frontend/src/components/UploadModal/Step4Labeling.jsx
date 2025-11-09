/**
 * @file Step4Labeling.jsx
 * @description 4단계: 문서 라벨링 및 저장
 */

import React, { useState } from "react";

const Step4Labeling = ({ onSave, onBack, onClose }) => {
  const [subject, setSubject] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);

  const subjects = ["수학", "영어", "화학", "물리", "역사", "생물", "국어", "기타"];
  const suggestedTags = ["#미분", "#적분", "#확률", "#기하", "#극한", "#함수"];

  const handleAddTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.startsWith('#') ? tagInput : `#${tagInput}`;
      handleAddTag(tag);
    }
  };

  const handleSave = () => {
    if (!subject || !title) {
      return;
    }

    onSave({
      subject,
      tags,
      title,
      date
    });
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-20">
        {/* 성공 애니메이션 */}
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            저장 완료!
          </h3>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                onClose();
                window.location.href = "/";
              }}
              className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border-0 outline-none"
            >
              문서함 보러가기
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = "/review-priority";
              }}
              className="px-8 py-4 bg-[#00c288] text-white font-semibold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none"
            >
              복습 시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          문서 정보를 입력하세요
        </h3>
        <p className="text-sm text-gray-500">
          체계적인 문서 관리를 위해 라벨링이 필요해요
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* 과목 선택 */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-4">
            과목 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-3">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-4 py-3.5 rounded-lg font-semibold transition-all border-0 outline-none ${
                  subject === s
                    ? 'bg-[#00c288] text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 입력 */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-4">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 수학 미분 개념 정리"
            className="w-full px-5 py-4 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c288] focus:bg-white transition-all text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* 태그 입력 */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-4">
            태그
          </label>

          {/* 추천 태그 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                disabled={tags.includes(tag)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border-0 outline-none ${
                  tags.includes(tag)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 태그 입력창 */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="#태그 입력 후 Enter"
              className="flex-1 px-5 py-3.5 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c288] focus:bg-white transition-all text-gray-900 placeholder-gray-400"
            />
            <button
              onClick={() => handleAddTag(tagInput.startsWith('#') ? tagInput : `#${tagInput}`)}
              className="px-6 py-3.5 bg-[#00c288] text-white font-semibold rounded-lg hover:bg-[#00a875] transition-colors border-0 outline-none"
            >
              추가
            </button>
          </div>

          {/* 선택된 태그 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 px-3 py-2 bg-[#00c288] text-white rounded-lg shadow-sm"
                >
                  <span className="text-sm font-medium">{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors border-0 outline-none"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 학습일 */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-4">
            학습일
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c288] focus:bg-white transition-all text-gray-900"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border-0 outline-none"
        >
          이전
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-4 bg-[#00c288] text-white font-bold rounded-lg hover:bg-[#00b077] transition-all border-0 outline-none"
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default Step4Labeling;
