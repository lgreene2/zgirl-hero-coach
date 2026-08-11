import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Institutional Partner Pipeline & Contract Operations",
  description: "A governed Z-Girl pathway from institutional prospect and fit review through proposal, agreement, approval, license, and implementation handoff.",
};

const stages = [
  ["1", "Prospect", "Capture the organization, institutional decision context, opportunity owner, priority, source, and target timing without collecting participant case data."],
  ["2", "Discovery & fit review", "Clarify audience, implementation need, accessibility, safeguarding structure, delivery capacity, decision authority, and the appropriate pilot or licensing path."],
  ["3", "Qualified opportunity", "Document the institutional use case, estimated commercial opportunity, target decision date, decision-makers, and next actions."],
  ["4", "Proposal", "Version the pilot, annual, multi-site, expansion, or Train-the-Trainer proposal and track institutional review without treating proposal value as payment."],
  ["5", "Agreement & approvals", "An accepted proposal can enter the governed v3.1 workflow, where evidence, five human approval gates, and an executed agreement are still required."],
  ["6", "License & delivery", "Only the existing contract-to-delivery release process can activate institutional authority. Payment or proposal acceptance alone cannot start delivery."],
];

const boundaries = [
  "The partner pipeline is an institutional business-development record—not a participant reflection or case-management system.",
  "Proposal amount, estimated pipeline value, and payment status are separate concepts.",
  "An accepted proposal does not activate an institutional license.",
  "A handoff into contract operations creates or links governed records; it does not bypass Program Quality, Privacy Governance, Agreement Authority, Commercial Authority, or Executive Release.",
  "No student, youth, athlete, diagnosis, counseling, clinical, clergy, safeguarding narrative, or sports-medicine record belongs in the pipeline.",
  "Commercial product and license activity remains separate from charitable donations.",
];

export default function PartnerPipelinePage() {
  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <section className="relative isolate overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_18%,rgba(73,216,194,.18),transparent_34%),radial-gradient(circle_at_16%_74%,rgba(251,191,36,.12),transparent_30%)]" />
      <div className="hero-grid absolute inset-0 -z-10 opacity-20" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <span className="eyebrow">Institutional growth operations · v3.2</span>
        <h1 className="mt-5 max-w-5xl font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">Turn institutional interest into a governed path to contract and delivery.</h1>
        <p className="mt-7 max-w-4xl text-lg leading-8 text-slate-300">Z-Girl Institutional Partner Pipeline & Contract Operations organizes prospecting, fit review, proposals, follow-up, decision-makers, and contract handoff while preserving the agreement, privacy, credential, and release controls already built into the institutional system.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/partners#interest" className="button-primary">Request institutional fit review</Link><Link href="/institutions/agreement-workflow" className="button-secondary">Agreement workflow</Link><Link href="/institutions/license-administration" className="button-secondary">License administration</Link></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
      <p className="section-kicker">Institutional acquisition chain</p>
      <h2 className="section-title">Prospect → Fit Review → Qualified → Proposal → Agreement → Governed Release</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{stages.map(([number,title,copy]) => <article key={number} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#49d8c2] font-black text-[#04151c]">{number}</div><h3 className="mt-5 font-display text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p></article>)}</div>
    </section>

    <section className="border-y border-white/10 bg-[#04111b]"><div className="mx-auto max-w-6xl px-5 py-18 sm:px-8 lg:px-12">
      <p className="section-kicker">Operator value</p><h2 className="section-title">One place for institutional opportunity discipline.</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <article className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7"><h3 className="font-display text-2xl font-black">Decision-maker map</h3><p className="mt-3 text-sm leading-7 text-slate-400">Track champions, decision-makers, procurement, legal, finance, and implementation contacts around one opportunity without creating a public directory.</p></article>
        <article className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7"><h3 className="font-display text-2xl font-black">Follow-up discipline</h3><p className="mt-3 text-sm leading-7 text-slate-400">Surface due and overdue actions, stale opportunities, next decisions, and recent interactions so institutional momentum does not depend on memory.</p></article>
        <article className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7"><h3 className="font-display text-2xl font-black">Proposal version control</h3><p className="mt-3 text-sm leading-7 text-slate-400">Record proposal type, version, value, status, expiration, and administrative scope with an explicit accepted-proposal gate before contract handoff.</p></article>
        <article className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7"><h3 className="font-display text-2xl font-black">Governed contract handoff</h3><p className="mt-3 text-sm leading-7 text-slate-400">Move accepted opportunities into the existing agreement and approval engine rather than duplicating license, credential, or delivery authority in a sales system.</p></article>
      </div>
    </div></section>

    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-12"><p className="section-kicker">Governance boundary</p><h2 className="section-title">A sales pipeline can organize opportunity without becoming an authority engine.</h2><div className="mt-8 grid gap-3">{boundaries.map(item => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm leading-7 text-slate-300">✓ {item}</div>)}</div></section>

    <section className="border-t border-white/10 bg-[#04111b]"><div className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 lg:px-12"><p className="section-kicker">Institutional growth system</p><h2 className="section-title">Prospect → Pilot → License → Renewal → Expansion → Train-the-Trainer</h2><p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-400">v3.2 closes the front end of the institutional lifecycle. It gives Z-Girl a repeatable acquisition and contract-operations pathway that feeds directly into the governed implementation system already in production.</p><Link href="/partners#interest" className="button-primary mt-8 inline-flex">Start institutional fit review</Link></div></section>
  </main>;
}
