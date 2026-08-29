"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Globe,
  ShieldCheck,
  Users,
  Settings,
  Terminal,
  ArrowRight,
} from "lucide-react";
import { getOnboardingProfile, UserOnboardingProfile } from "@/lib/onboardingStore";
import { getJourneyUserId } from "@/lib/journeyUser";

export default function BuildOSPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserOnboardingProfile | null>(null);
  const [activeTab, setActiveTab] = useState("buildos");

  // Onboarding route guard
  useEffect(() => {
    const activeProf = getOnboardingProfile();
    setProfile(activeProf);
    if (!activeProf?.onboardingCompleted) {
      router.push("/onboarding");
    }
  }, [router]);

  const navItems = [
    { id: "buildos",   label: "BuildOS",          icon: LayoutDashboard, href: "/dashboard" },
    { id: "journey",   label: "Product Journey",  icon: Map,             href: "/dashboard/journey" },
    { id: "products",  label: "Products",          icon: Globe,           href: "/dashboard/products" },
    { id: "portfolio", label: "Portfolio",         icon: ShieldCheck,     href: "/dashboard/portfolio" },
    { id: "network",   label: "Builder Network",   icon: Users,           href: "#" },
    { id: "settings",  label: "Settings",          icon: Settings,        href: "/dashboard/settings" },
  ];

  const userInitial = profile?.whoAreYouRole?.charAt(0)?.toUpperCase() ?? "N";

  return (
    <div className="h-screen bg-[#F5F5F0] text-zinc-900 font-sans antialiased selection:bg-teal-700 selection:text-white flex flex-col lg:flex-row overflow-hidden">

      {/* ================================================================ */}
      {/* SIDEBAR                                                            */}
      {/* ================================================================ */}
      <aside className="w-full lg:w-[210px] h-auto lg:h-screen bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col justify-between shrink-0 py-6 px-4 overflow-y-auto lg:sticky lg:top-0 z-30">
        <div className="flex flex-col gap-6">

          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-900 font-bold no-underline group px-1"
          >
            <div className="h-8 w-8 rounded-xl bg-teal-700 flex items-center justify-center text-white font-black text-xs font-mono shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform shrink-0">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-base block text-zinc-900 tracking-tight">BuildOS</span>
              <span className="text-[10px] font-mono text-teal-700 block font-semibold -mt-0.5">
                MakeMistakes OS v6.0
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.href !== "#") router.push(item.href);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-sans transition-all cursor-pointer border ${
                    isActive
                      ? "bg-teal-50 border-teal-100 text-teal-900 font-semibold"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 border-transparent font-normal"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-teal-700" : "text-zinc-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User avatar */}
        <div className="px-1 pt-4">
          <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-bold font-mono select-none">
            {userInitial}
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* MAIN CONTENT                                                       */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">

        {/* Slim Top Header */}
        <header className="h-14 border-b border-zinc-200 bg-white px-7 flex items-center shrink-0 sticky top-0 z-20">
          <div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight font-sans">
              BuildOS
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans -mt-0.5">
              Workspace Ready
            </p>
          </div>
        </header>

        {/* Clean Workspace */}
        <main className="flex-1 flex items-center justify-center p-8 min-h-[calc(100vh-3.5rem)]">
          <div className="w-full max-w-[480px] bg-white border border-zinc-200 rounded-2xl px-10 py-10 shadow-md shadow-zinc-100 text-center">

            {/* Badge */}
            <span className="inline-block mb-5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[10px] font-mono font-semibold text-teal-800 tracking-wide">
              BuildOS
            </span>

            {/* Heading */}
            <h2 className="font-serif text-2xl sm:text-[1.65rem] font-bold text-zinc-900 tracking-tight leading-snug mb-4">
              Your workspace is ready.
            </h2>

            {/* Body */}
            <div className="text-sm text-zinc-500 font-sans leading-relaxed space-y-1.5">
              <p>The onboarding process has been completed successfully.</p>
              <p>
                Next, we&apos;ll build the Mission{" "}
                <span className="text-teal-700 font-medium">Engine</span> and real{" "}
                <span className="text-teal-700 font-medium">product</span> experience.
              </p>
            </div>

            {/* Sub-note */}
            <p className="mt-3 text-[11px] font-mono text-zinc-400">
              No missions{" "}
              <span className="text-teal-600">have been</span> loaded yet.
            </p>

            {/* CTA */}
            <div className="mt-7 flex items-center justify-center gap-3">
              <button
                id="start-building-btn"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `/api/journey/active?userId=${encodeURIComponent(getJourneyUserId())}`
                    );
                    if (res.ok) {
                      const data = await res.json();
                      if (data.problemId) {
                        window.location.href = `/journey/${data.problemId}?step=${data.currentPhase || 1}`;
                        return;
                      }
                    }
                  } catch (e) {}
                  window.location.href = "/journey/P000001?step=1";
                }}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-teal-800 hover:bg-teal-700 text-white text-sm font-semibold font-sans transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                Start Building
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="/onboarding?reset=true"
                className="inline-flex items-center gap-1 px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                Restart Onboarding ↺
              </a>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
