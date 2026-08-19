"use client";

import React, { useState } from "react";
import { MissionData } from "./missionsData";
import SubmissionEditor from "./SubmissionEditor";
import ReferencePanel from "./ReferencePanel";
import MissionFooter from "./MissionFooter";
import { Rocket, Target, Sparkles, ChevronUp } from "lucide-react";

interface MissionWorkspaceProps {
  mission: MissionData;
  drafts: Record<string, string>;
  researchNotes: string;
  unlockedHintIds: string[];
  saveStatus: "saved" | "saving" | "idle";
  isSummaryOpen: boolean;
  onToggleSummary: () => void;
  onChangeDraft: (deliverableId: string, content: string) => void;
  onChangeResearchNotes: (notes: string) => void;
  onUnlockHint: (hintId: string) => void;
  onSaveDraft: () => void;
  onSubmitSolution: () => void;
}

export default function MissionWorkspace({
  mission,
  drafts,
  researchNotes,
  unlockedHintIds,
  saveStatus,
  isSummaryOpen,
  onToggleSummary,
  onChangeDraft,
  onChangeResearchNotes,
  onUnlockHint,
  onSaveDraft,
  onSubmitSolution,
}: MissionWorkspaceProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      
      {/* Collapsible Mission Summary Banner */}
      {isSummaryOpen && (
        <div className="bg-teal-50/90 border-b border-teal-200/80 px-6 py-4 space-y-3 shrink-0 backdrop-blur-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-teal-900">
              <Rocket className="h-4 w-4 text-teal-700" />
              <span>MISSION {mission.number} SUMMARY: {mission.title}</span>
            </div>
            <button
              onClick={onToggleSummary}
              className="text-xs font-mono text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer bg-transparent border-none"
            >
              <span>Close Summary</span>
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-teal-950">
            <div>
              <strong className="block font-mono text-[10px] text-teal-800 uppercase">Problem Brief</strong>
              <p className="mt-0.5 line-clamp-2">{mission.problemStatement}</p>
            </div>
            <div>
              <strong className="block font-mono text-[10px] text-teal-800 uppercase">Deliverables Expected</strong>
              <p className="mt-0.5 font-mono text-[11px] text-teal-900">
                {mission.deliverables.map((d) => d.title).join(" • ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main 2-Column Productive Workspace Grid */}
      <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        {/* Left Column: Structured Deliverables & Notes Editor (7 or 8 Cols) */}
        <div className="lg:col-span-8 flex flex-col min-h-[500px]">
          <SubmissionEditor
            deliverables={mission.deliverables}
            drafts={drafts}
            researchNotes={researchNotes}
            onChangeDraft={onChangeDraft}
            onChangeResearchNotes={onChangeResearchNotes}
          />
        </div>

        {/* Right Column: Reference & Hints Side Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col min-h-[500px]">
          <ReferencePanel
            mission={mission}
            unlockedHintIds={unlockedHintIds}
            onUnlockHint={onUnlockHint}
          />
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <MissionFooter
        saveStatus={saveStatus}
        onSaveDraft={onSaveDraft}
        onSubmitSolution={onSubmitSolution}
      />

    </div>
  );
}
