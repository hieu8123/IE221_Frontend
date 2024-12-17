"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";

const Editor = dynamic(() => import("@/components/editor/editor"), {
  ssr: false,
});

const MyComponent = () => {
  const [range, setRange] = useState();
  const [lastChange, setLastChange] = useState("");
  const [readOnly, setReadOnly] = useState(false);

  // Use a ref to access the quill instance directly
  const quillRef = useRef();

  return (
    <div>
      <Editor
        ref={quillRef}
        readOnly={readOnly}
        defaultValue={""}
        onSelectionChange={setRange}
        onTextChange={setLastChange}
      />
      <div className="controls">
        <label>
          Read Only:{" "}
          <input
            type="checkbox"
            value={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
        </label>
        <button
          className="controls-right"
          type="button"
          onClick={() => {
            alert(quillRef.current?.getLength());
          }}
        >
          Get Content Length
        </button>
      </div>
      <div className="state">
        <div className="state-title">Current Range:</div>
        {range ? JSON.stringify(range) : "Empty"}
      </div>
      <div className="state">
        <div
          dangerouslySetInnerHTML={{ __html: lastChange }} // Chèn HTML vào div
        />
      </div>
    </div>
  );
};

export default MyComponent;
