/**
 * MakeMistakes — P000003, P000004, P000005 Content Update Script
 * Replaces problem-specific content for P000003, P000004, and P000005 ONLY.
 * Leaves P000001 and P000002 100% UNTOUCHED.
 */

const dns = require("dns");
try { dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]); } catch (e) {}

const path = require("path");
const fs = require("fs");

const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  });
}

const DATABASE_URL = process.env.DATABASE_URL;
const { MongoClient } = require(path.join(__dirname, "../node_modules/mongodb"));

async function updateP3P4P5() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  MakeMistakes — P000003, P000004, P000005 Update Script");
  console.log("═══════════════════════════════════════════════════════════\n");

  const targetIds = ["P000003", "P000004", "P000005"];

  const docs = {};
  for (const pid of targetIds) {
    const jsonPath = path.join(__dirname, `../data/${pid}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ ${pid}.json not found!`);
      process.exit(1);
    }
    docs[pid] = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  }

  const client = new MongoClient(DATABASE_URL);
  await client.connect();
  const db = client.db();
  const collection = db.collection("problems");

  // 1. Verify P000001 and P000002 snapshot BEFORE
  const p1Before = await collection.findOne({ problemId: "P000001" });
  const p2Before = await collection.findOne({ problemId: "P000002" });
  console.log("P000001 title before update:", p1Before?.title);
  console.log("P000002 title before update:", p2Before?.title);

  // 2. Upsert P000003, P000004, P000005 in MongoDB
  for (const pid of targetIds) {
    const doc = docs[pid];
    await collection.updateOne(
      { problemId: pid },
      { $set: doc },
      { upsert: true }
    );
    console.log(`✅ Upserted ${pid} into MongoDB successfully.`);
  }

  // 3. Verify P000001 and P000002 snapshot AFTER
  const p1After = await collection.findOne({ problemId: "P000001" });
  const p2After = await collection.findOne({ problemId: "P000002" });

  if (p1Before?.title !== p1After?.title || p2Before?.title !== p2After?.title) {
    console.error("❌ CRITICAL FAILURE: P000001 or P000002 was mutated!");
    process.exit(1);
  }
  console.log("✓ Verified P000001 and P000002 remain 100% UNCHANGED.");

  // 4. Update data/problems.json & data/backup_problems.json for P3, P4, P5 ONLY
  const updateJsonFile = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    const arr = JSON.parse(fs.readFileSync(filePath, "utf8"));
    for (const pid of targetIds) {
      const idx = arr.findIndex((p) => p.problemId === pid);
      if (idx !== -1) {
        arr[idx] = { ...arr[idx], ...docs[pid] };
      } else {
        arr.push(docs[pid]);
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2));
    console.log(`Updated ${path.basename(filePath)} with P000003, P000004, P000005.`);
  };

  updateJsonFile(path.join(__dirname, "../data/problems.json"));
  updateJsonFile(path.join(__dirname, "../data/backup_problems.json"));

  await client.close();
  console.log("\n🎉 P000003, P000004, P000005 UPDATE COMPLETE!");
}

updateP3P4P5().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
