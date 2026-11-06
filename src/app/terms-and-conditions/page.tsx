import LegalPage from "@/components/legal/LegalPage";

const sections = [
  {
    heading: "Introduction",
    paragraphs: [
      "These Terms & Conditions govern access to and use of the MakeMistakes platform and related features. They apply to students, users, administrators, and any third-party service provider that interacts with the platform. By creating an account or using the services, you agree to the terms in this document and the associated policies, including the Privacy Policy and Acceptable Use Policy.",
      "MakeMistakes is an educational platform designed to support practical learning, assignment-based project work, and AI-assisted skill development. The platform provides a workspace and learning environment, but it does not replace the obligations of the learner, the educational institution, or any external academic rules applicable to the user."
    ],
  },
  {
    heading: "Eligibility",
    paragraphs: [
      "Users must be able to enter into a valid contract under applicable law. Students and users who are minors may require valid parental or guardian consent depending on local law and institutional policy. MakeMistakes may refuse or suspend access where required by law, product safety, or the enforcement of platform policies."
    ],
  },
  {
    heading: "Account Registration",
    paragraphs: [
      "To create an account, a user must provide accurate and current information and create a valid authentication credential. Registration is subject to acceptance of the mandatory Terms & Conditions and Privacy Policy, with optional marketing consent collected separately. Users are responsible for keeping account details secure and must notify the platform promptly of any unauthorized use."
    ],
  },
  {
    heading: "User Responsibilities",
    paragraphs: [
      "Users are responsible for maintaining the confidentiality of their account, using the platform only for authorized purposes, and ensuring their content and interactions comply with applicable laws. Users must not attempt to bypass access controls, scrape restricted content, manipulate system logic, or engage in fraud or harassment."
    ],
  },
  {
    heading: "Platform Usage",
    paragraphs: [
      "The platform provides tools for learning, assignment work, product development, and educational engagement. Users are expected to respect service availability, system integrity, and the reasonable operational limits of the platform. Any abusive, unlawful, or harmful use may result in account restrictions or other corrective action."
    ],
  },
  {
    heading: "Assignment Creation and Submission",
    paragraphs: [
      "Students may create assignments, upload files, and submit work through the platform as part of a learning workflow. The platform may analyze content for technical support, quality checks, AI assistance, and completion workflows. However, the platform does not guarantee assignment approval, academic grading, or acceptance of any submission by an external institution or evaluator."
    ],
  },
  {
    heading: "Academic Integrity",
    paragraphs: [
      "Users must engage honestly with the platform and with any educational institution or assignment rules that apply to their work. Misrepresentation, plagiarism, unauthorized copying, or deceptive use of AI or third-party tools may violate academic integrity policies and the terms of this platform. Where relevant, users remain responsible for verifying outputs created by AI or by other parties."
    ],
  },
  {
    heading: "AI-Generated Content",
    paragraphs: [
      "The platform may provide AI-enabled assistance that generates recommendations, code suggestions, explanations, or structured feedback. AI outputs are assistive and may be incomplete, inaccurate, or not suitable for all contexts. Students remain responsible for reviewing AI-generated content before relying on it for academic or professional purposes."
    ],
  },
  {
    heading: "User-Generated Content",
    paragraphs: [
      "Users retain ownership of their original content and assignments, including original text, code, designs, and other material they create. MakeMistakes does not take ownership of student-created material except for the limited license necessary to operate the platform, provide learning support, and deliver the services requested by the user."
    ],
  },
  {
    heading: "Intellectual Property Rights",
    paragraphs: [
      "MakeMistakes may own its software, branding, platform design, templates, and system documentation. Student content remains student-owned unless the content was created by a teacher, institution, or third party that owns the rights. We do not claim ownership over original student assignments, and we do not assign or transfer student intellectual property to MakeMistakes by default."
    ],
  },
  {
    heading: "Subscription Plans",
    paragraphs: [
      "MakeMistakes may offer subscription plans that unlock additional features, higher usage limits, or premium access. Plan availability, pricing, and terms are subject to the platform's current subscription configuration and may change with notice where required by business decisions and applicable law."
    ],
  },
  {
    heading: "Payments",
    paragraphs: [
      "Payments are processed through authorized gateways. Users are responsible for timely payment and must ensure that billing information is accurate. MakeMistakes will not directly store raw card data unless required by a configured payment provider and disclosed appropriately."
    ],
  },
  {
    heading: "Renewals and Cancellations",
    paragraphs: [
      "Subscriptions may renew automatically unless a user cancels before the renewal term or a payment failure occurs. Cancellation and refund terms are governed by the separate Refund & Cancellation Policy and by applicable consumer protection requirements. Automatic renewals must be clearly disclosed and subject to user configuration."
    ],
  },
  {
    heading: "Refunds",
    paragraphs: [
      "Refund eligibility is configured by the business and must not be inconsistent with applicable consumer protection rights. Refund requests will be reviewed under the Refund & Cancellation Policy, with the final decision based on the platform's policy, billing status, and the law."
    ],
  },
  {
    heading: "Account Suspension",
    paragraphs: [
      "MakeMistakes may suspend or restrict access to protect the platform, prevent abuse, or comply with legal or policy obligations. This may apply to suspicious activity, account security concerns, or repeated violations of the acceptable use requirements."
    ],
  },
  {
    heading: "Platform Availability",
    paragraphs: [
      "While MakeMistakes strives to provide reliable access, platform availability may be affected by maintenance, outages, vendor issues, or force majeure events. The service is provided 'as is' to the extent permitted by law, and the platform does not guarantee uninterrupted operation or specific performance outcomes."
    ],
  },
  {
    heading: "Third-Party Integrations",
    paragraphs: [
      "The platform may integrate with third-party services for storage, authentication, AI processing, email delivery, payment processing, or analytics. These services are governed by their own terms and privacy practices, and users should review those notices where relevant."
    ],
  },
  {
    heading: "Limitation of Liability",
    paragraphs: [
      "MakeMistakes is not liable for indirect, incidental, or consequential damages arising from use of the platform, except to the extent required by applicable law. This limitation does not remove consumer rights that cannot be lawfully excluded."
    ],
  },
  {
    heading: "Indemnification",
    paragraphs: [
      "Where legally appropriate, users agree to indemnify and hold harmless MakeMistakes from claims arising from unlawful, fraudulent, or abusive activity, or from breach of these terms. The exact scope should remain aligned with legal requirements and business risk."
    ],
  },
  {
    heading: "Termination",
    paragraphs: [
      "MakeMistakes may suspend or terminate service where required to enforce the law, protect the platform, or respond to serious policy violations. Users may close their accounts subject to the Data Retention and Deletion Policy and any applicable billing consequences."
    ],
  },
  {
    heading: "Dispute Resolution",
    paragraphs: [
      "Users who have concerns about the platform should first reach out to the support or grievance contact. Where appropriate, unresolved disputes may be escalated through internal review, external mediation, or legal channels under applicable law."
    ],
  },
  {
    heading: "Governing Law",
    paragraphs: [
      "These Terms are governed by the laws applicable in the jurisdiction where MakeMistakes operates, with particular regard to Indian law, the Information Technology Act, and consumer protection obligations. The actual governing law should be confirmed by the business owner or administrator before publication as final policy."
    ],
  },
  {
    heading: "Contact Information",
    paragraphs: [
      "For questions related to these Terms & Conditions, contact the configured legal or support contact for MakeMistakes. The final contact details must be entered in the administration configuration and should not be invented or assumed."
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      version="1.0"
      effectiveDate="2026-11-01"
      lastUpdated="2026-11-01"
      description="These terms explain the operational relationship between MakeMistakes and its users. They protect student rights, define platform responsibilities, and clarify the limited rights needed to deliver the service."
      sections={sections}
    />
  );
}
