"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Code, Cpu, ShieldCheck, Check, Terminal } from "lucide-react";

interface StepDetails {
  step: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  icon: React.ComponentType<any>;
  visual: React.ReactNode;
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps: StepDetails[] = [
    {
      step: "01",
      title: "Discover Problems",
      shortDesc: "Choose startup-inspired product ideas.",
      longDesc: "Select from a catalog of systems engineering specs: from rate limiters to real-time chat sync engines. These are based on real startup features, not toy homework projects.",
      icon: Search,
      visual: (
        <div className="p-5 font-sans space-y-4 text-xs">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Problem Catalog</div>
          <div className="space-y-2">
            <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded cursor-pointer hover:border-amber-500/30 transition-colors">
              <div className="flex justify-between font-mono text-[10px] text-amber-500 font-bold mb-1">
                <span>SYSTEMS</span>
                <span>Medium</span>
              </div>
              <div className="text-zinc-200 font-semibold font-display">Token Bucket Rate Limiter</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed mt-1 font-sans">
                Build a reverse proxy rate limiter that blocks requests exceeding a user-defined SLA.
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-900 p-3 rounded opacity-60">
              <div className="flex justify-between font-mono text-[10px] text-zinc-500 mb-1">
                <span>DATABASES</span>
                <span>Hard</span>
              </div>
              <div className="text-zinc-350 font-semibold font-display">B-Tree Database Index</div>
            </div>
          </div>
        </div>
      )
    },
    {
      step: "02",
      title: "Build",
      shortDesc: "Develop using your preferred stack.",
      longDesc: "Write the code in Go, Rust, TypeScript, or Python. Push to your GitHub repository and watch our automated systems compile your solution.",
      icon: Code,
      visual: (
        <div className="font-mono text-xs text-zinc-300 h-full flex flex-col">
          <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span>limiter.rs</span>
            <span className="text-[10px] text-zinc-600">Rust 1.78</span>
          </div>
          <pre className="p-4 space-y-1 overflow-x-auto select-none bg-zinc-950 flex-grow">
            <div><span className="text-amber-500">pub struct</span> <span className="text-zinc-200">RateLimiter</span> &#123;</div>
            <div>    tokens: <span className="text-amber-500">f64</span>,</div>
            <div>    last_update: <span className="text-zinc-200">Instant</span>,</div>
            <div>&#125;</div>
            <div><span className="text-amber-500">impl</span> <span className="text-zinc-200">RateLimiter</span> &#123;</div>
            <div>    <span className="text-amber-500">pub fn</span> <span className="text-zinc-200">allow_request</span>(&amp;<span className="text-amber-500">mut</span> self) -&gt; <span className="text-amber-500">bool</span> &#123; ... &#125;</div>
            <div>&#125;</div>
          </pre>
        </div>
      )
    },
    {
      step: "03",
      title: "AI Coach",
      shortDesc: "Receive feedback that guides your thinking.",
      longDesc: "Instead of spitting out ready-made code fixes, the coach asks guiding questions about memory leaks, race conditions, and synchronization loops to help you learn.",
      icon: Cpu,
      visual: (
        <div className="p-5 text-xs font-sans space-y-3">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">AI Code Review</div>
          <div className="flex gap-2">
            <span className="h-5 w-5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center font-mono text-[9px] shrink-0">AI</span>
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded leading-relaxed text-zinc-300">
              "Your implementation doesn't lock the token count updates during concurrent access. Under heavy load, requests will bypass the rate limit. Think about thread synchronization."
            </div>
          </div>
        </div>
      )
    },
    {
      step: "04",
      title: "Ship",
      shortDesc: "Publish your Proof-of-Work portfolio.",
      longDesc: "When your code survives the simulation, you deploy. Your MakeMistakes profile logs the exact performance stats, iterations, and coach transcripts as evidence for recruiters.",
      icon: ShieldCheck,
      visual: (
        <div className="p-5 font-mono text-[11px] text-zinc-300 space-y-3">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-2">Deploy Logs</div>
          <div className="space-y-1 font-sans text-zinc-400">
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold">
              <Check className="h-4 w-4" /> Pipeline Compilation Success
            </div>
            <div className="text-[11px] pl-6">✓ Deployed to edge node network</div>
            <div className="text-[11px] pl-6 font-mono text-zinc-500">Live URL: makemistakes.dev/p/sarah-limiter</div>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/60 p-2 rounded flex justify-between font-mono text-[10px] items-center">
            <span className="text-zinc-500">VERIFICATION HASH</span>
            <span className="text-amber-500">a02b4f9...</span>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <section id="how-it-works" className="relative bg-zinc-950 py-24 border-b border-zinc-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-left">
          <span className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
            THE METHODOLOGY
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl font-display mt-3 mb-6">
            A zero-lecture, execution-first workflow.
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed max-w-xl">
            MakeMistakes replaces passive learning with active engineering struggle. Here is how you build a verified portfolio recruiters trust.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: 4 Steps selectors */}
          <div className="lg:col-span-5 space-y-4">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeStep;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`group relative rounded-lg border p-4 cursor-pointer transition-all ${
                    isActive
                      ? "border-amber-500/20 bg-amber-500/[0.01]"
                      : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded font-mono text-xs font-bold ${
                      isActive ? "bg-amber-500/10 text-amber-500" : "bg-zinc-900 text-zinc-500"
                    }`}>
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h4 className={`text-sm font-semibold font-display ${isActive ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                        {item.shortDesc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Tab View Visual Details */}
          <div className="lg:col-span-7">
            <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-1 shadow-2xl">
              
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/20">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-800" />
                    <span className="h-2 w-2 rounded-full bg-zinc-800" />
                    <span className="h-2 w-2 rounded-full bg-zinc-800" />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest pl-1">
                    Step {currentStep.step} Visual
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                  <StepIcon className="h-3 w-3 text-amber-500" />
                  <span>{currentStep.title}</span>
                </div>
              </div>

              {/* Visual Display */}
              <div className="bg-zinc-950 min-h-[220px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.step}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="flex-grow"
                  >
                    {currentStep.visual}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Explanatory details card footer */}
              <div className="border-t border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {currentStep.longDesc}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
