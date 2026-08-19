import { Mission } from "./types";

const SEED_MISSIONS: Mission[] = [
  {
    id: "stop-api-crashing-traffic-spikes",
    title: "Stop an API from Crashing Under Traffic Spikes",
    description:
      "Implement a Redis-backed Sliding Window Log rate limiter to gracefully protect downstream services during 100k req/min traffic surges.",
    difficulty: "Medium",
    category: "Backend",
    timeEstimate: "2 hrs",
    xpReward: 500,
    techStack: ["Redis", "Node.js", "TypeScript"],
    skills: ["Rate Limiting", "Concurrency", "API Design", "Redis Lua"],
    status: "In Progress",
    progress: 37,
    currentStep: 3,
    totalSteps: 8,
    activeFile: "limiter.ts",
    coverIllustration: "rate-limiter",
    benchmarkTarget: "< 5ms latency overhead at 10,000 req/sec",
    featured: true,
  },
  {
    id: "build-distributed-job-queue",
    title: "Build a Distributed Job Queue",
    description:
      "Construct a resilient background worker system with exponential backoff retries, dead letter queues, and atomic job locks.",
    difficulty: "Hard",
    category: "System Design",
    timeEstimate: "4 hrs",
    xpReward: 900,
    techStack: ["BullMQ", "Redis", "Node.js", "TypeScript"],
    skills: ["Distributed Queues", "Fault Tolerance", "Async Workers", "Event Loops"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 10,
    coverIllustration: "job-queue",
    benchmarkTarget: "Zero job duplication under worker failure",
  },
  {
    id: "optimize-slow-postgresql-database",
    title: "Optimize a Slow PostgreSQL Database",
    description:
      "Eliminate N+1 queries, add composite B-Tree & BRIN indexes, and rewrite nested joins to handle 1,000,000 active records in under 12ms.",
    difficulty: "Medium",
    category: "Database",
    timeEstimate: "3 hrs",
    xpReward: 700,
    techStack: ["PostgreSQL", "Node.js", "SQL"],
    skills: ["Database Optimization", "Indexing", "EXPLAIN ANALYZE", "Query Tuning"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 6,
    coverIllustration: "database-tuning",
    benchmarkTarget: "< 15ms P99 execution time on 1M rows",
  },
  {
    id: "prevent-race-conditions-payment-processing",
    title: "Prevent Race Conditions in Payment Processing",
    description:
      "Solve double-spending bugs using PostgreSQL row-level locks (`SELECT FOR UPDATE`) and Redlock distributed mutexes across microservices.",
    difficulty: "Hard",
    category: "Security",
    timeEstimate: "5 hrs",
    xpReward: 1200,
    techStack: ["Node.js", "PostgreSQL", "Redis", "TypeScript"],
    skills: ["Concurrency", "Transactions", "Pessimistic Locking", "Idempotency"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 9,
    coverIllustration: "payment-locking",
    benchmarkTarget: "0 race condition failures during 500 concurrent balance debits",
  },
  {
    id: "deploy-zero-downtime-application",
    title: "Deploy a Zero-Downtime Application",
    description:
      "Architect a Kubernetes Blue-Green deployment with rolling update health probes, NGINX ingress traffic shifting, and automatic rollback.",
    difficulty: "Expert",
    category: "DevOps",
    timeEstimate: "2 Days",
    xpReward: 1500,
    techStack: ["Docker", "Kubernetes", "NGINX", "Helm"],
    skills: ["CI/CD", "DevOps", "Rolling Updates", "Traffic Shifting", "Helm Charts"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 12,
    coverIllustration: "kubernetes-deploy",
    benchmarkTarget: "0 HTTP 5xx errors during live deployment cutover",
  },
  {
    id: "llm-streaming-fallback-router",
    title: "Implement LLM Streaming & Fallback Router",
    description:
      "Build a resilient AI gateway with SSE token streaming, token budget tracking, and automatic provider failover (OpenAI -> Anthropic -> Ollama).",
    difficulty: "Hard",
    category: "AI",
    timeEstimate: "4 hrs",
    xpReward: 1000,
    techStack: ["Python", "FastAPI", "OpenAI", "Asyncio"],
    skills: ["AI Engineering", "SSE Streaming", "Circuit Breakers", "Token Budgeting"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 8,
    coverIllustration: "ai-router",
    benchmarkTarget: "Sub-150ms Time To First Token (TTFT)",
  },
  {
    id: "realtime-collaborative-canvas-crdts",
    title: "Build a Real-Time Collaborative Canvas",
    description:
      "Implement conflict-free replicated data types (Yjs CRDTs) over WebSockets for multi-user real-time document editing without central lock bottlenecks.",
    difficulty: "Hard",
    category: "Frontend",
    timeEstimate: "6 hrs",
    xpReward: 1100,
    techStack: ["React", "TypeScript", "WebSockets", "Yjs"],
    skills: ["CRDTs", "WebSockets", "State Synchronization", "Canvas Rendering"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 10,
    coverIllustration: "collab-canvas",
    benchmarkTarget: "< 30ms local state mutation sync across 50 clients",
  },
  {
    id: "inmemory-keyvalue-store-lru",
    title: "Construct an In-Memory Key-Value Store",
    description:
      "Build a thread-safe key-value store with TTL key expiration background threads, O(1) LRU cache eviction policy, and append-only persistence.",
    difficulty: "Medium",
    category: "System Design",
    timeEstimate: "3 hrs",
    xpReward: 800,
    techStack: ["Rust", "TypeScript", "Node.js"],
    skills: ["Data Structures", "Memory Management", "LRU Eviction", "Concurrency"],
    status: "Completed",
    progress: 100,
    currentStep: 8,
    totalSteps: 8,
    coverIllustration: "kv-store",
    benchmarkTarget: "1,000,000 operations per second single-threaded",
  },
  {
    id: "multi-region-s3-blob-storage-client",
    title: "Architect a Multi-Region S3 Blob Storage Client",
    description:
      "Build a resilient cloud storage engine with chunked parallel uploads, multipart resumes, presigned URL generation, and regional fallback.",
    difficulty: "Expert",
    category: "Cloud",
    timeEstimate: "1 Day",
    xpReward: 1400,
    techStack: ["AWS", "Go", "TypeScript", "S3"],
    skills: ["Cloud Architecture", "Multipart Uploads", "S3 API", "High Availability"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 11,
    coverIllustration: "cloud-storage",
    benchmarkTarget: "500 MB upload completed in under 4 seconds over multi-thread",
  },
  {
    id: "offline-first-sqlite-sync-engine",
    title: "Build an Offline-First SQLite Sync Engine",
    description:
      "Implement a mobile client database sync protocol with differential change detection, vector clock conflict resolution, and background sync queues.",
    difficulty: "Hard",
    category: "Mobile",
    timeEstimate: "5 hrs",
    xpReward: 950,
    techStack: ["React Native", "SQLite", "TypeScript"],
    skills: ["Offline Sync", "Vector Clocks", "Mobile DB", "State Management"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 9,
    coverIllustration: "mobile-sync",
    benchmarkTarget: "100% offline data retention during network loss",
  },
  {
    id: "custom-git-cli-engine",
    title: "Build a Custom Git CLI Engine",
    description:
      "Recreate `.git` internals: SHA-1 object hashing, blob trees, commit graphs, and delta compression objects from scratch.",
    difficulty: "Medium",
    category: "Open Source",
    timeEstimate: "4 hrs",
    xpReward: 650,
    techStack: ["Node.js", "TypeScript", "Zlib"],
    skills: ["Git Internals", "Binary Parsing", "Data Hashing", "CLI Tooling"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 7,
    coverIllustration: "git-cli",
    benchmarkTarget: "Complete commit history parsing matching official git log output",
  },
  {
    id: "jwt-revocation-bloom-filters",
    title: "Prevent JWT Revocation Bypass with Bloom Filters",
    description:
      "Construct a zero-latency authorization proxy using Redis Bloom Filters for probabilistic blacklisting of compromised JWT tokens.",
    difficulty: "Hard",
    category: "Security",
    timeEstimate: "3 hrs",
    xpReward: 1050,
    techStack: ["Node.js", "Redis", "TypeScript"],
    skills: ["Authentication", "Bloom Filters", "Security", "Zero Trust"],
    status: "Not Started",
    currentStep: 1,
    totalSteps: 8,
    coverIllustration: "jwt-security",
    benchmarkTarget: "< 0.01% false positive rate on 10,000,000 revoked tokens",
  },
];

// Problem templates for generating 500+ realistic engineering missions across categories
const PROBLEM_TEMPLATES = [
  // Backend & Microservices
  {
    category: "Backend",
    techs: ["Node.js", "Go", "Python", "FastAPI", "TypeScript", "gRPC"],
    patterns: [
      { title: "Mitigate Cascading Failures with Circuit Breakers", desc: "Build an automated Circuit Breaker pattern with health checks to stop downstream dependency crashes.", diff: "Medium", time: "2 hrs", xp: 600, skill: ["Circuit Breakers", "Resilience"] },
      { title: "Implement Idempotent Event Delivery for Webhooks", desc: "Construct a durable webhook server guaranteeing exactly-once delivery semantics using deduplication keys.", diff: "Hard", time: "4 hrs", xp: 950, skill: ["Idempotency", "Webhooks", "Message Queues"] },
      { title: "Build a High-Throughput API Gateway with Dynamic Routing", desc: "Engineer an API gateway with JWT validation, sub-millisecond reverse proxying, and path rewriting.", diff: "Hard", time: "5 hrs", xp: 1100, skill: ["API Gateway", "Reverse Proxy", "JWT"] },
      { title: "Architect a Saga Pattern Orchestrator for Microservices", desc: "Solve cross-service distributed transaction failures using compensating transactions in a Saga engine.", diff: "Expert", time: "1 Day", xp: 1450, skill: ["Saga Pattern", "Distributed Transactions", "Microservices"] },
      { title: "Optimize High-Concurrency Thread Pools for Worker Nodes", desc: "Diagnose CPU thread starvation and optimize event loops for 50,000 simultaneous connection handles.", diff: "Hard", time: "4 hrs", xp: 1000, skill: ["Event Loops", "ThreadPools", "Concurrency"] },
    ]
  },
  // Database & Storage
  {
    category: "Database",
    techs: ["PostgreSQL", "MongoDB", "Redis", "ClickHouse", "Elasticsearch", "SQL"],
    patterns: [
      { title: "Implement Real-Time Change Data Capture (CDC)", desc: "Stream PostgreSQL write-ahead logs (WAL) to Kafka and Elasticsearch for sub-second search indexing.", diff: "Hard", time: "5 hrs", xp: 1150, skill: ["CDC", "PostgreSQL WAL", "Kafka Stream"] },
      { title: "Architect a Dynamic Columnar Analytics Engine", desc: "Query billions of log events efficiently using ClickHouse columnar storage and materialize views.", diff: "Expert", time: "1 Day", xp: 1350, skill: ["Columnar Storage", "ClickHouse", "Big Data Analytics"] },
      { title: "Prevent Connection Pool Exhaustion under Peak Traffic", desc: "Configure PgBouncer dynamic connection poolers and tune statement timeouts for high-throughput DBs.", diff: "Medium", time: "2 hrs", xp: 650, skill: ["PgBouncer", "Connection Pooling", "DB Reliability"] },
      { title: "Build a Geospatial Range Search with Quadtrees & PostGIS", desc: "Perform instant sub-10ms nearest-neighbor queries across millions of location coordinates.", diff: "Hard", time: "4 hrs", xp: 900, skill: ["Geospatial Indexing", "PostGIS", "Quadtrees"] },
      { title: "Implement Cache stampede Mitigation with Singleflight", desc: "Prevent database meltdowns during cache expiration using distributed mutex singleflight locks.", diff: "Medium", time: "3 hrs", xp: 750, skill: ["Cache Stampede", "Singleflight", "Distributed Caching"] },
    ]
  },
  // DevOps & Cloud Infrastructure
  {
    category: "DevOps",
    techs: ["Docker", "Kubernetes", "AWS", "Terraform", "Prometheus", "Kafka"],
    patterns: [
      { title: "Build Automated Canary Deployments with Istio Service Mesh", desc: "Route 5% live traffic to canary pods and automatically abort if P99 latencies spike beyond threshold.", diff: "Expert", time: "2 Days", xp: 1600, skill: ["Canary Deployments", "Istio", "Service Mesh"] },
      { title: "Construct an Automated Infrastructure Pipeline with Terraform", desc: "Provision multi-region VPCs, IAM security groups, and EKS clusters with state locking.", diff: "Hard", time: "6 hrs", xp: 1100, skill: ["Terraform", "Infrastructure as Code", "AWS IAM"] },
      { title: "Configure Real-Time Anomaly Detection with Prometheus Alertmanager", desc: "Detect memory leaks and HTTP 5xx error spikes with PromQL queries and PagerDuty routing.", diff: "Medium", time: "3 hrs", xp: 700, skill: ["Prometheus", "PromQL", "Monitoring"] },
      { title: "Build a Container Security Scanner Pipeline", desc: "Integrate Trivy vulnerability scanning into CI/CD build gates to stop compromised base image pushes.", diff: "Medium", time: "2 hrs", xp: 550, skill: ["Container Security", "CI/CD", "Docker Audit"] },
      { title: "Architect Multi-Tenant Namespace Isolation in Kubernetes", desc: "Implement NetworkPolicies, ResourceQuotas, and RBAC roles to sandbox multi-tenant workloads.", diff: "Hard", time: "5 hrs", xp: 1050, skill: ["Kubernetes RBAC", "NetworkPolicies", "Multi-Tenancy"] },
    ]
  },
  // AI Engineering
  {
    category: "AI",
    techs: ["Python", "OpenAI", "Pinecone", "FastAPI", "LangChain", "PyTorch"],
    patterns: [
      { title: "Build a Hybrid Vector & Keyword Search Engine", desc: "Combine BM25 keyword matching with OpenAI dense embeddings and reciprocal rank fusion (RRF).", diff: "Hard", time: "4 hrs", xp: 1050, skill: ["Vector Search", "Hybrid Search", "Embeddings"] },
      { title: "Implement Prompt Injection Defense Guardrails", desc: "Sanitize user inputs and enforce JSON output schemas on LLM outputs to prevent system prompt leakage.", diff: "Medium", time: "3 hrs", xp: 800, skill: ["Prompt Engineering", "AI Security", "Output Validation"] },
      { title: "Construct an Enterprise RAG Pipeline with Document Chunking", desc: "Parse complex PDFs, extract tabular data, build chunk embeddings, and serve context to LLMs.", diff: "Hard", time: "5 hrs", xp: 1200, skill: ["RAG Pipelines", "Document Chunking", "LangChain"] },
      { title: "Build a Low-Latency Speech-to-Text Transcriber Stream", desc: "Stream chunked audio frames over WebSockets to Whisper AI models with real-time word timestamping.", diff: "Hard", time: "6 hrs", xp: 1100, skill: ["Audio Streaming", "Whisper AI", "WebSockets"] },
      { title: "Engineer a Multi-Agent AI Workflow Engine", desc: "Coordinate autonomous researcher, coder, and reviewer AI agents using DAG state machines.", diff: "Expert", time: "1 Day", xp: 1400, skill: ["Multi-Agent Systems", "DAG Orchestration", "Autonomous AI"] },
    ]
  },
  // Frontend & UI Architecture
  {
    category: "Frontend",
    techs: ["React", "TypeScript", "Next.js", "WebAssembly", "TailwindCSS"],
    patterns: [
      { title: "Write a Virtualized Table Component for 500k Rows", desc: "Render massive datasets at 60 FPS using DOM windowing, dynamic row heights, and GPU acceleration.", diff: "Medium", time: "3 hrs", xp: 750, skill: ["Virtualization", "DOM Performance", "React Optimization"] },
      { title: "Offload Heavy Calculations to Web Workers with Comlink", desc: "Keep UI main thread responsive during intensive client-side crypto hashing using Web Workers.", diff: "Medium", time: "2 hrs", xp: 600, skill: ["Web Workers", "Multithreading", "Off-Main-Thread"] },
      { title: "Build a Micro-Frontend Architecture with Module Federation", desc: "Dynamically load isolated remote React applications into a core shell application at runtime.", diff: "Hard", time: "5 hrs", xp: 1100, skill: ["Module Federation", "Micro-Frontends", "Webpack"] },
      { title: "Construct a Custom Headless UI Component Primitive System", desc: "Build accessible, unstyled keyboard-navigable UI components using React hooks and ARIA specs.", diff: "Medium", time: "4 hrs", xp: 700, skill: ["Accessibility", "Design Systems", "Headless UI"] },
      { title: "Optimize Next.js Core Web Vitals to 100 Performance Score", desc: "Eliminate Cumulative Layout Shift (CLS) and reduce Largest Contentful Paint (LCP) under 800ms.", diff: "Medium", time: "3 hrs", xp: 650, skill: ["Core Web Vitals", "Next.js Performance", "Image Optimization"] },
    ]
  },
  // System Design
  {
    category: "System Design",
    techs: ["Kafka", "Redis", "Cassandra", "gRPC", "Docker", "Node.js"],
    patterns: [
      { title: "Implement Raft Consensus Protocol from Scratch", desc: "Build leader election, log replication, and heartbeat timers for a distributed consensus cluster.", diff: "Expert", time: "2 Days", xp: 1700, skill: ["Raft Protocol", "Consensus", "Distributed Systems"] },
      { title: "Architect an Event-Driven Notification System with Kafka", desc: "Deliver millions of SMS, Email, and Push notifications per hour with dynamic topic partitioners.", diff: "Hard", time: "6 hrs", xp: 1250, skill: ["Kafka Streaming", "Event-Driven", "Pub/Sub"] },
      { title: "Build a Distributed Hash Ring for Consistent Sharding", desc: "Minimize key redistribution during node cluster scale-up using consistent hashing with virtual nodes.", diff: "Hard", time: "4 hrs", xp: 950, skill: ["Consistent Hashing", "Sharding", "Data Partitioning"] },
      { title: "Construct a Global Rate Limiter with Distributed Token Buckets", desc: "Sync token bucket balances across 5 AWS geographic regions using Redis CRDT key replicas.", diff: "Expert", time: "1 Day", xp: 1500, skill: ["Global Systems", "Token Bucket", "Distributed State"] },
      { title: "Architect a URL Shortener Handling 100,000 Writes / Sec", desc: "Design base62 encoding engines, KGS key generation services, and multi-tier Redis caching.", diff: "Medium", time: "3 hrs", xp: 700, skill: ["Base62 Encoding", "System Design", "High Throughput"] },
    ]
  },
  // Cloud & Security
  {
    category: "Security",
    techs: ["Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
    patterns: [
      { title: "Prevent SQL Injection & XSS in Legacy Codebase", desc: "Audit unsafe string concatenations, implement parameterized queries, and enforce strict Content Security Policy (CSP).", diff: "Medium", time: "2 hrs", xp: 550, skill: ["AppSec", "SQL Injection", "CSP Header"] },
      { title: "Build an Automated Dependency Scanner Bot", desc: "Detect supply-chain attacks and malicious npm packages in pull requests before merge.", diff: "Medium", time: "3 hrs", xp: 650, skill: ["Supply Chain Security", "npm Audit", "Automation"] },
      { title: "Implement Zero-Trust Peer-to-Peer mTLS Authentication", desc: "Configure Mutual TLS certificates for microservice communication with automatic certificate rotation.", diff: "Hard", time: "5 hrs", xp: 1150, skill: ["mTLS", "PKI", "Zero Trust Security"] },
    ]
  },
];

// Helper generator to produce 500+ detailed, distinct missions
export function generateCatalogMissions(): Mission[] {
  const result: Mission[] = [...SEED_MISSIONS];
  let idCounter = 1;

  const categories: Array<{ name: Mission["category"]; techs: string[] }> = [
    { name: "Backend", techs: ["Node.js", "Go", "Python", "FastAPI", "TypeScript", "Express", "NestJS", "gRPC"] },
    { name: "Database", techs: ["PostgreSQL", "MongoDB", "Redis", "ClickHouse", "Elasticsearch", "Prisma", "Cassandra", "Neo4j"] },
    { name: "DevOps", techs: ["Docker", "Kubernetes", "NGINX", "Helm", "Terraform", "Prometheus", "Grafana", "Ansible"] },
    { name: "Cloud", techs: ["AWS", "Google Cloud", "Azure", "Cloudflare", "Serverless", "S3", "DynamoDB", "Lambda"] },
    { name: "AI", techs: ["Python", "FastAPI", "OpenAI", "Pinecone", "LangChain", "PyTorch", "Hugging Face", "Ollama"] },
    { name: "System Design", techs: ["Kafka", "RabbitMQ", "BullMQ", "Redis", "gRPC", "Cassandra", "Zookeeper"] },
    { name: "Frontend", techs: ["React", "Next.js", "TypeScript", "TailwindCSS", "Vue.js", "Svelte", "WebAssembly"] },
    { name: "Mobile", techs: ["React Native", "Flutter", "Swift", "Kotlin", "SQLite", "GraphQL"] },
    { name: "Security", techs: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "OAuth", "Vault", "OpenSSL"] },
    { name: "Open Source", techs: ["TypeScript", "Rust", "Go", "Node.js", "C++", "Python"] },
  ];

  const problemPrefixes = [
    "Prevent Crashes in",
    "Optimize Performance of",
    "Build a Resilient",
    "Implement Zero-Downtime",
    "Scale to 1M Users:",
    "Fix Memory Leak in",
    "Architect High-Availability",
    "Debug High-Latency in",
    "Eliminate Bottlenecks in",
    "Construct Fault-Tolerant",
    "Secure API Endpoints in",
    "Implement Rate Limiting for",
    "Build Real-Time Pipeline for",
    "Automate Failover in",
    "Benchmark & Refactor",
  ];

  const problemDomainSuffixes = [
    "Microservice Architecture",
    "Real-Time Analytics Pipeline",
    "Payment Gateway Processing",
    "Search Indexing Service",
    "Distributed Cache Cluster",
    "User Session Store",
    "Log Aggregation Engine",
    "Web Push Notification Service",
    "Multi-Tenant SaaS Database",
    "Media Video Transcoding Queue",
    "Order Matching Engine",
    "Authentication Proxy",
    "Content Delivery Network",
    "Financial Clearing House",
    "IOT Sensor Ingestion Stream",
  ];

  const difficulties: Mission["difficulty"][] = ["Easy", "Medium", "Hard", "Expert"];

  // Generate template items until total length exceeds 510
  while (result.length < 520) {
    const catObj = categories[idCounter % categories.length];
    const category = catObj.name;
    const techStack = [
      catObj.techs[idCounter % catObj.techs.length],
      catObj.techs[(idCounter + 2) % catObj.techs.length],
      "TypeScript",
    ].filter((v, i, a) => a.indexOf(v) === i);

    const diff = difficulties[idCounter % difficulties.length];
    const prefix = problemPrefixes[idCounter % problemPrefixes.length];
    const suffix = problemDomainSuffixes[idCounter % problemDomainSuffixes.length];

    const title = `${prefix} ${suffix}`;
    const xpReward = diff === "Easy" ? 300 + (idCounter % 3) * 50 : diff === "Medium" ? 500 + (idCounter % 5) * 50 : diff === "Hard" ? 900 + (idCounter % 5) * 50 : 1400 + (idCounter % 4) * 100;
    const timeEstimate = diff === "Easy" ? "45 min" : diff === "Medium" ? "2 hrs" : diff === "Hard" ? "5 hrs" : "2 Days";

    result.push({
      id: `generated-mission-${idCounter}`,
      title,
      description: `Solve production engineering challenges in ${suffix.toLowerCase()}. Diagnose system bottlenecks, implement high-concurrency patterns, and verify performance under high load.`,
      difficulty: diff,
      category,
      timeEstimate,
      xpReward,
      techStack,
      skills: [techStack[0], category, "System Reliability", "Production Debugging"],
      status: idCounter % 15 === 0 ? "In Progress" : idCounter % 35 === 0 ? "Completed" : "Not Started",
      progress: idCounter % 15 === 0 ? 45 : idCounter % 35 === 0 ? 100 : 0,
      currentStep: idCounter % 15 === 0 ? 3 : 1,
      totalSteps: diff === "Easy" ? 5 : diff === "Medium" ? 7 : diff === "Hard" ? 9 : 12,
      coverIllustration: "generic-code",
      benchmarkTarget: diff === "Expert" ? "< 1ms latency at 50,000 ops/sec" : "< 10ms P99 latency overhead",
    });

    idCounter++;
  }

  return result;
}

export const ALL_MISSIONS: Mission[] = generateCatalogMissions();
