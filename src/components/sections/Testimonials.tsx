"use client";

import React from "react";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Rohan Varma",
      college: "Final Year B.Tech Student",
      outcome: "Landed Frontend Role ($18k/yr)",
      avatar: "R",
      quote:
        "Before MakeMistakes, I watched 40+ hours of React tutorials but froze during technical interviews. After debugging real Redis race conditions here, I walked into interviews with complete confidence.",
      xp: "14,200 XP",
    },
    {
      name: "Ananya Iyer",
      college: "Career Switcher (Non-CS)",
      outcome: "Fullstack Engineer @ Scaleup",
      avatar: "A",
      quote:
        "The Socratic AI mentor (Nova) is a game changer. It never gave me copy-paste answers; instead, it asked the exact right questions to help me understand race conditions and SQL indexing.",
      xp: "18,900 XP",
    },
    {
      name: "Karan Patel",
      college: "Fresher 2025",
      outcome: "Backend Intern @ DevTools",
      avatar: "K",
      quote:
        "Recruiters were blown away when I shared my MakeMistakes verified audit scorecard on LinkedIn. It proved I could write production-grade code, not just basic TODO apps.",
      xp: "9,600 XP",
    },
  ];

  return (
    <section className="py-20 bg-[#F4F3EE] border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            Student Transformations
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-zinc-900 mt-4 tracking-tight">
            From tutorial hell to industry ready
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg mt-3 font-sans">
            Hear from students, freshers, and career switchers who built real software and landed engineering roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, sIdx) => (
                    <Star key={sIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-zinc-700 leading-relaxed font-sans italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm">
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{item.name}</h4>
                    <p className="text-xs text-zinc-500">{item.college}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-xs bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                  <span className="text-teal-800 font-semibold">{item.outcome}</span>
                  <span className="text-zinc-500">{item.xp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
