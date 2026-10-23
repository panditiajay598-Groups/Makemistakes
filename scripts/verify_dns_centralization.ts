import path from "path";
import dns from "dns";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import {
  initDns,
  getDnsStatus,
  _resetDnsForTesting,
  DEFAULT_DNS_SERVERS,
} from "../src/lib/dns";
import { getDb, getMongoClient } from "../src/lib/mongodb";
import fs from "fs";

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, details: string) {
  results.push({ name, passed: condition, details });
  if (condition) {
    console.log(`  [PASS] ${name}`);
  } else {
    console.error(`  [FAIL] ${name}: ${details}`);
  }
}

async function runDnsVerification() {
  console.log("==================================================================");
  console.log("TASK 8 VERIFICATION: DNS CENTRALIZATION & ATLAS CONNECTIVITY AUDIT");
  console.log("==================================================================");

  // Test 1: Idempotency and Single Initialization
  console.log("\n--- Group 1: Idempotency & Lifecycle ---");
  _resetDnsForTesting();
  const status1 = initDns();
  const servers1 = dns.getServers();
  const status2 = initDns(); // second call should be no-op
  const servers2 = dns.getServers();

  assert(
    "1.1 initDns is idempotent",
    status1.configured && status2.configured && globalThis.__dnsConfigured === true,
    `Status1: ${JSON.stringify(status1)}, Status2: ${JSON.stringify(status2)}`
  );

  assert(
    "1.2 DNS servers remain consistent across repeated calls",
    JSON.stringify(servers1) === JSON.stringify(servers2),
    `Servers: ${JSON.stringify(servers1)}`
  );

  // Test 2: Custom DNS Disable Flag (DISABLE_CUSTOM_DNS)
  console.log("\n--- Group 2: Environment Configuration & Disabling ---");
  _resetDnsForTesting();
  const originalDisable = process.env.DISABLE_CUSTOM_DNS;
  process.env.DISABLE_CUSTOM_DNS = "true";

  const disabledStatus = initDns();
  assert(
    "2.1 DISABLE_CUSTOM_DNS=true preserves system resolver without modification",
    disabledStatus.disabled === true && disabledStatus.source === "system",
    `Status: ${JSON.stringify(disabledStatus)}`
  );

  // Restore env
  if (originalDisable !== undefined) {
    process.env.DISABLE_CUSTOM_DNS = originalDisable;
  } else {
    delete process.env.DISABLE_CUSTOM_DNS;
  }

  // Test 3: Custom DNS Servers via DNS_SERVERS env
  _resetDnsForTesting();
  const originalServers = process.env.DNS_SERVERS;
  process.env.DNS_SERVERS = "1.1.1.1, 8.8.4.4";

  const customStatus = initDns();
  const currentServers = dns.getServers();
  assert(
    "3.1 Custom DNS_SERVERS environment variable is respected",
    customStatus.source === "custom_env" &&
      currentServers.includes("1.1.1.1") &&
      currentServers.includes("8.8.4.4"),
    `Servers: ${JSON.stringify(currentServers)}`
  );

  // Restore env
  if (originalServers !== undefined) {
    process.env.DNS_SERVERS = originalServers;
  } else {
    delete process.env.DNS_SERVERS;
  }

  // Test 4: Default Fallback Configuration
  _resetDnsForTesting();
  const fallbackStatus = initDns();
  assert(
    "4.1 Default fallback applies standard reliable resolvers",
    fallbackStatus.configured &&
      fallbackStatus.source === "default_fallback" &&
      JSON.stringify(fallbackStatus.servers) === JSON.stringify(DEFAULT_DNS_SERVERS),
    `Servers: ${JSON.stringify(fallbackStatus.servers)}`
  );

  // Test 5: Secret-Safe Diagnostics
  console.log("\n--- Group 3: Diagnostics & Security ---");
  const diagnostic = getDnsStatus();
  const diagnosticStr = JSON.stringify(diagnostic);
  const uri = process.env.DATABASE_URL || "";
  const passwordMatch = uri.match(/:([^:@]+)@/);
  const password = passwordMatch ? passwordMatch[1] : null;

  let leaksSecret = false;
  if (password && diagnosticStr.includes(password)) leaksSecret = true;
  if (uri && diagnosticStr.includes(uri)) leaksSecret = true;

  assert(
    "5.1 getDnsStatus() exposes status without leaking credentials or database URIs",
    !leaksSecret && typeof diagnostic.configured === "boolean",
    `Diagnostic output: ${diagnosticStr}`
  );

  // Test 6: Audit src/ for Duplicate Calls
  console.log("\n--- Group 4: Codebase Audit (No Duplicate Calls in src/) ---");
  function scanDir(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath, fileList);
      } else if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js")) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const srcFiles = scanDir(path.join(__dirname, "..", "src"));
  const filesWithSetServers: string[] = [];

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("dns.setServers")) {
      const relPath = path.relative(path.join(__dirname, ".."), file).replace(/\\/g, "/");
      filesWithSetServers.push(relPath);
    }
  }

  assert(
    "6.1 Exactly one file in src/ contains dns.setServers (src/lib/dns.ts)",
    filesWithSetServers.length === 1 && filesWithSetServers[0] === "src/lib/dns.ts",
    `Files found with dns.setServers in src/: ${JSON.stringify(filesWithSetServers)}`
  );

  // Test 7: MongoDB Client & Live Database Connectivity
  console.log("\n--- Group 5: MongoDB Client Singleton & Live Connection ---");
  let connected = false;
  let clientValid = false;
  let collectionsCount = 0;

  try {
    const client = await getMongoClient();
    clientValid = Boolean(client);
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    collectionsCount = collections.length;
    connected = collectionsCount > 0;
  } catch (err) {
    console.error("Live MongoDB connection error:", (err as Error).message);
  }

  assert(
    "7.1 Shared MongoDB client connects and performs real Atlas queries through centralized DNS",
    clientValid && connected,
    `Collections found in Atlas: ${collectionsCount}`
  );

  // Summary
  console.log("\n==================================================================");
  console.log("VERIFICATION SUMMARY");
  console.log("==================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total checks: ${total}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);

  if (failed > 0) {
    console.error("\n❌ Some Task 8 verification checks FAILED.");
    process.exit(1);
  } else {
    console.log("\n✅ All Task 8 DNS centralization checks PASSED cleanly.");
    process.exit(0);
  }
}

runDnsVerification().catch((err) => {
  console.error("Fatal error during DNS verification:", err);
  process.exit(1);
});
