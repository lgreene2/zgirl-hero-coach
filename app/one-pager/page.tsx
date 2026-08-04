import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

const method = ["Pause", "Name It", "Understand It", "Find the Strength", "Choose a Hero Move", "Reflect Forward"];

export default function OnePagerPage() {
  return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader /><div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-16">
    <div className="flex flex-wrap items-center gap-2"><span className="eyebrow">Z-Girl Open v2.2</span><span className="eyebrow eyebrow-muted">Public overview</span></div>
    <h1 className="mt-6 font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">The Hero Within Reflection System</h1>
    <p className="mt-5 max-w-3xl text-xl leading-8 text-slate-300">A character-powered, safety-first reflection system that helps people turn difficult moments into achievable Hero Moves.</p>

    <div className="mt-10 grid gap-5 md:grid-cols-2"><Card title="Who it serves"><ul><li>Youth ages 10–17</li><li>Adults seeking personal growth</li><li>Families reflecting together</li><li>Schools and youth programs using guided activities</li></ul></Card><Card title="What it helps with"><ul><li>Emotional awareness and self-talk</li><li>Confidence, resilience, and everyday decisions</li><li>School, work, relationship, and goal-related stress</li><li>Turning reflection into one realistic next action</li></ul></Card></div>

    <section className="mt-10 rounded-3xl border border-[#49d8c2]/20 bg-[#49d8c2]/[.055] p-6 sm:p-8"><p className="section-kicker">Reusable core method</p><h2 className="font-display text-3xl font-black">Six steps from reaction to agency</h2><ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{method.map((step, index) => <li key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#061521]/40 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#49d8c2] text-sm font-black text-[#04151c]">{index + 1}</span><span className="font-black">{step}</span></li>)}</ol></section>

    <div className="mt-10 grid gap-5 md:grid-cols-2"><Card title="Public release formats"><ul><li>No-login private web reflection</li><li>Optional AI-guided conversation</li><li>Installable Progressive Web App</li><li>Interactive 7-Day Hero Within Journey</li><li>Print / save-PDF reflection summaries</li><li>Voice and accessibility controls</li></ul></Card><Card title="Trust commitments"><ul><li>No advertising or sale of reflection data</li><li>Private reflection does not use an AI provider</li><li>AI data flow disclosed before conversation</li><li>Deterministic crisis-response safety layer</li><li>Clear non-therapy and emergency boundaries</li><li>WCAG 2.2 AA target</li></ul></Card></div>

    <section className="mt-10 rounded-3xl border border-white/10 bg-white/[.035] p-6 sm:p-8"><h2 className="font-display text-2xl font-black">Institutional pathway</h2><p className="mt-3 leading-7 text-slate-300">Z-Girl EDU is the school and youth-organization edition: a 30-day facilitated pilot with staff orientation, family communications, privacy review, de-identified outcomes, and a train-the-facilitator pathway. The model is reflection without surveillance.</p><Link href="/edu" className="mt-4 inline-flex font-black text-sky-300 underline underline-offset-4">Explore Z-Girl EDU →</Link></section>

    <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/reflect" className="button-primary">Start a private reflection <span aria-hidden="true">→</span></Link><Link href="/journey" className="button-secondary">Begin the 7-Day Journey</Link><Link href="/safety" className="button-secondary">Trust &amp; Safety</Link></div>
  </div></main>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><h2 className="font-display text-2xl font-black">{title}</h2><div className="mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 text-sm leading-6 text-slate-300">{children}</div></section>; }
