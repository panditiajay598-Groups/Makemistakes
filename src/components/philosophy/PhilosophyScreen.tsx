"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Code2,
  Users,
  Target,
  Rocket,
  Bug,
  Cpu,
  MessageSquare,
  RefreshCw,
  Quote,
} from "lucide-react";
import { motion } from "framer-motion";

export default function PhilosophyScreen() {
  const router = useRouter();

  const projectTraits = [
    "Ends immediately after submission",
    "Built for academic marks & grades",
    "Copied line-by-line from YouTube tutorials",
    "Never maintained or updated after completion",
    "Solves no real human problem",
    "Code stays static on a local hard drive",
  ];

  const productTraits = [
    "Solves an authentic, real-world user problem",
    "Built for real humans who rely on it daily",
    "Continuously maintained, refactored, and updated",
    "Receives live user feedback & telemetry metrics",
    "Evolves with engineering iterations & features",
    "Requires system design & production thinking",
  ];

  const journeySteps = [
    { title: "Identify Problem", desc: "Discover real pain points", icon: Target },
    { title: "Understand Users", desc: "Define user personas", icon: Users },
    { title: "Build MVP", desc: "Ship core functional code", icon: Code2 },
    { title: "Make Mistakes", desc: "Encounter real edge cases", icon: Bug },
    { title: "Debug & Fix", desc: "Root-cause telemetry errors", icon: Cpu },
    { title: "Collect Feedback", desc: "Learn from user metrics", icon: MessageSquare },
    { title: "Improve Code", desc: "Refactor architecture", icon: RefreshCw },
    { title: "Ship Product", desc: "Deploy to production", icon: Rocket },
  ];

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("philosophy_viewed", "true");
    }
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-zinc-900 font-sans selection:bg-teal-700 selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Subtle Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full border-b border-zinc-200/80 bg-[#FAF9F5]/90 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-white font-mono font-bold text-xs shadow-sm">
              <Terminal className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-zinc-900 tracking-tight font-sans">
              Make<span className="text-teal-700">Mistakes</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
              <span>Core Philosophy</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 space-y-16 sm:space-y-24">
        {/* Section 1: Hero Eyebrow & Large Original Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-mono font-semibold text-teal-800 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-teal-700 animate-pulse" />
            <span className="tracking-wide uppercase">The Mindset Shift</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-zinc-900 leading-[1.06] tracking-tight">
            College teaches you to finish projects. <br />
            <span className="text-teal-700">
              Industry hires you to ship products.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-700 font-sans leading-relaxed max-w-2xl mx-auto font-normal">
            Most students spend months following video tutorials line by line. They complete assignments, turn them in for marks, and never touch the code again. But when asked to build software from scratch or fix a production outage, they get stuck.
          </p>
        </motion.div>

        {/* Section 2: Senior Engineer Supporting Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-zinc-200/40 relative overflow-hidden space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-900">Why MakeMistakes Exists</h3>
              <p className="text-xs font-mono text-zinc-500">From a Staff Engineer&apos;s Perspective</p>
            </div>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-zinc-700 font-sans leading-relaxed">
            <p>
              In production, software is never &quot;done.&quot; Code breaks under burst load. Edge cases surface when real users type unexpected input. Databases slow down, APIs timeout, and requirements shift.
            </p>
            <p>
              Real engineering mastery doesn&apos;t come from watching someone else write bug-free code in a polished tutorial. <strong className="text-teal-800 font-semibold">It comes from building real systems, encountering unpredictable failures, making mistakes, and debugging them until they work.</strong>
            </p>
            <p className="text-zinc-900 font-medium">
              MakeMistakes was created to replace passive video tutorials with active product engineering missions.
            </p>
          </div>
        </motion.div>

        {/* Section 3: "A Project vs. A Product" Side-by-Side Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="space-y-6 text-center"
        >
          <div className="space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 leading-tight">
              Understand the Difference
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans max-w-md mx-auto">
              Compare static tutorial assignments against real production software engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* A Project Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-zinc-500">A Project</h3>
                    <span className="font-mono text-[10px] text-zinc-400 uppercase">Tutorial &amp; Academic Mindset</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-3.5">
                {projectTraits.map((trait, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-600">
                    <XCircle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* A Product Card (Highlighted in Teal) */}
            <div className="bg-white border-2 border-teal-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-teal-700/10 relative">
              <div className="absolute -top-3 right-6 bg-teal-700 text-white font-mono text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                The MakeMistakes Way
              </div>

              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                    <CheckCircle2 className="h-5 w-5 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-zinc-900">A Product</h3>
                    <span className="font-mono text-[10px] text-teal-700 font-semibold uppercase">Production Software Engineering</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-3.5">
                {productTraits.map((trait, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-900 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Visual Product Journey Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-6 text-center"
        >
          <div className="space-y-2">
            <span className="font-mono text-xs font-semibold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              THE LIFECYCLE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 leading-tight">
              The Product Engineering Journey
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans max-w-md mx-auto">
              How professionals design, test, debug, and iterate on production software.
            </p>
          </div>

          {/* Connected Grid Flow */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-left">
            {journeySteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-zinc-200/80 p-4 rounded-2xl space-y-2.5 shadow-sm hover:border-teal-300 hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-[10px] font-bold text-zinc-400">
                      0{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-teal-800 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-sans leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Section 5: Glass Quote Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="relative rounded-3xl border border-teal-200/80 bg-white/90 p-8 sm:p-12 shadow-2xl shadow-teal-700/10 text-center space-y-4 max-w-2xl mx-auto overflow-hidden backdrop-blur-xl"
        >
          <Quote className="h-8 w-8 text-teal-700 mx-auto opacity-40" />

          <blockquote className="font-serif text-2xl sm:text-4xl font-bold text-zinc-900 leading-tight tracking-tight">
            &ldquo;Projects help you graduate. <br />
            <span className="text-teal-700">Products help you grow.&rdquo;</span>
          </blockquote>

          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest pt-2">
            — The MakeMistakes Engineering Manifesto
          </p>
        </motion.div>

        {/* Section 6: Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-center pt-4 pb-8 space-y-3"
        >
          <button
            onClick={handleContinue}
            className="group relative inline-flex h-14 items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-10 text-base font-bold text-white transition-all active:scale-98 cursor-pointer shadow-xl shadow-teal-700/20 border-none font-sans"
          >
            <span>Begin Journey →</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/80 py-4 text-center text-xs font-mono text-zinc-500">
        MakeMistakes Platform © 2026 — Learn by Building. Learn by Making Mistakes.
      </footer>
    </div>
  );
}
