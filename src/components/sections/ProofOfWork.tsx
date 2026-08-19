"use client";

import React from "react";
import { Check, X, Shield, FileText, Code2, Layers, AlertCircle } from "lucide-react";

export default function ProofOfWork() {
  const traditionalRow = [
    { title: "Generic PDF Resume", detail: "A list of bullet points claiming you know languages. Recruiters must guess if you wrote the code or copied it." },
    { title: "Online Course Certificates", desc: "Proof of completion, not competence.", detail: "Recruiters know you can press play on videos. It doesn't prove you can debug production-level errors." },
    { title: "Toy GitHub Repositories", desc: "Unfinished side projects.", detail: "Standard class assignments or fork/copy templates with zero commit history or verified performance metrics." }
  ];

  const makeMistakesRow = [
    { title: "Verifiable Performance Logs", detail: "Recruiters see raw proof: system throughput (e.g. 10k req/s) and SLA response times under simulated spikes." },
    { title: "Commit History of Iterations", desc: "Verifiable debug logs.", detail: "Our platform records your progress. Recruiters can view every mistake you made, how you resolved it, and your code architecture evolution." },
    { title: "AI Coach Code Review Logs", desc: "Architectural decision logs.", detail: "Recruiters see how you respond to senior feedback. Your structural decisions and code comments are fully logged and authenticated." }
  ];

  return (
    <section id="proof-of-work" className="bg-zinc-950 py-24 border-b border-zinc-900 relative">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
            EVIDENCE OVER RESUMES
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
            What is a Proof of Work portfolio?
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            Most hiring managers reject certificates because they can be easily faked or completed via copy-pasting. MakeMistakes replaces certificates with raw, un-fakeable coding evidence.
          </p>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Traditional Panel */}
          <div className="lg:col-span-6 rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
                <X className="h-4.5 w-4.5 text-zinc-500" />
                <span>Traditional Application (Guesswork)</span>
              </div>
              
              {traditionalRow.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                    <h4 className="text-sm font-semibold text-zinc-300 font-display">{item.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-500 font-sans leading-relaxed pl-3.5">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-zinc-900 pt-6">
              <div className="flex gap-2 items-start text-zinc-500 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-zinc-650" />
                <p className="font-sans leading-relaxed text-[11px]">
                  Recruiters spend an average of 6 seconds guessing if your credentials represent real coding abilities.
                </p>
              </div>
            </div>
          </div>

          {/* MakeMistakes Panel */}
          <div className="lg:col-span-6 rounded-xl border border-amber-500/10 bg-amber-500/[0.01] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.02),transparent_40%)]" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase tracking-wider border-b border-zinc-800/40 pb-3">
                <Check className="h-4.5 w-4.5 text-amber-500" />
                <span>MakeMistakes Profile (Proof of Work)</span>
              </div>
              
              {makeMistakesRow.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <h4 className="text-sm font-semibold text-zinc-200 font-display">{item.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed pl-3.5">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-zinc-800/40 pt-6 relative z-10">
              <div className="flex gap-2 items-start text-amber-500/80 text-xs">
                <Shield className="h-4 w-4 shrink-0 text-amber-500/60" />
                <p className="font-sans leading-relaxed text-[11px] text-zinc-400">
                  Verifiable proof showing the system SLA benchmarks, debugging transcripts, and active code deployments.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
