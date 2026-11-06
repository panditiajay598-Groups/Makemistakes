import LegalPage from "@/components/legal/LegalPage";

const sections = [
  {
    heading: "Purpose",
    paragraphs: [
      "This Data Retention and Deletion Policy explains how MakeMistakes manages user data throughout the lifecycle of an account. The service keeps only the information necessary for operations, legal requirements, and product integrity while supporting user rights to deletion and correction where the law permits."
    ],
  },
  {
    heading: "Retention Principles",
    paragraphs: [
      "Data should be retained only for the period necessary to provide the product, support consumer rights, resolve disputes, comply with legal obligations, and protect the service from fraud or abuse. Different categories may need different retention periods depending on the context, including subscriptions, support requests, billing records, and security events."
    ],
  },
  {
    heading: "Deletion Requests",
    paragraphs: [
      "Users may request account deletion through the account settings or the support channel. The request is authenticated, reviewed, and tracked to ensure it is not processed by an unauthorized party. The platform must confirm the request and explain what will happen to related assignment content, logs, and connected records."
    ],
  },
  {
    heading: "What Is Deleted",
    paragraphs: [
      "A deletion request may remove or anonymize account details, profile information, assignment metadata, and any personal data directly associated with the account. It may also involve removing uploaded files or project data where feasible and where a legal retention exception does not apply."
    ],
  },
  {
    heading: "What Must Be Retained",
    paragraphs: [
      "Some records may need to be retained for tax, audit, fraud prevention, dispute resolution, or compliance purposes. This includes payment records, limited support logs, and any information required by law. The platform should not simply delete records that are legally required to remain accessible."
    ],
  },
  {
    heading: "Third-Party Dependencies",
    paragraphs: [
      "Data may also exist in connected systems such as payment gateways, email providers, storage services, or AI tools. Deletion is not complete until those related data dependencies are reviewed and appropriately handled. The platform should account for both direct and indirect data stores."
    ],
  },
  {
    heading: "Status Tracking",
    paragraphs: [
      "Deletion requests should be logged with timestamps, review state, and final completion status so that the platform can demonstrate a fair and accountable process. A user may also receive a confirmation when the request has been completed or when a legal exception prevents full deletion."
    ],
  },
];

export default function DataDeletionPolicyPage() {
  return (
    <LegalPage
      title="Data Retention and Deletion Policy"
      version="1.0"
      effectiveDate="2026-11-01"
      lastUpdated="2026-11-01"
      description="This policy sets out the retention periods, deletion process, exceptions, and third-party considerations that apply when a user seeks to delete their account or personal information."
      sections={sections}
    />
  );
}
