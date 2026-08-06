import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CommerceLeadForm from "@/components/CommerceLeadForm";

export const metadata: Metadata = {
  title: "Athlete Team Pilot",
  description:
    "A four-week founding Hero Within athlete mindset and character pilot for one team, school, league, or youth organization.",
};

const included = [
  "One team, school, club, league, church-sports, or youth organization",
  "Coach or team-leader orientation",
  "Four-week Hero Within reflection sequence",
  "Athlete worksheets and digital samples",
  "Parent and caregiver information sheet",
  "Accessible and inclusive participation guidance",
  "Implementation check-in and completion feedback",
  "Pilot findings summary and next-step recommendations",
];

export default function AthletePilotPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_82%_15%,rgba(73,216,194,.16),transparent_31%)]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <Link href="/athletes" className="text-sm font-bold text-slate-400 transition hover:text-white">← Athlete Hub</Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2"><span className="eyebrow">Founding institutional offer</span><span className="eyebrow eyebrow-muted">One team · Four weeks</span></div>
              <h1 className="mt-5 font-display text-5xl font-black leading-tight tracking-[-.04em] sm:text-6xl">Athlete Mindset &amp; Character Team Pilot</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">A lean supported implementation designed to strengthen confidence, composure, teamwork, resilience, coachability, and character without creating a large sports-technology project.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/resources/team-pilot-sell-sheet" className="button-primary text-center">Open one-page sell sheet</Link><a href="#interest" className="button-secondary text-center">Request a pilot</a></div>
            </div>
            <aside className="rounded-[2rem] border border-[#49d8c2]/20 bg-[#0a2030]/90 p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Founding pilot range</p><p className="mt-3 font-display text-4xl font-black">$1,500–$2,500</p><p className="mt-2 text-sm leading-6 text-slate-400">Recommended range for one team or organization. Broader customization, multiple teams, seasonal support, or organization-wide licensing are scoped separately.</p><div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm leading-6 text-slate-300">The first pilot should validate use, outcomes language, coach adoption, and family response before building subscriptions or analytics.</div></aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="section-kicker">Pilot package</p><h2 className="section-title">A usable implementation—not just app access.</h2><p className="section-copy">The team receives a clear sequence and support while athletes retain privacy and multiple ways to participate.</p></div><div className="grid gap-3 sm:grid-cols-2">{included.map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm font-bold leading-6 text-slate-200"><span className="mr-2 text-[#76ead6]">✓</span>{item}</div>)}</div></div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-[#071925] p-6"><span className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Week 1</span><h2 className="mt-3 text-2xl font-black">Focus &amp; composure</h2><p className="mt-3 text-sm leading-6 text-slate-400">Pregame reset, controllables, and one-next-play language.</p></article>
            <article className="rounded-3xl border border-white/10 bg-[#071925] p-6"><span className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Weeks 2–3</span><h2 className="mt-3 text-2xl font-black">Mistakes &amp; culture</h2><p className="mt-3 text-sm leading-6 text-slate-400">Reset skills, coachability, encouragement, accountability, and sportsmanship.</p></article>
            <article className="rounded-3xl border border-white/10 bg-[#071925] p-6"><span className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Week 4</span><h2 className="mt-3 text-2xl font-black">Reflect forward</h2><p className="mt-3 text-sm leading-6 text-slate-400">Strengths, adjustments, identity beyond results, and next-season recommendations.</p></article>
          </div>
        </div>
      </section>

      <section id="interest" className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:px-12">
        <CommerceLeadForm
          leadType="team-pilot"
          defaultOffer="athlete-team-pilot"
          heading="Request the founding team pilot."
          intro="Share the team or organization, sport or activity, age range, season timing, group size, and desired outcomes. Do not include private medical, injury, mental-health, or safeguarding information."
          submitLabel="Send team pilot inquiry"
        />
      </section>
    </main>
  );
}
