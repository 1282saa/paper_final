import React from "react";

export const IconClipboardCheck = ({
  className,
  iconClipboardCheck = "https://c.animaapp.com/lBqFBRLr/img/icon-clipboard-check.svg",
}) => {
  return (
    <img
      className={`absolute top-0 left-0 w-5 h-5 ${className}`}
      alt="Icon clipboard check"
      src={iconClipboardCheck}
    />
  );
};
