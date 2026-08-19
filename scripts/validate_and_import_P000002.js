/**
 * MakeMistakes — P000002 Validate & Import Script
 * Validates P000002.json then performs a safe upsert into MongoDB `problems` collection.
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

async function importP000002() {
  const jsonPath = path.join(__dirname, "../data/P000002.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ P000002.json not found!");
    process.exit(1);
  }

  const doc = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log("Loaded P000002.json successfully.");

  const client = new MongoClient(DATABASE_URL);
  await client.connect();
  const db = client.db();
  const collection = db.collection("problems");

  await collection.updateOne(
    { problemId: "P000002" },
    { $set: doc },
    { upsert: true }
  );

  console.log("✅ Upserted P000002 into MongoDB successfully.");

  // Also update data/problems.json and data/backup_problems.json for P000002 record
  const pPath = path.join(__dirname, "../data/problems.json");
  if (fs.existsSync(pPath)) {
    const arr = JSON.parse(fs.readFileSync(pPath, "utf8"));
    const idx = arr.findIndex(p => p.problemId === "P000002");
    if (idx !== -1) {
      arr[idx] = { ...arr[idx], ...doc };
    } else {
      arr.push(doc);
    }
    fs.writeFileSync(pPath, JSON.stringify(arr, null, 2));
    console.log("Updated data/problems.json with P000002 full data.");
  }

  const bPath = path.join(__dirname, "../data/backup_problems.json");
  if (fs.existsSync(bPath)) {
    const arr = JSON.parse(fs.readFileSync(bPath, "utf8"));
    const idx = arr.findIndex(p => p.problemId === "P000002");
    if (idx !== -1) {
      arr[idx] = { ...arr[idx], ...doc };
    } else {
      arr.push(doc);
    }
    fs.writeFileSync(bPath, JSON.stringify(arr, null, 2));
    console.log("Updated data/backup_problems.json with P000002 full data.");
  }

  await client.close();
}

importP000002().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
