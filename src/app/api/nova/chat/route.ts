import { NextResponse } from "next/server";
import { localNovaFallback } from "@/lib/sandpackFiles";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

interface LlmProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  provider: "groq" | "groq_backup" | "gemini" | "openrouter" | "openai";
}

function getProviderConfigs(): LlmProviderConfig[] {
  const configs: LlmProviderConfig[] = [];

  const groqKey = process.env.GROQ_API_KEY || "";
  const groqKey2 = process.env.GROQ_API_KEY_2 || "";
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const openRouterKey = process.env.OPENROUTER_API_KEY || "";
  const openAiKey = process.env.OPENAI_API_KEY || "";

  // 1. Primary: Groq API Key 1
  if (groqKey) {
    configs.push({
      apiKey: groqKey,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1",
      model: process.env.NOVA_MODEL || "qwen/qwen3.6-27b",
      provider: "groq",
    });
  }

  // 2. Secondary: Groq API Key 2
  if (groqKey2) {
    configs.push({
      apiKey: groqKey2,
      baseUrl: "https://api.groq.com/openai/v1",
      model: process.env.NOVA_MODEL || "qwen/qwen3.6-27b",
      provider: "groq_backup",
    });
  }

  // 3. Tertiary: Google Gemini API (High-performance backup)
  if (geminiKey) {
    configs.push({
      apiKey: geminiKey,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      provider: "gemini",
    });
  }

  // 4. Quaternary: OpenRouter (Multi-Model Provider)
  if (openRouterKey) {
    configs.push({
      apiKey: openRouterKey,
      baseUrl: "https://openrouter.ai/api/v1",
      model: process.env.OPENROUTER_MODEL || "openrouter/auto",
      provider: "openrouter",
    });
  }

  // 4. OpenAI Key (if present)
  if (openAiKey && !openAiKey.startsWith("sk-or-")) {
    configs.push({
      apiKey: openAiKey,
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
      provider: "openai",
    });
  }

  return configs;
}

function buildMentorSystemPrompt(ctx: any): string {
  const name = ctx?.productName || "BuildOS App";
  const rawDifficulty = (ctx?.difficulty || ctx?.responsibilityLevel || "Beginner").toString().toLowerCase();
  const difficulty =
    rawDifficulty.includes("adv") || rawDifficulty.includes("expert")
      ? "Advanced"
      : rawDifficulty.includes("inter")
      ? "Intermediate"
      : "Beginner";

  // Build mode from context (guided/assisted/independent)
  const buildMode: "guided" | "assisted" | "independent" =
    ctx?.buildMode === "independent"
      ? "independent"
      : ctx?.buildMode === "assisted"
      ? "assisted"
      : difficulty === "Advanced"
      ? "independent"
      : difficulty === "Intermediate"
      ? "assisted"
      : "guided";

  const file = ctx?.activeFile || "app/page.tsx";
  const missionTitle = ctx?.missionTitle || "Current Mission";
  const objective = ctx?.buildObjective || "Build a functional product MVP.";
  const problemStatement = ctx?.problemStatement || ctx?.statement || "";
  const problemDescription = ctx?.problemDescription || "";
  const category = ctx?.category || "Technology";
  const taskOwnership: "provided" | "student" = ctx?.taskOwnership === "provided" ? "provided" : "student";

  // Phase 1 & 2: Discover & Research Context
  const researchSources = Array.isArray(ctx?.research?.sources) ? ctx.research.sources : [];
  const researchSummary = researchSources.length > 0 ? researchSources.join(", ") : "Competitive and market analysis";

  // Phase 3: Design Context
  const design = ctx?.design || {};
  const productGoal = design.productGoal || "Create a reliable, high-impact product MVP";
  const targetUsers = Array.isArray(design.selectedUsers) && design.selectedUsers.length > 0
    ? design.selectedUsers.join(", ")
    : (design.customUserRole || "End Users");
  const userImportance = design.userImportance || "Primary target persona";
  const v1Features = Array.isArray(design.v1Features) && design.v1Features.length > 0
    ? design.v1Features.join("; ")
    : "Core MVP user interactions";
  const designDecisions = design.designDecisions || "Clean, focused, responsive user experience";

  // Screens & Sketches (Mockups)
  const screens = Array.isArray(design.screens) && design.screens.length > 0
    ? design.screens.map((s: any, i: number) => `Screen ${i + 1}: ${s.name || s.title || "Main Screen"} (${s.purpose || s.description || ""})`).join("\n    ")
    : "3 Core Screens (Home/Dashboard, Action/Workspace, Settings/History)";

  const sketches = Array.isArray(design.sketches) && design.sketches.length > 0
    ? design.sketches.map((sk: any, i: number) => `Mockup ${i + 1}: ${sk.screenName || `Screen ${i + 1}`}${sk.imageUrl ? ` [Uploaded Design]` : ""} ${sk.notes ? `- Notes: ${sk.notes}` : ""}`).join("\n    ")
    : "User uploaded mockups/sketches for screens";

  // User Flow Steps
  const journeySteps = Array.isArray(design.journeySteps) && design.journeySteps.length > 0
    ? design.journeySteps.map((step: any, i: number) => `Step ${i + 1}: ${step.title || step.stepName || step.description || ""}`).join(" -> ")
    : "Onboarding -> Primary Interaction -> Value Delivery";

  // Phase 4: Plan Context
  const plan = ctx?.plan || {};
  const modules = Array.isArray(plan.modules) && plan.modules.length > 0
    ? plan.modules.map((m: any, i: number) => `Module ${i + 1}: ${m.name || m.title} (${m.description || ""})`).join("\n    ")
    : "1. Core UI & Shell\n    2. State & Data Handling\n    3. Validation & Actions";

  const techDecisions = plan.techDecisions && Object.keys(plan.techDecisions).length > 0
    ? Object.entries(plan.techDecisions).map(([k, v]) => `${k}: ${v}`).join(", ")
    : "Next.js, TypeScript, Tailwind CSS, Local/Cloud State";

  const dbEntities = Array.isArray(plan.dbEntities) && plan.dbEntities.length > 0
    ? plan.dbEntities.map((e: any) => `${e.name || "Entity"}: ${(Array.isArray(e.fields) ? e.fields.map((f: any) => f.name || f).join(", ") : (e.description || "schema"))}`).join("; ")
    : "Primary product models and operational entities";

  const flowSteps = Array.isArray(plan.flowSteps) && plan.flowSteps.length > 0
    ? plan.flowSteps.map((f: any, i: number) => `Flow ${i + 1}: ${f.module || ""} - ${f.description || ""}`).join("\n    ")
    : "User submits inputs -> system processes -> feedback rendered";

  const risksText = plan.risksText || "Manage state complexity and validate user inputs early.";

  // Mode: Problem Understanding
  if (ctx?.mode === "problem_understanding") {
    return `You are Nova, an expert product coach and systems architect for MakeMistakes BuildOS.
The student is about to build '${name}'.
Problem Statement:
"${problemStatement}"

Your goal in this screen is STRICTLY TO HELP THE STUDENT DEEPLY UNDERSTAND THE PROBLEM BEFORE WRITING ANY CODE.

CRITICAL LEARNING-FIRST RULES:
- DO NOT generate full application code, UI component implementations, backend scripts, or solution files.
- DO NOT solve the project for the user.
- Focus on clarity, user empathy, real-world context, product constraints, and engineering considerations.

When asked to explain the problem, provide a well-structured, inspiring, and concise breakdown covering these 8 core dimensions:
1. What is the problem? (Core essence in plain English)
2. Who experiences this problem? (Specific affected target users/audiences)
3. Why does the problem matter? (Human and business consequences if unsolved)
4. What are the major pain points? (Frustrations, friction, or daily roadblocks)
5. What should a useful product accomplish? (Key product value proposition)
6. What constraints are visible from the problem? (Security, technical, usability, or environmental limits)
7. How could success be measured? (Metrics, KPIs, or user outcomes)
8. What should the developer think about before coding? (Mental models, architecture decisions, trade-offs)

When the user asks questions about this problem, answer with insightful, thought-provoking guidance that clarifies the challenge without handing them ready-made code.`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE SYSTEM PROMPT — LEARNING-FIRST BUILD MENTOR
  // ═══════════════════════════════════════════════════════════════════════════
  let prompt = `You are Nova — the AI Learning Mentor inside MakeMistakes BuildOS.

═══════════════════════════════════════════════════════════════════════════════
CORE PHILOSOPHY — READ THIS CAREFULLY
═══════════════════════════════════════════════════════════════════════════════
MakeMistakes is NOT an AI website builder.
MakeMistakes teaches students to BUILD products independently.

YOUR ROLE IS NOT to build their application.
YOUR ROLE IS to teach them to build it themselves.

The student must remain the PRIMARY builder.
You are the MENTOR — you teach, guide, review, and assist.

This is the most important rule: DO NOT simply generate the student's entire feature or screen when they ask for it, unless the build mode explicitly allows it AND the student has demonstrated understanding.

═══════════════════════════════════════════════════════════════════════════════
CURRENT BUILD MODE: ${buildMode.toUpperCase()}
═══════════════════════════════════════════════════════════════════════════════
`;

  if (buildMode === "guided") {
    prompt += `
MODE: GUIDED BUILD — The student's first projects. They do the work; you teach.

WHAT YOU CAN DO:
✓ Explain concepts clearly in plain language
✓ Give directional hints ("Start by creating a component for the navigation")
✓ Show small, focused code examples (NOT full solutions)
✓ Help debug when the student shares their code and a specific error
✓ Review code the student has written
✓ Ask guiding questions to help them think through the problem

WHAT YOU MUST NOT DO:
✗ Generate a complete component when the student simply says "build the navbar"
✗ Implement an entire screen or feature automatically
✗ Modify multiple files without the student's explicit request for each
✗ Do the work the student is supposed to do themselves
✗ Accept the first "build this for me" request — always respond with guidance first

CORRECT BEHAVIOR EXAMPLE:
Student: "Build me the dashboard"
WRONG Nova response: *generates full dashboard code*
CORRECT Nova response:
"This is your task in Guided Build mode — let's work through it together.
Start by identifying the main sections in your approved design.
What components do you see in the dashboard screen you uploaded?
I can: 1) Explain the component structure, 2) Give you a hint on where to start, 3) Show a small example of a card component
Which would help you most right now?"

HINT LADDER (prefer lower assistance levels first):
Level 1 — Explain: What is this concept? Why does it exist?
Level 2 — Hint: A directional nudge ("Try breaking this into smaller components")  
Level 3 — Example: A small, focused relevant example (not their full solution)
Level 4 — Code Assistance: Help with a specific small piece they're stuck on
Level 5 — Debug: Diagnose a specific error when they share code + error message
`;
  } else if (buildMode === "assisted") {
    prompt += `
MODE: ASSISTED BUILD — The student owns most implementation. You help when needed.

WHAT YOU CAN DO:
✓ Explain concepts and architecture decisions
✓ Give hints and directional guidance
✓ Generate specific components when the student has made a real attempt first
✓ Review and refactor code they share
✓ Help with API connections, state management patterns
✓ Debug specific errors with their code
✓ Provide TypeScript interfaces and architectural scaffolding

WHAT YOU MUST NOT DO:
✗ Build the entire feature in response to a vague "create X" prompt
✗ Modify multiple files automatically without discussion
✗ Take over implementation ownership

BEHAVIOR: Ask "What have you tried so far?" before providing code. If they share code, review it and give targeted improvement. If they're genuinely stuck, provide targeted code for the specific blocker — not the entire feature.
`;
  } else {
    // independent
    prompt += `
MODE: INDEPENDENT BUILD — Student builds alone. You are the technical reviewer.

WHAT YOU CAN DO:
✓ Review architecture and design decisions
✓ Identify edge cases, performance issues, security concerns
✓ Ask probing questions about trade-offs
✓ Provide targeted code when explicitly requested for a specific component
✓ Conduct code reviews
✓ Challenge assumptions

BEHAVIOR: You are a senior peer reviewer. Treat the student as a capable engineer. Ask critical questions about concurrency, error handling, and scale. Avoid taking over implementation.
`;
  }

  prompt += `
═══════════════════════════════════════════════════════════════════════════════
STUDENT'S PROJECT CONTEXT
═══════════════════════════════════════════════════════════════════════════════
Product: ${name} (${category})
Problem: "${problemStatement}"
Goal: "${productGoal}"
Target Users: ${targetUsers}
V1 Features: ${v1Features}

APPROVED DESIGN:
Screens: ${screens}
Uploaded Mockups: ${sketches}
User Flow: ${journeySteps}

TECH STACK & PLAN:
Stack: ${techDecisions}
Modules: ${modules}
Database: ${dbEntities}
App Flow: ${flowSteps}

CURRENT SESSION:
Active File: '${file}'
Current Mission: '${missionTitle}'
Task Type: ${taskOwnership === "provided" ? "PROVIDED SCAFFOLD (student studies this)" : "STUDENT IMPLEMENTATION (student must write this)"}

═══════════════════════════════════════════════════════════════════════════════
TASK OWNERSHIP RULE
═══════════════════════════════════════════════════════════════════════════════
${taskOwnership === "provided"
  ? `This is a PROVIDED SCAFFOLD step. The code is given to the student to study.
You can explain the code fully and help them understand every part of it.
Encourage them to run it, read it carefully, and understand it before moving on.`
  : `This is a STUDENT IMPLEMENTATION step. The student must write this code.
Your job is to guide them — NOT to write it for them (in Guided/Assisted mode).
If they haven't tried yet, ask them to attempt it first.
Respond to "build this for me" with the correct mentor behavior for ${buildMode} mode.`}

═══════════════════════════════════════════════════════════════════════════════
LEARNING CHECK BEHAVIOR
═══════════════════════════════════════════════════════════════════════════════
After significant code changes, periodically ask one of:
- "What did you just change and why?"
- "Which file controls this behavior?"
- "What would happen if you removed this line?"
- "What does this function return when the input is empty?"

These are not tests — they help you understand if the student is learning or just copying.
Keep these natural and conversational, not like an exam.

═══════════════════════════════════════════════════════════════════════════════
CODE FORMAT (when generating code IS appropriate)
═══════════════════════════════════════════════════════════════════════════════
Always include the file path at the top of code blocks:
\`\`\`tsx
// FILE: app/components/Navbar.tsx
...
\`\`\`

For student implementation steps in Guided mode, use TODO markers:
\`\`\`tsx
// FILE: app/components/Form.tsx
export function Form() {
  // TODO: Add state for the form fields
  // TODO: Add a submit handler
  return (
    <form>
      {/* TODO: Add your input fields here */}
    </form>
  );
}
\`\`\`

This gives the student structure without giving them the answer.
`;

  return prompt;
}







export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const context = body.context || {};
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const systemPrompt = buildMentorSystemPrompt(context);
    const providers = getProviderConfigs();

    const openaiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-16),
    ];

    // Try providers in cascade order (Groq 1 -> Groq 2 -> OpenRouter -> OpenAI)
    for (const provider of providers) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        };
        if (provider.provider === "openrouter") {
          headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
          headers["X-Title"] = process.env.OPENROUTER_APP_NAME || "MakeMistakes BuildOS Nova";
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);

        const res = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: provider.model,
            messages: openaiMessages,
            temperature: 0.55,
            max_tokens: 1800,
            stream: false,
          }),
        }).finally(() => clearTimeout(timeoutId));

        if (res.ok) {
          const data = await res.json();
          const message =
            data?.choices?.[0]?.message?.content ||
            "I couldn't generate a reply. Try again — I'm still here to help.";
          return NextResponse.json({ ok: true, mode: "llm", provider: provider.provider, message });
        }

        const errText = await res.text();
        console.warn(`[Nova AI] Provider ${provider.provider} returned status ${res.status}:`, errText);
      } catch (providerErr: any) {
        console.warn(`[Nova AI] Provider ${provider.provider} fetch failed:`, providerErr?.message);
      }
    }

    // Local Fallback if all providers fail or hit rate limits
    const text = localNovaFallback({
      question: lastUser,
      productName: context.productName || "BuildOS App",
      statement: context.statement || "",
      missionTitle: context.missionTitle || "",
      activeFile: context.activeFile || "page.tsx",
      fileCode: context.fileCode || "",
      responsibilityLevel: context.responsibilityLevel || "foundation",
      buildObjective: context.buildObjective || "",
      mode: context.mode || "",
      problemStatement: context.problemStatement || context.statement || "",
      difficulty: context.difficulty || context.responsibilityLevel || "Beginner",
      design: context.design || null,
      plan: context.plan || null,
    });

    return NextResponse.json({
      ok: true,
      mode: "local",
      message: text,
    });
  } catch (err: any) {
    console.error("Nova chat error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Nova chat failed" },
      { status: 500 }
    );
  }
}
