import LegalPage from "@/components/legal/LegalPage";

const sections = [
  {
    heading: "Purpose",
    paragraphs: [
      "This Acceptable Use Policy defines the standards for lawful, safe, and respectful use of the MakeMistakes platform. It supports the platform's educational mission by protecting account security, user data, assignment integrity, and the experience of other students."
    ],
  },
  {
    heading: "Prohibited Activities",
    paragraphs: [
      "Users must not access the platform without authorization, manipulate accounts, exploit platform vulnerabilities, upload malware, engage in harassment, impersonate others, commit fraud, or attempt to access the assignments or data of other users without permission. Reverse engineering is prohibited where legally restricted, and unauthorized data collection is not allowed."
    ],
  },
  {
    heading: "Platform Integrity",
    paragraphs: [
      "Users must not interfere with system integrity or user experience. This includes attempts to overload infrastructure, bypass controls, abuse rate limits, or modify platform code or workflows in ways that create security or operational risk."
    ],
  },
  {
    heading: "Academic and Content Rules",
    paragraphs: [
      "Users must not use the platform to distribute illegal content, infringe copyright, or submit assignments that violate academic integrity rules. Students should maintain appropriate records of original work and should verify AI-generated outputs before relying on them."
    ],
  },
  {
    heading: "Reporting and Enforcement",
    paragraphs: [
      "MakeMistakes may investigate reports of policy violations and may suspend, restrict, or terminate access to the platform where warranted. Reports can be submitted through the grievance or support process and should include enough context to investigate the incident responsibly."
    ],
  },
  {
    heading: "Consequences",
    paragraphs: [
      "Violations may result in warnings, temporary restriction, removal of offending content, changes to access rights, or account closure depending on the severity and the legal requirements applicable to the case. The platform retains discretion to enforce this policy in a transparent and proportionate manner."
    ],
  },
];

export default function AcceptableUsePolicyPage() {
  return (
    <LegalPage
      title="Acceptable Use Policy"
      version="1.0"
      effectiveDate="2026-11-01"
      lastUpdated="2026-11-01"
      description="This policy sets out the boundaries for safe and legal use of MakeMistakes, protecting students, staff, data, and the integrity of the learning environment."
      sections={sections}
    />
  );
}
