import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const DATABASE_URL = process.env.DATABASE_URL;

/** Normalize Mongo problem docs for the Build engine (difficulty / learning / build). */
function toProblemPayload(doc: Record<string, any>) {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    problemId: rest.problemId,
    title: rest.title || "",
    problemStatement: rest.problemStatement || rest.title || "",
    category: rest.category,
    difficulty: rest.difficulty ?? rest.learning?.level ?? null,
    learning: rest.learning ?? (rest.difficulty ? { level: rest.difficulty } : null),
    build: rest.build ?? undefined,
    relatedInformation: rest.relatedInformation,
    quiz: rest.quiz,
    metadata: rest.metadata,
    country: rest.country,
    source: rest.source,
  };
}

export async function GET(req: Request) {
  let client: MongoClient | null = null;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = (searchParams.get("userId") || "").toString().trim().toLowerCase();

    if (!id) {
      return NextResponse.json({ error: "Missing required 'id' parameter" }, { status: 400 });
    }

    if (!DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    }

    client = new MongoClient(DATABASE_URL);
    await client.connect();

    const db = client.db();
    const collection = db.collection("problems");

    const problem: any = await collection.findOne({ problemId: id });

    if (!problem) {
      await client.close();
      return NextResponse.json(
        {
          error: `Problem '${id}' was not found. The Problem Library is currently empty or waiting for problem import.`,
        },
        { status: 404 }
      );
    }

    const diff = problem.difficulty || problem.learning?.level;

    // Check Advanced problem unlock security if user ID is provided and problem is Advanced
    if (diff === "Advanced" && userId) {
      const userJourneysCollection = db.collection("user_journeys");
      const completionsCollection = db.collection("problem_completions");

      // Check if user has already started or completed this specific problem
      const existingJourney = await userJourneysCollection.findOne({ userId, problemId: id });
      const existingCompletion = await completionsCollection.findOne({ userId, problemId: id });

      const hasActiveSession = existingJourney || existingCompletion;

      if (!hasActiveSession) {
        // Calculate user's overall unlock eligibility
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

        const allProblems = await collection.find({}).toArray();

        let beginnerTotal = 0;
        let intermediateTotal = 0;
        let completedBeginner = 0;
        let completedIntermediate = 0;

        allProblems.forEach((p: any) => {
          const pDiff = p.difficulty || p.learning?.level || "";
          const pid = p.problemId;
          const journey = journeysMap.get(pid);
          const isCompleted =
            completionsSet.has(pid) ||
            journey?.status === "completed" ||
            (typeof journey?.currentPhase === "number" && journey.currentPhase > 8);

          if (pDiff === "Beginner") {
            beginnerTotal++;
            if (isCompleted) completedBeginner++;
          } else if (pDiff === "Intermediate") {
            intermediateTotal++;
            if (isCompleted) completedIntermediate++;
          }
        });

        const beginnerRequired = Math.ceil(beginnerTotal * 0.50);
        const intermediateRequired = Math.ceil(intermediateTotal * 0.30);
        const advancedUnlocked =
          completedBeginner >= beginnerRequired && completedIntermediate >= intermediateRequired;

        if (!advancedUnlocked) {
          await client.close();
          return NextResponse.json(
            {
              locked: true,
              error: `Advanced problems are locked. You must complete 50% of Beginner problems (${completedBeginner}/${beginnerTotal}, ${beginnerRequired} required) and 30% of Intermediate problems (${completedIntermediate}/${intermediateTotal}, ${intermediateRequired} required) to unlock Advanced challenges.`,
              unlockProgress: {
                completedBeginner,
                beginnerTotal,
                beginnerRequired,
                completedIntermediate,
                intermediateTotal,
                intermediateRequired,
                advancedUnlocked: false,
              },
            },
            { status: 403 }
          );
        }
      }
    }

    await client.close();
    return NextResponse.json(toProblemPayload(problem as Record<string, any>));
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in /api/journey/problem:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
