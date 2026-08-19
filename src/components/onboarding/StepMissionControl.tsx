"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Terminal,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot,
  Globe,
  Cpu,
} from "lucide-react";

interface StepMissionControlProps {
  onCompleteMissionControl: () => void;
}

export default function StepMissionControl({
  onCompleteMissionControl,
}: StepMissionControlProps) {
  const [bootStep, setBootStep] = useState(0);

  const bootSequence = [
    { text: "Initializing BuildOS Kernel v6.0...", delay: 400 },
    { text: "Connecting Senior Mentor Nova (🟢 Online)...", delay: 800 },
    { text: "Provisioning Product Target Workspace...", delay: 1200 },
    { text: "Allocating Sprint 1 Problem Discovery Deliverables...", delay: 1600 },
    { text: "Unlocking BuildOS Dashboard & Engineering Portfolio...", delay: 2000 },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (bootStep < bootSequence.length) {
      timer = setTimeout(() => {
        setBootStep((prev) => prev + 1);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [bootStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto py-6 font-sans text-left space-y-8 select-none"
    >
      <div className="bg-white border border-teal-200/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-widest block">
              SYSTEM INITIALIZATION
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-900 tracking-tight mt-1">
              Mission Control Online
            </h1>
          </div>

          <div className="h-10 w-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-mono font-bold text-sm shadow-md shadow-teal-700/20">
            <Terminal className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Boot Logs Terminal Screen */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 font-mono text-xs text-teal-300 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-800 pb-2">
            <span>BuildOS Kernel v6.0</span>
            <span className="text-emerald-400 font-bold">STATUS: RUNNING</span>
          </div>

          <div className="space-y-2 py-2">
            {bootSequence.slice(0, bootStep).map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between text-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-teal-500">▶</span>
                  <span>{item.text}</span>
                </div>
                <span className="text-emerald-400 font-bold">DONE ✓</span>
              </motion.div>
            ))}

            {bootStep < bootSequence.length && (
              <div className="flex items-center gap-2 text-teal-400 animate-pulse">
                <span>▶</span>
                <span>{bootSequence[bootStep].text}</span>
                <span className="inline-block w-2 h-4 bg-teal-400 ml-1" />
              </div>
            )}
          </div>
        </div>

        {/* Complete CTA Button */}
        {bootStep >= bootSequence.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-2 flex justify-end"
          >
            <button
              onClick={onCompleteMissionControl}
              className="group relative inline-flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 px-9 text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none font-sans"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Enter BuildOS Dashboard →</span>
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
