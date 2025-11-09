import React from "react";
import { IconCheveronLeft } from "../IconCheveronLeft";
import { IconCheveronRight } from "../IconCheveronRight";

export const RightSidebar = () => {
  return (
    <div className="w-[480px] h-screen bg-white flex-shrink-0 border-l border-gray-200 overflow-y-auto">
      <div className="relative w-full min-h-screen bg-white rounded-[40px_0px_0px_40px] overflow-hidden">
        {/* 뒤로 가기 버튼 */}
        <div className="absolute top-10 left-10 w-10 h-10 flex rounded-lg border border-solid border-[#e5e5e5]">
          <IconCheveronRight
            className="!h-8 !mt-1 !ml-1 !aspect-[1] ![position:unset] !left-[unset] !w-8 !top-[unset]"
            iconCheveronRight="https://c.animaapp.com/635adaII/img/icon-cheveron-right-1.svg"
          />
        </div>

        {/* 제목 */}
        <div className="absolute top-[43px] left-[calc(50.00%_-_69px)] font-['Pretendard'] font-medium text-black text-2xl tracking-[-0.60px] leading-[33.6px] whitespace-nowrap">
          오늘 한 장 랭킹
        </div>

        {/* 탭 (필기왕 / 복습왕) */}
        <div className="absolute top-[97px] left-[141px] w-[197px] h-[58px] flex gap-[19px] bg-[#eaeaea] rounded-[100px] overflow-hidden shadow-[inset_-1px_-1px_1px_#ffffff,inset_1px_1px_2px_#11007426]">
          <div className="mt-1 w-[97px] h-[50px] ml-1 flex bg-white rounded-[100px] overflow-hidden shadow-[0px_2px_8px_#11111133]">
            <div className="mt-[11px] w-[51px] h-7 ml-[23px] font-['Pretendard'] font-medium text-gray-900 text-xl tracking-[-0.50px] leading-[28.0px] whitespace-nowrap">
              필기왕
            </div>
          </div>

          <div className="mt-[15px] w-[51px] h-7 font-['Pretendard'] font-medium text-[#999999] text-xl tracking-[-0.50px] leading-[28.0px] whitespace-nowrap">
            복습왕
          </div>
        </div>

        {/* 날짜 선택 */}
        <div className="flex w-[150px] items-center gap-5 absolute top-[187px] left-[calc(50.00%_-_75px)]">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-solid border-[#d9d9d9]">
            <IconCheveronLeft
              className="!h-5 !left-1 !w-5 !top-1"
              iconCheveronLeft="https://c.animaapp.com/635adaII/img/icon-cheveron-left-1.svg"
            />
          </div>

          <div className="relative w-fit font-['Pretendard'] font-normal text-black text-base text-center tracking-[-0.40px] leading-[22.4px] whitespace-nowrap">
            11월 5일
          </div>

          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-solid border-[#d9d9d9]">
            <IconCheveronRight
              className="!h-5 !left-1 !w-5 !top-1"
              iconCheveronRight="https://c.animaapp.com/635adaII/img/icon-cheveron-right-2.svg"
            />
          </div>
        </div>

        {/* TOP 3 차트 */}
        <div className="flex flex-wrap w-[279px] items-end justify-center gap-[11px_90px] absolute top-[247px] left-[100px]">
          <div className="inline-flex items-end gap-12 relative flex-[0_0_auto]">
            {/* 2위 */}
            <div className="flex flex-col w-[61px] items-end gap-3 relative">
              <div className="flex flex-col items-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
                <img
                  className="w-12 h-12 relative aspect-[1] object-cover"
                  alt="Profile"
                  src="https://c.animaapp.com/635adaII/img/ellipse-506.svg"
                />

                <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                  <div className="relative self-stretch mt-[-1.00px] font-['Pretendard'] font-medium text-black text-[15px] text-center tracking-[-0.38px] leading-[21.0px]">
                    닉네임
                  </div>

                  <div className="relative self-stretch font-['Pretendard'] font-normal text-black text-xs tracking-[-0.30px] leading-[16.8px]">
                    서울고 2학년
                  </div>
                </div>
              </div>

              <div className="relative self-stretch w-full h-[100px] bg-[#00c28899] rounded-xl overflow-hidden">
                <div className="absolute top-9 left-4 font-['Pretendard'] font-medium text-white text-xl tracking-[-0.50px] leading-[28.0px] whitespace-nowrap">
                  9장
                </div>
              </div>
            </div>

            {/* 1위 */}
            <div className="flex flex-col w-[61px] items-end gap-3 relative">
              <div className="flex flex-col items-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
                <img
                  className="w-12 h-12 relative aspect-[1] object-cover"
                  alt="Profile"
                  src="https://c.animaapp.com/635adaII/img/ellipse-506-1.svg"
                />

                <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                  <div className="relative self-stretch mt-[-1.00px] font-['Pretendard'] font-medium text-black text-[15px] text-center tracking-[-0.38px] leading-[21.0px]">
                    닉네임
                  </div>

                  <div className="relative self-stretch font-['Pretendard'] font-normal text-black text-xs tracking-[-0.30px] leading-[16.8px]">
                    서울고 2학년
                  </div>
                </div>
              </div>

              <div className="relative self-stretch w-full h-[140px] bg-[#00c288] rounded-xl overflow-hidden">
                <div className="absolute top-14 left-3 font-['Pretendard'] font-medium text-white text-xl tracking-[-0.50px] leading-[28.0px] whitespace-nowrap">
                  12장
                </div>
              </div>
            </div>

            {/* 3위 */}
            <div className="flex flex-col w-[61px] items-start gap-3 relative">
              <div className="flex flex-col items-center gap-1 relative self-stretch w-full flex-[0_0_auto]">
                <img
                  className="w-12 h-12 relative aspect-[1] object-cover"
                  alt="Profile"
                  src="https://c.animaapp.com/635adaII/img/ellipse-506-2.svg"
                />

                <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                  <div className="relative self-stretch mt-[-1.00px] font-['Pretendard'] font-medium text-black text-[15px] text-center tracking-[-0.38px] leading-[21.0px]">
                    닉네임
                  </div>

                  <div className="relative self-stretch font-['Pretendard'] font-normal text-black text-xs tracking-[-0.30px] leading-[16.8px]">
                    서울고 2학년
                  </div>
                </div>
              </div>

              <div className="relative self-stretch w-full h-[66px] bg-[#00c2884c] rounded-xl overflow-hidden">
                <div className="absolute top-[19px] left-[17px] font-['Pretendard'] font-medium text-white text-xl tracking-[-0.50px] leading-[28.0px] whitespace-nowrap">
                  7장
                </div>
              </div>
            </div>
          </div>

          {/* 순위 번호 */}
          <div className="font-['Pretendard'] font-medium text-[#00c288] text-base tracking-[-0.40px] leading-[22.4px] relative w-fit text-center whitespace-nowrap">
            02
          </div>

          <div className="font-['Pretendard'] font-medium text-[#00c288] text-base tracking-[-0.40px] leading-[22.4px] relative w-fit text-center whitespace-nowrap">
            01
          </div>

          <div className="font-['Pretendard'] font-medium text-[#00c288] text-base tracking-[-0.40px] leading-[22.4px] relative w-fit text-center whitespace-nowrap">
            03
          </div>
        </div>

        {/* 4위 이하 목록 */}
        <div className="flex flex-col w-[340px] items-start gap-5 absolute top-[562px] left-[70px]">
          {[
            { rank: "04", name: "닉네임", school: "서울고 2학년", count: "6장", image: "https://c.animaapp.com/635adaII/img/ellipse-506-3.svg" },
            { rank: "05", name: "닉네임", school: "서울고 2학년", count: "5장", image: "https://c.animaapp.com/635adaII/img/ellipse-506-4.svg" },
            { rank: "06", name: "닉네임", school: "서울고 2학년", count: "4장", image: "https://c.animaapp.com/635adaII/img/ellipse-506-5.svg" },
            { rank: "07", name: "닉네임", school: "서울고 2학년", count: "3장", image: "https://c.animaapp.com/635adaII/img/ellipse-506-6.svg" },
            { rank: "08", name: "닉네임", school: "서울고 2학년", count: "2장", image: "https://c.animaapp.com/635adaII/img/ellipse-506-7.svg" },
            { rank: "09", name: "닉네임", school: "서울고 2학년", count: "1장", image: "https://c.animaapp.com/635adaII/img/ellipse-506-8.svg" },
          ].map((user, index) => (
            <div key={index} className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
              <div className="inline-flex items-center gap-5 relative flex-[0_0_auto]">
                <div className="font-['Pretendard'] font-semibold text-[#767676] text-xl tracking-[-0.50px] leading-[28.0px] relative w-fit text-center whitespace-nowrap">
                  {user.rank}
                </div>

                <div className="inline-flex items-center gap-[11px] relative flex-[0_0_auto]">
                  <img
                    className="w-12 h-12 relative aspect-[1] object-cover"
                    alt="Profile"
                    src={user.image}
                  />

                  <div className="flex flex-col w-[61px] items-center relative">
                    <div className="relative self-stretch mt-[-1.00px] font-['Pretendard'] font-medium text-black text-[15px] text-center tracking-[-0.38px] leading-[21.0px]">
                      {user.name}
                    </div>

                    <div className="relative self-stretch font-['Pretendard'] font-normal text-black text-xs tracking-[-0.30px] leading-[16.8px]">
                      {user.school}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative w-fit font-['Pretendard'] font-medium text-[#111111] text-xl tracking-[-0.50px] leading-[28.0px] whitespace-nowrap">
                {user.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
