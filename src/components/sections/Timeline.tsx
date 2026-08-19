"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Code, Bug, Bot, Wrench, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Timeline() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "01",
      title: "Choose Mission",
      icon: Rocket,
      badge: "Step 1",
      heading: "Pick a Startup Engineering Specification",
      description: "Select from realistic production specs — like building an auth service, distributed cache, or realtime notifications pipeline.",
      details: ["Read real product specs & architecture design docs", "Choose tech stack (Next.js, Node, Redis, Postgres)", "Understand target SLA & RPS requirements"],
    },
    {
      id: "02",
      title: "Build Project",
      icon: Code,
      badge: "Step 2",
      heading: "Write Code in Integrated Workspace",
      description: "Code directly inside our interactive browser workspace or clone locally via Git with automated test suites.",
      details: ["Full TypeScript support with strict linting", "Live local preview and containerized microservices", "Continuous test runner monitoring step completion"],
    },
    {
      id: "03",
      title: "Make Mistakes",
      icon: Bug,
      badge: "Step 3",
      heading: "Encounter Real Production Failures",
      description: "We inject traffic spikes, race conditions, memory leaks, and unhandled promise rejections to simulate real startup outages.",
      details: ["Simulated 1,000 req/sec traffic bursts", "Database connection pool exhaustion scenarios", "Stale cache invalidation & concurrency bugs"],
    },
    {
      id: "04",
      title: "Receive Feedback",
      icon: Bot,
      badge: "Step 4",
      heading: "Socratic AI Nova Code Audit",
      description: "Nova AI inspects your code and asks targeted questions to guide you toward the root cause without spoiling the answer.",
      details: ["Line-by-line feedback on code architecture", "Performance optimization & memory hints", "No direct copy-paste code — learn by thinking"],
    },
    {
      id: "05",
      title: "Improve",
      icon: Wrench,
      badge: "Step 5",
      heading: "Refactor & Pass All Test Suites",
      description: "Apply atomic Lua scripts, index database tables, and clean up async handlers until every unit & integration test turns green.",
      details: ["Achieve 100% test suite pass rate", "Verify sub-10ms P99 latency metrics", "Earn XP bonuses for clean code structure"],
    },
    {
      id: "06",
      title: "Ship Project",
      icon: Globe,
      badge: "Step 6",
      heading: "Deploy Live & Claim Portfolio Badge",
      description: "Publish your project on a live URL with a cryptographically verified proof-of-work certificate for technical recruiters.",
      details: ["One-click deployment to custom staging subdomains", "Publicly verifiable GitHub repository & audit scorecard", "Direct inclusion in your MakeMistakes Builder Portfolio"],
    },
  ];

  const currentStep = steps[activeStep];

  return (
    <section className="py-20 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            The Engineering Loop
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-zinc-900 mt-4 tracking-tight">
            How you become industry ready
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg mt-3 font-sans">
            A 6-step practical pipeline turning tutorial followers into confident software engineers.
          </p>
        </div>

        {/* Step Navigation Pill Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-10">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`p-3 rounded-2xl border transition-all text-center cursor-pointer flex flex-col items-center justify-center ${
                  isActive
                    ? "bg-white border-teal-600 text-teal-900 shadow-md ring-1 ring-teal-600/20"
                    : "bg-zinc-100/70 border-zinc-200 text-zinc-600 hover:bg-white"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${isActive ? "bg-teal-700 text-white" : "bg-zinc-200 text-zinc-600"}`}>
                  <StepIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-semibold">{step.id} • {step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono text-xs font-semibold">
                  {currentStep.badge}
                </span>
                <span className="text-xs text-zinc-400 font-mono">Phase {activeStep + 1} of 6</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 font-sans">
                {currentStep.heading}
              </h3>

              <p className="text-zinc-600 text-base leading-relaxed">
                {currentStep.description}
              </p>

              <div className="space-y-2 pt-2">
                {currentStep.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2 text-sm text-zinc-700">
                    <ChevronRight className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                >
                  Next Step →
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-xl p-6 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 font-semibold text-zinc-800">
                <span>Phase Telemetry</span>
                <span className="text-teal-700">ACTIVE</span>
              </div>
              <div className="space-y-2 text-zinc-600">
                <div className="flex justify-between">
                  <span>Current Module:</span>
                  <span className="font-bold text-zinc-900">{currentStep.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification:</span>
                  <span className="text-emerald-600 font-bold">AUTOMATED</span>
                </div>
                <div className="flex justify-between">
                  <span>XP Reward:</span>
                  <span className="text-teal-700 font-bold">+500 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
