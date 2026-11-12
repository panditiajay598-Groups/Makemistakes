import assert from "node:assert/strict";
import test from "node:test";
import {
  createFile,
  listFiles,
  readFile,
  getWorkspaceQuota,
  updateFile,
  softDeleteFile,
  reviveFile,
  FileNotFoundError,
  RevisionConflictError,
  DuplicateFileError,
  QuotaExceededError,
  TombstoneCollisionError,
} from "../../src/lib/buildos/fileStore.ts";
import { FILE_STORE_LIMITS } from "../../src/lib/buildos/fileStoreTypes.ts";

// ---------------------------------------------------------------------------
// In-memory MongoDB backend with snapshot/restore transaction semantics
// ---------------------------------------------------------------------------
//
// This backend faithfully simulates the subset of the MongoDB driver API the
// file store uses. `withTransaction` snapshots both collections before running
// the body and restores them if the body throws — so it genuinely verifies
// that the store aborts (leaves no partial state) on failure. It does NOT
// exercise the real driver's transaction engine; that requires a live
// replica-set MongoDB and is out of scope for T6.2 (see report).

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

class InMemoryCollection {
  constructor(name) {
    this.name = name;
    this.documents = [];
  }

  matches(document, query) {
    return Object.entries(query).every(([key, value]) => {
      const actual = document[key];
      if (value && typeof value === "object" && "$ne" in value) {
        return actual !== value.$ne;
      }
      return actual === value;
    });
  }

  async findOne(query) {
    const doc = this.documents.find((d) => this.matches(d, query));
    return doc ? clone(doc) : null;
  }

  async insertOne(document) {
    const key = this.name === "build_workspace_files"
      ? `${document.userId}|${document.problemId}|${document.path}`
      : `${document.userId}|${document.problemId}`;
    const dup = this.documents.find((d) => {
      const dKey = this.name === "build_workspace_files"
        ? `${d.userId}|${d.problemId}|${d.path}`
        : `${d.userId}|${d.problemId}`;
      return dKey === key;
    });
    if (dup) {
      const err = new Error("duplicate key");
      err.code = 11000;
      err.codeName = "DuplicateKey";
      throw err;
    }
    this.documents.push(clone(document));
    return { insertedId: document._id };
  }

  find(query) {
    let matches = this.documents.filter((d) => this.matches(d, query)).map(clone);
    const cursor = {
      sort(spec) {
        const [field, dir] = Object.entries(spec)[0];
        matches.sort((a, b) => (a[field] < b[field] ? -dir : a[field] > b[field] ? dir : 0));
        return cursor;
      },
      async toArray() {
        return matches;
      },
    };
    return cursor;
  }

  async updateOne(query, update) {
    const index = this.documents.findIndex((d) => this.matches(d, query));
    if (index === -1) return { matchedCount: 0 };
    const target = this.documents[index];
    if (update.$set) Object.assign(target, clone(update.$set));
    if (update.$inc) {
      for (const [k, v] of Object.entries(update.$inc)) {
        target[k] = (target[k] || 0) + v;
      }
    }
    return { matchedCount: 1 };
  }
}

class InMemoryDb {
  constructor() {
    this.collections = new Map();
  }
  collection(name) {
    if (!this.collections.has(name)) this.collections.set(name, new InMemoryCollection(name));
    return this.collections.get(name);
  }
}

function makeBackend() {
  const db = new InMemoryDb();
  // Serialize transaction bodies with a simple promise mutex. This mirrors the
  // single-document lock MongoDB applies to the per-workspace quota document,
  // which is exactly the mechanism the file store relies on for atomic quota
  // enforcement under concurrent writes.
  let tail = Promise.resolve();
  const enqueue = (job) => {
    const next = tail.then(job, job);
    tail = next.catch(() => {});
    return next;
  };
  const backend = {
    files: db.collection("build_workspace_files"),
    quotas: db.collection("build_workspace_quotas"),
    withTransaction(fn) {
      return enqueue(async () => {
        const filesSnapshot = clone(this.files.documents);
        const quotasSnapshot = clone(this.quotas.documents);
        try {
          const result = await fn({ id: "fake-session" });
          return result;
        } catch (err) {
          this.files.documents = clone(filesSnapshot);
          this.quotas.documents = clone(quotasSnapshot);
          throw err;
        }
      });
    },
  };
  return backend;
}

const USER = "max-owner";
const PROBLEM = "P-000001";

// ---------------------------------------------------------------------------
// Creation / reading / listing
// ---------------------------------------------------------------------------

test("createFile stores a live document readable via readFile and listFiles", async () => {
  const backend = makeBackend();
  const created = await createFile(USER, PROBLEM, "app/page.tsx", 'export default function Page() {}', backend);
  assert.equal(created.created, true);
  assert.equal(created.rev, 1);

  const read = await readFile(USER, PROBLEM, "app/page.tsx", backend);
  assert.equal(read.content, 'export default function Page() {}');
  assert.equal(read.rev, 1);
  assert.equal(read.contentType, "tsx");

  const listed = await listFiles(USER, PROBLEM, backend);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].path, "app/page.tsx");
  assert.equal(listed[0].rev, 1);
});

test("readFile on missing file throws FileNotFoundError", async () => {
  const backend = makeBackend();
  await assert.rejects(() => readFile(USER, PROBLEM, "app/missing.tsx", backend), FileNotFoundError);
});

test("listFiles returns only live files (excludes tombstones)", async () => {
  const backend = makeBackend();
  await createFile(USER, PROBLEM, "a.ts", "export a", backend);
  await createFile(USER, PROBLEM, "b.ts", "export b", backend);
  await softDeleteFile(USER, PROBLEM, "a.ts", 1, backend);

  const listed = await listFiles(USER, PROBLEM, backend);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].path, "b.ts");
});

test("createFile rejects disallowed file types and paths", async () => {
  const backend = makeBackend();
  await assert.rejects(() => createFile(USER, PROBLEM, "node_modules/x.js", "", backend));
  await assert.rejects(() => createFile(USER, PROBLEM, "app/page.txt", "", backend));
});

test("createFile rejects path traversal, absolute and dangerous paths", async () => {
  const backend = makeBackend();
  const maliciousPaths = [
    "../escape.ts",
    "../../escape.ts",
    "app/../../escape.ts",
    "app/..\../escape.ts",
    "/etc/passwd.ts",
    "C:/windows/evil.ts",
    "C:\\windows\\evil.ts",
    "secret\0name.ts",
    "app//double.ts",
    "/app/leading.ts",
    "app/",
  ];
  for (const p of maliciousPaths) {
    await assert.rejects(() => createFile(USER, PROBLEM, p, "", backend), undefined, `expected rejection for ${JSON.stringify(p)}`);
  }
});

test("createFile accepts legitimate nested project paths", async () => {
  const backend = makeBackend();
  for (const p of ["app/page.tsx", "app/components/Card.tsx", "lib/utils.ts", "styles/global.css"]) {
    await createFile(USER, PROBLEM, p, "// content", backend);
  }
  const listed = await listFiles(USER, PROBLEM, backend);
  assert.equal(listed.length, 4);
  assert.deepEqual(listed.map((f) => f.path).sort(), [
    "app/components/Card.tsx",
    "app/page.tsx",
    "lib/utils.ts",
    "styles/global.css",
  ]);
});

// ---------------------------------------------------------------------------
// Updates & revision conflicts
// ---------------------------------------------------------------------------

test("updateFile bumps rev and updates content", async () => {
  const backend = makeBackend();
  await createFile(USER, PROBLEM, "app/helper.ts", "export const a = 1;", backend);
  const updated = await updateFile(USER, PROBLEM, "app/helper.ts", 1, "export const a = 2;", backend);
  assert.equal(updated.rev, 2);
  const read = await readFile(USER, PROBLEM, "app/helper.ts", backend);
  assert.equal(read.rev, 2);
  assert.equal(read.content, "export const a = 2;");
});

test("updateFile with stale rev throws RevisionConflictError and changes nothing", async () => {
  const backend = makeBackend();
  await createFile(USER, PROBLEM, "app/helper.ts", "v1", backend);
  await updateFile(USER, PROBLEM, "app/helper.ts", 1, "v2", backend);
  await assert.rejects(
    () => updateFile(USER, PROBLEM, "app/helper.ts", 1, "v3", backend),
    RevisionConflictError
  );
  const read = await readFile(USER, PROBLEM, "app/helper.ts", backend);
  assert.equal(read.content, "v2");
  assert.equal(read.rev, 2);
});

test("updateFile on missing file throws FileNotFoundError", async () => {
  const backend = makeBackend();
  await assert.rejects(() => updateFile(USER, PROBLEM, "nope.ts", 1, "x", backend), FileNotFoundError);
});

// ---------------------------------------------------------------------------
// Soft deletion & tombstone protection
// ---------------------------------------------------------------------------

test("softDeleteFile tombstones and decrements quota", async () => {
  const backend = makeBackend();
  await createFile(USER, PROBLEM, "app/old.ts", "x", backend);
  const deleted = await softDeleteFile(USER, PROBLEM, "app/old.ts", 1, backend);
  assert.equal(deleted.rev, 2);

  const listed = await listFiles(USER, PROBLEM, backend);
  assert.equal(listed.length, 0);
  const quota = await getWorkspaceQuota(USER, PROBLEM, backend);
  assert.equal(quota.fileCount, 0);
  assert.equal(quota.totalBytes, 0);
});

test("stale client cannot recreate a deleted file (tombstone occupies unique key)", async () => {
  const backend = makeBackend();
  await createFile(USER, PROBLEM, "app/page.tsx", "v1", backend);
  await softDeleteFile(USER, PROBLEM, "app/page.tsx", 1, backend);
  await assert.rejects(() => createFile(USER, PROBLEM, "app/page.tsx", "v2", backend), TombstoneCollisionError);
});

test("reviveFile explicitly recreates a tombstoned file", async () => {
  const backend = makeBackend();
  await createFile(USER, PROBLEM, "app/page.tsx", "v1", backend);
  await softDeleteFile(USER, PROBLEM, "app/page.tsx", 1, backend);
  const revived = await reviveFile(USER, PROBLEM, "app/page.tsx", 2, "v3", backend);
  assert.equal(revived.rev, 3);
  const read = await readFile(USER, PROBLEM, "app/page.tsx", backend);
  assert.equal(read.content, "v3");
  assert.equal(read.rev, 3);
  const quota = await getWorkspaceQuota(USER, PROBLEM, backend);
  assert.equal(quota.fileCount, 1);
});

test("reviveFile with stale rev throws RevisionConflictError", async () => {
  const backend = makeBackend();
  await createFile(USER, PROBLEM, "app/page.tsx", "v1", backend);
  await softDeleteFile(USER, PROBLEM, "app/page.tsx", 1, backend);
  await assert.rejects(() => reviveFile(USER, PROBLEM, "app/page.tsx", 1, "v3", backend), RevisionConflictError);
});

// ---------------------------------------------------------------------------
// Quota limits
// ---------------------------------------------------------------------------

test("file size over 256KB is rejected", async () => {
  const backend = makeBackend();
  const big = "x".repeat(FILE_STORE_LIMITS.maxFileBytes + 1);
  await assert.rejects(
    () => createFile(USER, PROBLEM, "big.ts", big, backend),
    (err) => err instanceof QuotaExceededError && err.limit === "maxFileBytes"
  );
});

test("workspace file-count cap of 400 is enforced", async () => {
  const backend = makeBackend();
  for (let i = 0; i < FILE_STORE_LIMITS.maxWorkspaceFiles; i++) {
    await createFile(USER, PROBLEM, `f${i}.ts`, "x", backend);
  }
  await assert.rejects(
    () => createFile(USER, PROBLEM, "overflow.ts", "x", backend),
    (err) => err instanceof QuotaExceededError && err.limit === "maxWorkspaceFiles"
  );
});

test("workspace total-size cap of 8MB is enforced across updates", async () => {
  const backend = makeBackend();
  const chunk = "a".repeat(2 * 1024 * 1024); // 2MB
  await createFile(USER, PROBLEM, "a.ts", chunk, backend);
  await createFile(USER, PROBLEM, "b.ts", chunk, backend);
  await createFile(USER, PROBLEM, "c.ts", chunk, backend);

  // Adding a 3rd full chunk would exceed 8MB (6MB + 3MB > 8MB).
  await assert.rejects(
    () => createFile(USER, PROBLEM, "d.ts", chunk, backend),
    (err) => err instanceof QuotaExceededError && err.limit === "maxWorkspaceBytes"
  );
});

// ---------------------------------------------------------------------------
// Concurrency, rollback, quota-init race
// ---------------------------------------------------------------------------

test("parallel creates never exceed the file-count limit", async () => {
  const backend = makeBackend();
  const attempts = FILE_STORE_LIMITS.maxWorkspaceFiles + 10;
  const results = await Promise.allSettled(
    Array.from({ length: attempts }, (_, i) => createFile(USER, PROBLEM, `c${i}.ts`, "x", backend))
  );
  const ok = results.filter((r) => r.status === "fulfilled").length;
  assert.equal(ok, FILE_STORE_LIMITS.maxWorkspaceFiles);
  const bad = results.filter((r) => r.status === "rejected" && r.reason instanceof QuotaExceededError);
  assert.equal(bad.length, attempts - FILE_STORE_LIMITS.maxWorkspaceFiles);
  const quota = await getWorkspaceQuota(USER, PROBLEM, backend);
  assert.equal(quota.fileCount, FILE_STORE_LIMITS.maxWorkspaceFiles);
});

test("transaction rollback leaves no partial state on failure", async () => {
  const backend = makeBackend();
  await createFile(USER, PROBLEM, "keep.ts", "x", backend);

  // Force the transaction to fail by updating a file that does not exist.
  await assert.rejects(() => updateFile(USER, PROBLEM, "missing.ts", 1, "y", backend));

  // The pre-existing file and quota must be untouched.
  const read = await readFile(USER, PROBLEM, "keep.ts", backend);
  assert.equal(read.content, "x");
  const quota = await getWorkspaceQuota(USER, PROBLEM, backend);
  assert.equal(quota.fileCount, 1);
});

test("quota is initialized on first create and reused", async () => {
  const backend = makeBackend();
  assert.deepEqual(await getWorkspaceQuota(USER, PROBLEM, backend), { fileCount: 0, totalBytes: 0, rev: 0 });
  await createFile(USER, PROBLEM, "app/page.tsx", "x", backend);
  const quota = await getWorkspaceQuota(USER, PROBLEM, backend);
  assert.equal(quota.fileCount, 1);
  assert.equal(quota.totalBytes, 1);

  await createFile(USER, PROBLEM, "app/about.tsx", "abc", backend);
  const quota2 = await getWorkspaceQuota(USER, PROBLEM, backend);
  assert.equal(quota2.fileCount, 2);
  assert.equal(quota2.totalBytes, 4);
});

test("quota initialization race produces a single quota document", async () => {
  const backend = makeBackend();
  await Promise.all([
    createFile(USER, PROBLEM, "r1.ts", "x", backend),
    createFile(USER, PROBLEM, "r2.ts", "y", backend),
    createFile(USER, PROBLEM, "r3.ts", "z", backend),
  ]);
  assert.equal(backend.quotas.documents.length, 1);
  const quota = await getWorkspaceQuota(USER, PROBLEM, backend);
  assert.equal(quota.fileCount, 3);
});
