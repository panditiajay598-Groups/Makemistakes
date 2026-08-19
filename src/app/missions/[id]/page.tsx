"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Target,
  Flame,
  ArrowRight,
  ShieldCheck,
  Bot,
  Award,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  LayoutDashboard,
} from "lucide-react";

import { ALL_MISSIONS } from "@/components/missions/sampleMissions";
import { getMissionDetailData } from "@/components/missions/detail/getMissionDetailData";
import {
  getMissionStateDetails,
  abandonAttempt,
  practiceAgain,
  startOrResumeAttempt,
  ProofOfWorkRecord,
  Attempt,
} from "@/lib/attemptsStore";
import { saveActiveSession } from "@/lib/session";

import MissionHero from "@/components/missions/detail/MissionHero";
import ProblemOverview from "@/components/missions/detail/ProblemOverview";
import RealWorldContext from "@/components/missions/detail/RealWorldContext";
import LearningObjectives from "@/components/missions/detail/LearningObjectives";
import ArchitectureDiagram from "@/components/missions/detail/ArchitectureDiagram";
import Roadmap from "@/components/missions/detail/Roadmap";
import TechnologyGrid from "@/components/missions/detail/TechnologyGrid";
import SkillsSection from "@/components/missions/detail/SkillsSection";
import Deliverables from "@/components/missions/detail/Deliverables";
import AcceptanceCriteria from "@/components/missions/detail/AcceptanceCriteria";
import AICoachPreview from "@/components/missions/detail/AICoachPreview";
import ProofOfWorkPreview from "@/components/missions/detail/ProofOfWorkPreview";
import RelatedMissions from "@/components/missions/detail/RelatedMissions";
import StickyActionPanel from "@/components/missions/detail/StickyActionPanel";
import MissionStats from "@/components/missions/detail/MissionStats";
import MissionDetailSkeleton from "@/components/missions/detail/MissionDetailSkeleton";
import MissionDetailEmptyState from "@/components/missions/detail/MissionDetailEmptyState";

import PreviousAttemptsList from "@/components/missions/detail/PreviousAttemptsList";
import AbandonAttemptModal from "@/components/missions/detail/AbandonAttemptModal";
import ProofOfWorkModal from "@/components/missions/detail/ProofOfWorkModal";

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "stop-api-crashing-traffic-spikes";

  const [isLoading, setIsLoading] = useState(true);
  const [detailData, setDetailData] = useState<ReturnType<typeof getMissionDetailData> | null>(null);

  // Attempt system state
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [selectedPOW, setSelectedPOW] = useState<ProofOfWorkRecord | null>(null);
  const [isPOWModalOpen, setIsPOWModalOpen] = useState(false);
  const [attemptToAbandon, setAttemptToAbandon] = useState<Attempt | null>(null);
  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);

  const attemptsRef = useRef<HTMLDivElement>(null);

  const refreshState = () => {
    const data = getMissionDetailData(id);
    setDetailData(data);
    const details = getMissionStateDetails(id);
    setAttempts(details.allAttempts);
  };

  useEffect(() => {
    setIsLoading(true);
    refreshState();
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [id]);

  const handleViewPOW = (pow: ProofOfWorkRecord) => {
    setSelectedPOW(pow);
    setIsPOWModalOpen(true);
  };

  const handleResumeAttempt = (att: Attempt) => {
    saveActiveSession({
      missionId: att.missionId,
      missionTitle: att.missionTitle,
      currentStep: att.currentStep,
      totalSteps: att.totalSteps,
      activeFile: "limiter.ts",
    });
    router.push("/workspace");
  };

  const handleOpenAbandonModal = (att?: Attempt) => {
    const details = getMissionStateDetails(id);
    const target = att || details.activeAttempt;
    if (target) {
      setAttemptToAbandon(target);
      setIsAbandonModalOpen(true);
    }
  };

  const handleConfirmAbandon = () => {
    if (attemptToAbandon) {
      abandonAttempt(attemptToAbandon.id);
      setIsAbandonModalOpen(false);
      setAttemptToAbandon(null);
      refreshState();
    }
  };

  const handlePracticeAgain = () => {
    if (!detailData) return;
    const result = practiceAgain(id, detailData.mission.title, detailData.mission.totalSteps || 8);
    if (result.success && result.attempt) {
      saveActiveSession({
        missionId: id,
        missionTitle: detailData.mission.title,
        currentStep: result.attempt.currentStep,
        totalSteps: result.attempt.totalSteps,
        activeFile: detailData.mission.activeFile || "limiter.ts",
      });
      router.push("/workspace");
    }
  };

  const handleScrollToAttempts = () => {
    if (attemptsRef.current) {
      attemptsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "missions", label: "Missions", icon: Target, href: "/missions" },
    { id: "aicoach", label: "AI Coach", icon: Bot, href: "/dashboard" },
    { id: "proofofwork", label: "Proof of Work", icon: ShieldCheck, href: "/dashboard" },
    { id: "achievements", label: "Achievements", icon: Award, href: "/dashboard" },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3, href: "/dashboard" },
    { id: "community", label: "Community", icon: Users, href: "/dashboard" },
    { id: "resources", label: "Resources", icon: BookOpen, href: "/dashboard" },
    { id: "settings", label: "Settings", icon: Settings, href: "/dashboard" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-zinc-100 font-sans p-8">
        <MissionDetailSkeleton />
      </div>
    );
  }

  if (!detailData) {
    return <MissionDetailEmptyState />;
  }

  const { mission, problemStatement, realWorldCompanies, learningObjectives, roadmapSteps, technologyDetails, deliverablesList, acceptanceCriteria, aiCoachGuidelines, proofOfWorkSnippet, stats } = detailData;
  const missionStateDetails = getMissionStateDetails(mission.id);

  return (
    <div className="h-screen bg-[#090909] text-zinc-100 font-sans antialiased selection:bg-amber-500 selection:text-zinc-950 flex flex-col lg:flex-row overflow-hidden">
      
      {/* ========================================================================= */}
      {/* LEFT SIDEBAR NAVIGATION */}
      {/* ========================================================================= */}
      <aside className="w-full lg:w-64 h-auto lg:h-screen bg-[#0d0d0d] border-b lg:border-b-0 lg:border-r border-[#232323] flex flex-col justify-between shrink-0 p-5 space-y-6 overflow-y-auto lg:sticky lg:top-0 z-30">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2.5 text-zinc-100 font-bold no-underline group px-1">
            <div className="h-8 w-8 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black text-sm font-mono shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="font-display text-lg tracking-tight">MakeMistakes</span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === "missions";
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all no-underline text-left ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-[#161616]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-zinc-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#232323]">
          <div className="bg-[#111111] border border-[#232323] px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500 text-[10px]">CURRENT SPEC</span>
            <span className="text-amber-400 font-bold flex items-center gap-1.5 truncate max-w-[110px]">
              {mission.title}
            </span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN BODY AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-20 border-b border-[#232323] bg-[#0d0d0d]/80 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-zinc-50 tracking-tight flex items-center gap-2">
              <span>Engineering Specification</span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Production System Architecture & Milestone Roadmap
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 bg-[#111111] border border-[#232323] px-3 py-1.5 rounded-xl font-mono text-xs text-amber-400 font-bold">
              <Flame className="h-4 w-4 fill-amber-500/20 text-amber-500" />
              <span>4 Day Streak</span>
            </div>

            <Link
              href="/workspace"
              className="group border border-[#232323] hover:border-zinc-700 bg-[#111111] hover:bg-[#181818] text-zinc-300 hover:text-zinc-100 font-mono text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all no-underline"
            >
              <span>Workspace</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 text-zinc-400 group-hover:text-zinc-100" />
            </Link>

            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
              S
            </div>
          </div>
        </header>

        {/* Scrollable Content Grid */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          
          {/* 1. Hero Section */}
          <MissionHero
            mission={mission}
            onViewProofOfWork={handleViewPOW}
            onScrollToAttempts={handleScrollToAttempts}
            onOpenAbandonModal={() => handleOpenAbandonModal()}
          />

          {/* 2. Grid Layout: Main Details (8 cols) + Sticky Action Sidebar (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-8 min-w-0">
              
              {/* Previous Attempts Section (As specified in requirement #6) */}
              <div ref={attemptsRef}>
                <PreviousAttemptsList
                  attempts={attempts}
                  onViewProofOfWork={handleViewPOW}
                  onResumeAttempt={handleResumeAttempt}
                  onAbandonAttempt={handleOpenAbandonModal}
                  onPracticeAgain={handlePracticeAgain}
                  isMissionLocked={missionStateDetails.status === "Locked"}
                  lockedByTitle={missionStateDetails.lockedByAttempt?.missionTitle}
                />
              </div>

              <ProblemOverview problem={problemStatement} />
              <RealWorldContext companies={realWorldCompanies} />
              <LearningObjectives objectives={learningObjectives} />
              <ArchitectureDiagram />
              <Roadmap steps={roadmapSteps} currentStep={mission.currentStep || 3} />
              <TechnologyGrid technologies={technologyDetails} />
              <SkillsSection skills={mission.skills} />
              <Deliverables deliverables={deliverablesList} />
              <AcceptanceCriteria criteria={acceptanceCriteria} />
              <AICoachPreview guidelines={aiCoachGuidelines} />
              <ProofOfWorkPreview pow={proofOfWorkSnippet} techStack={mission.techStack} />
              <MissionStats stats={stats} />
              <RelatedMissions
                currentMissionId={mission.id}
                category={mission.category}
                missions={ALL_MISSIONS}
                onSelectMission={(m) => router.push(`/missions/${m.id}`)}
              />
            </div>

            {/* Desktop Sticky Right Sidebar & Mobile Sticky Bottom Bar */}
            <div className="lg:col-span-4 min-w-0">
              <StickyActionPanel
                mission={mission}
                onViewProofOfWork={handleViewPOW}
                onScrollToAttempts={handleScrollToAttempts}
                onOpenAbandonModal={() => handleOpenAbandonModal()}
              />
            </div>

          </div>

        </div>

      </div>

      {/* OVERLAY MODALS */}
      <AbandonAttemptModal
        isOpen={isAbandonModalOpen}
        attempt={attemptToAbandon}
        onClose={() => setIsAbandonModalOpen(false)}
        onConfirmAbandon={handleConfirmAbandon}
      />

      <ProofOfWorkModal
        isOpen={isPOWModalOpen}
        pow={selectedPOW}
        onClose={() => setIsPOWModalOpen(false)}
      />

    </div>
  );
}
