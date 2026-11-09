import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/authSession";
import { evaluateUserUnlock, isProblemLocked } from "@/lib/unlockEligibility";
import { applyNoStoreHeaders, applyPublicCatalogCacheHeaders } from "@/lib/cacheHeaders";

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Derive authoritative user identity exclusively from verified server-side session.
    // Client-supplied ?userId query parameters are strictly ignored for authorization.
    const session = await getAuthSession(req);

    const authIdentifiers: string[] = [];
    if (session?.email && session.email.trim()) {
      authIdentifiers.push(session.email.trim().toLowerCase());
    }
    if (session?.userId && session.userId.trim() && !authIdentifiers.includes(session.userId.trim())) {
      authIdentifiers.push(session.userId.trim());
    }

    const hasAuthSession = authIdentifiers.length > 0;
    const userFilter = authIdentifiers.length === 1
      ? { userId: authIdentifiers[0] }
      : { userId: { $in: authIdentifiers } };

    const search = (searchParams.get("search") || "").toString().trim();
    const difficulty = (searchParams.get("difficulty") || "").toString().trim();
    const category = (searchParams.get("category") || "").toString().trim();
    const sort = (searchParams.get("sort") || "numerical_asc").toString().trim();

    // Pagination parameters with safe validation & defaults
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const hasLimitParam = searchParams.has("limit");
    const rawLimit = parseInt(searchParams.get("limit") || "", 10);
    let limit: number;
    if (hasLimitParam && Number.isFinite(rawLimit) && rawLimit > 0) {
      limit = Math.min(100, rawLimit);
    } else {
      // Default to 20 records for all batches (initial load and subsequent Load More)
      limit = 20;
    }

    // Support optional cursor / explicit skip / offset
    const rawSkipParam = searchParams.get("skip") ?? searchParams.get("offset");
    let skip: number;
    if (rawSkipParam !== null) {
      const parsedSkip = parseInt(rawSkipParam, 10);
      skip = Number.isFinite(parsedSkip) && parsedSkip >= 0 ? parsedSkip : 0;
    } else {
      skip = (page - 1) * limit;
    }

    if (!process.env.DATABASE_URL) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "DATABASE_URL is not configured" },
          { status: 500 }
        )
      );
    }

    const db = await getDb();
    const problemsCollection = db.collection("problems");
    const userJourneysCollection = db.collection("user_journeys");
    const completionsCollection = db.collection("problem_completions");

    // Build MongoDB query filter matching existing search & filter semantics
    const conditions: any[] = [];

    if (difficulty && difficulty !== "All") {
      const diffRegex = new RegExp(`^${escapeRegex(difficulty)}$`, "i");
      conditions.push({
        $or: [
          { difficulty: diffRegex },
          { "learning.level": diffRegex },
        ],
      });
    }

    if (category && category !== "All") {
      conditions.push({
        category: new RegExp(`^${escapeRegex(category)}$`, "i"),
      });
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");
      conditions.push({
        $or: [
          { problemId: searchRegex },
          { title: searchRegex },
          { problemStatement: searchRegex },
          { description: searchRegex },
          { problemDescription: searchRegex },
          { category: searchRegex },
        ],
      });
    }

    const query = conditions.length === 0
      ? {}
      : conditions.length === 1
      ? conditions[0]
      : { $and: conditions };

    // Deterministic sorting with stable tie-breaker
    let sortObj: Record<string, 1 | -1> = { problemId: 1 };
    if (sort === "numerical_desc") {
      sortObj = { problemId: -1 };
    } else if (sort === "newest") {
      sortObj = { createdAt: -1, problemId: 1 };
    } else if (sort === "oldest") {
      sortObj = { createdAt: 1, problemId: 1 };
    }

    const startTime = performance.now();

    // Execute queries in parallel: unlock evaluation (using shared engine), total count, paginated slice
    // Fetch limit + 1 items to determine with exact precision whether another page exists
    const dbStartTime = performance.now();
    const [unlockData, totalCount, rawProblemsWithExtra] = await Promise.all([
      evaluateUserUnlock(db, hasAuthSession ? userFilter : null),
      problemsCollection.countDocuments(query),
      problemsCollection
        .find(query, {
          projection: {
            _id: 1,
            problemId: 1,
            title: 1,
            problemStatement: 1,
            problemDescription: 1,
            description: 1,
            category: 1,
            difficulty: 1,
            "learning.level": 1,
            country: 1,
            "source.name": 1,
            "source.type": 1,
            "relatedInformation.context": 1,
            skills: 1,
            estimatedHours: 1,
            createdAt: 1,
          },
        })
        .sort(sortObj)
        .skip(skip)
        .limit(limit + 1)
        .toArray(),
    ]);
    const dbEndTime = performance.now();

    const hasMore = rawProblemsWithExtra.length > limit;
    const rawProblems = hasMore ? rawProblemsWithExtra.slice(0, limit) : rawProblemsWithExtra;

    const {
      catalogMeta,
      unlockProgress,
      journeysMap,
      completionsSet,
      inProgressCount,
    } = unlockData;

    // Map raw problems to product catalog format with lean payload fields
    const products = rawProblems.map((p: any) => {
      const pid = p.problemId;
      const journey = journeysMap.get(pid);
      const isCompleted =
        completionsSet.has(pid) ||
        journey?.status === "completed" ||
        (typeof journey?.currentPhase === "number" && journey.currentPhase > 8);

      let userStatus: "not_started" | "in_progress" | "completed" = "not_started";
      let completedPhases = 0;
      let currentPhase = 1;

      if (isCompleted) {
        userStatus = "completed";
        completedPhases = 8;
        currentPhase = 8;
      } else if (journey) {
        userStatus = "in_progress";
        currentPhase = typeof journey.currentPhase === "number" ? journey.currentPhase : 1;
        completedPhases = Math.max(0, Math.min(8, currentPhase - 1));
      }

      const pDiff = p.difficulty || p.learning?.level || null;
      const isLocked = isProblemLocked({
        difficulty: pDiff,
        advancedUnlocked: unlockProgress.advancedUnlocked,
        userStatus,
      });

      return {
        problemId: pid,
        title: p.title || p.problemStatement || `Problem ${pid}`,
        problemStatement: p.problemStatement || p.title || "",
        description:
          p.problemDescription ||
          p.description ||
          p.relatedInformation?.context ||
          "Real-world product engineering challenge on MakeMistakes OS.",
        category: p.category || "Product Challenge",
        difficulty: pDiff,
        country: p.country || null,
        source: p.source ? { name: p.source.name, type: p.source.type } : null,
        relatedInformation: p.relatedInformation?.context
          ? { context: p.relatedInformation.context }
          : null,
        skills: Array.isArray(p.skills) ? p.skills : [],
        estimatedHours: typeof p.estimatedHours === "number" ? p.estimatedHours : null,
        userStatus,
        completedPhases,
        currentPhase,
        totalPhases: 8,
        isLocked,
      };
    });

    let totalPages = 1;
    if (totalCount > 0) {
      totalPages = Math.ceil(totalCount / limit) || 1;
    }

    const totalEndTime = performance.now();
    const dbDurationMs = Math.round((dbEndTime - dbStartTime) * 100) / 100;
    const totalDurationMs = Math.round((totalEndTime - startTime) * 100) / 100;

    const response = NextResponse.json({
      success: true,
      authenticated: hasAuthSession,
      totalCount,
      page,
      limit,
      skip,
      totalPages,
      hasMore,
      products,
      data: products,
      pagination: {
        page,
        limit,
        skip,
        totalCount,
        totalPages,
        hasMore,
      },
      categories: catalogMeta.categories,
      difficulties: catalogMeta.difficulties,
      unlockProgress,
      userMetrics: {
        inProgressCount,
        completedCount: completionsSet.size,
      },
      timing: {
        dbDurationMs,
        totalDurationMs,
      },
    });

    response.headers.set(
      "Server-Timing",
      `db;dur=${dbDurationMs};desc="Database Query", total;dur=${totalDurationMs};desc="Total Route"`
    );

    return hasAuthSession
      ? applyNoStoreHeaders(response)
      : applyPublicCatalogCacheHeaders(response);
  } catch (err: any) {
    console.error("Error in GET /api/products:", err);
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: err.message || "Failed to load product catalog" },
        { status: 500 }
      )
    );
  }
}
