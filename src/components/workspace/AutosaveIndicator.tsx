"use client";

import React from "react";
import { Check, RefreshCw } from "lucide-react";

interface AutosaveIndicatorProps {
  status: "saved" | "saving" | "idle";
  lastSavedText?: string;
}

export default function AutosaveIndicator({ status, lastSavedText = "Saved 5 seconds ago" }: AutosaveIndicatorProps) {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 bg-zinc-900/80 border border-zinc-800/80 px-2.5 py-1 rounded-full shrink-0">
      {status === "saving" ? (
        <>
          <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
          <span className="text-zinc-300 font-medium">Saving changes...</span>
        </>
      ) : (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-zinc-400">{lastSavedText}</span>
        </>
      )}
    </div>
  );
}
