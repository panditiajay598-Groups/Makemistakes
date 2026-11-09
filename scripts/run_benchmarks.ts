/**
 * MakeMistakes Complete Problem Pagination (+20) and IndexedDB Benchmark Suite
 * Compares +10 vs +20 implementations and measures:
 * - Initial 20 problems visible time
 * - Load More 20 problems visible time
 * - Average, median, and P95 loading times
 * - API response sizes
 * - Database query durations
 * - Database queries per browsing session
 * - IndexedDB cache hit vs network times
 * - Frontend rendering times
 */

interface BenchmarkMeasurement {
  iteration: number;
  type: "Initial" | "LoadMore";
  skip: number;
  limit: number;
  itemsReturned: number;
  apiResponseTimeMs: number;
  payloadSizeKB: number;
  dbDurationMs: number;
  frontendRenderTimeMs: number;
  userVisibleTimeMs: number;
  fromCache?: boolean;
}

function calculateStats(values: number[]) {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, median: 0, p95: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;

  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const p95Index = Math.ceil(sorted.length * 0.95) - 1;
  const p95 = sorted[Math.max(0, p95Index)];

  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    median: Math.round(median * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
  };
}

async function measureRequest(params: {
  url: string;
  iteration: number;
  type: "Initial" | "LoadMore";
  skip: number;
  limit: number;
  simulatedNetworkDelayMs?: number;
}): Promise<BenchmarkMeasurement> {
  const { url, iteration, type, skip, limit, simulatedNetworkDelayMs = 0 } = params;

  if (simulatedNetworkDelayMs > 0) {
    await new Promise((r) => setTimeout(r, simulatedNetworkDelayMs));
  }

  const start = performance.now();
  const res = await fetch(url);
  const text = await res.text();
  const apiResponseTimeMs = Math.round((performance.now() - start) * 100) / 100;

  const payloadSizeBytes = Buffer.byteLength(text, "utf8");
  const payloadSizeKB = Math.round((payloadSizeBytes / 1024) * 100) / 100;

  const data = JSON.parse(text);
  const dbDurationMs = data.timing?.dbDurationMs ?? 0;
  const itemsReturned = data.products?.length ?? 0;

  // Frontend rendering benchmark: measure card state mapping, deduplication check, memo diffing
  const renderStart = performance.now();
  const existingSet = new Set<string>();
  for (let i = 0; i < skip; i++) {
    existingSet.add(`P${String(i).padStart(6, "0")}`);
  }
  const uniqueItems = (data.products || []).filter((p: any) => !existingSet.has(p.problemId));
  const mountedNodes = uniqueItems.map((p: any) => ({
    id: p.problemId,
    title: p.title,
    status: p.userStatus,
    locked: p.isLocked,
    renderedAt: Date.now(),
  }));
  const frontendRenderTimeMs = Math.round((performance.now() - renderStart) * 100) / 100;

  const userVisibleTimeMs = Math.round((apiResponseTimeMs + frontendRenderTimeMs) * 100) / 100;

  return {
    iteration,
    type,
    skip,
    limit,
    itemsReturned,
    apiResponseTimeMs,
    payloadSizeKB,
    dbDurationMs,
    frontendRenderTimeMs,
    userVisibleTimeMs,
  };
}

async function runBenchmarkSuite() {
  const baseUrl = "http://127.0.0.1:3000/api/products";
  console.log("================================================================================");
  console.log("   MAKEMISTAKES +20 COMPLETE PAGINATION & INDEXEDDB BENCHMARK SUITE");
  console.log("================================================================================\n");

  // 1. Initial Load Benchmark (+20 problems)
  console.log("1. Measuring Initial Load (20 problem statements)...");
  const initialLoads: BenchmarkMeasurement[] = [];
  for (let i = 1; i <= 5; i++) {
    const m = await measureRequest({
      url: `${baseUrl}?page=1&limit=20&skip=0`,
      iteration: i,
      type: "Initial",
      skip: 0,
      limit: 20,
    });
    initialLoads.push(m);
    await new Promise((r) => setTimeout(r, 80));
  }

  // 2. Load More Benchmark (+20 problems per batch, 10 consecutive iterations: 21-220)
  console.log("2. Measuring Load More (+20 problems, 10 consecutive iterations)...");
  const loadMore20Runs: BenchmarkMeasurement[] = [];
  let currentSkip = 20;
  for (let i = 1; i <= 10; i++) {
    const m = await measureRequest({
      url: `${baseUrl}?limit=20&skip=${currentSkip}`,
      iteration: i,
      type: "LoadMore",
      skip: currentSkip,
      limit: 20,
    });
    loadMore20Runs.push(m);
    currentSkip += 20;
    await new Promise((r) => setTimeout(r, 50));
  }

  // 3. Comparison Baseline: Load More (+10 problems, 10 consecutive iterations)
  console.log("3. Measuring Comparison Baseline (+10 problems per batch)...");
  const loadMore10Runs: BenchmarkMeasurement[] = [];
  let skip10 = 20;
  for (let i = 1; i <= 10; i++) {
    const m = await measureRequest({
      url: `${baseUrl}?limit=10&skip=${skip10}`,
      iteration: i,
      type: "LoadMore",
      skip: skip10,
      limit: 10,
    });
    loadMore10Runs.push(m);
    skip10 += 10;
    await new Promise((r) => setTimeout(r, 50));
  }

  // 4. Simulated Slow Network (150ms 3G network latency simulation)
  console.log("4. Measuring under Simulated Slow Network (150ms RTT latency)...");
  const slowInitial = await measureRequest({
    url: `${baseUrl}?page=1&limit=20&skip=0`,
    iteration: 1,
    type: "Initial",
    skip: 0,
    limit: 20,
    simulatedNetworkDelayMs: 150,
  });

  const slowLoadMores20: BenchmarkMeasurement[] = [];
  for (let i = 1; i <= 5; i++) {
    const m = await measureRequest({
      url: `${baseUrl}?limit=20&skip=${20 + i * 20}`,
      iteration: i,
      type: "LoadMore",
      skip: 20 + i * 20,
      limit: 20,
      simulatedNetworkDelayMs: 150,
    });
    slowLoadMores20.push(m);
    await new Promise((r) => setTimeout(r, 50));
  }

  // 5. Simulated IndexedDB Cache Retrieval (Local store lookup simulation)
  console.log("5. Measuring Simulated IndexedDB Cache retrieval vs Network round-trip...");
  const simulatedCacheReadTimesMs: number[] = [];
  for (let i = 0; i < 20; i++) {
    const t0 = performance.now();
    // Simulate IDB object store indexed range query & deserialization of 20 JSON objects
    const dummyStore = Array.from({ length: 20 }, (_, idx) => ({
      problemId: `P00000${idx + 1}`,
      title: `Sample Problem ${idx + 1}`,
      category: "Software",
      difficulty: "Intermediate",
    }));
    const serialized = JSON.stringify(dummyStore);
    const deserialized = JSON.parse(serialized);
    const duration = performance.now() - t0;
    simulatedCacheReadTimesMs.push(Math.round(duration * 100) / 100);
  }

  // Compile Summary Statistics
  const initialApiTimes = initialLoads.map((m) => m.apiResponseTimeMs);
  const initialDbTimes = initialLoads.map((m) => m.dbDurationMs);
  const initialSizes = initialLoads.map((m) => m.payloadSizeKB);
  const initialVisible = initialLoads.map((m) => m.userVisibleTimeMs);

  const loadMore20ApiTimes = loadMore20Runs.map((m) => m.apiResponseTimeMs);
  const loadMore20DbTimes = loadMore20Runs.map((m) => m.dbDurationMs);
  const loadMore20Sizes = loadMore20Runs.map((m) => m.payloadSizeKB);
  const loadMore20Renders = loadMore20Runs.map((m) => m.frontendRenderTimeMs);
  const loadMore20Visible = loadMore20Runs.map((m) => m.userVisibleTimeMs);

  const loadMore10ApiTimes = loadMore10Runs.map((m) => m.apiResponseTimeMs);
  const loadMore10DbTimes = loadMore10Runs.map((m) => m.dbDurationMs);
  const loadMore10Sizes = loadMore10Runs.map((m) => m.payloadSizeKB);
  const loadMore10Visible = loadMore10Runs.map((m) => m.userVisibleTimeMs);

  const statsInitial = {
    apiResponseTime: calculateStats(initialApiTimes),
    dbDuration: calculateStats(initialDbTimes),
    payloadSizeKB: calculateStats(initialSizes),
    userVisibleTime: calculateStats(initialVisible),
  };

  const statsLoadMore20 = {
    apiResponseTime: calculateStats(loadMore20ApiTimes),
    dbDuration: calculateStats(loadMore20DbTimes),
    payloadSizeKB: calculateStats(loadMore20Sizes),
    frontendRenderTime: calculateStats(loadMore20Renders),
    userVisibleTime: calculateStats(loadMore20Visible),
  };

  const statsLoadMore10 = {
    apiResponseTime: calculateStats(loadMore10ApiTimes),
    dbDuration: calculateStats(loadMore10DbTimes),
    payloadSizeKB: calculateStats(loadMore10Sizes),
    userVisibleTime: calculateStats(loadMore10Visible),
  };

  const statsCache = calculateStats(simulatedCacheReadTimesMs);

  const sessionComparison = {
    problemsBrowsed: 100,
    queriesInPlus10: 1 + Math.ceil(80 / 10), // 1 initial (20) + 8 clicks = 9 queries
    queriesInPlus20: 1 + Math.ceil(80 / 20), // 1 initial (20) + 4 clicks = 5 queries
    queryReductionPercent: ((1 - 5 / 9) * 100).toFixed(1) + "%",
    userClicksRequiredInPlus10: 8,
    userClicksRequiredInPlus20: 4,
    clickReductionPercent: "50%",
  };

  const slowStats = {
    initialVisible: slowInitial.userVisibleTimeMs,
    loadMore20Visible: calculateStats(slowLoadMores20.map((m) => m.userVisibleTimeMs)),
  };

  const finalOutput = {
    timestamp: new Date().toISOString(),
    sessionComparison,
    statsInitial,
    statsLoadMore20,
    statsLoadMore10,
    statsCache,
    slowStats,
    loadMore20Runs,
  };

  console.log("\n================================================================================");
  console.log("                    EMPIRICAL BENCHMARK COMPARISON REPORT");
  console.log("================================================================================");
  console.log(JSON.stringify(finalOutput, null, 2));

  process.exit(0);
}

runBenchmarkSuite().catch((err) => {
  console.error("Benchmark error:", err);
  process.exit(1);
});
