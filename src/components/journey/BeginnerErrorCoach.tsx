"use client";

import React, { useMemo, useState } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import { AlertTriangle, Sparkles, Wrench, ChevronDown, ChevronUp, Heart } from "lucide-react";

export type BeginnerErrorInfo = {
  raw: string;
  title: string;
  plainEnglish: string;
  tip: string;
  missingName?: string;
};

/** Translate scary compiler errors into beginner-friendly copy. */
export function interpretSandboxError(raw?: string | null): BeginnerErrorInfo | null {
  if (!raw || !raw.trim()) return null;
  const msg = raw.trim();

  const notDefined = msg.match(/([A-Za-z_$][\w$]*)\s+is not defined/i);
  if (notDefined) {
    const name = notDefined[1];
    return {
      raw: msg,
      title: "Missing piece",
      plainEnglish: `You're using <${name} />, but this file doesn't know where ${name} comes from yet.`,
      tip: `Add this near the top of page.tsx:\nimport { ${name} } from "./${name}";`,
      missingName: name,
    };
  }

  if (/cannot find module|module not found/i.test(msg)) {
    return {
      raw: msg,
      title: "File not found",
      plainEnglish: "The code is trying to import a file that doesn't exist (or the name is misspelled).",
      tip: "Check the import path spelling matches a file tab exactly (including capital letters).",
    };
  }

  if (/unexpected token|syntaxerror/i.test(msg)) {
    return {
      raw: msg,
      title: "Tiny typo",
      plainEnglish: "There's a small syntax mistake — often a missing `}`, `)`, or `>` in JSX.",
      tip: "Look at the red line in the editor. Count opening and closing brackets.",
    };
  }

  if (/is not exported|does not provide an export/i.test(msg)) {
    return {
      raw: msg,
      title: "Export mismatch",
      plainEnglish: "You're importing something that the other file doesn't export with that exact name.",
      tip: "Open the other file and check `export function Name` matches your import.",
    };
  }

  return {
    raw: msg,
    title: "Something broke (that's okay)",
    plainEnglish: "The preview couldn't run this code yet. Beginners see this all the time — it's part of learning.",
    tip: "Click “Ask Nova to fix” and Nova will explain the fix in simple steps.",
  };
}

export function BeginnerErrorCoach({
  onAskNova,
  onApplyImportFix,
}: {
  onAskNova: (prompt: string) => void;
  onApplyImportFix?: (missingName: string) => boolean;
}) {
  const { sandpack } = useSandpack();
  const [showTech, setShowTech] = useState(false);

  const errorMessage =
    (sandpack.error as { message?: string } | null)?.message ||
    (typeof sandpack.error === "string" ? sandpack.error : null);

  const info = useMemo(() => interpretSandboxError(errorMessage), [errorMessage]);
  if (!info) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-3 bg-zinc-900/40 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white shadow-2xl overflow-hidden text-zinc-900">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 to-emerald-500" />
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                Don&apos;t panic — this is normal
              </p>
              <h3 className="text-sm font-bold text-zinc-900">{info.title}</h3>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed font-sans">{info.plainEnglish}</p>

          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-[10px] font-mono font-bold text-emerald-800 uppercase mb-1">How to fix</p>
            <pre className="text-[11px] text-emerald-900 whitespace-pre-wrap font-mono leading-relaxed">
              {info.tip}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {info.missingName && onApplyImportFix && (
              <button
                type="button"
                onClick={() => onApplyImportFix(info.missingName!)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono font-bold cursor-pointer"
              >
                <Wrench className="h-3.5 w-3.5" />
                Fix for me
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                onAskNova(
                  `Hi Nova — I'm stuck and confused. Preview shows this error:\n\n${info.raw}\n\nPlease explain what it means in simple words, ask me what I think is wrong, then guide the next small fix (don't paste a whole finished app).`
                )
              }
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-mono font-bold cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask Nova to fix
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTech((v) => !v)}
            className="w-full flex items-center justify-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            <AlertTriangle className="h-3 w-3" />
            {showTech ? "Hide" : "Show"} technical details
            {showTech ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showTech && (
            <pre className="text-[10px] font-mono text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-2 overflow-auto max-h-24 whitespace-pre-wrap">
              {info.raw}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
