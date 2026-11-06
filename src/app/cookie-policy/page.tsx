import LegalPage from "@/components/legal/LegalPage";

const sections = [
  {
    heading: "What Are Cookies?",
    paragraphs: [
      "Cookies are small data files stored on a device when a website or application is accessed. They help maintain session continuity, remember preferences, measure traffic, and support product features. MakeMistakes uses cookies only for categories that are actually implemented and necessary for the platform to function or support the user experience."
    ],
  },
  {
    heading: "Strictly Necessary Cookies",
    paragraphs: [
      "Strictly necessary cookies enable core functionality such as authentication, session management, security checks, routing, and form validation. These cookies are required for the platform to operate securely and cannot be disabled without affecting essential functionality."
    ],
  },
  {
    heading: "Functional Cookies",
    paragraphs: [
      "Functional cookies may store preferences such as selected language, theme, accessibility settings, or user workspace preferences. They help tailor the experience and support convenient site navigation. These cookies are only used when the user has provided consent for the functional category."
    ],
  },
  {
    heading: "Analytics Cookies",
    paragraphs: [
      "Analytics cookies help measure product usage, monitor feature engagement, detect defects, and understand traffic sources. They may include event tracking and aggregated metrics. Analytics cookies are disabled by default and only activated when consent is granted."
    ],
  },
  {
    heading: "Marketing Cookies",
    paragraphs: [
      "Marketing cookies may be used for campaign measurement, product promotion, or communications that are not necessary for the service itself. Marketing consent is separate from account registration and must remain opt-in rather than pre-selected."
    ],
  },
  {
    heading: "Consent Management",
    paragraphs: [
      "Users can accept all cookies, reject non-essential categories, or customize their preferences through the cookie consent mechanism. The preference is stored with a policy version and a timestamp so that consent records can be reviewed and updated. Users may change preferences later from the appropriate settings or consent controls."
    ],
  },
  {
    heading: "Third-Party Services",
    paragraphs: [
      "If the platform uses third-party providers for analytics, personalization, or marketing, those providers will only receive data in line with the selected consent preferences and the product's configured policies. The platform should avoid activating non-essential tracking before valid consent."
    ],
  },
  {
    heading: "Your Choices",
    paragraphs: [
      "You may choose to accept or reject optional cookies at any time. If you reject non-essential cookies, the platform will continue to work for essential services, but some optional features may be limited. The final consent state can be reviewed in the platform or legal settings, subject to administrator configuration."
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      version="1.0"
      effectiveDate="2026-11-01"
      lastUpdated="2026-11-01"
      description="This Cookie Policy explains the categories of cookies used by MakeMistakes, the consent choices available to users, and the product safeguards that prevent non-essential tracking before consent is provided."
      sections={sections}
    />
  );
}
