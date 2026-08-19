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

    // Only THIS user's completed problems
    const completedDocs = await completionsCollection
      .find({ userId }, { projection: { problemId: 1 } })
      .toArray();
    const completedSet = new Set(completedDocs.map((d: any) => d.problemId as string));

    const allProblems = await problemsCollection
      .find({}, { projection: { problemId: 1, title: 1, category: 1, learning: 1, difficulty: 1 } })
      .toArray();

    allProblems.sort((a: any, b: any) => {
      const numA = parseInt((a.problemId || "").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt((b.problemId || "").replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

    let activeDoc: any = null;
    for (const prob of allProblems) {
      if (!completedSet.has(prob.problemId)) {
        activeDoc = prob;
        break;
      }
    }

    await client.close();

    if (!activeDoc) {
      return NextResponse.json({
        empty: true,
        problemId: null,
        message:
          "No problems available yet. Your next problem will appear here once the Problem Library is loaded.",
      });
    }

    return NextResponse.json({
      empty: false,
      problemId: activeDoc.problemId,
      title: activeDoc.title,
      category: activeDoc.category || "Product Challenge",
      level: activeDoc.learning?.level || activeDoc.difficulty || null,
    });
  } catch (err: any) {
    console.error("Error in /api/journey/active:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
