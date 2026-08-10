import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Institutional Agreement, Renewal & Expansion | Z-Girl",
  description: "A governed Z-Girl workflow for institutional renewal evidence, approvals, agreement execution, expansion decisions, and contract-to-delivery handoff.",
};

const stages = [
  ["1", "Evidence packet", "A structured administrative snapshot captures current license term, active sites, allocated seats, linked facilitator credentials, and trainer capacity—without participant reflection data."],
  ["2", "Approval gates", "Program quality, privacy governance, agreement authority, commercial authority, and executive release are recorded as explicit human decisions."],
  ["3", "Agreement execution", "The authoritative agreement, renewal, expansion amendment, change order, or Train-the-Trainer addendum is linked and must be recorded as executed before release review."],
  ["4", "Release review", "The approved term, seats, sites, profiles, credential levels, and trainer scope are checked against current usage before the institutional license is changed."],
  ["5", "Delivery handoff", "The approved contract scope becomes a Ready implementation handoff with a named implementation owner and target start date."],
  ["6", "Human release", "A separate release reference moves the handoff into delivery. Approval, payment, and delivery never collapse into one automatic event."],
];

const products = [
  ["Annual renewal", "Convert a 90-day renewal trigger into a prepared evidence-and-approval workflow rather than a last-minute contract scramble."],
  ["Multi-site expansion", "Evaluate additional sites, seats, trainers, and approved profiles against the existing institutional license and credential capacity."],
  ["Change orders", "Govern scope changes through the same evidence, approval, agreement, and delivery chain instead of informal email decisions."],
  ["Train-the-Trainer addenda", "Connect institutional trainer rights to an executed addendum, approved trainer capacity, credential scope, and implementation handoff."],
];

export default function InstitutionalAgreementWorkflowPage() {
  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <section className="relative isolate overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_18%,rgba(73,216,194,.18),transparent_34%),radial-gradient(circle_at_16%_76%,rgba(251,191,36,.11),transparent_30%)]" />
      <div className="hero-grid absolute inset-0 -z-10 opacity-20" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <span className="eyebrow">Institutional agreement workflow · v3.1</span>
        <h1 className="mt-5 max-w-5xl font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">Turn renewal and expansion into a governed decision process—not a spreadsheet chase.</h1>
        <p className="mt-7 max-w-4xl text-lg leading-8 text-slate-300">Z-Girl Institutional Agreement, Renewal & Expansion Workflow connects administrative evidence, human approvals, executed agreements, approved license changes, and contract-to-delivery handoff while preserving the privacy and credential boundaries already built into the Z-Girl institutional system.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/partners#interest" className="button-primary">Request institutional fit review</Link><Link href="/institutions/license-administration" className="button-secondary">License administration layer</Link><Link href="/institutions/train-the-trainer" className="button-secondary">Train-the-Trainer</Link></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
      <p className="section-kicker">Decision chain</p>
      <h2 className="section-title">Evidence → Approvals → Agreement → Release Review → Handoff → Delivery</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {stages.map(([number, title, body]) => <article key={number} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#49d8c2] font-black text-[#04151c]">{number}</div><h3 className="mt-5 font-display text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{body}</p></article>)}
      </div>
    </section>

    <section className="border-y border-white/10 bg-[#04111b]"><div className="mx-auto max-w-7xl px-5 py-18 sm:px-8 lg:px-12">
      <p className="section-kicker">Four institutional uses</p><h2 className="section-title">One workflow engine. Multiple revenue and implementation events.</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2">{products.map(([title, body]) => <article key={title} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7"><h3 className="font-display text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{body}</p></article>)}</div>
    </div></section>

    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-12">
      <p className="section-kicker">Approval architecture</p><h2 className="section-title">Five gates prevent one person—or one payment—from silently changing institutional authority.</h2>
      <div className="mt-8 grid gap-3">
        {["Program Quality — confirms the requested scope is operationally supportable.", "Privacy Governance — confirms the request does not expand access to private participant data.", "Agreement Authority — confirms the agreement/change-order authority is properly documented.", "Commercial Authority — confirms the commercial pathway is authorized; this is not a payment-status field and may be formally waived for an approved noncommercial use.", "Executive Release — records the final institutional/business release decision before the approved scope can move to handoff."].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm leading-7 text-slate-300">✓ {item}</div>)}
      </div>
    </section>

    <section className="border-y border-white/10 bg-[#04111b]"><div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
      <p className="section-kicker">Privacy & governance boundary</p><h2 className="section-title">The renewal packet measures the institution—not the participant.</h2>
      <div className="mt-8 grid gap-3">
        {["No private reflection text enters a renewal or expansion packet.", "No youth, student, athlete, diagnosis, counseling, clinical, clergy, safeguarding narrative, or sports-medicine records belong in the workflow.", "Credential status, license status, agreement status, approval status, payment status, and delivery status remain distinct.", "An executed agreement does not automatically release delivery.", "Payment does not automatically approve, credential, renew, expand, or release an institutional implementation."].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm leading-7 text-slate-300">✓ {item}</div>)}
      </div>
    </div></section>

    <section className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 lg:px-12"><p className="section-kicker">Institutional lifecycle</p><h2 className="section-title">Pilot → Annual License → Renewal → Expansion → Train-the-Trainer</h2><p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-400">v3.1 turns the v3.0 license record into a repeatable institutional lifecycle—ready for annual renewals, network growth, multi-site change orders, and premium Train-the-Trainer expansion without sacrificing Z-Girl’s governance-first operating model.</p><Link href="/partners#interest" className="button-primary mt-8 inline-flex">Discuss institutional fit</Link></section>
  </main>;
}
