export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert";

export type Category =
  | "All"
  | "Backend"
  | "Frontend"
  | "AI"
  | "DevOps"
  | "Cloud"
  | "System Design"
  | "Database"
  | "Mobile"
  | "Open Source"
  | "Security";

export type MissionStatus = "Not Started" | "In Progress" | "Completed" | "Locked";

export interface Mission {
  id: string;
  title: string; // Engineering problem statement, e.g. "Stop an API from Crashing Under Traffic Spikes"
  description: string;
  difficulty: Difficulty;
  category: Category;
  timeEstimate: string; // e.g. "45 min", "2 hrs", "6 hrs", "2 Days"
  xpReward: number; // e.g. 500, 900, 1200, 1500
  techStack: string[]; // e.g. ["Redis", "Node.js", "TypeScript"]
  skills: string[]; // e.g. ["Rate Limiting", "Concurrency", "API Design"]
  status: MissionStatus;
  progress?: number; // 0 to 100
  currentStep?: number;
  totalSteps?: number;
  activeFile?: string;
  coverIllustration?: string; // Type identifier or SVG code variant
  benchmarkTarget?: string; // e.g. "< 5ms response time under 10k req/sec"
  featured?: boolean;
}

export interface FilterState {
  searchQuery: string;
  category: Category;
  difficulty: Difficulty | "All";
  technology: string;
  status: MissionStatus | "All";
  timeRequired: "All" | "< 1 hr" | "1-3 hrs" | "3+ hrs" | "Multi-Day";
  xpRange: "All" | "< 500 XP" | "500-1000 XP" | "1000+ XP";
}
