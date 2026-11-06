import LegalPage from "@/components/legal/LegalPage";

const sections = [
  {
    heading: "What AI Features Are Available",
    paragraphs: [
      "MakeMistakes may offer AI-powered learning support, assignment feedback, code suggestions, and project guidance. These features are intended to assist learning and improve productivity, but they are not equivalent to a teacher, legal adviser, or final authority. Users should interpret AI outputs as support rather than definitive truth."
    ],
  },
  {
    heading: "What Information May Be Processed",
    paragraphs: [
      "AI features may process user prompts, assignment content, detected errors, project tasks, and instructional context. This may include text, code examples, uploaded files, and other user-provided data necessary to answer a request or improve a result. The exact list should be configured by the administrator and disclosed to users."
    ],
  },
  {
    heading: "Third-Party Providers",
    paragraphs: [
      "The platform may use third-party AI providers for model access and inference. If such providers are used, the product should disclose the provider or vendors in the public AI disclosure and admin configuration. We do not claim that assignment data is never used for training unless that is technically true and contractually supported."
    ],
  },
  {
    heading: "Uploaded Assignments and Data Sharing",
    paragraphs: [
      "Users should understand that uploaded assignment information may be sent to an AI provider when a feature requires contextual analysis or generation. The platform must discloses this before use, and the user should confirm the level of data being sent. The platform must not imply that all data is automatically sent or never sent without the corresponding technical reality."
    ],
  },
  {
    heading: "Data Usage for Training",
    paragraphs: [
      "Any use of user data for model training should be disclosed clearly and supported by a valid legal basis and contractual arrangement. If an AI provider is configured to retain or use prompts for training, that should be communicated in the AI disclosure and product policy."
    ],
  },
  {
    heading: "AI Limitations",
    paragraphs: [
      "AI-generated outputs may contain inaccuracies, omissions, or context-specific mistakes. They are not a substitute for direct instruction, independent validation, or professional judgment. Students remain responsible for verifying the quality and suitability of AI outputs before using them in academic or professional work."
    ],
  },
  {
    heading: "Academic Responsibility",
    paragraphs: [
      "Students are expected to use AI support responsibly and in line with academic integrity requirements. AI should be used to learn and build understanding, not to misrepresent original work or bypass legitimate assessment standards."
    ],
  },
];

export default function AIUsagePolicyPage() {
  return (
    <LegalPage
      title="AI Usage Policy"
      version="1.0"
      effectiveDate="2026-11-01"
      lastUpdated="2026-11-01"
      description="This AI Usage Policy explains the nature of AI features on MakeMistakes, what data may be processed, the limits of automated assistance, and the student's responsibility to validate outputs."
      sections={sections}
    />
  );
}
