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
  ChevronDown,
  ChevronUp,
  Layers,
  Database,
  Compass,
  Code2,
  ShieldAlert,
  Cpu,
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

export default function BuildOS({ problemId, productName: propName, problemData, onReadyChange, onComplete, userId: propUserId }: Props) {
  const userId = useMemo(() => propUserId || getJourneyUserId(), [propUserId]);
  const workspace = useMemo(() => deriveBuildWorkspace(problemData), [problemData]);
  const productName = propName || workspace.productName;

  // Determine difficulty level: Beginner, Intermediate, or Advanced
  const difficulty = useMemo<"Beginner" | "Intermediate" | "Advanced">(() => {
    const raw = (problemData?.difficulty || (problemData as any)?.learning?.level || "Beginner").toString().toLowerCase();
    if (raw.includes("adv") || raw.includes("expert")) return "Advanced";
    if (raw.includes("inter")) return "Intermediate";
    return "Beginner";
  }, [problemData]);

  // Build mode derived from difficulty (can later be from DB student profile)
  const buildMode = useMemo<"guided" | "assisted" | "independent">(() => {
    if (difficulty === "Advanced") return "independent";
    if (difficulty === "Intermediate") return "assisted";
    return "guided";
  }, [difficulty]);

  const buildModeLabel = buildMode === "guided" ? "Guided Build" : buildMode === "assisted" ? "Assisted Build" : "Independent Build";
  const buildModeColor = buildMode === "guided" ? "emerald" : buildMode === "assisted" ? "amber" : "violet";

  // Entire Previous Journey Context (Phases 1 - 4)
  const [journeyPhases, setJourneyPhases] = useState<any>(null);
  const [journeyLoading, setJourneyLoading] = useState(true);
  const [showBlueprint, setShowBlueprint] = useState(false);

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

  // UI Panels & IDE State
  const [showExplorer, setShowExplorer] = useState(true);
  const [showNovaPanel, setShowNovaPanel] = useState(true);
  const [showRoadmapSection, setShowRoadmapSection] = useState(false);
  const [openTabs, setOpenTabs] = useState<string[]>(["app/page.tsx"]);
  const [activeBottomTab, setActiveBottomTab] = useState<"preview" | "console" | "tests">("preview");
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  // Nova AI Chat & Code Proposals State
  const [appliedProposals, setAppliedProposals] = useState<Set<string>>(new Set());
  const [novaMessages, setNovaMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: `Welcome to **${workspace.productName}** in BuildOS!\n\nI'm Nova — your AI product coding mentor. I'm loading your journey blueprint from Phases 1 through 4...`,
    },
  ]);
  const [novaInput, setNovaInput] = useState("");
  const [novaLoading, setNovaLoading] = useState(false);

  // Fetch full journey data (Phases 1-4) on mount
  useEffect(() => {
    let isMounted = true;
    async function loadJourneyContext() {
      const pid = problemId || problemData?.problemId || (problemData as any)?.id;
      if (!pid) {
        if (isMounted) setJourneyLoading(false);
        return;
      }

      // 1. Try localStorage cache for instant availability
      try {
        const rawLocal = localStorage.getItem(`make_mistakes_phases_${pid}`) || localStorage.getItem(`journey_phases_${pid}`);
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (isMounted && parsed) setJourneyPhases(parsed);
        }
      } catch {
        // ignore storage parse errors
      }

      // 2. Fetch authoritative state from DB
      try {
        const effectiveUid = propUserId || userId || getJourneyUserId();
        const res = await fetch(`/api/journey/user-data?userId=${encodeURIComponent(effectiveUid)}&problemId=${encodeURIComponent(pid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.phases && isMounted) {
            setJourneyPhases(data.phases);
          }
        }
      } catch (err) {
        console.error("Failed to load journey context in BuildOS:", err);
      } finally {
        if (isMounted) setJourneyLoading(false);
      }
    }

    loadJourneyContext();
    return () => {
      isMounted = false;
    };
  }, [problemId, problemData?.problemId, propUserId, userId]);

  // Personalize Nova initial greeting once journey blueprint is loaded
  const hasPersonalizedGreeting = useRef(false);
  useEffect(() => {
    if (!journeyPhases && journeyLoading) return;
    if (hasPersonalizedGreeting.current) return;
    hasPersonalizedGreeting.current = true;

    const design = journeyPhases?.design || {};
    const plan = journeyPhases?.plan || {};
    const sketches = Array.isArray(design.sketches) ? design.sketches : [];
    const validSketches = sketches.filter((s: any) => s.imageUrl);
    const techStack = plan.techDecisions ? Object.values(plan.techDecisions).filter(Boolean).join(", ") : "";
    const goal = design.productGoal || problemData?.title || workspace.productName;

    let greeting = `Welcome to **${workspace.productName}** in BuildOS! 🚀\n\n`;
    greeting += `I've loaded your entire blueprint from Phase 1 through Phase 4:\n`;
    greeting += `• **Product Goal:** ${goal}\n`;
    if (design.selectedUsers?.length || design.customUserRole) {
      greeting += `• **Target Persona:** ${design.selectedUsers?.join(", ") || design.customUserRole}\n`;
    }
    if (validSketches.length > 0) {
      greeting += `• **Uploaded Mockups:** ${validSketches.length} screen designs linked (${validSketches.map((s: any) => s.screenName || "Screen").join(", ")})\n`;
    }
    if (techStack) {
      greeting += `• **Tech Stack Chosen:** ${techStack}\n`;
    }
    if (plan.modules?.length) {
      greeting += `• **Planned Modules:** ${plan.modules.map((m: any) => m.name || m.title).join(", ")}\n`;
    }

    greeting += `\n---\n`;

    if (buildMode === "guided") {
      greeting += `📚 **Guided Build Mode** — Your job is to build this product. My job is to help you learn.\n\nI will:\n✓ Explain concepts when you're confused\n✓ Give hints to point you in the right direction\n✓ Show small focused examples you can learn from\n✓ Help you debug specific errors\n\nI will not automatically write entire features for you — that would skip the learning. **Start with Mission 01** and ask me to explain anything you don't understand yet.`;
    } else if (buildMode === "assisted") {
      greeting += `🔧 **Assisted Build Mode** — You own most of the implementation. I help when you're genuinely stuck.\n\nAsk me for: architecture advice, TypeScript types, debugging help, code review.\nBefore I write code for you — tell me what you've tried first.`;
    } else {
      greeting += `🚀 **Independent Build Mode** — You build. I review.\n\nShare your approach, architecture decisions, and code with me. I'll challenge your assumptions, identify edge cases, and review trade-offs. The implementation is yours.`;
    }

    setNovaMessages([
      {
        role: "assistant",
        content: greeting,
      },
    ]);
  }, [journeyPhases, journeyLoading, buildMode, workspace.productName, problemData?.title]);

  const parseNovaProposals = useCallback((text: string) => {
    if (!text) return [];
    const proposals: Array<{ id: string; filePath: string; code: string }> = [];
    const regex = /```(?:tsx|jsx|typescript|javascript|ts|js)?[\r\n]+([\s\S]*?)```/g;
    let match;
    let idx = 0;
    while ((match = regex.exec(text)) !== null) {
      const rawCode = match[1] || "";
      const fileHeaderMatch = rawCode.match(/(?:\/\/|\/\*)\s*FILE:\s*([^\r\n]+)/i);
      let filePath = "";
      if (fileHeaderMatch) {
        filePath = fileHeaderMatch[1].trim();
      } else {
        const lineMatch = rawCode.match(/^[\/\#\*]*\s*([a-zA-Z0-9_\-\/]+\.(?:tsx|ts|jsx|js|css|json))/m);
        if (lineMatch) filePath = lineMatch[1].trim();
      }

      if (filePath && rawCode.trim().length > 10) {
        idx++;
        proposals.push({
          id: `prop-${idx}-${filePath.replace(/[^a-zA-Z0-9]/g, "_")}`,
          filePath,
          code: rawCode.trim(),
        });
      }
    }
    return proposals;
  }, []);

  const applyNovaProposal = async (proposal: { id: string; filePath: string; code: string }) => {
    try {
      const res = await fetch("/api/buildos/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          problemId,
          path: proposal.filePath,
          content: proposal.code,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(`Failed to apply proposal: ${data.error || "Unknown error"}`);
        return;
      }

      if (!openTabs.includes(proposal.filePath)) {
        setOpenTabs((prev) => [...prev, proposal.filePath]);
      }
      setActivePath(proposal.filePath);
      setContent(proposal.code);

      setAppliedProposals((prev) => new Set(prev).add(proposal.id));

      const treeRes = await fetch(
        `/api/buildos/files?userId=${encodeURIComponent(userId)}&problemId=${encodeURIComponent(problemId)}`
      );
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (treeData.tree) setTree(treeData.tree);
      }

      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ✓ Applied Nova code proposal to ${proposal.filePath}`]);
    } catch (err: any) {
      alert(`Failed to apply proposal: ${err.message}`);
    }
  };

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
    setOpenTabs((prev) => (prev.includes(filePath) ? prev : [...prev, filePath]));
  };

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t !== path);
    setOpenTabs(remaining);
    if (activePath === path && remaining.length > 0) {
      openFile(remaining[remaining.length - 1], true);
    }
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
    const mainFile = mission?.files && mission.files[0] ? mission.files[0] : "app/page.tsx";
    const targetMainFile =
      mainFile === "page.tsx"
        ? "app/page.tsx"
        : mainFile.startsWith("app/")
        ? mainFile
        : `app/${mainFile}`;

    await openFile(targetMainFile, true);
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
            problemStatement: problemData?.title || workspace.statement,
            problemDescription: problemData?.problemStatement || (problemData as any)?.description || "",
            category: workspace.category,
            difficulty,
            buildMode,
            taskOwnership: activeMission.ownership,
            missionTitle: activeMission.title,
            buildObjective: activeMission.whatThisMeans || "",
            activeFile: activePath,
            fileCode: content,
            discover: journeyPhases?.discover || null,
            research: journeyPhases?.research || null,
            design: journeyPhases?.design || null,
            plan: journeyPhases?.plan || null,
          },
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response was not JSON (e.g. Vercel 504 HTML Gateway Timeout)
      }

      if (res.ok && data?.ok && data.message) {
        setNovaMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      } else if (res.status === 504 || res.status === 408 || (!res.ok && !data)) {
        setNovaMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Generating complete code for an entire project exceeded the execution timeout limit. Please ask for one specific file or component at a time (e.g. 'Help me build the navbar' or 'Create the database schema') so I can generate clean, working code for you.",
          },
        ]);
      } else {
        const errorMsg = data?.error || data?.message || "I'm having trouble analyzing this step right now. Try asking for a specific component or smaller step.";
        setNovaMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorMsg },
        ]);
      }
    } catch {
      setNovaMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Nova connection timed out. For large requests like generating entire projects, please ask for individual components or files one by one.",
        },
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
    <div className="flex flex-col h-full w-full min-h-0 bg-[#07090e] text-zinc-100 font-sans select-none overflow-hidden">
      {/* ==================== 1. TOP IDE HEADER BAR ==================== */}
      <header className="flex items-center justify-between h-10 px-3 bg-[#0a0d14] border-b border-zinc-800/80 text-xs shrink-0 z-10">
        {/* Left: Branding & Context */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowExplorer(!showExplorer)}
            className={`p-1.5 rounded transition-colors ${
              showExplorer ? "bg-zinc-800 text-teal-400" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
            title="Toggle Explorer Sidebar"
          >
            {showExplorer ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-950/80 border border-teal-800/60 text-teal-300 font-bold text-[11px] tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              BuildOS
            </div>
            <span className="text-zinc-600">/</span>
            <span className="font-mono text-[11px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              {problemId || "P000001"}
            </span>
            <span className="font-semibold text-zinc-200 truncate max-w-[140px] hidden sm:inline">
              {productName}
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-0.5 hidden md:block" />

          {/* Active Task Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900/90 border border-zinc-800 rounded text-[11px] text-zinc-300">
            <span className="px-1.5 py-0.2 bg-teal-950 text-teal-400 font-mono text-[10px] font-bold rounded">
              IDE Workspace
            </span>
            <span className="truncate max-w-[180px] font-medium">{productName} App</span>
          </div>
        </div>

        {/* Middle: Save Status & Runtime Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <span
              className={`h-2 w-2 rounded-full ${
                saving
                  ? "bg-amber-400 animate-ping"
                  : dirty
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
            />
            <span>{saving ? "Saving..." : dirty ? "Unsaved" : "Saved"}</span>
          </div>

          <div className="h-3.5 w-px bg-zinc-800" />

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-zinc-500">Status:</span>
            <span
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                runtimeState === "RUNNING"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800/80"
                  : runtimeState === "FAILED"
                  ? "bg-rose-950 text-rose-300 border border-rose-800/80"
                  : runtimeState === "STARTING" || runtimeState === "SAVING"
                  ? "bg-amber-950 text-amber-300 border border-amber-800/80 animate-pulse"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800"
              }`}
            >
              {runtimeState === "RUNNING"
                ? "Running ✓"
                : runtimeState === "FAILED"
                ? "Failed ✗"
                : runtimeState === "STARTING"
                ? "Compiling..."
                : runtimeState === "SAVING"
                ? "Saving..."
                : "Ready"}
            </span>
          </div>
        </div>

        {/* Right: Actions (Save, Run, Nova Toggle) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={saveFile}
            disabled={saving || !dirty}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded text-xs transition-colors disabled:opacity-40"
          >
            Save
          </button>

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
            <span>{isRunInProgress ? "Running..." : runtimeState === "RUNNING" ? "Run Again" : "Run"}</span>
          </button>



          <button
            type="button"
            onClick={() => setShowNovaPanel(!showNovaPanel)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              showNovaPanel
                ? "bg-teal-950 border-teal-800/80 text-teal-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">Nova AI</span>
          </button>
        </div>
      </header>

      {/* ==================== BOOTING STATE ==================== */}
      {phase === "booting" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-[#090b10]">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          <p className="text-sm font-semibold text-zinc-200">Initializing BuildOS IDE Workspace...</p>
          <p className="text-xs text-zinc-500 max-w-md text-center">
            Node.js, Next.js, React 19, and TypeScript compiler are pre-configured in your private cloud sandbox.
          </p>
        </div>
      )}

      {/* ==================== ERROR STATE ==================== */}
      {phase === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-[#090b10]">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-zinc-200">BuildOS Workspace Initialization Failed</p>
          <button
            type="button"
            onClick={ensure}
            className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-600"
          >
            Retry Workspace Setup
          </button>
        </div>
      )}

      {/* ==================== MAIN IDE WORKSPACE AREA ==================== */}
      {phase === "ready" && (
        <div className="flex-1 flex min-h-0 divide-x divide-zinc-800/80 overflow-hidden">
          {/* ==================== 1. LEFT FILE EXPLORER SIDEBAR ==================== */}
          {showExplorer && (
            <aside className="w-[260px] shrink-0 flex flex-col bg-[#090b10] min-h-0 select-none border-r border-zinc-800/80">
              {/* Explorer Header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 text-xs font-semibold text-zinc-300">
                <span className="uppercase tracking-wider text-[10px] text-zinc-400 font-mono">EXPLORER</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={createFile}
                    className="p-1 text-zinc-400 hover:text-teal-300 hover:bg-zinc-800/60 rounded"
                    title="New File"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={deleteFile}
                    className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60 rounded"
                    title="Delete File"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Workspace File Tree */}
              <div className="flex-1 overflow-y-auto p-2 min-h-0">
                <FileTree nodes={tree} active={activePath} onOpen={(p) => openFile(p)} />
              </div>

              {/* Collapsible Roadmap Drawer */}
              <div className="border-t border-zinc-800/80 bg-[#06080d]">
                <button
                  type="button"
                  onClick={() => setShowRoadmapSection(!showRoadmapSection)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-zinc-300 hover:bg-zinc-900/60 transition-colors uppercase tracking-wider"
                >
                  <span className="flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5 text-teal-400" />
                    Build Roadmap ({workspace.missions.length})
                  </span>
                  <span className="text-zinc-500 font-mono text-[10px]">{showRoadmapSection ? "▼" : "▶"}</span>
                </button>

                {showRoadmapSection && (
                  <div className="max-h-56 overflow-y-auto px-2 py-1 space-y-0.5">
                    {workspace.missions.map((m, idx) => {
                      const isCompleted = completedSteps.includes(m.id);
                      const isActive = activeMissionIndex === idx;
                      const isLocked = idx > activeMissionIndex + 1 && !isCompleted;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => !isLocked && handleSelectStep(idx)}
                          disabled={isLocked}
                          className={`w-full flex items-start gap-2 p-2 rounded text-left text-xs transition-colors ${
                            isActive
                              ? "bg-teal-950/60 border border-teal-800/60 text-teal-200"
                              : isCompleted
                              ? "text-emerald-400/80 hover:bg-zinc-900"
                              : isLocked
                              ? "text-zinc-700 cursor-not-allowed"
                              : "hover:bg-zinc-900 text-zinc-400"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <span className="text-emerald-400 text-xs">✓</span>
                            ) : isActive ? (
                              <span className="text-teal-400 text-xs">→</span>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-600 font-bold">{idx + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-medium truncate text-[11px]">{m.title}</span>
                            </div>
                            <span className={`text-[9px] font-mono uppercase block ${
                              m.ownership === "provided" ? "text-zinc-600" : "text-teal-600"
                            }`}>
                              {m.ownership === "provided" ? "📖 Study" : "✏️ Your Task"} · {m.time || "15–25 min"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          )}


          {/* ==================== 2. CENTRAL CODE EDITOR & BOTTOM PANEL ==================== */}
          <main className="flex-1 flex flex-col min-w-0 bg-[#07090e]">
            {/* Multi-Tab Bar */}
            <div className="flex items-center h-8 bg-[#0a0d14] border-b border-zinc-800/80 overflow-x-auto shrink-0 select-none">
              {openTabs.map((tabPath) => {
                const isActive = activePath === tabPath;
                const fileName = tabPath.split("/").pop() || tabPath;
                return (
                  <div
                    key={tabPath}
                    onClick={() => openFile(tabPath)}
                    className={`group flex items-center gap-2 px-3 py-1.5 border-r border-zinc-800/80 text-xs font-mono cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#07090e] text-teal-300 font-semibold border-t-2 border-t-teal-500"
                        : "bg-[#0b0e14] text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 text-teal-500/80 shrink-0" />
                    <span className="truncate max-w-[130px]">{fileName}</span>
                    {isActive && dirty && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                    {openTabs.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => closeTab(tabPath, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded text-zinc-500"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Code Editor Body */}
            <div className="flex-1 relative min-h-0 bg-[#07090e]">
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setDirty(true);
                }}
                spellCheck={false}
                className="w-full h-full p-4 bg-[#07090e] text-zinc-100 font-mono text-xs leading-relaxed resize-none outline-none border-none selection:bg-teal-900/60"
                placeholder="// Write your component code here..."
              />
              <div className="absolute top-2 right-3 flex items-center gap-2 bg-zinc-900/80 backdrop-blur px-2.5 py-1 rounded border border-zinc-800 text-[10px] font-mono text-zinc-400">
                <span>{activePath}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="hover:text-zinc-200 text-zinc-400"
                  title="Copy Code"
                >
                  {copied ? "Copied!" : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* ==================== 3. BOTTOM DOCK (PREVIEW / CONSOLE / TESTS) ==================== */}
            <div className="h-[280px] shrink-0 flex flex-col bg-[#090b10] border-t border-zinc-800/80">
              {/* Dock Tab Header Bar */}
              <div className="flex items-center justify-between h-8 px-3 bg-[#0a0d14] border-b border-zinc-800/80 text-xs shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveBottomTab("preview")}
                    className={`px-3 py-1 text-xs font-semibold rounded-t border-b-2 transition-colors ${
                      activeBottomTab === "preview"
                        ? "border-teal-500 text-teal-300 bg-[#090b10]"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Preview Output
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBottomTab("console")}
                    className={`px-3 py-1 text-xs font-semibold rounded-t border-b-2 transition-colors ${
                      activeBottomTab === "console"
                        ? "border-teal-500 text-teal-300 bg-[#090b10]"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Console ({logs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBottomTab("tests")}
                    className={`px-3 py-1 text-xs font-semibold rounded-t border-b-2 transition-colors ${
                      activeBottomTab === "tests"
                        ? "border-teal-500 text-teal-300 bg-[#090b10]"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Tests ({activeMission.tests.length})
                  </button>
                </div>

                {/* Device Viewport Selector */}
                {activeBottomTab === "preview" && (
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded p-0.5">
                    <button
                      type="button"
                      onClick={() => setDeviceMode("desktop")}
                      className={`p-1 rounded ${deviceMode === "desktop" ? "bg-zinc-800 text-teal-300" : "text-zinc-400 hover:text-zinc-200"}`}
                      title="Desktop Viewport"
                    >
                      <Monitor className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceMode("tablet")}
                      className={`p-1 rounded ${deviceMode === "tablet" ? "bg-zinc-800 text-teal-300" : "text-zinc-400 hover:text-zinc-200"}`}
                      title="Tablet Viewport"
                    >
                      <Tablet className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceMode("mobile")}
                      className={`p-1 rounded ${deviceMode === "mobile" ? "bg-zinc-800 text-teal-300" : "text-zinc-400 hover:text-zinc-200"}`}
                      title="Mobile Viewport"
                    >
                      <Smartphone className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Dock Tab Content Body */}
              <div className="flex-1 relative min-h-0 bg-[#07090e] overflow-hidden">
                {/* PREVIEW TAB */}
                {activeBottomTab === "preview" && (
                  <div className="w-full h-full flex justify-center bg-[#07090e] p-2 overflow-auto">
                    <div
                      className={`h-full bg-white rounded shadow-lg overflow-hidden transition-all duration-300 ${
                        deviceMode === "mobile"
                          ? "w-[375px]"
                          : deviceMode === "tablet"
                          ? "w-[768px]"
                          : "w-full"
                      }`}
                    >
                      {previewHtml ? (
                        <iframe
                          key={previewKey}
                          ref={previewRef}
                          srcDoc={previewHtml}
                          title="BuildOS Preview Sandbox"
                          className="w-full h-full border-none"
                          sandbox="allow-scripts allow-modals"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-400">
                          <Play className="h-8 w-8 text-teal-500/60 mb-2" />
                          <p className="text-xs font-semibold text-zinc-300">Click ▶ Run to render preview output</p>
                          <p className="text-[11px] text-zinc-500 mt-1 max-w-sm">
                            Your workspace code compiles in browser sandbox memory without requiring local Node.js or npm.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CONSOLE TAB */}
                {activeBottomTab === "console" && (
                  <div className="w-full h-full p-3 font-mono text-xs bg-[#07090e] overflow-y-auto space-y-1">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                      $ BuildOS Diagnostic Console
                    </div>
                    {logs.map((log, i) => (
                      <div
                        key={i}
                        className={`text-[11px] leading-relaxed ${
                          log.startsWith("Error:") || log.startsWith("Build failed") || log.startsWith("✗")
                            ? "text-rose-400 font-semibold"
                            : log.startsWith("✓")
                            ? "text-emerald-400"
                            : log.startsWith("---")
                            ? "text-teal-400 font-bold"
                            : "text-zinc-300"
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                    {runError && (
                      <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs mt-2">
                        <span className="font-bold">Build Error:</span> {runError}
                      </div>
                    )}
                  </div>
                )}

                {/* TESTS TAB */}
                {activeBottomTab === "tests" && (
                  <div className="w-full h-full p-4 bg-[#07090e] overflow-y-auto space-y-3">
                    <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Validation Suite for Task {activeMissionIndex + 1}: {activeMission.title}
                    </div>
                    <div className="space-y-1.5">
                      {activeMission.tests.map((test, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded bg-zinc-900/60 border border-zinc-800/80 text-xs text-teal-300"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{test}</span>
                        </div>
                      ))}
                    </div>
                    {validationResult && (
                      <div className="p-3 rounded text-xs border bg-zinc-900">
                        {validationResult.ok ? (
                          <div className="text-emerald-400 font-semibold">✓ All Task {activeMissionIndex + 1} validation criteria satisfied!</div>
                        ) : (
                          <div className="text-rose-400 font-semibold space-y-1">
                            <div>Validation Issues:</div>
                            {validationResult.failures.map((f, idx) => (
                              <div key={idx} className="text-[11px] text-rose-300">• {f}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Validation Action Bar */}
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#0a0d14] border-t border-zinc-800/80 shrink-0">
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-zinc-500">Mission {activeMissionIndex + 1}/{workspace.missions.length}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    activeMission.ownership === "provided"
                      ? "bg-zinc-800 text-zinc-400"
                      : "bg-teal-950/80 text-teal-400 border border-teal-800/50"
                  }`}>
                    {activeMission.ownership === "provided" ? "📖 Study" : "✏️ Your Task"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleValidateStep}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition-colors shadow-sm cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Submit &amp; Validate</span>
                </button>
              </div>
            </div>
          </main>

          {/* ==================== 4. RIGHT NOVA AI COACH SIDEBAR ==================== */}
          {showNovaPanel && (
            <aside className="w-[300px] shrink-0 flex flex-col bg-[#090b10] min-h-0 border-l border-zinc-800/80">
              {/* Nova Mentor Header — Build Mode */}
              <div className="border-b border-zinc-800/80 bg-[#0b0e14]">
                <div className="flex items-center justify-between px-3 pt-3 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <span className="font-bold text-xs text-zinc-100 uppercase tracking-wider">Nova AI Mentor</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    buildMode === "guided"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
                      : buildMode === "assisted"
                      ? "bg-amber-950/80 text-amber-300 border border-amber-700/60"
                      : "bg-violet-950/80 text-violet-300 border border-violet-700/60"
                  }`}>
                    {buildMode === "guided" ? "📚 Guided Build" : buildMode === "assisted" ? "🔧 Assisted Build" : "🚀 Independent Build"}
                  </span>
                </div>
                {/* Role Clarity Strip */}
                <div className="mx-3 mb-3 rounded-lg bg-zinc-900/80 border border-zinc-800/60 divide-y divide-zinc-800/60 text-[10px]">
                  <div className="flex items-center gap-2 px-2.5 py-1.5">
                    <span className="text-zinc-500 w-14 shrink-0">Your role:</span>
                    <span className="font-bold text-teal-300 uppercase tracking-wide">
                      {buildMode === "guided" ? "BUILD THE PRODUCT" : buildMode === "assisted" ? "OWN THE CODE" : "BUILD INDEPENDENTLY"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5">
                    <span className="text-zinc-500 w-14 shrink-0">Nova:</span>
                    <span className="font-bold text-amber-300 uppercase tracking-wide">
                      {buildMode === "guided" ? "TEACH & GUIDE" : buildMode === "assisted" ? "ASSIST WHEN STUCK" : "REVIEW & AUDIT"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5">
                    <span className="text-zinc-500 w-14 shrink-0">Mission:</span>
                    <span className="text-zinc-300 truncate">{activeMission.title}</span>
                  </div>
                </div>
              </div>

              {/* Collapsible Journey Blueprint Drawer */}
              <div className="border-b border-zinc-800/80 bg-[#06080d]">
                <button
                  type="button"
                  onClick={() => setShowBlueprint((prev) => !prev)}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-zinc-900/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-400">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Journey Blueprint</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                      Phases 1–4 Loaded
                    </span>
                  </div>
                  {showBlueprint ? (
                    <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </button>

                {showBlueprint && (
                  <div className="px-3 pb-3 pt-1 space-y-2 text-[11px] text-zinc-300 border-t border-zinc-900 bg-zinc-950/70 max-h-56 overflow-y-auto font-mono">
                    <div>
                      <span className="text-zinc-500 block text-[9px] uppercase font-bold">Problem Statement</span>
                      <p className="text-zinc-200 text-[10px] line-clamp-2">{problemData?.title || workspace.statement}</p>
                    </div>

                    {journeyPhases?.design?.productGoal && (
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold">Product Goal</span>
                        <p className="text-teal-300 text-[10px]">{journeyPhases.design.productGoal}</p>
                      </div>
                    )}

                    {(journeyPhases?.design?.selectedUsers?.length || journeyPhases?.design?.customUserRole) && (
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold">Target Persona</span>
                        <p className="text-zinc-300 text-[10px]">
                          {journeyPhases?.design?.selectedUsers?.join(", ") || journeyPhases?.design?.customUserRole}
                        </p>
                      </div>
                    )}

                    {Array.isArray(journeyPhases?.design?.sketches) && journeyPhases.design.sketches.filter((s: any) => s.imageUrl).length > 0 && (
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold">Uploaded Mockups</span>
                        <p className="text-emerald-400 text-[10px]">
                          ✓ {journeyPhases.design.sketches.filter((s: any) => s.imageUrl).length} screens uploaded:{" "}
                          {journeyPhases.design.sketches.filter((s: any) => s.imageUrl).map((s: any) => s.screenName || "Screen").join(", ")}
                        </p>
                      </div>
                    )}

                    {journeyPhases?.plan?.techDecisions && Object.keys(journeyPhases.plan.techDecisions).length > 0 && (
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold">Tech Stack Decisions</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {Object.entries(journeyPhases.plan.techDecisions).map(([k, v]) => (
                            <span key={k} className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-300">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(journeyPhases?.plan?.modules) && journeyPhases.plan.modules.length > 0 && (
                      <div>
                        <span className="text-zinc-500 block text-[9px] uppercase font-bold">Planned Modules</span>
                        <p className="text-zinc-300 text-[10px]">
                          {journeyPhases.plan.modules.map((m: any) => m.name || m.title).join(" · ")}
                        </p>
                      </div>
                    )}

                    <div className="pt-1 border-t border-zinc-800/60 text-[9px] text-zinc-400">
                      AI implementation:{" "}
                      <strong className={`${
                        buildMode === "guided" ? "text-amber-400" : buildMode === "assisted" ? "text-teal-300" : "text-violet-300"
                      }`}>
                        {buildMode === "guided" ? "Limited — You implement" : buildMode === "assisted" ? "Moderate — When needed" : "On request only"}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input & Hint Ladder */}
              <div className="p-2.5 border-b border-zinc-800/80 bg-[#0b0e15] space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendNovaMessage();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={novaInput}
                    onChange={(e) => setNovaInput(e.target.value)}
                    placeholder={
                      buildMode === "guided"
                        ? "Ask for an explanation, hint, or debug help..."
                        : buildMode === "assisted"
                        ? "Share your code or ask what you're stuck on..."
                        : "Share your approach for review or audit..."
                    }
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-teal-500/80"
                  />
                  <button
                    type="submit"
                    disabled={!novaInput.trim() || novaLoading}
                    className="p-1.5 rounded bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>

                {/* Hint Ladder Buttons — prefer lower levels first */}
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Available Help</div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => sendNovaMessage(`Explain the concept I need to understand for this task: "${activeMission.title}" — what is it, why does it exist, and how does it work?`)}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 transition-colors cursor-pointer"
                      title="Get a concept explanation — no code"
                    >
                      💡 Explain
                    </button>
                    <button
                      type="button"
                      onClick={() => sendNovaMessage(`Give me a directional hint to get started on "${activeMission.title}" without giving me the full solution`)}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 transition-colors cursor-pointer"
                      title="Get a nudge in the right direction"
                    >
                      🧭 Give a Hint
                    </button>
                    <button
                      type="button"
                      onClick={() => sendNovaMessage(`Show me a small focused example relevant to "${activeMission.title}" — not my full solution, just a pattern I can learn from`)}
                      className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 transition-colors cursor-pointer"
                      title="See a small focused example"
                    >
                      📋 Example
                    </button>
                    <button
                      type="button"
                      onClick={() => sendNovaMessage(`I'm getting an error in ${activePath}. Here's my code:\n\n${content.slice(0, 800)}\n\nHelp me understand what's wrong and how to fix it.`)}
                      className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-950/80 text-rose-300 border border-rose-800/50 transition-colors cursor-pointer"
                      title="Debug a specific error with your code"
                    >
                      🐛 Debug
                    </button>
                    {buildMode !== "guided" && (
                      <button
                        type="button"
                        onClick={() => sendNovaMessage(`Review my implementation in ${activePath} for ${activeMission.title}. Here's my code:\n\n${content.slice(0, 800)}`)}
                        className="px-2 py-1 rounded bg-teal-950/60 hover:bg-teal-950/80 text-teal-300 border border-teal-800/50 transition-colors cursor-pointer"
                        title="Get a code review"
                      >
                        🔍 Review
                      </button>
                    )}
                  </div>
                  {buildMode === "guided" && activeMission.ownership === "student" && (
                    <div className="text-[9px] text-amber-400/80 font-medium pt-0.5">
                      ⚠️ Guided Build: Try implementing before asking for code
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Stream & Code Proposals */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-[#080a0f]">
                {novaMessages.map((msg, i) => {
                  const proposals = msg.role === "assistant" ? parseNovaProposals(msg.content) : [];
                  return (
                    <div key={i} className="space-y-2">
                      <div
                        className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-teal-950/60 border border-teal-800/60 text-teal-100 ml-4"
                            : "bg-zinc-900/60 border border-zinc-800/60 text-zinc-200"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {/* Render Interactive Code Proposals */}
                      {proposals.map((prop) => {
                        const isApplied = appliedProposals.has(prop.id);
                        return (
                          <div
                            key={prop.id}
                            className="bg-[#0b0e17] border border-teal-800/60 rounded-xl p-3 space-y-2.5 shadow-md ml-1"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-teal-400 font-mono text-[11px] font-semibold">
                                <FileCode className="h-3.5 w-3.5 text-teal-400" />
                                <span>{prop.filePath}</span>
                              </div>
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/50">
                                Code Proposal
                              </span>
                            </div>

                            <div className="bg-[#05070a] border border-zinc-800/80 rounded-lg p-2 max-h-32 overflow-y-auto font-mono text-[10px] text-zinc-300">
                              <pre>{prop.code.slice(0, 250)}{prop.code.length > 250 ? "\n..." : ""}</pre>
                            </div>

                            <div className="flex items-center gap-2 pt-0.5">
                              {isApplied ? (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-full justify-center">
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                  <span>Applied to Workspace</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => applyNovaProposal(prop)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow cursor-pointer"
                                  >
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    <span>Apply Changes</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setAppliedProposals((prev) => new Set(prev).add(prop.id))}
                                    className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {novaLoading && (
                  <div className="flex items-center gap-2 p-2 text-xs text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" />
                    <span>Nova is thinking...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
