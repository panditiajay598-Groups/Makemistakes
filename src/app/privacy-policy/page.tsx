import LegalPage from "@/components/legal/LegalPage";

const sections = [
  {
    heading: "Introduction",
    paragraphs: [
      "MakeMistakes is a student-focused EdTech platform that helps learners create projects, manage assignments, and access AI-assisted learning workflows. This Privacy Policy explains which personal data is collected, why it is processed, the limited conditions under which it may be shared, and the choices students have regarding their privacy settings.",
      "This policy covers information about our users, prospective users, students, mentors, and administrators, including data submitted through account registration, assignment workflows, payments, support requests, and platform analytics. The policy should be read together with the Terms & Conditions and the applicable consent notices displayed during sign-up and at the point of subscription.",
      "This document distinguishes between personal information actually collected by MakeMistakes and future data categories that may be added only with clear notice, consent, and technical review. Any future processing beyond the current scope will be updated in a policy revision and, where required, subject to renewed or enhanced consent."
    ],
  },
  {
    heading: "Information We Collect",
    paragraphs: [
      "We may collect account details such as name, email address, contact information, profile settings, and authentication data required to access the platform. We also collect assignment-related content when a user creates, uploads, edits, or submits educational material, as well as metadata about project activity, file names, submission timestamps, and account roles.",
      "Technical information may include device type, operating system, browser version, IP address, session identifiers, error logs, telemetry data, referral sources, and interaction events seen through the product. Payment information is handled by authorized payment gateways and is not stored directly by MakeMistakes as card data unless explicitly supported by a secure payment integration.",
      "The categories below are mapped to actual platform functionality. Information we do not currently collect, or which is only collected when a feature is activated, is clearly marked as prospective or future data collection and must not be treated as an existing commitment."
    ],
  },
  {
    heading: "Account Information",
    paragraphs: [
      "When a user registers, we collect the information needed to create and secure an account, including email address, password or delegated identity verification, selected role, and profile details such as display name. This data supports authentication, account recovery, access control, and user communications. Passwords are not stored in plain text and should be hashed using a secure password hashing mechanism approved by the engineering team."
    ],
  },
  {
    heading: "Assignment Information",
    paragraphs: [
      "Students may upload, generate, edit, or share assignment content as part of project work. This may include problem descriptions, project text, build artifacts, code repositories, notes, images, and files processed by educational tools. Student content remains the property of the student who created it, subject to the limited rights required to host, process, and provide services.",
      "MakeMistakes may process assignment data to render the workspace, verify completion workflows, support project building, provide AI-assisted coaching, detect service issues, and deliver support. We do not claim ownership over original student work, and the platform only uses content to operate the service and to provide the features requested by the student."
    ],
  },
  {
    heading: "Technical and Device Information",
    paragraphs: [
      "We may collect device and usage information such as browser information, language preferences, screen resolution, session information, feature usage metrics, logs, crash reports, attempted access patterns, performance diagnostics, and geolocation-derived region information only when necessary for security, compliance, or product reliability. This information helps detect abuse, improve service quality, and maintain secure access controls."
    ],
  },
  {
    heading: "Payment Information",
    paragraphs: [
      "If a user purchases a subscription, we may process order metadata, billing status, plan selection, payment confirmation, transaction references, and renewal information through a third-party payment provider. Card numbers, UPI credentials, or direct payment details are not stored in the application database unless the payment processor explicitly requires secure handling outside our direct systems."
    ],
  },
  {
    heading: "Cookies and Tracking",
    paragraphs: [
      "The application uses strictly necessary cookies for user session integrity, form validation, access control, and technical stability. Optional functional, analytics, and marketing cookies are only activated when the user has consented to the relevant preference category. We do not enable non-essential tracking before valid consent and we provide a later preference management mechanism to update or withdraw consent.",
      "The current consent categories used by the platform are: strictly necessary, functional, analytics, and marketing. Only categories actually implemented in the product may be used. If a new technology or vendor is introduced, it will be added to the cookie policy and consent notice with a versioned update."
    ],
  },
  {
    heading: "How We Use Personal Information",
    paragraphs: [
      "We use personal information to create and maintain accounts, run authentication and authorization flows, provide learning features, process subscriptions and payments, support bug resolution, provide customer support, comply with legal obligations, and improve the product experience. Assignment content may also be processed to enable AI-powered educational features, project rendering, completion checks, and related learning support."
    ],
  },
  {
    heading: "Third-Party Service Providers",
    paragraphs: [
      "MakeMistakes may use third-party providers for authentication, email delivery, AI processing, file storage, payment processing, analytics, monitoring, and error tracking. Service providers may receive the minimum necessary information required to provide their services, such as email addresses, usage data, payment references, and technical metadata. The exact provider list and data processing boundaries should be maintained in the administrator configuration and disclosed in the AI Usage Policy and product documentation."
    ],
  },
  {
    heading: "AI Processing and Data Sharing",
    paragraphs: [
      "If AI features are enabled, we may transmit user prompts, assignment content, or related inputs to a third-party AI provider to generate feedback, recommendations, or code assistance. The platform must disclose which AI providers are used, what data is sent, whether uploaded assignments are processed, and whether data is used for training. We do not state that assignment data is never used for training unless the technical configuration and provider agreements confirm that position."
    ],
  },
  {
    heading: "Data Storage and Security",
    paragraphs: [
      "We store personal data in systems designed to meet a reasonable standard of security for an EdTech SaaS product. This includes access controls, secure authentication, careful platform monitoring, and secure storage of operational data. However, no digital system can guarantee absolute security, and the platform should not claim that data is immune from all risk. We maintain administrative safeguards, encryption where technically implemented, and controlled access to minimize avoidable exposures."
    ],
  },
  {
    heading: "Data Retention",
    paragraphs: [
      "Data is retained only for as long as necessary to provide the service, comply with legal obligations, resolve disputes, enforce our policies, and maintain product security. Different categories may have different retention windows depending on subscription status, legal requirements, billing records, support history, and assignment auditing. We maintain deletion and retention controls to align with both operational needs and the law."
    ],
  },
  {
    heading: "Account Deletion",
    paragraphs: [
      "Users may request account deletion through the account settings or support channels. Deletion requests are reviewed and processed in accordance with the Data Retention and Deletion Policy. We do not simply remove the user record while leaving personal information in uploaded files, storage systems, or connected services. Instead, we identify and delete or anonymize account data where appropriate, while preserving legally required records or logs."
    ],
  },
  {
    heading: "User Rights",
    paragraphs: [
      "Users may have rights to access, correct, update, or delete their personal data, to withdraw optional consent where legally available, and to object to certain processing activities when applicable. Requests should be directed to the contact email or grievance channel specified in this policy. Where a request is refused or limited, we will explain the reason and provide the legal basis for the decision where appropriate."
    ],
  },
  {
    heading: "Consent Management",
    paragraphs: [
      "Consent is managed in a versioned and auditable manner. Terms & Conditions acceptance and Privacy Notice acknowledgement are distinct from marketing communication consent; they are not combined into a single mandatory checkbox. Optional analytics and marketing consents are separate choices and can be withdrawn by the user at any time, subject to the platform's product and legal requirements."
    ],
  },
  {
    heading: "Children's Personal Data",
    paragraphs: [
      "The platform is intended for students and learners, and parents or guardians may be involved in consent or support processes. Where children are involved, the platform must apply lawful consent and parental guardian requirements where applicable. The service should not treat an account as if it has all parental or legal consent automatically."
    ],
  },
  {
    heading: "Policy Changes",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in legal requirements, product features, provider arrangements, or operational practices. Material changes will be highlighted and users will be prompted to review the updated policy where required by consent and version tracking. Previous versions are retained for audit purposes and historical recordkeeping."
    ],
  },
  {
    heading: "Grievance Redressal",
    paragraphs: [
      "If a user has concerns about privacy practices, data handling, or consent, they may submit a complaint through the grievance contact mechanism described in the platform or under the Grievance Redressal Policy. We will acknowledge the complaint, review the concern, and respond with a clear outcome and escalation path if the issue remains unresolved."
    ],
  },
  {
    heading: "Contact Information",
    paragraphs: [
      "For questions or requests relating to personal data, deletion, consent, or subscriptions, contact the MakeMistakes administrator or legal compliance contact. The exact address and contact information should be entered in the admin configuration file and not assumed or invented."
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      version="1.0"
      effectiveDate="2026-11-01"
      lastUpdated="2026-11-01"
      description="This Privacy Policy explains how MakeMistakes handles student and user information in a privacy-conscious and compliance-aware manner. It distinguishes between current practices, future functionality, and settings that are expressly configurable by the business administrator."
      sections={sections}
    />
  );
}
