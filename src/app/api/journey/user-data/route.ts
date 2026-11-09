import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";
import { getAuthSession } from "@/lib/authSession";
import { redactGithubAccessToken } from "@/lib/security/githubOAuth";
import { migrateStoredJourneyPhase } from "@/lib/nova/projectProgress";

const COLLECTION_NAME = "user_journeys";
async function getCollection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const db = await getDb();
  const collection = db.collection(COLLECTION_NAME);

  return { collection };
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
 *
 * Uses non-cascading logic so that higher phase data automatically unlocks all preceding
 * phases. The approved nine-phase sequence is:
 *   1 Discover, 2 Research, 3 Design, 4 Plan, 5 Build,
 *   6 Test, 7 Push to GitHub, 8 Deploy, 9 Validate
 */
export function computeMaxAllowedPhase(phases: any, currentPhase?: number | null): number {
  const p = phases || {};
  const isValidateDone = Boolean(p?.validate?.liveUrl);
  const isDeployDone =
    isValidateDone ||
    Boolean(p?.deploy?.liveUrl) ||
    Boolean(p?.deploy?.deploymentStatus && p.deploy.deploymentStatus !== "pending");
  const isPushDone =
    isDeployDone ||
    Boolean(p?.deploy?.githubRepoUrl) ||
    Boolean(p?.deploy?.isPushed) ||
    Boolean(p?.deploy?.connected);
  const isTestDone = isPushDone || Boolean(p?.test?.finalSummary?.trim()) || (Array.isArray(p?.test?.scenarios) && p.test.scenarios.length > 0);
  const isBuildDone = isTestDone || p?.build?.status === "completed" || Boolean(p?.build?.completed);
  const isPlanDone = isBuildDone || (Array.isArray(p?.plan?.modules) && p.plan.modules.length > 0);
  const isDesignDone = isPlanDone || Boolean(p?.design?.productGoal?.trim());
  const isResearchDone = isDesignDone || (Array.isArray(p?.research?.sources) && p.research.sources.length > 0);
  const isDiscoverDone = isResearchDone || Boolean(p?.discover?.completed);

  let maxAllowed = 1;
  if (isValidateDone) maxAllowed = 9;
  else if (isDeployDone) maxAllowed = 8;
  else if (isPushDone) maxAllowed = 7;
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

  return Math.max(1, Math.min(9, maxAllowed));
}

/** GET — Load user's journey data strictly scoped by verified session + problemId */
export async function GET(req: Request) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "Unauthorized. Authentication session required." },
          { status: 401 }
        )
      );
    }

    const { searchParams } = new URL(req.url);
    const problemId = (searchParams.get("problemId") || "").toString().trim();

    if (!problemId) {
      return applyNoStoreHeaders(
        NextResponse.json({ error: "Missing required 'problemId' parameter" }, { status: 400 })
      );
    }

    const authIdentifiers: string[] = [];
    if (session.email?.trim()) {
      authIdentifiers.push(session.email.trim().toLowerCase());
    }
    if (session.userId?.trim() && !authIdentifiers.includes(session.userId.trim())) {
      authIdentifiers.push(session.userId.trim());
    }

    const primaryUserId = authIdentifiers[0] || session.userId;
    const userQuery = authIdentifiers.length === 1
      ? { userId: authIdentifiers[0] }
      : { userId: { $in: authIdentifiers } };

    const res = await getCollection();
    const journey = await res.collection.findOne({ ...userQuery, problemId });

    if (!journey) {
      return applyNoStoreHeaders(
        NextResponse.json({
          exists: false,
          userId: primaryUserId,
          problemId,
          currentPhase: 1,
          maxAllowedPhase: 1,
          status: "in_progress",
          phases: DEFAULT_PHASES,
        })
      );
    }

    const mergedPhases = {
      ...DEFAULT_PHASES,
      ...(journey.phases || {}),
    };

    const rawPhase = typeof journey.currentPhase === "number" && journey.currentPhase >= 1 ? journey.currentPhase : 1;
    const migratedPhase = migrateStoredJourneyPhase(rawPhase, mergedPhases);
    const maxAllowedPhase = computeMaxAllowedPhase(mergedPhases, migratedPhase);
    const safeCurrentPhase = Math.min(migratedPhase, maxAllowedPhase);

    return applyNoStoreHeaders(
      NextResponse.json({
        exists: true,
        userId: journey.userId || primaryUserId,
        problemId: journey.problemId,
        currentPhase: safeCurrentPhase,
        maxAllowedPhase,
        status: journey.status || "in_progress",
        phases: redactGithubAccessToken(mergedPhases),
        lastSavedAt: journey.lastSavedAt || journey.updatedAt,
        lastActivityAt: journey.lastActivityAt || journey.updatedAt,
        updatedAt: journey.updatedAt,
      })
    );
  } catch (err: any) {
    console.error("Error in GET /api/journey/user-data:", err);
    return applyNoStoreHeaders(
      NextResponse.json({ error: err.message || "Failed to load journey data" }, { status: 500 })
    );
  }
}

/** POST — Save/upsert phase-specific data strictly scoped by verified session + problemId */
export async function POST(req: Request) {
  try {
    const session = await getAuthSession(req);
    if (!session) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "Unauthorized. Authentication session required." },
          { status: 401 }
        )
      );
    }

    const authIdentifiers: string[] = [];
    if (session.email?.trim()) {
      authIdentifiers.push(session.email.trim().toLowerCase());
    }
    if (session.userId?.trim() && !authIdentifiers.includes(session.userId.trim())) {
      authIdentifiers.push(session.userId.trim());
    }

    const primaryUserId = authIdentifiers[0] || session.userId;
    const userQuery = authIdentifiers.length === 1
      ? { userId: authIdentifiers[0] }
      : { userId: { $in: authIdentifiers } };

    const body = await req.json().catch(() => ({}));
    const problemId = (body.problemId || "").toString().trim();
    const phase = (body.phase || "").toString().trim().toLowerCase();
    const currentPhase = typeof body.currentPhase === "number" ? body.currentPhase : (body.currentPhase ? parseInt(body.currentPhase, 10) : null);
    const submittedData = body.data;
    const customStatus = body.status;

    if (!problemId) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "Missing required 'problemId' parameter" },
          { status: 400 }
        )
      );
    }

    const res = await getCollection();
    const existingDoc = await res.collection.findOne({ ...userQuery, problemId });
    const targetUserId = existingDoc?.userId || primaryUserId;

    const now = new Date();
    const setFields: Record<string, any> = {
      userId: targetUserId,
      problemId,
      lastSavedAt: now,
      lastActivityAt: now,
      updatedAt: now,
    };

    const allowedPhases = new Set([
      "discover",
      "research",
      "design",
      "plan",
      "build",
      "test",
      "deploy",
      "improve",
      "validate",
    ]);
    if (phase && !allowedPhases.has(phase)) {
      return applyNoStoreHeaders(
        NextResponse.json({ error: "Invalid journey phase" }, { status: 400 })
      );
    }

    let data = submittedData;
    if (phase === "deploy" && data && typeof data === "object" && !Array.isArray(data)) {
      const safeDeployData = { ...data };
      const protectedDeployFields = [
        "githubAccessToken",
        "githubUsername",
        "githubAvatarUrl",
        "connectedAt",
        "githubRepoUrl",
        "isPushed",
        "pushedAt",
      ];
      for (const field of protectedDeployFields) {
        delete safeDeployData[field];
      }
      const existingDeploy = existingDoc?.phases?.deploy || {};
      for (const field of protectedDeployFields) {
        if (existingDeploy[field] !== undefined) {
          safeDeployData[field] = existingDeploy[field];
        }
      }
      data = {
        ...safeDeployData,
      };
    }

    if (phase && data !== undefined) {
      setFields[`phases.${phase}`] = data;
    }

    if (currentPhase && currentPhase >= 1 && currentPhase <= 9) {
      const currentPhases = {
        ...(existingDoc?.phases || {}),
        ...(phase && data !== undefined ? { [phase]: data } : {}),
      };

      const maxPhase = computeMaxAllowedPhase(
        currentPhases,
        migrateStoredJourneyPhase(existingDoc?.currentPhase, currentPhases)
      );

      // Protect against progress reset: never downgrade currentPhase unless explicitly requested with reset: true
      const isExplicitReset = Boolean(body.reset);
      const safeCurrentPhase = isExplicitReset
        ? currentPhase
        : Math.max(existingDoc?.currentPhase || 1, Math.min(currentPhase, maxPhase));

      setFields.currentPhase = safeCurrentPhase;
    }

    const targetStatus = customStatus || "in_progress";
    setFields.status = targetStatus;

    // Check if the requested write is completely unchanged from existingDoc
    if (existingDoc) {
      const isPhaseUnchanged =
        !phase ||
        data === undefined ||
        JSON.stringify(existingDoc.phases?.[phase]) === JSON.stringify(data);
      const isCurrentPhaseUnchanged =
        !setFields.currentPhase ||
        existingDoc.currentPhase === setFields.currentPhase;
      const isStatusUnchanged = existingDoc.status === targetStatus;

      if (isPhaseUnchanged && isCurrentPhaseUnchanged && isStatusUnchanged) {
        return applyNoStoreHeaders(
          NextResponse.json({
            success: true,
            userId: targetUserId,
            problemId,
            phase: phase || null,
            currentPhase: setFields.currentPhase || existingDoc.currentPhase || 1,
            lastSavedAt: existingDoc.lastSavedAt || existingDoc.updatedAt || now,
            updatedAt: existingDoc.updatedAt || now,
            skippedWrite: true,
          })
        );
      }
    }

    const updateQuery = {
      $set: setFields,
      $setOnInsert: {
        createdAt: now,
      },
    };

    const result = await res.collection.updateOne(
      { userId: targetUserId, problemId },
      updateQuery,
      { upsert: true }
    );

    return applyNoStoreHeaders(
      NextResponse.json({
        success: true,
        userId: targetUserId,
        problemId,
        phase: phase || null,
        currentPhase: setFields.currentPhase || currentPhase || null,
        lastSavedAt: now,
        updatedAt: now,
        upserted: result.upsertedCount > 0,
      })
    );
  } catch (err: any) {
    console.error("Error in POST /api/journey/user-data:", err);
    return applyNoStoreHeaders(
      NextResponse.json({ error: err.message || "Failed to save journey data" }, { status: 500 })
    );
  }
}
