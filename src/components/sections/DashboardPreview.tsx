"use client";

import React, { useState } from "react";
import { Terminal, Code, Cpu, ShieldCheck, Check, Info, FileText, ChevronRight, Server } from "lucide-react";

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<"spec" | "code" | "coach" | "deploy">("spec");

  const fileTree = [
    { name: "main.go", type: "file" },
    { name: "limiter.go", type: "file", active: true },
    { name: "limiter_test.go", type: "file" },
    { name: "go.mod", type: "file" }
  ];

  return (
    <section id="dashboard-preview" className="bg-zinc-950 py-24 border-b border-zinc-900">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
            BUILDER WORKSPACE
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50">
            A realistic look inside the developer dashboard.
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            The workspace simulates a real software engineering environment. You write code locally, view specifications, get coach feedback, and deploy with active telemetry.
          </p>
        </div>

        {/* Dashboard Mockup Grid */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-1 shadow-2xl overflow-hidden">
          
          {/* Main IDE Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-zinc-950/60 rounded-lg overflow-hidden min-h-[500px]">
            
            {/* Left sidebar: File Tree & Challenge Info */}
            <div className="lg:col-span-3 border-r border-zinc-800 bg-zinc-950 p-4 font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold mb-4">Challenge Active</div>
                <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded mb-4 font-sans">
                  <div className="font-semibold text-zinc-200 text-xs font-display">Token Bucket Proxy</div>
                  <div className="text-[10px] text-amber-500 mt-0.5">SLA limit: &lt;5ms</div>
                </div>

                <div className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold mb-2">Workspace Files</div>
                <div className="space-y-1">
                  {fileTree.map((file, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer ${
                        file.active ? "bg-zinc-900 text-amber-500" : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Code className="h-3 w-3 shrink-0" />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-850 pt-4 mt-4 font-sans text-[11px] text-zinc-500 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Sandbox environment active</span>
                </div>
                <div>Server PID: <span className="font-mono">81902</span></div>
              </div>
            </div>

            {/* Middle panel: Active Workspace View (Tabs) */}
            <div className="lg:col-span-6 flex flex-col justify-between border-r border-zinc-800">
              
              {/* Tab Header */}
              <div className="flex border-b border-zinc-800 bg-zinc-950 font-mono text-[10px] text-zinc-400">
                <button
                  onClick={() => setActiveTab("spec")}
                  className={`px-4 py-3 border-r border-zinc-800 cursor-pointer ${
                    activeTab === "spec" ? "bg-zinc-900/60 text-amber-500 border-t-2 border-t-amber-500" : "hover:text-zinc-200"
                  }`}
                >
                  SPECIFICATION
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`px-4 py-3 border-r border-zinc-800 cursor-pointer ${
                    activeTab === "code" ? "bg-zinc-900/60 text-amber-500 border-t-2 border-t-amber-500" : "hover:text-zinc-200"
                  }`}
                >
                  LIMITER.GO
                </button>
                <button
                  onClick={() => setActiveTab("deploy")}
                  className={`px-4 py-3 cursor-pointer ${
                    activeTab === "deploy" ? "bg-zinc-900/60 text-amber-500 border-t-2 border-t-amber-500" : "hover:text-zinc-200"
                  }`}
                >
                  TELEMETRY LOGS
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5 flex-grow font-mono text-xs text-zinc-300 bg-zinc-950/20">
                {activeTab === "spec" && (
                  <div className="space-y-4 font-sans text-xs">
                    <h4 className="text-zinc-250 font-semibold font-display">System Requirements</h4>
                    <p className="text-zinc-450 leading-relaxed">
                      You must design a reverse proxy handler that intercepts HTTP requests, extracts client IPs, and implements a token bucket algorithm to enforce client limit parameters.
                    </p>
                    <div className="bg-zinc-900 border border-zinc-850 p-3 rounded font-mono text-[10px] space-y-1.5 text-zinc-400">
                      <div><span className="text-zinc-500">HTTP GET</span> /api/resource</div>
                      <div>- If bucket &gt;= 1: return <span className="text-emerald-500">200 OK</span></div>
                      <div>- If bucket &lt; 1: return <span className="text-red-400">429 Too Many Requests</span></div>
                    </div>
                  </div>
                )}

                {activeTab === "code" && (
                  <pre className="space-y-1 select-none overflow-x-auto">
                    <div><span className="text-amber-500">package</span> limiter</div>
                    <br />
                    <div><span className="text-amber-500">type</span> Limiter <span className="text-amber-500">struct</span> &#123;</div>
                    <div>    rate       <span className="text-amber-500">float64</span></div>
                    <div>    capacity   <span className="text-amber-500">float64</span></div>
                    <div>    mu         sync.RWMutex</div>
                    <div>    tokens     map[<span className="text-amber-500">string</span>]<span className="text-amber-500">float64</span></div>
                    <div>&#125;</div>
                    <br />
                    <div className="text-zinc-600">// Implement lock-free local read checks...</div>
                  </pre>
                )}

                {activeTab === "deploy" && (
                  <div className="space-y-2">
                    <div className="text-zinc-500">[SYSTEM] Starting load test suite...</div>
                    <div className="text-zinc-450">Simulating 5,000 requests from 100 concurrent clients</div>
                    <div className="text-zinc-400">Average response latency: <span className="text-emerald-500 font-semibold">1.84ms</span></div>
                    <div className="text-zinc-400">Error rate: <span className="text-emerald-500 font-semibold">0.00%</span></div>
                    <div className="text-emerald-500 flex items-center gap-1 font-bold text-[10px] mt-4 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded">
                      <Check className="h-3.5 w-3.5" /> SYSTEM STABLE - SLA VALIDATED
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Console Panel */}
              <div className="bg-zinc-950 border-t border-zinc-800 p-3 font-mono text-[10px] text-zinc-500 flex items-center justify-between">
                <span>Compilation Status: SUCCESS</span>
                <span className="text-amber-500">100% Tests Passed</span>
              </div>

            </div>

            {/* Right panel: AI Coach Live Review */}
            <div className="lg:col-span-3 bg-zinc-950 p-4 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                  <div className="h-5 w-5 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                    <Cpu className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-zinc-300">AI Coach Console</span>
                </div>
                
                <div className="space-y-3 font-sans text-xs">
                  <div className="bg-zinc-905 border border-zinc-800 p-2.5 rounded leading-relaxed text-zinc-400">
                    "I see you implemented an RWMutex. This protects against map read/write panic. Next, let's verify if the bucket refills correctly over time. How will you calculate elapsed seconds?"
                  </div>
                  <div className="bg-zinc-900/40 p-2 rounded border border-zinc-800/40 text-zinc-450 font-sans italic text-[11px]">
                    Tip: Avoid spawning unnecessary goroutines to refill tokens; do it lazily on request arrival.
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 mt-4 font-mono text-[9px] text-zinc-500 flex justify-between items-center">
                <span>COACH LEVEL: SENIOR</span>
                <span className="text-emerald-500">ENGAGED</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
