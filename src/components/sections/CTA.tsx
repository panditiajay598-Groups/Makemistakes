"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

export default function CTA() {
  return (
    <section className="py-24 bg-[#F4F3EE] border-t border-zinc-200 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-4xl sm:text-6xl font-serif text-zinc-900 tracking-tight">
          Stop watching tutorials.
          <br />
          Start building software.
        </h2>

        <p className="text-zinc-600 text-base sm:text-lg max-w-xl mx-auto font-sans leading-relaxed">
          Join thousands of developers breaking things, fixing race conditions, and shipping industry-ready projects today.
        </p>

        <div className="pt-4 flex items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => (window.location.href = "/missions")}
          >
            Begin Mission Zero
          </Button>
        </div>
      </div>
    </section>
  );
}
