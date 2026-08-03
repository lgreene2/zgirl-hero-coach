"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";

type Day = { title: string; focus: string; reflection: string; strength: string; move: string; affirmation: string };
type Entry = { reflection: string; strength: string; move: string };

const STORAGE_KEY = "zgirl-hero-within-7-day-v2";
const days: Day[] = [
  { title: "Make Space", focus: "Pause before you push forward.", reflection: "What has been taking up the most space in your mind or heart?", strength: "What helps you feel even 5% more grounded?", move: "Create two quiet minutes today—breathe, stretch, pray, sit, or step outside.", affirmation: "I can create space before I choose my next move." },
  { title: "Name the Moment", focus: "Clear words create a clearer starting point.", reflection: "What feeling, challenge, or decision needs an honest name today?", strength: "What do you know now that you did not know before?", move: "Complete this sentence: “The real issue I want to address is…”", affirmation: "Naming my experience helps me work with it." },
  { title: "Look Beneath It", focus: "Curiosity is more useful than self-judgment.", reflection: "What pressure, need, fear, or expectation may be shaping this moment?", strength: "When have you handled something similar with care or courage?", move: "Write one fact, one feeling, and one need—without trying to fix them yet.", affirmation: "I can be curious about myself without tearing myself down." },
  { title: "Find Your Strength", focus: "Strength includes the support you can reach for.", reflection: "Which value, skill, relationship, or resource is available to you now?", strength: "What would someone who believes in you remind you about?", move: "Use one strength on purpose today, even in a small way.", affirmation: "I already carry strengths that can help me move forward." },
  { title: "Choose the Hero Move", focus: "Progress becomes possible when the next step is small and specific.", reflection: "What outcome matters most—and what is within your control?", strength: "Which strength from Day 4 belongs in this next step?", move: "Choose one action you can complete in 15 minutes or less.", affirmation: "My next move does not have to solve everything to matter." },
  { title: "Ask for Support", focus: "Connection can be an act of courage.", reflection: "Where would support, accountability, or another perspective help?", strength: "Who is a safe person, or what is a reliable resource, you can contact?", move: "Send one message, ask one question, or schedule one conversation.", affirmation: "Asking for support is a powerful Hero Move." },
  { title: "Reflect Forward", focus: "Notice what changed, then carry the learning with you.", reflection: "What shifted in your thoughts, feelings, choices, or relationships this week?", strength: "What strength did you practice most?", move: "Write your next seven-day commitment in one clear sentence.", affirmation: "I can learn from this week and keep moving with purpose." },
];

const emptyEntries = (): Entry[] => days.map(() => ({ reflection: "", strength: "", move: "" }));

export default function JourneyPage() {
  const [active, setActive] = useState(0);
  const [entries, setEntries] = useState<Entry[]>(emptyEntries);
  const [completed, setCompleted] = useState<boolean[]>(days.map(() => false));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { active?: number; entries?: Entry[]; completed?: boolean[] };
        if (Array.isArray(saved.entries) && saved.entries.length === 7) setEntries(saved.entries);
        if (Array.isArray(saved.completed) && saved.completed.length === 7) setCompleted(saved.completed);
        if (typeof saved.active === "number") setActive(Math.max(0, Math.min(6, saved.active)));
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ active, entries, completed })); } catch {}
  }, [active, completed, entries, loaded]);

  const progress = completed.filter(Boolean).length;
  const current = days[active];
  const entry = entries[active];
  const canComplete = Boolean(entry.reflection.trim() && entry.move.trim());
  const update = (key: keyof Entry, value: string) => setEntries((all) => all.map((item, index) => index === active ? { ...item, [key]: value } : item));

  const fullJourney = useMemo(() => days.map((day, index) => `DAY ${index + 1}: ${day.title}\nReflection: ${entries[index].reflection || "—"}\nStrength: ${entries[index].strength || "—"}\nHero Move: ${entries[index].move || "—"}`).join("\n\n"), [entries]);

  const completeDay = () => {
    setCompleted((all) => all.map((value, index) => index === active ? true : value));
    if (active < 6) setActive(active + 1);
  };

  const download = () => {
    const blob = new Blob([`7-DAY HERO WITHIN REFLECTION JOURNEY\n\n${fullJourney}\n\nCreated with Z-Girl: The Hero Within Reflection System.`], { type: "text/plain" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "Z-Girl-7-Day-Hero-Within-Journey.txt"; anchor.click(); URL.revokeObjectURL(url);
  };

  const reset = () => {
    if (!window.confirm("Clear all seven days from this device?")) return;
    setEntries(emptyEntries()); setCompleted(days.map(() => false)); setActive(0); window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_85%_20%,rgba(73,216,194,.13),transparent_30%)]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
          <div className="max-w-3xl"><p className="section-kicker">Free guided experience</p><h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">7 Days to a Stronger Hero Within</h1><p className="mt-5 text-lg leading-8 text-slate-300">One focused reflection, one strength, and one achievable Hero Move each day. Your entries stay in this browser on this device.</p></div>
          <div className="mt-8 flex flex-wrap items-center gap-4"><span className="eyebrow">{progress} of 7 complete</span><div className="h-2 w-52 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#49d8c2] transition-all" style={{ width: `${(progress / 7) * 100}%` }} /></div>{progress === 7 && <span className="font-black text-[#76ead6]">Journey complete ✓</span>}</div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-12">
        <aside>
          <h2 className="mb-3 text-xs font-black uppercase tracking-[.18em] text-slate-400">Your seven days</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {days.map((day, index) => <button key={day.title} onClick={() => setActive(index)} aria-current={active === index ? "step" : undefined} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${active === index ? "border-[#49d8c2]/60 bg-[#49d8c2]/10" : "border-white/10 bg-white/[.025] hover:border-white/25"}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${completed[index] ? "bg-[#49d8c2] text-[#04151c]" : "bg-white/10 text-slate-300"}`}>{completed[index] ? "✓" : index + 1}</span><span><span className="block text-xs font-bold text-slate-400">Day {index + 1}</span><span className="block font-black">{day.title}</span></span></button>)}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 p-4 text-xs leading-5 text-slate-400">This journey supports reflection and self-improvement. It is not therapy or emergency support. <Link href="/safety" className="font-black text-sky-300 underline">Safety guidance</Link></div>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 pb-6"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Day {active + 1} of 7</p><h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">{current.title}</h2><p className="mt-3 text-base leading-7 text-slate-300">{current.focus}</p></div><span className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-black text-slate-300">About 8 minutes</span></div>

          <div className="mt-7 space-y-7">
            <div><label htmlFor="journey-reflection" className="field-label">Reflect · {current.reflection}</label><textarea id="journey-reflection" className="reflection-field" value={entry.reflection} onChange={(e) => update("reflection", e.target.value)} /></div>
            <div><label htmlFor="journey-strength" className="field-label">Find the Strength · {current.strength}</label><textarea id="journey-strength" className="reflection-field !min-h-[110px]" value={entry.strength} onChange={(e) => update("strength", e.target.value)} /></div>
            <div className="rounded-3xl border border-[#49d8c2]/25 bg-[#49d8c2]/[.06] p-5 sm:p-6"><label htmlFor="journey-move" className="field-label !text-[#9cf2e3]">Today&apos;s Hero Move · {current.move}</label><textarea id="journey-move" className="reflection-field !min-h-[110px]" value={entry.move} onChange={(e) => update("move", e.target.value)} placeholder="Write the action in your own words…" /></div>
            <blockquote className="border-l-4 border-sky-400 pl-5 text-lg font-bold italic leading-8 text-slate-200">“{current.affirmation}”</blockquote>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6"><div className="flex gap-2"><button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0} className="rounded-full px-4 py-3 text-sm font-black text-slate-300 disabled:opacity-30">← Previous</button><button onClick={() => setActive(Math.min(6, active + 1))} disabled={active === 6} className="rounded-full px-4 py-3 text-sm font-black text-slate-300 disabled:opacity-30">Next →</button></div><button onClick={completeDay} disabled={!canComplete} className="button-primary disabled:cursor-not-allowed disabled:opacity-40">{completed[active] ? "Update & continue" : "Complete this day"}</button></div>
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12"><div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-white/10 bg-white/[.03] p-5 sm:p-7"><div><h2 className="font-display text-xl font-black">Keep your journey</h2><p className="mt-1 text-sm text-slate-400">Download a plain-text copy or print this page to PDF. Clear it whenever you choose.</p></div><div className="flex flex-wrap gap-2"><button onClick={download} className="button-secondary !min-h-0 !px-4 !py-2 text-sm">Download my entries</button><button onClick={() => window.print()} className="button-secondary !min-h-0 !px-4 !py-2 text-sm">Print / save PDF</button><button onClick={reset} className="rounded-full px-4 py-2 text-sm font-black text-rose-300">Clear journey</button></div></div></section>
    </main>
  );
}
