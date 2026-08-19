"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  ShieldCheck,
  Bot,
  Award,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  LayoutDashboard,
} from "lucide-react";

import { getActiveSession } from "@/lib/session";
import { Mission, FilterState, Category } from "@/components/missions/types";
import { ALL_MISSIONS } from "@/components/missions/sampleMissions";

import MissionHeader from "@/components/missions/MissionHeader";
import ContinueBuildingCard from "@/components/missions/ContinueBuildingCard";
import AIRecommendationCard from "@/components/missions/AIRecommendationCard";
import LearningPathSection from "@/components/missions/LearningPathSection";
import TrendingMissionsSection from "@/components/missions/TrendingMissionsSection";
import CategoryDiscoveryGrid from "@/components/missions/CategoryDiscoveryGrid";
import RecentlyAddedSection from "@/components/missions/RecentlyAddedSection";
import AllMissionsSection from "@/components/missions/AllMissionsSection";
import MissionDetailModal from "@/components/missions/MissionDetailModal";
import MissionSkeleton from "@/components/missions/MissionSkeleton";

const initialFilters: FilterState = {
  searchQuery: "",
  category: "All",
  difficulty: "All",
  technology: "All",
  status: "All",
  timeRequired: "All",
  xpRange: "All",
};

export default function MissionCatalogPage() {
  const [missions] = useState<Mission[]>(ALL_MISSIONS);
  const [activeSessionMission, setActiveSessionMission] = useState<Mission | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);

  // Filter state for All Missions section
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Load session from storage on mount
  useEffect(() => {
    const session = getActiveSession();
    if (session && session.missionTitle) {
      const active = missions.find((m) => m.id === session.missionId) || {
        id: session.missionId || "stop-api-crashing-traffic-spikes",
        title: session.missionTitle,
        description: "Implement a Redis-backed Sliding Window Log rate limiter to gracefully protect downstream services during 100k req/min surges.",
        difficulty: "Medium",
        category: "Backend",
        timeEstimate: "2 hrs",
        xpReward: 500,
        techStack: ["Redis", "Node.js", "TypeScript"],
        skills: ["Rate Limiting", "Concurrency", "API Design"],
        status: "In Progress",
        progress: 37,
        currentStep: session.currentStep || 3,
        totalSteps: session.totalSteps || 8,
        activeFile: session.activeFile || "limiter.ts",
      };
      setActiveSessionMission(active as Mission);
    } else {
      setActiveSessionMission(null);
    }

    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [missions]);

  // Section 2: AI Recommended Next Challenge (Pick single best mission distinct from active)
  const { aiRecommendedMission, recommendationReason } = useMemo(() => {
    const activeId = activeSessionMission?.id;
    // Recommend job queue or database optimization if active is rate limiter
    const rec = missions.find((m) => m.id !== activeId && m.id === "build-distributed-job-queue") ||
                missions.find((m) => m.id !== activeId) || missions[0];

    const reason = activeSessionMission
      ? `Because you've completed 37% of "${activeSessionMission.title}", your next logical milestone is building a resilient Distributed Job Queue.`
      : `Based on your backend engineering profile, we recommend starting with high-concurrency event queue systems.`;

    return { aiRecommendedMission: rec, recommendationReason: reason };
  }, [activeSessionMission, missions]);

  // Section 4: Trending Missions (Deduplicated against Active & AI Recommendation)
  const trendingMissions = useMemo(() => {
    const excludeIds = new Set<string>();
    if (activeSessionMission) excludeIds.add(activeSessionMission.id);
    if (aiRecommendedMission) excludeIds.add(aiRecommendedMission.id);

    return missions.filter((m) => !excludeIds.has(m.id)).slice(0, 3);
  }, [missions, activeSessionMission, aiRecommendedMission]);

  // Section 6: Recently Added Missions (Deduplicated)
  const recentlyAddedMissions = useMemo(() => {
    const excludeIds = new Set<string>();
    if (activeSessionMission) excludeIds.add(activeSessionMission.id);
    if (aiRecommendedMission) excludeIds.add(aiRecommendedMission.id);
    trendingMissions.forEach((m) => excludeIds.add(m.id));

    return missions.filter((m) => !excludeIds.has(m.id)).slice(0, 3);
  }, [missions, activeSessionMission, aiRecommendedMission, trendingMissions]);

  // Section 7: All Missions Library (Filtered & Deduplicated)
  const filteredMissions = useMemo(() => {
    const excludeIds = new Set<string>();
    if (activeSessionMission) excludeIds.add(activeSessionMission.id);
    if (aiRecommendedMission) excludeIds.add(aiRecommendedMission.id);

    return missions.filter((m) => {
      if (excludeIds.has(m.id)) return false;

      // Filter matches
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(query);
        const matchesDesc = m.description.toLowerCase().includes(query);
        const matchesTech = m.techStack.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTech) return false;
      }

      if (filters.category !== "All" && m.category !== filters.category) return false;
      if (filters.difficulty !== "All" && m.difficulty !== filters.difficulty) return false;
      if (filters.technology !== "All" && !m.techStack.includes(filters.technology)) return false;

      return true;
    });
  }, [missions, activeSessionMission, aiRecommendedMission, filters]);

  // Category counts memo
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: missions.length };
    missions.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, [missions]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.category !== "All") count++;
    if (filters.difficulty !== "All") count++;
    if (filters.technology !== "All") count++;
    if (filters.status !== "All") count++;
    if (filters.timeRequired !== "All") count++;
    if (filters.xpRange !== "All") count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
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
        <MissionSkeleton />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#090909] text-zinc-100 font-sans antialiased selection:bg-amber-500 selection:text-zinc-950 flex flex-col lg:flex-row overflow-hidden">
      
      {/* ========================================================================= */}
      {/* LEFT SIDEBAR NAVIGATION */}
      {/* ========================================================================= */}
      <aside className="w-full lg:w-64 h-auto lg:h-screen bg-[#0d0d0d] border-b lg:border-b-0 lg:border-r border-[#232323] flex flex-col justify-between shrink-0 p-5 space-y-6 overflow-y-auto lg:sticky lg:top-0 z-30">
        <div className="space-y-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 text-zinc-100 font-bold no-underline group px-1">
            <div className="h-8 w-8 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black text-sm font-mono shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="font-display text-lg tracking-tight">MakeMistakes</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === "missions";
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all no-underline ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-[#151515]"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-zinc-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-3 rounded-2xl bg-[#141414] border border-[#232323] flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
            SK
          </div>
          <div className="space-y-0.5 font-mono text-xs overflow-hidden">
            <div className="text-zinc-100 font-bold truncate">Sai Kumar</div>
            <div className="text-zinc-500 text-[11px] truncate">Level 4 • 2,450 XP</div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN DISCOVERY CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 h-full overflow-y-auto max-w-6xl mx-auto p-6 sm:p-8 space-y-10">
        
        {/* Header */}
        <MissionHeader
          filters={filters}
          onFilterChange={setFilters}
          onFilterReset={handleResetFilters}
          activeFilterCount={activeFilterCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* SECTION 1: Continue Building (Only shown if active session exists) */}
        {activeSessionMission && (
          <section className="space-y-3">
            <ContinueBuildingCard mission={activeSessionMission} />
          </section>
        )}

        {/* SECTION 2: AI Recommended Next Challenge */}
        {aiRecommendedMission && (
          <section className="space-y-3">
            <AIRecommendationCard
              mission={aiRecommendedMission}
              recommendationReason={recommendationReason}
              onSelect={setSelectedMission}
            />
          </section>
        )}

        {/* SECTION 3: Continue Your Learning Path */}
        <section>
          <LearningPathSection />
        </section>

        {/* SECTION 4: Trending Missions */}
        <section>
          <TrendingMissionsSection
            missions={trendingMissions}
            onSelect={setSelectedMission}
          />
        </section>

        {/* SECTION 5: Browse by Category */}
        <section>
          <CategoryDiscoveryGrid
            selectedCategory={filters.category}
            onSelectCategory={(cat: Category) => setFilters((prev) => ({ ...prev, category: cat }))}
            categoryCounts={categoryCounts}
          />
        </section>

        {/* SECTION 6: Recently Added */}
        <section>
          <RecentlyAddedSection
            missions={recentlyAddedMissions}
            onSelect={setSelectedMission}
          />
        </section>

        {/* SECTION 7: All Missions Library */}
        <section>
          <AllMissionsSection
            missions={filteredMissions}
            onSelect={setSelectedMission}
            filters={filters}
            setFilters={setFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onClearFilters={handleResetFilters}
            activeFilterCount={activeFilterCount}
          />
        </section>

      </main>

      {/* Mission Detail Modal Overlay */}
      {selectedMission && (
        <MissionDetailModal
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}

    </div>
  );
}
