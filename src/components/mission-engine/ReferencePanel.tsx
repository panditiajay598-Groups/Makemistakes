"use client";

import React, { useState } from "react";
import { BookOpen, Lightbulb, Lock, Unlock, FileText, AlertCircle } from "lucide-react";
import { MissionData } from "./missionsData";
import ResourceSection from "./ResourceSection";

interface ReferencePanelProps {
  mission: MissionData;
  unlockedHintIds: string[];
  onUnlockHint: (hintId: string) => void;
}

export default function ReferencePanel({
  mission,
  unlockedHintIds,
  onUnlockHint,
}: ReferencePanelProps) {
  const [activeTab, setActiveTab] = useState<"spec" | "resources" | "hints">("spec");

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/40 flex flex-col h-full min-h-[500px]">
      
      {/* Panel Navigation Header */}
      <div className="px-4 py-3.5 border-b border-zinc-200/80 bg-zinc-50/70 flex items-center gap-1.5 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab("spec")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
            activeTab === "spec"
              ? "bg-white border-teal-200 text-teal-900 font-bold shadow-xs"
              : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-teal-700" />
          <span>Spec</span>
        </button>

        <button
          onClick={() => setActiveTab("resources")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
            activeTab === "resources"
              ? "bg-white border-teal-200 text-teal-900 font-bold shadow-xs"
              : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 text-teal-700" />
          <span>Docs ({mission.resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("hints")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
            activeTab === "hints"
              ? "bg-white border-teal-200 text-teal-900 font-bold shadow-xs"
              : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span>Hints ({mission.hints.length})</span>
        </button>
      </div>

      {/* Panel Body View */}
      <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs font-sans">
        {activeTab === "spec" && (
          <div className="space-y-4">
            <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80">
              <span className="font-mono text-[10px] text-amber-800 font-bold uppercase flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                PROBLEM STATEMENT
              </span>
              <p className="text-zinc-800 font-medium leading-relaxed">
                {mission.problemStatement}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase block">
                OBJECTIVES
              </span>
              <ul className="space-y-1.5 text-zinc-700">
                {mission.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-700 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase block">
                RULES &amp; BOUNDARIES
              </span>
              <ul className="space-y-1.5 text-zinc-600 italic">
                {mission.rules.map((rule, idx) => (
                  <li key={idx}>- {rule}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <ResourceSection resources={mission.resources} />
        )}

        {activeTab === "hints" && (
          <div className="space-y-3">
            <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase block">
              ENGINEERING HINTS
            </span>

            {mission.hints.map((hint) => {
              const isUnlocked = unlockedHintIds.includes(hint.id);
              return (
                <div
                  key={hint.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUnlocked
                      ? "bg-amber-50/60 border-amber-200 text-zinc-900"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs flex items-center gap-1.5 text-zinc-900">
                      <Lightbulb className={`h-4 w-4 ${isUnlocked ? "text-amber-500" : "text-zinc-400"}`} />
                      {hint.title}
                    </h5>
                    {isUnlocked ? (
                      <span className="font-mono text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                        <Unlock className="h-3 w-3" /> Unlocked
                      </span>
                    ) : (
                      <button
                        onClick={() => onUnlockHint(hint.id)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-mono text-[10px] font-bold rounded-full transition-all cursor-pointer border-none flex items-center gap-1"
                      >
                        <Lock className="h-3 w-3" />
                        <span>Unlock Hint</span>
                      </button>
                    )}
                  </div>

                  {isUnlocked ? (
                    <p className="mt-2 text-zinc-800 font-sans text-xs leading-relaxed">
                      {hint.content}
                    </p>
                  ) : (
                    <p className="mt-1 text-zinc-400 italic text-[11px]">
                      Click unlock to reveal senior guidance for this objective.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
