import { NextResponse } from "next/server";
import { workspaceDir } from "@/lib/buildos/paths";
import {
  createWorkspaceFile,
  deleteWorkspaceFile,
  listWorkspaceTree,
  readWorkspaceTextFile,
  writeWorkspaceTextFile,
} from "@/lib/buildos/files";
import { getWorkspaceMeta, upsertWorkspaceMeta } from "@/lib/buildos/workspaceService";

export const runtime = "nodejs";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function assertOwned(userId: string, problemId: string) {
  const meta = await getWorkspaceMeta(userId, problemId);
  if (!meta) throw Object.assign(new Error("Workspace not found"), { status: 404 });
  return meta;
}

/** GET — list tree or read one file */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const problemId = searchParams.get("problemId")?.trim();
    const filePath = searchParams.get("path")?.trim();
    if (!userId || !problemId) return bad("userId and problemId are required");

    await assertOwned(userId, problemId);
    const root = workspaceDir(userId, problemId);

    if (filePath) {
      let content = readWorkspaceTextFile(root, filePath);
      if (
        filePath === "app/page.tsx" &&
        (content.includes("Provided by MakeMistakes") ||
          content.includes("Why do micro-SMEs waste") ||
          content.includes("App shell is ready") ||
          content.includes("__WRITE_ME__"))
      ) {
        content = `export default function AppShell() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          Product Workspace
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Welcome to Your Product
        </h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
          Build and customize your application. Use the Monaco editor or instruct Nova AI to synthesize components, create forms, and write backend APIs.
        </p>
        <div className="flex items-center justify-center gap-3 pt-4">
          <button className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg cursor-pointer">
            Explore Features
          </button>
          <button className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700 cursor-pointer">
            Documentation
          </button>
        </div>
      </div>
    </main>
  );
}`;
        try {
          writeWorkspaceTextFile(root, filePath, content);
        } catch {
          /* ignore */
        }
      }
      return NextResponse.json({ path: filePath, content });
    }

    return NextResponse.json({ tree: listWorkspaceTree(root) });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status || 500 }
    );
  }
}

/** PUT — save file content */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();
    const problemId = String(body.problemId || "").trim();
    const filePath = String(body.path || "").trim();
    const content = String(body.content ?? "");
    if (!userId || !problemId || !filePath) {
      return bad("userId, problemId, and path are required");
    }

    await assertOwned(userId, problemId);
    const root = workspaceDir(userId, problemId);
    writeWorkspaceTextFile(root, filePath, content);
    await upsertWorkspaceMeta({ userId, problemId, status: "ready" });

    return NextResponse.json({ ok: true, path: filePath });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status || 500 }
    );
  }
}

/** POST — create file */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = String(body.userId || "").trim();
    const problemId = String(body.problemId || "").trim();
    const filePath = String(body.path || "").trim();
    const content = String(body.content ?? "");
    if (!userId || !problemId || !filePath) {
      return bad("userId, problemId, and path are required");
    }

    await assertOwned(userId, problemId);
    const root = workspaceDir(userId, problemId);
    createWorkspaceFile(root, filePath, content);
    await upsertWorkspaceMeta({ userId, problemId, status: "ready" });

    return NextResponse.json({ ok: true, path: filePath, tree: listWorkspaceTree(root) });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status || 500 }
    );
  }
}

/** DELETE — delete file */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const problemId = searchParams.get("problemId")?.trim();
    const filePath = searchParams.get("path")?.trim();
    if (!userId || !problemId || !filePath) {
      return bad("userId, problemId, and path are required");
    }

    await assertOwned(userId, problemId);
    const root = workspaceDir(userId, problemId);
    deleteWorkspaceFile(root, filePath);
    await upsertWorkspaceMeta({ userId, problemId, status: "ready" });

    return NextResponse.json({ ok: true, tree: listWorkspaceTree(root) });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status || 500 }
    );
  }
}
