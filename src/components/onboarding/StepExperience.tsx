"use client";

import React, { useState, useEffect } from "react";
import { Compass, BookOpen, Server, Building2, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StepExperienceProps } from "./types";

export default function StepExperience({ selectedExperience, onNext }: StepExperienceProps) {
  const [current, setCurrent] = useState(selectedExperience || "I've built college projects");

  const options = [
    {
      id: "I've never built anything",
      title: "First-Time Builder",
      desc: "I understand concepts or syntax, but haven't shipped a full software product yet.",
      icon: Compass,
      key: "1",
    },
    {
      id: "I've built college projects",
      title: "Project Creator",
      desc: "I've completed coursework or personal side projects running locally on my machine.",
      icon: BookOpen,
      key: "2",
    },
    {
      id: "I've deployed applications",
      title: "Production Deployer",
      desc: "I've pushed apps live with databases, domains, authentication, or cloud hosting.",
      icon: Server,
      key: "3",
    },
    {
      id: "I've built products people use",
      title: "Active Product Builder",
      desc: "I've built software used by active real-world users, handling updates and feedback.",
      icon: Building2,
      key: "4",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const found = options.find((o) => o.key === e.key);
      if (found) {
        setCurrent(found.id);
      } else if (e.key === "Enter" && current) {
        onNext(current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, onNext, options]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-3xl mx-auto py-4 px-4"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-xs font-semibold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          ACT 2 — DISCOVER
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-zinc-900 leading-tight">
          How far have you gone?
        </h2>
        <p className="text-sm text-zinc-600 font-sans max-w-lg mx-auto bg-white border border-zinc-200 p-3.5 rounded-xl italic shadow-sm">
          &quot;We want to give you the right engineering challenges. Where should we start?&quot;
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = current === opt.id;

          return (
            <motion.div
              key={opt.id}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              onClick={() => setCurrent(opt.id)}
              className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex items-center justify-between gap-4 shadow-sm ${
                isSelected
                  ? "bg-white border-teal-700 shadow-md shadow-teal-700/10 ring-2 ring-teal-700/20"
                  : "bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-teal-50 border-teal-200 text-teal-700"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base font-bold text-zinc-900">{opt.id}</h3>
                    <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                      [{opt.key}]
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 font-sans leading-relaxed">{opt.desc}</p>
                </div>
              </div>

              <div
                className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-teal-700 border-teal-700 text-white"
                    : "border-zinc-300 bg-zinc-50 text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200">
        <span className="font-mono text-xs text-zinc-500">
          Press [1-4] or click an option to select
        </span>
        <button
          onClick={() => onNext(current)}
          className="w-full sm:w-auto group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal-700 hover:bg-teal-800 px-8 text-sm font-bold text-white transition-all cursor-pointer border-none shadow-md shadow-teal-700/20"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
