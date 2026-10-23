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

    const rawLimit = parseInt(searchParams.get("limit") || "20", 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(100, rawLimit) : 20;

    const skip = (page - 1) * limit;

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

    // Execute queries in parallel: unlock evaluation (using shared engine), total count, paginated slice
    const [unlockData, totalCount, rawProblems] = await Promise.all([
      evaluateUserUnlock(db, hasAuthSession ? userFilter : null),
      problemsCollection.countDocuments(query),
      problemsCollection
        .find(query, {
          projection: { quiz: 0, metadata: 0, pdfSource: 0 }
        })
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    const {
      catalogMeta,
      unlockProgress,
      journeysMap,
      completionsSet,
      inProgressCount,
    } = unlockData;

    // Map raw problems to product catalog format
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
        source: p.source || null,
        relatedInformation: p.relatedInformation || null,
        skills: p.skills || [],
        estimatedHours: p.estimatedHours || null,
        userStatus,
        completedPhases,
        currentPhase,
        totalPhases: 8,
        isLocked,
      };
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;
    const hasMore = page < totalPages;

    const response = NextResponse.json({
      success: true,
      authenticated: hasAuthSession,
      totalCount,
      page,
      limit,
      totalPages,
      hasMore,
      products,
      categories: catalogMeta.categories,
      difficulties: catalogMeta.difficulties,
      unlockProgress,
      userMetrics: {
        inProgressCount,
        completedCount: completionsSet.size,
      },
    });

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
