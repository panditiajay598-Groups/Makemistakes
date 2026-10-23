import path from "path";

import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { getDb } from "../src/lib/mongodb";
import {
  ensureAppIndexes,
  JUSTIFIED_INDEXES,
  matchesKeySpecAndOrder,
} from "../src/lib/dbIndexes";

async function runIndexMigration() {
  console.log("==================================================");
  console.log("TASK 4: ENSURE MONGODB APPLICATION INDEXES");
  console.log("==================================================");

  const db = await getDb();
  console.log("\n[1] Applying justified indexes idempotently...");
  const results = await ensureAppIndexes(db);

  let hasError = false;
  results.forEach((r) => {
    const symbol =
      r.status === "created"
        ? "✓ [CREATED]"
        : r.status === "already_exists"
        ? "• [EXISTS]"
        : r.status === "skipped_duplicate_keys"
        ? "• [SKIPPED DUP]"
        : "❌ [ERROR]";
    console.log(`  ${symbol} ${r.collection}.${r.name} -> ${r.status}`);
    if (r.details) {
      console.log(`     Details: ${r.details}`);
    }
    if (r.status === "error") {
      hasError = true;
    }
  });

  if (hasError) {
    console.error("\n❌ Some indexes encountered errors during creation!");
    process.exit(1);
  }

  console.log("\n[2] Verifying index presence, exact key order, and options in database...");
  let verifiedAll = true;
  for (const def of JUSTIFIED_INDEXES) {
    const col = db.collection(def.collection);
    const indexes = await col.indexes();

    // Check by name or exact key match
    const foundByName = indexes.find((idx) => idx.name === def.options.name);
    const foundByKey = indexes.find((idx) =>
      matchesKeySpecAndOrder(idx.key as Record<string, any>, def.spec)
    );

    const targetIndex = foundByName || foundByKey;

    if (!targetIndex) {
      console.error(
        `  ❌ MISSING: Index on ${def.collection}: expected "${def.options.name}" with keys ${JSON.stringify(
          def.spec
        )}`
      );
      verifiedAll = false;
      continue;
    }

    // 1. Confirm complete key specification matches expected key order and directions
    const keyMatches = matchesKeySpecAndOrder(
      targetIndex.key as Record<string, any>,
      def.spec
    );
    if (!keyMatches) {
      console.error(
        `  ❌ KEY MISMATCH on ${def.collection}.${targetIndex.name}:` +
          `\n     Expected keys: ${JSON.stringify(def.spec)}` +
          `\n     Actual keys:   ${JSON.stringify(targetIndex.key)}`
      );
      verifiedAll = false;
    }

    // 2. Explicitly assert unique constraint matches expected definition
    const expectedUnique = !!def.options.unique;
    const actualUnique = !!targetIndex.unique;
    if (expectedUnique !== actualUnique) {
      console.error(
        `  ❌ UNIQUE OPTION MISMATCH on ${def.collection}.${targetIndex.name}:` +
          ` expected unique=${expectedUnique}, got unique=${actualUnique}`
      );
      verifiedAll = false;
    }

    // 3. Confirm index name matches expected definition unless safely aliased
    if (targetIndex.name !== def.options.name && !keyMatches) {
      console.error(
        `  ❌ NAME MISMATCH on ${def.collection}: expected "${def.options.name}", found "${targetIndex.name}"`
      );
      verifiedAll = false;
    }

    if (keyMatches && expectedUnique === actualUnique) {
      console.log(
        `  ✓ Verified on ${def.collection}: "${targetIndex.name}" | Keys: ${JSON.stringify(
          targetIndex.key
        )} | unique=${actualUnique}`
      );
    }
  }

  console.log("\n[3] Testing idempotency (second run should report all existing)...");
  const secondRun = await ensureAppIndexes(db);
  const anyCreatedOnSecond = secondRun.some((r) => r.status === "created");
  const anyErrorOnSecond = secondRun.some((r) => r.status === "error");

  if (anyCreatedOnSecond || anyErrorOnSecond) {
    console.error("  ❌ Idempotency failed: Index was re-created or errored on second pass!");
    verifiedAll = false;
  } else {
    console.log("  ✓ Idempotency verified: Second run resulted in 0 index creations and 0 errors.");
  }

  console.log("\n==================================================");
  if (verifiedAll) {
    console.log("ALL TASK 4 INDEXES APPLIED & VERIFIED SUCCESSFULLY!");
  } else {
    console.log("INDEX VERIFICATION FAILED!");
  }
  console.log("==================================================");

  process.exit(verifiedAll ? 0 : 1);
}

runIndexMigration().catch((err) => {
  console.error("Fatal error during index migration:", err);
  process.exit(1);
});
