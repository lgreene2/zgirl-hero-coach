"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { assessRisk } from "@/app/lib/safety";

type Audience = "youth" | "adult" | "family" | "educator";
type Answers = { mood: string; pause: string; name: string; understand: string; strength: string; move: string; followUp: string };

const STORAGE_KEY = "zgirl-open-v2-reflection";
const blank: Answers = { mood: "", pause: "", name: "", understand: "", strength: "", move: "", followUp: "" };

const audiences: { id: Audience; title: string; label: string; description: string }[] = [
  { id: "youth", title: "Youth", label: "Ages 10–17", description: "School, friendships, confidence, big feelings, and everyday choices." },
  { id: "adult", title: "Personal", label: "Adults", description: "Decisions, goals, relationships, resilience, and personal growth." },
  { id: "family", title: "Family", label: "Together", description: "Reflect privately, then choose what you want to share together." },
  { id: "educator", title: "Guided", label: "Groups", description: "A facilitator-supported check-in for classrooms and youth programs." },
];

const stepNames = ["Choose a path", "Pause", "Name It", "Understand It", "Find the Strength", "Choose a Hero Move", "Reflect Forward"];
const moods = ["Calm", "Hopeful", "Unsure", "Stressed", "Sad", "Frustrated", "Angry", "Overwhelmed"];

const audiencePrompts: Record<Audience, { name: string; understand: string; strength: string; move: string }> = {
  youth: {
    name: "What happened, and what feeling is showing up most strongly?",
    understand: "What might be making this moment harder? Think about people, pressure, expectations, or what you need.",
    strength: "What strength, person, skill, or past win could help you right now?",
    move: "What is one small, safe thing you can do next—today or in the next hour?",
  },
  adult: {
    name: "What challenge, decision, or feeling needs your attention right now?",
    understand: "What facts, fears, needs, or patterns may be influencing this moment?",
    strength: "Which value, ability, resource, or relationship can you draw on?",
    move: "What is one specific, achievable action that moves you forward without requiring everything to be solved?",
  },
  family: {
    name: "What moment or concern are you reflecting on? Write only what feels right to keep private or share later.",
    understand: "What might each person be feeling or needing—even if you do not agree yet?",
    strength: "What does your family already do well when you support one another?",
    move: "What is one respectful next step that could make the next conversation or moment a little better?",
  },
  educator: {
    name: "What learning, relationship, or self-management moment are you reflecting on? Avoid names or identifying details.",
    understand: "What conditions, expectations, or unmet needs may have shaped the moment?",
    strength: "What skill, support, or classroom resource can help?",
    move: "What is one safe, realistic action you can take or ask a trusted adult to help with?",
  },
};

export default function ReflectPage() {
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [answers, setAnswers] = useState<Answers>(blank);
  const [saveOnDevice, setSaveOnDevice] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [lowStimulus, setLowStimulus] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { audience?: Audience; answers?: Answers; step?: number };
      if (saved.audience && saved.answers) {
        setAudience(saved.audience);
        setAnswers({ ...blank, ...saved.answers });
        setStep(Math.min(6, Math.max(0, saved.step ?? 0)));
        setSaveOnDevice(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (saveOnDevice) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ audience, answers, step }));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [answers, audience, saveOnDevice, step]);

  const combined = Object.values(answers).join(" ");
  const risk = useMemo(() => assessRisk(combined), [combined]);
  const prompt = audience ? audiencePrompts[audience] : null;
  const progress = Math.round((step / 6) * 100);
  const update = (key: keyof Answers, value: string) => setAnswers((current) => ({ ...current, [key]: value }));

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(audience);
    if (step === 1) return Boolean(answers.mood || answers.pause.trim());
    if (step === 2) return Boolean(answers.name.trim());
    if (step === 3) return Boolean(answers.understand.trim());
    if (step === 4) return Boolean(answers.strength.trim());
    if (step === 5) return Boolean(answers.move.trim());
    return true;
  }, [answers, audience, step]);

  const summary = `MY HERO WITHIN REFLECTION\n\nWhat I named:\n${answers.name || "—"}\n\nWhat may be influencing it:\n${answers.understand || "—"}\n\nStrength I can use:\n${answers.strength || "—"}\n\nMy Hero Move:\n${answers.move || "—"}\n\nWhen I will check back:\n${answers.followUp || "—"}\n\nCreated with Z-Girl: The Hero Within Reflection System.`;

  const clearReflection = () => {
    if (!window.confirm("Clear this reflection from this device?")) return;
    setAnswers(blank); setAudience(null); setStep(0); setSaveOnDevice(false);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className={`${largeText ? "text-[1.12rem]" : ""} min-h-screen bg-[#061521] text-white ${lowStimulus ? "[&_*]:!animate-none" : ""}`}>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-7 lg:py-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Z-Girl Open · Private Reflection</p>
            <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">Find your next Hero Move</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <button onClick={() => setLargeText((v) => !v)} aria-pressed={largeText} className="rounded-full border border-white/15 px-3 py-2 hover:border-[#49d8c2]">{largeText ? "Standard text" : "Larger text"}</button>
            <button onClick={() => setLowStimulus((v) => !v)} aria-pressed={lowStimulus} className="rounded-full border border-white/15 px-3 py-2 hover:border-[#49d8c2]">{lowStimulus ? "Standard display" : "Low-stimulation"}</button>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-white/10 bg-white/[.035] p-4">
          <div className="flex items-center justify-between gap-4 text-xs font-black uppercase tracking-wider text-slate-400"><span>{stepNames[step]}</span><span>{progress}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-label={`Reflection ${progress}% complete`} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-gradient-to-r from-[#49d8c2] to-sky-400 transition-all" style={{ width: `${progress}%` }} /></div>
        </div>

        {risk.level !== "low" && (
          <aside role="alert" className={`mb-5 rounded-2xl border p-5 ${risk.level === "high" ? "border-rose-400/50 bg-rose-400/10" : "border-amber-300/50 bg-amber-300/10"}`}>
            <h2 className="font-black">Your safety matters more than finishing this reflection.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-200">Z-Girl is not an emergency service. Please connect with a trusted person now. If you may act on thoughts of harming yourself or someone else, call 911 in the U.S. or your local emergency number. In the U.S., call or text 988 for the Suicide &amp; Crisis Lifeline.</p>
            <a href="tel:988" className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">Call 988</a>
          </aside>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <section className="min-h-[520px] rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 shadow-2xl shadow-black/20 sm:p-8">
            {step === 0 && (
              <div>
                <p className="text-sm font-black uppercase tracking-[.18em] text-[#76ead6]">Before we begin</p>
                <h2 className="mt-3 font-display text-3xl font-black">Who is this reflection for?</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-300">Choose the path that best fits this moment. It changes the language of the prompts—not your access to the tool.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {audiences.map((item) => <button key={item.id} onClick={() => setAudience(item.id)} aria-pressed={audience === item.id} className="choice-card"><span className="text-xs font-black uppercase tracking-wider text-[#76ead6]">{item.label}</span><span className="mt-1 block text-xl font-black">{item.title}</span><span className="mt-2 block text-sm leading-6 text-slate-400">{item.description}</span></button>)}
                </div>
              </div>
            )}

            {step === 1 && <div><StepHeading number="1" title="Pause" copy="You do not have to solve anything yet. Give yourself a moment to arrive." /><label className="field-label mt-7">What best matches how you feel right now?</label><div className="flex flex-wrap gap-2">{moods.map((mood) => <button key={mood} onClick={() => update("mood", mood)} aria-pressed={answers.mood === mood} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold aria-pressed:border-[#49d8c2] aria-pressed:bg-[#49d8c2]/10">{mood}</button>)}</div><label htmlFor="pause" className="field-label mt-7">What do you notice in your body, thoughts, or energy?</label><textarea id="pause" className="reflection-field" value={answers.pause} onChange={(e) => update("pause", e.target.value)} placeholder="A few words are enough…" /></div>}
            {step === 2 && <TextStep number="2" title="Name It" copy="Naming the moment can make it feel more workable." id="name" question={prompt?.name ?? "What is happening?"} value={answers.name} onChange={(value) => update("name", value)} />}
            {step === 3 && <TextStep number="3" title="Understand It" copy="Look underneath the moment with curiosity, not judgment." id="understand" question={prompt?.understand ?? "What may be shaping this?"} value={answers.understand} onChange={(value) => update("understand", value)} />}
            {step === 4 && <TextStep number="4" title="Find the Strength" copy="Strength can be courage, patience, a boundary, a skill, or asking someone for help." id="strength" question={prompt?.strength ?? "What strength can help?"} value={answers.strength} onChange={(value) => update("strength", value)} />}
            {step === 5 && <TextStep number="5" title="Choose a Hero Move" copy="Make it small enough to begin and specific enough to recognize when it is done." id="move" question={prompt?.move ?? "What is one next step?"} value={answers.move} onChange={(value) => update("move", value)} />}
            {step === 6 && (
              <div>
                <StepHeading number="6" title="Reflect Forward" copy="You found a next step. Decide when you will come back and notice what changed." />
                <label htmlFor="follow-up" className="field-label mt-7">When will you check back on this Hero Move?</label>
                <input id="follow-up" className="w-full rounded-2xl border border-white/15 bg-[#020c15]/50 px-4 py-3 outline-none focus:border-[#49d8c2]" value={answers.followUp} onChange={(e) => update("followUp", e.target.value)} placeholder="For example: tonight, tomorrow after school, or Friday" />
                <div className="mt-7 rounded-3xl border border-[#49d8c2]/30 bg-[#49d8c2]/[.07] p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">My Hero Move</p><p className="mt-3 font-display text-2xl font-black leading-9">{answers.move}</p><p className="mt-4 text-sm leading-6 text-slate-300">Strength I&apos;m bringing: <strong>{answers.strength}</strong></p></div>
                {audience === "family" && <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/[.06] p-4 text-sm leading-6 text-slate-300"><strong className="text-sky-200">Optional family conversation:</strong> “Here is the part I feel comfortable sharing, and here is one way you could support my Hero Move.”</div>}
                <div className="mt-6 flex flex-wrap gap-3"><button onClick={copySummary} className="button-secondary !min-h-0 !px-4 !py-2 text-sm">{copied ? "Copied" : "Copy summary"}</button><button onClick={() => window.print()} className="button-secondary !min-h-0 !px-4 !py-2 text-sm">Print or save PDF</button><Link href="/journey" className="button-primary !min-h-0 !px-4 !py-2 text-sm">Continue for 7 days</Link></div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-full px-4 py-2 text-sm font-black text-slate-300 disabled:opacity-30">← Back</button>
              {step < 6 && <button onClick={() => setStep((s) => Math.min(6, s + 1))} disabled={!canContinue} className="button-primary !min-h-0 disabled:cursor-not-allowed disabled:opacity-40">Continue <span aria-hidden="true">→</span></button>}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[.035] p-5">
              <div className="flex items-center gap-3"><span className="relative h-14 w-14 overflow-hidden rounded-2xl"><Image src="/icons/zgirl-icon-1024.png" alt="" fill sizes="56px" className="object-cover" /></span><div><p className="font-black">A note from Z-Girl</p><p className="text-xs text-[#76ead6]">Take only what helps.</p></div></div>
              <p className="mt-4 text-sm leading-6 text-slate-300">You can skip details, pause, or leave at any time. Reflection is not a test, and asking a real person for support is a powerful Hero Move.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[.035] p-5 text-sm">
              <p className="font-black">Your privacy choice</p><label className="mt-3 flex items-start gap-3 leading-6 text-slate-300"><input type="checkbox" checked={saveOnDevice} onChange={(e) => setSaveOnDevice(e.target.checked)} className="mt-1 accent-[#49d8c2]" /><span>Save this draft only in this browser on this device.</span></label><p className="mt-3 text-xs leading-5 text-slate-500">When off, this reflection stays only in the current page session. Avoid names and identifying details on shared devices.</p><button onClick={clearReflection} className="mt-4 text-xs font-black text-rose-300 underline underline-offset-4">Clear reflection</button>
            </div>
            <div className="rounded-[1.6rem] border border-amber-300/20 bg-amber-300/[.055] p-5 text-xs leading-5 text-slate-300">Z-Girl supports reflection and encouragement. It is not therapy, medical care, or emergency help. <Link href="/safety" className="font-black text-amber-200 underline">See safety guidance.</Link></div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StepHeading({ number, title, copy }: { number: string; title: string; copy: string }) {
  return <div><p className="text-sm font-black uppercase tracking-[.2em] text-[#76ead6]">Step {number} of 6</p><h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">{title}</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">{copy}</p></div>;
}

function TextStep({ number, title, copy, id, question, value, onChange }: { number: string; title: string; copy: string; id: string; question: string; value: string; onChange: (value: string) => void }) {
  return <div><StepHeading number={number} title={title} copy={copy} /><label htmlFor={id} className="field-label mt-7">{question}</label><textarea id={id} className="reflection-field" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Write what feels useful. You can keep it short…" /></div>;
}
