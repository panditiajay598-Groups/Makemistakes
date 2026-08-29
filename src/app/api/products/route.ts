import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const DATABASE_URL = process.env.DATABASE_URL;

export async function GET(req: Request) {
  let client: MongoClient | null = null;
  try {
    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") || "default_user")
      .toString()
      .trim()
      .toLowerCase();
    const search = (searchParams.get("search") || "").toString().trim().toLowerCase();
    const difficulty = (searchParams.get("difficulty") || "").toString().trim();
    const category = (searchParams.get("category") || "").toString().trim();
    const sort = (searchParams.get("sort") || "numerical_asc").toString().trim();

    if (!DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured" },
        { status: 500 }
      );
    }

    client = new MongoClient(DATABASE_URL);
    await client.connect();
    const db = client.db();

    const problemsCollection = db.collection("problems");
    const userJourneysCollection = db.collection("user_journeys");
    const completionsCollection = db.collection("problem_completions");

    // 1. Fetch user's journeys and completions for status resolution
    const userJourneys = await userJourneysCollection.find({ userId }).toArray();
    const completions = await completionsCollection.find({ userId }).toArray();

    const journeysMap = new Map<string, any>();
    userJourneys.forEach((j: any) => {
      if (j.problemId) journeysMap.set(j.problemId, j);
    });

    const completionsSet = new Set<string>();
    completions.forEach((c: any) => {
      if (c.problemId) completionsSet.add(c.problemId);
    });

    // 2. Fetch all problem statement documents from MongoDB
    const allProblems = await problemsCollection.find({}).toArray();

    // Collect totals by difficulty dynamically from DB
    let beginnerTotal = 0;
    let intermediateTotal = 0;
    let advancedTotal = 0;

    let completedBeginner = 0;
    let completedIntermediate = 0;

    const categoriesSet = new Set<string>();
    const difficultiesSet = new Set<string>();

    allProblems.forEach((p: any) => {
      if (p.category && typeof p.category === "string" && p.category.trim()) {
        categoriesSet.add(p.category.trim());
      }

      const diff = p.difficulty || p.learning?.level || "";
      if (diff && typeof diff === "string" && diff.trim()) {
        difficultiesSet.add(diff.trim());
      }

      const pid = p.problemId;
      const journey = journeysMap.get(pid);
      const isCompleted =
        completionsSet.has(pid) ||
        journey?.status === "completed" ||
        (typeof journey?.currentPhase === "number" && journey.currentPhase > 8);

      if (diff === "Beginner") {
        beginnerTotal++;
        if (isCompleted) completedBeginner++;
      } else if (diff === "Intermediate") {
        intermediateTotal++;
        if (isCompleted) completedIntermediate++;
      } else if (diff === "Advanced") {
        advancedTotal++;
      }
    });

    // Calculate required completions using CEIL
    const beginnerRequired = Math.ceil(beginnerTotal * 0.50);
    const intermediateRequired = Math.ceil(intermediateTotal * 0.30);
    const advancedUnlocked =
      completedBeginner >= beginnerRequired && completedIntermediate >= intermediateRequired;

    // 3. Filter problem statements according to search, difficulty, category
    let filtered = allProblems.filter((p: any) => {
      // Search matching (problemId, title, problemStatement, description, category)
      if (search) {
        const pid = (p.problemId || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        const stmt = (p.problemStatement || "").toLowerCase();
        const desc = (p.description || p.problemDescription || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();

        const matchesSearch =
          pid.includes(search) ||
          title.includes(search) ||
          stmt.includes(search) ||
          desc.includes(search) ||
          cat.includes(search);

        if (!matchesSearch) return false;
      }

      // Difficulty matching
      if (difficulty && difficulty !== "All") {
        const pDiff = (p.difficulty || p.learning?.level || "").toLowerCase();
        if (pDiff !== difficulty.toLowerCase()) return false;
      }

      // Category matching
      if (category && category !== "All") {
        const pCat = (p.category || "").toLowerCase();
        if (pCat !== category.toLowerCase()) return false;
      }

      return true;
    });

    // 4. Sort results
    filtered.sort((a: any, b: any) => {
      const numA = parseInt((a.problemId || "").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt((b.problemId || "").replace(/\D/g, ""), 10) || 0;

      if (sort === "numerical_desc") {
        return numB - numA;
      } else if (sort === "newest") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      } else if (sort === "oldest") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      }
      // Default: numerical_asc (P000001, P000002...)
      return numA - numB;
    });

    // 5. Map documents into product catalog objects with user-specific journey status & unlock lock
    const products = filtered.map((p: any) => {
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

      // Advanced problem lock rule: locked if advancedUnlocked is false AND user has not started it
      const isLocked = pDiff === "Advanced" && !advancedUnlocked && userStatus === "not_started";

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

    await client.close();

    return NextResponse.json({
      success: true,
      totalCount: products.length,
      products,
      categories: Array.from(categoriesSet).sort(),
      difficulties: Array.from(difficultiesSet).sort(),
      unlockProgress: {
        completedBeginner,
        beginnerTotal,
        beginnerRequired,
        completedIntermediate,
        intermediateTotal,
        intermediateRequired,
        advancedTotal,
        advancedUnlocked,
      },
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in GET /api/products:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load product catalog" },
      { status: 500 }
    );
  }
}
