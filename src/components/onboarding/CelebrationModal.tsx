"use client";

import React from "react";
import { Trophy, ArrowRight, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CelebrationModalProps } from "./types";

export default function CelebrationModal({
  isOpen,
  onContinue,
  promotionRank = "Associate Product Engineer",
  reputationEarned = 150,
  streakCount = 1,
}: CelebrationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl bg-white border border-teal-200 p-8 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Trophy Icon */}
          <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 shadow-lg relative z-10">
              <Trophy className="h-8 w-8 animate-bounce text-teal-700" />
            </div>
          </div>

          {/* Title & Celebration Header */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              🎉 SPRINT 1 COMPLETED
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
              Congratulations!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans">
              You&apos;ve successfully completed Sprint 1: Problem Discovery.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
            <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-1">
              <span className="font-mono text-[9px] text-zinc-500 uppercase block">Promotion</span>
              <span className="font-serif text-xs font-bold text-teal-800 leading-tight block">
                {promotionRank}
              </span>
            </div>

            <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-1">
              <span className="font-mono text-[9px] text-zinc-500 uppercase block">Reputation</span>
              <span className="font-mono text-base font-bold text-teal-700 block">
                +{reputationEarned}
              </span>
            </div>

            <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 space-y-1">
              <span className="font-mono text-[9px] text-zinc-500 uppercase block">Streak</span>
              <span className="font-mono text-base font-bold text-amber-600 flex items-center gap-1">
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500" /> {streakCount} Day
              </span>
            </div>
          </div>

          {/* AI Mentor Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-teal-50/70 border border-teal-200 p-5 rounded-2xl text-left space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-teal-200/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="h-9 w-9 rounded-xl bg-teal-700 text-white font-mono font-bold text-sm flex items-center justify-center">
                    AI
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                </div>
                <div>
                  <span className="font-serif text-xs font-bold text-zinc-900 block">
                    MakeMistakes AI Connected
                  </span>
                  <span className="font-mono text-[10px] text-teal-700 font-semibold">🟢 ONLINE</span>
                </div>
              </div>
            </div>

            <p className="text-xs font-sans text-teal-900 leading-relaxed italic">
              &quot;Hi, I&apos;m MakeMistakes AI. I&apos;ll be your Engineering Mentor. I won&apos;t build products for you. I&apos;ll challenge your thinking, review your code, and help you become a top engineer. Welcome to the team.&quot;
            </p>
          </motion.div>

          {/* Primary CTA */}
          <div className="pt-2">
            <button
              onClick={onContinue}
              className="w-full group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm font-sans transition-all cursor-pointer shadow-lg shadow-teal-700/20 border-none"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
