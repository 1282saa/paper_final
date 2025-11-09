/**
 * @file App.jsx
 * @description 메인 애플리케이션 컴포넌트
 *
 * @layout
 * ┌──────────────────────────────────────────────────────────┐
 * │  Sidebar (309px)  │  Main Content (flex-1)  │  RightSidebar (480px)  │
 * │  lg: 260px        │                          │  lg: 400px, md: 360px  │
 * │  md: hidden       │                          │  sm: hidden             │
 * └──────────────────────────────────────────────────────────┘
 *
 * @responsive_breakpoints
 * - xl (1280px+): 모든 사이드바 표시
 * - lg (1024px): Sidebar 260px, RightSidebar 400px
 * - md (768px): Sidebar 숨김, RightSidebar 360px
 * - sm (640px-): 메인 콘텐츠만 표시
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { RightSidebar } from "./components/RightSidebar";
import Home from "./pages/Home";
import BlankReview from "./pages/BlankReview";
import TodayLearning from "./pages/TodayLearning";
import Statistics from "./pages/Statistics";
import AIQuestions from "./pages/AIQuestions";
import AITutor from "./pages/AITutor";
import ReviewPriority from "./pages/ReviewPriority";
import BlankReviewPage from "./pages/BlankReviewPage";
import ForgettingCurve from "./pages/ForgettingCurve";
import AIQuestionGenerator from "./pages/AIQuestionGenerator";
import DocumentLibrary from "./pages/DocumentLibrary";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
        {/* 좌측 사이드바 - lg 이상에서만 표시 */}
        <Sidebar />

        {/* 메인 콘텐츠 영역 - 반응형 width */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/document-library" element={<DocumentLibrary />} />
            <Route path="/review-priority" element={<ReviewPriority />} />
            <Route path="/blank-review" element={<BlankReview />} />
            <Route path="/blank-review/:id" element={<BlankReviewPage />} />
            <Route path="/forgetting-curve" element={<ForgettingCurve />} />
            <Route path="/ai-question-generator" element={<AIQuestionGenerator />} />
            <Route path="/today-learning" element={<TodayLearning />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/ai-questions" element={<AIQuestions />} />
            <Route path="/ai-tutor" element={<AITutor />} />
          </Routes>
        </main>

        {/* 우측 사이드바 - xl 이상에서만 표시 (TODO: md 대응) */}
        <RightSidebar />
      </div>
    </Router>
  );
}

export default App;
