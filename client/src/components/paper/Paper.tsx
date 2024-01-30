import React, { FunctionComponent, PropsWithChildren } from "react";
import "./styles.css";

/**
 * Paper Component
 */
const Paper: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <div className="paper">
      <div className="paper-content">{children}</div>
    </div>
  );
};

export default Paper;
