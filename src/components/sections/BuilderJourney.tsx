"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, Zap, Code, ShieldAlert, Rocket, Search, CheckCircle2 } from "lucide-react";

interface TimelineItem {
  stage: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export default function BuilderJourney() {
  const timeline: TimelineItem[] = [
    {
      stage: "Stage 01",
      title: "The Empty Profile",
      description: "You sign up with tutorial completion certificates, but zero compiled system repositories to show.",
      icon: Code
    },
    {
      stage: "Stage 02",
      title: "First System Challenge",
      description: "You clone your first project spec: a single-node token bucket rate limiter. It compiles on the first try.",
      icon: Rocket
    },
    {
      stage: "Stage 03",
      title: "The Concurrency Crash",
      description: "You submit your code. The sandbox simulation launches 5,000 requests. Your server panics with a memory deadlock.",
      icon: ShieldAlert
    },
    {
      stage: "Stage 04",
      title: "AI Coach Code Refactoring",
      description: "Our AI Coach points out the lock-contention issue. You rewrite the synchronization path using Read-Writer mutex locks.",
      icon: Zap
    },
    {
      stage: "Stage 05",
      title: "The Verified Deployment",
      description: "The load tests pass. Latency stays stable at 1.4ms. Your first project is verified on your profile.",
      icon: CheckCircle2
    },
    {
      stage: "Stage 06",
      title: "Verified Portfolio & Outreach",
      description: "You finish three more challenges. You send recruiters your MakeMistakes portfolio link showing raw test evidence.",
      icon: Award
    }
  ];

  return (
    <section id="builder-journey" className="bg-zinc-950 py-24 border-b border-zinc-900 relative">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
            THE CAREER FUNNEL
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
            The student builder timeline.
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            Hiring isn't about credentials. It is about progress. Here is the step-by-step evolution of a student developer on MakeMistakes.
          </p>
        </div>

        {/* Timeline Visualizer */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Center Line */}
          <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-px bg-zinc-800/80 md:-translate-x-1/2" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {timeline.map((item, idx) => {
              const Icon = item.icon;
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="relative flex flex-col md:flex-row md:items-center">
                  
                  {/* Circle Indicator */}
                  <div className="absolute left-4 md:left-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-amber-500 z-10 -translate-x-4 md:-translate-x-4">
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Left Side Content (Even cards on desktop) */}
                  <div className={`w-full md:w-1/2 pl-12 md:pl-0 md:pr-12 md:text-right ${isEven ? "md:block" : "md:invisible"}`}>
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-amber-500 uppercase tracking-widest font-semibold">{item.stage}</span>
                      <h4 className="text-base font-semibold text-zinc-200 font-display">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed md:max-w-md md:ml-auto">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Side Content (Odd cards on desktop) */}
                  <div className={`w-full md:w-1/2 pl-12 md:pl-12 mt-2 md:mt-0 ${!isEven ? "md:block" : "md:invisible md:absolute"}`}>
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] text-amber-500 uppercase tracking-widest font-semibold">{item.stage}</span>
                      <h4 className="text-base font-semibold text-zinc-200 font-display">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed md:max-w-md">
                        {item.description}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
