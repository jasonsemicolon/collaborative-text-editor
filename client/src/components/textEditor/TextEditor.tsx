import "quill/dist/quill.snow.css";
import { FunctionComponent } from "react";
import Cursor from "../cursor/Cursor";
import Paper from "../paper/Paper";
import useTextEditor from "./hooks";
import "./styles.css";

// ============== Types =============
type TextEditorProps = {
  name: string;
};

/**
 * TextEditor Component
 */
const TextEditor: FunctionComponent<TextEditorProps> = ({ name }) => {
  let { containerRef, cursors } = useTextEditor({
    collectionName: "collaborativeTextEditor",
    docID: "richtext",
    wsAddress: "localhost:8080",
    username: name,
  });

  return (
    <Paper>
      <div id="editor-container">
        {/* ################# Text Editor ################# */}
        <div id="toolbar-container">
          <span className="ql-formats">
            <select className="ql-font" />
            <select className="ql-size" />
          </span>
          <span className="ql-formats">
            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />
            <button className="ql-strike" />
          </span>
          <span className="ql-formats">
            <select className="ql-color" />
            <select className="ql-background" />
          </span>
          <span className="ql-formats">
            <button className="ql-script" value="sub" />
            <button className="ql-script" value="super" />
          </span>
          <span className="ql-formats">
            <button className="ql-header" value="1" />
            <button className="ql-header" value="2" />
            <button className="ql-blockquote" />
            <button className="ql-code-block" />
          </span>
          <span className="ql-formats">
            <button className="ql-list" value="ordered" />
            <button className="ql-list" value="bullet" />
            <button className="ql-indent" value="-1" />
            <button className="ql-indent" value="+1" />
          </span>
          <span className="ql-formats">
            <button className="ql-direction" value="rtl" />
            <select className="ql-align" />
          </span>
          <span className="ql-formats">
            <button className="ql-link" />
            <button className="ql-image" />
            <button className="ql-video" />
            <button className="ql-formula" />
          </span>
          <span className="ql-formats">
            <button className="ql-clean" />
          </span>
        </div>
        <div ref={containerRef} id="editor" />

        {/* ################# Cursors ################# */}
        {cursors?.map((item) => {
          return <Cursor key={item?.username} info={item} />;
        })}
      </div>
    </Paper>
  );
};

export default TextEditor;
