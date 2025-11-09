/**
 * @file IconCheveronRight.jsx
 * @description 오른쪽 화살표 아이콘 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.className - 추가 CSS 클래스
 * @param {string} props.iconCheveronRight - 아이콘 이미지 URL
 */

import React from "react";

export const IconCheveronRight = ({
  className,
  iconCheveronRight = "https://c.animaapp.com/635adaII/img/icon-cheveron-right-2.svg",
}) => {
  return (
    <img
      className={className}
      alt="Icon cheveron right"
      src={iconCheveronRight}
    />
  );
};
