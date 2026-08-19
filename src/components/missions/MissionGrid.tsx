import React, { useState } from "react";
import { Mission } from "./types";
import MissionCard from "./MissionCard";
import EmptyState from "./EmptyState";
import { Loader2 } from "lucide-react";

interface MissionGridProps {
  missions: Mission[];
  viewMode: "grid" | "list";
  onSelectMission: (mission: Mission) => void;
  onClearFilters: () => void;
}

const PAGE_SIZE = 12;

export default function MissionGrid({
  missions,
  viewMode,
  onSelectMission,
  onClearFilters,
}: MissionGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const displayedMissions = missions.slice(0, visibleCount);
  const hasMore = visibleCount < missions.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 200);
  };

  if (missions.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-8">
      {/* Grid or List render */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              viewMode="grid"
              onSelect={onSelectMission}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              viewMode="list"
              onSelect={onSelectMission}
            />
          ))}
        </div>
      )}

      {/* Pagination / Load More Footer */}
      {hasMore && (
        <div className="flex flex-col items-center justify-center pt-6 space-y-2">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-3 bg-[#111111] hover:bg-[#181818] text-zinc-300 hover:text-zinc-100 font-mono text-xs font-semibold rounded-2xl border border-[#232323] hover:border-amber-500/40 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                <span>Loading Missions...</span>
              </>
            ) : (
              <span>Load More Missions ({missions.length - visibleCount} remaining)</span>
            )}
          </button>

          <span className="text-[11px] font-mono text-zinc-500">
            Showing <strong className="text-zinc-300">{visibleCount}</strong> of <strong className="text-zinc-300">{missions.length}</strong> engineering missions
          </span>
        </div>
      )}
    </div>
  );
}
