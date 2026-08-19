"use client";

import React from "react";
import { ArrowRight, Target, Code2, Users, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

interface StepMeetYourTeamProps {
  onNext: () => void;
}

export default function StepMeetYourTeam({ onNext }: StepMeetYourTeamProps) {
  const teamElements = [
    {
      title: "Product Challenges",
      desc: "Teaches you product thinking, user validation, and feature prioritization.",
      icon: Target,
      color: "text-teal-700 border-teal-200 bg-teal-50",
    },
    {
      title: "Engineering Missions & Sprints",
      desc: "Hands-on development solving real bugs, writing production code, and shipping features.",
      icon: Code2,
      color: "text-emerald-700 border-emerald-200 bg-emerald-50",
    },
    {
      title: "Builder Network",
      desc: "Collaborate, share code reviews, and build alongside fellow product engineers.",
      icon: Users,
      color: "text-blue-700 border-blue-200 bg-blue-50",
    },
    {
      title: "BuildOS Workspace",
      desc: "Your permanent engineering operating system and portfolio workspace.",
      icon: LayoutDashboard,
      color: "text-purple-700 border-purple-200 bg-purple-50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-4xl mx-auto py-8 px-4 text-center"
    >
      <div className="space-y-3">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
          Your Engineering Ecosystem
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 font-sans max-w-xl mx-auto">
          Here is the platform tooling supporting your product engineering journey.
        </p>
      </div>

      {/* Grid of Team Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {teamElements.map((el, idx) => {
          const Icon = el.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.4 }}
              className="bg-white border border-zinc-200/80 p-5 rounded-2xl space-y-3 hover:border-teal-300 shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${el.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-base font-bold text-zinc-900">{el.title}</h3>
              </div>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">{el.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-4">
        <button
          onClick={onNext}
          className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans"
        >
          <span>Continue to Product Challenge</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
