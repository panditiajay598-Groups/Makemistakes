import { NextResponse } from "next/server";
import { workspaceDir } from "@/lib/buildos/paths";
import {
  createWorkspaceFile,
  deleteWorkspaceFile,
  listWorkspaceTree,
  readWorkspaceTextFile,
  writeWorkspaceTextFile,
} from "@/lib/buildos/files";
import { upsertWorkspaceMeta } from "@/lib/buildos/workspaceService";
import { getAuthenticatedIdentity } from "@/lib/security/sessionIdentity";
import { requireOwnedWorkspace } from "@/lib/security/workspaceOwnership";
import { recordNovaActivity } from "@/lib/nova/activity";
import {
  hasNovaImplementationPlan,
  matchesNovaImplementationProposal,
} from "@/lib/nova/conversations";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** GET — list tree or read one file */
export async function GET(req: Request) {
  try {
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return bad("Authentication required", 401);

    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("problemId")?.trim();
    const filePath = searchParams.get("path")?.trim();
    if (!problemId) return bad("problemId is required");

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    const root = workspaceDir(userId, problemId);

    if (filePath) {
      let content = readWorkspaceTextFile(root, filePath);
      if (
        filePath === "app/page.tsx" &&
        (content.includes("Provided by MakeMistakes") ||
          content.includes("Why do micro-SMEs waste") ||
          content.includes("App shell is ready") ||
          content.includes("HeroScene") ||
          content.includes("Welcome to PayFlow") ||
          content.includes("Explore Features") ||
          content.includes("__WRITE_ME__"))
      ) {
        content = `export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-white">
          BuildOS Workspace
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your workspace is initialized. Ask Nova AI to synthesize components, create pages, or build your application features.
        </p>
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
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return bad("Authentication required", 401);

    const body = await req.json();
    const problemId = String(body.problemId || "").trim();
    const filePath = String(body.path || "").trim();
    const content = String(body.content ?? "");
    if (!problemId || !filePath) {
      return bad("problemId and path are required");
    }

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    const root = workspaceDir(userId, problemId);
    if (body.source === "nova_approved") {
      const db = await getDb();
      if (await hasNovaImplementationPlan(db, userId, problemId)) {
        const implementation = body.implementation;
        if (
          !implementation ||
          typeof implementation.conversationId !== "string" ||
          typeof implementation.stepId !== "string" ||
          typeof implementation.proposalId !== "string" ||
          !await matchesNovaImplementationProposal(
            db,
            userId,
            problemId,
            implementation.conversationId,
            implementation.stepId,
            implementation.proposalId,
            content
          )
        ) {
          return bad("This proposal is not the approved implementation for the current plan step.", 409);
        }
      }
    }
    let unchanged = false;
    try {
      unchanged = readWorkspaceTextFile(root, filePath) === content;
    } catch {
      unchanged = false;
    }
    writeWorkspaceTextFile(root, filePath, content);
    await upsertWorkspaceMeta({ userId, problemId, status: "ready" });
    if (!unchanged) {
      const source = body.source === "nova_approved" ? "proposal_approved" : "file_saved";
      await recordNovaActivity({
        userId,
        problemId,
        type: source,
        filePath,
        summary: source === "proposal_approved"
          ? "Student approved and applied a Nova code proposal."
          : "Workspace file was saved.",
      });
    }

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
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return bad("Authentication required", 401);

    const body = await req.json();
    const problemId = String(body.problemId || "").trim();
    const filePath = String(body.path || "").trim();
    const content = String(body.content ?? "");
    if (!problemId || !filePath) {
      return bad("problemId and path are required");
    }

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    const root = workspaceDir(userId, problemId);
    createWorkspaceFile(root, filePath, content);
    await upsertWorkspaceMeta({ userId, problemId, status: "ready" });
    await recordNovaActivity({
      userId,
      problemId,
      type: "file_created",
      filePath,
      summary: "Workspace file was created.",
    });

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
    const identity = await getAuthenticatedIdentity(req);
    if (!identity) return bad("Authentication required", 401);

    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("problemId")?.trim();
    const filePath = searchParams.get("path")?.trim();
    if (!problemId || !filePath) {
      return bad("problemId and path are required");
    }

    const { userId } = await requireOwnedWorkspace(identity, problemId);
    const root = workspaceDir(userId, problemId);
    deleteWorkspaceFile(root, filePath);
    await upsertWorkspaceMeta({ userId, problemId, status: "ready" });
    await recordNovaActivity({
      userId,
      problemId,
      type: "file_deleted",
      filePath,
      summary: "Workspace file was deleted.",
    });

    return NextResponse.json({ ok: true, tree: listWorkspaceTree(root) });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status || 500 }
    );
  }
}
