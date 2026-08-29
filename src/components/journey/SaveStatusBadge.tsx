"use client";

import React from "react";
import { CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveStatusBadgeProps {
  status: SaveStatus;
  errorMessage?: string | null;
  onRetry?: () => void;
  className?: string;
}

export default function SaveStatusBadge({
  status,
  errorMessage,
  onRetry,
  className = "",
}: SaveStatusBadgeProps) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-semibold animate-pulse ${className}`}
      >
        <Loader2 className="h-3.5 w-3.5 text-amber-600 animate-spin" />
        <span>Saving...</span>
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold transition-all duration-300 ${className}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <span>✓ Saved</span>
      </span>
    );
  }

  if (status === "error") {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-semibold ${className}`}
      >
        <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
        <span>{errorMessage || "Save failed"}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 underline text-rose-700 hover:text-rose-900 cursor-pointer ml-1"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        )}
      </span>
    );
  }

  return null;
}
