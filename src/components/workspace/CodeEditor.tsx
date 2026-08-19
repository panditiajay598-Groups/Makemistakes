"use client";

import React, { useState } from "react";
import {
  Copy,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileCode,
  Check,
  Code2,
  Wand2,
} from "lucide-react";

interface CodeEditorProps {
  files: Array<{ name: string; requiredStep: number }>;
  activeFile: string;
  setActiveFile: (fileName: string) => void;
  codeMap: Record<string, string>;
  onCodeChange: (fileName: string, newCode: string) => void;
  onResetFile: (fileName: string) => void;
  fontSize?: number;
  showLineNumbers?: boolean;
  wordWrap?: boolean;
  currentStep: number;
}

export default function CodeEditor({
  files,
  activeFile,
  setActiveFile,
  codeMap,
  onCodeChange,
  onResetFile,
  fontSize = 14,
  showLineNumbers = true,
  wordWrap = true,
  currentStep,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const currentCode = codeMap[activeFile] || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormat = () => {
    // Simple basic auto-format simulation (trims extra whitespace)
    const formatted = currentCode
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n");
    onCodeChange(activeFile, formatted);
  };

  const lines = currentCode.split("\n");

  return (
    <div
      className={`bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-xl transition-all ${
        isFullscreen ? "fixed inset-2 z-50 rounded-2xl" : "h-[460px]"
      }`}
    >
      {/* Editor Header Bar / File Tabs */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between px-2 shrink-0 select-none overflow-x-auto">
        
        {/* File Tabs */}
        <div className="flex items-center space-x-1 py-1">
          {files.map((f) => {
            const isLocked = f.requiredStep > currentStep;
            const isActive = activeFile === f.name;

            return (
              <button
                key={f.name}
                disabled={isLocked}
                onClick={() => setActiveFile(f.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                  isActive
                    ? "bg-zinc-950 text-amber-400 border-zinc-800 shadow-sm"
                    : isLocked
                    ? "opacity-40 cursor-not-allowed text-zinc-600 border-transparent"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border-transparent"
                }`}
              >
                <FileCode className={`h-3.5 w-3.5 ${isActive ? "text-amber-400" : "text-zinc-500"}`} />
                <span>{f.name}</span>
                {isLocked && <span className="text-[10px] text-zinc-600">🔒</span>}
              </button>
            );
          })}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center space-x-1 py-1 px-2 font-mono text-xs">
          <button
            onClick={handleFormat}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Auto-format Code"
          >
            <Wand2 className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={() => onResetFile(activeFile)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Reset File to Starter Code"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>

      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 flex overflow-hidden relative font-mono bg-zinc-950">
        
        {/* Line Numbers Gutter */}
        {showLineNumbers && (
          <div
            className="w-12 bg-zinc-950 border-r border-zinc-900 py-3 text-right pr-3 text-zinc-600 select-none font-mono shrink-0"
            style={{ fontSize: `${fontSize}px`, lineHeight: "1.6" }}
          >
            {lines.map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          value={currentCode}
          onChange={(e) => onCodeChange(activeFile, e.target.value)}
          spellCheck={false}
          className={`w-full h-full bg-transparent text-zinc-100 p-3 font-mono border-none outline-none resize-none selection:bg-amber-500/20 selection:text-zinc-100 ${
            wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"
          }`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: "1.6",
            tabSize: 2,
          }}
          placeholder="// Type your implementation code here..."
        />

      </div>

      {/* Footer Status Bar */}
      <div className="h-6 bg-zinc-950 border-t border-zinc-900 px-3 flex items-center justify-between font-mono text-[11px] text-zinc-500 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>File: <strong className="text-zinc-400">{activeFile}</strong></span>
          <span>Lines: <strong className="text-zinc-400">{lines.length}</strong></span>
          <span>Mode: <strong className="text-amber-400">TypeScript</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </div>

    </div>
  );
}
