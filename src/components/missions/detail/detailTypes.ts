import { Mission } from "../types";

export interface CompanyContext {
  name: string;
  logo: string;
  description: string;
  scaleMetric: string;
}

export interface RoadmapStep {
  stepNumber: number;
  title: string;
  description: string;
  timeEstimate: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  status: "Completed" | "Current" | "Locked";
  keyFile?: string;
}

export interface TechnologyDetail {
  name: string;
  role: string;
  whyUsed: string;
  category: string;
  logoIcon?: string;
}

export interface MissionDetailData {
  mission: Mission;
  problemStatement: {
    what: string;
    why: string;
    who: string;
    businessImpact: string;
    engineeringImpact: string;
    howCompaniesSolve: string;
  };
  realWorldCompanies: CompanyContext[];
  learningObjectives: string[];
  roadmapSteps: RoadmapStep[];
  technologyDetails: TechnologyDetail[];
  deliverablesList: string[];
  acceptanceCriteria: string[];
  aiCoachGuidelines: string[];
  proofOfWorkSnippet: {
    title: string;
    author: string;
    score: number;
    githubRepo: string;
    reflectionSummary: string;
    keyMetricAchieved: string;
  };
  stats: {
    completionRate: string;
    avgTimeSpent: string;
    difficultyRating: string;
    studentRating: string;
    commonMistake: string;
    topSkill: string;
  };
}
