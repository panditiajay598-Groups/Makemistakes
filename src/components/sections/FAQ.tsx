"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How is MakeMistakes different from Udemy, YouTube, or LeetCode?",
      a: "Udemy and YouTube rely on passive video consumption where you copy code line-by-line without real comprehension. LeetCode focuses on isolated algorithm puzzles. MakeMistakes gives you full startup system specifications (Redis caching, auth servers, distributed queues) with deliberate bugs injected so you learn by debugging real software.",
    },
    {
      q: "What if I get stuck while building a mission?",
      a: "That is the goal! When you encounter a bug or test failure, Nova — our Socratic AI Mentor — provides guided hints and prompts rather than spoon-feeding solutions. This forces you to understand the root cause (e.g. race conditions, N+1 queries) so you never freeze during live technical interviews.",
    },
    {
      q: "Do I need prior coding experience?",
      a: "We recommend basic familiarity with JavaScript/TypeScript or any programming language. Missions start at Level 1 (Explorer) for fundamentals and scale up to Level 20 (Senior Engineer) for distributed systems.",
    },
    {
      q: "How does the Verified Proof-of-Work Portfolio work?",
      a: "When you pass all automated test suites and pass Nova's code quality audit, MakeMistakes generates a publicly verifiable audit certificate hosted on a custom subdomain. You can attach this certificate directly to your resume and LinkedIn to prove your capabilities to recruiters.",
    },
    {
      q: "Can I use MakeMistakes locally on my laptop?",
      a: "Yes! You can code inside our browser-based interactive workspace or clone the mission repositories locally using Git and run our CLI test runner.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-[#FAF9F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-zinc-900 mt-4 tracking-tight">
            Everything you need to know
          </h2>
          <p className="text-zinc-600 text-base sm:text-lg mt-3 font-sans">
            Have questions about our mission-based learning methodology? Here are quick answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm cursor-pointer hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 font-sans">{faq.q}</h3>
                  <div
                    className={`w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-teal-50 text-teal-800" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {isOpen && (
                  <p className="mt-4 pt-4 border-t border-zinc-100 text-sm text-zinc-600 leading-relaxed font-sans">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
