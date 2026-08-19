export interface MissionDeliverable {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  required: boolean;
}

export interface MissionHint {
  id: string;
  title: string;
  content: string;
  costXp?: number;
}

export interface MissionResource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "article" | "documentation" | "guide" | "video";
}

export interface MissionData {
  id: string;
  number: number;
  title: string;
  productName: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  xpReward: number;
  skills: string[];
  nextMissionId: string;
  nextMissionTitle: string;
  
  learningOutcomes: string[];
  backgroundStory: string;
  problemStatement: string;
  objectives: string[];
  deliverables: MissionDeliverable[];
  resources: MissionResource[];
  rules: string[];
  expectedSubmission: string;
  hints: MissionHint[];
}

export interface NovaEvaluationResult {
  iteration: number;
  passed: boolean;
  overallAssessment: string;
  strengths: string[];
  observations: string[];
  probingQuestions: string[];
  suggestions: string[];
  engineeringAdvice: string;
}

export const MISSIONS_DATA: Record<string, MissionData> = {
  "mission-1": {
    id: "mission-1",
    number: 1,
    title: "Problems Before Products",
    productName: "Real-Time Builder Community",
    difficulty: "Beginner",
    estimatedTime: "20 Minutes",
    xpReward: 250,
    skills: ["Problem Validation", "User Research", "Product Thinking", "System Scoping"],
    nextMissionId: "mission-2",
    nextMissionTitle: "Solution Architecture & Schemas",

    learningOutcomes: [
      "Distinguish between superficial symptoms and root engineering problems.",
      "Identify target user personas and their critical friction points.",
      "Analyze existing market workarounds and their trade-offs.",
      "Formulate a structured product hypothesis before writing code."
    ],

    backgroundStory:
      "Many developer platforms build features without understanding why users struggle. You are joining MakeMistakes as a Founding Product Engineer to build the 'Real-Time Builder Community'—a live platform where developers code together and learn from mistakes. Before writing any backend APIs or UI components, you must frame the exact problem we are solving.",

    problemStatement:
      "Early-stage builders quit learning to code because generic tutorials feel isolated, syntax errors feel discouraging, and traditional forums take hours to get feedback. We need to validate the core user pain points and define a high-leverage product opportunity.",

    objectives: [
      "Analyze the primary friction points faced by novice and intermediate builders.",
      "Deconstruct why traditional Q&A forums fail to provide real-time guidance.",
      "Investigate existing workarounds (e.g. Discord servers, StackOverflow, AI chats).",
      "Propose a concrete product feature hypothesis that addresses the root cause."
    ],

    deliverables: [
      {
        id: "problem_frame",
        title: "1. Problem Frame & Target Users",
        description: "Define who suffers most from this problem and what happens when it goes unsolved.",
        placeholder: "Describe the primary user profile, their specific environment, and the emotional/technical friction they experience...",
        required: true
      },
      {
        id: "cause_analysis",
        title: "2. Root Cause Analysis",
        description: "Why do current solutions (e.g. forums, Discord, documentation) fail to solve this problem?",
        placeholder: "Analyze why async Q&A platforms lead to high drop-off rates and context switching...",
        required: true
      },
      {
        id: "existing_solutions",
        title: "3. Existing Workarounds & Trade-offs",
        description: "What are users currently doing to manage this friction, and what are the limitations?",
        placeholder: "Compare traditional tools like StackOverflow, ChatGPT, and Discord coding servers...",
        required: true
      },
      {
        id: "product_hypothesis",
        title: "4. Better Product Idea & Core Value",
        description: "Propose a specific feature or workflow for the Real-Time Builder Community that directly solves the root cause.",
        placeholder: "Detail your proposed feature, how it integrates into the builder's workflow, and why it is superior...",
        required: true
      }
    ],

    resources: [
      {
        id: "res-1",
        title: "The Mom Test Summary - Customer Validation",
        description: "How to talk to users & learn if your product idea is good when everyone is lying to you.",
        url: "https://www.momtestbook.com",
        type: "guide"
      },
      {
        id: "res-2",
        title: "First Principles Product Design",
        description: "Deconstructing developer tooling from foundational human and technical constraints.",
        url: "https://stripe.com/blog",
        type: "article"
      },
      {
        id: "res-3",
        title: "Real-time Collaboration UX Patterns",
        description: "Best practices for multi-user state synchronization and low-latency interaction.",
        url: "https://martinfowler.com",
        type: "documentation"
      }
    ],

    rules: [
      "Avoid proposing technology stack details (e.g. Postgres vs MongoDB) until the problem is framed.",
      "Be specific about user pain points—avoid vague statements like 'users want better UI'.",
      "Support your proposed solution hypothesis with reasoning grounded in user behavior."
    ],

    expectedSubmission:
      "A structured 4-part problem breakdown detailing the user profile, root cause analysis, existing trade-offs, and your proposed product hypothesis.",

    hints: [
      {
        id: "hint-1",
        title: "Focus on Feedback Latency",
        content: "Notice how long a student spends stuck when waiting for a forum reply versus live pair programming feedback."
      },
      {
        id: "hint-2",
        title: "Differentiate Async vs Sync Collaboration",
        content: "Traditional tools are asynchronous (post & wait). Real-Time Builder Community leverages synchronous presence."
      }
    ]
  },

  "mission-2": {
    id: "mission-2",
    number: 2,
    title: "Solution Architecture & Schemas",
    productName: "AI Co-Pilot Workspace",
    difficulty: "Intermediate",
    estimatedTime: "30 Minutes",
    xpReward: 300,
    skills: ["System Architecture", "Database Schema Design", "API Design", "Data Modeling"],
    nextMissionId: "mission-3",
    nextMissionTitle: "Build Core Engine Services",

    learningOutcomes: [
      "Design normalized relational schemas for real-time applications.",
      "Architect API contracts for bidirectional client-server communications.",
      "Evaluate trade-offs between REST, WebSockets, and Server-Sent Events.",
      "Handle data persistence, concurrency, and authorization boundaries."
    ],

    backgroundStory:
      "With the problem validated, we are moving to technical execution. You are designing the core backend system topology and database models for the AI Co-Pilot Workspace.",

    problemStatement:
      "The system must handle thousands of concurrent builder sessions, store user code drafts, manage AI prompt context windows, and deliver low-latency streaming responses without database bottlenecks.",

    objectives: [
      "Design PostgreSQL relational tables for Users, Sessions, Submissions, and AI Context.",
      "Define REST & WebSocket API endpoints for real-time workspace syncing.",
      "Address security, token limits, and rate limiting."
    ],

    deliverables: [
      {
        id: "db_schema",
        title: "1. Relational Database Schema Design",
        description: "Detail entities, primary keys, foreign key constraints, and indexes.",
        placeholder: "CREATE TABLE users (id UUID PRIMARY KEY...); CREATE TABLE mission_sessions...",
        required: true
      },
      {
        id: "api_spec",
        title: "2. Core API Endpoint Definitions",
        description: "Specify REST & WebSocket contracts for session management and AI feedback streams.",
        placeholder: "POST /api/v1/missions/submit\nWS /ws/v1/collaborate...",
        required: true
      },
      {
        id: "sys_topology",
        title: "3. System Architecture & Topology",
        description: "Diagram or detail component interaction between Frontend Next.js, API Gateway, DB, and AI Mentor Service.",
        placeholder: "Client (Next.js) -> API Gateway -> Express API -> PostgreSQL / Redis...",
        required: true
      }
    ],

    resources: [
      {
        id: "res-201",
        title: "PostgreSQL Database Normalization & Indexing",
        description: "Designing scalable schemas for high-concurrency relational applications.",
        url: "https://www.postgresql.org/docs",
        type: "documentation"
      }
    ],

    rules: [
      "Specify data types for every column in your tables.",
      "Explain indexing choices for high-traffic query paths."
    ],

    expectedSubmission:
      "A complete technical specification including SQL tables, API routes, and architectural topology.",

    hints: [
      {
        id: "hint-201",
        title: "Index High-Read Foreign Keys",
        content: "Ensure foreign keys like user_id and mission_id on submission logs have composite indexes for timeline lookups."
      }
    ]
  }
};

export function getMissionById(id: string): MissionData {
  return MISSIONS_DATA[id] || MISSIONS_DATA["mission-1"];
}
