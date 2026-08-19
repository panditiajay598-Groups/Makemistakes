"use client";

import React, { useState } from "react";
import { Cpu, Terminal, ArrowRight, CornerDownRight, CheckCircle2 } from "lucide-react";

interface Message {
  sender: "student" | "coach";
  text: string;
  type?: "code" | "text";
}

export default function AICoach() {
  const conversations: Message[] = [
    {
      sender: "student",
      text: "I kept running the load test suite and got a thread deadlock panic. Here is my current lock structure:",
      type: "text"
    },
    {
      sender: "student",
      text: `func (c *Cache) GetAndSet(key string, val string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    
    if c.exists(key) {
        c.mu.RLock() // RLock inside a Lock
        defer c.mu.RUnlock()
    }
}`,
      type: "code"
    },
    {
      sender: "coach",
      text: "Look at your lock hierarchy. You are acquiring a read lock (RLock) while holding a write lock (Lock) on the same goroutine. What happens when a thread tries to acquire RLock while write access is already locked by itself?",
      type: "text"
    },
    {
      sender: "student",
      text: "Ah, it blocks waiting for itself to unlock, resulting in a recursive deadlock!",
      type: "text"
    },
    {
      sender: "coach",
      text: "Exactly. You don't need a separate RLock here because you already hold the exclusive write Lock (which allows safe read access). Simplify your control flow and run the tests again.",
      type: "text"
    }
  ];

  return (
    <section id="ai-coach" className="bg-zinc-950 py-24 border-b border-zinc-900 relative">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text explanation */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
              THE AI SOCRATIC COACH
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 leading-[1.1]">
              A virtual senior engineer, not a copy-paste generator.
            </h2>
            <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
              If an AI writes the code for you, your brain learns nothing. The MakeMistakes Coach is designed to act like a senior engineer reviewing a junior's PR.
            </p>

            <ul className="space-y-3 font-sans text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <CornerDownRight className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-zinc-350">**Guides Your Logic**: Asks targeted questions instead of providing raw copy-paste solutions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CornerDownRight className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-zinc-350">**Reviews Architectural Choices**: Evaluates lock designs, memory profiles, and algorithmic bottlenecks.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CornerDownRight className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-zinc-350">**Builds Self-Reliance**: Prepares you for real-world production triage and technical interviews.</span>
              </li>
            </ul>
          </div>

          {/* Right Column: Code review dialogue mock */}
          <div className="lg:col-span-7">
            <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/20 p-1 shadow-2xl">
              
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/20">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-amber-500" />
                  <span className="font-mono text-[10px] text-zinc-450 uppercase tracking-widest pl-0.5">Code Review Session #482</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-550">Status: RESOLVED</span>
              </div>

              {/* Chat View */}
              <div className="p-4 bg-zinc-950 font-sans text-xs space-y-4 max-h-[350px] overflow-y-auto">
                {conversations.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.sender === "student" ? "justify-start" : "justify-start"}`}>
                    
                    {/* Icon */}
                    <div className="shrink-0">
                      {msg.sender === "student" ? (
                        <div className="h-5 w-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-[9px] text-zinc-400">
                          S
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-mono text-[9px] text-amber-500 font-bold">
                          AI
                        </div>
                      )}
                    </div>

                    {/* Balloon */}
                    <div className="flex-grow space-y-1.5">
                      <div className="font-mono text-[9px] text-zinc-500 uppercase">
                        {msg.sender === "student" ? "Sarah Jenkins (Builder)" : "Senior AI Coach"}
                      </div>
                      
                      {msg.type === "code" ? (
                        <pre className="bg-zinc-900 border border-zinc-850 p-2.5 rounded font-mono text-[10px] text-zinc-300 overflow-x-auto leading-relaxed select-all">
                          {msg.text}
                        </pre>
                      ) : (
                        <div className={`p-2.5 rounded leading-relaxed border ${
                          msg.sender === "student" 
                            ? "bg-zinc-900/40 border-zinc-900 text-zinc-350" 
                            : "bg-amber-500/[0.02] border-amber-500/10 text-zinc-250"
                        }`}>
                          {msg.text}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-zinc-900/60 border-t border-zinc-800 p-3 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Deadline deadlock resolved</span>
                <span>Active thread analysis: OK</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
