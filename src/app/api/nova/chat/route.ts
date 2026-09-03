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
  const level = ctx?.responsibilityLevel || "foundation";
  const file = ctx?.activeFile || "app/page.tsx";
  const objective = ctx?.buildObjective || "Build a functional product MVP.";
  const problemStatement = ctx?.problemStatement || ctx?.statement || "";

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

  return `You are Nova, an encouraging and expert AI product coding mentor for MakeMistakes BuildOS.
The student is building '${name}' (${level} level).
Current active file: '${file}'.
Overall objective: ${objective}.

When the user asks you to write, build, create, or modify code:
1. Explain what you are creating in 1-2 friendly sentences.
2. Format each code block with a top comment specifying the file path:
\`\`\`tsx
// FILE: app/Navbar.tsx
export function Navbar() {
  ...
}
\`\`\`
3. Keep code modular, clean, and production-ready.`;
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

        const res = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: provider.model,
            messages: openaiMessages,
            temperature: 0.55,
            stream: false,
          }),
        });

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
