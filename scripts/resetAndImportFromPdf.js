/**
 * Wipe MongoDB `problems` (after backup) and freshly import from:
 * problem_statements_with_info_and_quizzes_segment.pdf
 *
 * Fields imported per problem:
 * - problemStatement / title
 * - relatedInformation (context, existingGaps, opportunity)
 * - quiz (5 MCQs with correctIndex + explanation)
 */

const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const { PDFParse } = require("pdf-parse");

const ROOT = path.join(__dirname, "..");
const PDF_PATH = path.join(ROOT, "problem_statements_with_info_and_quizzes_segment.pdf");
const EXTRACT_PATH = path.join(ROOT, "data", "pdf_enriched_extract.txt");
const JSON_OUT = path.join(ROOT, "data", "problems_from_pdf.json");
const BACKUP_PATH = path.join(ROOT, "data", "backup_problems.json");

// Load .env
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  });
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not set in .env");
  process.exit(1);
}

const FOOTER_RE =
  /Real-Time Problem Statements[^\n]*\n?Page \d+ of \d+\t?Problem Statements with Related Information & 5-Question Quiz/g;
const PART_HEADER_RE =
  /PART — (BEGINNER|INTERMEDIATE|ADVANCED) PROBLEMS[\s\S]*?(?=Total (?:Beginner|Intermediate|Advanced) Problems:[^\n]*\n)/g;

function cleanExtractedText(raw) {
  return raw
    .replace(FOOTER_RE, "\n")
    .replace(/Page \d+ of \d+\t?Problem Statements with Related Information & 5-Question Quiz/g, "\n")
    .replace(PART_HEADER_RE, "\n")
    .replace(/Total (?:Beginner|Intermediate|Advanced) Problems:[^\n]*\n/g, "\n")
    .replace(/\r/g, "");
}

function mapSource(rawSource) {
  const s = (rawSource || "").trim();
  if (/razorpay|fix my itch/i.test(s)) {
    return { name: "Fix My Itch by Razorpay", type: "open_problem" };
  }
  if (/loot\s*drop/i.test(s)) {
    return { name: "Loot Drop", type: "failed_startup" };
  }
  return { name: s || "Unknown", type: "open_problem" };
}

function difficultyLabel(tag) {
  const t = (tag || "").toUpperCase();
  if (t === "BEGINNER") return "Beginner";
  if (t === "INTERMEDIATE") return "Intermediate";
  if (t === "ADVANCED") return "Advanced";
  return null;
}

function splitRelatedParagraphs(relatedText) {
  const normalized = relatedText.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  const starters = [
    /From a regulatory perspective/i,
    /Adoption barriers remain/i,
    /The market opportunity unlocked/i,
  ];

  let parts = [];
  let remaining = normalized;

  // First paragraph: everything before "From a regulatory perspective"
  const regIdx = remaining.search(/From a regulatory perspective/i);
  if (regIdx > 0) {
    parts.push(remaining.slice(0, regIdx).trim());
    remaining = remaining.slice(regIdx).trim();
  }

  const adoptIdx = remaining.search(/Adoption barriers remain/i);
  if (adoptIdx > 0) {
    parts.push(remaining.slice(0, adoptIdx).trim());
    parts.push(remaining.slice(adoptIdx).trim());
  } else if (remaining) {
    parts.push(remaining);
  }

  if (parts.length === 0 && normalized) parts = [normalized];
  return parts.filter(Boolean);
}

function parseQuiz(quizBlock) {
  const questions = [];
  const qBlocks = quizBlock.split(/(?=Q[1-5]\s*:)/).filter((b) => /^Q[1-5]\s*:/.test(b.trim()));

  for (const block of qBlocks) {
    const qMatch = block.match(/^Q([1-5])\s*:\s*([\s\S]*?)(?=\n\s*\[A\])/);
    if (!qMatch) continue;

    const num = Number(qMatch[1]);
    const question = qMatch[2].replace(/\s+/g, " ").trim().replace(/\?+$/, "?");

    const optA = block.match(/\[A\]\s*([\s\S]*?)(?=\n\s*\[B\])/);
    const optB = block.match(/\[B\]\s*([\s\S]*?)(?=\n\s*\[C\])/);
    const optC = block.match(/\[C\]\s*([\s\S]*?)(?=\n\s*\[D\])/);
    const optD = block.match(/\[D\]\s*([\s\S]*?)(?=\n\s*Answer\s*:)/i);
    const ans = block.match(/Answer\s*:\s*Option\s*([A-D])\s*[—\-–-]?\s*([\s\S]*?)(?=\n\s*Q[1-5]\s*:|$)/i);

    if (!optA || !optB || !optC || !optD || !ans) continue;

    const options = [optA[1], optB[1], optC[1], optD[1]].map((o) =>
      o.replace(/\s+/g, " ").trim().replace(/[.]+$/, "").trim()
    );
    const letter = ans[1].toUpperCase();
    const correctIndex = { A: 0, B: 1, C: 2, D: 3 }[letter];
    const explanation = ans[2].replace(/\s+/g, " ").trim();

    questions.push({
      id: num,
      questionNumber: String(num).padStart(2, "0"),
      question,
      options,
      correctIndex,
      explanation,
      xp: 10,
    });
  }

  return questions;
}

function parseProblems(fullText) {
  const cleaned = cleanExtractedText(fullText);
  const starts = [...cleaned.matchAll(/#(\d+)\.\s+/g)];
  const problems = [];
  const errors = [];

  for (let i = 0; i < starts.length; i++) {
    const num = Number(starts[i][1]);
    const startIdx = starts[i].index;
    const endIdx = i + 1 < starts.length ? starts[i + 1].index : cleaned.length;
    const chunk = cleaned.slice(startIdx, endIdx).trim();

    try {
      const header = chunk.match(
        /^#(\d+)\.\s+([\s\S]*?)\n\s*\[(BEGINNER|INTERMEDIATE|ADVANCED)\]\s*\|\s*Category:\s*([^|]+)\|\s*Country:\s*([^|]+)\|\s*Source:\s*([^\n]+)/i
      );
      if (!header) {
        errors.push({ problemNum: num, error: "Failed to parse header/metadata" });
        continue;
      }

      const title = header[2].replace(/\s+/g, " ").trim();
      const difficulty = difficultyLabel(header[3]);
      const category = header[4].trim();
      const country = header[5].trim();
      const source = mapSource(header[6]);

      const relatedMatch = chunk.match(
        /RELATED INFORMATION:\s*([\s\S]*?)(?=\n\s*5-QUESTION QUIZ:)/i
      );
      const quizMatch = chunk.match(/5-QUESTION QUIZ:\s*([\s\S]*)$/i);

      if (!relatedMatch) {
        errors.push({ problemNum: num, error: "Missing RELATED INFORMATION" });
        continue;
      }
      if (!quizMatch) {
        errors.push({ problemNum: num, error: "Missing 5-QUESTION QUIZ" });
        continue;
      }

      const paragraphs = splitRelatedParagraphs(relatedMatch[1]);
      const quiz = parseQuiz(quizMatch[1]);

      if (quiz.length !== 5) {
        errors.push({
          problemNum: num,
          error: `Expected 5 quiz questions, got ${quiz.length}`,
        });
        continue;
      }

      const now = new Date().toISOString();
      const problemId = `P${String(num).padStart(6, "0")}`;

      problems.push({
        problemId,
        title,
        problemStatement: title,
        category,
        difficulty,
        country,
        source,
        relatedInformation: {
          context: paragraphs[0] || relatedMatch[1].replace(/\s+/g, " ").trim(),
          affectedParties: [],
          existingGaps: paragraphs[1] ? [paragraphs[1]] : [],
          opportunity: paragraphs[2] || paragraphs[paragraphs.length - 1] || "",
        },
        quiz,
        metadata: {
          itchScore: null,
          sector: category,
          country,
          years: { start: null, end: null },
          funding: null,
          originalStartup: source.type === "failed_startup" ? title.split(/—|–|-/)[0].trim() : null,
          failureReason: null,
        },
        learning: {
          level: difficulty,
          difficulty,
          thinkingComplexity: null,
          technicalComplexity: null,
          ambiguity: null,
          researchDepth: null,
          systemComplexity: null,
        },
        skills: [],
        prerequisites: [],
        estimatedHours: null,
        status: "active",
        createdAt: now,
        updatedAt: now,
        pdfSource: "problem_statements_with_info_and_quizzes_segment.pdf",
        pdfProblemNumber: num,
      });
    } catch (err) {
      errors.push({ problemNum: num, error: err.message });
    }
  }

  return { problems, errors };
}

async function extractPdfText() {
  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(`PDF not found: ${PDF_PATH}`);
  }

  console.log("Extracting PDF text (2618 pages — this may take a few minutes)...");
  const buf = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buf });
  const info = await parser.getInfo();
  const totalPages = info.total;
  console.log(`   PDF pages: ${totalPages}`);

  const batchSize = 100;
  const parts = [];

  for (let first = 1; first <= totalPages; first += batchSize) {
    const last = Math.min(first + batchSize - 1, totalPages);
    const result = await parser.getText({ first, last });
    for (const page of result.pages) {
      parts.push(`=== PAGE ${page.num} ===\n${page.text}`);
    }
    process.stdout.write(`   Extracted pages ${first}-${last} / ${totalPages}\r`);
  }
  console.log(`\n   Extraction complete.`);

  await parser.destroy?.();

  const fullText = parts.join("\n\n");
  fs.mkdirSync(path.dirname(EXTRACT_PATH), { recursive: true });
  fs.writeFileSync(EXTRACT_PATH, fullText, "utf8");
  console.log(`   Saved extract: ${EXTRACT_PATH}`);
  return fullText;
}

async function resetAndImport(problems) {
  const client = new MongoClient(DATABASE_URL);
  await client.connect();
  const db = client.db();
  const collection = db.collection("problems");

  console.log(`\nConnected to DB: "${db.databaseName}"`);

  const before = await collection.countDocuments();
  console.log(`Problems before reset: ${before}`);

  // Backup
  const existing = await collection.find({}).toArray();
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(existing, null, 2), "utf8");
  console.log(`Backup saved: ${BACKUP_PATH} (${existing.length} docs)`);

  // Wipe
  const del = await collection.deleteMany({});
  console.log(`Deleted ${del.deletedCount} documents from problems`);

  // Indexes
  await collection.createIndex({ problemId: 1 }, { unique: true, name: "idx_unique_problemId" });
  await collection.createIndex({ "source.name": 1 }, { name: "idx_source_name" });
  await collection.createIndex({ "source.type": 1 }, { name: "idx_source_type" });
  await collection.createIndex({ category: 1 }, { name: "idx_category" });
  await collection.createIndex({ difficulty: 1 }, { name: "idx_difficulty" });
  await collection.createIndex({ status: 1 }, { name: "idx_status" });

  // Bulk insert
  const batchSize = 200;
  let inserted = 0;
  for (let i = 0; i < problems.length; i += batchSize) {
    const batch = problems.slice(i, i + batchSize).map((doc) => ({
      ...doc,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    }));
    const result = await collection.insertMany(batch, { ordered: false });
    inserted += result.insertedCount;
    process.stdout.write(`   Inserted ${inserted} / ${problems.length}\r`);
  }
  console.log(`\nInsert complete: ${inserted}`);

  const after = await collection.countDocuments();
  const withQuiz = await collection.countDocuments({ "quiz.4": { $exists: true } });
  const withRelated = await collection.countDocuments({
    "relatedInformation.context": { $exists: true, $ne: "" },
  });

  const sample = await collection.findOne({ problemId: "P000001" });

  console.log("\n========== VERIFICATION ==========");
  console.log(`Total problems:              ${after}`);
  console.log(`With 5 quiz questions:       ${withQuiz}`);
  console.log(`With relatedInformation:     ${withRelated}`);
  console.log(`Sample P000001 title:        ${sample?.title?.slice(0, 80)}`);
  console.log(`Sample P000001 quiz length:  ${sample?.quiz?.length}`);
  console.log(`Sample P000001 related ctx:  ${sample?.relatedInformation?.context ? "YES" : "NO"}`);

  await client.close();
  return { after, withQuiz, withRelated };
}

async function main() {
  console.log("====================================================");
  console.log(" PDF → Wipe → Fresh Import (statement/info/quiz)");
  console.log("====================================================\n");

  let fullText;
  if (process.argv.includes("--reuse-extract") && fs.existsSync(EXTRACT_PATH)) {
    console.log(`Reusing extract: ${EXTRACT_PATH}`);
    fullText = fs.readFileSync(EXTRACT_PATH, "utf8");
  } else {
    fullText = await extractPdfText();
  }

  console.log("\nParsing problems...");
  const { problems, errors } = parseProblems(fullText);
  console.log(`Parsed OK: ${problems.length}`);
  console.log(`Parse errors: ${errors.length}`);
  if (errors.length) {
    console.log("First 10 errors:", errors.slice(0, 10));
  }

  fs.writeFileSync(JSON_OUT, JSON.stringify(problems, null, 2), "utf8");
  console.log(`Wrote intermediate JSON: ${JSON_OUT}`);

  if (problems.length < 1000) {
    console.error("Too few problems parsed — aborting DB wipe/import for safety.");
    process.exit(1);
  }

  if (process.argv.includes("--parse-only")) {
    console.log("--parse-only set; skipping DB wipe/import.");
    return;
  }

  await resetAndImport(problems);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
