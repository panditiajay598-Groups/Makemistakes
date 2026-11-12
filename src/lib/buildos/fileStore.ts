/**
 * T6.2 — MongoDB-backed durable file store for BuildOS.
 *
 * MongoDB is the authoritative source of truth for student project files
 * (`build_workspace_files`) and per-workspace quota (`build_workspace_quotas`).
 * The local filesystem is a disposable cache, never the source of truth.
 *
 * Design principles:
 * - Every mutation (create/update/soft-delete/revive) runs inside a MongoDB
 *   transaction that updates the file document AND the workspace quota
 *   document together. If either fails, the whole operation rolls back.
 * - The per-workspace quota document acts as the transaction mutex: all writes
 *   to one workspace contend on its document lock, so concurrent writes cannot
 *   jointly exceed limits.
 * - Optimistic concurrency: updates/deletes require the client's last-known
 *   `rev`. A stale `rev` returns a 409 conflict.
 * - Soft-delete tombstones keep the unique `(userId, problemId, path)` key
 *   occupied so a stale client cannot accidentally resurrect a deleted file.
 *   Recreation is a separate, revision-aware `reviveFile` operation.
 *
 * The backend is injectable so it can be unit-tested against an in-memory
 * backend; the default backend uses the real MongoDB driver.
 */
import type { Collection, ClientSession } from "mongodb";
import {
  BUILD_WORKSPACE_FILES_COLLECTION,
  BUILD_WORKSPACE_QUOTAS_COLLECTION,
  FILE_STORE_LIMITS,
  type BuildWorkspaceFileDoc,
  type BuildWorkspaceQuotaDoc,
} from "./fileStoreTypes";
import { isEditableRelativePath } from "./paths";

// ---------------------------------------------------------------------------
// Error types (carry an HTTP status for later route integration)
// ---------------------------------------------------------------------------

export class FileNotFoundError extends Error {
  readonly status = 404;
  constructor(message = "File not found") {
    super(message);
    this.name = "FileNotFoundError";
  }
}

export class RevisionConflictError extends Error {
  readonly status = 409;
  constructor(message = "File changed by another session. Reload and re-apply.") {
    super(message);
    this.name = "RevisionConflictError";
  }
}

export class DuplicateFileError extends Error {
  readonly status = 409;
  constructor(message = "File already exists") {
    super(message);
    this.name = "DuplicateFileError";
  }
}

export class QuotaExceededError extends Error {
  readonly status = 409;
  readonly limit: string;
  constructor(limit: keyof typeof FILE_STORE_LIMITS, message: string) {
    super(message);
    this.name = "QuotaExceededError";
    this.limit = limit;
  }
}

export class TombstoneCollisionError extends Error {
  readonly status = 409;
  constructor(message = "File was deleted; use explicit recreation") {
    super(message);
    this.name = "TombstoneCollisionError";
  }
}

// ---------------------------------------------------------------------------
// Backend abstraction
// ---------------------------------------------------------------------------

export type FileStoreBackend = {
  files: Collection<BuildWorkspaceFileDoc>;
  quotas: Collection<BuildWorkspaceQuotaDoc>;
  /**
   * Runs `fn` in a MongoDB transaction. `fn` receives the session; every
   * collection operation inside must pass `{ session }`. If `fn` throws, the
   * transaction is aborted and no change is applied.
   */
  withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T>;
};

let defaultBackendPromise: Promise<FileStoreBackend> | null = null;

/**
 * Builds the default backend from the real MongoDB driver. Loaded dynamically
 * so unit tests can inject an in-memory backend without needing the driver's
 * client session API.
 */
export async function getDefaultFileStoreBackend(): Promise<FileStoreBackend> {
  if (defaultBackendPromise) return defaultBackendPromise;
  defaultBackendPromise = (async () => {
    const { getDb, getMongoClient } = await import("@/lib/mongodb");
    const client = await getMongoClient();
    const db = await getDb();
    return {
      files: db.collection<BuildWorkspaceFileDoc>(BUILD_WORKSPACE_FILES_COLLECTION),
      quotas: db.collection<BuildWorkspaceQuotaDoc>(BUILD_WORKSPACE_QUOTAS_COLLECTION),
      withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
        const session = client.startSession();
        try {
          return session.withTransaction(() => fn(session));
        } finally {
          void session.endSession();
        }
      },
    };
  })();
  return defaultBackendPromise;
}

/** Convenience: reset the cached default backend (for tests). */
export function resetDefaultFileStoreBackend() {
  defaultBackendPromise = null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function contentBytes(content: string): number {
  return Buffer.byteLength(content, "utf8");
}

function assertEditable(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  if (!isEditableRelativePath(normalized)) {
    throw new Error("File type not allowed");
  }
  return normalized;
}

function contentTypeFor(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return "";
  return path.slice(dot + 1).toLowerCase();
}

async function ensureQuota(
  quotas: Collection<BuildWorkspaceQuotaDoc>,
  userId: string,
  problemId: string,
  session: ClientSession
): Promise<BuildWorkspaceQuotaDoc> {
  const filter = { userId, problemId };
  const existing = await quotas.findOne(filter, { session });
  if (existing) return existing;

  const doc: BuildWorkspaceQuotaDoc = {
    userId,
    problemId,
    fileCount: 0,
    totalBytes: 0,
    rev: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  try {
    await quotas.insertOne(doc, { session });
    return doc;
  } catch (err: any) {
    // Concurrent first-time init: another writer created it first.
    if (err?.code === 11000 || err?.codeName === "DuplicateKey") {
      const winner = await quotas.findOne(filter, { session });
      if (winner) return winner;
    }
    throw err;
  }
}

async function findLiveFile(
  files: Collection<BuildWorkspaceFileDoc>,
  userId: string,
  problemId: string,
  path: string,
  session: ClientSession
): Promise<BuildWorkspaceFileDoc | null> {
  return files.findOne({ userId, problemId, path, deletedAt: null }, { session });
}

async function applyQuotaDelta(
  quotas: Collection<BuildWorkspaceQuotaDoc>,
  userId: string,
  problemId: string,
  fileCountDelta: number,
  bytesDelta: number,
  session: ClientSession
) {
  await quotas.updateOne(
    { userId, problemId },
    {
      $inc: { fileCount: fileCountDelta, totalBytes: bytesDelta, rev: 1 },
      $set: { updatedAt: new Date() },
    },
    { session }
  );
}

// ---------------------------------------------------------------------------
// Read operations (no transaction)
// ---------------------------------------------------------------------------

export type ListFilesItem = {
  path: string;
  rev: number;
  size: number;
  contentType: string;
};

export async function listFiles(
  userId: string,
  problemId: string,
  backend: FileStoreBackend = await getDefaultFileStoreBackend()
): Promise<ListFilesItem[]> {
  const docs = await backend.files
    .find({ userId, problemId, deletedAt: null })
    .sort({ path: 1 })
    .toArray();
  return docs.map((d) => ({
    path: d.path,
    rev: d.rev,
    size: d.size,
    contentType: d.contentType,
  }));
}

export type FileReadResult = {
  path: string;
  content: string;
  rev: number;
  size: number;
  contentType: string;
};

export async function readFile(
  userId: string,
  problemId: string,
  path: string,
  backend: FileStoreBackend = await getDefaultFileStoreBackend()
): Promise<FileReadResult> {
  const normalized = assertEditable(path);
  const doc = await backend.files.findOne({
    userId,
    problemId,
    path: normalized,
    deletedAt: null,
  });
  if (!doc) throw new FileNotFoundError();
  return {
    path: doc.path,
    content: doc.content,
    rev: doc.rev,
    size: doc.size,
    contentType: doc.contentType,
  };
}

export type QuotaInfo = {
  fileCount: number;
  totalBytes: number;
  rev: number;
};

export async function getWorkspaceQuota(
  userId: string,
  problemId: string,
  backend: FileStoreBackend = await getDefaultFileStoreBackend()
): Promise<QuotaInfo> {
  const doc = await backend.quotas.findOne({ userId, problemId });
  if (!doc) return { fileCount: 0, totalBytes: 0, rev: 0 };
  return { fileCount: doc.fileCount, totalBytes: doc.totalBytes, rev: doc.rev };
}

// ---------------------------------------------------------------------------
// Mutations (transactions)
// ---------------------------------------------------------------------------

export type FileWriteResult = {
  path: string;
  rev: number;
  created: boolean;
};

/**
 * Create a new live file. Fails if the path already exists (live or
 * tombstoned). Created atomically with the quota increment.
 */
export async function createFile(
  userId: string,
  problemId: string,
  path: string,
  content: string,
  backend: FileStoreBackend = await getDefaultFileStoreBackend()
): Promise<FileWriteResult> {
  const normalized = assertEditable(path);
  const size = contentBytes(content);
  if (size > FILE_STORE_LIMITS.maxFileBytes) {
    throw new QuotaExceededError(
      "maxFileBytes",
      `File exceeds the ${FILE_STORE_LIMITS.maxFileBytes}-byte limit`
    );
  }

  return backend.withTransaction(async (session) => {
    const quota = await ensureQuota(backend.quotas, userId, problemId, session);
    if (quota.fileCount >= FILE_STORE_LIMITS.maxWorkspaceFiles) {
      throw new QuotaExceededError(
        "maxWorkspaceFiles",
        `Workspace limit of ${FILE_STORE_LIMITS.maxWorkspaceFiles} files reached`
      );
    }
    if (quota.totalBytes + size > FILE_STORE_LIMITS.maxWorkspaceBytes) {
      throw new QuotaExceededError(
        "maxWorkspaceBytes",
        `Workspace total size would exceed ${FILE_STORE_LIMITS.maxWorkspaceBytes} bytes`
      );
    }

    const now = new Date();
    const doc: BuildWorkspaceFileDoc = {
      userId,
      problemId,
      path: normalized,
      content,
      rev: 1,
      contentType: contentTypeFor(normalized),
      size,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    try {
      await backend.files.insertOne(doc, { session });
    } catch (err: any) {
      if (err?.code === 11000 || err?.codeName === "DuplicateKey") {
        const existing = await backend.files.findOne(
          { userId, problemId, path: normalized },
          { session }
        );
        if (existing?.deletedAt) throw new TombstoneCollisionError();
        throw new DuplicateFileError();
      }
      throw err;
    }

    await applyQuotaDelta(backend.quotas, userId, problemId, 1, size, session);
    return { path: normalized, rev: 1, created: true };
  });
}

/**
 * Update an existing live file, requiring the client's last-known `rev`.
 */
export async function updateFile(
  userId: string,
  problemId: string,
  path: string,
  expectedRev: number,
  content: string,
  backend: FileStoreBackend = await getDefaultFileStoreBackend()
): Promise<FileWriteResult> {
  const normalized = assertEditable(path);
  const newSize = contentBytes(content);
  if (newSize > FILE_STORE_LIMITS.maxFileBytes) {
    throw new QuotaExceededError(
      "maxFileBytes",
      `File exceeds the ${FILE_STORE_LIMITS.maxFileBytes}-byte limit`
    );
  }

  return backend.withTransaction(async (session) => {
    const existing = await findLiveFile(
      backend.files,
      userId,
      problemId,
      normalized,
      session
    );
    if (!existing) {
      const maybeDeleted = await backend.files.findOne(
        { userId, problemId, path: normalized },
        { session }
      );
      if (maybeDeleted?.deletedAt) throw new TombstoneCollisionError();
      throw new FileNotFoundError();
    }
    if (existing.rev !== expectedRev) throw new RevisionConflictError();

    const quota = await ensureQuota(backend.quotas, userId, problemId, session);
    const delta = newSize - existing.size;
    if (quota.totalBytes + delta > FILE_STORE_LIMITS.maxWorkspaceBytes) {
      throw new QuotaExceededError(
        "maxWorkspaceBytes",
        `Workspace total size would exceed ${FILE_STORE_LIMITS.maxWorkspaceBytes} bytes`
      );
    }

    const res = await backend.files.updateOne(
      { userId, problemId, path: normalized, deletedAt: null, rev: expectedRev },
      {
        $set: {
          content,
          size: newSize,
          contentType: contentTypeFor(normalized),
          updatedAt: new Date(),
        },
        $inc: { rev: 1 },
      },
      { session }
    );
    if (res.matchedCount !== 1) {
      // Mongo did not modify the expected document exactly once — the file
      // changed concurrently (revision moved) after the read, so never report
      // success.
      throw new RevisionConflictError();
    }
    await applyQuotaDelta(backend.quotas, userId, problemId, 0, delta, session);

    return { path: normalized, rev: existing.rev + 1, created: false };
  });
}

/**
 * Soft-delete a live file (sets `deletedAt`, bumps `rev`, decrements quota).
 * The unique key stays occupied to prevent accidental resurrection.
 */
export async function softDeleteFile(
  userId: string,
  problemId: string,
  path: string,
  expectedRev: number,
  backend: FileStoreBackend = await getDefaultFileStoreBackend()
): Promise<FileWriteResult> {
  const normalized = assertEditable(path);

  return backend.withTransaction(async (session) => {
    const existing = await findLiveFile(
      backend.files,
      userId,
      problemId,
      normalized,
      session
    );
    if (!existing) {
      const maybeDeleted = await backend.files.findOne(
        { userId, problemId, path: normalized },
        { session }
      );
      if (maybeDeleted?.deletedAt) throw new TombstoneCollisionError("File already deleted");
      throw new FileNotFoundError();
    }
    if (existing.rev !== expectedRev) throw new RevisionConflictError();

    const res = await backend.files.updateOne(
      { userId, problemId, path: normalized, deletedAt: null, rev: expectedRev },
      {
        $set: { deletedAt: new Date(), updatedAt: new Date() },
        $inc: { rev: 1 },
      },
      { session }
    );
    if (res.matchedCount !== 1) {
      // Mongo did not tombstone the expected document exactly once — the file
      // changed concurrently (revision moved) or was already deleted — so
      // never report success.
      throw new RevisionConflictError();
    }
    await applyQuotaDelta(
      backend.quotas,
      userId,
      problemId,
      -1,
      -existing.size,
      session
    );

    return { path: normalized, rev: existing.rev + 1, created: false };
  });
}

/**
 * Explicit, revision-aware recreation of a soft-deleted file. Restores
 * `deletedAt: null`, writes new content and re-increments quota.
 */
export async function reviveFile(
  userId: string,
  problemId: string,
  path: string,
  expectedRev: number,
  content: string,
  backend: FileStoreBackend = await getDefaultFileStoreBackend()
): Promise<FileWriteResult> {
  const normalized = assertEditable(path);
  const newSize = contentBytes(content);
  if (newSize > FILE_STORE_LIMITS.maxFileBytes) {
    throw new QuotaExceededError(
      "maxFileBytes",
      `File exceeds the ${FILE_STORE_LIMITS.maxFileBytes}-byte limit`
    );
  }

  return backend.withTransaction(async (session) => {
    const tomb = await backend.files.findOne(
      { userId, problemId, path: normalized },
      { session }
    );
    if (!tomb) throw new FileNotFoundError("No tombstone found to revive");
    if (!tomb.deletedAt) throw new DuplicateFileError("File is already live");
    if (tomb.rev !== expectedRev) throw new RevisionConflictError();

    const quota = await ensureQuota(backend.quotas, userId, problemId, session);
    if (quota.fileCount >= FILE_STORE_LIMITS.maxWorkspaceFiles) {
      throw new QuotaExceededError(
        "maxWorkspaceFiles",
        `Workspace limit of ${FILE_STORE_LIMITS.maxWorkspaceFiles} files reached`
      );
    }
    if (quota.totalBytes + newSize > FILE_STORE_LIMITS.maxWorkspaceBytes) {
      throw new QuotaExceededError(
        "maxWorkspaceBytes",
        `Workspace total size would exceed ${FILE_STORE_LIMITS.maxWorkspaceBytes} bytes`
      );
    }

    await backend.files.updateOne(
      { userId, problemId, path: normalized, deletedAt: { $ne: null } },
      {
        $set: {
          content,
          size: newSize,
          contentType: contentTypeFor(normalized),
          deletedAt: null,
          updatedAt: new Date(),
        },
        $inc: { rev: 1 },
      },
      { session }
    );
    await applyQuotaDelta(backend.quotas, userId, problemId, 1, newSize, session);

    return { path: normalized, rev: tomb.rev + 1, created: true };
  });
}
