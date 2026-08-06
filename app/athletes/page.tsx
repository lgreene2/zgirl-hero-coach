import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Hero Within for Athletes",
  description:
    "A guided reflection and character-performance system for youth athletes, families, coaches, teams, schools, and leagues.",
};

const challenges = [
  ["Pregame pressure", "Turn nervous energy into a clear job and one next play."],
  ["Mistakes", "Reset attention, learn what is useful, and return without spiraling."],
  ["Confidence", "Build trust through preparation, effort, self-talk, and realistic next steps."],
  ["Coachability", "Receive direction, ask clear questions, and respond without shutting down."],
  ["Team culture", "Practice leadership, encouragement, accountability, and sportsmanship."],
  ["Identity", "Protect a young person’s sense of worth beyond playing time, statistics, and results."],
];

const offers = [
  {
    title: "Athlete Reflection Starter Pack",
    audience: "Individual and family",
    copy: "Printable and digital prompts for focus, mistakes, confidence, teamwork, postgame reflection, and parent conversation.",
    href: "/resources/Hero_Within_Athlete_Reflection_Starter_Pack.pdf",
    cta: "Download PDF",
    external: true,
  },
  {
    title: "Coach Toolkit",
    audience: "Coach and team leader",
    copy: "A four-week implementation plan with five-minute reflections, scripts, culture prompts, parent communication, and inclusive participation guidance.",
    href: "/athletes/coach",
    cta: "Explore toolkit",
    external: false,
  },
  {
    title: "Team Pilot",
    audience: "School, team, league, or organization",
    copy: "Coach orientation, digital samples, team worksheets, parent information, implementation support, and completion feedback.",
    href: "/athletes/pilot",
    cta: "View pilot offer",
    external: false,
  },
];

export default function AthletesHubPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#061521] text-white">
      <SiteHeader />
      <section className="relative isolate border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_18%,rgba(73,216,194,0.18),transparent_31%),radial-gradient(circle_at_12%_72%,rgba(51,148,255,0.14),transparent_34%)]" />
        <div className="hero-grid absolute inset-0 -z-10 opacity-30" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-12 lg:py-24">
          <div>
            <div className="flex flex-wrap gap-2"><span className="eyebrow">New market lane</span><span className="eyebrow eyebrow-muted">Athletes · Coaches · Teams</span></div>
            <p className="mt-6 text-sm font-black uppercase tracking-[.25em] text-[#76ead6]">Hero Within Athlete Edition</p>
            <h1 className="mt-4 font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">Build the response after the pressure, mistake, or result.</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">A guided reflection and character-performance tool that helps athletes reset, focus, communicate, and grow—on and off the field.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/athletes/start" className="button-primary">Try the athlete reflection →</Link><Link href="/athletes/pilot" className="button-secondary">Bring it to a team</Link></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400"><span className="inline-flex items-center gap-2"><span className="trust-dot" /> 3–5 minutes</span><span className="inline-flex items-center gap-2"><span className="trust-dot" /> No player scoring</span><span className="inline-flex items-center gap-2"><span className="trust-dot" /> Accessible options</span></div>
          </div>

          <aside className="rounded-[2.1rem] border border-[#49d8c2]/20 bg-[#0a2030]/90 p-6 shadow-2xl shadow-black/25 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">The athlete reset</p>
            <div className="mt-5 space-y-3">
              {[
                ["Pause", "Create space before reacting."],
                ["Name It", "Notice the feeling and the pressure."],
                ["Learn", "Separate useful feedback from self-attack."],
                ["Choose", "Commit to one controllable Hero Move."],
                ["Return", "Bring attention back to the next play or practice."],
              ].map(([title, copy], index) => <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#49d8c2]/15 text-sm font-black text-[#76ead6]">{index + 1}</span><div><h2 className="font-extrabold">{title}</h2><p className="mt-1 text-sm leading-5 text-slate-400">{copy}</p></div></div>)}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl"><p className="section-kicker">Real athlete moments</p><h2 className="section-title">Mindset becomes useful when it changes the next response.</h2><p className="section-copy">The pack avoids performance promises and focuses on choices athletes and teams can actually practice.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{challenges.map(([title, copy]) => <article key={title} className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><h3 className="font-display text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p></article>)}</div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-3xl"><p className="section-kicker">Product ladder</p><h2 className="section-title">Start with a pack. Expand only when a team is ready.</h2></div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {offers.map((offer) => <article key={offer.title} className="flex min-h-72 flex-col rounded-3xl border border-white/10 bg-[#061521]/65 p-6"><span className="text-xs font-black uppercase tracking-[.17em] text-[#76ead6]">{offer.audience}</span><h3 className="mt-3 font-display text-2xl font-black">{offer.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{offer.copy}</p>{offer.external ? <a href={offer.href} download className="mt-6 text-sm font-black text-[#76ead6] transition hover:text-white">{offer.cta} →</a> : <Link href={offer.href} className="mt-6 text-sm font-black text-[#76ead6] transition hover:text-white">{offer.cta} →</Link>}</article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Inclusive team use</p><h2 className="mt-3 text-2xl font-black">Participation is not one-size-fits-all.</h2><p className="mt-3 text-sm leading-7 text-slate-400">Coaches can use shorter prompts, visual choices, extra processing time, reduced stimulation, optional breaks, and responses through speech, writing, drawing, pointing, AAC, or supported communication.</p></article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Clear boundary</p><h2 className="mt-3 text-2xl font-black">Character and reflection—not sports medicine.</h2><p className="mt-3 text-sm leading-7 text-slate-400">The Athlete Edition does not diagnose injuries, provide medical clearance, replace mental-health care, evaluate talent, track performance, or promise results. Safety and injury concerns belong with qualified adults and professionals.</p></article>
        </div>

        <div className="mt-10 rounded-[2rem] border border-[#49d8c2]/20 bg-gradient-to-br from-[#103044] to-[#0b2130] p-7 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12"><div className="max-w-3xl"><p className="section-kicker">Fast path to market</p><h2 className="font-display text-3xl font-black sm:text-4xl">One team can validate the offer before we build a larger sports platform.</h2><p className="mt-4 leading-7 text-slate-300">The founding pilot is intentionally lean: one team, four weeks, coach orientation, family communication, reflection tools, and feedback.</p></div><Link href="/athletes/pilot" className="button-primary mt-7 shrink-0 lg:mt-0">View team pilot →</Link></div>
      </section>
    </main>
  );
}
