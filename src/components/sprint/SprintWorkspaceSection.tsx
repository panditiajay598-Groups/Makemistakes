"use client";

import React, { useState } from "react";
import {
  Code2,
  Layers,
  Database,
  Server,
  FileCode2,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

interface SprintWorkspaceSectionProps {
  sprintNumber?: number;
}

export default function SprintWorkspaceSection({ sprintNumber = 2 }: SprintWorkspaceSectionProps) {
  const [activeTab, setActiveTab] = useState<"diagram" | "schema" | "api">("diagram");
  const [schemaText, setSchemaText] = useState(`CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  promotion_rank VARCHAR(100) DEFAULT 'Associate Product Engineer',
  reputation_points INT DEFAULT 150,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sprint_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sprint_number INT NOT NULL,
  deliverable_payload JSONB NOT NULL,
  engineering_score NUMERIC(3,1) DEFAULT 8.6,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-left"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-teal-700" />
            Sprint {sprintNumber} Workspace: Architecture &amp; Solution Design
          </h2>
          <p className="text-xs text-zinc-600 font-sans">
            Interactive engineering environment. You do not need to leave this workspace.
          </p>
        </div>
        <span className="font-mono text-xs text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 font-bold">
          Active Workspace
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab("diagram")}
          className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
            activeTab === "diagram"
              ? "bg-teal-50 text-teal-900 border-teal-200 font-bold shadow-sm"
              : "bg-white text-zinc-600 hover:text-zinc-900 border-zinc-200"
          }`}
        >
          System Diagram
        </button>

        <button
          onClick={() => setActiveTab("schema")}
          className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
            activeTab === "schema"
              ? "bg-teal-50 text-teal-900 border-teal-200 font-bold shadow-sm"
              : "bg-white text-zinc-600 hover:text-zinc-900 border-zinc-200"
          }`}
        >
          Database Schema (SQL)
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
            activeTab === "api"
              ? "bg-teal-50 text-teal-900 border-teal-200 font-bold shadow-sm"
              : "bg-white text-zinc-600 hover:text-zinc-900 border-zinc-200"
          }`}
        >
          API Endpoints Design
        </button>
      </div>

      {/* Diagram View */}
      {activeTab === "diagram" && (
        <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-xl shadow-zinc-200/40">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="font-mono text-xs text-teal-800 font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-700" /> System Topology
            </span>
            <span className="font-mono text-xs text-zinc-500">Next.js + Postgres + Redis</span>
          </div>

          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-4 text-xs font-mono text-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-1">
                <Globe className="h-5 w-5 text-blue-700 mx-auto" />
                <span className="font-bold text-blue-900 block">Client App</span>
                <span className="text-[10px] text-zinc-500 block">Next.js React Frontend</span>
              </div>

              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/60 space-y-1">
                <Server className="h-5 w-5 text-teal-700 mx-auto" />
                <span className="font-bold text-teal-900 block">API Gateway</span>
                <span className="text-[10px] text-zinc-500 block">Next.js API Routes</span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1">
                <Database className="h-5 w-5 text-emerald-700 mx-auto" />
                <span className="font-bold text-emerald-900 block">PostgreSQL + Redis</span>
                <span className="text-[10px] text-zinc-500 block">ACID + Atomic Throttle</span>
              </div>
            </div>

            <p className="text-zinc-600 text-center font-sans text-xs">
              Client requests pass through API Rate Evaluation middleware before hitting transactional DB routes.
            </p>
          </div>
        </div>
      )}

      {/* Schema View */}
      {activeTab === "schema" && (
        <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-xl shadow-zinc-200/40">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="font-mono text-xs text-teal-800 font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-teal-700" /> PostgreSQL Schema Editor
            </span>
            <span className="font-mono text-xs text-emerald-700 font-semibold">PostgreSQL 16</span>
          </div>

          <textarea
            rows={10}
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 font-mono text-xs text-teal-300 focus:outline-none focus:border-teal-700 resize-none leading-relaxed shadow-inner"
          />
        </div>
      )}

      {/* API View */}
      {activeTab === "api" && (
        <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-xl shadow-zinc-200/40">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="font-mono text-xs text-teal-800 font-bold flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-teal-700" /> API Route Definitions
            </span>
            <span className="font-mono text-xs text-zinc-500">RESTful OpenAPI v3</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">POST</span>
                <span className="text-zinc-900 font-medium">/api/sprints/submissions</span>
              </div>
              <span className="text-zinc-500">Submit Sprint Deliverables</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">GET</span>
                <span className="text-zinc-900 font-medium">/api/user/profile</span>
              </div>
              <span className="text-zinc-500">Fetch Builder Stats &amp; Rank</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
