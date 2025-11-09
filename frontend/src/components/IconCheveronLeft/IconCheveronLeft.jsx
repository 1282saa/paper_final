/**
 * @file IconCheveronLeft.jsx
 * @description 왼쪽 화살표 아이콘 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.className - 추가 CSS 클래스
 * @param {string} props.iconCheveronLeft - 아이콘 이미지 URL
 */

import React from "react";

export const IconCheveronLeft = ({
  className,
  iconCheveronLeft = "https://c.animaapp.com/635adaII/img/icon-cheveron-left.svg",
}) => {
  return (
    <img
      className={className}
      alt="Icon cheveron left"
      src={iconCheveronLeft}
    />
  );
};
