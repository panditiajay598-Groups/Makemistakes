import LegalPage from "@/components/legal/LegalPage";

const sections = [
  {
    heading: "Purpose",
    paragraphs: [
      "The Grievance Redressal Policy explains how users may raise concerns relating to privacy, subscription issues, abusive content, account access, intellectual property complaints, or other platform matters. The aim is to provide a clear, accessible, and accountable complaint process."
    ],
  },
  {
    heading: "How to Submit a Complaint",
    paragraphs: [
      "Users should send the complaint through the designated support or grievance contact. The complaint should include the user's contact information, a summary of the issue, relevant dates, the service or feature involved, and any supporting documents or screenshots."
    ],
  },
  {
    heading: "Acknowledgement and Review",
    paragraphs: [
      "The platform will acknowledge the complaint in a reasonable timeframe and review the matter using internal processes, logs, and supporting evidence. The exact acknowledgement timeline should be configured by the administrator and reflected in the public policy or support documentation."
    ],
  },
  {
    heading: "Escalation",
    paragraphs: [
      "If the issue is unresolved, the user may ask for escalation through the designated grievance channel or the appropriate legal or support contact. Escalation should include the original complaint reference and any prior responses to help maintain continuity."
    ],
  },
  {
    heading: "Complaint Categories",
    paragraphs: [
      "Common complaints may involve account access, privacy concerns, payment disputes, intellectual property issues, abusive conduct, inappropriate content, or service availability. The platform will triage each complaint based on severity, urgency, and any legal reporting obligations."
    ],
  },
  {
    heading: "Contact Configuration",
    paragraphs: [
      "The final grievance contact details, including the officer name, email, phone, and physical address, must be configured by the business administrator. If those details have not been provided, the legal section should remain marked as pending configuration and not published as a completed legal claim."
    ],
  },
];

export default function GrievanceRedressalPage() {
  return (
    <LegalPage
      title="Grievance Redressal Policy"
      version="1.0"
      effectiveDate="2026-11-01"
      lastUpdated="2026-11-01"
      description="This policy provides the process for users to raise complaints, request review, and escalate unresolved issues in a transparent and accountable manner."
      sections={sections}
    />
  );
}
