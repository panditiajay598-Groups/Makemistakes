export type SprintSectionId =
  | "overview"
  | "tasks font-sans"
  | "tasks"
  | "brief"
  | "workspace"
  | "resources"
  | "review"
  | "discussion"
  | "deliverables"
  | "sprint-review";

export interface SprintTask {
  id: string;
  number: number;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  estimatedTime: string;
  difficulty: "Easy" | "Intermediate" | "Advanced";
  dependencies?: string[];
}

export interface SprintDeliverable {
  id: string;
  title: string;
  type: string;
  status: "submitted" | "pending" | "needs-revision";
  updatedAt?: string;
  previewContent?: string;
}

export interface DiscussionThread {
  id: string;
  title: string;
  author: string;
  authorRank: string;
  avatar: string;
  timestamp: string;
  category: "Question" | "Idea" | "Announcement" | "Note";
  repliesCount: number;
  isHelpful?: boolean;
  content: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: "Documentation" | "Architecture" | "Examples" | "Articles" | "Templates" | "Cheat Sheets";
  readTime: string;
  description: string;
  link: string;
}
