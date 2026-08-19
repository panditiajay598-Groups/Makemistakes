"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { HeroScene } from "@/components/HeroScene";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="inline-flex items-center gap-2 text-sm font-medium text-indigo-800">
            <Rocket className="h-4 w-4" />
            MakeMistakes BuildOS · Advanced
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Ship a production-shaped build
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600">
            Forms, HTTP, CSV/XLSX, and immutable state helpers are pre-installed in this
            isolated workspace. Focus on the problem — not package setup.
          </p>
        </motion.div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-64 w-full bg-slate-950">
            <HeroScene />
          </div>
          <div className="space-y-2 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Advanced toolkit</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>React Hook Form + Zod resolvers</li>
              <li>Axios for external APIs (controlled)</li>
              <li>Papa Parse + XLSX for data imports</li>
              <li>Immer + nanoid for complex state</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
