"use client";

import React from "react";
import { ExternalLink, Github, Trophy, CheckCircle } from "lucide-react";

export default function PortfolioShowcase() {
  const showcases = [
    {
      student: "Arjun Mehta",
      role: "SaaS Systems Track",
      hiredAt: "Frontend Dev @ Series A Startup",
      projectTitle: "Distributed Redis Rate Limiter Engine",
      score: "99/100",
      badge: "Performance Master",
      github: "https://github.com/makemistakes40-cpu/mmp",
      demo: "https://makemistakes.app",
      tech: ["Next.js 15", "Redis", "TypeScript", "Tailwind"],
      auditSummary: "Passed 100% load test suites (1,250 RPS), 0 race conditions detected, P99 latency 3.8ms.",
    },
    {
      student: "Sneha Sharma",
      role: "Backend Architect Track",
      hiredAt: "Software Engineer @ FinTech Scaleup",
      projectTitle: "High-Throughput WebSockets Orderbook",
      score: "98/100",
      badge: "Realtime Architect",
      github: "https://github.com/makemistakes40-cpu/mmp",
      demo: "https://makemistakes.app",
      tech: ["WebSockets", "Node.js", "PostgreSQL", "Docker"],
      auditSummary: "Survived 10,000 simultaneous order book placement bursts with automated failover logic.",
    },
  ];

  return (
    <section id="portfolio" className="py-20 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            Verified Proof of Work
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-zinc-900 mt-4 tracking-tight">
            Portfolios that actually get you hired
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg mt-3 font-sans">
            Every project completed on MakeMistakes comes with a verifiable automated audit certificate and live deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {showcases.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-zinc-200 p-7 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm">
                    {item.student.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">{item.student}</h3>
                    <p className="text-xs text-teal-700 font-mono">{item.role} • {item.hiredAt}</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Score: {item.score}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-zinc-900 font-sans">{item.projectTitle}</h4>
                  <span className="text-xs font-mono font-semibold bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>

                <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200 font-mono">
                  🔍 <strong className="text-zinc-900">AI Socratic Audit:</strong> {item.auditSummary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tech.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <a
                    href={item.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-800 hover:bg-zinc-200 transition-colors font-medium"
                  >
                    <Github className="w-4 h-4" />
                    <span>View GitHub Repo</span>
                  </a>

                  <a
                    href={item.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 hover:bg-teal-100 transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Demo</span>
                  </a>
                </div>

                <span className="text-xs font-mono text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
