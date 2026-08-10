import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Train-the-Trainer & Facilitator Authorization",
  description:
    "Explore the governed Z-Girl facilitator authorization and institutional Train-the-Trainer pathway for quality, privacy, renewal, and responsible scale.",
};

const levels = [
  {
    label: "Level 0",
    title: "Orientation Complete",
    status: "Not independently authorized",
    copy: "Learn the Z-Girl purpose, boundaries, participant-choice model, privacy expectations, and implementation basics before supervised practice.",
  },
  {
    label: "Level 1",
    title: "Authorized Facilitator",
    status: "Program authorization",
    copy: "Complete the core curriculum, pass the knowledge assessment and observed practicum, acknowledge conduct standards, and receive a time-limited credential within an approved scope.",
  },
  {
    label: "Level 2",
    title: "Authorized Lead Facilitator",
    status: "Implementation leadership",
    copy: "Build on successful implementation evidence to lead quality, support supervised practice, and coach staff without independently granting Z-Girl credentials.",
  },
  {
    label: "Level 3",
    title: "Institutional Trainer Authorization",
    status: "Licensed Train-the-Trainer",
    copy: "Complete additional trainer preparation, teach-back, scoring calibration, and credential-administration requirements within an active institutional trainer license.",
  },
];

const evidence = [
  "Eight-module facilitator curriculum with privacy, safeguarding, accessibility, profile fidelity, implementation, and conduct standards",
  "25-item knowledge assessment with an overall passing standard plus 100% accuracy on critical privacy/safety items",
  "16-domain practicum rubric with critical-fail rules and observed challenge scenarios",
  "Documented authorization decision, credential ID, tier, scope, issue date, and expiration date",
  "12-month renewal cycle with version updates, refresher requirements, lapse/reactivation rules, and observation where required",
  "Remediation, conditions, suspension, revocation, and appeal architecture",
  "Credential registry and version control without storing participant private reflection text as routine credential evidence",
];

const guardrails = [
  "Z-Girl authorization is a program credential—not professional licensure, academic accreditation, government certification, or clinical qualification.",
  "Training completion alone does not create authorization.",
  "Private participant reflections do not become facilitator-training, assessment, or credential-reporting data.",
  "Institutions retain local safeguarding, emergency, consent/permission, records, accessibility, employment, and legal responsibilities.",
  "Authorized Facilitators do not automatically receive the right to train or credential others.",
  "Institutional Trainer rights require both active trainer authorization and an applicable institutional trainer license.",
  "Commercial training, authorization, renewal, and trainer-license payments remain separate from charitable donations.",
];

const lifecycle = [
  ["1", "Qualify", "Confirm role, institutional fit, implementation scope, and candidate eligibility."],
  ["2", "Train", "Complete the approved facilitator curriculum and local safeguarding/emergency orientation."],
  ["3", "Assess", "Pass the knowledge assessment and observed practicum, including critical-boundary standards."],
  ["4", "Authorize", "Issue a defined program credential with tier, scope, version, status, and expiration."],
  ["5", "Practice & improve", "Use implementation evidence, observation, coaching, and remediation to protect delivery quality."],
  ["6", "Renew or advance", "Reauthorize annually, advance to lead facilitator, or enter the controlled institutional trainer pathway."],
];

export default function TrainTheTrainerPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_12%,rgba(251,191,36,.14),transparent_30%),radial-gradient(circle_at_12%_76%,rgba(73,216,194,.17),transparent_34%)]" />
        <div className="hero-grid absolute inset-0 -z-10 opacity-20" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">Facilitator authorization & Train-the-Trainer</span>
              <span className="rounded-full border border-[#76ead6]/25 bg-[#49d8c2]/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-[#b8fff3]">Train → Assess → Authorize → Renew</span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              Scale the people who deliver Z-Girl—without lowering the standard.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              The Z-Girl authorization system prepares facilitators, verifies applied competence, governs role and privacy boundaries, and creates a controlled pathway for approved institutions to develop internal trainers.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/partners#interest" className="button-primary text-center">Request Train-the-Trainer fit review</Link>
              <Link href="/institutions/implementation-kit" className="button-secondary text-center">Implementation kit</Link>
              <Link href="/institutions" className="button-secondary text-center">Institutional licensing</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">Authorization ladder</p>
          <h2 className="section-title">Orientation is not authorization. Authorization is not licensure.</h2>
          <p className="section-copy">Each level carries a defined scope and evidence requirement. Training rights are deliberately separated from facilitation rights.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {levels.map((level) => (
            <article key={level.label} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#49d8c2] px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-[#04151c]">{level.label}</span>
                <span className="text-xs font-black uppercase tracking-[.14em] text-[#76ead6]">{level.status}</span>
              </div>
              <h3 className="mt-5 font-display text-3xl font-black">{level.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{level.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#04111b]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="section-kicker">Evidence before title</p>
            <h2 className="section-title">A credential built on demonstrated competence.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {evidence.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[.025] p-5 text-sm font-bold leading-7 text-slate-200">
                <span className="mr-2 text-[#76ead6]">✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">Credential lifecycle</p>
          <h2 className="section-title">A repeatable system from candidate to renewal.</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lifecycle.map(([number, title, copy]) => (
            <article key={number} className="rounded-3xl border border-white/10 bg-white/[.035] p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#49d8c2] text-sm font-black text-[#04151c]">{number}</span>
              <h3 className="mt-5 font-display text-2xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12">
          <div>
            <p className="section-kicker">Governance boundary</p>
            <h2 className="section-title">The credential expands delivery—not access to private reflections.</h2>
            <p className="section-copy">Facilitator quality evidence evaluates the facilitator. It does not turn participant reflection content into credential evidence.</p>
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

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-[#76ead6]/20 bg-[#49d8c2]/[.06] p-8 lg:p-10">
          <p className="section-kicker">Institutional expansion path</p>
          <h2 className="mt-2 font-display text-4xl font-black">Pilot → License → Authorized Facilitators → Institutional Trainer.</h2>
          <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-300">
            Train-the-Trainer is designed for organizations that have demonstrated implementation fit and are ready to internalize delivery while preserving Z-Girl standards, version control, assessment integrity, and credential governance.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/partners#interest" className="button-primary">Request institutional fit review</Link>
            <Link href="/institutions/pilot-brief" className="button-secondary">Review pilot pathway</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
