"use client";

import React, { useState } from "react";
import { Clock, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function FeaturedMissions() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const missions = [
    {
      id: "m01",
      name: "Mission 01: Next.js Server Actions Auth",
      category: "fullstack",
      difficulty: "Beginner",
      duration: "2.5 Hours",
      xp: "+350 XP",
      skills: ["Next.js 15", "TypeScript", "JWT", "Cookies"],
      description: "Build secure session management using HTTP-only cookies and mitigate XSS attacks in Server Components.",
    },
    {
      id: "m02",
      name: "Mission 02: Redis Rate Limiting Engine",
      category: "backend",
      difficulty: "Intermediate",
      duration: "4.0 Hours",
      xp: "+500 XP",
      skills: ["Redis", "Node.js", "Lua Scripting", "Express"],
      description: "Implement a sliding-window token bucket algorithm to survive 1,000 req/sec synthetic burst traffic spikes.",
    },
    {
      id: "m03",
      name: "Mission 03: PostgreSQL Query Optimization",
      category: "database",
      difficulty: "Intermediate",
      duration: "3.5 Hours",
      xp: "+450 XP",
      skills: ["PostgreSQL", "Prisma", "EXPLAIN ANALYZE"],
      description: "Diagnose N+1 query bottlenecks and reduce API response latency from 1.2s to 12ms using targeted indexing.",
    },
    {
      id: "m04",
      name: "Mission 04: Realtime WebSockets Order Engine",
      category: "fullstack",
      difficulty: "Hardcore",
      duration: "6.0 Hours",
      xp: "+750 XP",
      skills: ["WebSockets", "React 19", "Node", "Pub/Sub"],
      description: "Construct a live orderbook matching engine with automatic reconnects and message deduplication.",
    },
    {
      id: "m05",
      name: "Mission 05: Docker Microservices",
      category: "devops",
      difficulty: "Intermediate",
      duration: "3.0 Hours",
      xp: "+400 XP",
      skills: ["Docker", "Docker Compose", "Nginx", "Linux"],
      description: "Containerize multi-tier web apps, configure SSL reverse proxies, and manage internal network bridge security.",
    },
    {
      id: "m06",
      name: "Mission 06: Zero-Trust API Gateway",
      category: "backend",
      difficulty: "Hardcore",
      duration: "5.5 Hours",
      xp: "+800 XP",
      skills: ["OAuth2", "gRPC", "Go", "Kubernetes"],
      description: "Design a high-throughput API Gateway with mTLS authentication, CORS policies, and Circuit Breaker logic.",
    },
  ];

  const filteredMissions =
    selectedCategory === "all"
      ? missions
      : missions.filter((m) => m.category === selectedCategory);

  return (
    <section id="missions" className="py-20 bg-[#F4F3EE] border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            Mission Catalogue
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-zinc-900 mt-4 tracking-tight">
            Featured developer missions
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg mt-3 font-sans">
            No dummy assignments. Solve real engineering specifications designed by industry leaders.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-10 font-mono text-xs">
          {[
            { id: "all", label: "All Missions" },
            { id: "fullstack", label: "Fullstack Web" },
            { id: "backend", label: "Backend Systems" },
            { id: "database", label: "Database & ORM" },
            { id: "devops", label: "DevOps & Cloud" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full transition-all border ${
                selectedCategory === cat.id
                  ? "bg-teal-700 text-white border-teal-800 font-semibold shadow-sm"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMissions.map((mission) => (
            <div
              key={mission.id}
              className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full">
                    {mission.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mission.duration}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 font-sans leading-snug">{mission.name}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans">{mission.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mission.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-1 text-amber-700 font-bold">
                  <Trophy className="w-4 h-4" />
                  <span>{mission.xp}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => (window.location.href = `/missions/${mission.id}`)}
                >
                  Start Mission
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
