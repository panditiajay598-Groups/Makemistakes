import React from "react";
import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";
import { Mission } from "../types";
import MissionCard from "../MissionCard";

interface RelatedMissionsProps {
  currentMissionId: string;
  category: string;
  missions: Mission[];
  onSelectMission: (mission: Mission) => void;
}

export default function RelatedMissions({
  currentMissionId,
  category,
  missions,
  onSelectMission,
}: RelatedMissionsProps) {
  const related = missions
    .filter((m) => m.id !== currentMissionId && (m.category === category || m.category === "Backend" || m.category === "System Design"))
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-8 space-y-6">
      
      <div className="flex items-center justify-between border-b border-[#232323] pb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">
            Similar Engineering Challenges
          </h2>
        </div>
        <Link
          href="/missions"
          className="font-mono text-xs text-amber-400 hover:underline flex items-center gap-1 no-underline"
        >
          <span>View All Missions</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((m) => (
          <MissionCard
            key={m.id}
            mission={m}
            viewMode="grid"
            onSelect={onSelectMission}
          />
        ))}
      </div>

    </section>
  );
}
