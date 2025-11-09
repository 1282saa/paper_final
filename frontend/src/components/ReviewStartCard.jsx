import React from "react";
import { useNavigate } from "react-router-dom";
import { IconClipboardCheck } from "./IconClipboardCheck";

export const ReviewStartCard = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-[600px] h-[480px] bg-white rounded-[40px] overflow-hidden shadow-lg">
      <img
        className="absolute top-[165px] left-[20px] w-[320px] h-[295px] aspect-[1.13] object-cover"
        alt="Review Image"
        src="https://c.animaapp.com/lBqFBRLr/img/image-16@2x.png"
      />

      <div className="absolute top-10 left-11 font-['Pretendard_Variable'] font-semibold text-black text-3xl tracking-[-0.60px] leading-[33.6px] whitespace-nowrap">
        복습하기
      </div>

      <button
        onClick={() => navigate("/review-priority")}
        className="absolute top-[365px] left-[calc(50.00%_+_25px)] w-[230px] h-[75px] flex bg-[#21212f] rounded-[32px] shadow-[0px_2px_4px_#0000000a] hover:bg-[#2a2a3a] transition-colors cursor-pointer border-0 outline-none"
      >
        <div className="inline-flex mt-6 w-[165px] h-[26px] ml-8 relative items-center gap-1">
          <IconClipboardCheck
            className="!aspect-[1] !relative !left-[unset] !top-[unset]"
            iconClipboardCheck="https://c.animaapp.com/lBqFBRLr/img/icon-clipboard-check-1.svg"
          />
          <div className="relative w-fit mt-[-1.00px] font-['Pretendard'] font-semibold text-white text-lg tracking-[-0.40px] leading-[22.4px] whitespace-nowrap">
            백지 복습 시작하기
          </div>

          <div className="absolute top-1 left-[15px] w-1.5 h-1.5 bg-[#f1706d] rounded-[3px]" />
        </div>
      </button>

      <p className="absolute top-[88px] left-11 w-[500px] font-['Pretendard'] font-medium text-[#767676] text-xl tracking-[-0.50px] leading-[30.0px]">
        최근 7일 간 복습 지속률이 82%예요!&nbsp;&nbsp;이번주도 정말 잘 하고
        있어요. 오후 공부 시작해볼까요?
      </p>
    </div>
  );
};
