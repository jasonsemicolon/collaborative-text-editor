import React, { FunctionComponent } from "react";
import { icon } from "../../@types/icon/Icon";

const CursorIcon: FunctionComponent<icon> = ({
  color = "#434040",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="100%"
      height="100%"
      {...props}
    >
      <path
        d="M-5.14,14.67,238.59,506.35a10.15,10.15,0,0,0,9.1,5.65,9.9,9.9,0,0,0,1.72-.15,10.17,10.17,0,0,0,8.37-8.78l25.85-213.65,226.09-37.89a10.16,10.16,0,0,0,2.56-19.24L8.2.93A10.16,10.16,0,0,0-5.14,14.67Z"
        fill={color}
      />
    </svg>
  );
};

export default CursorIcon;
