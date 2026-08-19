import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Command Center Guided Coach | Z-Girl",
  description: "Role-aware voice-guided orientation for Z-Girl institutional operations.",
  robots: { index: false, follow: false },
};

const modules = [
  ["1", "Institutional operating model", "Opportunity → Qualification → Agreement/Scope → Institution Setup → Onboarding → Pilot Ready → Live → Evidence → Completion → Renewal → Expansion."],
  ["2", "Command Center map", "Know when to use Executive Portfolio, Partner Pipeline, Pilot Command Center, Agreement Workflows, License Administration, Identity & Access, and governance/evidence workspaces."],
  ["3", "Working an institutional opportunity", "Understand the difference between NEW, credible prospect, qualified opportunity, and a pilot that is actually ready to be created."],
  ["4", "Creating and launching a pilot", "Confirm sponsor, use case, cohort, implementation owner, facilitator access, privacy/accessibility fit, agreement scope, milestones, and launch readiness."],
  ["5", "Evidence without surveillance", "Keep observed evidence, participant-reported outcomes, facilitator observations, administrator feedback, and system analytics distinct while private reflection stays private."],
  ["6", "Governance and safety", "Maintain least privilege, institution isolation, human approval gates, appropriate consent, evidence provenance, and commercial/nonprofit boundaries."],
  ["7", "Closeout, renewal, and expansion", "Turn implementation evidence into executive review, renewal readiness, additional cohorts, licensing opportunities, complementary GLS offerings, and future facilitator standards."],
  ["8", "Facilitator-learning signals", "Capture what operators and facilitators actually need to know so real implementation evidence can inform later training, assessment, authorization, and renewal."],
];

export default function GuidedCoachHubPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[#04111b]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <span className="eyebrow">Role-aware operator training · v3.12</span>
          <h1 className="mt-4 max-w-5xl font-display text-4xl font-black sm:text-6xl">Command Center Guided Coach</h1>
          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-400">Learn inside the live institutional operating model. Tap <strong className="text-white">🎧 Guide Me</strong> at the bottom of the screen, choose <strong className="text-white">Full orientation</strong>, and move through the modules with natural device voice, captions, replay, speed controls, and page-specific guidance.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/institutions/ops/portfolio" className="button-primary">Executive Portfolio</Link><Link href="/institutions/ops/pilots" className="button-secondary">Pilot Command Center</Link><Link href="/institutions/ops/pipeline" className="button-secondary">Partner Pipeline</Link></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-5 md:grid-cols-2">
          {modules.map(([number, title, copy]) => (
            <article key={number} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#49d8c2] font-black text-[#04151c]">{number}</div>
              <h2 className="mt-4 font-display text-2xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#04111b]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-12">
          <p className="section-kicker">Training boundary</p>
          <h2 className="section-title">Guidance helps the operator act correctly. It does not replace authority.</h2>
          <div className="mt-7 grid gap-3 text-sm leading-7 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">✓ Voice never autoplays; the operator starts it deliberately.</div>
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">✓ Authentication secrets and private participant reflections are excluded from narration.</div>
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">✓ Training completion does not grant a role, satisfy an agreement gate, issue a credential, or create a compliance finding.</div>
            <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">✓ The same Guided Coach engine can later support Institutional Admin, Facilitator, Executive, Auditor, faith-profile, athletics, school, university, and multi-site orientations.</div>
          </div>
        </div>
      </section>
    </main>
  );
}
