import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sortProblemsNumerically } from "@/lib/problemId";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";

export async function GET(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) {
      return applyNoStoreHeaders(
        NextResponse.json({ error: "Authentication required" }, { status: 401 })
      );
    }

    if (!process.env.DATABASE_URL) {
      return applyNoStoreHeaders(
        NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
      );
    }

    const userIdFilter = { $in: identity.userIds };

    const db = await getDb();
    const problemsCollection = db.collection("problems");
    const completionsCollection = db.collection("problem_completions");
    const userJourneysCollection = db.collection("user_journeys");

    // Fetch user completions, catalog problems, and active journeys in parallel
    const [completedDocs, allProblems, activeJourneys] = await Promise.all([
      completionsCollection
        .find(userIdFilter, { projection: { problemId: 1 } })
        .toArray(),
      problemsCollection
        .find({}, { projection: { problemId: 1, title: 1, category: 1, learning: 1, difficulty: 1 } })
        .toArray(),
      userJourneysCollection
        .find({ ...userIdFilter, status: "in_progress" })
        .sort({ updatedAt: -1, lastActivityAt: -1 })
        .toArray(),
    ]);

    const completedSet = new Set(completedDocs.map((d: any) => d.problemId as string));

    sortProblemsNumerically(allProblems);

    const problemsMap = new Map<string, any>();
    allProblems.forEach((p: any) => problemsMap.set(p.problemId, p));

    let unfinishedDoc: any = null;
    for (const j of activeJourneys) {
      if (!completedSet.has(j.problemId)) {
        unfinishedDoc = j;
        break;
      }
    }

    let resultProblemId: string | null = null;
    let resultStep: number = 1;
    let isUnfinished: boolean = false;
    let metaDoc: any = null;

    if (unfinishedDoc) {
      resultProblemId = unfinishedDoc.problemId;
      const isDiscoverDone = Boolean(unfinishedDoc.phases?.discover?.completed);
      const isResearchDone = isDiscoverDone && Array.isArray(unfinishedDoc.phases?.research?.sources) && unfinishedDoc.phases.research.sources.length > 0;
      const isDesignDone = isResearchDone && Boolean(unfinishedDoc.phases?.design?.productGoal?.trim());
      const isPlanDone = isDesignDone && Array.isArray(unfinishedDoc.phases?.plan?.modules) && unfinishedDoc.phases.plan.modules.length > 0;

      let maxAllowedStep = 1;
      if (isPlanDone) maxAllowedStep = 5;
      else if (isDesignDone) maxAllowedStep = 4;
      else if (isResearchDone) maxAllowedStep = 3;
      else if (isDiscoverDone) maxAllowedStep = 2;

      const rawStep = typeof unfinishedDoc.currentPhase === "number" ? unfinishedDoc.currentPhase : 1;
      resultStep = Math.min(rawStep, maxAllowedStep);
      isUnfinished = true;
      metaDoc = problemsMap.get(unfinishedDoc.problemId);
    } else {
      // Find the first uncompleted problem statement
      for (const prob of allProblems) {
        if (!completedSet.has(prob.problemId)) {
          metaDoc = prob;
          resultProblemId = prob.problemId;
          resultStep = 1;
          isUnfinished = false;
          break;
        }
      }
    }

    if (!resultProblemId || !metaDoc) {
      return applyNoStoreHeaders(
        NextResponse.json({
          empty: true,
          problemId: null,
          message: "No problems available yet.",
        })
      );
    }

    return applyNoStoreHeaders(
      NextResponse.json({
        empty: false,
        problemId: resultProblemId,
        currentPhase: resultStep,
        isUnfinished,
        status: isUnfinished ? "in_progress" : "not_started",
        title: metaDoc.title || "Product Challenge",
        category: metaDoc.category || "Product Challenge",
        level: metaDoc.learning?.level || metaDoc.difficulty || null,
      })
    );
  } catch (err: any) {
    console.error("Error in /api/journey/active:", err);
    return applyNoStoreHeaders(NextResponse.json({ error: err.message }, { status: 500 }));
  }
}
