/**
 * MakeMistakes — P000001 Validate & Import Script
 * Validates P000001.json then performs a safe upsert into MongoDB `problems` collection.
 */

const dns = require("dns");
try { dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]); } catch (e) {}

const path = require("path");
const fs = require("fs");

// Load .env
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  });
}

const DATABASE_URL = process.env.DATABASE_URL;
const { MongoClient } = require(path.join(__dirname, "../node_modules/mongodb"));

// ─── STEP 1: LOAD & VALIDATE P000001.json ─────────────────────────────────
console.log("═══════════════════════════════════════════════════════════");
console.log("  MakeMistakes — P000001 Validation & Import");
console.log("═══════════════════════════════════════════════════════════\n");

const jsonPath = path.join(__dirname, "../data/P000001.json");
if (!fs.existsSync(jsonPath)) {
  console.error("❌ VALIDATION FAIL: data/P000001.json not found!");
  process.exit(1);
}

let doc;
try {
  doc = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
} catch (e) {
  console.error("❌ VALIDATION FAIL: P000001.json is not valid JSON:", e.message);
  process.exit(1);
}

let validationPassed = true;
const errors = [];

// Validate required fields
if (doc.problemId !== "P000001") errors.push(`problemId must be exactly "P000001", got: "${doc.problemId}"`);
if (!doc.title || doc.title.trim() === "") errors.push("title is empty");
if (!doc.problemStatement || doc.problemStatement.trim() === "") errors.push("problemStatement is empty");
if (!doc.relatedInformation || typeof doc.relatedInformation !== "object") errors.push("relatedInformation is missing or not an object");
if (!doc.quiz || !Array.isArray(doc.quiz)) errors.push("quiz is missing or not an array");
else {
  if (doc.quiz.length !== 5) errors.push(`quiz must have exactly 5 questions, got: ${doc.quiz.length}`);
  const ids = new Set();
  doc.quiz.forEach((q, i) => {
    if (!q.question || q.question.trim() === "") errors.push(`quiz[${i}].question is empty`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`quiz[${i}].options must have at least 2 options`);
    if (typeof q.correctIndex !== "number") errors.push(`quiz[${i}].correctIndex is missing or not a number`);
    if (!q.explanation || q.explanation.trim() === "") errors.push(`quiz[${i}].explanation is empty`);
    if (q.id !== undefined) {
      if (ids.has(q.id)) errors.push(`quiz question id ${q.id} is duplicated`);
      ids.add(q.id);
    }
  });
}

if (errors.length > 0) {
  validationPassed = false;
  console.error("❌ VALIDATION FAILED:");
  errors.forEach(e => console.error("   •", e));
  process.exit(1);
}

console.log("✅ VALIDATION PASSED");
console.log(`   problemId:         ${doc.problemId}`);
console.log(`   title:             ${doc.title}`);
console.log(`   problemStatement:  ${doc.problemStatement.substring(0, 80)}...`);
console.log(`   relatedInformation: present`);
console.log(`   quiz questions:    ${doc.quiz.length} / 5`);
doc.quiz.forEach((q, i) => {
  console.log(`     Q${i+1}: "${q.question.substring(0, 60)}..."`);
  console.log(`       options: ${q.options.length}, correctIndex: ${q.correctIndex}, explanation: ${q.explanation.length > 0 ? "✓" : "✗"}`);
});

// ─── STEP 2: MONGODB UPSERT ────────────────────────────────────────────────
async function importToMongoDB() {
  console.log("\n─── MongoDB Import ───────────────────────────────────────");

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env");
    process.exit(1);
  }

  const client = new MongoClient(DATABASE_URL);
  await client.connect();
  const db = client.db();
  const collection = db.collection("problems");

  const countBefore = await collection.countDocuments();
  console.log(`   Problems before import: ${countBefore}`);

  // Check if P000001 already exists
  const existing = await collection.findOne({ problemId: "P000001" });
  if (existing) {
    console.log("   P000001 already exists in DB — performing UPDATE (upsert).");
  } else {
    console.log("   P000001 not found — performing INSERT.");
  }

  // Prepare document (strip MongoDB _id if present from backup, let MongoDB assign new one)
  const importDoc = { ...doc };
  delete importDoc._id;
  importDoc.updatedAt = new Date().toISOString();

  const result = await collection.updateOne(
    { problemId: "P000001" },
    { $set: importDoc },
    { upsert: true }
  );

  const countAfter = await collection.countDocuments();
  console.log(`   Upsert result: matchedCount=${result.matchedCount}, modifiedCount=${result.modifiedCount}, upsertedCount=${result.upsertedCount}`);
  console.log(`   Problems after import: ${countAfter}`);

  // ─── STEP 3: VERIFICATION ──────────────────────────────────────────────
  console.log("\n─── MongoDB Verification ─────────────────────────────────");

  const saved = await collection.findOne({ problemId: "P000001" });

  if (!saved) {
    console.error("❌ VERIFICATION FAIL: P000001 not found after upsert!");
    await client.close();
    process.exit(1);
  }

  const titleMatch = saved.title === doc.title;
  const stmtMatch = saved.problemStatement === doc.problemStatement;
  const relInfoMatch = !!saved.relatedInformation;
  const quizCount = Array.isArray(saved.quiz) ? saved.quiz.length : 0;
  const optionsCount = Array.isArray(saved.quiz) ? saved.quiz.filter(q => Array.isArray(q.options) && q.options.length >= 2).length : 0;
  const answersCount = Array.isArray(saved.quiz) ? saved.quiz.filter(q => typeof q.correctIndex === "number").length : 0;
  const explCount = Array.isArray(saved.quiz) ? saved.quiz.filter(q => q.explanation && q.explanation.length > 0).length : 0;

  console.log(`   ✓ P000001 exists in DB:             YES`);
  console.log(`   ✓ Title matches:                    ${titleMatch ? "PASS" : "FAIL"}`);
  console.log(`   ✓ Problem statement matches:        ${stmtMatch ? "PASS" : "FAIL"}`);
  console.log(`   ✓ Related information present:      ${relInfoMatch ? "PASS" : "FAIL"}`);
  console.log(`   ✓ Quiz questions:                   ${quizCount} / 5`);
  console.log(`   ✓ Quiz options (≥2 per question):   ${optionsCount} / 5`);
  console.log(`   ✓ Correct answers:                  ${answersCount} / 5`);
  console.log(`   ✓ Explanations:                     ${explCount} / 5`);

  console.log("\n─── Indexes ──────────────────────────────────────────────");
  const indexes = await collection.indexes();
  indexes.forEach(idx => console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`));

  await client.close();

  // ─── FINAL REPORT ─────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  FINAL REPORT");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`JSON validation:          PASS`);
  console.log(`Problems before import:   ${countBefore}`);
  console.log(`Problems after import:    ${countAfter}`);
  console.log(`P000001 inserted/updated: YES`);
  console.log("");
  console.log("Content:");
  console.log(`  Problem statement:      ${stmtMatch ? "PASS" : "FAIL"}`);
  console.log(`  Related information:    ${relInfoMatch ? "PASS" : "FAIL"}`);
  console.log(`  Quiz questions:         ${quizCount} / 5`);
  console.log(`  Quiz options:           ${optionsCount} / 5`);
  console.log(`  Correct answers:        ${answersCount} / 5`);
  console.log(`  Explanations:           ${explCount} / 5`);
  console.log("");
  console.log("Current problem:          P000001");
  console.log("");
  console.log("NOTE: NO PROBLEM STATEMENTS OTHER THAN P000001 WERE IMPORTED.");
  console.log("═══════════════════════════════════════════════════════════\n");
}

importToMongoDB().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
