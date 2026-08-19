"use client";

import React from "react";
import { Target, Bot, Layers, Bug, Award, Zap, ShieldCheck, Compass } from "lucide-react";

export default function WhyMakeMistakes() {
  const features = [
    { icon: Target, badge: "Mission-Based", title: "Mission-Based Learning", description: "Execute specs from scratch instead of watching passive video modules." },
    { icon: Bot, badge: "AI Guidance", title: "Socratic AI Mentor", description: "Nova AI never gives direct solutions, forcing you to reason through complex bugs." },
    { icon: Layers, badge: "Production Specs", title: "Real Production Projects", description: "Build rate limiters, distributed Redis queues, auth tokens & ORM layers." },
    { icon: Bug, badge: "Synthetic Outages", title: "Synthetic Debug Challenges", description: "Confront intentional concurrency bugs & traffic surges in real containers." },
    { icon: Award, badge: "Proof of Work", title: "Cryptographic Portfolio", description: "Every mission generates a verified proof-of-work certificate hosted on staging." },
    { icon: Zap, badge: "Gamified XP", title: "XP & Developer Ranking", description: "Level up from Level 1 Explorer to Level 20 Senior Engineer by shipping clean code." },
    { icon: ShieldCheck, badge: "Milestones", title: "Achievement Badges", description: "Unlock skill badges like 'Race Condition Master' and 'Database Architect'." },
    { icon: Compass, badge: "Structured Path", title: "Career Roadmaps", description: "Follow curated paths tailored for Frontend, Backend, or Fullstack roles." },
  ];

  return (
    <section className="py-20 bg-[#F4F3EE] border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            Platform Benefits
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-zinc-900 mt-4 tracking-tight">
            Engineered for rapid skill acquisition
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg mt-3 font-sans">
            Everything you need to transform from a tutorial follower into an autonomous software engineer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-300 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 font-sans">{item.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
