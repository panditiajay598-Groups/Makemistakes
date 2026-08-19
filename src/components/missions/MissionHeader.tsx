import React from "react";
import { LayoutGrid, List } from "lucide-react";
import MissionFilters from "./MissionFilters";
import { FilterState } from "./types";

interface MissionHeaderProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onFilterReset: () => void;
  activeFilterCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export default function MissionHeader({
  filters,
  onFilterChange,
  onFilterReset,
  activeFilterCount,
  viewMode,
  onViewModeChange,
}: MissionHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232323] pb-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
          Missions
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-mono">
          Choose your next engineering challenge.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <MissionFilters
          filters={filters}
          onChange={onFilterChange}
          onReset={onFilterReset}
          activeFilterCount={activeFilterCount}
        />

        {/* Grid / List View Toggle */}
        <div className="flex items-center bg-[#111111] p-1 rounded-xl border border-[#232323]">
          <button
            onClick={() => onViewModeChange("grid")}
            title="Grid View"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            title="List View"
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-amber-500 text-zinc-950 font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
