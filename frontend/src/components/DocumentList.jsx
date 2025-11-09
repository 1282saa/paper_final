import React from "react";

export const DocumentList = ({ selectedDate }) => {
  // 더미 데이터 - 추후 API로 대체
  const documents = [
    {
      id: 1,
      title: "수학 미적분 필기",
      subject: "수학",
      pages: 12,
      uploadTime: "오전 10:30",
      thumbnail: "https://c.animaapp.com/lBqFBRLr/img/image-16@2x.png",
      color: "#00c288"
    },
    {
      id: 2,
      title: "영어 문법 정리",
      subject: "영어",
      pages: 8,
      uploadTime: "오후 2:15",
      thumbnail: "https://c.animaapp.com/lBqFBRLr/img/image-16@2x.png",
      color: "#7c3aed"
    },
    {
      id: 3,
      title: "화학 원소 주기율표",
      subject: "화학",
      pages: 5,
      uploadTime: "오후 4:20",
      thumbnail: "https://c.animaapp.com/lBqFBRLr/img/image-16@2x.png",
      color: "#f59e0b"
    },
  ];

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-lg h-full">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          학습 문서
        </h2>
        <p className="text-sm text-gray-500">
          {formatDate(selectedDate)} 업로드한 문서
        </p>
      </div>

      {/* 문서 리스트 */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="group relative bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200"
            >
              <div className="flex gap-4">
                {/* 썸네일 */}
                <div
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: doc.color + "20" }}
                >
                  <img
                    src={doc.thumbnail}
                    alt={doc.title}
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>

                {/* 문서 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-base mb-1 truncate">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span
                      className="px-2 py-0.5 rounded-md text-white text-xs font-medium"
                      style={{ backgroundColor: doc.color }}
                    >
                      {doc.subject}
                    </span>
                    <span>{doc.pages}장</span>
                    <span className="text-gray-400">•</span>
                    <span>{doc.uploadTime}</span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3.33334V12.6667M3.33333 8H12.6667" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* 진행률 표시 (선택사항) */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>복습 진행률</span>
                  <span>75%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: "75%", backgroundColor: doc.color }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M20 4H8C6.89543 4 6 4.89543 6 6V26C6 27.1046 6.89543 28 8 28H24C25.1046 28 26 27.1046 26 26V10L20 4Z" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 4V10H26" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-gray-400 font-medium">
              이 날짜에 업로드된 문서가 없습니다
            </p>
          </div>
        )}
      </div>

      {/* 커스텀 스크롤바 스타일 */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00c288;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00a875;
        }
      `}</style>
    </div>
  );
};
