import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import dns from "dns";

try { dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]); } catch {}

export const runtime = "nodejs";

let cachedClient: MongoClient | null = null;
async function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  if (!cachedClient) {
    cachedClient = new MongoClient(url);
    await cachedClient.connect();
  }
  return cachedClient.db();
}

function sanitizeCode(code: string): string {
  // Strip hardcoded API keys and secrets before pushing to public/private repo
  return code
    .replace(/(gsk_[A-Za-z0-9_]{30,})/g, "GROQ_API_KEY_PLACEHOLDER")
    .replace(/(sk-or-v1-[A-Za-z0-9_]{40,})/g, "OPENROUTER_API_KEY_PLACEHOLDER")
    .replace(/(AQ\.Ab8[A-Za-z0-9_]{30,})/g, "GEMINI_API_KEY_PLACEHOLDER");
}

export async function POST(req: Request) {
  try {
    const { userId, problemId, repoName, isPrivate = false } = await req.json();

    if (!userId || !problemId) {
      return NextResponse.json({ error: "userId and problemId are required" }, { status: 400 });
    }

    const db = await getDb();
    const effectiveUserId = userId.toString().trim().toLowerCase();
    const journey = await db.collection("user_journeys").findOne({ userId: effectiveUserId, problemId });

    const token = journey?.phases?.deploy?.githubAccessToken;
    const username = journey?.phases?.deploy?.githubUsername;

    if (!token || !username) {
      return NextResponse.json(
        { error: "GitHub account not connected. Please connect your GitHub account first." },
        { status: 400 }
      );
    }

    const cleanRepoName = (repoName || `makemistakes-${problemId.toLowerCase()}`).replace(/[^a-zA-Z0-9._-]/g, "-");

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
        description: `Solution for ${problemId} created on MakeMistakes platform.`,
        private: isPrivate,
        auto_init: true,
      }),
    });

    let repoData = await createRepoRes.json();
    if (!createRepoRes.ok && createRepoRes.status !== 422) {
      return NextResponse.json({ error: repoData.message || "Failed to create GitHub repository" }, { status: createRepoRes.status });
    }

    const repoUrl = `https://github.com/${username}/${cleanRepoName}`;

    // 2. Fetch BuildOS Workspace Files
    const workspaceDir = path.join(process.cwd(), "data", "student-workspaces", effectiveUserId, problemId);
    let filesToPush: { path: string; content: string }[] = [];

    if (fs.existsSync(workspaceDir)) {
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
      scanDir(workspaceDir);
    }

    // Default template README if workspace files empty
    if (filesToPush.length === 0) {
      filesToPush.push({
        path: "README.md",
        content: `# ${problemId} — MakeMistakes Project\n\nCompleted product challenge on MakeMistakes platform.\n\n### Tech Stack\n- Next.js / React\n- TypeScript\n- Tailwind CSS\n`,
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
      { userId: effectiveUserId, problemId },
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
    return NextResponse.json({ error: err.message || "Failed to push repository" }, { status: 500 });
  }
}
