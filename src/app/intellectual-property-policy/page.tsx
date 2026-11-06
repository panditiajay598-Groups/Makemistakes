import LegalPage from "@/components/legal/LegalPage";

const sections = [
  {
    heading: "Platform Intellectual Property",
    paragraphs: [
      "MakeMistakes retains ownership of the platform itself, including the software, user interface design, product branding, documentation, templates, and other proprietary materials created for the service. These rights are protected by applicable law and remain separate from the rights of users in their own assignments and content."
    ],
  },
  {
    heading: "Student Ownership of Original Work",
    paragraphs: [
      "Students retain ownership of original assignments, projects, and material that they create or upload. MakeMistakes does not claim ownership over student-generated content simply because it exists on the platform. The platform may require limited permissions to host, process, and support the content as necessary to operate the service."
    ],
  },
  {
    heading: "Third-Party and Teacher Content",
    paragraphs: [
      "Where a teacher, institution, or third party creates or supplies content, that content may remain owned by the creator or institution unless otherwise agreed. MakeMistakes only hosts or processes that content for the limited purpose for which it is licensed or shared."
    ],
  },
  {
    heading: "Limited License to Host and Process Content",
    paragraphs: [
      "By using the platform, a user grants the limited rights needed for MakeMistakes to host, store, display, process, and support the requested service functions. This does not transfer ownership of the work and is limited to the administrative and technical needs of operating the platform."
    ],
  },
  {
    heading: "Copyright Infringement Reporting",
    paragraphs: [
      "If a user believes that content on the platform infringes their intellectual property rights, they may report the issue through the designated grievance or support channel. The report should include the relevant rights information and a description of the alleged infringement so the platform can review and act appropriately."
    ],
  },
  {
    heading: "Content Removal Procedures",
    paragraphs: [
      "MakeMistakes may review and remove or restrict content when required to address a valid copyright report, policy violation, or legal notice. The platform will take reasonable steps to assess the claim and preserve the rights of all involved parties while maintaining a fair process."
    ],
  },
  {
    heading: "Restrictions on Copying the Platform",
    paragraphs: [
      "Users must not copy, reproduce, reverse engineer, or repurpose the platform software, branding, or proprietary elements without permission, except as clearly permitted by law or a written license. This includes unauthorized scraping, code extraction, or imitation of the platform's user experiences and assets."
    ],
  },
];

export default function IntellectualPropertyPolicyPage() {
  return (
    <LegalPage
      title="Intellectual Property Policy"
      version="1.0"
      effectiveDate="2026-11-01"
      lastUpdated="2026-11-01"
      description="This policy explains what MakeMistakes owns, what students own, and how limited rights are granted for hosting, processing, and operating assignment and learning features."
      sections={sections}
    />
  );
}
