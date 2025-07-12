// File: src/components/FileExplorer.tsx

import React from 'react';

interface File {
  filename: string;
  content: string;
}

interface FileExplorerProps {
  files: File[];
  activeTab: string;
  onTabChange: (filename: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeTab, onTabChange }) => {
  return (
    <div className="bg-zinc-900 text-white p-2 rounded-t-md border-b border-zinc-700">
      <div className="flex space-x-2 overflow-x-auto">
        {files.map((file) => (
          <button
            key={file.filename}
            onClick={() => onTabChange(file.filename)}
            className={`px-4 py-1 rounded-t-md text-sm font-mono transition-all duration-200 border-b-2 ${
              file.filename === activeTab
                ? 'bg-zinc-800 text-blue-400 border-blue-400'
                : 'bg-zinc-700 text-white border-transparent hover:bg-zinc-600'
            }`}
          >
            {file.filename}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
