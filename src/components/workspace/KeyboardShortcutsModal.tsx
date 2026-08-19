"use client";

import React from "react";
import { Keyboard, X, Command } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Ctrl / ⌘ + Enter", label: "Run Test Suite", description: "Executes unit and integration test assertions" },
    { key: "Ctrl / ⌘ + Shift + S", label: "Submit Step", description: "Validates solution and triggers AI code review" },
    { key: "Ctrl / ⌘ + S", label: "Save Workspace", description: "Manually triggers autosave to session storage" },
    { key: "Ctrl / ⌘ + H", label: "Get AI Hint", description: "Requests next progressive Socratic clue" },
    { key: "Ctrl / ⌘ + B", label: "Toggle Explorer", description: "Collapses or expands workspace file list" },
    { key: "Esc", label: "Close Dialogs", description: "Dismisses open modals or tool overlays" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2 text-zinc-100 font-mono text-sm font-bold">
            <Keyboard className="h-4 w-4 text-amber-400" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 space-y-3 font-mono text-xs max-h-[60vh] overflow-y-auto">
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors"
            >
              <div>
                <div className="text-zinc-100 font-bold">{item.label}</div>
                <div className="text-zinc-500 text-[11px] mt-0.5">{item.description}</div>
              </div>
              <kbd className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-mono text-xs font-semibold shadow-inner shrink-0">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
}
