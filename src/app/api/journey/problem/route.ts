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
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing required 'id' parameter" }, { status: 400 });
    }

    if (!DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
    }

    const client = new MongoClient(DATABASE_URL);
    await client.connect();

    const db = client.db();
    const collection = db.collection("problems");

    const problem = await collection.findOne({ problemId: id });
    await client.close();

    if (!problem) {
      return NextResponse.json(
        {
          error: `Problem '${id}' was not found. The Problem Library is currently empty or waiting for problem import.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(toProblemPayload(problem as Record<string, any>));
  } catch (err: any) {
    console.error("Error in /api/journey/problem:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
