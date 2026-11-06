import assert from "node:assert/strict";
import test from "node:test";
import {
  detectValidationTooling,
  redactValidationSecrets,
  runWorkspaceValidation,
  summarizeValidation,
} from "../../src/lib/buildos/validation.ts";

function basicWorkspace(overrides = {}) {
  return {
    "package.json": '{"name":"demo-project"}',
    "app/page.tsx": 'export default function Page() { return <main>hi</main>; }',
    ...overrides,
  };
}

test("static validation passes on a healthy workspace and reports honest statuses", async () => {
  const files = basicWorkspace();
  const summary = await runWorkspaceValidation({
    userId: "u1",
    problemId: "P1",
    executionId: "run-1",
    files,
  });

  assert.equal(summary.projectId, "P1");
  assert.equal(summary.executionId, "run-1");
  assert.equal(summary.passed, 2); // config + imports
  assert.equal(summary.failed, 0);
  assert.ok(summary.ok, "no failures and at least one executed check");

  const byId = new Map(summary.checks.map((c) => [c.id, c]));
  assert.equal(byId.get("config").status, "passed");
  assert.equal(byId.get("imports").status, "passed");
  // Toolchain checks are never silently passed. The workspace uses page.tsx,
  // so TypeScript applies and is reported blocked (toolchain unavailable),
  // while runtime is always reported as blocked (sandbox only).
  assert.equal(byId.get("typescript").status, "blocked");
  assert.equal(byId.get("runtime").status, "blocked");
  assert.equal(byId.get("runtime").executed, false);
});

test("missing local import is reported as a failed check with affected file", async () => {
  const files = {
    "package.json": '{"name":"demo-project"}',
    "app/page.tsx": 'import { Missing } from "./Missing";\nexport default function Page() { return <Missing />; }',
  };
  const summary = await runWorkspaceValidation({
    userId: "u1",
    problemId: "P1",
    executionId: "run-2",
    files,
  });

  const imports = summary.checks.find((c) => c.id === "imports");
  assert.equal(imports.status, "failed");
  assert.ok(imports.errors.some((e) => e.type === "MISSING_LOCAL_FILE"));
  assert.ok(imports.affectedFiles.includes("app/page.tsx") || imports.affectedFiles.includes("app/Missing.tsx"));
  assert.equal(summary.ok, false);
});

test("TypeScript tooling is detected but never reported as passed", async () => {
  const files = basicWorkspace({ "tsconfig.json": "{}", "app/helper.ts": "export const x = 1;" });
  const tooling = detectValidationTooling(files);
  assert.equal(tooling.hasTypeScript, true);
  assert.equal(tooling.hasBuildCommand, false);

  const summary = await runWorkspaceValidation({ userId: "u1", problemId: "P1", executionId: "r", files });
  const ts = summary.checks.find((c) => c.id === "typescript");
  assert.equal(ts.status, "blocked");
  assert.ok(ts.note && ts.note.length > 0);
});

test("lew task marker is flagged by the markers check", async () => {
  const files = {
    "package.json": '{"name":"demo-project"}',
    "app/page.tsx": 'export default function Page() { return <main>__WRITE_ME__</main>; }',
  };
  const summary = await runWorkspaceValidation({
    userId: "u1",
    problemId: "P1",
    executionId: "run-3",
    files,
    mission: { id: 1, ownership: "student", todoMarkers: ["__WRITE_ME__"], codeChecks: [] },
  });
  const markers = summary.checks.find((c) => c.id === "markers");
  assert.equal(markers.status, "failed");
  assert.ok(markers.errors.some((e) => e.type === "LEFTOVER_TASK_MARKER"));
});

test("a hanging validator is stopped and reported as blocked/timeout, not passed", async () => {
  const summary = await runWorkspaceValidation({
    userId: "u1",
    problemId: "P1",
    executionId: "run-4",
    files: basicWorkspace(),
    timeoutMs: 20,
    definitionsOverride: [
      {
        id: "hanging",
        kind: "config",
        label: "Hanging check",
        run: () => new Promise(() => { /* never resolves */ }),
      },
    ],
  });
  const hanging = summary.checks.find((c) => c.id === "hanging");
  assert.equal(hanging.status, "blocked");
  assert.equal(hanging.method, "guard:timeout");
  assert.equal(hanging.executed, false);
  assert.match(hanging.output, /allowed time/i);
});

test("output is bounded to the configured limit", async () => {
  const huge = "x".repeat(50_000);
  const summary = await runWorkspaceValidation({
    userId: "u1",
    problemId: "P1",
    executionId: "run-5",
    files: basicWorkspace(),
    limits: { maxCheckOutputChars: 500 },
    definitionsOverride: [
      {
        id: "noisy",
        kind: "config",
        label: "Noisy check",
        run: () => ({ status: "passed", method: "static:test", errors: [], warnings: [], affectedFiles: [], output: huge }),
      },
    ],
  });
  const noisy = summary.checks.find((c) => c.id === "noisy");
  assert.ok(noisy.output.length <= 510, `output bounded, got ${noisy.output.length}`);
});

test("secrets are redacted from results before they reach Nova", async () => {
  const secret = "sk-test-abcdefghijklmnopqrstuvwxyz";
  const summary = await runWorkspaceValidation({
    userId: "u1",
    problemId: "P1",
    executionId: "run-6",
    files: basicWorkspace(),
    definitionsOverride: [
      {
        id: "leaky",
        kind: "config",
        label: "Leaky check",
        run: () => ({ status: "failed", method: "static:test", errors: [{ type: "E", message: `token is ${secret}` }], warnings: [], affectedFiles: [], output: `found ${secret}` }),
      },
    ],
  });
  const leaky = summary.checks.find((c) => c.id === "leaky");
  assert.ok(!leaky.output.includes(secret));
  assert.ok(!leaky.errors[0].message.includes(secret));
  assert.ok(!summarizeValidation(summary).includes(secret));
  assert.ok(redactValidationSecrets(`key=${secret}`).includes("REDACTED"));
});

test("static validation never mutates the supplied workspace snapshot", async () => {
  const files = basicWorkspace();
  const before = JSON.stringify(files);
  await runWorkspaceValidation({ userId: "u1", problemId: "P1", executionId: "run-7", files });
  // Deterministic and read-only: same input twice yields identical summary.
  const a = await runWorkspaceValidation({ userId: "u1", problemId: "P1", executionId: "run-8", files });
  const b = await runWorkspaceValidation({ userId: "u1", problemId: "P1", executionId: "run-9", files });
  assert.equal(JSON.stringify(files), before);
  assert.equal(a.failed, b.failed);
  assert.equal(a.passed, b.passed);
});
