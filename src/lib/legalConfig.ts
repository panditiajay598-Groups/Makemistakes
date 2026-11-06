export type LegalDocumentKey =
  | "privacy-policy"
  | "terms-and-conditions"
  | "refund-policy"
  | "cookie-policy"
  | "acceptable-use-policy"
  | "intellectual-property-policy"
  | "ai-usage-policy"
  | "grievance-redressal"
  | "data-deletion-policy";

export type LegalDocumentInfo = {
  slug: LegalDocumentKey;
  title: string;
  route: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
};

export const companyLegalInfo = {
  companyName: "MakeMistakes",
  businessModel: "B2C EdTech SaaS",
  jurisdiction: "India",
  privacyContact: "To be configured by administrator",
  grievanceOfficerName: "To be configured by administrator",
  grievanceEmail: "To be configured by administrator",
  grievanceContact: "To be configured by administrator",
  grievanceAddress: "To be configured by administrator",
  refundEligibility: "To be configured by administrator",
  refundWindowDays: "To be configured by administrator",
  subscriptionAutoRenewal: "To be configured by administrator",
  cancellationRules: "To be configured by administrator",
  refundProcessingTimeline: "To be configured by administrator",
  aiProviderDisclosure: "To be configured by administrator",
  cookiePreferenceVersion: "2026.01",
};

export const legalDocuments: LegalDocumentInfo[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    route: "/privacy-policy",
    version: "1.0",
    effectiveDate: "2026-11-01",
    lastUpdated: "2026-11-01",
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    route: "/terms-and-conditions",
    version: "1.0",
    effectiveDate: "2026-11-01",
    lastUpdated: "2026-11-01",
  },
  {
    slug: "refund-policy",
    title: "Refund & Cancellation Policy",
    route: "/refund-policy",
    version: "1.0",
    effectiveDate: "2026-11-01",
    lastUpdated: "2026-11-01",
  },
  {
    slug: "cookie-policy",
    title: "Cookie Policy",
    route: "/cookie-policy",
    version: "1.0",
    effectiveDate: "2026-11-01",
    lastUpdated: "2026-11-01",
  },
  {
    slug: "acceptable-use-policy",
    title: "Acceptable Use Policy",
    route: "/acceptable-use-policy",
    version: "1.0",
    effectiveDate: "2026-11-01",
    lastUpdated: "2026-11-01",
  },
  {
    slug: "intellectual-property-policy",
    title: "Intellectual Property Policy",
    route: "/intellectual-property-policy",
    version: "1.0",
    effectiveDate: "2026-11-01",
    lastUpdated: "2026-11-01",
  },
  {
    slug: "ai-usage-policy",
    title: "AI Usage Policy",
    route: "/ai-usage-policy",
    version: "1.0",
    effectiveDate: "2026-11-01",
    lastUpdated: "2026-11-01",
  },
  {
    slug: "grievance-redressal",
    title: "Grievance Redressal Policy",
    route: "/grievance-redressal",
    version: "1.0",
    effectiveDate: "2026-11-01",
    lastUpdated: "2026-11-01",
  },
  {
    slug: "data-deletion-policy",
    title: "Data Retention and Deletion Policy",
    route: "/data-deletion-policy",
    version: "1.0",
    effectiveDate: "2026-11-01",
    lastUpdated: "2026-11-01",
  },
];

export function getLegalDocumentBySlug(slug: string) {
  return legalDocuments.find((document) => document.slug === slug);
}
