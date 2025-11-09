import React from "react";

export const ImageUploadCard = () => {
  return (
    <div className="relative w-[600px] h-[480px] bg-white rounded-[40px] overflow-hidden shadow-lg">
      <div className="absolute top-10 left-11 font-['Pretendard_Variable'] font-semibold text-black text-3xl tracking-[-0.60px] leading-[33.6px] whitespace-nowrap">
        필기 사진 업로드
      </div>

      <p className="absolute top-[80px] left-11 font-['Pretendard_Variable'] font-normal text-[#767676] text-lg tracking-[-0.40px] leading-[22.4px] whitespace-nowrap">
        사진을 붙여넣기 하거나 마우스로 끌어 놓으세요
      </p>

      <div className="absolute top-[150px] left-[48px] w-[500px] h-[290px] flex rounded-[32px] overflow-hidden border border-dashed border-[#828282]">
        <div className="flex mt-[40px] w-[200px] h-[220px] ml-[150px] relative flex-col items-center gap-[30px]">
          <img
            className="relative w-[85px] h-[85px]"
            alt="Upload Icon"
            src="https://c.animaapp.com/CY4FBmsG/img/frame-1707481761.svg"
          />

          <div className="flex items-center gap-[18px] relative self-stretch w-full flex-[0_0_auto]">
            <img
              className="relative w-[75px] h-px object-cover"
              alt="Line"
              src="https://c.animaapp.com/CY4FBmsG/img/line-29.svg"
            />

            <div className="relative w-fit mt-[-1.00px] font-['Pretendard_Variable'] font-normal text-[#c9c9c9] text-[15px] tracking-[-0.33px] leading-[18.2px] whitespace-nowrap">
              OR
            </div>

            <img
              className="relative w-[75px] h-px object-cover"
              alt="Line"
              src="https://c.animaapp.com/CY4FBmsG/img/line-29.svg"
            />
          </div>

          <button className="flex w-[160px] items-center justify-center gap-2.5 p-3 relative flex-[0_0_auto] bg-[#00c288] rounded-xl hover:bg-[#00a875] transition-colors cursor-pointer border-0 outline-none">
            <div className="relative w-fit mt-[-1.00px] font-['Pretendard_Variable'] font-semibold text-white text-lg tracking-[-0.40px] leading-[22.4px] whitespace-nowrap">
              이미지 선택하기
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
