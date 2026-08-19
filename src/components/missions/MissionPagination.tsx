import React from "react";
import { Loader2 } from "lucide-react";

interface MissionPaginationProps {
  visibleCount: number;
  totalCount: number;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

export default function MissionPagination({
  visibleCount,
  totalCount,
  isLoadingMore,
  onLoadMore,
}: MissionPaginationProps) {
  const hasMore = visibleCount < totalCount;

  if (!hasMore) {
    return (
      <div className="text-center pt-6 text-[11px] font-mono text-zinc-500">
        Showing all <strong className="text-zinc-300">{totalCount}</strong> engineering challenges
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pt-8 space-y-2">
      <button
        onClick={onLoadMore}
        disabled={isLoadingMore}
        className="px-6 py-3.5 bg-[#111111] hover:bg-[#181818] text-zinc-300 hover:text-zinc-100 font-mono text-xs font-semibold rounded-2xl border border-[#232323] hover:border-amber-500/40 transition-all flex items-center gap-2 cursor-pointer shadow-md"
      >
        {isLoadingMore ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            <span>Loading Challenges...</span>
          </>
        ) : (
          <span>Load More Challenges ({totalCount - visibleCount} remaining)</span>
        )}
      </button>

      <span className="text-[11px] font-mono text-zinc-500">
        Showing <strong className="text-zinc-300">{visibleCount}</strong> of <strong className="text-zinc-300">{totalCount}</strong> challenges
      </span>
    </div>
  );
}
