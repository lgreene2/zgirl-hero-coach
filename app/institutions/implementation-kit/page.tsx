import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Institutional Implementation Kit",
  description:
    "Explore the Z-Girl institutional onboarding and implementation system for readiness, facilitation, family communication, aggregate learning, closeout, and renewal.",
};

const stages = [
  {
    number: "1",
    title: "Readiness",
    copy: "Confirm purpose, ownership, safeguarding, accessibility, technology, communications, data boundaries, schedule, and contract conditions before launch.",
    asset: "Institutional Readiness Assessment",
  },
  {
    number: "2",
    title: "Implementation planning",
    copy: "Turn the approved scope into one controlled calendar with orientation, communications, sessions, measurement windows, closeout, and decision milestones.",
    asset: "Implementation Calendar",
  },
  {
    number: "3",
    title: "Facilitator orientation",
    copy: "Prepare educators, coaches, youth workers, ministry leaders, and program staff to preserve participant choice, privacy, role boundaries, and implementation quality.",
    asset: "Facilitator Orientation Guide",
  },
  {
    number: "4",
    title: "Family communication",
    copy: "Provide clear, adaptable family or guardian communication about purpose, participation choice, privacy, support routes, accessibility, and local contacts.",
    asset: "Family / Guardian Notice Template",
  },
  {
    number: "5",
    title: "Aggregate learning",
    copy: "Measure delivery, usefulness, accessibility, respect, participation, practical next-step identification, and facilitator quality without collecting private reflection text.",
    asset: "Aggregate Pilot Scorecard",
  },
  {
    number: "6",
    title: "Closeout",
    copy: "Convert implementation evidence into a concise executive report covering what worked, what limited the pilot, what should change, and what decision is recommended.",
    asset: "Pilot Closeout Report",
  },
  {
    number: "7",
    title: "Renewal & expansion",
    copy: "Choose a deliberate next step: stop, revise, repeat, renew, license, expand, or begin Train-the-Trainer readiness.",
    asset: "Renewal & Expansion Decision Package",
  },
];

const guardrails = [
  "Private participant reflection text is not routine institutional reporting data.",
  "Institutions do not receive a youth, student, or athlete private-reflection dashboard.",
  "Participants retain pause, skip, stop, and trusted-person pathways.",
  "Z-Girl is not therapy, diagnosis, medical care, crisis intervention, clergy, spiritual direction, or sports medicine.",
  "Only approved aggregate implementation and experience measures are used for routine pilot learning.",
  "Institutions remain responsible for their own safeguarding, emergency, consent/permission, records, accessibility, technology, and legal obligations.",
  "Commercial product and license payments remain separate from charitable donations.",
];

const productLayers = [
  ["Institutional Pilot", "The complete implementation kit supports a controlled first cycle from readiness through closeout."],
  ["Annual License", "The same operating system becomes the repeatable onboarding and quality framework for continuing use."],
  ["Multi-site Expansion", "Readiness, calendar, orientation, scorecard, and closeout tools can be reused across approved sites, cohorts, teams, or programs."],
  ["Train-the-Trainer", "Successful implementation evidence becomes a prerequisite for a future facilitator authorization and quality-assurance layer."],
];

export default function InstitutionalImplementationKitPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_10%,rgba(73,216,194,.17),transparent_34%),radial-gradient(circle_at_12%_78%,rgba(251,191,36,.11),transparent_30%)]" />
        <div className="hero-grid absolute inset-0 -z-10 opacity-20" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">Institutional onboarding & implementation</span>
              <span className="rounded-full border border-[#76ead6]/25 bg-[#49d8c2]/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-[#b8fff3]">
                Pilot → License → Scale
              </span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              One implementation system from readiness to renewal.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              The Z-Girl Institutional Implementation Kit gives schools, youth programs, congregations, athlete teams, and approved partners a repeatable operating system for launching, running, evaluating, and responsibly scaling a Z-Girl implementation.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/institutions/pilot-brief" className="button-primary text-center">View pilot brief</Link>
              <Link href="/institutions" className="button-secondary text-center">Institutional licensing overview</Link>
              <Link href="/partners#interest" className="button-secondary text-center">Request a fit review</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">Seven controlled stages</p>
          <h2 className="section-title">A reusable institutional operating system.</h2>
          <p className="section-copy">
            Each stage produces a decision-useful asset. Together they reduce one-off consulting, protect implementation quality, and create a consistent pathway from first pilot to recurring license.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stages.map((stage) => (
            <article key={stage.number} className="flex min-h-[18rem] flex-col rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#49d8c2] text-sm font-black text-[#04151c]">{stage.number}</span>
              <h3 className="mt-5 font-display text-2xl font-black">{stage.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">{stage.copy}</p>
              <div className="mt-5 border-t border-white/10 pt-4 text-xs font-black uppercase tracking-[.14em] text-[#76ead6]">{stage.asset}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#04111b]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12">
          <div>
            <p className="section-kicker">Governance built into delivery</p>
            <h2 className="section-title">The kit scales implementation—not surveillance.</h2>
            <p className="section-copy">
              Institutional growth should create stronger facilitation, clearer ownership, better access, and more consistent implementation—not broader access to a participant&apos;s private reflection.
            </p>
          </div>
          <div className="space-y-3">
            {guardrails.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-[#071925] p-4 text-sm font-bold leading-6 text-slate-200">
                <span className="mr-2 text-[#76ead6]">✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">Build once. Reuse by tier.</p>
          <h2 className="section-title">The same core kit supports the product ladder.</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productLayers.map(([title, copy]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/[.035] p-6">
              <h3 className="font-display text-2xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(73,216,194,.12),transparent_45%)]">
        <div className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 lg:px-12">
          <p className="section-kicker">Institutional next step</p>
          <h2 className="mt-2 font-display text-4xl font-black">Start with fit. Earn the right to scale.</h2>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-300">
            The implementation kit is designed to accompany approved institutional pilots and licenses. Begin with a fit review to confirm audience, implementation setting, group size, facilitator structure, accessibility needs, safeguarding process, timeline, and the right Z-Girl pathway.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/partners#interest" className="button-primary">Request institutional fit review</Link>
            <Link href="/institutions/pilot-brief" className="button-secondary">Review the pilot brief</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
