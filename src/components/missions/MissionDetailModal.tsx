import React from "react";
import { useRouter } from "next/navigation";
import { X, Clock, Award, ShieldCheck, ArrowRight, Play, CheckCircle2, Lock, FileCode2, Terminal, Cpu, Zap, Layers } from "lucide-react";
import { saveActiveSession } from "@/lib/session";
import { Mission } from "./types";
import DifficultyBadge from "./DifficultyBadge";
import TechTag from "./TechTag";
import ProgressBar from "./ProgressBar";

interface MissionDetailModalProps {
  mission: Mission | null;
  onClose: () => void;
}

export default function MissionDetailModal({
  mission,
  onClose,
}: MissionDetailModalProps) {
  const router = useRouter();

  if (!mission) return null;

  const handleStart = () => {
    saveActiveSession({
      missionId: mission.id,
      missionTitle: mission.title,
      currentStep: mission.currentStep || 1,
      totalSteps: mission.totalSteps || 8,
      activeFile: mission.activeFile || "redis.ts",
    });
    onClose();
    router.push("/workspace");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div
        className="relative w-full max-w-2xl bg-[#0f0f0f] border border-[#262626] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-[#232323] flex items-start justify-between gap-4 bg-[#141414]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={mission.difficulty} />
              <span className="font-mono text-xs text-zinc-400 bg-[#1c1c1c] px-2.5 py-0.5 rounded border border-[#2c2c2c]">
                {mission.category}
              </span>
              <span className="font-mono text-xs text-amber-400 font-bold flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> +{mission.xpReward} XP
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-zinc-50 tracking-tight">
              {mission.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-[#232323] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans leading-relaxed">
          
          {/* Engineering Problem Description */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs text-zinc-400 uppercase tracking-wider font-bold">
              Engineering Problem & Context
            </h4>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* Benchmark Target */}
          {mission.benchmarkTarget && (
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Verification Benchmark Target</span>
              </div>
              <p className="text-zinc-300 font-mono text-xs">
                {mission.benchmarkTarget}
              </p>
            </div>
          )}

          {/* Technology Stack */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs text-zinc-400 uppercase tracking-wider font-bold">
              Technologies Used
            </h4>
            <div className="flex flex-wrap gap-2">
              {mission.techStack.map((tech) => (
                <TechTag key={tech} name={tech} className="px-3 py-1 text-xs" />
              ))}
            </div>
          </div>

          {/* Skills Acquired */}
          <div className="space-y-2">
            <h4 className="font-mono text-xs text-zinc-400 uppercase tracking-wider font-bold">
              Skills Demonstrated in Proof of Work
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mission.skills.map((skill) => (
                <div
                  key={skill}
                  className="p-2.5 rounded-xl bg-[#141414] border border-[#232323] text-zinc-300 font-mono text-xs flex items-center gap-2"
                >
                  <Cpu className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Progress if active */}
          {mission.status === "In Progress" && (
            <div className="p-4 rounded-2xl bg-[#141414] border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-amber-400 font-bold">Current Active Progress</span>
                <span className="text-zinc-400">Step {mission.currentStep} of {mission.totalSteps}</span>
              </div>
              <ProgressBar progress={mission.progress || 35} size="md" />
            </div>
          )}

          {/* Details Metadata */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141414] border border-[#232323] font-mono text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-zinc-500" /> Est. Time: <strong className="text-zinc-200">{mission.timeEstimate}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-zinc-500" /> Total Steps: <strong className="text-zinc-200">{mission.totalSteps || 8} Modules</strong>
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#232323] bg-[#141414] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#2c2c2c] text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
          
          <button
            onClick={handleStart}
            disabled={mission.status === "Locked"}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {mission.status === "In Progress" ? (
              <>
                <Play className="h-4 w-4 fill-zinc-950" />
                <span>Resume Challenge</span>
              </>
            ) : (
              <>
                <span>Start Challenge in Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
