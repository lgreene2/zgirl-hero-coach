import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Catholic Faith & Virtue Preview",
  description:
    "Preview the proposed Z-Girl Catholic Faith and Virtue reflection profile for youth, families, parishes, and Catholic schools.",
};

const flow = [
  ["Pause", "Slow the moment before reacting."],
  ["Name It", "Identify the feeling and the decision in front of you."],
  ["Connect", "Consider an approved scripture reference or Catholic virtue."],
  ["Discern", "Notice what faith, hope, charity, prudence, justice, fortitude, or temperance may invite."],
  ["Choose", "Commit to one act of truth, reconciliation, responsibility, kindness, or service."],
  ["Reflect Forward", "Close with optional prayer or quiet reflection and involve a trusted adult when needed."],
];

export default function CatholicPreviewPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_78%_18%,rgba(251,191,36,.16),transparent_31%)]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <Link href="/faith" className="text-sm font-bold text-slate-400 transition hover:text-white">← Faith &amp; Values Hub</Link>
          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">Public preview</span>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-amber-100">Not an official Catholic publication</span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-tight tracking-[-.04em] sm:text-6xl">Z-Girl Catholic Faith &amp; Virtue</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              A proposed Catholic-oriented reflection profile that connects difficult moments with virtue, prayerful reflection, service, trusted-adult support, and one practical Hero Move.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/resources/ZGirl_Catholic_Youth_Pilot_Concept_OnePager.pdf" target="_blank" rel="noreferrer" className="rounded-full bg-amber-300 px-6 py-3.5 text-center text-sm font-black text-[#201400] transition hover:bg-amber-200">Open concept one-pager</a>
              <a href="/resources/ZGirl_Catholic_Leadership_Meeting_Package.pdf" target="_blank" rel="noreferrer" className="button-secondary text-center">Review full leadership package</a>
              <Link href="/faith/start" className="button-secondary text-center">Try public sampler</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="section-kicker">Sample structure</p>
            <h2 className="section-title">Faith connection without turning Z-Girl into clergy.</h2>
            <p className="section-copy">The platform organizes reflection around institution-approved references and practices. It does not invent doctrine, interpret sacraments, or present itself as spiritual direction.</p>
          </div>
          <ol className="space-y-3">
            {flow.map(([title, copy], index) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[.035] p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-sm font-black text-amber-200">{index + 1}</span>
                <div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{copy}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
          <p className="section-kicker">Example reflection</p>
          <div className="mt-4 rounded-[2rem] border border-amber-300/20 bg-[#081d2b] p-6 sm:p-8">
            <div className="grid gap-7 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Theme · Fortitude</p>
                <h2 className="mt-3 font-display text-3xl font-black">Doing what is right when it feels difficult</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">What happened? What are you feeling? What truthful and caring response would require courage in this moment?</p>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#76ead6]">Approved connection</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">A parish or Catholic-school profile may identify an approved scripture reference, virtue explanation, prayer, or locally selected catechetical resource.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#76ead6]">Hero Move</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-200">Tell the truth calmly, ask for support, and take one responsible action that protects dignity and safety.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.17em] text-amber-200">For families</p><h2 className="mt-3 text-2xl font-black">Use independently</h2><p className="mt-3 text-sm leading-6 text-slate-400">Families may use the public faith sampler and their own preferred Catholic references without waiting for institutional adoption.</p></article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.17em] text-amber-200">For parishes</p><h2 className="mt-3 text-2xl font-black">Start with the toolkit</h2><p className="mt-3 text-sm leading-6 text-slate-400">Youth leaders can use the congregation workflow, identify approving roles, and review content before group implementation.</p></article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.17em] text-amber-200">For institutions</p><h2 className="mt-3 text-2xl font-black">Create an approved profile</h2><p className="mt-3 text-sm leading-6 text-slate-400">Schools, parishes, and multi-site organizations can submit approved terminology, references, practices, and safeguarding instructions.</p></article>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#071925] p-6 text-sm leading-7 text-slate-300">
          <strong className="text-white">Independent-resource statement:</strong> This preview has not been approved, endorsed, or published by a parish, Catholic school, diocese, bishops’ conference, or ecclesial authority. Any institutional edition requires review and authorization by the participating organization. Z-Girl is not clergy, spiritual direction, therapy, confession, counseling, or emergency support.
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/faith/congregations" className="rounded-full bg-amber-300 px-6 py-3.5 text-center text-sm font-black text-[#201400] transition hover:bg-amber-200">Use congregation toolkit</Link>
          <Link href="/faith/create-a-profile" className="button-secondary text-center">Submit a Catholic profile request</Link>
        </div>
      </section>
    </main>
  );
}
