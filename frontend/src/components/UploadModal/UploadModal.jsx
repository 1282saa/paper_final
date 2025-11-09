/**
 * @file UploadModal.jsx
 * @description 이미지 업로드 → OCR → 라벨링 → 저장 4단계 모달
 */

import React, { useState } from "react";
import Step1ImageUpload from "./Step1ImageUpload";
import Step2OCRProcessing from "./Step2OCRProcessing";
import Step3TextEdit from "./Step3TextEdit";
import Step4Labeling from "./Step4Labeling";
import { saveDocument } from "../../utils/documentStorage";
import { processOCRWithLLM } from "../../utils/ocrAPI";

export const UploadModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [documentData, setDocumentData] = useState({
    subject: "",
    tags: [],
    date: new Date().toISOString().split("T")[0],
    title: "",
  });

  if (!isOpen) return null;

  const handleImageUpload = async (image) => {
    setUploadedImage(image);
    setCurrentStep(2);
    setOcrProgress(0);

    try {
      // 실제 OCR API 호출 (개발 모드에서는 Mock 데이터 사용)
      const result = await processOCRWithLLM(
        image,
        (progress) => setOcrProgress(progress)
      );

      if (result.success) {
        // LLM으로 정제된 텍스트 사용
        setExtractedText(result.processed.content || result.original.text);

        // 자동으로 제목 생성 (LLM이 생성한 제목 사용)
        if (result.processed.title) {
          setDocumentData(prev => ({
            ...prev,
            title: result.processed.title
          }));
        }

        setTimeout(() => setCurrentStep(3), 500);
      } else {
        console.error("OCR 실패:", result.error);
        alert("텍스트 추출에 실패했습니다. 다시 시도해주세요.");
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("OCR 오류:", error);
      alert("텍스트 추출 중 오류가 발생했습니다.");
      setCurrentStep(1);
    }
  };

  const handleTextEdit = (text) => {
    setExtractedText(text);
    setCurrentStep(4);
  };

  const handleSave = (data) => {
    try {
      const savedDoc = saveDocument({
        ...data,
        imageUrl: uploadedImage,
        extractedText: extractedText,
      });

      setDocumentData(data);
      console.log("문서 저장 완료:", savedDoc);
    } catch (error) {
      console.error("문서 저장 실패:", error);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setUploadedImage(null);
    setExtractedText("");
    setOcrProgress(0);
    setDocumentData({
      subject: "",
      tags: [],
      date: new Date().toISOString().split("T")[0],
      title: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              필기 노트 업로드
            </h2>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step <= currentStep ? "bg-[#00c288] w-8" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 모달 본문 - 스크롤 가능 */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-10">
          {currentStep === 1 && (
            <Step1ImageUpload onUpload={handleImageUpload} />
          )}

          {currentStep === 2 && <Step2OCRProcessing progress={ocrProgress} />}

          {currentStep === 3 && (
            <Step3TextEdit
              image={uploadedImage}
              text={extractedText}
              onNext={handleTextEdit}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 4 && (
            <Step4Labeling
              onSave={handleSave}
              onBack={() => setCurrentStep(3)}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};
