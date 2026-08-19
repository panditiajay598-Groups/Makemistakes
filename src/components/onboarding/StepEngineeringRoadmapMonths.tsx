"use client";

import React from "react";
import { ArrowRight, CheckCircle2, Calendar, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface StepEngineeringRoadmapMonthsProps {
  onNext: () => void;
}

export default function StepEngineeringRoadmapMonths({ onNext }: StepEngineeringRoadmapMonthsProps) {
  const months = [
    { month: "Month 1", title: "Backend Systems & API Architecture", status: "Unlocked" },
    { month: "Month 2", title: "Distributed Queues & Database Scaling", status: "Upcoming" },
    { month: "Month 3", title: "Fullstack AI SaaS & Production Launch", status: "Upcoming" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-3xl mx-auto py-8 px-4 text-center"
    >
      <div className="space-y-3">
        <span className="font-mono text-xs font-semibold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          ENGINEERING ROADMAP
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-tight">
          Your 3-Month Roadmap
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 font-sans max-w-lg mx-auto">
          Tailored path based on your role, experience level, and goals.
        </p>
      </div>

      <div className="space-y-3 text-left">
        {months.map((m, idx) => (
          <div key={idx} className="bg-white border border-zinc-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 font-mono font-bold text-xs flex items-center justify-center">
                M{idx + 1}
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">{m.month}</span>
                <h4 className="font-serif text-sm font-bold text-zinc-900">{m.title}</h4>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              idx === 0 ? "bg-teal-50 text-teal-800 border-teal-200" : "bg-zinc-100 text-zinc-500 border-zinc-200"
            }`}>
              {m.status}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button
          onClick={onNext}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer border-none shadow-md shadow-teal-700/20"
        >
          <span>Enter Sprint 1 Task 1</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
