#!/usr/bin/env node
/**
 * create_synthetic_students.mjs — Create two SYNTHETIC student accounts in the
 * DEVELOPMENT database only.
 *
 * Safety:
 *   - Refuses to run unless DATABASE_URL targets a development/local database.
 *   - Refuses to run without explicit approval (--yes or APPROVED=1).
 *   - Never connects to the production database and never copies production data.
 *   - Idempotent: skips emails that already exist.
 *
 * Usage:
 *   node scripts/create_synthetic_students.mjs --yes
 *
 * Optional overrides:
 *   STUDENT_PASSWORD=...     required; provide through a local ignored env file
 *   STUDENT_ONE_EMAIL=...    default: dev.student.one@makemistakes.test
 *   STUDENT_TWO_EMAIL=...    default: dev.student.two@makemistakes.test
 */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { connectVerifiedDevDatabase } from "./dev_database_identity.mjs";

const ROOT = process.cwd();
const APPROVED = process.argv.includes("--yes") || process.env.APPROVED === "1";

const STUDENTS = [
  {
    email: (process.env.STUDENT_ONE_EMAIL || "dev.student.one@makemistakes.test").toLowerCase(),
    name: "Dev Student One",
  },
  {
    email: (process.env.STUDENT_TWO_EMAIL || "dev.student.two@makemistakes.test").toLowerCase(),
    name: "Dev Student Two",
  },
];

function loadLocalEnv() {
  for (const name of [".env.local", ".env.development.local", ".env"]) {
    const p = path.join(ROOT, name);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

loadLocalEnv();

if (!APPROVED) {
  console.error(
    "⚠️  This creates synthetic student accounts in the DEV database. It will NOT touch production."
  );
  console.error("    Re-run with --yes once you approve:  node scripts/create_synthetic_students.mjs --yes");
  process.exit(1);
}

const DEV_PASSWORD = process.env.STUDENT_PASSWORD;
if (!DEV_PASSWORD) {
  console.error("Set STUDENT_PASSWORD in a local ignored environment file before creating dev accounts.");
  process.exit(1);
}

let client;
try {
  const verified = await connectVerifiedDevDatabase();
  client = verified.client;
  const db = verified.db;
  console.log("Verified target database:", verified.identity.host, "/", verified.identity.database);
  const users = db.collection("User");

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  const now = new Date();

  for (const s of STUDENTS) {
    const existing = await users.findOne({ email: s.email });
    if (existing) {
      console.log(`  - ${s.email}: already exists (skipped)`);
      continue;
    }
    await users.insertOne({
      email: s.email,
      name: s.name,
      role: "student",
      emailVerified: true,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`  + ${s.email}: created (role=student, emailVerified=true)`);
  }

  console.log("");
  console.log("✅ Synthetic student accounts ready in the DEV database.");
  console.log("   Production database was not touched. No production records were copied.");
} catch (err) {
  console.error("❌ Synthetic student setup failed.", {
    errorName: err instanceof Error ? err.name : "UnknownError",
    code: err && typeof err === "object" && "code" in err ? err.code : undefined,
  });
  process.exit(1);
} finally {
  if (client) await client.close();
}
