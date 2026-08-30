/**
 * Sandboxed iframe preview for Beginner BuildOS.
 * Student code never executes in the MakeMistakes Node process.
 */

export type PreviewFiles = Record<string, string>;

function norm(files: PreviewFiles): PreviewFiles {
  const out: PreviewFiles = {};
  for (const [k, v] of Object.entries(files)) out[k.replace(/\\/g, "/")] = v;
  return out;
}

function stripModuleSyntax(source: string, isPage = false): string {
  let cleaned = source
    .replace(/["']use client["'];?\s*/g, "")
    .replace(/import\s+(?:type\s+)?[\s\S]*?from\s+["'][^"']+["'];?/g, "")
    .replace(/import\s+["'][^"']+["'];?/g, "")
    .replace(/import\s+[\s\S]*?;\s*/g, "");

  if (isPage) {
    const matchDefault = cleaned.match(/export\s+default\s+function\s+([a-zA-Z0-9_$]+)/);
    const matchNamed = cleaned.match(/export\s+function\s+([a-zA-Z0-9_$]+)/);

    if (matchDefault && matchDefault[1]) {
      const funcName = matchDefault[1];
      cleaned = cleaned.replace(/export\s+default\s+function\s+/g, "function ");
      cleaned += `\nwindow.__BUILDOS_PAGE_APP__ = ${funcName};\n`;
    } else if (matchNamed && matchNamed[1]) {
      const funcName = matchNamed[1];
      cleaned += `\nwindow.__BUILDOS_PAGE_APP__ = ${funcName};\n`;
    } else {
      cleaned = cleaned.replace(/export\s+default\s+function\s+/g, "function ");
      cleaned = cleaned.replace(/export\s+default\s+/g, "window.__BUILDOS_PAGE_APP__ = ");
    }
  } else {
    // Sibling component files — do NOT mutate window.__BUILDOS_PAGE_APP__
    cleaned = cleaned.replace(/export\s+default\s+function\s+/g, "function ");
    cleaned = cleaned.replace(/export\s+default\s+/g, "var __sibling_export = ");
  }

  return cleaned
    .replace(/export\s+function\s+/g, "function ")
    .replace(/export\s+const\s+/g, "var ")
    .replace(/export\s+let\s+/g, "var ")
    .replace(/export\s+\{[^}]*\};?/g, "");
}

export function buildBuildOsPreviewHtml(
  files: PreviewFiles,
  meta: { problemId: string }
): string {
  const f = norm(files);
  const page = f["app/page.tsx"] || f["page.tsx"] || "";
  const css = f["app/globals.css"] || f["globals.css"] || "";

  // Collect ONLY React UI component files (.tsx, .jsx or components/*.ts)
  let extraCode = "";
  const seenBaseNames = new Set<string>();

  // Sort entries so app/ components take precedence over root duplicates
  const entries = Object.entries(f).sort(([a], [b]) => {
    if (a.startsWith("app/") && !b.startsWith("app/")) return -1;
    if (!a.startsWith("app/") && b.startsWith("app/")) return 1;
    return a.localeCompare(b);
  });

  for (const [filePath, content] of entries) {
    const lower = filePath.toLowerCase();
    const isUIComponent =
      (lower.endsWith(".tsx") || lower.endsWith(".jsx") || lower.startsWith("components/")) &&
      !lower.endsWith(".d.ts") &&
      !lower.endsWith("layout.tsx") &&
      !lower.endsWith("next.config.ts") &&
      !lower.endsWith("postcss.config.mjs") &&
      filePath !== "app/page.tsx" &&
      filePath !== "page.tsx";

    if (isUIComponent) {
      const baseName = filePath.split("/").pop() || filePath;
      if (seenBaseNames.has(baseName)) {
        continue; // Skip duplicate component declarations
      }
      seenBaseNames.add(baseName);
      extraCode += `\n// File: ${filePath}\n` + stripModuleSyntax(content, false) + "\n";
    }
  }

  const pageCode = stripModuleSyntax(page, true);

  // Extract referenced JSX components in student code to prevent runtime Uncaught ReferenceError
  const jsxTags = Array.from(
    new Set(
      [...(page + " " + extraCode).matchAll(/<([A-Z][a-zA-Z0-9_$]*)/g)]
        .map((m) => m[1])
        .filter((t) => !["React", "Fragment", "Canvas", "Float", "OrbitControls"].includes(t))
    )
  );

  const stubCode = jsxTags
    .map(
      (tag) => `
if (typeof ${tag} === "undefined") {
  var ${tag} = function ${tag}Placeholder(props) {
    return React.createElement(
      "div",
      { className: "p-6 my-3 rounded-2xl border border-dashed border-teal-500/50 bg-teal-950/30 text-teal-300 font-sans text-center shadow-sm" },
      React.createElement("div", { className: "text-sm font-bold text-teal-200 mb-1 flex items-center justify-center gap-2" }, "⚡ ${tag} Component Placeholder"),
      React.createElement("p", { className: "text-xs text-zinc-400" }, "Create ${tag}.tsx in your BuildOS workspace to customize this section.")
    );
  };
}
`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Preview ${escapeHtml(meta.problemId)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
html,body,#root{margin:0;min-height:100%}
body{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#ffffff;color:#0f172a}
${css}
</style>
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.26.9/babel.min.js"></script>
</head>
<body>
<div id="root"></div>
<script>
window.__post=function(type,payload){parent.postMessage(Object.assign({source:"makemistakes-buildos-preview",type:type},payload||{}), "*")};
window.onerror=function(msg, url, line, col, err){
  if (String(msg).includes("ResizeObserver")) return;
  var detail = (err && err.stack) ? err.stack : (err && err.message) ? err.message : String(msg);
  var cleanMsg = (detail === "Script error." || detail === "Uncaught Script error.")
    ? "Runtime Error: An unhandled JavaScript exception occurred in your preview code. Check imported component exports and syntax."
    : detail;
  window.__post("error",{message: cleanMsg});
};
</script>
<script type="text/babel" data-presets="react,typescript">
const React = window.React;
const { useState, useEffect, useMemo, useRef, useCallback } = React;
const motion = new Proxy({},{
  get:(target, prop) => {
    return function MotionComponent(props) {
      const Tag = prop || "div";
      const { initial, animate, transition, ...rest } = props || {};
      return React.createElement(Tag, rest, props.children);
    };
  }
});
function icon(name){
  return function Icon(props){
    return React.createElement("span", Object.assign({}, props, {
      title: name,
      style: Object.assign({display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:4,background:"#0f766e",color:"#ffffff",fontSize:10}, props&&props.style||{})
    }), name.charAt(0));
  };
}
const Sparkles = icon("Sparkles");
const Check = icon("Check");
const Play = icon("Play");
const ArrowRight = icon("→");
const Plus = icon("+");
const Trash = icon("×");

function Canvas(props){
  return React.createElement("div", {
    style:{width:"100%",height:200,display:"grid",placeItems:"center",color:"#5eead4",background:"#020617",fontSize:12,borderRadius:8}
  }, "3D Canvas Ready", props.children);
}
function Float(props){ return React.createElement(React.Fragment, null, props.children); }
function OrbitControls(){ return null; }

window.__BUILDOS_PAGE_APP__ = null;

${extraCode}

${stubCode}

${pageCode}

class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    var msg = (error && error.stack) ? error.stack : (error && error.message) ? error.message : String(error);
    window.__post("error", { name: error ? error.name || "RuntimeError" : "RuntimeError", message: msg });
  }
  componentDidMount() {
    if (!this.state.hasError) {
      window.__post("ready", {});
    }
  }
  render() {
    if (this.state.hasError) {
      var errMsg = this.state.error && this.state.error.message ? this.state.error.message : String(this.state.error);
      var errName = this.state.error && this.state.error.name ? this.state.error.name : "Runtime Error";
      return React.createElement("div", {
        style: { padding: 24, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, margin: 20, fontFamily: "monospace", color: "#991b1b" }
      },
        React.createElement("h3", { style: { margin: "0 0 8px", fontSize: 14, fontWeight: "bold" } }, errName + ": " + errMsg),
        React.createElement("pre", { style: { margin: 0, whiteSpace: "pre-wrap", fontSize: 12 } }, (this.state.error && this.state.error.stack) ? this.state.error.stack : errMsg)
      );
    }
    return this.props.children;
  }
}

try {
  const App = window.__BUILDOS_PAGE_APP__
    || (typeof HeroPage !== "undefined" ? HeroPage : null)
    || (typeof WithNavbar !== "undefined" ? WithNavbar : null)
    || (typeof AppShell !== "undefined" ? AppShell : null)
    || (typeof CreateInvoicePage !== "undefined" ? CreateInvoicePage : null)
    || (typeof HomePage !== "undefined" ? HomePage : null);
    
  if (!App) {
    throw new Error("No exported React component found in app/page.tsx");
  }
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(PreviewErrorBoundary, null, React.createElement(App)));
} catch (err) {
  const errMsg = err && err.message ? err.message : String(err);
  const errName = err && err.name ? err.name : "Error";
  window.__post("error", { name: errName, message: errMsg });
  document.getElementById("root").innerHTML =
    '<div style="padding:24px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:20px;font-family:monospace;color:#991b1b;">' +
    '<h3 style="margin:0 0 8px;font-size:14px;font-weight:bold;">Preview Runtime Error: ' + errName + '</h3>' +
    '<pre style="margin:0;white-space:pre-wrap;font-size:12px;">' + (err && err.stack ? err.stack : errMsg) + '</pre>' +
    '</div>';
}
</script>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
