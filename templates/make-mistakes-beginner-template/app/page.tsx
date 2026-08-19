"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { HeroScene } from "@/components/HeroScene";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-teal-50/40 to-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-3"
        >
          <p className="inline-flex items-center gap-2 text-sm font-medium text-teal-800">
            <Sparkles className="h-4 w-4" />
            MakeMistakes BuildOS
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Your product starts here
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600">
            Edit this page, click Run, then open Preview. Node.js, Next.js, React, and
            TypeScript are already ready in your isolated workspace.
          </p>
        </motion.div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-64 w-full bg-slate-950">
            <HeroScene />
          </div>
          <div className="space-y-2 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Build checklist</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>Change the headline to match your problem</li>
              <li>Add your first screen in <code>app/page.tsx</code></li>
              <li>Use components in the <code>components/</code> folder</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
