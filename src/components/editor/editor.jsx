"use client";

import Quill from "quill";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { withoutSSR } from "../NoSSR";
import "./editor.css";

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],
  ["link", "image", "video", "formula"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

// Editor is an uncontrolled React component
const Editor = forwardRef(
  ({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    // Update refs for the latest handlers
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

    // Handle readOnly prop change
    useEffect(() => {
      if (ref.current) {
        ref.current.enable(!readOnly); // Enable or disable editor based on readOnly
      }
    }, [readOnly, ref]);

    // Initialize Quill editor
    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );
      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
      });

      // Attach Quill to the ref
      ref.current = quill;

      // Set the default content if provided
      if (defaultValueRef.current) {
        quill.root.innerHTML = defaultValueRef.current; // Thiết lập nội dung HTML mặc định
      }
      // Listen for text changes
      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        const htmlContent = quill.root.innerHTML; // Get innerHTML
        onTextChangeRef.current?.(htmlContent);
      });

      // Listen for selection changes
      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      // Cleanup the editor on unmount
      return () => {
        quill.off(Quill.events.TEXT_CHANGE);
        quill.off(Quill.events.SELECTION_CHANGE);
        ref.current = null;
        container.innerHTML = ""; // Cleanup container content
      };
    }, [ref]);

    useEffect(() => {
      // Kiểm tra xem có cần thiết lập lại nội dung editor không
      if (ref.current && defaultValueRef.current !== defaultValue) {
        ref.current.root.innerHTML = defaultValue; // Cập nhật nội dung HTML mới
        defaultValueRef.current = defaultValue; // Cập nhật giá trị defaultValueRef
      }
    }, [defaultValue]);

    return (
      <div
        className="h-[400px] mb-20 custom-ql-container"
        ref={containerRef}
      ></div>
    );
  }
);

Editor.displayName = "Editor";

export default withoutSSR(Editor);
