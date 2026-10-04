import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const DATABASE_URL = process.env.DATABASE_URL;

const COLLECTION_NAME = "user_journeys";
let indexEnsured = false;

async function getCollection() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const client = new MongoClient(DATABASE_URL);
  await client.connect();
  const db = client.db();
  const collection = db.collection(COLLECTION_NAME);

  if (!indexEnsured) {
    try {
      await collection.createIndex(
        { userId: 1, problemId: 1 },
        { unique: true, background: true }
      );
      indexEnsured = true;
    } catch (idxErr) {
      console.warn("[user_journeys] Index creation warning:", idxErr);
    }
  }

  return { client, collection };
}

/** Default empty structure for all 8 journey phases */
const DEFAULT_PHASES = {
  discover: { quizAnswers: {}, score: 0, completed: false },
  research: { sources: [], answers: {}, checklist: [] },
  design: {
    productGoal: "",
    selectedUsers: [],
    customUserRole: "",
    userImportance: "",
    v1Features: [],
    screens: [],
    journeySteps: [],
    sketches: [],
    designDecisions: "",
  },
  plan: {
    modules: [],
    techDecisions: {},
    dbEntities: [],
    flowSteps: [],
    roadmapPhases: [],
    risksText: "",
  },
  build: { status: "not_started" },
  test: {
    whatValidating: "",
    goalOfTest: "",
    scenarios: [],
    device: "iPhone 13",
    browser: "Chrome",
    operatingSystem: "iOS 17",
    networkCondition: "WiFi (High Speed)",
    testingMethod: "Manual Testing",
    improvementsFound: "",
    finalSummary: "",
  },
  deploy: {
    githubRepoUrl: "",
    defaultBranch: "main",
    commitMessage: "",
    hostingPlatform: "",
    deploymentMethod: "",
    liveUrl: "",
    environmentType: "Production",
    regionDataCenter: "",
    envVariablesText: "",
    buildCommand: "npm run build",
    startCommand: "npm start",
    installCommand: "npm install",
    deploymentNotesText: "",
    checklist: [],
  },
  improve: {
    backlogItems: [],
    biggestMistake: "",
    keyLesson: "",
    futureVision: "",
  },
  validate: {
    liveUrl: "",
    platform: "Vercel",
    deploymentStatus: "pending",
    validationChecks: [],
    validationNotes: "",
    verifiedAt: null,
  },
};

/**
 * Compute the maximum unlocked phase based on completed phase data and saved progress.
 * Uses non-cascading logic so that higher phase data automatically unlocks all preceding phases.
 */
export function computeMaxAllowedPhase(phases: any, currentPhase?: number | null): number {
  const p = phases || {};
  const isValidateDone = Boolean(p?.validate?.liveUrl);
  const isDeployDone = isValidateDone || Boolean(p?.deploy?.githubRepoUrl) || Boolean(p?.deploy?.connected);
  const isTestDone = isDeployDone || Boolean(p?.test?.finalSummary?.trim()) || (Array.isArray(p?.test?.scenarios) && p.test.scenarios.length > 0);
  const isBuildDone = isTestDone || p?.build?.status === "completed" || Boolean(p?.build?.completed);
  const isPlanDone = isBuildDone || (Array.isArray(p?.plan?.modules) && p.plan.modules.length > 0);
  const isDesignDone = isPlanDone || Boolean(p?.design?.productGoal?.trim());
  const isResearchDone = isDesignDone || (Array.isArray(p?.research?.sources) && p.research.sources.length > 0);
  const isDiscoverDone = isResearchDone || Boolean(p?.discover?.completed);

  let maxAllowed = 1;
  if (isDeployDone) maxAllowed = 8;
  else if (isTestDone) maxAllowed = 7;
  else if (isBuildDone) maxAllowed = 6;
  else if (isPlanDone) maxAllowed = 5;
  else if (isDesignDone) maxAllowed = 4;
  else if (isResearchDone) maxAllowed = 3;
  else if (isDiscoverDone) maxAllowed = 2;

  // Preserve any higher unlocked phase recorded in the database
  if (typeof currentPhase === "number" && currentPhase >= 1 && currentPhase <= 9) {
    maxAllowed = Math.max(maxAllowed, currentPhase);
  }

  return Math.max(1, Math.min(8, maxAllowed));
}

/** GET — Load user's journey data strictly scoped by userId + problemId */
export async function GET(req: Request) {
  let client: MongoClient | null = null;
  try {
    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") || "default_user").toString().trim().toLowerCase();
    const problemId = (searchParams.get("problemId") || "").toString().trim();

    if (!problemId) {
      return NextResponse.json({ error: "Missing required 'problemId' parameter" }, { status: 400 });
    }

    const res = await getCollection();
    client = res.client;
    const journey = await res.collection.findOne({ userId, problemId });
    await client.close();

    if (!journey) {
      return NextResponse.json({
        exists: false,
        userId,
        problemId,
        currentPhase: 1,
        maxAllowedPhase: 1,
        status: "in_progress",
        phases: DEFAULT_PHASES,
      });
    }

    const mergedPhases = {
      ...DEFAULT_PHASES,
      ...(journey.phases || {}),
    };

    const maxAllowedPhase = computeMaxAllowedPhase(mergedPhases, journey.currentPhase);
    const rawPhase = typeof journey.currentPhase === "number" && journey.currentPhase >= 1 ? journey.currentPhase : 1;
    const safeCurrentPhase = Math.min(rawPhase, maxAllowedPhase);

    return NextResponse.json({
      exists: true,
      userId: journey.userId,
      problemId: journey.problemId,
      currentPhase: safeCurrentPhase,
      maxAllowedPhase,
      status: journey.status || "in_progress",
      phases: mergedPhases,
      lastSavedAt: journey.lastSavedAt || journey.updatedAt,
      lastActivityAt: journey.lastActivityAt || journey.updatedAt,
      updatedAt: journey.updatedAt,
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in GET /api/journey/user-data:", err);
    return NextResponse.json({ error: err.message || "Failed to load journey data" }, { status: 500 });
  }
}

/** POST — Save/upsert phase-specific data strictly scoped by userId + problemId */
export async function POST(req: Request) {
  let client: MongoClient | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const userId = (body.userId || "default_user").toString().trim().toLowerCase();
    const problemId = (body.problemId || "").toString().trim();
    const phase = (body.phase || "").toString().trim().toLowerCase();
    const currentPhase = typeof body.currentPhase === "number" ? body.currentPhase : (body.currentPhase ? parseInt(body.currentPhase, 10) : null);
    const data = body.data;
    const customStatus = body.status;

    if (!problemId) {
      return NextResponse.json(
        { error: "Missing required 'problemId' parameter" },
        { status: 400 }
      );
    }

    const res = await getCollection();
    client = res.client;

    const now = new Date();
    const setFields: Record<string, any> = {
      userId,
      problemId,
      lastSavedAt: now,
      lastActivityAt: now,
      updatedAt: now,
    };

    if (phase && data !== undefined) {
      setFields[`phases.${phase}`] = data;
    }

    if (currentPhase && currentPhase >= 1 && currentPhase <= 9) {
      const existingDoc = await res.collection.findOne({ userId, problemId });
      const currentPhases = {
        ...(existingDoc?.phases || {}),
        ...(phase && data !== undefined ? { [phase]: data } : {}),
      };

      const maxPhase = computeMaxAllowedPhase(currentPhases, existingDoc?.currentPhase);

      // Protect against progress reset: never downgrade currentPhase unless explicitly requested with reset: true
      const isExplicitReset = Boolean(body.reset);
      const safeCurrentPhase = isExplicitReset
        ? currentPhase
        : Math.max(existingDoc?.currentPhase || 1, Math.min(currentPhase, maxPhase));

      setFields.currentPhase = safeCurrentPhase;
    }

    if (customStatus) {
      setFields.status = customStatus;
    } else {
      setFields.status = "in_progress";
    }

    const updateQuery = {
      $set: setFields,
      $setOnInsert: {
        createdAt: now,
      },
    };

    const result = await res.collection.updateOne(
      { userId, problemId },
      updateQuery,
      { upsert: true }
    );

    await client.close();

    return NextResponse.json({
      success: true,
      userId,
      problemId,
      phase: phase || null,
      currentPhase: currentPhase || null,
      lastSavedAt: now,
      updatedAt: now,
      upserted: result.upsertedCount > 0,
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in POST /api/journey/user-data:", err);
    return NextResponse.json({ error: err.message || "Failed to save journey data" }, { status: 500 });
  }
}
