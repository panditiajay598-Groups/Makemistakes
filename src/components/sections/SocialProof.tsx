"use client";

import React from "react";
import { motion } from "framer-motion";

export default function SocialProof() {
  const stats = [
    { value: "14,820+", label: "Systems Deployed", detail: "Docker & Kubernetes sandbox loads" },
    { value: "32,492+", label: "Traffic Tests Run", detail: "Simulated spikes up to 10k req/s" },
    { value: "4,119", label: "Mistakes Debugged", detail: "AI Coach guided refactorings" },
    { value: "100%", label: "Code Evidence", detail: "Verifiable Raw Commits & Logs" }
  ];

  return (
    <section className="border-y border-zinc-900 bg-zinc-950/20 py-8 relative">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-center text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="flex flex-col space-y-1.5"
            >
              <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-zinc-400 font-display">
                {stat.label}
              </div>
              <div className="text-[10px] text-zinc-650 font-sans hidden sm:block">
                {stat.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
