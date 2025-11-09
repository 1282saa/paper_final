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

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* 좌측 사이드바 */}
        <Sidebar />

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blank-review" element={<BlankReview />} />
            <Route path="/today-learning" element={<TodayLearning />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/ai-questions" element={<AIQuestions />} />
            <Route path="/ai-tutor" element={<AITutor />} />
          </Routes>
        </main>

        {/* 우측 사이드바 - 랭킹 */}
        <RightSidebar />
      </div>
    </Router>
  );
}

export default App;
