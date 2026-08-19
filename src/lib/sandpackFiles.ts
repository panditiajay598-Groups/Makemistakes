/**
 * Convert BuildOS mission stubs into Sandpack-runnable React files.
 */

export type EditorFiles = Record<string, string>;

function toRelativeImports(code: string): string {
  return code
    .replace(/from ['"]@\/components\/ui\/([^'"]+)['"]/g, 'from "./$1"')
    .replace(/from ['"]@\/components\/([^'"]+)['"]/g, 'from "./$1"')
    .replace(/from ['"]@\/([^'"]+)['"]/g, 'from "./$1"');
}

function ensureFeatures(productName: string): string {
  return `export function Features() {
  return (
    <section id="features" className="py-12 px-6 bg-zinc-50">
      <h2 className="text-2xl font-bold text-center mb-8">Why ${productName}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {["Trust", "Speed", "Clarity"].map((t) => (
          <div key={t} className="p-4 border rounded-xl bg-white">
            <h3 className="font-bold mb-1">{t}</h3>
            <p className="text-sm text-zinc-600">Built into the ${productName} MVP.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
`;
}

/**
 * Build a file map Sandpack can compile.
 * react-ts template uses /App.tsx as the preview root.
 */
export function buildSandpackFiles(
  files: EditorFiles,
  opts: { productName: string; entryFile?: string }
): Record<string, { code: string }> {
  const sandpack: Record<string, { code: string }> = {};
  const entries = Object.entries(files);

  for (const [name, code] of entries) {
    const path = name.startsWith("/") ? name : `/${name}`;
    sandpack[path] = { code: toRelativeImports(code) };
  }

  const joined = Object.values(files).join("\n");
  if (/Features/.test(joined) && !files["Features.tsx"] && !sandpack["/Features.tsx"]) {
    sandpack["/Features.tsx"] = { code: ensureFeatures(opts.productName) };
  }

  // Prefer page.tsx as the screen; otherwise first file
  const entryName =
    opts.entryFile ||
    (files["page.tsx"] ? "page.tsx" : entries[0]?.[0] || "page.tsx");
  const importPath = "./" + entryName.replace(/\.tsx?$/, "");

  // Ensure default export on entry
  const entryPath = entryName.startsWith("/") ? entryName : `/${entryName}`;
  if (sandpack[entryPath] && !/export\s+default/.test(sandpack[entryPath].code)) {
    // If only named exports, wrap a default
    const named = sandpack[entryPath].code.match(/export\s+function\s+([A-Za-z0-9_]+)/);
    if (named) {
      sandpack[entryPath].code += `\nexport default ${named[1]};\n`;
    } else {
      sandpack[entryPath].code += `\nexport default function Page() {\n  return <div>Empty page</div>;\n}\n`;
    }
  }

  // App.tsx is what Sandpack react-ts actually mounts in the preview iframe
  sandpack["/App.tsx"] = {
    code: `import Page from "${importPath}";

export default function App() {
  return (
    <div style={{ minHeight: "100%", background: "#fff", color: "#18181b" }}>
      <Page />
    </div>
  );
}
`,
  };

  // Keep styles.css empty so template CSS doesn't fight us
  sandpack["/styles.css"] = {
    code: `html, body, #root { margin: 0; padding: 0; height: 100%; }
* { box-sizing: border-box; }
`,
  };

  return sandpack;
}

export function localNovaFallback(opts: {
  question: string;
  productName: string;
  statement: string;
  missionTitle: string;
  activeFile: string;
  fileCode: string;
  responsibilityLevel?: string;
  buildObjective?: string;
}): string {
  const q = (opts.question || "").trim().toLowerCase();
  const code = opts.fileCode || "";
  const level = (opts.responsibilityLevel || "foundation").toLowerCase();
  const isAdvanced = level === "advanced" || level === "expert";
  const objective = opts.buildObjective || opts.statement;

  if (!q || /^(hi|hello|hey|hola|namaste)\b/.test(q)) {
    return `Hi! I'm Nova, your coding mentor for **${opts.productName}** (${level}).\n\nObjective: ${objective}\nTask: **${opts.missionTitle}** · file \`${opts.activeFile}\`.\n\nWhat doubt can I clear? For example:\n- "Explain this task simply"\n- "Why is my preview broken?"\n- "What should I try next?"`;
  }

  if (/run|compile|error|bug|fix|broken|preview|validat/.test(q)) {
    const tips: string[] = [];
    if (!/export default|export function/.test(code)) {
      tips.push("This file may need an `export default` or `export function`.");
    }
    if (!/return\s*\(/.test(code)) tips.push("Make sure the component returns JSX with `return (`.");
    if (/FIXME_IMPLEMENT|TODO:/.test(code)) {
      tips.push("Replace `FIXME_IMPLEMENT` / `TODO:` markers with real code before validating.");
    }
    if (/@\//.test(code)) tips.push("Use relative imports like `./Hero` instead of `@/`.");
    if (!tips.length) {
      tips.push("Click **Run → Preview**, then tell me exactly what you see.");
      tips.push("If there's a red error, paste it here and I'll help you reason about it.");
    }
    return `Sure — let's debug calmly.\n\nFor \`${opts.activeFile}\` in **${opts.productName}**:\n${tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nWhat do you think is failing first — syntax, missing UI, or validation markers?`;
  }

  if (/explain|what does|how does|doubt|confused|mean|simple|clarify/.test(q)) {
    return `Great question. Simple version:\n\nYou're building **${opts.productName}** (${level}) toward: "${objective}"\n\nTask **${opts.missionTitle}** uses \`${opts.activeFile}\` (~${code.split("\n").length} lines).\n\nWhich part confuses you most?\n1) what the task asks for\n2) how to structure the code\n3) how validation will check your work`;
  }

  if (/improve|rewrite|refactor|better|add|ui|design|full file|paste/.test(q)) {
    if (isAdvanced) {
      return `I won't paste a finished solution for **${level}** responsibility.\n\nFirst: what have you tried in \`${opts.activeFile}\`?\nThen tell me the one behavior you want next — I'll ask a guiding question or suggest a small next step.`;
    }
    return `We can improve it together — but you should type the change.\n\nFor \`${opts.activeFile}\`, try:\n1. One clear headline / form field\n2. One primary button (CTA)\n3. Remove any \`FIXME_IMPLEMENT\` markers\n\nIf you want a tiny snippet, paste your current attempt and ask for the next 5–10 lines only.`;
  }

  return `Hi — I'm here to clarify doubts about **${opts.productName}** / **${opts.missionTitle}** (${level}).\n\nYou asked: "${opts.question}"\n\nI can explain simply, debug Preview/validation, or guide the next step. Which do you want first?`;
}
