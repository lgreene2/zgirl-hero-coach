import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Institutional Pilot Brief",
  description:
    "A concise overview of the Z-Girl Hero Within institutional pilot for schools, youth programs, congregations, and athlete teams.",
};

const includes = [
  "Readiness review for audience, setting, staffing, accessibility, technology, safeguarding, and timeline",
  "Facilitator / coach orientation covering privacy, implementation flow, participant choice, and support boundaries",
  "A defined four-session, four-week, or 30-day reflection sequence based on the approved institutional profile",
  "Family-facing communication resources where appropriate",
  "Implementation checklist and facilitator resources",
  "Approved aggregate outcome scorecard",
  "Pilot closeout review with a stop, revise, renew, expand, or license decision",
];

const pathways = [
  ["Z-Girl EDU", "Schools and youth programs", "Privacy-first 30-day facilitated reflection experience."],
  ["Faith & Values", "Congregations and faith communities", "Governed values profiles, facilitator guidance, and family resources."],
  ["Athlete Edition", "Teams and leagues", "Four-week mindset and character pilot with coach orientation and findings."],
  ["Design Partner", "Specialized organizations", "Controlled co-design for approved accessibility, content, or implementation needs."],
];

const boundaries = [
  "No institutional dashboard of private reflections",
  "No clinical or diagnostic scoring",
  "No counseling-record collection as a standard pilot requirement",
  "No forced disclosure of a participant's private reflection",
  "Commercial licenses remain separate from charitable donations",
];

export default function PilotBriefPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white print:bg-white print:text-slate-950">
      <div className="print:hidden"><SiteHeader /></div>

      <section className="border-b border-white/10 print:border-slate-200">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:px-12 print:px-0 print:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker print:text-slate-600">Z-Girl Hero Within · Institutional Pilot</p>
              <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-6xl print:text-4xl">Reflection without surveillance.</h1>
            </div>
            <div className="rounded-2xl border border-[#76ead6]/25 bg-[#49d8c2]/10 px-4 py-3 text-sm font-black text-[#b8fff3] print:border-slate-300 print:bg-white print:text-slate-800">
              Start focused. Learn responsibly. Scale what works.
            </div>
          </div>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-300 print:text-base print:leading-7 print:text-slate-700">
            Z-Girl is a guided reflection system for schools, youth programs, faith communities, athlete teams, and other youth-serving organizations. Participants pause, name what is happening, identify strengths and support, and choose one achievable next step — a Hero Move.
          </p>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-400 print:text-slate-700">
            The institutional model is intentionally privacy-first: organizations support the reflection process without receiving access to private participant entries.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <a href="#request" className="button-primary">Request an institutional fit review</a>
            <button type="button" onClick={undefined} className="hidden" aria-hidden="true" />
            <Link href="/institutions" className="button-secondary">Institutional licensing overview</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-12 print:px-0 print:py-7">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] print:grid-cols-2 print:gap-8">
          <div>
            <p className="section-kicker print:text-slate-600">What the pilot solves</p>
            <h2 className="mt-2 font-display text-3xl font-black print:text-2xl">A practical reflection experience without creating another surveillance system.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 print:text-slate-700">
              Z-Girl gives youth-serving organizations a structured way to support reflection, confidence, character, self-awareness, decision-making, and trusted-adult connection without making private journals or individual reflection text part of routine institutional reporting.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[.035] p-6 print:border-slate-300 print:bg-white">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6] print:text-slate-600">Typical pilot includes</p>
            <ul className="mt-4 space-y-3">
              {includes.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300 print:text-slate-800">
                  <span className="font-black text-[#76ead6] print:text-slate-700">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#04111b] print:border-slate-200 print:bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-12 print:px-0 print:py-7">
          <p className="section-kicker print:text-slate-600">Institutional pathways</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            {pathways.map(([title, audience, copy]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[.025] p-5 print:border-slate-300 print:bg-white">
                <h3 className="font-display text-xl font-black">{title}</h3>
                <p className="mt-1 text-xs font-black uppercase tracking-[.14em] text-[#76ead6] print:text-slate-600">{audience}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400 print:text-slate-700">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-12 print:px-0 print:py-7">
        <div className="grid gap-8 lg:grid-cols-2 print:grid-cols-2">
          <div>
            <p className="section-kicker print:text-slate-600">Institutional value</p>
            <h2 className="mt-2 font-display text-3xl font-black print:text-2xl">A focused learning cycle before a larger commitment.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 print:text-slate-700">
              The pilot follows a repeatable pathway: <strong className="text-white print:text-slate-950">Fit review → Pilot → Aggregate learning → Decision → Annual license → Train-the-Trainer / Expansion.</strong>
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400 print:text-slate-700">
              Suggested aggregate measures include participation, completion, usefulness, confidence, return / reuse, Hero Move identification, accessibility experience, safety / respect experience, and facilitator implementation quality.
            </p>
          </div>
          <div className="rounded-3xl border border-amber-300/20 bg-amber-300/[.06] p-6 print:border-slate-300 print:bg-white">
            <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200 print:text-slate-600">Non-negotiable boundaries</p>
            <ul className="mt-4 space-y-3">
              {boundaries.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300 print:text-slate-800"><span className="font-black text-amber-200 print:text-slate-700">✓</span>{item}</li>
              ))}
            </ul>
            <p className="mt-5 font-display text-2xl font-black">The reflection belongs to the participant.</p>
          </div>
        </div>
      </section>

      <section id="request" className="border-t border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(73,216,194,.12),transparent_45%)] print:border-slate-200 print:bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 text-center sm:px-8 lg:px-12 print:px-0 print:py-7">
          <p className="section-kicker print:text-slate-600">Recommended next step</p>
          <h2 className="mt-2 font-display text-3xl font-black print:text-2xl">Request an Institutional Fit Review.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-300 print:text-slate-700">
            Confirm the organization, audience, approximate group size, implementation setting, timeline, facilitator structure, accessibility needs, safeguarding process, and desired Z-Girl pathway.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
            <a href="mailto:info@zgirlinitiative.org?subject=Z-Girl%20Institutional%20Fit%20Review" className="button-primary">Email Z-Girl</a>
            <Link href="/partners#interest" className="button-secondary">Founding partner inquiry</Link>
          </div>
          <div className="mt-5 text-sm font-bold text-slate-400 print:text-slate-800">info@zgirlinitiative.org</div>
        </div>
      </section>
    </main>
  );
}
