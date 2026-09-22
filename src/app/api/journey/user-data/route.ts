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
        status: "in_progress",
        phases: DEFAULT_PHASES,
      });
    }

    const mergedPhases = {
      ...DEFAULT_PHASES,
      ...(journey.phases || {}),
    };

    const isDiscoverDone = Boolean(mergedPhases?.discover?.completed);
    const isResearchDone = isDiscoverDone && Array.isArray(mergedPhases?.research?.sources) && mergedPhases.research.sources.length > 0;
    const isDesignDone = isResearchDone && Boolean(mergedPhases?.design?.productGoal?.trim());
    const isPlanDone = isDesignDone && Array.isArray(mergedPhases?.plan?.modules) && mergedPhases.plan.modules.length > 0;

    let maxAllowedPhase = 1;
    if (isPlanDone) maxAllowedPhase = 5;
    else if (isDesignDone) maxAllowedPhase = 4;
    else if (isResearchDone) maxAllowedPhase = 3;
    else if (isDiscoverDone) maxAllowedPhase = 2;

    const rawPhase = typeof journey.currentPhase === "number" ? journey.currentPhase : 1;
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
      const isDiscoverDone = Boolean(currentPhases?.discover?.completed);
      const isResearchDone = isDiscoverDone && Array.isArray(currentPhases?.research?.sources) && currentPhases.research.sources.length > 0;
      const isDesignDone = isResearchDone && Boolean(currentPhases?.design?.productGoal?.trim());
      const isPlanDone = isDesignDone && Array.isArray(currentPhases?.plan?.modules) && currentPhases.plan.modules.length > 0;

      let maxPhase = 1;
      if (isPlanDone) maxPhase = 5;
      else if (isDesignDone) maxPhase = 4;
      else if (isResearchDone) maxPhase = 3;
      else if (isDiscoverDone) maxPhase = 2;

      setFields.currentPhase = Math.min(currentPhase, maxPhase);
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
