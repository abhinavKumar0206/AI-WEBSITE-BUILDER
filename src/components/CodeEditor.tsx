// File: src/components/CodeEditor.tsx

import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { javascript } from '@codemirror/lang-javascript';

interface CodeEditorProps {
  code: string;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language = 'javascript' }) => {
  return (
    <div className="h-full w-full bg-[#282a36] rounded-lg overflow-hidden border border-gray-700">
      <CodeMirror
        value={code}
        height="100%"
        theme={dracula}
        extensions={[javascript({ jsx: true })]}
        readOnly={true}
      />
    </div>
  );
};

export default CodeEditor;