import React from "react";
import { ImageUploadCard } from "../components/ImageUploadCard";
import { ReviewStartCard } from "../components/ReviewStartCard";

export const Home = () => {
  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* 상단 카드 영역 - 좌우 배치 */}
      <div className="flex gap-6 mb-8">
        {/* 좌측 상단 - 필기 사진 업로드 */}
        <ImageUploadCard />

        {/* 우측 상단 - 복습하기 */}
        <ReviewStartCard />
      </div>

      {/* 하단 영역 - 추후 추가 예정 */}
      <div className="mt-8">
        {/* TODO: 추가 대시보드 위젯 */}
      </div>
    </div>
  );
};

export default Home;
