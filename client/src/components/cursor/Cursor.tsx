import { FunctionComponent } from "react";
import { CursorType } from "../../@types/mouse/Mouse";
import CursorIcon from "../../assets/icons/CursorIcon";
import "./styles.css";

// =========== Types ===========
type CursorProps = { info: CursorType };

/**
 * Cursor Component
 */
const Cursor: FunctionComponent<CursorProps> = ({ info }) => {
  let { position, color, username } = info;
  let { top, left } = position;

  return (
    <span className="cursor" style={{ top, left }}>
      <div className="cursor-container">
        {/* ################# cursor Icon ################# */}
        <CursorIcon color={color} />

        {/* ################# User Name ################# */}
        <div className="cursor-username" style={{ background: color }}>
          {username}
        </div>
      </div>
    </span>
  );
};

export default Cursor;
