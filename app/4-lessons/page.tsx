"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";

function trackEvent(event: string, meta: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  try {
    const key = "zgirl-analytics-v1";
    const raw = window.localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(arr) ? arr : [];
    next.push({ event, meta, ts: Date.now() });
    while (next.length > 200) next.shift();
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {}
}

type Lesson = {
  key: "Leadership" | "Education" | "Attitude" | "Personal Development";
  icon: string;
  blurb: string;
  youth: string[];
  adults: string[];
  prompt: string;
};

export default function FourLessonsPage() {
  const [mode, setMode] = useState<"Youth" | "Parent/Educator">("Youth");

  const lessons: Lesson[] = useMemo(
    () => [
      {
        key: "Leadership",
        icon: "🛡️",
        blurb: "Lead yourself first—choices, integrity, courage.",
        youth: [
          "I can choose one brave thing to do today.",
          "I can be kind and still set boundaries.",
          "I can lead by example—even in small ways.",
        ],
        adults: [
          "Teach decision-making with simple ‘if/then’ choices.",
          "Reinforce integrity: tell the truth, own mistakes, repair harm.",
          "Praise effort + values, not just outcomes.",
        ],
        prompt: "Help me practice Leadership today. What’s one small hero move I can try?",
      },
      {
        key: "Education",
        icon: "📚",
        blurb: "Growth through learning—curiosity, effort, progress.",
        youth: [
          "I can ask for help without feeling embarrassed.",
          "I can break big work into tiny steps.",
          "I can learn from mistakes instead of quitting.",
        ],
        adults: [
          "Use ‘next-step’ supports (checklists, timers, chunking).",
          "Normalize mistakes: ‘That’s data—not failure.’",
          "Connect learning to identity: ‘You’re becoming stronger.’",
        ],
        prompt: "Help me with Education. I feel stuck with school—what’s a small next step?",
      },
      {
        key: "Attitude",
        icon: "💫",
        blurb: "Mindset matters—self-talk shapes your next move.",
        youth: [
          "I can notice negative thoughts and name them.",
          "I can talk to myself like a friend.",
          "I can choose a calm reset when I’m heated.",
        ],
        adults: [
          "Model self-talk: ‘I’m frustrated, so I’m taking a breath.’",
          "Teach reframe language: ‘I can’t yet’ → ‘I’m learning.’",
          "Use co-regulation (tone, pace, proximity) before problem-solving.",
        ],
        prompt: "Help me with my Attitude. My thoughts are heavy—can you help me reset?",
      },
      {
        key: "Personal Development",
        icon: "🌱",
        blurb: "Healthy habits—emotional strength, confidence, long-term growth.",
        youth: [
          "I can build one habit that helps me feel steady.",
          "I can name my feelings instead of fighting them.",
          "I can celebrate small wins and keep going.",
        ],
        adults: [
          "Build routines: sleep, hydration, movement, decompression.",
          "Create reflection rituals: journaling, check-ins, calm corners.",
          "Support goal-setting with tiny, trackable milestones.",
        ],
        prompt: "Help me with Personal Development. What’s one habit I can build this week?",
      },
    ],
    []
  );

  const onMode = useCallback((m: "Youth" | "Parent/Educator") => {
    setMode(m);
    trackEvent("4_lessons_toggle_mode", { mode: m });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-12 flex justify-center">
      <div className="max-w-5xl w-full space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-sky-300">The 4 Lessons®</h1>
              <p className="text-slate-300 mt-1">
                Leadership · Education · Attitude · Personal Development — the framework behind Z-Girl.
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                Full website refresh coming soon.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/?chat=1"
                onClick={() => trackEvent("nav_back_to_chat", { from: "4_lessons_header" })}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-400/40 hover:bg-sky-300 active:bg-sky-500 transition"
              >
                Back to Chat
              </Link>
              <Link
                href="/hero"
                onClick={() => trackEvent("nav_to_hero", { from: "4_lessons_header" })}
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-200 transition"
              >
                About Z-Girl
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => onMode("Youth")}
              className={[
                "rounded-full px-3 py-1 text-[11px] font-semibold border transition",
                mode === "Youth"
                  ? "bg-sky-500/20 border-sky-400 text-sky-200"
                  : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-sky-400/70 hover:text-slate-100",
              ].join(" ")}
            >
              Youth
            </button>
            <button
              type="button"
              onClick={() => onMode("Parent/Educator")}
              className={[
                "rounded-full px-3 py-1 text-[11px] font-semibold border transition",
                mode === "Parent/Educator"
                  ? "bg-emerald-500/15 border-emerald-400 text-emerald-200"
                  : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-emerald-400/70 hover:text-slate-100",
              ].join(" ")}
            >
              Parent/Educator
            </button>
          </div>
        </header>

        {/* Icon grid */}
        <section className="grid gap-6 md:grid-cols-2">
          {lessons.map((l) => (
            <div
              key={l.key}
              className="rounded-3xl border border-slate-800 bg-slate-950/80 px-6 py-6 shadow-[0_0_30px_rgba(56,189,248,0.10)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl border border-slate-700 bg-slate-900/80 flex items-center justify-center text-xl">
                    {l.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-50">{l.key}</h2>
                    <p className="text-[11px] text-slate-300">{l.blurb}</p>
                  </div>
                </div>

                <Link
                  href={`/?chat=1&prompt=${encodeURIComponent(l.prompt)}`}
                  onClick={() => trackEvent("4_lessons_to_chat", { lesson: l.key })}
                  className="text-[11px] font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-4"
                  title="Open chat and preload a prompt"
                >
                  Ask Z-Girl →
                </Link>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-semibold text-slate-200">
                  {mode === "Youth" ? "For youth:" : "For parents & educators:"}
                </p>

                <ul className="space-y-1.5 text-[11px] text-slate-200">
                  {(mode === "Youth" ? l.youth : l.adults).map((x, idx) => (
                    <li key={idx}>• {x}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 px-6 py-6">
          <h3 className="text-lg font-semibold text-sky-200">How Z-Girl Fits In</h3>
          <p className="text-slate-300 mt-2 text-sm">
            Z-Girl is a fictional hero coach from The 4 Lessons® universe. She helps youth slow down, name emotions,
            and practice small “hero moves” they can use in real life.
          </p>
          <p className="mt-3 text-[11px] text-slate-500">
            Z-Girl is not a therapist, doctor, or emergency service. If someone is in immediate danger, contact local emergency services.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/?chat=1"
              onClick={() => trackEvent("nav_back_to_chat", { from: "4_lessons_footer" })}
              className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-400/40 hover:bg-sky-300 active:bg-sky-500 transition"
            >
              Back to Chat
            </Link>
            <Link
              href="/hero"
              onClick={() => trackEvent("nav_to_hero", { from: "4_lessons_footer" })}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-200 transition"
            >
              Learn about Z-Girl
            </Link>
            <Link
              href="/safety"
              onClick={() => trackEvent("nav_to_safety", { from: "4_lessons_footer" })}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-100 hover:border-amber-400 hover:text-amber-100 transition"
            >
              Safety & Use Guidelines
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
