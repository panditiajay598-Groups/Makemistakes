"use client";

import React from "react";
import { Save, Lightbulb, Send, ArrowRight } from "lucide-react";

interface MissionFooterProps {
  saveStatus: "saved" | "saving" | "idle";
  onSaveDraft: () => void;
  onSubmitSolution: () => void;
  canSubmit?: boolean;
}

export default function MissionFooter({
  saveStatus,
  onSaveDraft,
  onSubmitSolution,
  canSubmit = true,
}: MissionFooterProps) {
  return (
    <footer className="h-18 border-t border-zinc-200/80 bg-[#FAF9F5]/95 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between shrink-0 sticky bottom-0 z-30 shadow-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={onSaveDraft}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-mono text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Save className={`h-3.5 w-3.5 ${saveStatus === "saving" ? "text-amber-500 animate-spin" : "text-teal-700"}`} />
          <span>{saveStatus === "saving" ? "Saving..." : "Save Draft"}</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onSubmitSolution}
          disabled={!canSubmit}
          className={`group inline-flex h-11 items-center justify-center gap-2.5 rounded-full px-7 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer border-none shadow-md shadow-teal-700/20 font-sans ${
            canSubmit
              ? "bg-teal-700 hover:bg-teal-800 active:scale-98"
              : "bg-zinc-300 cursor-not-allowed shadow-none"
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Submit Solution</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </footer>
  );
}
