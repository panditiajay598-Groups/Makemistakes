import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Award, Play, ArrowRight, Bookmark, Share2, Check, ShieldCheck, Lock, RotateCcw, Eye, XCircle } from "lucide-react";
import { saveActiveSession } from "@/lib/session";
import {
  getMissionStateDetails,
  startOrResumeAttempt,
  practiceAgain,
  MissionStateDetails,
  ProofOfWorkRecord,
} from "@/lib/attemptsStore";
import { Mission } from "../types";
import DifficultyBadge from "../DifficultyBadge";
import TechTag from "../TechTag";
import ProgressBar from "../ProgressBar";

interface StickyActionPanelProps {
  mission: Mission;
  onViewProofOfWork?: (pow: ProofOfWorkRecord) => void;
  onScrollToAttempts?: () => void;
  onOpenAbandonModal?: () => void;
}

export default function StickyActionPanel({
  mission,
  onViewProofOfWork,
  onScrollToAttempts,
  onOpenAbandonModal,
}: StickyActionPanelProps) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stateDetails, setStateDetails] = useState<MissionStateDetails | null>(null);

  useEffect(() => {
    setStateDetails(getMissionStateDetails(mission.id));
  }, [mission.id]);

  const handleStartOrResume = () => {
    const result = startOrResumeAttempt(mission.id, mission.title, mission.totalSteps || 8);
    if (result.success && result.attempt) {
      saveActiveSession({
        missionId: mission.id,
        missionTitle: mission.title,
        currentStep: result.attempt.currentStep,
        totalSteps: result.attempt.totalSteps,
        activeFile: mission.activeFile || "limiter.ts",
      });
      router.push("/workspace");
    }
  };

  const handlePracticeAgain = () => {
    const result = practiceAgain(mission.id, mission.title, mission.totalSteps || 8);
    if (result.success && result.attempt) {
      saveActiveSession({
        missionId: mission.id,
        missionTitle: mission.title,
        currentStep: result.attempt.currentStep,
        totalSteps: result.attempt.totalSteps,
        activeFile: mission.activeFile || "limiter.ts",
      });
      router.push("/workspace");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const status = stateDetails?.status || mission.status;
  const activeAttempt = stateDetails?.activeAttempt;
  const latestPOW = stateDetails?.completedAttempts[stateDetails.completedAttempts.length - 1]?.proofOfWork;

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP STICKY RIGHT SIDEBAR */}
      {/* ========================================================================= */}
      <div className="hidden lg:block space-y-6 sticky top-24">
        <div className="rounded-3xl border border-[#232323] bg-[#111111] p-6 space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="space-y-4 border-b border-[#232323] pb-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                CHALLENGE METRICS
              </span>
              <DifficultyBadge difficulty={mission.difficulty} />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d0d0d] border border-[#232323]">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-zinc-500" /> Time Required
                </span>
                <span className="text-zinc-100 font-bold">{mission.timeEstimate}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0d0d0d] border border-[#232323]">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" /> XP Reward
                </span>
                <span className="text-amber-400 font-bold">+{mission.xpReward} XP</span>
              </div>
            </div>

            {/* Active Attempt Progress bar */}
            {activeAttempt && (
              <div className="space-y-2 pt-1">
                <ProgressBar progress={activeAttempt.progress} label={`Attempt #${activeAttempt.attemptNumber} Progress`} size="sm" />
              </div>
            )}
          </div>

          {/* Core Action Buttons per specification */}
          <div className="space-y-3">
            
            {/* LOCKED STATE */}
            {status === "Locked" ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 font-mono text-xs text-amber-300">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span>Locked</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                    🔒 Finish or abandon your current attempt first.
                  </p>
                  {stateDetails?.lockedByAttempt && (
                    <div className="pt-1 border-t border-amber-500/20 text-[10px] text-zinc-400">
                      Active Attempt: <strong className="text-amber-300">{stateDetails.lockedByAttempt.missionTitle} (Attempt #{stateDetails.lockedByAttempt.attemptNumber})</strong>
                    </div>
                  )}
                </div>

                <button
                  disabled
                  className="w-full py-3.5 bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                >
                  <Lock className="h-4 w-4" />
                  <span>Locked by Active Attempt</span>
                </button>
              </div>
            ) : status === "Completed" ? (
              /* COMPLETED MISSION CONTROLS: Show ✅ Completed, View Proof of Work, View Previous Attempts, Practice Again. Do NOT show Start Mission */
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 font-mono text-xs font-bold text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>✅ Completed</span>
                </div>

                {latestPOW && onViewProofOfWork && (
                  <button
                    onClick={() => onViewProofOfWork(latestPOW)}
                    className="w-full py-3 bg-[#16251b] hover:bg-[#203527] text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>View Proof of Work</span>
                  </button>
                )}

                <button
                  onClick={onScrollToAttempts}
                  className="w-full py-2.5 bg-[#181818] hover:bg-[#222222] text-zinc-300 border border-[#2a2a2a] font-mono text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-zinc-400" />
                  <span>View Previous Attempts ({stateDetails?.completedAttempts.length || 1})</span>
                </button>

                <button
                  onClick={handlePracticeAgain}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Practice Again</span>
                </button>
              </div>
            ) : activeAttempt ? (
              /* ACTIVE ATTEMPT (In Progress or Practicing Again) */
              <div className="space-y-2.5">
                <button
                  onClick={handleStartOrResume}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="h-4 w-4 fill-zinc-950" />
                  <span>Resume Attempt #{activeAttempt.attemptNumber}</span>
                </button>

                {onOpenAbandonModal && (
                  <button
                    onClick={onOpenAbandonModal}
                    className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Abandon Attempt</span>
                  </button>
                )}
              </div>
            ) : (
              /* NOT STARTED STATE */
              <button
                onClick={handleStartOrResume}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Mission</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`py-2.5 rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                  isBookmarked
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-[#161616] hover:bg-[#202020] text-zinc-300 border-[#282828]"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : "text-zinc-400"}`} />
                <span>{isBookmarked ? "Saved" : "Save"}</span>
              </button>

              <button
                onClick={handleShare}
                className="py-2.5 bg-[#161616] hover:bg-[#202020] text-zinc-300 border border-[#282828] rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-zinc-400" />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* Tech stack summary */}
          <div className="space-y-2 pt-2 border-t border-[#232323]">
            <span className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              REQUIRED STACK
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mission.techStack.map((tech) => (
                <TechTag key={tech} name={tech} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM BAR */}
      {/* ========================================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-md border-t border-[#232323] p-4 flex items-center justify-between gap-4 shadow-2xl">
        <div className="space-y-0.5 font-mono text-xs min-w-0">
          <div className="text-zinc-100 font-bold truncate max-w-[160px]">
            {mission.title}
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            {status === "Locked" ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Lock className="h-3 w-3" /> Locked
              </span>
            ) : status === "Completed" ? (
              <span className="text-emerald-400 font-bold">✅ Completed</span>
            ) : (
              <>
                <span>{mission.timeEstimate}</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">+{mission.xpReward} XP</span>
              </>
            )}
          </div>
        </div>

        {status === "Locked" ? (
          <button
            disabled
            className="px-4 py-2.5 bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono text-xs font-bold rounded-xl flex items-center gap-1 cursor-not-allowed shrink-0"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Locked</span>
          </button>
        ) : status === "Completed" ? (
          <button
            onClick={handlePracticeAgain}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20 shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Practice Again</span>
          </button>
        ) : (
          <button
            onClick={handleStartOrResume}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20 shrink-0"
          >
            {activeAttempt ? (
              <>
                <Play className="h-4 w-4 fill-zinc-950" />
                <span>Resume #{activeAttempt.attemptNumber}</span>
              </>
            ) : (
              <>
                <span>Start Mission</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
}
