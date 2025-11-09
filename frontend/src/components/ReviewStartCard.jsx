import React from "react";
import { IconClipboardCheck } from "./IconClipboardCheck";

export const ReviewStartCard = () => {
  return (
    <div className="relative w-[494px] h-[394px] bg-white rounded-[40px] overflow-hidden shadow-lg">
      <img
        className="absolute top-[134px] left-[17px] w-[266px] h-[246px] aspect-[1.13] object-cover"
        alt="Review Image"
        src="https://c.animaapp.com/lBqFBRLr/img/image-16@2x.png"
      />

      <div className="absolute top-8 left-9 font-['Pretendard_Variable'] font-semibold text-black text-2xl tracking-[-0.60px] leading-[33.6px] whitespace-nowrap">
        복습하기
      </div>

      <button className="absolute top-[300px] left-[calc(50.00%_+_20px)] w-[195px] h-[62px] flex bg-[#21212f] rounded-[32px] shadow-[0px_2px_4px_#0000000a] hover:bg-[#2a2a3a] transition-colors cursor-pointer">
        <div className="inline-flex mt-5 w-[139px] h-[22px] ml-7 relative items-center gap-1">
          <IconClipboardCheck
            className="!aspect-[1] !relative !left-[unset] !top-[unset]"
            iconClipboardCheck="https://c.animaapp.com/lBqFBRLr/img/icon-clipboard-check-1.svg"
          />
          <div className="relative w-fit mt-[-1.00px] font-['Pretendard'] font-semibold text-white text-base tracking-[-0.40px] leading-[22.4px] whitespace-nowrap">
            백지 복습 시작하기
          </div>

          <div className="absolute top-1 left-[13px] w-1.5 h-1.5 bg-[#f1706d] rounded-[3px]" />
        </div>
      </button>

      <p className="absolute top-[73px] left-9 w-[415px] font-['Pretendard'] font-medium text-[#767676] text-xl tracking-[-0.50px] leading-[28.0px]">
        최근 7일 간 복습 지속률이 82%예요!&nbsp;&nbsp;이번주도 정말 잘 하고
        있어요. 오후 공부 시작해볼까요?
      </p>
    </div>
  );
};
