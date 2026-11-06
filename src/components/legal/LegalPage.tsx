import Link from "next/link";
import { companyLegalInfo } from "@/lib/legalConfig";

type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type LegalPageProps = {
  title: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  description: string;
  sections: LegalSection[];
  contactTitle?: string;
};

const documentLinkMap = {
  "Privacy Policy": "/privacy-policy",
  "Terms & Conditions": "/terms-and-conditions",
  "Refund & Cancellation Policy": "/refund-policy",
  "Cookie Policy": "/cookie-policy",
  "Acceptable Use Policy": "/acceptable-use-policy",
  "Intellectual Property Policy": "/intellectual-property-policy",
  "AI Usage Policy": "/ai-usage-policy",
  "Grievance Redressal Policy": "/grievance-redressal",
  "Data Retention and Deletion Policy": "/data-deletion-policy",
};

export default function LegalPage({
  title,
  version,
  effectiveDate,
  lastUpdated,
  description,
  sections,
  contactTitle = "Contact",
}: LegalPageProps) {
  return (
    <main className="bg-[#FAF9F5] text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-teal-700">Legal Center</p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">{title}</h1>
          </div>
          <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-600 shadow-sm">
            v{version} • Effective {effectiveDate}
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm leading-7 text-zinc-700">{description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
            <span>Effective date: {effectiveDate}</span>
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">Table of contents</h2>
              <nav className="mt-4 space-y-2 text-sm text-zinc-600">
                {sections.map((section, index) => (
                  <a
                    key={`${section.heading}-${index}`}
                    href={`#section-${index + 1}`}
                    className="block rounded-md px-2 py-1.5 transition hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    {index + 1}. {section.heading}
                  </a>
                ))}
              </nav>
              <div className="mt-6 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
                <p className="font-medium text-zinc-900">Legal Documents</p>
                <div className="mt-3 space-y-2">
                  {Object.entries(documentLinkMap).map(([label, href]) => (
                    <Link key={href} href={href} className="block hover:text-teal-700">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <article className="space-y-8">
            {sections.map((section, index) => (
              <section key={`${section.heading}-${index}`} id={`section-${index + 1}`} className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-zinc-900">{index + 1}. {section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-zinc-700">
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${section.heading}-${paragraphIndex}`}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-zinc-900">{contactTitle}</h2>
              <div className="mt-4 space-y-3 text-base leading-7 text-zinc-700">
                <p>
                  {companyLegalInfo.companyName} is committed to handling inquiries transparently. If you have questions about this policy, please contact the administrative team through the configured legal contact details, or use the grievance contact details listed in the administrator dashboard.
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Grievance officer: {companyLegalInfo.grievanceOfficerName}</li>
                  <li>Email: {companyLegalInfo.grievanceEmail}</li>
                  <li>Contact: {companyLegalInfo.grievanceContact}</li>
                  <li>Address: {companyLegalInfo.grievanceAddress}</li>
                </ul>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
