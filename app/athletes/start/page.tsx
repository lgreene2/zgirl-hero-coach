import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import GuidedMarketSampler, { type MarketScenario } from "@/components/GuidedMarketSampler";

export const metadata: Metadata = {
  title: "Athlete Reflection",
  description:
    "Try a private Hero Within athlete reflection for pregame focus, handling mistakes, and postgame growth.",
};

const scenarios: MarketScenario[] = [
  {
    id: "pregame",
    label: "Before competition",
    tag: "Pregame focus",
    standardPrompt:
      "Notice what your mind and body are doing before the game. You do not need to eliminate every nerve. You need a clear job, steady effort, and one next play.",
    simplifiedPrompt: "Nerves are okay. Focus on one job and one play at a time.",
    reflection: "What can you control when competition begins?",
    simplifiedReflection: "What is one thing you can control?",
    heroMoves: [
      "Take three slow breaths and name my first responsibility.",
      "Use one short cue: steady, ready, next play.",
      "Encourage a teammate before focusing on my own role.",
      "Ask my coach one clear question about my assignment.",
    ],
    closing:
      "Confidence is not a promise that everything will go perfectly. It is trust that you can respond to the next moment with effort and composure.",
  },
  {
    id: "mistake",
    label: "After a mistake",
    tag: "Reset",
    standardPrompt:
      "A mistake is information, not your identity. Notice the frustration, learn what is useful, and return your attention to the next decision.",
    simplifiedPrompt: "The mistake happened. Learn one thing and return to the next play.",
    reflection: "What does a strong reset look like right now?",
    simplifiedReflection: "What can you do on the next play?",
    heroMoves: [
      "Use a reset breath and say, next play.",
      "Correct one technique instead of replaying the whole mistake.",
      "Respond to coaching without arguing or shutting down.",
      "Support a teammate and rejoin the team’s plan.",
    ],
    closing:
      "Resilience is the skill of returning. Your next response can show more about your character than the mistake itself.",
  },
  {
    id: "postgame",
    label: "After the game",
    tag: "Reflect forward",
    standardPrompt:
      "Separate the result from the learning. A win can hide weak habits, and a loss can contain real progress. Look for one strength and one adjustment.",
    simplifiedPrompt: "Name one thing that worked and one thing to improve.",
    reflection: "What should you carry forward from this performance?",
    simplifiedReflection: "What will you keep doing, and what will you change?",
    heroMoves: [
      "Write one strength and one practice goal.",
      "Thank a teammate, coach, official, or supporter respectfully.",
      "Take responsibility for one attitude or effort choice.",
      "Recover, hydrate, rest, and return to practice with a plan.",
    ],
    closing:
      "Your value is bigger than the scoreboard. Use the result as feedback while protecting your identity, relationships, and long-term growth.",
  },
];

export default function AthleteStartPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Link href="/athletes" className="text-sm font-bold text-slate-400 transition hover:text-white">← Athlete Hub</Link>
          <span className="rounded-full border border-[#49d8c2]/25 bg-[#49d8c2]/10 px-4 py-2 text-xs font-bold text-[#a6f5e8]">Private mindset sample</span>
        </div>

        <GuidedMarketSampler
          eyebrow="Hero Within Athlete sample"
          title="Reset, reflect, and choose the next play."
          intro="Use this short reflection before competition, after a mistake, or after the game. It supports mindset, character, and communication—not sports medicine, therapy, diagnosis, or performance guarantees."
          scenarios={scenarios}
          accent="teal"
          supportLabel="Talk with a coach, parent, athletic staff member, school professional, or another trusted adult when pressure, conflict, injury concerns, or emotional distress feel difficult to handle alone."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a href="/resources/Hero_Within_Athlete_Reflection_Starter_Pack.pdf" download className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:bg-white/[.07]"><span className="text-xs font-black uppercase tracking-[.17em] text-[#76ead6]">Download</span><h2 className="mt-2 text-xl font-black">Athlete Starter Pack</h2><p className="mt-2 text-sm leading-6 text-slate-400">Pregame, mistake-reset, confidence, teamwork, and postgame pages.</p></a>
          <Link href="/athletes/coach" className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:bg-white/[.07]"><span className="text-xs font-black uppercase tracking-[.17em] text-[#76ead6]">Team use</span><h2 className="mt-2 text-xl font-black">Coach Toolkit</h2><p className="mt-2 text-sm leading-6 text-slate-400">A four-week, five-minute reflection format for team culture.</p></Link>
          <Link href="/athletes/pilot" className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:bg-white/[.07]"><span className="text-xs font-black uppercase tracking-[.17em] text-[#76ead6]">Institutional offer</span><h2 className="mt-2 text-xl font-black">Team Pilot</h2><p className="mt-2 text-sm leading-6 text-slate-400">A founding implementation for one team, school, league, or organization.</p></Link>
        </div>
      </div>
    </main>
  );
}
