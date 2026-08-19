"use client";

import React, { useState } from "react";
import { Settings, X, Sliders, Code2, Monitor, Check } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  keymap: "vscode" | "vim";
  setKeymap: (keymap: "vscode" | "vim") => void;
  showLineNumbers: boolean;
  setShowLineNumbers: (show: boolean) => void;
  wordWrap: boolean;
  setWordWrap: (wrap: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  keymap,
  setKeymap,
  showLineNumbers,
  setShowLineNumbers,
  wordWrap,
  setWordWrap,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2 text-zinc-100 font-mono text-sm font-bold">
            <Settings className="h-4 w-4 text-amber-400" />
            <span>Workspace Preferences</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 font-mono text-xs text-zinc-300">
          
          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-zinc-200 font-semibold flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-zinc-400" /> Editor Font Size
              </label>
              <span className="text-amber-400 font-bold">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-bold cursor-pointer"
              >
                -
              </button>
              <input
                type="range"
                min="12"
                max="20"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <button
                onClick={() => setFontSize(Math.min(20, fontSize + 1))}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Keymaps */}
          <div className="space-y-2">
            <label className="text-zinc-200 font-semibold flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-zinc-400" /> Keybinding Profile
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setKeymap("vscode")}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  keymap === "vscode"
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="font-bold">Standard (VS Code)</span>
                {keymap === "vscode" && <Check className="h-4 w-4 text-amber-400" />}
              </button>
              <button
                onClick={() => setKeymap("vim")}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  keymap === "vim"
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="font-bold">Vim Mode</span>
                {keymap === "vim" && <Check className="h-4 w-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Line numbers toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <div className="text-zinc-200 font-semibold">Show Line Numbers</div>
              <div className="text-zinc-500 text-[11px]">Display code line gutters in editor</div>
            </div>
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                showLineNumbers ? "bg-amber-500" : "bg-zinc-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-zinc-950 absolute top-1 transition-transform ${
                  showLineNumbers ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Word wrap toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <div className="text-zinc-200 font-semibold">Word Wrap</div>
              <div className="text-zinc-500 text-[11px]">Wrap long lines inside editor pane</div>
            </div>
            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                wordWrap ? "bg-amber-500" : "bg-zinc-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-zinc-950 absolute top-1 transition-transform ${
                  wordWrap ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
