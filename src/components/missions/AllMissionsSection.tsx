"use client";

import React from "react";
import { Mission, FilterState } from "./types";
import MissionGrid from "./MissionGrid";
import MissionSearch from "./MissionSearch";
import MissionFilters from "./MissionFilters";

interface AllMissionsSectionProps {
  missions: Mission[];
  onSelect: (mission: Mission) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export default function AllMissionsSection({
  missions,
  onSelect,
  filters,
  setFilters,
  viewMode,
  setViewMode,
  onClearFilters,
  activeFilterCount,
}: AllMissionsSectionProps) {
  return (
    <div className="space-y-6 pt-4 border-t border-[#232323]">
      
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
            COMPLETE LIBRARY
          </span>
          <h3 className="font-display text-2xl font-bold text-zinc-100 tracking-tight">
            All Engineering Missions ({missions.length})
          </h3>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <MissionFilters
            filters={filters}
            onChange={(updated) => setFilters(updated)}
            onReset={onClearFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>
      </div>

      {/* Search Input Bar */}
      <MissionSearch
        value={filters.searchQuery}
        onChange={(query) => setFilters((prev) => ({ ...prev, searchQuery: query }))}
        resultCount={missions.length}
      />

      {/* Main Grid */}
      <MissionGrid
        missions={missions}
        viewMode={viewMode}
        onSelectMission={onSelect}
        onClearFilters={onClearFilters}
      />

    </div>
  );
}
