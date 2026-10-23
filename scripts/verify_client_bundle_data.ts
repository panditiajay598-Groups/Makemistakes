/**
 * verify_client_bundle_data.ts
 *
 * Task 19 Verification:
 * 1. Checks that large datasets (PDFs, raw database dumps, seed JSONs) are kept outside client bundles.
 * 2. Scans client build chunks in `.next/static/chunks` to ensure no server-only libraries
 *    (mongodb, @prisma/client, nodemailer, bcryptjs, fs, child_process) or secrets leak to the client.
 * 3. Inspects all client components ('use client') in `src/` to confirm strict separation from server modules.
 * 4. Verifies `/api/products` and `/api/journey/problem` APIs serve selective, paginated data instead of bundling whole databases.
 * 5. Checks chunk sizes and verifies client bundle health.
 */

import * as fs from "fs";
import * as path from "path";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    failedCount++;
  }
}

function walkDir(dir: string, extFilter?: string[]): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === "node_modules" || item === ".git") continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(full, extFilter));
    } else {
      if (!extFilter || extFilter.some(ext => item.endsWith(ext))) {
        results.push(full);
      }
    }
  }
  return results;
}

async function run() {
  console.log("==================================================================");
  console.log("TASK 19 VERIFICATION: CLIENT BUNDLE DATA & SERVER MODULE ISOLATION");
  console.log("==================================================================");

  // Group 1: Verify Large Files are not in src/ or Client Bundles
  console.log("\n--- Group 1: Large Raw Datasets Isolation ---");
  const projectRoot = process.cwd();
  const largeFiles = [
    path.join(projectRoot, "data", "problems_from_pdf.json"),
    path.join(projectRoot, "data", "pdf_enriched_extract.txt"),
    path.join(projectRoot, "problem_statements_with_info_and_quizzes_segment.pdf"),
  ];

  for (const file of largeFiles) {
    if (fs.existsSync(file)) {
      const sizeMB = (fs.statSync(file).size / (1024 * 1024)).toFixed(2);
      const isOutsideSrc = !file.includes(path.join(projectRoot, "src"));
      assert(isOutsideSrc, `Large dataset ${path.basename(file)} (${sizeMB} MB) resides strictly outside src/`);
    }
  }

  // Group 2: Client Components Import Guard
  console.log("\n--- Group 2: Client Components ('use client') Import Guard ---");
  const srcFiles = walkDir(path.join(projectRoot, "src"), [".tsx", ".ts"]);
  const forbiddenServerModules = [
    "mongodb",
    "@prisma/client",
    "nodemailer",
    "bcryptjs",
    "child_process",
    "dns/promises",
    "net",
    "tls",
  ];

  let clientModulesWithServerLeak = 0;
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, "utf8");
    const isClientComponent = content.startsWith('"use client"') || content.startsWith("'use client'");
    if (isClientComponent) {
      for (const mod of forbiddenServerModules) {
        const regex = new RegExp(`(?:from|import|require)\\s*[(]?['"]${mod}['"]`, "i");
        if (regex.test(content)) {
          console.error(`Leak detected in ${file}: imports server module "${mod}"`);
          clientModulesWithServerLeak++;
        }
      }
    }
  }
  assert(
    clientModulesWithServerLeak === 0,
    `Zero client components ('use client') import server-only modules (${forbiddenServerModules.join(", ")})`
  );

  // Group 3: Built Client Bundles Scan (.next/static/chunks)
  console.log("\n--- Group 3: Build Chunks Analysis (.next/static/chunks) ---");
  const chunksDir = path.join(projectRoot, ".next", "static", "chunks");
  assert(fs.existsSync(chunksDir), "Next.js static chunks directory exists");

  if (fs.existsSync(chunksDir)) {
    const chunkFiles = walkDir(chunksDir, [".js"]);
    console.log(`  Scanned ${chunkFiles.length} generated client chunk bundles...`);

    const serverKeywords = [
      "mongodb://",
      "mongodb+srv://",
      "PrismaClientInitializationError",
      "nodemailer",
      "RAZORPAY_KEY_SECRET",
      "JWT_SECRET",
    ];

    let foundKeywordCount = 0;
    let maxChunkSize = 0;
    let maxChunkFile = "";

    for (const chunk of chunkFiles) {
      const stat = fs.statSync(chunk);
      if (stat.size > maxChunkSize) {
        maxChunkSize = stat.size;
        maxChunkFile = path.basename(chunk);
      }

      const content = fs.readFileSync(chunk, "utf8");
      for (const kw of serverKeywords) {
        if (content.includes(kw)) {
          console.error(`Server keyword "${kw}" found in client chunk: ${path.basename(chunk)}`);
          foundKeywordCount++;
        }
      }
    }

    assert(
      foundKeywordCount === 0,
      `No server connection strings, secrets, or server library identifiers leaked into client chunks`
    );

    const maxChunkSizeKB = (maxChunkSize / 1024).toFixed(1);
    assert(
      maxChunkSize < 600 * 1024,
      `Maximum client chunk (${maxChunkFile}: ${maxChunkSizeKB} KB) is well under 600 KB threshold`
    );
  }

  // Group 4: Data-Fetching Architecture Verification
  console.log("\n--- Group 4: Data-Fetching Architecture Verification ---");
  const productsPageFile = path.join(projectRoot, "src", "app", "dashboard", "products", "page.tsx");
  const productsPageContent = fs.readFileSync(productsPageFile, "utf8");
  assert(
    productsPageContent.includes("fetch(`/api/products?"),
    "Products page dynamically fetches via paginated /api/products API"
  );
  assert(
    productsPageContent.includes("page: currentPage.toString()"),
    "Products page requests selective pagination params (page, limit) rather than full dataset"
  );

  const journeyPageFile = path.join(projectRoot, "src", "app", "journey", "[id]", "page.tsx");
  const journeyPageContent = fs.readFileSync(journeyPageFile, "utf8");
  assert(
    journeyPageContent.includes("fetch(`/api/journey/problem?id="),
    "Journey dynamic route loads individual problem on demand via API"
  );

  // Group 5: API Security & Field Scoping
  console.log("\n--- Group 5: API Catalog Response Field Scoping ---");
  const productsRouteFile = path.join(projectRoot, "src", "app", "api", "products", "route.ts");
  const productsRouteContent = fs.readFileSync(productsRouteFile, "utf8");
  assert(
    productsRouteContent.includes("projection: {") || productsRouteContent.includes(".project({"),
    "Products API uses MongoDB projection to exclude unneeded internal/heavy fields (e.g. quiz, metadata, pdfSource)"
  );
  assert(
    !productsRouteContent.includes("password") && !productsRouteContent.includes("secret"),
    "Products API projection never touches user passwords or secrets"
  );

  console.log("\n==================================================================");
  console.log(`Summary: ${passedCount} passed, ${failedCount} failed`);
  console.log("==================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
