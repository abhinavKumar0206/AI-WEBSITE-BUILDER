// File: ThinkingPanel.tsx
import React from 'react';
import { Card, CardContent } from './ui/card';

export interface LogEntry {
  
  content: string;
  type: 'thinking' | 'file-create' | 'done';
}

interface ThinkingPanelProps {
  logs: LogEntry[];
}

const ThinkingPanel: React.FC<ThinkingPanelProps> = ({ logs }) => {
  return (
    <Card className="h-full w-full">
      <CardContent className="p-4 overflow-auto h-full space-y-2">
        {logs.map((log, index) => (
          <p
            key={index}
            className={`text-sm whitespace-pre-wrap ${
              log.type === 'file-create' ? 'font-bold text-indigo-500' : 'text-muted-foreground'
            }`}
          >
            {log.content}
          </p>
        ))}
      </CardContent>
    </Card>
  );
};

export default ThinkingPanel;
