import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/authSession";
import { sortProblemsNumerically } from "@/lib/problemId";
import { applyNoStoreHeaders } from "@/lib/cacheHeaders";

export async function GET(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "DATABASE_URL is not configured" },
          { status: 500 }
        )
      );
    }

    // 1. Derive authoritative user identity exclusively from verified server-side session.
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

    // Anonymous visitors receive safe empty zero-state without querying private user records
    if (!hasAuthSession) {
      return applyNoStoreHeaders(
        NextResponse.json({
          success: true,
          authenticated: false,
          userId: null,
        projects: [],
        summary: {
          projectsBuilt: 0,
          totalProjects: 0,
          phasesCompleted: 0,
          portfolioProgress: 0,
          achievements: [
            {
              id: "first_product",
              title: "First Product Completed",
              description: "Successfully shipped your first end-to-end product challenge.",
              unlocked: false,
            },
            {
              id: "github_push",
              title: "GitHub Push Completed",
              description: "Pushed production code repository to GitHub.",
              unlocked: false,
            },
            {
              id: "full_journey",
              title: "8 Phases Completed",
              description: "Completed all 8 phases of the MakeMistakes Product Journey.",
              unlocked: false,
            },
            {
              id: "builder_started",
              title: "Journey Started",
              description: "Initiated your product engineering journey on MakeMistakes OS.",
              unlocked: false,
            },
          ],
          skills: [],
        },
      })
    );
  }

    const userFilter = authIdentifiers.length === 1
      ? { userId: authIdentifiers[0] }
      : { userId: { $in: authIdentifiers } };

    const db = await getDb();
    const problemsCollection = db.collection("problems");
    const completionsCollection = db.collection("problem_completions");
    const userJourneysCollection = db.collection("user_journeys");

    // 2. Fetch completions and journeys in parallel with bounded projections
    const [completionDocs, userJourneys] = await Promise.all([
      completionsCollection
        .find(userFilter, { projection: { problemId: 1, completedAt: 1 } })
        .toArray(),
      userJourneysCollection
        .find(userFilter, {
          projection: {
            problemId: 1,
            status: 1,
            currentPhase: 1,
            "phases.plan.techDecisions": 1,
            "phases.deploy": 1,
            updatedAt: 1,
            lastActivityAt: 1,
            lastSavedAt: 1,
          },
        })
        .toArray(),
    ]);

    const completionsMap = new Map<string, any>();
    completionDocs.forEach((doc: any) => {
      if (doc.problemId) completionsMap.set(doc.problemId, doc);
    });

    const journeysMap = new Map<string, any>();
    userJourneys.forEach((doc: any) => {
      if (doc.problemId) journeysMap.set(doc.problemId, doc);
    });

    // Collect all relevant problem IDs for this user
    const userProblemIds = Array.from(
      new Set([...completionsMap.keys(), ...journeysMap.keys()])
    );

    // If user has not started any problem, return early without touching problems collection
    if (userProblemIds.length === 0) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        userId: authIdentifiers[0],
        projects: [],
        summary: {
          projectsBuilt: 0,
          totalProjects: 0,
          phasesCompleted: 0,
          portfolioProgress: 0,
          achievements: [
            {
              id: "first_product",
              title: "First Product Completed",
              description: "Successfully shipped your first end-to-end product challenge.",
              unlocked: false,
            },
            {
              id: "github_push",
              title: "GitHub Push Completed",
              description: "Pushed production code repository to GitHub.",
              unlocked: false,
            },
            {
              id: "full_journey",
              title: "8 Phases Completed",
              description: "Completed all 8 phases of the MakeMistakes Product Journey.",
              unlocked: false,
            },
            {
              id: "builder_started",
              title: "Journey Started",
              description: "Initiated your product engineering journey on MakeMistakes OS.",
              unlocked: false,
            },
          ],
          skills: [],
        },
      });
    }

    // 3. Fetch ONLY the specific problems this user has worked on with bounded projection.
    // Eliminates the previous redundant 1,848-document full collection scan.
    const problemDocs = await problemsCollection
      .find(
        { problemId: { $in: userProblemIds } },
        {
          projection: {
            problemId: 1,
            title: 1,
            category: 1,
            difficulty: 1,
            "learning.level": 1,
            problemDescription: 1,
            description: 1,
            context: 1,
            "build.techStack": 1,
          },
        }
      )
      .toArray();

    const problemsMap = new Map<string, any>();
    problemDocs.forEach((p: any) => {
      if (p.problemId) problemsMap.set(p.problemId, p);
    });

    // Map each project for this user
    const projects: any[] = [];

    userProblemIds.forEach((pid) => {
      const journey = journeysMap.get(pid);
      const completion = completionsMap.get(pid);
      const problem = problemsMap.get(pid);

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
    sortProblemsNumerically(projects);

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

    return applyNoStoreHeaders(
      NextResponse.json({
        success: true,
        authenticated: true,
        userId: authIdentifiers[0],
        projects,
        summary: {
          projectsBuilt,
          totalProjects: projects.length,
          phasesCompleted: totalPhasesDone,
          portfolioProgress: overallPct,
          achievements,
          skills: allSkills,
        },
      })
    );
  } catch (err: any) {
    console.error("Error in GET /api/portfolio:", err);
    return applyNoStoreHeaders(
      NextResponse.json(
        { error: err.message || "Failed to load portfolio data" },
        { status: 500 }
      )
    );
  }
}
