// ✅ File: src/components/PreviewPanel.tsx
import { Sandpack } from "@codesandbox/sandpack-react";
import React from "react";

interface File {
  filename: string;
  content: string;
}

interface Props {
  files: File[];
}

const PreviewPanel: React.FC<Props> = ({ files }) => {
  if (files.length === 0)
    return <div className="p-4 text-white">⚠️ No files to preview</div>;

  const htmlFile = files.find((f) => f.filename === "index.html");
  const cssFile = files.find((f) => f.filename === "style.css");
  const jsFile = files.find((f) => f.filename === "script.js");

  if (!htmlFile) {
    return (
      <div className="p-4 text-red-400">
        ❌ index.html not found. Cannot render preview.
      </div>
    );
  }

  return (
    <Sandpack
      files={{
        "/index.html": {
          code: htmlFile.content,
          active: true,
        },
        ...(cssFile && {
          "/style.css": {
            code: cssFile.content,
          },
        }),
        ...(jsFile && {
          "/script.js": {
            code: jsFile.content,
          },
        }),
      }}
      customSetup={{
        entry: "/index.html",
      }}
      options={{
        showTabs: true,
        showLineNumbers: true,
        wrapContent: true,
      }}
      theme="dark"
    />
  );
};

export default PreviewPanel;
