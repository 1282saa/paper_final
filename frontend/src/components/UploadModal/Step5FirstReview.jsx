/**
 * @file Step5FirstReview.jsx
 * @description 업로드 직후 즉시 첫 복습 시작 (백지 복습)
 */

import React, { useState, useRef, useEffect } from "react";

const Step5FirstReview = ({ image, extractedText, onNext, onSkip }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.closePath();

    // 캔버스 상태 저장 (실행 취소용)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory([...canvasHistory, imageData]);

    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasHistory([]);
  };

  const undoDrawing = () => {
    if (canvasHistory.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 마지막 상태 제거
    const newHistory = [...canvasHistory];
    newHistory.pop();
    setCanvasHistory(newHistory);

    // 이전 상태로 복원
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (newHistory.length > 0) {
      ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
    }
  };

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              첫 복습: 백지에 기억나는 내용을 적어보세요!
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              방금 읽은 내용을 떠올리며 백지에 적어보세요.
              완벽하지 않아도 괜찮습니다.
              <span className="font-bold text-emerald-600"> 능동적으로 떠올리는 과정</span>이
              장기 기억에 중요합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 캔버스 & 원본 비교 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 백지 복습 캔버스 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-700">📝 내가 기억하는 내용</h4>
            <div className="flex gap-2">
              <button
                onClick={undoDrawing}
                disabled={canvasHistory.length === 0}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ↶ 실행취소
              </button>
              <button
                onClick={clearCanvas}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🗑️ 전체 지우기
              </button>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={500}
            height={400}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-[400px] bg-white border-2 border-gray-200 rounded-xl cursor-crosshair shadow-inner"
          />
        </div>

        {/* 원본 이미지 & 텍스트 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-700">📖 원본 내용</h4>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                showOriginal
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showOriginal ? '👁️ 숨기기' : '👁️ 보기'}
            </button>
          </div>

          {showOriginal ? (
            <div className="h-[400px] overflow-y-auto bg-white border-2 border-emerald-200 rounded-xl p-4 shadow-inner">
              {image && (
                <img
                  src={image}
                  alt="Original"
                  className="w-full mb-4 rounded-lg"
                />
              )}
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {extractedText}
              </div>
            </div>
          ) : (
            <div className="h-[400px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-sm font-medium">원본 보기 버튼을 눌러주세요</p>
              <p className="text-xs mt-1">기억나지 않을 때 확인하세요</p>
            </div>
          )}
        </div>
      </div>

      {/* 도움말 */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> 원본을 바로 보지 말고, 먼저 기억나는 내용을 적어보세요.
          막히는 부분만 원본을 확인하면서 채워나가는 것이 효과적입니다.
        </p>
      </div>

      {/* 버튼 */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onSkip}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          나중에 복습하기
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          다음: AI 튜터와 대화 →
        </button>
      </div>
    </div>
  );
};

export default Step5FirstReview;
