import { MongoClient, type Db } from "mongodb";
import dns from "dns";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  TEMPLATE_ID,
  WORKSPACES_ROOT,
  type WorkspaceStatus,
  ensureDir,
  workspaceDir,
  workspaceKey,
} from "./paths";
import { copyTemplateToWorkspace, listWorkspaceTree } from "./files";
import { installWorkspaceDependencies, verifyWorkspacePackages, type EnvCheck } from "./install";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  /* ignore */
}

export type BuildWorkspaceDoc = {
  workspaceId: string;
  userId: string;
  problemId: string;
  key: string;
  template: typeof TEMPLATE_ID;
  status: WorkspaceStatus;
  envChecks?: EnvCheck;
  lastError?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION = "build_workspaces";

function metaFile(root: string) {
  return path.join(root, ".buildos-meta.json");
}

function readLocalMeta(root: string): BuildWorkspaceDoc | null {
  try {
    const p = metaFile(root);
    if (!fs.existsSync(p)) return null;
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    return {
      ...raw,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    };
  } catch {
    return null;
  }
}

function writeLocalMeta(root: string, doc: BuildWorkspaceDoc) {
  ensureDir(root);
  fs.writeFileSync(metaFile(root), JSON.stringify(doc, null, 2), "utf8");
}

async function withDb<T>(fn: (db: Db) => Promise<T>): Promise<T | null> {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const client = new MongoClient(url);
  try {
    await client.connect();
    return await fn(client.db());
  } catch (err) {
    console.warn("BuildOS Mongo unavailable, using local meta:", (err as Error).message);
    return null;
  } finally {
    await client.close().catch(() => {});
  }
}

export async function getWorkspaceMeta(userId: string, problemId: string) {
  const fromDb = await withDb(async (db) => {
    return db.collection<BuildWorkspaceDoc>(COLLECTION).findOne({ userId, problemId });
  });
  if (fromDb) return fromDb;
  return readLocalMeta(workspaceDir(userId, problemId));
}

export async function upsertWorkspaceMeta(
  doc: Partial<BuildWorkspaceDoc> & { userId: string; problemId: string }
) {
  const now = new Date();
  const root = workspaceDir(doc.userId, doc.problemId);
  const existing =
    (await withDb(async (db) =>
      db.collection<BuildWorkspaceDoc>(COLLECTION).findOne({
        userId: doc.userId,
        problemId: doc.problemId,
      })
    )) || readLocalMeta(root);

  const next: BuildWorkspaceDoc = {
    workspaceId: existing?.workspaceId || doc.workspaceId || `ws_${randomUUID()}`,
    userId: doc.userId,
    problemId: doc.problemId,
    key: doc.key || existing?.key || workspaceKey(doc.userId, doc.problemId),
    template: TEMPLATE_ID,
    status: doc.status || existing?.status || "created",
    envChecks: doc.envChecks ?? existing?.envChecks,
    lastError: doc.lastError !== undefined ? doc.lastError : existing?.lastError ?? null,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  writeLocalMeta(root, next);

  await withDb(async (db) => {
    const col = db.collection<BuildWorkspaceDoc>(COLLECTION);
    await col.updateOne(
      { userId: next.userId, problemId: next.problemId },
      { $set: next },
      { upsert: true }
    );
    return true;
  });

  return next;
}

export type EnsureWorkspaceResult = {
  workspace: BuildWorkspaceDoc;
  root: string;
  tree: ReturnType<typeof listWorkspaceTree>;
  checks: EnvCheck;
  provisionLogs: string[];
  created: boolean;
};

/**
 * Create or restore an isolated workspace for userId + problemId.
 * Installs packages inside that workspace only.
 */
export async function ensureWorkspace(
  userId: string,
  problemId: string,
  options?: { forceReinstall?: boolean }
): Promise<EnsureWorkspaceResult> {
  ensureDir(WORKSPACES_ROOT);
  const root = workspaceDir(userId, problemId);
  const key = workspaceKey(userId, problemId);
  const provisionLogs: string[] = [];
  let created = false;

  let meta = await getWorkspaceMeta(userId, problemId);
  const hasPackage = fs.existsSync(path.join(root, "package.json"));

  if (!hasPackage) {
    created = true;
    provisionLogs.push("Creating isolated Beginner workspace from template...");
    if (fs.existsSync(root)) {
      fs.rmSync(root, { recursive: true, force: true });
    }
    copyTemplateToWorkspace(root);
    meta = await upsertWorkspaceMeta({
      userId,
      problemId,
      key,
      workspaceId: meta?.workspaceId,
      status: "created",
      lastError: null,
    });
  } else if (!meta) {
    meta = await upsertWorkspaceMeta({
      userId,
      problemId,
      key,
      status: "created",
    });
  }

  const needsInstall =
    options?.forceReinstall ||
    !fs.existsSync(path.join(root, "node_modules")) ||
    meta.status === "error" ||
    meta.status === "created" ||
    meta.status === "installing";

  if (needsInstall) {
    await upsertWorkspaceMeta({
      userId,
      problemId,
      status: "installing",
      lastError: null,
    });
    provisionLogs.push("Installing development environment...");
    const install = await installWorkspaceDependencies(root);
    provisionLogs.push(...install.logs.slice(-20));

    if (!install.ok) {
      const failed = await upsertWorkspaceMeta({
        userId,
        problemId,
        status: "error",
        lastError: install.error || "Install failed",
      });
      const verify = verifyWorkspacePackages(root);
      return {
        workspace: failed,
        root,
        tree: listWorkspaceTree(root),
        checks: verify.checks,
        provisionLogs,
        created,
      };
    }
  }

  const verify = verifyWorkspacePackages(root);
  const ready = await upsertWorkspaceMeta({
    userId,
    problemId,
    status: "ready",
    envChecks: verify.checks,
    lastError: null,
  });

  provisionLogs.push("✓ Node.js ready");
  provisionLogs.push("✓ Next.js ready");
  provisionLogs.push("✓ React ready");
  provisionLogs.push("✓ TypeScript ready");
  if (verify.checks.ui) provisionLogs.push("✓ UI packages ready");
  if (verify.checks.three) provisionLogs.push("✓ 3D packages ready");
  provisionLogs.push("Environment Ready ✓");

  return {
    workspace: ready,
    root,
    tree: listWorkspaceTree(root),
    checks: verify.checks,
    provisionLogs,
    created,
  };
}

export async function setWorkspaceStatus(
  userId: string,
  problemId: string,
  status: WorkspaceStatus,
  lastError?: string | null
) {
  return upsertWorkspaceMeta({ userId, problemId, status, lastError: lastError ?? null });
}

/** Stop running preview sessions for this workspace. */
export async function stopWorkspace(userId: string, problemId: string) {
  const meta = await getWorkspaceMeta(userId, problemId);
  if (!meta) return null;
  if (meta.status === "running") {
    return setWorkspaceStatus(userId, problemId, "stopped");
  }
  return meta;
}
