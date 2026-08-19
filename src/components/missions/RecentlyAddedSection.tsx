"use client";

import React from "react";
import { Sparkles, Clock, Award, ArrowRight, Zap } from "lucide-react";
import { Mission } from "./types";
import MissionCard from "./MissionCard";

interface RecentlyAddedSectionProps {
  missions: Mission[];
  onSelect: (mission: Mission) => void;
}

export default function RecentlyAddedSection({
  missions,
  onSelect,
}: RecentlyAddedSectionProps) {
  if (missions.length === 0) return null;

  return (
    <div className="space-y-4">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>FRESHLY PUBLISHED</span>
          </div>
          <h3 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Recently Added Challenges
          </h3>
        </div>

        <span className="text-zinc-500 font-mono text-xs hidden sm:inline">
          New system engineering problems added weekly
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {missions.slice(0, 3).map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onSelect={onSelect}
          />
        ))}
      </div>

    </div>
  );
}
