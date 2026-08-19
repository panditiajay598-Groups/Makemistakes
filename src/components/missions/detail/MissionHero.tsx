import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  Award,
  Play,
  ArrowRight,
  Bookmark,
  Share2,
  Check,
  Sparkles,
  ShieldCheck,
  Lock,
  RotateCcw,
  Eye,
  XCircle,
} from "lucide-react";
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

interface MissionHeroProps {
  mission: Mission;
  onViewProofOfWork?: (pow: ProofOfWorkRecord) => void;
  onScrollToAttempts?: () => void;
  onOpenAbandonModal?: () => void;
}

export default function MissionHero({
  mission,
  onViewProofOfWork,
  onScrollToAttempts,
  onOpenAbandonModal,
}: MissionHeroProps) {
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
    <section className="relative rounded-3xl border border-[#232323] bg-[#111111] p-6 sm:p-10 space-y-6 shadow-2xl overflow-hidden">
      {/* Background soft lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-mono text-zinc-500">
        <Link href="/missions" className="hover:text-zinc-300 transition-colors no-underline">
          Missions
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-400">{mission.category}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-amber-400 font-bold truncate max-w-[200px] sm:max-w-none">
          {mission.title}
        </span>
      </nav>

      {/* Top Badges & Meta */}
      <div className="flex flex-wrap items-center gap-3">
        <DifficultyBadge difficulty={mission.difficulty} />

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#262626] bg-[#161616] font-mono text-xs text-zinc-300">
          <Clock className="h-3.5 w-3.5 text-zinc-400" />
          <span>{mission.timeEstimate}</span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 font-mono text-xs text-amber-400 font-bold">
          <Award className="h-3.5 w-3.5" />
          <span>+{mission.xpReward} XP</span>
        </span>

        {status === "Locked" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 font-mono text-xs font-bold">
            <Lock className="h-3.5 w-3.5" />
            <span>🔒 Finish active attempt first</span>
          </span>
        )}

        {(status === "In Progress" || status === "Practicing Again") && activeAttempt && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-amber-500/40 bg-amber-500 text-zinc-950 font-mono text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Attempt #{activeAttempt.attemptNumber} In Progress ({activeAttempt.progress}%)</span>
          </span>
        )}

        {status === "Completed" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>✅ Completed ({stateDetails?.completedAttempts.length || 1} Attempt{stateDetails?.completedAttempts.length === 1 ? "" : "s"})</span>
          </span>
        )}
      </div>

      {/* Mission Title & Tagline */}
      <div className="space-y-3 max-w-4xl">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-50 tracking-tight leading-tight">
          {mission.title}
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
          {mission.description}
        </p>
      </div>

      {/* Tech Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="font-mono text-xs text-zinc-500 font-bold mr-1">Stack:</span>
        {mission.techStack.map((tech) => (
          <TechTag key={tech} name={tech} className="px-3 py-1 text-xs" />
        ))}
      </div>

      {/* Active Attempt Progress Bar */}
      {activeAttempt && (
        <div className="max-w-xl space-y-1.5 pt-2">
          <ProgressBar progress={activeAttempt.progress} label={`Attempt #${activeAttempt.attemptNumber} Active Progress`} size="md" />
        </div>
      )}

      {/* Locked status banner */}
      {status === "Locked" && stateDetails?.lockedByAttempt && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0 text-amber-400" />
            <span>🔒 Finish or abandon your current attempt first: <strong>{stateDetails.lockedByAttempt.missionTitle} (Attempt #{stateDetails.lockedByAttempt.attemptNumber})</strong></span>
          </div>
          <Link
            href={`/missions/${stateDetails.lockedByAttempt.missionId}`}
            className="px-3 py-1.5 bg-amber-500 text-zinc-950 rounded-xl font-bold text-xs no-underline hover:bg-amber-400 shrink-0"
          >
            Go to Active Attempt
          </Link>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#232323]">
        {status === "Locked" ? (
          <button
            disabled
            className="px-7 py-3.5 bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono text-sm font-bold rounded-2xl flex items-center gap-2 cursor-not-allowed opacity-80"
          >
            <Lock className="h-4.5 w-4.5" />
            <span>Locked by Current Active Attempt</span>
          </button>
        ) : status === "Completed" ? (
          /* COMPLETED MISSION CONTROLS: Show ✅ Completed, View Proof of Work, View Previous Attempts, Practice Again. Do NOT show Start Mission */
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm font-bold rounded-2xl flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>✅ Completed</span>
            </span>

            {latestPOW && onViewProofOfWork && (
              <button
                onClick={() => onViewProofOfWork(latestPOW)}
                className="px-5 py-3.5 bg-[#17251c] hover:bg-[#203426] text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>View Proof of Work</span>
              </button>
            )}

            {onScrollToAttempts && (
              <button
                onClick={onScrollToAttempts}
                className="px-5 py-3.5 bg-[#181818] hover:bg-[#222222] text-zinc-300 border border-[#2a2a2a] font-mono text-xs font-semibold rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="h-4 w-4 text-zinc-400" />
                <span>View Previous Attempts</span>
              </button>
            )}

            <button
              onClick={handlePracticeAgain}
              className="group px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-sm font-bold rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="h-4.5 w-4.5" />
              <span>Practice Again</span>
            </button>
          </div>
        ) : activeAttempt ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleStartOrResume}
              className="group px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-sm font-bold rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="h-4.5 w-4.5 fill-zinc-950" />
              <span>Resume Attempt #{activeAttempt.attemptNumber}</span>
            </button>

            {onOpenAbandonModal && (
              <button
                onClick={onOpenAbandonModal}
                className="px-4 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-xs font-semibold rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                <span>Abandon Attempt</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleStartOrResume}
            className="group px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-sm font-bold rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Engineering Challenge</span>
            <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
          </button>
        )}

        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`px-4 py-3.5 rounded-2xl font-mono text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${isBookmarked
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-[#181818] hover:bg-[#222222] text-zinc-300 border-[#2a2a2a]"
            }`}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : "text-zinc-400"}`} />
          <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
        </button>

        <button
          onClick={handleShare}
          className="px-4 py-3.5 bg-[#181818] hover:bg-[#222222] text-zinc-300 border border-[#2a2a2a] rounded-2xl font-mono text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4 text-zinc-400" />}
          <span>{copied ? "Link Copied!" : "Share"}</span>
        </button>
      </div>

    </section>
  );
}
