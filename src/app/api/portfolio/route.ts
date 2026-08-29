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
    const completionsCollection = db.collection("problem_completions");
    const userJourneysCollection = db.collection("user_journeys");

    // 1. Fetch completions for THIS user
    const completionDocs = await completionsCollection
      .find({ userId })
      .toArray();
    const completionsMap = new Map<string, any>();
    completionDocs.forEach((doc: any) => {
      if (doc.problemId) completionsMap.set(doc.problemId, doc);
    });

    // 2. Fetch user journeys for THIS user
    const userJourneys = await userJourneysCollection.find({ userId }).toArray();
    const journeysMap = new Map<string, any>();
    userJourneys.forEach((doc: any) => {
      if (doc.problemId) journeysMap.set(doc.problemId, doc);
    });

    // Collect all relevant problem IDs for this user
    const userProblemIds = Array.from(
      new Set([...completionsMap.keys(), ...journeysMap.keys()])
    );

    // Fetch master problem definitions for user's problem IDs
    let problemDocs: any[] = [];
    if (userProblemIds.length > 0) {
      problemDocs = await problemsCollection
        .find({ problemId: { $in: userProblemIds } })
        .toArray();
    }

    const problemsMap = new Map<string, any>();
    problemDocs.forEach((p: any) => {
      if (p.problemId) problemsMap.set(p.problemId, p);
    });

    // Also fetch all problems list for fallback lookups
    const allProblems = await problemsCollection
      .find({}, { projection: { problemId: 1, title: 1, category: 1, difficulty: 1, problemDescription: 1, description: 1 } })
      .toArray();

    // Map each project for this user
    const projects: any[] = [];

    userProblemIds.forEach((pid) => {
      const journey = journeysMap.get(pid);
      const completion = completionsMap.get(pid);
      const problem = problemsMap.get(pid) || allProblems.find((p) => p.problemId === pid);

      const isCompleted =
        !!completion ||
        journey?.status === "completed" ||
        (typeof journey?.currentPhase === "number" && journey.currentPhase > 8);

      let status = "Not Started";
      let completedPhases = 0;

      if (isCompleted) {
        status = "Completed";
        completedPhases = 8;
      } else if (journey) {
        status = "In Progress";
        const currentP = typeof journey.currentPhase === "number" ? journey.currentPhase : 1;
        completedPhases = Math.max(0, Math.min(8, currentP - 1));
      }

      const totalPhases = 8;
      const progressPercentage = Math.round((completedPhases / totalPhases) * 100);

      // Extract tech stack if present
      const techStack: string[] = [];
      if (problem?.build?.techStack && Array.isArray(problem.build.techStack)) {
        techStack.push(...problem.build.techStack);
      }
      if (journey?.phases?.plan?.techDecisions) {
        Object.values(journey.phases.plan.techDecisions).forEach((v: any) => {
          if (typeof v === "string" && v.trim() && !techStack.includes(v)) {
            techStack.push(v.trim());
          }
        });
      }

      const githubUrl = journey?.phases?.deploy?.githubRepoUrl || null;
      const liveUrl = journey?.phases?.deploy?.liveUrl || null;

      const completionDate = completion?.completedAt
        ? new Date(completion.completedAt).toISOString()
        : isCompleted && journey?.updatedAt
        ? new Date(journey.updatedAt).toISOString()
        : null;

      const lastWorkedDate = journey?.lastActivityAt
        ? new Date(journey.lastActivityAt).toISOString()
        : journey?.lastSavedAt
        ? new Date(journey.lastSavedAt).toISOString()
        : journey?.updatedAt
        ? new Date(journey.updatedAt).toISOString()
        : completionDate;

      projects.push({
        problemId: pid,
        title: problem?.title || `Problem ${pid}`,
        description:
          problem?.problemDescription ||
          problem?.description ||
          problem?.context ||
          "Product engineering challenge on MakeMistakes OS.",
        category: problem?.category || "Product Challenge",
        difficulty: problem?.difficulty || problem?.learning?.level || null,
        status,
        completedPhases,
        totalPhases,
        progressPercentage,
        currentPhase: journey?.currentPhase || 1,
        completionDate,
        lastWorkedDate,
        techStack,
        githubUrl,
        liveUrl,
      });
    });

    // Sort projects numerically by problemId (P000001, P000002, etc.)
    projects.sort((a, b) => {
      const numA = parseInt((a.problemId || "").replace(/\D/g, ""), 10) || 0;
      const numB = parseInt((b.problemId || "").replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

    // Calculate Summary Metrics
    const projectsBuilt = projects.filter((p) => p.status === "Completed").length;
    const totalPhasesDone = projects.reduce((acc, p) => acc + p.completedPhases, 0);
    const overallPct =
      projects.length > 0
        ? Math.round((totalPhasesDone / (projects.length * 8)) * 100)
        : 0;

    // Derived Achievements
    const hasGitHub = projects.some((p) => !!p.githubUrl);
    const hasCompletedProduct = projectsBuilt >= 1;
    const has8Phases = projects.some((p) => p.completedPhases >= 8);
    const hasStartedJourney = projects.length >= 1;

    const achievements = [
      {
        id: "first_product",
        title: "First Product Completed",
        description: "Successfully shipped your first end-to-end product challenge.",
        unlocked: hasCompletedProduct,
      },
      {
        id: "github_push",
        title: "GitHub Push Completed",
        description: "Pushed production code repository to GitHub.",
        unlocked: hasGitHub,
      },
      {
        id: "full_journey",
        title: "8 Phases Completed",
        description: "Completed all 8 phases of the MakeMistakes Product Journey.",
        unlocked: has8Phases,
      },
      {
        id: "builder_started",
        title: "Journey Started",
        description: "Initiated your product engineering journey on MakeMistakes OS.",
        unlocked: hasStartedJourney,
      },
    ];

    // Derived Skills
    const allSkills = Array.from(
      new Set(projects.flatMap((p) => p.techStack || []))
    );

    await client.close();

    return NextResponse.json({
      success: true,
      userId,
      projects,
      summary: {
        projectsBuilt,
        totalProjects: projects.length,
        phasesCompleted: totalPhasesDone,
        portfolioProgress: overallPct,
        achievements,
        skills: allSkills,
      },
    });
  } catch (err: any) {
    if (client) await client.close().catch(() => {});
    console.error("Error in GET /api/portfolio:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load portfolio data" },
      { status: 500 }
    );
  }
}
