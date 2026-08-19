import React from "react";
import { SearchX, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  onClearFilters: () => void;
  message?: string;
}

export default function EmptyState({
  onClearFilters,
  message = "No engineering missions found matching your search or filters.",
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-[#232323] bg-[#111111] p-12 text-center flex flex-col items-center justify-center space-y-4 my-8">
      {/* Graphic Illustration */}
      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
        <SearchX className="h-8 w-8" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="font-display text-lg font-bold text-zinc-100">
          No missions found
        </h3>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          {message}
        </p>
      </div>

      <button
        onClick={onClearFilters}
        className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Clear Filters</span>
      </button>
    </div>
  );
}
