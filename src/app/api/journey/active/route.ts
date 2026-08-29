import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const DATABASE_URL = process.env.DATABASE_URL;

export async function GET(req: Request) {
  try {
    if (!DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const userId = (searchParams.get("userId") || "default_user").toString().trim().toLowerCase();

    const client = new MongoClient(DATABASE_URL);
    await client.connect();

    const db = client.db();
    const problemsCollection = db.collection("problems");
    const completionsCollection = db.collection("problem_completions");
    const userJourneysCollection = db.collection("user_journeys");

    // 1. Fetch completed problem IDs for THIS user
    const completedDocs = await completionsCollection
      .find({ userId }, { projection: { problemId: 1 } })
      .toArray();
    const completedSet = new Set(completedDocs.map((d: any) => d.problemId as string));

    // 2. Fetch all problem metadata sorted numerically (P000001, P000002, etc.)
    const allProblems = await problemsCollection
      .find({}, { projection: { problemId: 1, title: 1, category: 1, learning: 1, difficulty: 1 } })
      .toArray();

    allProblems.sort((a: any, b: any) => {
      const numA = parseInt((a.problemId || "").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt((b.problemId || "").replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

    const problemsMap = new Map<string, any>();
    allProblems.forEach((p: any) => problemsMap.set(p.problemId, p));

    // 3. Search user_journeys for active in_progress journey for THIS user
    const activeJourneys = await userJourneysCollection
      .find({ userId, status: "in_progress" })
      .sort({ updatedAt: -1, lastActivityAt: -1 })
      .toArray();

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
      resultStep = typeof unfinishedDoc.currentPhase === "number" ? unfinishedDoc.currentPhase : 1;
      isUnfinished = true;
      metaDoc = problemsMap.get(resultProblemId);
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

    await client.close();

    if (!resultProblemId || !metaDoc) {
      return NextResponse.json({
        empty: true,
        problemId: null,
        message: "No problems available yet.",
      });
    }

    return NextResponse.json({
      empty: false,
      problemId: resultProblemId,
      currentPhase: resultStep,
      isUnfinished,
      status: isUnfinished ? "in_progress" : "not_started",
      title: metaDoc.title || "Product Challenge",
      category: metaDoc.category || "Product Challenge",
      level: metaDoc.learning?.level || metaDoc.difficulty || null,
    });
  } catch (err: any) {
    console.error("Error in /api/journey/active:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
