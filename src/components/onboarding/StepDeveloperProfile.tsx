"use client";

import React, { useState } from "react";
import { ArrowRight, User, Code2, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

interface StepDeveloperProfileProps {
  onNext: (data: { handle: string; bio: string; track: string }) => void;
  onBack?: () => void;
}

export default function StepDeveloperProfile({ onNext, onBack }: StepDeveloperProfileProps) {
  const [handle, setHandle] = useState("alex_dev");
  const [bio, setBio] = useState("Building fullstack SaaS products & AI tools.");
  const [track, setTrack] = useState("Fullstack Engineering");

  const trackOptions = [
    "Fullstack Engineering",
    "AI & Systems Architecture",
    "Backend & Distributed Queues",
    "Frontend & UI Engineering",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ handle, bio, track });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8 max-w-2xl mx-auto py-6 px-4"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-mono font-semibold text-teal-800 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-teal-700 animate-pulse" />
          <span className="tracking-wide uppercase">Developer Identity</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-tight">
          Create Your Profile
        </h2>
        <p className="text-sm text-zinc-600 font-sans max-w-md mx-auto">
          Set up your developer handle and primary engineering track.
        </p>
      </div>

      {/* Profile Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-200/40 space-y-6 text-left"
      >
        {/* Developer Handle */}
        <div className="space-y-2">
          <label className="block font-serif text-sm font-bold text-zinc-900">
            Developer Handle
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-teal-700 font-bold">
              @
            </span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              required
              className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-900 font-mono text-sm rounded-2xl pl-8 pr-4 py-3 focus:outline-none focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-700/20 transition-all"
              placeholder="your_handle"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="block font-serif text-sm font-bold text-zinc-900">
            Developer Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-zinc-50/80 border border-zinc-200 text-zinc-900 font-sans text-sm rounded-2xl p-4 focus:outline-none focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-700/20 transition-all resize-none"
            placeholder="What products do you want to build?"
          />
        </div>

        {/* Engineering Track Selection */}
        <div className="space-y-3">
          <label className="block font-serif text-sm font-bold text-zinc-900">
            Primary Focus Track
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trackOptions.map((opt) => {
              const isSelected = track === opt;
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setTrack(opt)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? "bg-teal-50/80 border-teal-700 text-teal-900 ring-2 ring-teal-700/20"
                      : "bg-zinc-50/60 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="h-4 w-4 text-teal-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit CTA */}
        <div className="pt-4 flex items-center justify-between gap-4 border-t border-zinc-100">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-800 bg-transparent border-none cursor-pointer p-0"
            >
              ← Back to Welcome
            </button>
          )}

          <button
            type="submit"
            className="ml-auto group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer border-none shadow-md shadow-teal-700/20"
          >
            <span>Save &amp; Continue →</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
