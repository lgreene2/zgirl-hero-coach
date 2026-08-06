import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Congregation Toolkit",
  description:
    "A self-service Z-Girl Faith and Values implementation toolkit for youth leaders, congregations, ministries, and faith-based programs.",
};

const steps = [
  ["Choose", "Select the public Faith & Values or Christian starter profile, or request a custom profile."],
  ["Review", "Confirm age range, terminology, optional practices, content source, and youth-safety boundaries."],
  ["Prepare", "Share the parent information sheet and orient facilitators to privacy, accessibility, and trusted-adult guidance."],
  ["Facilitate", "Run four short sessions using the same Hero Within method and locally approved materials."],
  ["Learn", "Collect participation feedback without collecting or scoring private reflection content."],
];

const toolkitItems = [
  "Four-session facilitator guide",
  "Parent and caregiver information sheet",
  "Participant reflection worksheets",
  "Group implementation checklist",
  "QR-code access card template",
  "Accessible participation guide",
  "Safety and trusted-adult guidance",
  "Optional feedback and completion form",
];

export default function CongregationsPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_82%_15%,rgba(251,191,36,.15),transparent_31%)]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <Link href="/faith" className="text-sm font-bold text-slate-400 transition hover:text-white">← Faith &amp; Values Hub</Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2"><span className="eyebrow">Self-service group product</span><span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-amber-100">No leadership meeting required</span></div>
              <h1 className="mt-5 font-display text-5xl font-black leading-tight tracking-[-.04em] sm:text-6xl">Z-Girl Congregation Starter Toolkit</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">A lean, group-ready package for youth instructors, churches, ministries, and faith-based programs that want to begin with approved content and clear boundaries.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/resources/ZGirl_Congregation_Starter_Toolkit.pdf" download className="rounded-full bg-amber-300 px-6 py-3.5 text-center text-sm font-black text-[#201400] transition hover:bg-amber-200">Download toolkit PDF</a>
                <Link href="/faith/create-a-profile" className="button-secondary text-center">Create a faith profile</Link>
              </div>
            </div>
            <aside className="rounded-[2rem] border border-amber-300/20 bg-[#0a2030]/90 p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Starter license concept</p>
              <p className="mt-3 font-display text-4xl font-black">$750–$1,500</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Founding annual range for one congregation, up to five facilitators, a four-session library, family resources, and basic implementation support.</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm leading-6 text-slate-300">The public sampler and downloadable toolkit can be used before purchasing an organizational license. Pricing becomes final when checkout and access terms are activated.</div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <div><p className="section-kicker">Included resources</p><h2 className="section-title">Enough to run a responsible four-session experience.</h2><p className="section-copy">The toolkit intentionally avoids a complicated dashboard. Early groups receive practical files and a straightforward implementation sequence.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {toolkitItems.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm font-bold leading-6 text-slate-200"><span className="mr-2 text-[#76ead6]">✓</span>{item}</div>)}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
          <p className="section-kicker">Implementation path</p>
          <ol className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {steps.map(([title, copy], index) => <li key={title} className="rounded-3xl border border-white/10 bg-[#071925] p-5"><span className="font-display text-3xl font-black text-amber-200">{String(index + 1).padStart(2, "0")}</span><h2 className="mt-3 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Accessible participation</p><h2 className="mt-3 text-2xl font-black">Support different ways of engaging.</h2><p className="mt-3 text-sm leading-7 text-slate-400">Use one prompt at a time, shorter language, visual choices, extra processing time, audio off by default, optional breaks, and responses through speech, typing, drawing, pointing, AAC, or supported communication.</p></article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Safeguarding boundary</p><h2 className="mt-3 text-2xl font-black">Reflection without forced disclosure.</h2><p className="mt-3 text-sm leading-7 text-slate-400">Facilitators should never require youth to reveal private experiences, evaluate emotions, or share written reflections. Follow local safeguarding procedures and involve approved adults when a safety concern arises.</p></article>
        </div>

        <div className="mt-10 rounded-[2rem] border border-amber-300/20 bg-gradient-to-br from-[#173044] to-[#0b2130] p-7 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl"><h2 className="font-display text-3xl font-black">Use an existing profile or bring approved content.</h2><p className="mt-3 leading-7 text-slate-300">The first custom profiles are created manually from a structured intake. Automation comes after actual congregation demand is proven.</p></div>
          <Link href="/faith/create-a-profile" className="mt-6 shrink-0 rounded-full bg-amber-300 px-6 py-3.5 text-center text-sm font-black text-[#201400] transition hover:bg-amber-200 lg:mt-0">Begin profile intake →</Link>
        </div>
      </section>
    </main>
  );
}
