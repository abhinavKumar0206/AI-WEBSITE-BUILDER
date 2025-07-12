import { useEffect, useRef, useState } from "react";
import PreviewPanel from "../components/PreviewPanel";
import { Code, File, Monitor, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';

type FileEntry = {
  filename: string;
  content: string;
};

type LogStep = {
  label: string;
  status: "completed";
};

export default function BuilderPage() {
  const [prompt] = useState(localStorage.getItem("prompt") || "");
  const [displayedPrompt, setDisplayedPrompt] = useState('');
  const typingSpeed = 50; // milliseconds per character
  const [thinkingSteps, setThinkingSteps] = useState<LogStep[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<FileEntry[]>([]);
  const [activeFile, setActiveFile] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const hasBuilt = useRef(false);

  const buildSite = async () => {
    setThinkingSteps([]);
    setGeneratedFiles([]);
    setActiveFile("");

    try {
      console.log("⚙️ Sending prompt to backend...");
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const json = line.replace("data:", "").trim();
            if (!json || json === "[DONE]") continue;

            const event = JSON.parse(json);

            if (event.type === "thinking" && event.message) {
              setThinkingSteps((prev) => [
                ...prev,
                { label: event.message, status: "completed" },
              ]);
            }

            if (event.type === "file-create" && event.filename && event.content) {
              const file: FileEntry = {
                filename: event.filename,
                content: event.content.join("\n"),
              };
              setGeneratedFiles((prev) => [...prev, file]);
              if (!activeFile) {
                setActiveFile(event.filename);
              }
            }
          }
        }
      }

      console.log("✅ Build complete");
    } catch (err) {
      console.error("❌ Error during build:", err);
    }
  };

  const filteredFiles = generatedFiles.filter((file) =>
    ["html", "css", "js"].includes(file.filename.split(".").pop() || "")
  );

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop() || '';
  };

  const getCodeMirrorExtension = (filename: string) => {
    const extension = getFileExtension(filename);
    switch (extension) {
      case 'html':
        return html();
      case 'css':
        return css();
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return javascript({ jsx: true, typescript: true });
      default:
        return [];
    }
  };

  useEffect(() => {
    if (prompt && !hasBuilt.current) {
      buildSite();
      hasBuilt.current = true;
    }
  }, [prompt]);

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < prompt.length) {
        setDisplayedPrompt(prev => prev + prompt.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [prompt]);

  useEffect(() => {
    const canvas = document.getElementById('builderDotsCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    let animationFrameId: number;

    if (!ctx) return;

    const dots: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    const numDots = 100;
    const maxDistance = 100; // Max distance for lines to connect

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < numDots; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, // very slow movement
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5, // small dots
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numDots; i++) {
        const dot1 = dots[i];

        // Update position
        dot1.x += dot1.vx;
        dot1.y += dot1.vy;

        // Bounce off walls
        if (dot1.x < 0 || dot1.x > canvas.width) dot1.vx *= -1;
        if (dot1.y < 0 || dot1.y > canvas.height) dot1.vy *= -1;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot1.x, dot1.y, dot1.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        // Draw lines to other dots
        for (let j = i + 1; j < numDots; j++) {
          const dot2 = dots[j];
          const distance = Math.sqrt(
            (dot1.x - dot2.x) ** 2 + (dot1.y - dot2.y) ** 2
          );

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(dot1.x, dot1.y);
            ctx.lineTo(dot2.x, dot2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / maxDistance})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col text-white font-sans overflow-hidden">
      {/* Connected Dots Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <canvas id="builderDotsCanvas" className="absolute inset-0"></canvas>
      </div>
      {/* Header */}
      <header className="flex flex-col items-center p-4 bg-gray-900/50 border-b border-white/10 shadow-md">
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-wide">
          AI Website Builder
        </h1>
        <div className="bg-gray-800/60 border border-white/10 rounded-full px-4 py-2 text-sm text-gray-300 max-w-md truncate text-center">
          <span className="font-semibold text-gray-100">Prompt:</span> {displayedPrompt}
        </div>
      </header>

      {/* Layout */}
      <div className="relative z-10 flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Build Steps */}
        <aside className="w-full md:w-1/4 p-4 border-r border-white/10 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            Build Steps
          </h2>
          {thinkingSteps.length > 0 ? (
            <ul className="space-y-2">
              {thinkingSteps.map((step, i) => (
                <li key={i} className="flex items-center text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                  {step.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <p>No build steps yet.</p>
              <p className="text-sm">Add files to begin.</p>
            </div>
          )}
        </aside>

        {/* File Explorer */}
        <aside className="w-full md:w-1/4 p-4 border-r border-white/10 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <File className="w-5 h-5 mr-2" />
            Files
          </h2>
          {filteredFiles.length > 0 ? (
          <ul className="space-y-1">
            {filteredFiles.map((file) => (
              <li
                key={file.filename}
                className={`cursor-pointer p-2 rounded-md transition-colors text-sm flex items-center ${
                  file.filename === activeFile
                    ? "bg-blue-500/20 text-blue-300 font-semibold"
                    : "hover:bg-white/5"
                }`}
                onClick={() => setActiveFile(file.filename)}
              >
                <File className="w-4 h-4 mr-2 flex-shrink-0" />
                {file.filename}
              </li>
            ))}
          </ul>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <p>No files generated.</p>
              <p className="text-sm">Your files will appear here.</p>
            </div>
          )}
        </aside>

        {/* Main Panel: Code or Preview */}
        <main className="flex-1 flex flex-col p-4">
          <div className="mb-4 flex">
            <button
              className={`flex items-center px-4 py-2 rounded-l-lg transition-colors ${
                activeTab === "code" ? "bg-blue-600" : "bg-gray-700/50 hover:bg-gray-600/50"
              }`}
              onClick={() => setActiveTab("code")}
            >
              <Code className="w-5 h-5 mr-2" />
              Code
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded-r-lg transition-colors ${
                activeTab === "preview" ? "bg-blue-600" : "bg-gray-700/50 hover:bg-gray-600/50"
              }`}
              onClick={() => setActiveTab("preview")}
            >
              <Monitor className="w-5 h-5 mr-2" />
              Preview
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-lg flex-1 overflow-auto border border-white/10 shadow-inner">
            {activeTab === "code" ? (
              <CodeMirror
                value={generatedFiles.find((f) => f.filename === activeFile)?.content || "Select a file to view its content."}
                theme={dracula}
                extensions={[getCodeMirrorExtension(activeFile)]}
                height="100%"
                readOnly={true}
              />
            ) : (
              filteredFiles.length > 0 ? (
                <PreviewPanel files={filteredFiles} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <AlertTriangle className="w-16 h-16 text-yellow-500/80 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No files to preview</h3>
                  <p>Select a file from the 'Files' list or create a new one to see your work.</p>
                </div>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
