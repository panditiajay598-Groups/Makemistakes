import assert from "node:assert/strict";
import test from "node:test";
import { generatePersonalDataPdf } from "../../src/lib/pdfExport.ts";
import { PDFParse } from "pdf-parse";

test("PDF export generates a valid PDF-1.4 document buffer", async () => {
  const payload = {
    user: "usr_qa_test",
    email: "qa@makemistakes.test",
    exportedAt: "2026-11-11T10:00:00.000Z",
    profile: {
      name: "QA Student",
      role: "student",
      bio: "Learning systems architecture and product engineering.",
      githubUsername: "qastudent",
    },
    preferences: {
      theme: "dark",
      autoSave: true,
      emailNotifications: true,
      aiMentorStyle: "Guided Learning",
    },
    journeysCount: 2,
    journeys: [
      {
        problemId: "problem_chat_app",
        problemTitle: "Realtime Chat Application",
        currentPhase: "Phase 5 - Build",
        status: "Active",
        updatedAt: "2026-11-10T12:00:00.000Z",
      },
      {
        problemId: "problem_auth_gateway",
        problemTitle: "OAuth & Session Auth Gateway",
        currentPhase: "Phase 9 - Validate",
        status: "Completed",
        updatedAt: "2026-11-09T08:30:00.000Z",
      },
    ],
    completionsCount: 1,
    completions: [
      {
        problemId: "problem_auth_gateway",
        completedAt: "2026-11-09T08:30:00.000Z",
        score: 100,
      },
    ],
    workspacesCount: 1,
    workspaces: [
      {
        problemId: "problem_chat_app",
        updatedAt: "2026-11-10T14:00:00.000Z",
      },
    ],
  };

  const buffer = generatePersonalDataPdf(payload);

  assert.ok(Buffer.isBuffer(buffer), "Result must be a Buffer");
  assert.ok(buffer.length > 500, "Buffer size should be reasonable");

  const pdfString = buffer.toString("latin1");
  assert.ok(pdfString.startsWith("%PDF-1.4"), "Must start with PDF-1.4 header");
  assert.ok(pdfString.trimEnd().endsWith("%%EOF"), "Must end with %%EOF marker");

  // Parse with pdf-parse to verify structure
  const parser = new PDFParse(new Uint8Array(buffer));
  const parsed = await parser.getText();

  assert.ok(parsed.total >= 1, "Must contain at least 1 page");
  assert.ok(parsed.text.includes("MakeMistakes BuildOS"), "Must include brand header");
  assert.ok(parsed.text.includes("Personal Data & Account Learning Export Report"), "Must include report title");
  assert.ok(parsed.text.includes("usr_qa_test"), "Must include user ID");
  assert.ok(parsed.text.includes("qa@makemistakes.test"), "Must include email");
  assert.ok(parsed.text.includes("Realtime Chat Application"), "Must include journey title");
  assert.ok(parsed.text.includes("OAuth & Session Auth Gateway"), "Must include completed problem title");
});

test("PDF export handles empty or missing data records gracefully without throwing", async () => {
  const minimalPayload = {
    user: "usr_minimal",
    email: null,
    exportedAt: new Date().toISOString(),
    profile: null,
    preferences: null,
    journeysCount: 0,
    journeys: [],
    completionsCount: 0,
    completions: [],
    workspacesCount: 0,
    workspaces: [],
  };

  const buffer = generatePersonalDataPdf(minimalPayload);
  assert.ok(buffer.length > 500);

  const parser = new PDFParse(new Uint8Array(buffer));
  const parsed = await parser.getText();

  assert.ok(parsed.text.includes("usr_minimal"));
  assert.ok(parsed.text.includes("No product journeys started yet"));
  assert.ok(parsed.text.includes("No verified problem completions yet"));
  assert.ok(parsed.text.includes("No separate BuildOS workspaces registered"));
});

test("PDF export automatically paginates multi-item data onto multiple pages", async () => {
  const journeys = Array.from({ length: 30 }, (_, i) => ({
    problemId: `problem_${i + 1}`,
    problemTitle: `Project Item #${i + 1} with a lengthy descriptive name for testing wrapping`,
    currentPhase: `Phase ${(i % 9) + 1} - Step`,
    status: i % 2 === 0 ? "Completed" : "Active",
    updatedAt: "2026-11-10T10:00:00.000Z",
  }));

  const largePayload = {
    user: "usr_large_portfolio",
    email: "portfolio@example.com",
    exportedAt: new Date().toISOString(),
    profile: { name: "Prolific Builder" },
    preferences: { theme: "light" },
    journeysCount: journeys.length,
    journeys,
    completionsCount: 0,
    completions: [],
    workspacesCount: 0,
    workspaces: [],
  };

  const buffer = generatePersonalDataPdf(largePayload);
  const parser = new PDFParse(new Uint8Array(buffer));
  const parsed = await parser.getText();

  assert.ok(parsed.total >= 2, "30 journey items must span across multiple pages");
  assert.ok(parsed.text.includes("Page 1 of"));
});

test("PDF export handles raw MongoDB Date objects, numbers, and BSON types without e.split error", async () => {
  const mongoPayload = {
    user: "panditiajay598@gmail.com",
    email: "panditiajay598@gmail.com",
    exportedAt: new Date().toISOString(),
    profile: {
      name: "Ajay Panditi",
      role: "student",
      createdAt: new Date("2026-01-15T08:00:00Z"),
      bio: "Learning to build real products",
    },
    preferences: {
      theme: "dark",
      autoSave: true,
      emailNotifications: false,
    },
    journeysCount: 2,
    journeys: [
      {
        problemId: "portfolio-builder",
        problemTitle: "Interactive Portfolio",
        currentPhase: "Phase 5 - Build",
        status: "Active",
        updatedAt: new Date("2026-11-10T12:00:00Z"),
        lastActivityAt: new Date("2026-11-11T09:00:00Z"),
      },
      {
        problemId: "ecommerce-checkout",
        currentPhase: "Phase 1 - Discover",
        status: "In Progress",
        updatedAt: new Date(),
      },
    ],
    completionsCount: 1,
    completions: [
      {
        problemId: "portfolio-builder",
        completedAt: new Date("2026-11-10T15:00:00Z"),
        score: 95,
      },
    ],
    workspacesCount: 1,
    workspaces: [
      {
        problemId: "portfolio-builder",
        updatedAt: new Date(),
      },
    ],
  };

  // Must execute cleanly without throwing "e.split is not a function"
  const buffer = generatePersonalDataPdf(mongoPayload);
  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 500);

  const parser = new PDFParse(new Uint8Array(buffer));
  const parsed = await parser.getText();

  assert.ok(parsed.text.includes("panditiajay598@gmail.com"));
  assert.ok(parsed.text.includes("Ajay Panditi"));
  assert.ok(parsed.text.includes("Interactive Portfolio"));
  assert.ok(parsed.text.includes("95%"));
});

