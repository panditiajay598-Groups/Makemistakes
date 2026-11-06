import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import fs from "fs";
import path from "path";
import { workspaceDir } from "@/lib/buildos/paths";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import { requireOwnedWorkspace } from "@/lib/security/workspaceOwnership";
import {
  decryptGithubAccessToken,
  encryptGithubAccessToken,
} from "@/lib/security/githubOAuth";

export const runtime = "nodejs";

function sanitizeCode(code: string): string {
  // Strip hardcoded API keys and secrets before pushing to public/private repo
  return code
    .replace(/(gsk_[A-Za-z0-9_]{30,})/g, "GROQ_API_KEY_PLACEHOLDER")
    .replace(/(sk-or-v1-[A-Za-z0-9_]{40,})/g, "OPENROUTER_API_KEY_PLACEHOLDER")
    .replace(/(AQ\.Ab8[A-Za-z0-9_]{30,})/g, "GEMINI_API_KEY_PLACEHOLDER");
}

export async function POST(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { problemId, repoName, isPrivate = false } = body;

    if (typeof problemId !== "string" || !problemId.trim()) {
      return NextResponse.json({ error: "problemId is required" }, { status: 400 });
    }
    if (repoName !== undefined && typeof repoName !== "string") {
      return NextResponse.json({ error: "repoName must be a string" }, { status: 400 });
    }
    if (typeof isPrivate !== "boolean") {
      return NextResponse.json({ error: "isPrivate must be a boolean" }, { status: 400 });
    }
    const cleanProblemId = problemId.trim();
    const ownedWorkspace = await requireOwnedWorkspace(identity, cleanProblemId);

    const db = await getDb();
    const journey = await db.collection("user_journeys").findOne({
      userId: ownedWorkspace.userId,
      problemId: cleanProblemId,
    });
    if (!journey) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const storedToken = journey.phases?.deploy?.githubAccessToken;
    const username = journey?.phases?.deploy?.githubUsername;

    if (typeof storedToken !== "string" || !storedToken || !username) {
      return NextResponse.json(
        { error: "GitHub account not connected. Please connect your GitHub account first." },
        { status: 400 }
      );
    }

    const credential = decryptGithubAccessToken(storedToken);
    const token = credential.token;
    if (!credential.wasEncrypted) {
      await db.collection("user_journeys").updateOne(
        { _id: journey._id, userId: ownedWorkspace.userId, problemId: cleanProblemId },
        { $set: { "phases.deploy.githubAccessToken": encryptGithubAccessToken(token) } }
      );
    }

    const cleanRepoName = (repoName || `makemistakes-${cleanProblemId.toLowerCase()}`).replace(/[^a-zA-Z0-9._-]/g, "-");

    // 1. Create Remote GitHub Repository
    const createRepoRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "MakeMistakes-App",
      },
      body: JSON.stringify({
        name: cleanRepoName,
        description: `Solution for ${cleanProblemId} created on MakeMistakes platform.`,
        private: isPrivate,
        auto_init: true,
      }),
    });

    const repoData = await createRepoRes.json();
    if (!createRepoRes.ok && createRepoRes.status !== 422) {
      return NextResponse.json({ error: repoData.message || "Failed to create GitHub repository" }, { status: createRepoRes.status });
    }

    const repoUrl = `https://github.com/${username}/${cleanRepoName}`;

    // 2. Fetch BuildOS Workspace Files
    const workspaceRoot = workspaceDir(ownedWorkspace.userId, cleanProblemId);
    const filesToPush: { path: string; content: string }[] = [];

    if (fs.existsSync(workspaceRoot)) {
      function scanDir(dir: string, base: string = "") {
        try {
          const entries = fs.readdirSync(dir);
          for (const entryName of entries) {
            const relPath = path.join(base, entryName).replace(/\\/g, "/");
            const fullPath = path.join(dir, entryName);
            try {
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory()) {
                if (entryName !== "node_modules" && entryName !== ".next" && entryName !== ".git") {
                  scanDir(fullPath, relPath);
                }
              } else if (stat.isFile()) {
                if (!entryName.startsWith(".env")) {
                  const content = fs.readFileSync(fullPath, "utf8");
                  filesToPush.push({ path: relPath, content: sanitizeCode(content) });
                }
              }
            } catch (fileErr) {
              console.warn(`[ScanDir Skip File] Could not process ${fullPath}:`, fileErr);
            }
          }
        } catch (dirErr) {
          console.warn(`[ScanDir Skip Dir] Could not read directory ${dir}:`, dirErr);
        }
      }
      scanDir(workspaceRoot);
    }

    // Default template README if workspace files empty
    if (filesToPush.length === 0) {
      filesToPush.push({
        path: "README.md",
        content: `# ${cleanProblemId} — MakeMistakes Project\n\nCompleted product challenge on MakeMistakes platform.\n\n### Tech Stack\n- Next.js / React\n- TypeScript\n- Tailwind CSS\n`,
      });
    }

    // 3. Push Files to GitHub via Repository Contents API
    for (const f of filesToPush) {
      try {
        const getFileUrl = `https://api.github.com/repos/${username}/${cleanRepoName}/contents/${f.path}`;
        const existingRes = await fetch(getFileUrl, {
          headers: { Authorization: `Bearer ${token}`, "User-Agent": "MakeMistakes-App" },
        });
        const existingData = existingRes.ok ? await existingRes.json() : null;

        await fetch(getFileUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "MakeMistakes-App",
          },
          body: JSON.stringify({
            message: `feat: push ${f.path} from MakeMistakes BuildOS`,
            content: Buffer.from(f.content).toString("base64"),
            sha: existingData?.sha,
          }),
        });
      } catch (fileErr) {
        console.warn(`[GitHub Push Warning] Failed to push ${f.path}:`, fileErr);
      }
    }

    // 4. Update MongoDB Record with Repo URL and status
    await db.collection("user_journeys").updateOne(
      { _id: journey._id, userId: ownedWorkspace.userId, problemId: cleanProblemId },
      {
        $set: {
          "phases.deploy.githubRepoUrl": repoUrl,
          "phases.deploy.isPushed": true,
          "phases.deploy.pushedAt": new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      repoUrl,
      message: `Successfully created and pushed repository to ${repoUrl}`,
    });
  } catch (err: any) {
    console.error("[GitHub Push Error]:", err);
    const status = typeof err?.status === "number" ? err.status : 500;
    return NextResponse.json({ error: status === 404 ? "Workspace not found" : "Failed to push repository" }, { status });
  }
}
