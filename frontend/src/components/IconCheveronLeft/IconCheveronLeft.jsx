/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

export const IconCheveronLeft = ({
  className,
  iconCheveronLeft = "https://c.animaapp.com/635adaII/img/icon-cheveron-left.svg",
}) => {
  return (
    <img
      className={`absolute w-full h-full top-0 left-0 ${className}`}
      alt="Icon cheveron left"
      src={iconCheveronLeft}
    />
  );
};
