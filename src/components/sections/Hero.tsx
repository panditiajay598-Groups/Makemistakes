"use client";

import React from "react";
import { motion } from "framer-motion";
import MissionDashboardPreview from "./MissionDashboardPreview";

export default function Hero() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Editorial Title & Subtitle (Matching Twist Layout) */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl md:text-7xl font-normal font-serif text-zinc-900 tracking-tight leading-[1.1]"
          >
            Software engineering training that won't waste your time
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            MakeMistakes is an active learning platform that makes technical mastery easy from anywhere by using hands-on missions to organize your portfolio.
          </motion.p>
        </div>

        {/* Hero Feature Visual Banner (Matches Twist Teal Canvas + Play Overlay) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <MissionDashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}
