import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const DATABASE_URL = process.env.DATABASE_URL;

function sortProblemsNumerically(problems: any[]) {
  return problems.sort((a: any, b: any) => {
    const numA = parseInt((a.problemId || "").replace(/\D/g, ""), 10) || 0;
    const numB = parseInt((b.problemId || "").replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawInputId = body.problemId || "P000001";
    const userId = (body.userId || "default_user").toString().trim().toLowerCase();
    const currentId = rawInputId === "medication-reminder" ? "P000001" : rawInputId;

    if (!DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    }

    const client = new MongoClient(DATABASE_URL);
    await client.connect();

    const db = client.db();
    const problemsCollection = db.collection("problems");
    const completionsCollection = db.collection("problem_completions");

    try {
      await completionsCollection.createIndex(
        { userId: 1, problemId: 1 },
        { unique: true, background: true }
      );
    } catch (idxErr) {
      console.warn("[problem_completions] Index warning:", idxErr);
    }

    // Mark current problem completed for THIS user only
    await completionsCollection.updateOne(
      { userId, problemId: currentId },
      {
        $set: {
          userId,
          problemId: currentId,
          status: "completed",
          completedAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (rawInputId === "medication-reminder") {
      await completionsCollection.updateOne(
        { userId, problemId: "medication-reminder" },
        {
          $set: {
            userId,
            problemId: "medication-reminder",
            status: "completed",
            completedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    let completedProblem: any = await problemsCollection.findOne({ problemId: currentId });
    if (!completedProblem && (currentId === "P000001" || rawInputId === "medication-reminder")) {
      completedProblem = {
        problemId: "P000001",
        title:
          "Why do freelancers ghost projects after partial payments without accountability systems?",
      };
    }

    // Only this user's completions count toward next-problem selection
    const completedDocs = await completionsCollection
      .find({ userId }, { projection: { problemId: 1 } })
      .toArray();
    const completedSet = new Set(completedDocs.map((d: any) => d.problemId as string));
    completedSet.add(currentId);
    completedSet.add(rawInputId);
    if (currentId === "P000001") completedSet.add("medication-reminder");

    const allProblems = await problemsCollection
      .find({}, { projection: { problemId: 1, title: 1, category: 1, learning: 1, difficulty: 1 } })
      .toArray();
    sortProblemsNumerically(allProblems);

    const currentNum = parseInt((currentId || "").replace(/\D/g, ""), 10) || 0;

    // 1. Prefer immediate numerical successor (P000001 -> P000002 -> P000003)
    let nextProblemDoc: any = allProblems.find((prob: any) => {
      const num = parseInt((prob.problemId || "").replace(/\D/g, ""), 10) || 0;
      return num === currentNum + 1;
    });

    // 2. Fallback: first uncompleted problem after current
    if (!nextProblemDoc) {
      nextProblemDoc = allProblems.find((prob: any) => {
        const num = parseInt((prob.problemId || "").replace(/\D/g, ""), 10) || 0;
        return num > currentNum && !completedSet.has(prob.problemId);
      });
    }

    // 3. Fallback: first uncompleted problem overall
    if (!nextProblemDoc) {
      nextProblemDoc = allProblems.find((prob: any) => !completedSet.has(prob.problemId));
    }

    await client.close();

    if (
      nextProblemDoc &&
      (nextProblemDoc.problemId === currentId || nextProblemDoc.problemId === rawInputId)
    ) {
      return NextResponse.json(
        { error: "Invalid next problem: nextProblemId cannot equal currentProblemId" },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.log(`\n================ [JOURNEY COMPLETE] ================`);
      console.log(`USER:               ${userId}`);
      console.log(`COMPLETED:          ${currentId}`);
      console.log(
        `NEXT:               ${
          nextProblemDoc
            ? `${nextProblemDoc.problemId} - ${nextProblemDoc.title}`
            : "NONE (All Completed)"
        }`
      );
      console.log(`====================================================\n`);
    }

    const nextProblemData = nextProblemDoc
      ? {
          problemId: nextProblemDoc.problemId,
          title: nextProblemDoc.title,
          category: nextProblemDoc.category || "Product Challenge",
          level:
            nextProblemDoc.learning?.level ||
            nextProblemDoc.difficulty ||
            null,
        }
      : null;

    return NextResponse.json({
      success: true,
      completedProblem: {
        problemId: currentId,
        title: completedProblem ? completedProblem.title : "Product Challenge",
      },
      nextProblem: nextProblemData,
      journeyComplete: !nextProblemDoc,
    });
  } catch (err: any) {
    console.error("Error in /api/journey/complete:", err);
    return NextResponse.json(
      { error: err.message || "Failed to complete journey" },
      { status: 500 }
    );
  }
}
