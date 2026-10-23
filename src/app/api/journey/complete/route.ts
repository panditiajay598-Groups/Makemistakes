import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  sortProblemsNumerically,
  parseProblemNumber,
  normalizeProblemId,
} from "@/lib/problemId";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawInputId = body.problemId || "P000001";
    const userId = (body.userId || "default_user").toString().trim().toLowerCase();
    const currentId = normalizeProblemId(rawInputId);

    if (!process.env.DATABASE_URL) {
      return applyNoStoreHeaders(
        NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 })
      );
    }

    const db = await getDb();
    const problemsCollection = db.collection("problems");
    const completionsCollection = db.collection("problem_completions");


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

    const [rawCompletedProblem, completedDocs, allProblems] = await Promise.all([
      problemsCollection.findOne({ problemId: currentId }),
      completionsCollection
        .find({ userId }, { projection: { problemId: 1 } })
        .toArray(),
      problemsCollection
        .find({}, { projection: { problemId: 1, title: 1, category: 1, learning: 1, difficulty: 1 } })
        .toArray(),
    ]);

    let completedProblem: any = rawCompletedProblem;
    if (!completedProblem && (currentId === "P000001" || rawInputId === "medication-reminder")) {
      completedProblem = {
        problemId: "P000001",
        title:
          "Why do freelancers ghost projects after partial payments without accountability systems?",
      };
    }

    // Only this user's completions count toward next-problem selection
    const completedSet = new Set(completedDocs.map((d: any) => d.problemId as string));
    completedSet.add(currentId);
    completedSet.add(rawInputId);
    if (currentId === "P000001") completedSet.add("medication-reminder");

    sortProblemsNumerically(allProblems);

    const currentNum = parseProblemNumber(currentId);

    // 1. Prefer immediate numerical successor (P000001 -> P000002 -> P000003)
    let nextProblemDoc: any = allProblems.find((prob: any) => {
      const num = parseProblemNumber(prob.problemId);
      return num === currentNum + 1;
    });

    // 2. Fallback: first uncompleted problem after current
    if (!nextProblemDoc) {
      nextProblemDoc = allProblems.find((prob: any) => {
        const num = parseProblemNumber(prob.problemId);
        return num > currentNum && !completedSet.has(prob.problemId);
      });
    }

    // 3. Fallback: first uncompleted problem overall
    if (!nextProblemDoc) {
      nextProblemDoc = allProblems.find((prob: any) => !completedSet.has(prob.problemId));
    }

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

    return applyNoStoreHeaders(
      NextResponse.json({
        success: true,
        completedProblem: {
          problemId: currentId,
          title: completedProblem ? completedProblem.title : "Product Challenge",
        },
        nextProblem: nextProblemData,
        journeyComplete: !nextProblemDoc,
      })
    );
  } catch (err: any) {
    console.error("Error in /api/journey/complete:", err);
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: err.message || "Failed to complete journey" },
        { status: 500 }
      )
    );
  }
}
