import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import {
  parseProblemNumber,
  formatProblemId,
  normalizeProblemId,
  formatProblemLabel,
  compareProblemIds,
  compareProblemIdsDesc,
  compareProblems,
  compareProblemsDesc,
  sortProblemsNumerically,
} from "../src/lib/problemId";
import { getDb } from "../src/lib/mongodb";

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

const checks: CheckResult[] = [];

function assert(name: string, condition: boolean, details: string) {
  checks.push({ name, passed: condition, details });
  if (condition) {
    console.log(`  [PASS] ${name}`);
  } else {
    console.error(`  [FAIL] ${name}: ${details}`);
  }
}

async function runProblemIdSortingVerification() {
  console.log("==================================================================");
  console.log("TASK 9 VERIFICATION: PROBLEM ID PARSING, NORMALIZATION & SORTING");
  console.log("==================================================================");

  // Group 1: parseProblemNumber
  console.log("\n--- Group 1: Numeric Extraction & Boundary Handling ---");
  assert(
    "1.1 Canonical IDs parse correctly (P000001 -> 1, P001848 -> 1848)",
    parseProblemNumber("P000001") === 1 && parseProblemNumber("P001848") === 1848,
    `P000001=${parseProblemNumber("P000001")}, P001848=${parseProblemNumber("P001848")}`
  );

  assert(
    "1.2 Varying digit length and leading zeros parse to expected integers",
    parseProblemNumber("P1") === 1 &&
      parseProblemNumber("P01") === 1 &&
      parseProblemNumber("P0001") === 1 &&
      parseProblemNumber("P000042") === 42,
    `P1=${parseProblemNumber("P1")}, P000042=${parseProblemNumber("P000042")}`
  );

  assert(
    "1.3 Numeric primitive inputs are handled safely",
    parseProblemNumber(100) === 100 && parseProblemNumber(0) === 0,
    `100=${parseProblemNumber(100)}, 0=${parseProblemNumber(0)}`
  );

  assert(
    "1.4 Malformed, empty, null, and non-numeric inputs fail safely to 0",
    parseProblemNumber("") === 0 &&
      parseProblemNumber(null) === 0 &&
      parseProblemNumber(undefined) === 0 &&
      parseProblemNumber("medication-reminder") === 0 &&
      parseProblemNumber("no-digits-here") === 0,
    `Results: empty=${parseProblemNumber("")}, null=${parseProblemNumber(null)}, alias=${parseProblemNumber("medication-reminder")}`
  );

  // Group 2: Canonical Formatting and Normalization
  console.log("\n--- Group 2: Formatting & Normalization ---");
  assert(
    "2.1 formatProblemId pads integers to 6 digits",
    formatProblemId(1) === "P000001" &&
      formatProblemId(42) === "P000042" &&
      formatProblemId(1848) === "P001848",
    `1=${formatProblemId(1)}, 42=${formatProblemId(42)}, 1848=${formatProblemId(1848)}`
  );

  assert(
    "2.2 normalizeProblemId maps medication-reminder alias to P000001",
    normalizeProblemId("medication-reminder") === "P000001",
    `Result: ${normalizeProblemId("medication-reminder")}`
  );

  assert(
    "2.3 normalizeProblemId canonicalizes unpadded IDs (P1 -> P000001)",
    normalizeProblemId("P1") === "P000001" && normalizeProblemId("P42") === "P000042",
    `P1=${normalizeProblemId("P1")}, P42=${normalizeProblemId("P42")}`
  );

  assert(
    "2.4 formatProblemLabel produces clean UI display strings",
    formatProblemLabel("P000001") === "Problem 01" &&
      formatProblemLabel("P000009") === "Problem 09" &&
      formatProblemLabel("P000010") === "Problem 10" &&
      formatProblemLabel("P001848") === "Problem 1848" &&
      formatProblemLabel(null) === "Problem",
    `P000001=${formatProblemLabel("P000001")}, P000010=${formatProblemLabel("P000010")}`
  );

  // Group 3: Ascending & Descending Comparators
  console.log("\n--- Group 3: Sorting & Comparators ---");
  const testIdsAsc = ["P000010", "P000002", "P000100", "P000001", "P001848"];
  const sortedAsc = [...testIdsAsc].sort(compareProblemIds);
  assert(
    "3.1 compareProblemIds correctly sorts zero-padded IDs in ascending order",
    JSON.stringify(sortedAsc) === JSON.stringify(["P000001", "P000002", "P000010", "P000100", "P001848"]),
    `Sorted: ${JSON.stringify(sortedAsc)}`
  );

  const testIdsVarying = ["P10", "P2", "P1", "P000003", "P100"];
  const sortedVarying = [...testIdsVarying].sort(compareProblemIds);
  assert(
    "3.2 compareProblemIds correctly sorts numbers of varying digit lengths (numeric > lexicographic)",
    JSON.stringify(sortedVarying) === JSON.stringify(["P1", "P2", "P000003", "P10", "P100"]),
    `Sorted: ${JSON.stringify(sortedVarying)}`
  );

  const sortedDesc = [...testIdsAsc].sort(compareProblemIdsDesc);
  assert(
    "3.3 compareProblemIdsDesc sorts in descending order",
    JSON.stringify(sortedDesc) === JSON.stringify(["P001848", "P000100", "P000010", "P000002", "P000001"]),
    `Sorted: ${JSON.stringify(sortedDesc)}`
  );

  assert(
    "3.4 Deterministic tie-breaker for identical numeric portions",
    compareProblemIds("P000001", "P000001") === 0 &&
      compareProblemIds("alpha", "beta") < 0,
    `compare(alpha, beta)=${compareProblemIds("alpha", "beta")}`
  );

  // Group 4: Object Collection Sorting
  console.log("\n--- Group 4: sortProblemsNumerically on Document Collections ---");
  const sampleProblems = [
    { problemId: "P000003", title: "Problem 3" },
    { problemId: "P000001", title: "Problem 1" },
    { problemId: "P000002", title: "Problem 2" },
  ];

  // In-place sort test
  const copy1 = [...sampleProblems];
  const sortedCollection = sortProblemsNumerically(copy1);
  assert(
    "4.1 sortProblemsNumerically sorts document array in-place by default",
    sortedCollection[0].problemId === "P000001" &&
      sortedCollection[1].problemId === "P000002" &&
      sortedCollection[2].problemId === "P000003" &&
      copy1 === sortedCollection,
    `Order: ${sortedCollection.map((p) => p.problemId).join(", ")}`
  );

  // Non-mutating option test
  const copy2 = [...sampleProblems];
  const immutableSorted = sortProblemsNumerically(copy2, { inPlace: false });
  assert(
    "4.2 sortProblemsNumerically respects inPlace: false option without mutating input array",
    copy2[0].problemId === "P000003" && immutableSorted[0].problemId === "P000001",
    `Original preserved: copy2[0]=${copy2[0].problemId}, sorted[0]=${immutableSorted[0].problemId}`
  );

  // Descending option test
  const descSorted = sortProblemsNumerically(sampleProblems, { inPlace: false, descending: true });
  assert(
    "4.3 sortProblemsNumerically respects descending: true option",
    descSorted[0].problemId === "P000003" && descSorted[2].problemId === "P000001",
    `Order: ${descSorted.map((p) => p.problemId).join(", ")}`
  );

  // Group 5: Real Atlas Parity Check
  console.log("\n--- Group 5: Live Database Parity (MongoDB vs In-Memory Sort) ---");
  const db = await getDb();
  const dbSample = await db
    .collection<{ problemId: string }>("problems")
    .find({}, { projection: { problemId: 1 } })
    .sort({ problemId: 1 })
    .limit(20)
    .toArray();

  const jsSortedSample = sortProblemsNumerically([...dbSample], { inPlace: false });

  const dbIds = dbSample.map((d: any) => d.problemId);
  const jsIds = jsSortedSample.map((d: any) => d.problemId);

  assert(
    "5.1 In-memory sort produces 100% identical sequence to MongoDB indexed sort",
    JSON.stringify(dbIds) === JSON.stringify(jsIds),
    `DB first 5: ${dbIds.slice(0, 5).join(", ")}, JS first 5: ${jsIds.slice(0, 5).join(", ")}`
  );

  // Summary
  console.log("\n==================================================================");
  console.log("VERIFICATION SUMMARY");
  console.log("==================================================================");
  const total = checks.length;
  const passed = checks.filter((c) => c.passed).length;
  const failed = checks.filter((c) => !c.passed).length;

  console.log(`Total checks: ${total}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);

  if (failed > 0) {
    console.error("\n❌ Some Task 9 problem ID sorting checks FAILED.");
    process.exit(1);
  } else {
    console.log("\n✅ All Task 9 problem ID sorting checks PASSED cleanly.");
    process.exit(0);
  }
}

runProblemIdSortingVerification().catch((err) => {
  console.error("Fatal error during Task 9 verification:", err);
  process.exit(1);
});
