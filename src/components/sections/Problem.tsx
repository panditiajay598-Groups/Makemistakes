"use client";

import React from "react";
import { XCircle, CheckCircle2 } from "lucide-react";

export default function Problem() {
  const traditionalPoints = [
    { title: "Passive Video Watching", desc: "Hours of video courses that feel productive, but result in zero real-world retention." },
    { title: "Copy-Pasting Line-by-Line", desc: "Following tutorials where everything works smoothly until you try to code alone." },
    { title: "No System Debugging", desc: "Never experiencing real production outages, race conditions, or memory leaks." },
    { title: "Generic Cookie-Cutter Projects", desc: "Building basic TODO apps that hiring managers discard immediately." },
  ];

  const makeMistakesPoints = [
    { title: "Real Production Systems", desc: "Build rate limiters, distributed Redis queues, auth tokens & web-scale APIs." },
    { title: "Deliberate Bug Injections", desc: "Debug live synthetic traffic spikes and race conditions in real time." },
    { title: "Socratic AI Coaching", desc: "Nova AI guides you with questions rather than spoon-fed code solutions." },
    { title: "Verified Proof-of-Work", desc: "Publicly verifiable audit scorecards hosted on live staging subdomains." },
  ];

  return (
    <section id="problem" className="py-20 bg-[#F4F3EE] border-t border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            Why Traditional Learning Fails
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-zinc-900 mt-4 tracking-tight">
            Stop wasting months in tutorial hell
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg mt-3 font-sans">
            Watching videos doesn't turn you into a software engineer. Active debugging does.
          </p>
        </div>

        {/* Comparison Side-by-Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traditional Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 font-sans">Traditional Video Courses</h3>
                <p className="text-xs text-rose-700 font-mono">Passive • Low Retention • Cookie-Cutter</p>
              </div>
            </div>

            <div className="space-y-4">
              {traditionalPoints.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">{item.title}</h4>
                    <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MakeMistakes Card */}
          <div className="bg-white rounded-2xl border border-teal-200/80 p-8 shadow-sm ring-1 ring-teal-600/10">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 font-sans">MakeMistakes Approach</h3>
                <p className="text-xs text-teal-800 font-mono">Active Debugging • Production Ready • Real Portfolio</p>
              </div>
            </div>

            <div className="space-y-4">
              {makeMistakesPoints.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-teal-50/50 border border-teal-100">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">{item.title}</h4>
                    <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
