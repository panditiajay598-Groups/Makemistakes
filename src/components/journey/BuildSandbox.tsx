"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildSandpackFiles, type EditorFiles } from "@/lib/sandpackFiles";
import { AlertTriangle, Heart, Loader2, RefreshCw, Sparkles, Wrench } from "lucide-react";
import { interpretSandboxError } from "@/components/journey/BeginnerErrorCoach";

/**
 * Local iframe preview — no CodeSandbox bundler network.
 * Compiles TSX with Babel standalone inside the iframe (reliable on localhost).
 */
export function BuildSandbox({
  files,
  productName,
  runKey,
  viewport,
  activeTab,
  onAskNova,
  onApplyImportFix,
}: {
  files: EditorFiles;
  productName: string;
  runKey: number;
  viewport: "desktop" | "tablet" | "mobile";
  activeTab: "preview" | "console" | "tests";
  onAskNova?: (prompt: string) => void;
  onApplyImportFix?: (missingName: string) => boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryTick, setRetryTick] = useState(0);

  const sandpackFiles = useMemo(
    () => buildSandpackFiles(files, { productName }),
    [files, productName]
  );

  const srcDoc = useMemo(
    () => buildLocalPreviewHtml(sandpackFiles),
    // runKey + retryTick force a full remount/recompile
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sandpackFiles, runKey, retryTick]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [srcDoc]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.source !== "makemistakes-preview") return;

      if (data.type === "ready") {
        setLoading(false);
        setError(null);
      } else if (data.type === "error") {
        setLoading(false);
        setError(String(data.message || "Preview error"));
        setLogs((prev) => [...prev.slice(-40), `Error: ${data.message}`]);
      } else if (data.type === "log") {
        setLogs((prev) => [...prev.slice(-40), String(data.message)]);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const frameWidth =
    viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "390px";

  const info = interpretSandboxError(error);

  return (
    <div className="h-full w-full flex flex-col min-h-0 bg-white relative">
      {activeTab === "console" ? (
        <div className="h-full min-h-[220px] overflow-auto bg-zinc-950 text-left p-3 font-mono text-[11px] text-zinc-300 space-y-1">
          {logs.length === 0 ? (
            <p className="text-zinc-500">No console output yet. Click Run, then watch logs here.</p>
          ) : (
            logs.map((line, i) => (
              <p key={i} className="whitespace-pre-wrap break-words">
                {line}
              </p>
            ))
          )}
        </div>
      ) : (
        <div className="h-full min-h-[220px] w-full flex justify-center bg-zinc-100 overflow-auto relative">
          <div
            className="h-full bg-white shadow-sm border border-zinc-200 overflow-hidden relative"
            style={{ width: frameWidth, maxWidth: "100%" }}
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 gap-2 text-xs font-mono text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                Compiling preview…
              </div>
            )}
            <iframe
              key={`${runKey}-${retryTick}`}
              ref={iframeRef}
              title="Build preview"
              srcDoc={srcDoc}
              sandbox="allow-scripts"
              className="w-full h-full border-0 bg-white"
              style={{ minHeight: 220 }}
            />
          </div>

          {info && (
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
                  <p className="text-xs text-zinc-600 leading-relaxed">{info.plainEnglish}</p>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                    <p className="text-[10px] font-mono font-bold text-emerald-800 uppercase mb-1">
                      How to fix
                    </p>
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
                      onClick={() => {
                        setRetryTick((n) => n + 1);
                        setError(null);
                        setLoading(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-mono font-bold cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Try again
                    </button>
                    {onAskNova && (
                      <button
                        type="button"
                        onClick={() =>
                          onAskNova(
                            `Hi Nova — Preview error:\n\n${info.raw}\n\nExplain simply and guide the next small fix.`
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-mono font-bold cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Ask Nova
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Local preview (no Sandpack server)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildLocalPreviewHtml(fileMap: Record<string, { code: string }>): string {
  // Escape for embedding inside a JS string literal in the iframe document
  const filesJson = JSON.stringify(
    Object.fromEntries(Object.entries(fileMap).map(([path, v]) => [path, v.code]))
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.9/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body, #root { margin: 0; padding: 0; min-height: 100%; height: 100%; }
    body { font-family: ui-sans-serif, system-ui, sans-serif; background: #fff; color: #18181b; }
    .mm-boot-error { font-family: ui-monospace, monospace; padding: 16px; color: #be123c; font-size: 12px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    (function () {
      var FILES = ${filesJson};
      var cache = {};

      function post(type, message) {
        try {
          parent.postMessage({ source: "makemistakes-preview", type: type, message: message }, "*");
        } catch (e) {}
      }

      window.onerror = function (msg) {
        post("error", String(msg));
        return true;
      };
      window.addEventListener("unhandledrejection", function (e) {
        post("error", String((e && e.reason && e.reason.message) || e.reason || e));
      });

      var origLog = console.log;
      console.log = function () {
        try {
          post("log", Array.prototype.slice.call(arguments).map(String).join(" "));
        } catch (e) {}
        return origLog.apply(console, arguments);
      };

      function normalize(fromDir, request) {
        if (request === "react") return "react";
        if (request === "react-dom" || request === "react-dom/client") return "react-dom";
        var path = request;
        if (path.startsWith("./") || path.startsWith("../")) {
          var base = fromDir.replace(/\\/[^\\/]*$/, "");
          var parts = (base + "/" + path).split("/");
          var out = [];
          for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (!p || p === ".") continue;
            if (p === "..") out.pop();
            else out.push(p);
          }
          path = "/" + out.join("/");
        }
        if (!path.startsWith("/")) path = "/" + path;
        var candidates = [path, path + ".tsx", path + ".ts", path + ".jsx", path + ".js"];
        // also try dropping extension already present
        for (var c = 0; c < candidates.length; c++) {
          if (FILES[candidates[c]] != null) return candidates[c];
        }
        // index fallbacks not needed for our scaffolds
        throw new Error("Cannot find module '" + request + "' from " + fromDir);
      }

      function req(fromFile, request) {
        if (request === "react") return window.React;
        if (request === "react-dom" || request === "react-dom/client") return window.ReactDOM;

        var resolved = normalize(fromFile, request);
        if (cache[resolved]) return cache[resolved].exports;

        var source = FILES[resolved];
        if (source == null) throw new Error("Missing file: " + resolved);

        var transformed;
        try {
          transformed = window.Babel.transform(source, {
            presets: [
              ["react", { runtime: "classic" }],
              ["typescript", { isTSX: true, allExtensions: true }]
            ],
            plugins: ["transform-modules-commonjs"],
            filename: resolved
          }).code;
        } catch (err) {
          throw new Error("Compile error in " + resolved + ": " + (err && err.message ? err.message : err));
        }

        var module = { exports: {} };
        cache[resolved] = module;
        var fn = new Function(
          "require",
          "module",
          "exports",
          "React",
          "ReactDOM",
          transformed + "\\n//# sourceURL=" + resolved
        );
        fn(
          function (r) { return req(resolved, r); },
          module,
          module.exports,
          window.React,
          window.ReactDOM
        );
        return module.exports;
      }

      try {
        if (!window.React || !window.ReactDOM || !window.Babel) {
          throw new Error("Preview libraries failed to load. Check your internet connection for CDN scripts.");
        }
        var AppMod = req("/App.tsx", "./App");
        var App = AppMod && (AppMod.default || AppMod);
        if (!App) throw new Error("App.tsx must export a default component.");
        var rootEl = document.getElementById("root");
        var root = window.ReactDOM.createRoot(rootEl);
        root.render(window.React.createElement(App));
        post("ready", "ok");
      } catch (err) {
        var msg = (err && err.message) ? err.message : String(err);
        document.getElementById("root").innerHTML = '<div class="mm-boot-error"></div>';
        document.querySelector(".mm-boot-error").textContent = msg;
        post("error", msg);
      }
    })();
  </script>
</body>
</html>`;
}
