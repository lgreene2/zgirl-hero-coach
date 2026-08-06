import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Coach Toolkit",
  description:
    "A four-week Hero Within coach toolkit for athlete mindset, character, teamwork, resilience, and inclusive team reflection.",
};

const weeks = [
  ["Week 1", "Composure", "Use a simple pregame reset and define what the athlete can control."],
  ["Week 2", "Mistakes", "Practice a next-play response that separates correction from shame."],
  ["Week 3", "Team Culture", "Strengthen encouragement, accountability, coachability, and sportsmanship."],
  ["Week 4", "Reflect Forward", "Review strengths, identify one adjustment, and protect identity beyond results."],
];

const format = [
  ["1 minute", "Pause", "Breathe, settle, and name the team moment."],
  ["2 minutes", "Reflect", "Use one question and allow multiple ways to respond."],
  ["1 minute", "Hero Move", "Choose one controllable action for practice or competition."],
  ["1 minute", "Close", "Reinforce support, safety, and the next team responsibility."],
];

export default function CoachToolkitPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_82%_15%,rgba(73,216,194,.16),transparent_31%)]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <Link href="/athletes" className="text-sm font-bold text-slate-400 transition hover:text-white">← Athlete Hub</Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2"><span className="eyebrow">Coach product</span><span className="eyebrow eyebrow-muted">Four weeks · Five minutes</span></div>
              <h1 className="mt-5 font-display text-5xl font-black leading-tight tracking-[-.04em] sm:text-6xl">Hero Within Coach Toolkit</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">A short, repeatable team-reflection system for confidence, composure, coachability, teamwork, resilience, and character.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="/resources/Hero_Within_Coach_Toolkit.pdf" download className="button-primary text-center">Download coach toolkit PDF</a><Link href="/athletes/start" className="button-secondary text-center">Try athlete sample</Link></div>
            </div>
            <aside className="rounded-[2rem] border border-[#49d8c2]/20 bg-[#0a2030]/90 p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Recommended launch price</p>
              <p className="mt-3 font-display text-4xl font-black">$79–$149</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">Initial digital toolkit range for one coach or team leader. Team access, orientation, and implementation support are separate offers.</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm leading-6 text-slate-300">The market page is active now. Checkout can be connected after pricing, license terms, and fulfillment are finalized.</div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-3xl"><p className="section-kicker">Four-week sequence</p><h2 className="section-title">A team culture practice—not another lecture.</h2><p className="section-copy">Each week gives coaches one focus, a few prompts, and a practical Hero Move that can be reinforced during practice and competition.</p></div>
        <div className="mt-9 grid gap-4 md:grid-cols-2">{weeks.map(([week, title, copy]) => <article key={week} className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><span className="text-xs font-black uppercase tracking-[.17em] text-[#76ead6]">{week}</span><h3 className="mt-3 font-display text-3xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p></article>)}</div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-3xl"><p className="section-kicker">Five-minute format</p><h2 className="section-title">Short enough to use consistently.</h2></div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{format.map(([time, title, copy]) => <article key={time} className="rounded-3xl border border-white/10 bg-[#071925] p-5"><span className="text-xs font-black uppercase tracking-[.16em] text-[#76ead6]">{time}</span><h3 className="mt-3 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Included</p><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><li>Four-week implementation plan</li><li>Pregame and postgame prompts</li><li>Coach discussion scripts</li><li>Team culture activities</li><li>Parent communication template</li><li>Accessible participation guidance</li><li>Safety and referral boundaries</li><li>Optional completion feedback</li></ul></article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Coach boundary</p><h2 className="mt-3 text-2xl font-black">Do not require private disclosure.</h2><p className="mt-3 text-sm leading-7 text-slate-400">Athletes may reflect silently, select a choice, write privately, draw, use AAC, or pass. Coaches should reinforce behavior and team expectations without diagnosing emotions, demanding personal stories, or treating the tool as mental-health care.</p><p className="mt-4 text-sm leading-7 text-slate-400">Medical, injury, abuse, self-harm, or significant emotional concerns require the organization’s established safeguarding and professional-support procedures.</p></article>
        </div>

        <div className="mt-10 rounded-[2rem] border border-[#49d8c2]/20 bg-gradient-to-br from-[#103044] to-[#0b2130] p-7 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10"><div className="max-w-3xl"><h2 className="font-display text-3xl font-black">Ready for a supported team implementation?</h2><p className="mt-3 leading-7 text-slate-300">The founding Team Pilot adds orientation, family communication, implementation support, digital access, and completion feedback.</p></div><Link href="/athletes/pilot" className="button-primary mt-6 shrink-0 lg:mt-0">View team pilot →</Link></div>
      </section>
    </main>
  );
}
