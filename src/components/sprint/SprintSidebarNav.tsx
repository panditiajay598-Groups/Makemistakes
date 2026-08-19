"use client";

import React from "react";
import {
  LayoutDashboard,
  Target,
  Code2,
  Award,
  Send,
  History,
  Check,
  Lock,
  Flame,
  HelpCircle,
} from "lucide-react";

interface SprintSidebarNavProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  onOpenHelpDrawer: () => void;
  completedSections?: string[];
  lockedSections?: string[];
}

export default function SprintSidebarNav({
  activeSection,
  onSelectSection,
  onOpenHelpDrawer,
  completedSections = ["overview"],
  lockedSections = [],
}: SprintSidebarNavProps) {
  const workflowSteps = [
    {
      id: "overview",
      num: 1,
      label: "Sprint Overview",
      icon: LayoutDashboard,
    },
    {
      id: "current-task",
      num: 2,
      label: "Current Task",
      icon: Target,
      star: true,
    },
    {
      id: "workspace",
      num: 3,
      label: "Build",
      icon: Code2,
      star: true,
    },
    {
      id: "review",
      num: 4,
      label: "Review",
      icon: Award,
    },
    {
      id: "submit",
      num: 5,
      label: "Submit",
      icon: Send,
    },
  ];

  return (
    <aside className="w-full lg:w-60 bg-white border-r border-zinc-200/80 p-3 space-y-4 shrink-0 flex flex-col justify-between select-none font-sans shadow-sm">
      <div className="space-y-4">
        <div className="px-3 pt-1">
          <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
            Sprint Journey Workflow
          </span>
        </div>

        {/* 1 to 5 Workflow Navigation List */}
        <nav className="space-y-1">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            const isActive = activeSection === step.id;
            const isCompleted = completedSections.includes(step.id);
            const isLocked = lockedSections.includes(step.id);

            return (
              <button
                key={step.id}
                disabled={isLocked}
                onClick={() => !isLocked && onSelectSection(step.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-mono text-xs transition-all border text-left cursor-pointer ${
                  isActive
                    ? "bg-teal-50 text-teal-900 border-teal-200 font-bold shadow-sm ring-1 ring-teal-700/20"
                    : isCompleted
                    ? "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80 border-transparent"
                    : isLocked
                    ? "text-zinc-400 opacity-50 cursor-not-allowed border-transparent"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {/* Indicator Icon / Active Arrow / Checkmark */}
                  {isActive ? (
                    <span className="text-teal-700 font-bold font-mono text-xs text-center w-4 shrink-0">
                      ▶
                    </span>
                  ) : isCompleted ? (
                    <div className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  ) : isLocked ? (
                    <Lock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  ) : (
                    <Icon className="h-4 w-4 text-zinc-500 shrink-0" />
                  )}

                  <span className="truncate flex items-center gap-1">
                    <span>
                      {step.num}. {step.label}
                    </span>
                    {step.star && <span className="text-teal-700 text-[10px]">⭐</span>}
                  </span>
                </div>

                {isActive && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200 font-bold uppercase shrink-0">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="h-px bg-zinc-200/80 my-2" />

        {/* Sprint History Section */}
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider block px-3 mb-1">
            Archive
          </span>
          <button
            onClick={() => onSelectSection("history")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-mono text-xs transition-all border cursor-pointer ${
              activeSection === "history"
                ? "bg-teal-50 text-teal-900 border-teal-200 font-bold shadow-sm"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 border-transparent"
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <History className={`h-4 w-4 shrink-0 ${activeSection === "history" ? "text-teal-700" : "text-zinc-500"}`} />
              <span className="truncate">Sprint History</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Info & Contextual Help Drawer Button */}
      <div className="space-y-2">
        <button
          onClick={onOpenHelpDrawer}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-mono text-teal-800 font-bold cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-3.5 w-3.5 text-teal-700" />
            <span>Need Help?</span>
          </div>
          <span className="text-[10px] bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded text-teal-800 font-semibold">
            Docs
          </span>
        </button>

        <div className="p-3 bg-teal-50/50 border border-teal-200/60 rounded-2xl space-y-1.5 font-mono text-[11px] text-zinc-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-teal-800 font-bold">
              <Flame className="h-3.5 w-3.5 fill-teal-700/20 text-teal-700" /> 1 Day Streak
            </span>
            <span className="text-zinc-500 text-[10px]">Sprint 2 • Day 2</span>
          </div>
          <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden border border-zinc-300">
            <div className="h-full bg-teal-700 rounded-full" style={{ width: "25%" }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
