"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  FileCode,
  FilePlus,
  Folder,
  Loader2,
  Play,
  Copy,
  Trash2,
  AlertTriangle,
  Send,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { getJourneyUserId } from "@/lib/journeyUser";
import { ProblemData } from "@/lib/problemContent";
import { deriveBuildWorkspace, validateMissionCode, BuildMission } from "@/lib/buildWorkspace";

type FileNode =
  | { type: "file"; name: string; path: string }
  | { type: "dir"; name: string; path: string; children: FileNode[] };

type EnvChecks = {
  node: boolean;
  next: boolean;
  react: boolean;
  typescript: boolean;
  ui: boolean;
  three: boolean;
};

export type RuntimeState = "IDLE" | "SAVING" | "STARTING" | "RUNNING" | "FAILED" | "STOPPED";

type Props = {
  problemId: string;
  productName?: string;
  problemData?: ProblemData | null;
  onReadyChange?: (ready: boolean) => void;
  onComplete?: () => void;
  userId?: string;
};

function flattenFiles(nodes: FileNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.type === "file") acc.push(n.path);
    else flattenFiles(n.children, acc);
  }
  return acc;
}

function FileTree({
  nodes,
  active,
  onOpen,
  depth = 0,
}: {
  nodes: FileNode[];
  active: string;
  onOpen: (path: string) => void;
  depth?: number;
}) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((n) =>
        n.type === "dir" ? (
          <li key={n.path}>
            <div
              className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-zinc-400 font-mono"
              style={{ paddingLeft: 8 + depth * 10 }}
            >
              <Folder className="h-3 w-3 text-teal-500/80" />
              {n.name}
            </div>
            <FileTree nodes={n.children} active={active} onOpen={onOpen} depth={depth + 1} />
          </li>
        ) : (
          <li key={n.path}>
            <button
              type="button"
              onClick={() => onOpen(n.path)}
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left text-[11px] font-mono rounded ${
                active === n.path
                  ? "bg-teal-900/50 text-teal-200 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
              }`}
              style={{ paddingLeft: 8 + depth * 10 }}
            >
              <FileCode className="h-3 w-3 shrink-0" />
              <span className="truncate">{n.name}</span>
            </button>
          </li>
        )
      )}
    </ul>
  );
}

export default function BuildOS({ problemId, productName: propName, problemData, onReadyChange, onComplete }: Props) {
  const userId = useMemo(() => getJourneyUserId(), []);
  const workspace = useMemo(() => deriveBuildWorkspace(problemData), [problemData]);
  const productName = propName || workspace.productName;

  const [phase, setPhase] = useState<"booting" | "ready" | "error">("booting");
  const [logs, setLogs] = useState<string[]>(["Preparing BuildOS workspace..."]);
  const [checks, setChecks] = useState<EnvChecks | null>(null);
  const [tree, setTree] = useState<FileNode[]>([]);
  const [activePath, setActivePath] = useState("app/page.tsx");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Runtime State Machine
  const [runtimeState, setRuntimeState] = useState<RuntimeState>("IDLE");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [runError, setRunError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Active step / mission state
  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationResult, setValidationResult] = useState<{ ok: boolean; failures: string[] } | null>(null);

  // UI Panels
  const [showFileTree, setShowFileTree] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<"preview" | "console" | "tests">("preview");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  // Nova AI Chat State
  const [novaMessages, setNovaMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: `Hi! I'm Nova — your beginner-friendly mentor for ProductOS.\n\nBeginner · ${workspace.providedCount} steps provided by MakeMistakes · ${workspace.studentCount} steps you write.\n\nI'll explain each step: what changed, what it means, and what you do next.\n\nOpen a step on the left and ask me anything.`,
    },
  ]);
  const [novaInput, setNovaInput] = useState("");
  const [novaLoading, setNovaLoading] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const activeMission: BuildMission = workspace.missions[activeMissionIndex] || workspace.missions[0];

  const pushLog = useCallback((line: string) => {
    setLogs((prev) => [...prev.slice(-80), line]);
  }, []);

  const activeRunIdRef = useRef<number>(0);

  // Controlled, deterministic Run handler (MUST NOT BE CALLED AUTOMATICALLY)
  const runProject = useCallback(async () => {
    // Prevent duplicate concurrent runs
    if (runtimeState === "SAVING" || runtimeState === "STARTING") {
      return;
    }

    const currentRunId = Date.now();
    activeRunIdRef.current = currentRunId;

    setRuntimeState("SAVING");
    setRunError(null);
    setLogs((prev) => [...prev.filter((l) => !l.startsWith("✓") && !l.startsWith("Error:") && !l.startsWith("Build failed")), `--- Run Execution ---`, "Saving workspace files..."]);

    // 1. Force save active file in editor to disk FIRST
    let currentWorkspaceFiles: Record<string, string> = {};
    try {
      if (activePath && content !== undefined) {
        currentWorkspaceFiles[activePath] = content;
        await fetch("/api/buildos/files", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, problemId, path: activePath, content }),
        });
        setDirty(false);
      }
    } catch (err: any) {
      console.warn("Save before run failed:", err);
    }

    setRuntimeState("STARTING");

    // 2. Execute build & compile preview payload using user's current workspace
    try {
      const res = await fetch("/api/buildos/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          problemId,
          runId: currentRunId,
          files: currentWorkspaceFiles,
        }),
      });
      const data = await res.json();

      if (activeRunIdRef.current !== currentRunId) return; // Stale run check

      if (!data.ok) {
        setRuntimeState("FAILED");
        setRunError(data.error || "Build failed");
        pushLog(data.error || "Build failed");
        return;
      }

      setPreviewHtml(data.previewHtml);
      setPreviewKey(Date.now());
      setRuntimeState("RUNNING");
      (data.logs || []).forEach((l: string) => pushLog(l));
    } catch (err: any) {
      if (activeRunIdRef.current !== currentRunId) return;
      setRuntimeState("FAILED");
      setRunError(err.message || String(err));
      pushLog(err.message || String(err));
    }
  }, [userId, problemId, activePath, content, runtimeState, workspaceId, pushLog]);

  // Handle postMessage events from preview iframe sandbox
  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== "makemistakes-buildos-preview") return;

      // Filter out stale events from previous run executions
      if (data.runId && activeRunIdRef.current > 0 && String(data.runId) !== String(activeRunIdRef.current)) return;

      if (data.type === "ready") {
        setRuntimeState("RUNNING");
        pushLog("✓ Project running");
        pushLog("✓ Preview ready");
      } else if (data.type === "error") {
        setRuntimeState("FAILED");
        const name = data.name || "RuntimeError";
        const msg = data.message || "An unhandled JavaScript exception occurred in preview.";
        const fullErr = `Runtime Error (${name}): ${msg}`;
        setRunError(fullErr);
        pushLog(`Error: ${fullErr}`);
      }
    };

    window.addEventListener("message", handlePreviewMessage);
    return () => window.removeEventListener("message", handlePreviewMessage);
  }, [pushLog]);

  const ensure = useCallback(async () => {
    setPhase("booting");
    setLogs(["Installing development environment..."]);
    try {
      const res = await fetch("/api/buildos/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, problemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Workspace failed");

      setChecks(data.checks);
      setTree(data.tree || []);
      setWorkspaceId(data.workspace?.workspaceId || null);
      for (const l of data.logs || []) {
        const line = String(l).trim();
        if (line) pushLog(line);
      }

      if (!data.environmentReady) {
        setPhase("error");
        pushLog(data.workspace?.lastError || "Environment provisioning failed");
        onReadyChange?.(false);
        return;
      }

      setPhase("ready");
      onReadyChange?.(true);

      // Load active step (Step 1: App shell) relevant code immediately
      await loadStepFiles(0);

      // STRICT REQUIREMENT: DO NOT CALL runProject() AUTOMATICALLY!
    } catch (err: any) {
      setPhase("error");
      pushLog(err.message || String(err));
      onReadyChange?.(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, problemId]);

  const openFile = async (filePath: string, skipDirtyCheck = false) => {
    if (!skipDirtyCheck && dirty) {
      await saveFile();
    }
    const res = await fetch(
      `/api/buildos/files?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(problemId)}&path=${encodeURIComponent(filePath)}`
    );
    const data = await res.json();
    if (!res.ok) {
      pushLog(data.error || "Could not open file");
      return;
    }
    setActivePath(filePath);
    setContent(data.content || "");
    setDirty(false);
  };

  const saveFile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/buildos/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, problemId, path: activePath, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setDirty(false);
      pushLog(`Saved ${activePath}`);
    } catch (err: any) {
      pushLog(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const activeMissionIndexRef = useRef(activeMissionIndex);
  useEffect(() => {
    activeMissionIndexRef.current = activeMissionIndex;
  }, [activeMissionIndex]);

  const loadStepFiles = async (stepIdx: number) => {
    const mission = workspace.missions[stepIdx];
    if (!mission) return;

    const mainFile = mission.files && mission.files[0] ? mission.files[0] : "app/page.tsx";
    const targetMainFile =
      mainFile === "page.tsx"
        ? "app/page.tsx"
        : mainFile.startsWith("app/")
        ? mainFile
        : `app/${mainFile}`;

    const stepFiles = workspace.fileContents[mission.id] || {};
    const inMemoryCode =
      stepFiles[mainFile] ||
      stepFiles[targetMainFile] ||
      (stepFiles["page.tsx"] ? stepFiles["page.tsx"] : null) ||
      Object.values(stepFiles)[0];

    // OPTIMISTIC EDITOR RENDER (0ms UI latency for provided tasks)
    if (inMemoryCode !== undefined && inMemoryCode !== null) {
      setActivePath(targetMainFile);
      setContent(inMemoryCode);
      setDirty(false);
    }

    // NON-BLOCKING BACKGROUND PERSISTENCE & SYNCHRONIZATION
    (async () => {
      for (const [relPath, fileCode] of Object.entries(stepFiles)) {
        const targetPath =
          relPath === "page.tsx"
            ? "app/page.tsx"
            : relPath.startsWith("app/")
            ? relPath
            : `app/${relPath}`;

        try {
          const checkRes = await fetch(
            `/api/buildos/files?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(problemId)}&path=${encodeURIComponent(targetPath)}`
          );
          if (!checkRes.ok) {
            // File does not exist on disk yet, write initial scaffold
            await fetch("/api/buildos/files", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                problemId,
                path: targetPath,
                content: fileCode,
              }),
            });
          }
        } catch (e) {
          console.warn(`Failed to check/seed file ${targetPath}:`, e);
        }
      }

      // Background refresh file tree
      try {
        const treeRes = await fetch(
          `/api/buildos/workspace?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(problemId)}`
        );
        const treeData = await treeRes.json();
        if (treeData.tree && activeMissionIndexRef.current === stepIdx) {
          setTree(treeData.tree);
        }
      } catch (e) {
        console.warn("Background workspace tree refresh failed:", e);
      }

      // Fallback: If in-memory code was missing, perform full file open fallback
      if (inMemoryCode === undefined || inMemoryCode === null) {
        if (activeMissionIndexRef.current === stepIdx) {
          await openFile(targetMainFile, true);
        }
      }
    })();
  };

  const handleSelectStep = async (idx: number) => {
    if (dirty) await saveFile();
    setActiveMissionIndex(idx);
    setValidationResult(null);
    await loadStepFiles(idx);
  };

  const createFile = async () => {
    const name = window.prompt("New file path (e.g. components/Card.tsx)");
    if (!name) return;
    const res = await fetch("/api/buildos/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        problemId,
        path: name.replace(/^\/+/, ""),
        content: "// Write your code here\n",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      pushLog(data.error || "Create failed");
      return;
    }
    setTree(data.tree || []);
    await openFile(name.replace(/^\/+/, ""), true);
  };

  const deleteFile = async () => {
    if (!window.confirm(`Delete ${activePath}?`)) return;
    const res = await fetch(
      `/api/buildos/files?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(problemId)}&path=${encodeURIComponent(activePath)}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (!res.ok) {
      pushLog(data.error || "Delete failed");
      return;
    }
    setTree(data.tree || []);
    const next = flattenFiles(data.tree || [])[0];
    if (next) await openFile(next, true);
  };

  const handleValidateStep = async () => {
    if (dirty) await saveFile();

    const check = validateMissionCode({
      mission: activeMission,
      files: { [activePath]: content },
      hasRun: runtimeState === "RUNNING" || Boolean(previewHtml),
    });

    setValidationResult(check);

    if (check.ok) {
      if (!completedSteps.includes(activeMission.id)) {
        setCompletedSteps((prev) => [...prev, activeMission.id]);
      }
      if (activeMissionIndex < workspace.missions.length - 1) {
        const nextIdx = activeMissionIndex + 1;
        await handleSelectStep(nextIdx);
      } else if (onComplete) {
        onComplete();
      }
    }
  };

  const sendNovaMessage = async (textToSend?: string) => {
    const query = textToSend || novaInput;
    if (!query.trim() || novaLoading) return;

    const userMsg = { role: "user" as const, content: query.trim() };
    setNovaMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setNovaInput("");
    setNovaLoading(true);

    try {
      const res = await fetch("/api/nova/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...novaMessages, userMsg],
          context: {
            productName,
            statement: workspace.statement,
            missionTitle: activeMission.title,
            activeFile: activePath,
            category: workspace.category,
            fileCode: content,
          },
        }),
      });

      const data = await res.json();
      if (data.ok && data.message) {
        setNovaMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      } else {
        setNovaMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I'm having trouble analyzing this step right now. Try clicking Run again." },
        ]);
      }
    } catch {
      setNovaMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Could not connect to Nova mentor. Please try asking again." },
      ]);
    } finally {
      setNovaLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    ensure();
    return () => {
      fetch("/api/buildos/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, problemId, action: "stop" }),
      }).catch(() => {});
    };
  }, [ensure, userId, problemId]);

  useEffect(() => {
    if (!dirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveFile();
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || data.source !== "makemistakes-buildos-preview") return;
      if (data.type === "error") {
        setRunError(String(data.message || "Preview error"));
        setRuntimeState("FAILED");
        pushLog(`Error: ${data.message}`);
      } else if (data.type === "log") {
        pushLog(String(data.message));
      } else if (data.type === "ready") {
        pushLog("✓ Preview ready");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [pushLog]);

  const isRunInProgress = runtimeState === "SAVING" || runtimeState === "STARTING";

  return (
    <div className="flex flex-col h-full w-full bg-[#07090e] text-zinc-100 font-sans select-none overflow-hidden">
      {/* ==================== 1. TOP HEADER BAR ==================== */}
      <header className="flex items-center justify-between h-9 px-3 bg-[#0a0d14] border-b border-zinc-800/80 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFileTree(!showFileTree)}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800/60 transition-colors"
            title="Toggle File Tree"
          >
            {showFileTree ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          <span className="font-semibold tracking-wider uppercase text-[11px] text-zinc-400">Build Roadmap</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-teal-400 font-mono text-[11px]">
            <FileCode className="h-3.5 w-3.5 text-teal-500" />
            <span>{activePath}</span>
            {dirty && <span className="text-amber-400 text-[10px]">•</span>}
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800"
            title={copied ? "Copied!" : "Copy Code"}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* Controlled Run Button */}
          <button
            type="button"
            onClick={runProject}
            disabled={isRunInProgress}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {isRunInProgress ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            {isRunInProgress ? "Running..." : runtimeState === "RUNNING" ? "Run Again" : "Run"}
          </button>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <Sparkles className="h-3.5 w-3.5 text-teal-400" />
          <span className="font-semibold text-zinc-200">Nova Coach</span>
          <span className="text-zinc-500">· Step {activeMissionIndex + 1}: {activeMission.title}</span>
        </div>
      </header>

      {/* ==================== BOOTING STATE ==================== */}
      {phase === "booting" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-[#090b10]">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          <p className="text-sm font-semibold text-zinc-200">Installing development environment...</p>
          <p className="text-xs text-zinc-500 max-w-md text-center">
            Node.js, Next.js, React, and TypeScript are preconfigured in your private cloud workspace.
          </p>
        </div>
      )}

      {/* ==================== ERROR STATE ==================== */}
      {phase === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-[#090b10]">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-zinc-200">Environment setup failed</p>
          <button
            type="button"
            onClick={ensure}
            className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-600"
          >
            Retry Setup
          </button>
        </div>
      )}

      {/* ==================== 3-COLUMN MAIN WORKSPACE ==================== */}
      {phase === "ready" && (
        <div className="flex-1 flex min-h-0 divide-x divide-zinc-800/80 overflow-hidden">
          {/* ==================== LEFT COLUMN: BUILD ROADMAP ==================== */}
          <aside className="w-[300px] shrink-0 flex flex-col bg-[#090b10] min-h-0">
            {/* Header Box */}
            <div className="p-3 border-b border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-teal-950 text-teal-400 border border-teal-800/60">
                  Beginner
                </span>
                <span className="text-[11px] text-zinc-400">
                  {workspace.providedCount} provided · {workspace.studentCount} you write
                </span>
              </div>
              <p className="text-xs font-medium text-zinc-200 leading-snug">
                Build {workspace.tagline || productName} in {workspace.missions.length} micro-steps — {workspace.providedCount} provided by MakeMistakes, {workspace.studentCount} for you to write.
              </p>
              <p className="text-[11px] text-zinc-500">
                We provide most of the product code. You complete a few guided write steps.
              </p>
            </div>

            {/* Optional File Tree (Collapsible) */}
            {showFileTree && (
              <div className="p-2 border-b border-zinc-800/80 bg-zinc-950/60 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase">
                  <span>Workspace Files</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={createFile} className="hover:text-zinc-200" title="New File">
                      <FilePlus className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={deleteFile} className="hover:text-zinc-200" title="Delete File">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <FileTree nodes={tree} active={activePath} onOpen={(p) => openFile(p)} />
              </div>
            )}

            {/* Mission / Step List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {workspace.missions.map((mission, idx) => {
                const isActive = idx === activeMissionIndex;
                const isCompleted = completedSteps.includes(mission.id);
                const isWrite = mission.ownership === "student";

                return (
                  <button
                    key={mission.id}
                    type="button"
                    onClick={() => handleSelectStep(idx)}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all border ${
                      isActive
                        ? "bg-teal-950/40 border-teal-600/80 text-zinc-100 shadow-sm"
                        : "bg-zinc-900/30 border-zinc-800/60 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center h-5 w-5 rounded-full text-[11px] font-bold shrink-0 mt-0.5 ${
                        isCompleted
                          ? "bg-emerald-500 text-zinc-950"
                          : isActive
                          ? "bg-teal-500 text-zinc-950"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold truncate leading-tight">{mission.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${
                            isWrite
                              ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                              : "bg-zinc-800/80 text-zinc-400"
                          }`}
                        >
                          {isWrite ? "You write" : "Provided"} {mission.time}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Requirements & Validation Card */}
            <div className="p-3 border-t border-zinc-800/80 bg-[#06080c] space-y-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Requirements</span>
                <ul className="mt-1 space-y-0.5 text-[11px] text-zinc-300">
                  {activeMission.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-400">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Validation</span>
                <ul className="mt-1 space-y-0.5 text-[11px] text-zinc-400">
                  <li className="flex items-center gap-1.5">
                    <span className={runtimeState === "RUNNING" ? "text-emerald-400" : "text-zinc-500"}>
                      {runtimeState === "RUNNING" ? "✓" : "○"}
                    </span>
                    <span>Click Run and confirm Preview looks right</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-zinc-500">○</span>
                    <span>Read &quot;What this means&quot; once</span>
                  </li>
                </ul>
              </div>

              {validationResult && !validationResult.ok && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-300 space-y-1">
                  {validationResult.failures.map((f, i) => (
                    <div key={i}>⚠️ {f}</div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleValidateStep}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shadow"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                Validate Task {activeMissionIndex + 1} {activeMissionIndex < workspace.missions.length - 1 ? `→ Task ${activeMissionIndex + 2}` : ""}
              </button>
              <p className="text-[10px] text-zinc-500 text-center">
                {activeMission.ownership === "provided"
                  ? "Provided step — Run Preview, then continue"
                  : "Your write step — replace FIXME, Run, then continue"}
              </p>
            </div>
          </aside>

          {/* ==================== CENTER COLUMN: EDITOR & PREVIEW SPLIT ==================== */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#0c0e12]">
            {/* Top Code Editor Area */}
            <div className="flex-1 flex flex-col min-h-[260px] border-b border-zinc-800/80">
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setDirty(true);
                }}
                spellCheck={false}
                className="flex-1 w-full resize-none bg-[#0a0c10] p-4 font-mono text-[12.5px] leading-relaxed text-zinc-200 outline-none selection:bg-teal-900/60"
              />
            </div>

            {/* Bottom Preview & Console Panel */}
            <div className="h-[380px] flex flex-col bg-[#07090e] shrink-0">
              {/* Tab Header Bar */}
              <div className="flex items-center justify-between px-3 border-b border-zinc-800/80 bg-[#0a0d14] h-8 shrink-0 text-xs">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveBottomTab("preview")}
                    className={`h-full border-b-2 font-semibold px-1 text-[11px] transition-colors ${
                      activeBottomTab === "preview"
                        ? "border-teal-400 text-teal-300"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBottomTab("console")}
                    className={`h-full border-b-2 font-semibold px-1 text-[11px] transition-colors ${
                      activeBottomTab === "console"
                        ? "border-teal-400 text-teal-300"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Console {runError ? "•" : ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBottomTab("tests")}
                    className={`h-full border-b-2 font-semibold px-1 text-[11px] transition-colors ${
                      activeBottomTab === "tests"
                        ? "border-teal-400 text-teal-300"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Tests
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                  <span>Runtime:</span>
                  <span
                    className={
                      runtimeState === "RUNNING"
                        ? "text-emerald-400 font-semibold"
                        : runtimeState === "FAILED"
                        ? "text-rose-400 font-semibold"
                        : isRunInProgress
                        ? "text-amber-400 font-semibold"
                        : "text-zinc-500"
                    }
                  >
                    {runtimeState === "RUNNING"
                      ? "✓ Running"
                      : runtimeState === "FAILED"
                      ? "✕ Failed"
                      : isRunInProgress
                      ? "◌ Starting..."
                      : "○ Not running"}
                  </span>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-h-0 bg-white relative overflow-hidden flex flex-col">
                {activeBottomTab === "preview" && (
                  <>
                    {previewHtml ? (
                      <div
                        className={`flex-1 w-full h-full transition-all ${
                          deviceMode === "tablet"
                            ? "max-w-[768px] mx-auto border-x border-zinc-300 shadow-md"
                            : deviceMode === "mobile"
                            ? "max-w-[375px] mx-auto border-x border-zinc-300 shadow-md"
                            : "w-full"
                        }`}
                      >
                        <iframe
                          key={previewKey}
                          ref={previewRef}
                          title={`Preview ${problemId}`}
                          sandbox="allow-scripts"
                          className="w-full h-full border-0"
                          srcDoc={previewHtml}
                          onLoad={() => {
                            setRuntimeState((prev) => (prev === "STARTING" || prev === "SAVING" ? "RUNNING" : prev));
                          }}
                        />
                      </div>
                    ) : runtimeState === "STARTING" || runtimeState === "SAVING" ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#090b10] text-zinc-400 space-y-3">
                        <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
                        <p className="text-xs text-zinc-300">
                          Runtime: <strong className="text-teal-400 font-mono">{runtimeState}...</strong>
                        </p>
                        <p className="text-xs text-zinc-500 max-w-sm">
                          Saving files and building live application preview...
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#090b10] text-zinc-400 space-y-3">
                        <Play className="h-8 w-8 text-teal-500/60 animate-pulse" />
                        <p className="text-xs text-zinc-300">
                          Runtime: <strong className="text-zinc-100 font-mono">{runtimeState}</strong>
                        </p>
                        <p className="text-xs text-zinc-500 max-w-sm">
                          Click the <strong className="text-teal-300 font-semibold">▶ Run</strong> button in the top header to execute your code and open live preview for {activeMission.title}.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {activeBottomTab === "console" && (
                  <div className="flex-1 p-3 bg-[#0a0c10] font-mono text-[11px] text-zinc-300 overflow-y-auto space-y-1">
                    {logs.map((l, i) => (
                      <div key={i} className="text-zinc-400">{l}</div>
                    ))}
                    {runError && (
                      <div className="text-rose-400 p-2 rounded bg-rose-950/30 border border-rose-900/40 font-mono whitespace-pre-wrap">
                        {runError}
                      </div>
                    )}
                  </div>
                )}

                {activeBottomTab === "tests" && (
                  <div className="flex-1 p-4 bg-[#0a0c10] font-mono text-xs text-zinc-300 space-y-2 overflow-y-auto">
                    <p className="text-zinc-400 text-[11px]">Validation tests for Step {activeMissionIndex + 1}:</p>
                    {activeMission.tests.map((test, i) => (
                      <div key={i} className="flex items-center gap-2 text-teal-300">
                        <span>{test}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Device Toolbar */}
              <div className="flex items-center justify-between px-3 py-1 bg-[#090b10] border-t border-zinc-800/80 text-[11px] text-zinc-400 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDeviceMode("desktop")}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                      deviceMode === "desktop" ? "bg-zinc-800 text-teal-300" : "hover:text-zinc-200"
                    }`}
                  >
                    <Monitor className="h-3 w-3" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("tablet")}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                      deviceMode === "tablet" ? "bg-zinc-800 text-teal-300" : "hover:text-zinc-200"
                    }`}
                  >
                    <Tablet className="h-3 w-3" /> Tablet
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("mobile")}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                      deviceMode === "mobile" ? "bg-zinc-800 text-teal-300" : "hover:text-zinc-200"
                    }`}
                  >
                    <Smartphone className="h-3 w-3" /> Mobile
                  </button>
                </div>

                <div className="text-[10px] text-zinc-500 font-mono">
                  <span>Node ✓</span> · <span>Next ✓</span> · <span>React ✓</span> · <span>TS ✓</span>
                </div>
              </div>
            </div>
          </main>

          {/* ==================== RIGHT COLUMN: NOVA COACH ==================== */}
          <aside className="w-[320px] shrink-0 flex flex-col bg-[#090b10] min-h-0">
            {/* Step Summary Card */}
            <div className="p-3 border-b border-zinc-800/80 space-y-2 bg-[#0b0e14]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {activeMission.ownership === "provided" ? "Provided by MakeMistakes" : "Your Write Step"}
                </span>
                <span className="text-zinc-400 font-mono">
                  {activeMissionIndex + 1}/{workspace.missions.length}
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-100">{activeMission.title}</h3>
              <p className="text-[11px] text-zinc-400 font-mono">Editing {activePath}</p>
            </div>

            {/* WHAT THIS MEANS Box */}
            <div className="p-3 border-b border-zinc-800/80 space-y-1.5 bg-[#06080d]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">What This Means</span>
              <p className="text-xs text-zinc-300 leading-relaxed">{activeMission.whatThisMeans}</p>
              <p className="text-[11px] text-zinc-500 italic">
                {activeMission.ownership === "provided"
                  ? "You don't need to invent this code. Read it, click Run, check validation, continue."
                  : "Replace __WRITE_ME__ or FIXME markers with your code, then click Run."}
              </p>
            </div>

            {/* NOVA Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-[#080a0f]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">NOVA</div>
              {novaMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal-950/60 border border-teal-800/60 text-teal-100 ml-4"
                      : "bg-zinc-900/60 border border-zinc-800/60 text-zinc-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              {novaLoading && (
                <div className="flex items-center gap-2 p-2 text-xs text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" />
                  <span>Nova is thinking...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Question Pills */}
            <div className="p-2.5 border-t border-zinc-800/80 bg-[#0a0c11] space-y-1.5">
              <div className="flex flex-wrap gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => sendNovaMessage("What does this step mean?")}
                  className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-colors"
                >
                  What does this step mean?
                </button>
                <button
                  type="button"
                  onClick={() => sendNovaMessage("Is this my write step or provided?")}
                  className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-colors"
                >
                  Is this my write step or provided?
                </button>
                <button
                  type="button"
                  onClick={() => sendNovaMessage("Why is Preview empty?")}
                  className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-colors"
                >
                  Why is Preview empty?
                </button>
                <button
                  type="button"
                  onClick={() => sendNovaMessage("What should I change next?")}
                  className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-colors"
                >
                  What should I change next?
                </button>
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendNovaMessage();
                }}
                className="flex items-center gap-1.5 pt-1"
              >
                <input
                  type="text"
                  value={novaInput}
                  onChange={(e) => setNovaInput(e.target.value)}
                  placeholder="Ask Nova like a teammate..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-teal-500/80"
                />
                <button
                  type="submit"
                  disabled={!novaInput.trim() || novaLoading}
                  className="p-1.5 rounded bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold disabled:opacity-40 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* ==================== 4. BOTTOM GLOBAL NAVIGATION FOOTER ==================== */}
      <footer className="flex items-center justify-between h-9 px-4 bg-[#090b10] border-t border-zinc-800/80 text-xs shrink-0">
        <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
          <span className="hover:text-zinc-200 cursor-pointer">Plan Architecture</span>
          <span className="text-zinc-600">·</span>
          <span className="hover:text-zinc-200 cursor-pointer">Design Solution</span>
        </div>

        <div className="text-[11px] text-zinc-400 font-mono">
          Build · Beginner · {workspace.providedCount}P/{workspace.studentCount}W · {activeMissionIndex + 1}/{workspace.missions.length}
        </div>

        <button
          type="button"
          onClick={handleValidateStep}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded text-xs transition-colors shadow-sm"
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" />
          Validate Task {activeMissionIndex + 1} {activeMissionIndex < workspace.missions.length - 1 ? `→ Task ${activeMissionIndex + 2}` : ""}
        </button>
      </footer>
    </div>
  );
}
