"use client";

import React from "react";
import { Folder, FileCode, Lock, ChevronRight, CheckCircle2, ShieldAlert } from "lucide-react";

interface FileExplorerProps {
  files: Array<{ name: string; requiredStep: number }>;
  activeFile: string;
  onSelectFile: (fileName: string) => void;
  currentStep: number;
}

export default function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  currentStep,
}: FileExplorerProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-lg font-mono text-xs">
      
      {/* Header */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-100 font-bold">
          <Folder className="h-4 w-4 text-amber-400" />
          <span>Project File Tree</span>
        </div>
        <span className="text-zinc-500 text-[10px] uppercase font-bold">Workspace Files</span>
      </div>

      {/* File List */}
      <div className="p-2 space-y-1 bg-zinc-950">
        
        {/* Workspace Root Directory Badge */}
        <div className="px-2 py-1 text-zinc-500 font-bold text-[11px] flex items-center gap-1.5 border-b border-zinc-900 mb-1">
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span>src/rate-limiter/</span>
        </div>

        {files.map((file) => {
          const isLocked = file.requiredStep > currentStep;
          const isActive = activeFile === file.name;

          return (
            <button
              key={file.name}
              disabled={isLocked}
              onClick={() => onSelectFile(file.name)}
              className={`w-full px-3 py-2 rounded-lg font-mono text-xs text-left flex items-center justify-between transition-all border cursor-pointer ${
                isActive
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-sm"
                  : isLocked
                  ? "bg-zinc-950 border-transparent opacity-40 cursor-not-allowed text-zinc-600"
                  : "bg-zinc-900/50 border-zinc-800/80 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className={`h-4 w-4 shrink-0 ${isActive ? "text-amber-400" : "text-zinc-500"}`} />
                <span className="truncate">{file.name}</span>
              </div>

              {isLocked ? (
                <span title={`Unlocked at Step ${file.requiredStep}`}>
                  <Lock className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                </span>
              ) : isActive ? (
                <span className="text-[10px] bg-amber-500 text-zinc-950 px-1.5 py-0.2 rounded font-bold uppercase">
                  EDITING
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Static Tests Directory placeholder */}
        <div className="pt-2 border-t border-zinc-900 space-y-1">
          <div className="px-2 py-1 text-zinc-500 font-bold text-[11px] flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <span>tests/</span>
          </div>
          <div className="px-3 py-1.5 text-zinc-500 font-mono text-[11px] flex items-center gap-2 pl-6">
            <FileCode className="h-3.5 w-3.5 text-zinc-600" />
            <span>rateLimiter.test.ts (suite)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
