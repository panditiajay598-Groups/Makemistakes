import Link from "next/link";
import { legalDocuments } from "@/lib/legalConfig";

export default function LegalCenterPage() {
  return (
    <main className="bg-[#FAF9F5] text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-teal-700">Legal Center</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Privacy, policies and compliance</h1>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-base leading-7 text-zinc-700">
            MakeMistakes maintains a dedicated legal center to make student rights, platform rules, and operational compliance information easy to access. These documents are designed to reflect the current product configuration and to flag any legal details that still require administrator confirmation.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {legalDocuments.map((document) => (
            <Link
              key={document.slug}
              href={document.route}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-zinc-900">{document.title}</h2>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-600">
                  v{document.version}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Effective {document.effectiveDate}. Last updated {document.lastUpdated}.
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
