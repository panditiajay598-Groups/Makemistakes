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
  mode?: string;
  problemStatement?: string;
  difficulty?: string;
  design?: any;
  plan?: any;
}): string {
  const q = (opts.question || "").trim().toLowerCase();
  const code = opts.fileCode || "";
  const rawDifficulty = (opts.difficulty || opts.responsibilityLevel || "beginner").toLowerCase();
  const isAdvanced = rawDifficulty.includes("adv") || rawDifficulty.includes("expert");
  const isIntermediate = rawDifficulty.includes("inter");
  const isBeginner = !isAdvanced && !isIntermediate;

  const statement = opts.problemStatement || opts.statement || opts.buildObjective || "Solve this product problem";
  const objective = opts.buildObjective || statement;
  const design = opts.design || {};
  const plan = opts.plan || {};

  const productGoal = design.productGoal || objective;
  const targetUser = Array.isArray(design.selectedUsers) && design.selectedUsers.length > 0
    ? design.selectedUsers.join(", ")
    : (design.customUserRole || "Target User");
  const techStack = plan.techDecisions ? Object.values(plan.techDecisions).filter(Boolean).join(", ") : "Next.js, TypeScript, Tailwind";

  if (opts.mode === "problem_understanding" || /understand|problem analysis|breakdown/.test(q)) {
    return `### Nova's Understanding of ${opts.productName}

**1. What is the problem?**
The core problem is: "${statement}". Users face high cognitive friction, disjointed workflows, or unreliable mechanisms when attempting to achieve this outcome.

**2. Target Persona & Goal**
• Persona: **${targetUser}**
• Core Goal: **${productGoal}**
• Tech Stack: **${techStack}**

**3. Major Pain Points**
- Lack of immediate visibility into status or progress
- Friction and complexity during everyday interactions
- Missing proactive feedback when something needs attention

**4. What should a useful product accomplish?**
A successful MVP should provide a fast, clear, and reassuring interface that gives the user instant feedback and seamless control.

**5. How to measure success?**
Can a first-time user accomplish their primary goal in under 60 seconds with zero confusion?`;
  }

  if (!q || /^(hi|hello|hey|hola|namaste)\b/.test(q)) {
    let greeting = `Hi! I'm Nova, your learning mentor for **${opts.productName}**.\n\n`;
    greeting += `• **Goal**: ${productGoal}\n• **Target Persona**: ${targetUser}\n• **Tech Stack**: ${techStack}\n• **Current Task**: ${opts.missionTitle} (\`${opts.activeFile}\`)\n\n`;

    if (isBeginner) {
      greeting += `📚 **Guided Build Mode**: Your job is to build this product. My job is to help you learn how.\n\nI'll explain concepts, give hints, show focused examples, and help debug. I won't auto-build entire features for you — that's how you learn!\n\nUse the **💡 Explain**, **🧭 Give a Hint**, or **📋 Example** buttons to get started.`;
    } else if (isIntermediate) {
      greeting += `🔧 **Assisted Build Mode**: You own most of the implementation. Tell me what you've tried and I'll help you move forward.`;
    } else {
      greeting += `🚀 **Independent Build Mode**: You build, I review. Share your approach or code and I'll challenge your design decisions.`;
    }
    return greeting;
  }

  if (/run|compile|error|bug|fix|broken|preview|validat/.test(q)) {
    if (isAdvanced) {
      return `### 🚀 Independent Debug Audit for \`${opts.activeFile}\`\n\nI won't write the fix for you. Let's analyze potential failure points:\n1. Check for uncaught asynchronous exceptions or unhandled Promise rejections.\n2. Verify that state updates don't cause infinite re-render cascades.\n3. Ensure nullability and boundary checks for all props and data payloads.\n\nWhat does your console error or test failure output indicate?`;
    }

    if (isIntermediate) {
      return `### 🔧 Assisted Debug Guidance for \`${opts.activeFile}\`\n\nHere is what to check:\n1. Ensure default export or named export matches your import paths.\n2. Verify that any state hooks (\`useState\`, \`useEffect\`) adhere to the Rules of Hooks.\n3. Make sure all \`TODO\` markers have been replaced.\n\nPaste the specific error message if you need hints.`;
    }

    // Guided Build: Walk through the fix without doing it for them
    return `### 📚 Guided Debug for \`${opts.activeFile}\`\n\nLet me help you understand what's wrong:\n\n**Common issues to check:**\n1. Does your component have \`export default function\`?\n2. Are all your imports correct (file paths and component names match)?\n3. Does your JSX have all tags properly closed?\n\nPaste the error message from the console and I'll walk you through fixing it step by step!`;
  }

  if (/improve|rewrite|refactor|better|add|ui|design|full file|paste|build|create/.test(q)) {
    if (isAdvanced) {
      return `### 🔴 Advanced Socratic Guidance
I will not provide finished copy-paste code at the Advanced level.
To implement this feature in \`${opts.activeFile}\`:
1. What state boundary makes the most sense to avoid unnecessary re-renders?
2. How will you isolate side-effects and handle network timeouts?
3. Sketch out the TypeScript interface first and share your proposed data structure.`;
    }

    if (isIntermediate) {
      return `### 🟡 Intermediate Architectural Blueprint for \`${opts.activeFile}\`

Here is the structural scaffold with TypeScript interfaces:

\`\`\`tsx
// FILE: ${opts.activeFile}
import React, { useState } from "react";

interface ComponentProps {
  title?: string;
  onAction?: (data: any) => void;
}

export default function Component({ title = "${opts.productName}", onAction }: ComponentProps) {
  // TODO: Add local state matching your planned DB entities
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    // TODO: Implement validation & action trigger
  };

  return (
    <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {/* TODO: Add input form and action buttons */}
    </div>
  );
}
\`\`\`
Fill in the TODO blocks with your business logic!`;
    }

    // Beginner: Full code proposal
    return `### 🟢 Complete Component Proposal for \`${opts.activeFile}\`

Here is the complete, ready-to-use component for **${opts.productName}** matching your design goal:

\`\`\`tsx
// FILE: ${opts.activeFile}
import React, { useState } from "react";

export default function ${opts.productName.replace(/[^a-zA-Z0-9]/g, "") || "App"}Screen() {
  const [inputVal, setInputVal] = useState("");
  const [items, setItems] = useState<string[]>([]);

  const handleAdd = () => {
    if (!inputVal.trim()) return;
    setItems((prev) => [...prev, inputVal.trim()]);
    setInputVal("");
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-6">
        <div>
          <span className="text-xs font-mono font-semibold uppercase text-teal-600 tracking-wider">
            ${opts.productName}
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1">${productGoal}</h1>
          <p className="text-sm text-zinc-500">Built for: ${targetUser}</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter details..."
            className="flex-1 px-4 py-2 border border-zinc-300 rounded-xl text-sm outline-none focus:border-teal-500"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="p-3 bg-zinc-50 rounded-lg text-sm text-zinc-800 border border-zinc-100">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
\`\`\`

You can review this code and click **Apply Changes** to add it to your project workspace!`;
  }

  return `I'm Nova, your AI mentor for **${opts.productName}** (${rawDifficulty.toUpperCase()}).\n\nI have your complete blueprint: Target Persona "${targetUser}", Product Goal "${productGoal}", and Tech Stack "${techStack}".\n\nHow can I help you progress on **${opts.missionTitle}** in \`${opts.activeFile}\`?`;
}
