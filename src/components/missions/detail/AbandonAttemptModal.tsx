import React from "react";
import { AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { Attempt } from "@/lib/attemptsStore";

interface AbandonAttemptModalProps {
  isOpen: boolean;
  attempt: Attempt | null;
  onClose: () => void;
  onConfirmAbandon: () => void;
}

export default function AbandonAttemptModal({
  isOpen,
  attempt,
  onClose,
  onConfirmAbandon,
}: AbandonAttemptModalProps) {
  if (!isOpen || !attempt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#121212] border border-[#2d2d2d] rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Warning Icon Banner */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-zinc-100">
              Abandon Attempt #{attempt.attemptNumber}?
            </h3>
            <p className="font-mono text-xs text-zinc-400">
              {attempt.missionTitle}
            </p>
          </div>
        </div>

        {/* Mandatory prompt text per specification */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] space-y-2">
          <p className="font-display text-sm font-semibold text-zinc-200">
            "Are you sure?"
          </p>
          <p className="text-xs font-sans text-zinc-300 leading-relaxed">
            Your progress will be saved, but this attempt will be marked as abandoned.
          </p>
        </div>

        <p className="text-[11px] font-mono text-zinc-400 leading-normal">
          Abandoning this practice attempt will unlock your active attempt slot so you can start or work on another engineering mission.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#232323]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-[#1e1e1e] hover:bg-[#282828] text-zinc-300 font-mono text-xs font-semibold rounded-xl border border-[#333] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onConfirmAbandon}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-red-600/20"
          >
            <XCircle className="h-4 w-4" />
            <span>Abandon Attempt</span>
          </button>
        </div>

      </div>
    </div>
  );
}
