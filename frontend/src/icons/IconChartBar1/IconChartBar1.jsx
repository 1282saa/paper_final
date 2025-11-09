/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

export const IconChartBar1 = ({ color = "#999999", className }) => {
  return (
    <svg
      className={`${className}`}
      fill="none"
      height="20"
      viewBox="0 0 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 11C2 10.4477 2.44772 10 3 10H5C5.55228 10 6 10.4477 6 11V16C6 16.5523 5.55228 17 5 17H3C2.44772 17 2 16.5523 2 16V11Z"
        fill={color}
      />

      <path
        d="M8 7C8 6.44772 8.44772 6 9 6H11C11.5523 6 12 6.44772 12 7V16C12 16.5523 11.5523 17 11 17H9C8.44772 17 8 16.5523 8 16V7Z"
        fill={color}
      />

      <path
        d="M14 4C14 3.44772 14.4477 3 15 3H17C17.5523 3 18 3.44772 18 4V16C18 16.5523 17.5523 17 17 17H15C14.4477 17 14 16.5523 14 16V4Z"
        fill={color}
      />
    </svg>
  );
};

IconChartBar1.propTypes = {
  color: PropTypes.string,
};
