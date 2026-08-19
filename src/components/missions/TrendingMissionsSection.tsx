"use client";

import React from "react";
import { Flame, Users, Clock, Award, ArrowRight } from "lucide-react";
import { Mission } from "./types";
import MissionCard from "./MissionCard";

interface TrendingMissionsSectionProps {
  missions: Mission[];
  onSelect: (mission: Mission) => void;
}

export default function TrendingMissionsSection({
  missions,
  onSelect,
}: TrendingMissionsSectionProps) {
  if (missions.length === 0) return null;

  return (
    <div className="space-y-4">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 font-mono text-xs text-amber-400 font-bold">
            <Flame className="h-4 w-4 fill-amber-400" />
            <span>COMMUNITY ACTIVITY</span>
          </div>
          <h3 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Trending Missions This Week
          </h3>
        </div>

        <span className="text-zinc-500 font-mono text-xs hidden sm:inline">
          Ranked by engineer completion velocity
        </span>
      </div>

      {/* Grid of Trending Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {missions.slice(0, 3).map((mission, idx) => (
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
