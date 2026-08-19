"use client";

import React, { useState } from "react";
import { PackageCheck, CheckCircle2, Clock, AlertCircle, Eye, FileText, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SprintDeliverable } from "./types";

export default function SprintDeliverablesSection() {
  const [deliverables, setDeliverables] = useState<SprintDeliverable[]>([
    {
      id: "del-1",
      title: "Sprint 1 Discovery Brief",
      type: "Product Document",
      status: "submitted",
      updatedAt: "Sprint 1 Completed",
      previewContent: "Problem Thesis: Students watch tutorials but fail to build products. Recommendation: Build MakeMistakes simulator.",
    },
    {
      id: "del-2",
      title: "System Architecture Diagram & Topology",
      type: "C4 Diagram",
      status: "submitted",
      updatedAt: "Today, 10:42 AM",
      previewContent: "Client UI -> Next.js API Routes -> Redis Token Bucket Rate Limiter -> PostgreSQL DB.",
    },
    {
      id: "del-3",
      title: "PostgreSQL Database Schema (users, submissions)",
      type: "SQL DDL Script",
      status: "needs-revision",
      updatedAt: "Today, 11:15 AM",
      previewContent: "CREATE TABLE users (id UUID PRIMARY KEY, promotion_rank VARCHAR(100)); -- Missing index on email column.",
    },
    {
      id: "del-4",
      title: "System Wireframes & User Journey Flow",
      type: "Figma Spec",
      status: "pending",
      previewContent: "Wireframe specs for BuildOS dashboard and Sprint workspace layout.",
    },
    {
      id: "del-5",
      title: "Rate Limiter Source Code (limiter.ts)",
      type: "TypeScript Code",
      status: "pending",
      previewContent: "export async function evaluateRateLimit(ip: string): Promise<boolean>",
    },
    {
      id: "del-6",
      title: "Architecture Review Presentation",
      type: "PDF / Slides",
      status: "pending",
      previewContent: "Executive summary for Senior Staff Engineering review.",
    },
    {
      id: "del-7",
      title: "Sprint 2 Final Report",
      type: "Markdown Brief",
      status: "pending",
      previewContent: "Summary of architecture decisions and benchmark SLAs.",
    },
  ]);

  const [previewItem, setPreviewItem] = useState<SprintDeliverable | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-left relative"
    >
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-amber-400" />
            Sprint Deliverables Checklist
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Review and submit required deliverables for Sprint 2.
          </p>
        </div>
        <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
          2 of 7 Submitted
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {deliverables.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.status === "submitted"
                ? "bg-zinc-950/80 border-emerald-500/30 text-zinc-200"
                : item.status === "needs-revision"
                ? "bg-zinc-900 border-amber-500/40 text-zinc-100"
                : "bg-zinc-950/40 border-zinc-800/60 text-zinc-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                  item.status === "submitted"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : item.status === "needs-revision"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                }`}
              >
                {item.status === "submitted" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : item.status === "needs-revision" ? (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                ) : (
                  <Clock className="h-4 w-4 text-zinc-500" />
                )}
              </div>

              <div>
                <h4 className="font-display text-sm font-bold text-zinc-100">{item.title}</h4>
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                  <span>Type: {item.type}</span>
                  {item.updatedAt && <span>• {item.updatedAt}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span
                className={`font-mono text-[10px] px-2.5 py-1 rounded border uppercase font-bold ${
                  item.status === "submitted"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : item.status === "needs-revision"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : "bg-zinc-900 text-zinc-500 border-zinc-800"
                }`}
              >
                {item.status}
              </span>

              <button
                onClick={() => setPreviewItem(item)}
                className="h-8 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-mono text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deliverable Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="font-mono text-xs font-bold text-amber-400">{previewItem.type}</span>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-zinc-400 hover:text-zinc-100 bg-transparent border-none cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h3 className="font-display text-lg font-bold text-zinc-100">{previewItem.title}</h3>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 font-mono text-xs text-amber-200 leading-relaxed max-h-48 overflow-y-auto">
                {previewItem.previewContent}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-5 py-2 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl border-none cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
