import React, { useState } from "react";
import { Filter, X, ChevronDown, RotateCcw } from "lucide-react";
import { FilterState, Difficulty, MissionStatus } from "./types";

interface MissionFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  activeFilterCount: number;
}

const DIFFICULTIES: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard", "Expert"];
const STATUSES: (MissionStatus | "All")[] = ["All", "Not Started", "In Progress", "Completed", "Locked"];
const TECHNOLOGIES = [
  "All",
  "Redis",
  "Node.js",
  "Next.js",
  "Docker",
  "Kafka",
  "React",
  "TypeScript",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Kubernetes",
  "BullMQ",
  "Rust",
  "Go",
  "FastAPI",
  "WebSockets",
];
const TIME_RANGES: FilterState["timeRequired"][] = ["All", "< 1 hr", "1-3 hrs", "3+ hrs", "Multi-Day"];
const XP_RANGES: FilterState["xpRange"][] = ["All", "< 500 XP", "500-1000 XP", "1000+ XP"];

export default function MissionFilters({
  filters,
  onChange,
  onReset,
  activeFilterCount,
}: MissionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-11 px-4 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
          activeFilterCount > 0
            ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
            : "bg-[#111111] hover:bg-[#161616] text-zinc-300 border-[#232323]"
        }`}
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="h-5 w-5 rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover / Collapsible Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 p-5 rounded-2xl bg-[#111111] border border-[#262626] shadow-2xl z-40 space-y-4 font-mono text-xs">
          
          <div className="flex items-center justify-between border-b border-[#232323] pb-3">
            <span className="font-bold text-zinc-100 uppercase tracking-wider text-[11px]">Filter Missions</span>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={onReset}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Clear All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Difficulty</label>
              <div className="flex flex-wrap gap-1.5">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => updateFilter("difficulty", diff)}
                    className={`px-3 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                      filters.difficulty === diff
                        ? "bg-amber-500 text-zinc-950 border-amber-400 font-bold"
                        : "bg-[#181818] text-zinc-400 border-[#282828] hover:text-zinc-200"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Status</label>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    onClick={() => updateFilter("status", st)}
                    className={`px-3 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                      filters.status === st
                        ? "bg-amber-500 text-zinc-950 border-amber-400 font-bold"
                        : "bg-[#181818] text-zinc-400 border-[#282828] hover:text-zinc-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Technology */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Technology</label>
              <select
                value={filters.technology}
                onChange={(e) => updateFilter("technology", e.target.value)}
                className="w-full h-9 px-3 bg-[#181818] border border-[#282828] rounded-xl text-zinc-200 text-xs focus:border-amber-500 focus:outline-none"
              >
                {TECHNOLOGIES.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Required */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Time Required</label>
              <div className="flex flex-wrap gap-1.5">
                {TIME_RANGES.map((time) => (
                  <button
                    key={time}
                    onClick={() => updateFilter("timeRequired", time)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                      filters.timeRequired === time
                        ? "bg-amber-500 text-zinc-950 border-amber-400 font-bold"
                        : "bg-[#181818] text-zinc-400 border-[#282828] hover:text-zinc-200"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* XP Range */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">XP Reward</label>
              <div className="flex flex-wrap gap-1.5">
                {XP_RANGES.map((xp) => (
                  <button
                    key={xp}
                    onClick={() => updateFilter("xpRange", xp)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                      filters.xpRange === xp
                        ? "bg-amber-500 text-zinc-950 border-amber-400 font-bold"
                        : "bg-[#181818] text-zinc-400 border-[#282828] hover:text-zinc-200"
                    }`}
                  >
                    {xp}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="pt-2 border-t border-[#232323]">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-center transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
