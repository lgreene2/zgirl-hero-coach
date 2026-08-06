import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { getMarketResource, marketResources } from "@/lib/marketResources";

export function generateStaticParams() {
  return marketResources.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resource = getMarketResource(slug);
  if (!resource) return {};
  return {
    title: resource.title,
    description: resource.subtitle,
  };
}

export default async function MarketResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getMarketResource(slug);
  if (!resource) notFound();

  const gold = resource.lane === "Faith & Values";
  const accentText = gold ? "text-amber-700" : "text-teal-700";
  const accentBorder = gold ? "border-amber-300" : "border-teal-300";
  const accentBg = gold ? "bg-amber-50" : "bg-teal-50";

  return (
    <main className="min-h-screen bg-slate-200 px-3 py-6 text-slate-900 print:bg-white print:p-0">
      <article className="mx-auto max-w-[8.5in] bg-white px-7 py-8 shadow-xl print:max-w-none print:px-8 print:py-6 print:shadow-none sm:px-10">
        <div className="mb-5 flex items-center justify-between gap-4 print:hidden">
          <Link href={resource.backHref} className="text-sm font-bold text-slate-500 transition hover:text-slate-900">← {resource.backLabel}</Link>
          <PrintButton />
        </div>

        <header className="rounded-3xl bg-[#061521] px-6 py-7 text-white print:rounded-none">
          <p className={`text-xs font-black uppercase tracking-[.2em] ${gold ? "text-amber-300" : "text-[#76ead6]"}`}>{resource.lane}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{resource.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{resource.subtitle}</p>
        </header>

        <div className={`mt-5 rounded-2xl border ${accentBorder} ${accentBg} p-4`}>
          <p className={`text-xs font-black uppercase tracking-[.16em] ${accentText}`}>{resource.status}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{resource.boundary}</p>
        </div>

        <div className="mt-8 space-y-9">
          {resource.sections.map((section) => (
            <section key={section.heading} className="break-inside-avoid-page">
              <h2 className="text-2xl font-black tracking-tight text-[#061521]">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-700">{paragraph}</p>)}
              {section.bullets && (
                <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  {section.bullets.map((bullet) => <li key={bullet} className="list-disc pl-1">{bullet}</li>)}
                </ul>
              )}
              {section.table && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#061521] text-white">
                        {section.table.headers.map((header) => <th key={header} className="border border-slate-300 px-3 py-2 font-black">{header}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, rowIndex) => (
                        <tr key={`${section.heading}-${rowIndex}`} className={rowIndex % 2 === 0 ? "bg-slate-50" : "bg-slate-100"}>
                          {row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`} className="border border-slate-300 px-3 py-2 align-top leading-5">{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.callout && <div className={`mt-4 rounded-2xl border ${accentBorder} ${accentBg} p-4 text-sm font-bold leading-6 text-slate-700`}>{section.callout}</div>}
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-slate-300 pt-4 text-center text-xs leading-5 text-slate-500">
          {resource.title} · Z-Girl: The Hero Within Reflection System · zgirlinitiative.org
        </footer>
      </article>
    </main>
  );
}
