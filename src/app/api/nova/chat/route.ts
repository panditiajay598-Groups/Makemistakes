import { NextResponse } from "next/server";
import { localNovaFallback } from "@/lib/sandpackFiles";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function resolveLlmConfig() {
  const openRouterKey = process.env.OPENROUTER_API_KEY || "";
  const openAiKey = process.env.OPENAI_API_KEY || "";
  const groqKey = process.env.GROQ_API_KEY || "";
  const openAiLooksLikeOpenRouter = openAiKey.startsWith("sk-or-");

  if (openRouterKey || openAiLooksLikeOpenRouter) {
    return {
      apiKey: openRouterKey || openAiKey,
      baseUrl: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
      model: process.env.NOVA_MODEL || "openai/gpt-4o-mini",
      provider: "openrouter" as const,
    };
  }

  if (groqKey && !openAiKey) {
    return {
      apiKey: groqKey,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.groq.com/openai/v1",
      model: process.env.NOVA_MODEL || "llama-3.3-70b-versatile",
      provider: "groq" as const,
    };
  }

  if (openAiKey) {
    return {
      apiKey: openAiKey,
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.NOVA_MODEL || "gpt-4o-mini",
      provider: "openai" as const,
    };
  }

  return null;
}

function asText(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join("; ");
  if (value == null) return "";
  return String(value);
}

function buildMentorSystemPrompt(context: Record<string, unknown>) {
  const level = asText(context.responsibilityLevel || "foundation").toLowerCase();
  const label = asText(context.responsibilityLabel || level);
  const isStarterish = level === "starter" || level === "foundation";
  const isAdvanced = level === "advanced" || level === "expert";

  const codePolicy = isStarterish
    ? `Code policy (${label}): After the student shows an attempt (or pastes their code/error), you MAY share a small snippet or one function. Prefer guiding them to type it. Never dump a whole finished product unprompted.`
    : isAdvanced
      ? `Code policy (${label}): Stay Socratic. Ask what they think should happen. Give architecture options and trade-offs. Full-file paste ONLY if they explicitly ask AND their message shows an attempt. Prefer questions like: "Your API returns 500 when the database is unavailable. What do you think should happen?"`
      : `Code policy (${label}): Prefer reasoning and engineering decisions over code dumps. Small snippets OK after an attempt. Full-file rewrite only on explicit request with evidence of attempt.`;

  return `You are Nova — a warm, patient AI coding mentor inside MakeMistakes BuildOS.
You train students to BUILD products. You are NOT a code vending machine.

Student product: ${asText(context.productName) || "BuildOS App"}
Problem statement: ${asText(context.statement)}
Build objective: ${asText(context.buildObjective)}
Responsibility: ${label} (${level})
Constraints: ${asText(context.constraints) || "none listed"}
Expected outcome: ${asText(context.expectedOutcome) || "working MVP slice"}
Current task: ${asText(context.missionTitle)}
Validation criteria: ${asText(context.validationCriteria) || "see task"}
Active file: ${asText(context.activeFile)}
Category: ${asText(context.category)}

Current file code:
\`\`\`tsx
${asText(context.fileCode).slice(0, 8000)}
\`\`\`

How you must behave:
1. Sound human and encouraging (Hi / Sure / Great question when it fits).
2. Clarify doubts FIRST in simple words before any code.
3. Ask 1 short clarifying question when the doubt is vague.
4. Teach what / why / how with short paragraphs and bullets.
5. ${codePolicy}
6. Never shame beginners. Errors are normal.
7. Stay focused on THIS product, objective, constraints, and task.
8. If they only say hi/hello: greet, remind the objective + task, invite a doubt with 2–3 example questions.
9. For Run/Preview: tell them to click Run → Preview, then interpret results.
10. Prefer explanation over lectures. Keep answers clear and actionable.
11. When validation fails, help them reason about the failure — do not silently complete the task for them.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const context = body.context || {};
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const systemPrompt = buildMentorSystemPrompt(context);

    const llm = resolveLlmConfig();

    if (!llm) {
      const text = localNovaFallback({
        question: lastUser,
        productName: context.productName || "BuildOS App",
        statement: context.statement || "",
        missionTitle: context.missionTitle || "",
        activeFile: context.activeFile || "page.tsx",
        fileCode: context.fileCode || "",
        responsibilityLevel: context.responsibilityLevel || "foundation",
        buildObjective: context.buildObjective || "",
      });
      return NextResponse.json({
        ok: true,
        mode: "local",
        message: text,
        hint: "Add OPENROUTER_API_KEY to .env for full mentor-quality Nova.",
      });
    }

    const openaiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-16),
    ];

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llm.apiKey}`,
    };
    if (llm.provider === "openrouter") {
      headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
      headers["X-Title"] = process.env.OPENROUTER_APP_NAME || "MakeMistakes BuildOS Nova";
    }

    const res = await fetch(`${llm.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: llm.model,
        messages: openaiMessages,
        temperature: 0.55,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Nova LLM error:", llm.provider, res.status, errText);
      let providerDetail = "";
      try {
        const parsed = JSON.parse(errText);
        providerDetail = parsed?.error?.message || parsed?.message || "";
      } catch {
        providerDetail = errText.slice(0, 200);
      }
      const fallback = localNovaFallback({
        question: lastUser,
        productName: context.productName || "BuildOS App",
        statement: context.statement || "",
        missionTitle: context.missionTitle || "",
        activeFile: context.activeFile || "page.tsx",
        fileCode: context.fileCode || "",
        responsibilityLevel: context.responsibilityLevel || "foundation",
        buildObjective: context.buildObjective || "",
      });
      return NextResponse.json({
        ok: true,
        mode: "local",
        message: `${fallback}\n\n_(Provider ${llm.provider} ${res.status}: ${providerDetail || "request failed"}.)_`,
        error: `LLM provider error (${res.status}). Using local mentor.`,
      });
    }

    const data = await res.json();
    const message =
      data?.choices?.[0]?.message?.content ||
      "I couldn't generate a reply. Try again — I'm still here to help.";

    return NextResponse.json({ ok: true, mode: "llm", provider: llm.provider, message });
  } catch (err: any) {
    console.error("Nova chat error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Nova chat failed" },
      { status: 500 }
    );
  }
}
