/**
 * T6.1 — Durable BuildOS workspace file store types.
 *
 * These types describe the MongoDB-backed source of truth for student project
 * files (`build_workspace_files`) and the per-workspace quota document
 * (`build_workspace_quotas`). They are declarative only: nothing in this file
 * reads or writes the database, provisions workspaces, or mutates state.
 *
 * The document/index definitions here mirror the existing `build_workspaces`
 * meta conventions in `workspaceService.ts` and `dbIndexes.ts` (raw driver
 * collections, not Prisma models).
 */

/** MongoDB collection names for the durable file store. */
export const BUILD_WORKSPACE_FILES_COLLECTION = "build_workspace_files" as const;
export const BUILD_WORKSPACE_QUOTAS_COLLECTION = "build_workspace_quotas" as const;

/** Version marker written to workspace meta once a workspace is durable. */
export const FILE_STORE_VERSION = 2 as const;

/**
 * Per-workspace limits enforced by the file store (see T6.1 addendum).
 * - maxFileBytes: authoritative per-file content size cap.
 * - maxWorkspaceFiles: max live files per workspace (directory-delete tx bound).
 * - maxWorkspaceBytes: total live content bytes across the workspace.
 */
export const FILE_STORE_LIMITS = {
  maxFileBytes: 256 * 1024, // 256 KB
  maxWorkspaceFiles: 400,
  maxWorkspaceBytes: 8 * 1024 * 1024, // 8 MB
} as const;

/**
 * A single durable student project file.
 *
 * One document per (userId, problemId, path). `rev` is a monotonic revision
 * used for optimistic concurrency; increments on every create/update/delete/
 * revive. `deletedAt` is a soft-delete tombstone that keeps the unique key
 * occupied so a stale client cannot accidentally resurrect a deleted file.
 */
export interface BuildWorkspaceFileDoc {
  /** Ensure workspace-meta userId (the identity that owns the workspace meta). */
  userId: string;
  problemId: string;
  /** Editable relative path, e.g. "app/page.tsx" (normalized, forward slashes). */
  path: string;
  content: string;
  /** Monotonic revision; used for optimistic concurrency (409 on stale). */
  rev: number;
  /** Derived from the file extension (lowercase, without dot). */
  contentType: string;
  /**
   * Content size in UTF-8 bytes, used for quota accounting. Must be computed
   * as `Buffer.byteLength(content, "utf8")` — never `content.length`, which
   * counts UTF-16 code units and can differ from byte size for non-ASCII text.
   */
  size: number;
  createdAt: Date;
  updatedAt: Date;
  /** null = live file; non-null = soft-deleted tombstone. */
  deletedAt: Date | null;
}

/**
 * Per-workspace quota document.
 *
 * Acts as the transaction mutex for atomic quota enforcement: every file
 * create/update/delete inside a MongoDB transaction reads and `$inc`s this
 * single document, so concurrent writes to different files in the same
 * workspace serialize on its document lock and cannot jointly exceed limits.
 */
export interface BuildWorkspaceQuotaDoc {
  userId: string;
  problemId: string;
  /** Live (non-tombstoned) file count. */
  fileCount: number;
  /** Sum of live file sizes in bytes. */
  totalBytes: number;
  /** Monotonic quota revision (incremented on every quota change). */
  rev: number;
  updatedAt: Date;
  createdAt: Date;
}
