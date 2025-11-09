import React, { useState } from "react";

export const Calendar = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // 이전 달의 날짜들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, isCurrentMonth: true });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    if (day.isCurrentMonth) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
      setSelectedDate(newDate);
      onDateSelect && onDateSelect(newDate);
    }
  };

  const isToday = (day) => {
    if (!day.isCurrentMonth) return false;
    const today = new Date();
    return (
      day.date === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!day.isCurrentMonth) return false;
    return (
      day.date === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-lg w-full">
      {/* 헤더 - 월/년 표시 및 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {daysOfWeek.map((day, index) => (
          <div
            key={index}
            className={`text-center text-sm font-semibold py-2 ${
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-600"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const today = isToday(day);
          const selected = isSelected(day);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={!day.isCurrentMonth}
              className={`
                aspect-square rounded-xl text-sm font-medium transition-all
                ${!day.isCurrentMonth ? "text-gray-300 cursor-default" : ""}
                ${day.isCurrentMonth && !today && !selected ? "text-gray-700 hover:bg-gray-50" : ""}
                ${today && !selected ? "bg-blue-50 text-blue-600 ring-2 ring-blue-200" : ""}
                ${selected ? "bg-[#00c288] text-white shadow-md scale-105" : ""}
                ${day.isCurrentMonth ? "cursor-pointer" : ""}
              `}
            >
              {day.date || ""}
            </button>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-50 ring-2 ring-blue-200"></div>
          <span className="text-sm text-gray-600">오늘</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#00c288]"></div>
          <span className="text-sm text-gray-600">선택됨</span>
        </div>
      </div>
    </div>
  );
};
