/**
 * MakeMistakes BuildOS - Personal Data PDF Exporter
 *
 * Lightweight, zero-dependency, standards-compliant PDF 1.4 document builder.
 * Generates beautifully formatted, multi-page PDF documents for user data exports.
 */

export interface ExportDataPayload {
  user: string;
  email: string | null;
  exportedAt: string;
  profile: Record<string, any> | null;
  preferences: Record<string, any> | null;
  journeysCount: number;
  journeys: Record<string, any>[];
  completionsCount: number;
  completions: Record<string, any>[];
  workspacesCount: number;
  workspaces: Record<string, any>[];
}

function sanitizeText(input: unknown): string {
  if (input === null || input === undefined) return "";
  const str = typeof input === "string" ? input : String(input);
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n\t]/g, " ")
    .replace(/[^\x20-\x7E]/g, (ch) => {
      if (ch === "—" || ch === "–") return "-";
      if (ch === "“" || ch === "”") return '"';
      if (ch === "‘" || ch === "’") return "'";
      if (ch === "•") return "*";
      if (ch === "…") return "...";
      return " ";
    })
    .trim();
}

function wrapLine(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length <= maxLen) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      if (word.length > maxLen) {
        // Break long unbreakable word
        let remainder = word;
        while (remainder.length > maxLen) {
          lines.push(remainder.slice(0, maxLen));
          remainder = remainder.slice(maxLen);
        }
        current = remainder;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

class SimplePdfDocument {
  private pages: string[][] = [];
  private currentPage: string[] = [];
  private y = 730;

  constructor() {
    this.newPage();
  }

  public newPage() {
    this.currentPage = [];
    this.pages.push(this.currentPage);
    this.y = 730;
  }

  public ensureSpace(needed: number) {
    if (this.y - needed < 55) {
      this.newPage();
    }
  }

  public drawBanner(title: string, subtitle: string) {
    // Teal banner: RGB (13, 92, 82) -> 0.051 0.361 0.322
    this.currentPage.push(`q 0.051 0.361 0.322 rg 45 ${this.y - 48} 522 52 re f Q`);
    this.currentPage.push(`BT /F2 16 Tf 1 1 1 rg 60 ${this.y - 20} Td (${sanitizeText(title)}) Tj ET`);
    this.currentPage.push(`BT /F1 9.5 Tf 0.85 0.95 0.93 rg 60 ${this.y - 36} Td (${sanitizeText(subtitle)}) Tj ET`);
    this.y -= 68;
  }

  public drawSectionHeader(title: string) {
    this.ensureSpace(34);
    // Subtle background bar with teal left accent
    this.currentPage.push(`q 0.94 0.96 0.96 rg 45 ${this.y - 18} 522 22 re f Q`);
    this.currentPage.push(`q 0.051 0.361 0.322 rg 45 ${this.y - 18} 4 22 re f Q`);
    this.currentPage.push(`BT /F2 11 Tf 0.051 0.361 0.322 rg 58 ${this.y - 12} Td (${sanitizeText(title)}) Tj ET`);
    this.y -= 28;
  }

  public drawKeyValue(label: string, value: string, indent = 55) {
    const sanitizedVal = sanitizeText(value || "N/A");
    const wrapped = wrapLine(sanitizedVal, 60);

    this.ensureSpace(wrapped.length * 14 + 4);

    this.currentPage.push(`BT /F2 9 Tf 0.25 0.25 0.25 rg ${indent} ${this.y} Td (${sanitizeText(label)}:) Tj ET`);
    this.currentPage.push(`BT /F1 9 Tf 0.1 0.1 0.1 rg ${indent + 130} ${this.y} Td (${wrapped[0]}) Tj ET`);
    this.y -= 14;

    for (let i = 1; i < wrapped.length; i++) {
      this.currentPage.push(`BT /F1 9 Tf 0.1 0.1 0.1 rg ${indent + 130} ${this.y} Td (${wrapped[i]}) Tj ET`);
      this.y -= 14;
    }
  }

  public drawCard(fields: { label: string; value: string }[]) {
    // Estimate space needed
    const totalLines = fields.reduce((acc, f) => acc + wrapLine(f.value || "N/A", 65).length, 0);
    const boxHeight = totalLines * 13 + 12;
    this.ensureSpace(boxHeight + 8);

    // Box border & subtle background
    this.currentPage.push(`q 0.98 0.99 0.99 rg 50 ${this.y - boxHeight} 512 ${boxHeight} re f Q`);
    this.currentPage.push(`q 0.88 0.90 0.90 RG 0.5 w 50 ${this.y - boxHeight} 512 ${boxHeight} re S Q`);

    const startY = this.y - 12;
    let currentFieldY = startY;

    for (const field of fields) {
      const wrapped = wrapLine(sanitizeText(field.value || "N/A"), 65);
      this.currentPage.push(`BT /F2 8.5 Tf 0.3 0.3 0.3 rg 60 ${currentFieldY} Td (${sanitizeText(field.label)}:) Tj ET`);
      this.currentPage.push(`BT /F1 8.5 Tf 0.1 0.1 0.1 rg 170 ${currentFieldY} Td (${wrapped[0]}) Tj ET`);
      currentFieldY -= 13;

      for (let i = 1; i < wrapped.length; i++) {
        this.currentPage.push(`BT /F1 8.5 Tf 0.1 0.1 0.1 rg 170 ${currentFieldY} Td (${wrapped[i]}) Tj ET`);
        currentFieldY -= 13;
      }
    }

    this.y -= boxHeight + 8;
  }

  public drawEmptyNotice(text: string) {
    this.ensureSpace(20);
    this.currentPage.push(`BT /F3 9 Tf 0.5 0.5 0.5 rg 60 ${this.y} Td (${sanitizeText(text)}) Tj ET`);
    this.y -= 18;
  }

  public build(): Buffer {
    const totalPages = this.pages.length;

    // Header & Footer decoration across all pages
    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1;
      const footerText = `MakeMistakes BuildOS - Data & Privacy Export   |   Page ${pageNum} of ${totalPages}`;

      // Footer divider line and text
      this.pages[i].push(`q 0.82 0.84 0.84 RG 0.5 w 45 38 m 567 38 l S Q`);
      this.pages[i].push(`BT /F1 8 Tf 0.45 0.45 0.45 rg 180 26 Td (${sanitizeText(footerText)}) Tj ET`);

      // Header on continuation pages (page 2+)
      if (i > 0) {
        this.pages[i].push(`q 0.82 0.84 0.84 RG 0.5 w 45 755 m 567 755 l S Q`);
        this.pages[i].push(`BT /F2 8 Tf 0.051 0.361 0.322 rg 45 760 Td (MakeMistakes BuildOS) Tj ET`);
        this.pages[i].push(`BT /F1 8 Tf 0.45 0.45 0.45 rg 150 760 Td (|  Personal Data & Learning Export) Tj ET`);
      }
    }

    const objects: string[] = [];
    const catalogId = 1;
    const pagesId = 2;
    const fontId = 3;

    // 1: Catalog
    objects.push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    // 2: Pages (placeholder)
    objects.push("");
    // 3: Font Resources
    objects.push(
      `<< /Font << ` +
        `/F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> ` +
        `/F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> ` +
        `/F3 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >> ` +
        `>> >>`
    );

    const pageRefs: string[] = [];

    for (let i = 0; i < totalPages; i++) {
      // Page object
      const pageIndex = objects.length + 1;
      objects.push(""); // will replace

      // Content stream
      const streamContent = this.pages[i].join("\n");
      const streamLen = Buffer.byteLength(streamContent, "latin1");
      const contentIndex = objects.length + 1;
      objects.push(`<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`);

      objects[pageIndex - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources ${fontId} 0 R /Contents ${contentIndex} 0 R >>`;
      pageRefs.push(`${pageIndex} 0 R`);
    }

    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${totalPages} >>`;

    let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets: number[] = [0];

    for (let i = 0; i < objects.length; i++) {
      offsets.push(Buffer.byteLength(pdf, "latin1"));
      pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, "latin1");
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, "latin1");
  }
}

/**
 * Builds a comprehensive, professional personal data PDF export for MakeMistakes students.
 */
export function generatePersonalDataPdf(data: ExportDataPayload): Buffer {
  const doc = new SimplePdfDocument();

  // Header Banner
  doc.drawBanner("MakeMistakes BuildOS", "Personal Data & Account Learning Export Report");

  // Section 1: Account Summary
  doc.drawSectionHeader("1. Account & Security Overview");
  doc.drawKeyValue("Primary User ID", data.user);
  doc.drawKeyValue("Registered Email", data.email || "Not specified");
  doc.drawKeyValue("Export Timestamp", data.exportedAt);
  doc.drawKeyValue("Completed Journeys", String(data.journeysCount));
  doc.drawKeyValue("Problem Completions", String(data.completionsCount));
  doc.drawKeyValue("Active Workspaces", String(data.workspacesCount));

  // Section 2: Profile Details
  doc.drawSectionHeader("2. Profile Information");
  if (data.profile && Object.keys(data.profile).length > 0) {
    const p = data.profile;
    doc.drawKeyValue("Display Name", p.name || p.displayName || "Not specified");
    doc.drawKeyValue("Username / Handle", p.username || p.handle || "Not specified");
    doc.drawKeyValue("Bio / Headline", p.bio || p.headline || "Not specified");
    doc.drawKeyValue("Account Role", p.role || "student");
    if (p.githubUsername) doc.drawKeyValue("Connected GitHub", p.githubUsername);
    if (p.location) doc.drawKeyValue("Location", p.location);
    if (p.createdAt) doc.drawKeyValue("Member Since", String(p.createdAt));
  } else {
    doc.drawEmptyNotice("No custom profile records have been created yet.");
  }

  // Section 3: User Preferences
  doc.drawSectionHeader("3. Workspace & Privacy Preferences");
  if (data.preferences && Object.keys(data.preferences).length > 0) {
    const pref = data.preferences;
    doc.drawKeyValue("Editor Theme", pref.theme || "System Default");
    doc.drawKeyValue("Auto-Save", pref.autoSave !== undefined ? String(pref.autoSave) : "Enabled");
    doc.drawKeyValue("Email Notifications", pref.emailNotifications !== undefined ? String(pref.emailNotifications) : "Enabled");
    doc.drawKeyValue("AI Mentor Style", pref.aiMentorStyle || "Guided Learning");
  } else {
    doc.drawEmptyNotice("Standard default preferences are currently active.");
  }

  // Section 4: Product Journeys
  doc.drawSectionHeader(`4. Product Journeys (${data.journeysCount})`);
  if (data.journeys && data.journeys.length > 0) {
    for (let i = 0; i < data.journeys.length; i++) {
      const j = data.journeys[i];
      const journeyTitle = j.problemTitle
        ? `${j.problemTitle}${j.problemId ? ` (${j.problemId})` : ""}`
        : j.problemId || j.title || "Custom Problem";
      doc.drawCard([
        { label: "Journey #", value: String(i + 1) },
        { label: "Problem", value: journeyTitle },
        { label: "Current Phase", value: j.currentPhase || j.phase || j.currentStage || "Phase 1 - Discover" },
        { label: "Status", value: j.status || "Active" },
        { label: "Last Activity", value: j.updatedAt || j.lastActivityAt || "Recent" },
      ]);
    }
  } else {
    doc.drawEmptyNotice("No product journeys started yet.");
  }

  // Section 5: Problem Completions
  doc.drawSectionHeader(`5. Milestone & Problem Completions (${data.completionsCount})`);
  if (data.completions && data.completions.length > 0) {
    for (let i = 0; i < data.completions.length; i++) {
      const c = data.completions[i];
      const compTitle = c.problemTitle
        ? `${c.problemTitle}${c.problemId ? ` (${c.problemId})` : ""}`
        : c.problemId || "Completed Problem";
      doc.drawCard([
        { label: "Completion #", value: String(i + 1) },
        { label: "Problem", value: compTitle },
        { label: "Completed At", value: String(c.completedAt || c.createdAt || "Recorded") },
        { label: "Score / Grade", value: c.score ? `${c.score}%` : "Verified Complete" },
      ]);
    }
  } else {
    doc.drawEmptyNotice("No verified problem completions yet.");
  }

  // Section 6: BuildOS Workspaces
  doc.drawSectionHeader(`6. BuildOS Workspaces (${data.workspacesCount})`);
  if (data.workspaces && data.workspaces.length > 0) {
    for (let i = 0; i < data.workspaces.length; i++) {
      const w = data.workspaces[i];
      doc.drawCard([
        { label: "Workspace #", value: String(i + 1) },
        { label: "Project Identifier", value: w.problemId || w.projectId || w.name || "Default Project" },
        { label: "Last Saved", value: String(w.updatedAt || w.lastSaved || "Recent") },
      ]);
    }
  } else {
    doc.drawEmptyNotice("No separate BuildOS workspaces registered.");
  }

  return doc.build();
}
