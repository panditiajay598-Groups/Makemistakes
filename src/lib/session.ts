import { getMissionStateDetails, getActiveAttempt } from "./attemptsStore";

export interface MissionSession {
  missionId: string;
  missionTitle: string;
  currentStep: number;
  totalSteps: number;
  activeFile: string;
  codeWritten: Record<string, string>;
  aiMessages: Array<{ sender: "user" | "coach"; text: string }>;
  timeSpentSeconds: number;
  lastActive: string; // ISO date string
  verificationStatus: "idle" | "running" | "passed";
}

const SESSION_KEY = "makemistakes_active_mission_session";

export function saveActiveSession(session: Partial<MissionSession>) {
  if (typeof window === "undefined") return;
  try {
    const existing = getActiveSession();
    const updated: MissionSession = {
      missionId: session.missionId ?? existing?.missionId ?? "stop-api-crashing-traffic-spikes",
      missionTitle: session.missionTitle ?? existing?.missionTitle ?? "Stop an API from Crashing Under Traffic Spikes",
      currentStep: session.currentStep ?? existing?.currentStep ?? 1,
      totalSteps: session.totalSteps ?? existing?.totalSteps ?? 8,
      activeFile: session.activeFile ?? existing?.activeFile ?? "limiter.ts",
      codeWritten: session.codeWritten ?? existing?.codeWritten ?? {},
      aiMessages: session.aiMessages ?? existing?.aiMessages ?? [],
      timeSpentSeconds: session.timeSpentSeconds ?? existing?.timeSpentSeconds ?? 0,
      lastActive: new Date().toISOString(),
      verificationStatus: session.verificationStatus ?? existing?.verificationStatus ?? "idle",
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to save active mission session", e);
  }
}

export function getActiveSession(): MissionSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to read active mission session", e);
    return null;
  }
}

export function formatTimeAgo(isoString: string): string {
  if (!isoString) return "Recently";
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function isMissionCompleted(session: MissionSession | null): boolean {
  if (!session) return true;
  return session.currentStep >= session.totalSteps;
}

export function canStartMission(targetMissionId: string): {
  allowed: boolean;
  activeMissionTitle?: string;
  activeMissionId?: string;
  activeAttemptNumber?: number;
} {
  const details = getMissionStateDetails(targetMissionId);

  if (details.status === "Locked" && details.lockedByAttempt) {
    return {
      allowed: false,
      activeMissionTitle: details.lockedByAttempt.missionTitle,
      activeMissionId: details.lockedByAttempt.missionId,
      activeAttemptNumber: details.lockedByAttempt.attemptNumber,
    };
  }

  return { allowed: true };
}

