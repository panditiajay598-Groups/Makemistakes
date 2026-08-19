"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Award, Briefcase, Rocket, RefreshCw, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StepWhoAreYouProps } from "./types";

export default function StepWhoAreYou({ selectedRole, onNext }: StepWhoAreYouProps) {
  const [current, setCurrent] = useState(selectedRole || "College Student");

  const roles = [
    {
      id: "College Student",
      label: "College Student",
      desc: "Building foundations, looking for internships & campus placements.",
      icon: GraduationCap,
      color: "text-teal-700 border-teal-200 bg-teal-50",
      key: "1",
    },
    {
      id: "Recent Graduate",
      label: "Recent Graduate",
      desc: "Ready to transition from academia to real production software engineering.",
      icon: Award,
      color: "text-emerald-700 border-emerald-200 bg-emerald-50",
      key: "2",
    },
    {
      id: "Working Professional",
      label: "Working Professional",
      desc: "Up-skilling, shifting to AI/Systems, or targeting senior product engineering roles.",
      icon: Briefcase,
      color: "text-blue-700 border-blue-200 bg-blue-50",
      key: "3",
    },
    {
      id: "Founder",
      label: "Founder",
      desc: "Building a startup from 0 to 1, shipping MVP & scaling user product infrastructure.",
      icon: Rocket,
      color: "text-purple-700 border-purple-200 bg-purple-50",
      key: "4",
    },
    {
      id: "Career Switcher",
      label: "Career Switcher",
      desc: "Pivoting into tech by building real-world proof of work rather than certificates.",
      icon: RefreshCw,
      color: "text-rose-700 border-rose-200 bg-rose-50",
      key: "5",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const found = roles.find((r) => r.key === e.key);
      if (found) {
        setCurrent(found.id);
      } else if (e.key === "Enter" && current) {
        onNext(current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, onNext, roles]);

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
          Where are you in your journey?
        </h2>
        <p className="text-sm text-zinc-600 font-sans max-w-lg mx-auto bg-white border border-zinc-200 p-3.5 rounded-xl italic shadow-sm">
          &quot;We want to know where you are starting from so MakeMistakes AI can tailor your engineering feedback.&quot;
        </p>
      </div>

      {/* Role Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map((r, idx) => {
          const Icon = r.icon;
          const isSelected = current === r.id;

          return (
            <motion.div
              key={r.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setCurrent(r.id)}
              className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm ${
                isSelected
                  ? "bg-white border-teal-700 shadow-md shadow-teal-700/10 ring-2 ring-teal-700/20"
                  : "bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/50"
              } ${idx === roles.length - 1 ? "sm:col-span-2 sm:max-w-md sm:mx-auto w-full" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl border flex items-center justify-center ${r.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-zinc-900">{r.label}</h3>
                    <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                      Press [{r.key}]
                    </span>
                  </div>
                </div>

                <div
                  className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-teal-700 border-teal-700 text-white"
                      : "border-zinc-300 bg-zinc-50 text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              <p className="text-xs text-zinc-600 font-sans leading-relaxed">{r.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200">
        <span className="font-mono text-xs text-zinc-500">
          Tip: Use number keys [1-5] for quick selection
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
