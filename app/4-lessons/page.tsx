"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

type Lesson = { title: string; icon: string; blurb: string; bullets: string[] };

export default function FourLessonsPage() {
  const [tab, setTab] = useState<"youth" | "adult">("youth");

  const ANALYTICS_KEY = "zgirl-analytics-v1";
  const trackEvent = useCallback((name: string, props: Record<string, any> = {}) => {
    try {
      const entry = { name, props, ts: Date.now() };
      const raw = window.localStorage.getItem(ANALYTICS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(arr) ? [entry, ...arr].slice(0, 200) : [entry];
      window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const lessons: Lesson[] = useMemo(() => ([
    {
      title: "Leadership",
      icon: "🦸🏾‍♀️",
      blurb: "Lead yourself first — choices, integrity, courage, and kindness.",
      bullets: ["Own your choices", "Be brave + respectful", "Lead by example"],
    },
    {
      title: "Education",
      icon: "📚",
      blurb: "Learning is your superpower — curiosity, effort, and growth.",
      bullets: ["Ask questions", "Practice small steps", "Progress > perfection"],
    },
    {
      title: "Attitude",
      icon: "💭",
      blurb: "Your mindset shapes your moves — self-talk, optimism, resilience.",
      bullets: ["Notice your self-talk", "Flip ‘I can’t’ to ‘I can try’", "Breathe before reacting"],
    },
    {
      title: "Personal Development",
      icon: "🌱",
      blurb: "Grow your inner life — habits, emotions, confidence, goals.",
      bullets: ["Build healthy habits", "Learn your emotions", "Keep growing on purpose"],
    },
  ]), []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-sky-300 leading-tight">
              The 4 Lessons
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Leadership • Education • Attitude • Personal Development
            </p>
          </div>

          <Link
            href="/?chat=1"
            onClick={() => trackEvent("nav_back_to_chat")}
            className="inline-flex items-center justify-center rounded-full bg-sky-400/90 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/30 hover:bg-sky-300 transition"
          >
            Back to chat
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <section className="space-y-4">
          <p className="text-slate-300">
            The 4 Lessons is a youth empowerment framework that helps kids and teens build confidence, character,
            and emotional strength — starting from the inside.
          </p>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-200">Choose your view</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setTab("youth"); trackEvent("4lessons_tab", { tab: "youth" }); }}
                  className={[
                    "rounded-full px-3 py-1 text-[11px] font-semibold border transition",
                    tab === "youth"
                      ? "bg-emerald-400/90 text-slate-950 border-emerald-300"
                      : "bg-slate-950/40 text-slate-200 border-slate-700 hover:border-sky-400/70",
                  ].join(" ")}
                >
                  Youth
                </button>
                <button
                  type="button"
                  onClick={() => { setTab("adult"); trackEvent("4lessons_tab", { tab: "adult" }); }}
                  className={[
                    "rounded-full px-3 py-1 text-[11px] font-semibold border transition",
                    tab === "adult"
                      ? "bg-emerald-400/90 text-slate-950 border-emerald-300"
                      : "bg-slate-950/40 text-slate-200 border-slate-700 hover:border-sky-400/70",
                  ].join(" ")}
                >
                  Parent / Educator
                </button>
              </div>
            </div>

            {tab === "youth" ? (
              <p className="mt-3 text-[11px] sm:text-xs text-slate-300">
                Think of these as your hero tools. You don’t have to be perfect — you just practice one small hero move at a time.
              </p>
            ) : (
              <div className="mt-3 space-y-2 text-[11px] sm:text-xs text-slate-300">
                <p>
                  These four pillars support SEL skills (self-awareness, self-management, relationship skills) in a kid-friendly way.
                </p>
                <p>
                  Use Z-Girl to practice reflection prompts, breathing/grounding, and “tiny hero wins.” Keep it supportive, not corrective.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Lesson cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lessons.map((l) => (
            <div key={l.title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-50 flex items-center gap-2">
                    <span aria-hidden="true" className="text-lg">{l.icon}</span>
                    <span>{l.title}</span>
                  </div>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-300">{l.blurb}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-[11px] sm:text-xs text-slate-200 list-disc list-inside">
                {l.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>

              <div className="mt-4">
                <Link
                  href={`/?chat=1&lesson=${encodeURIComponent(l.title)}`}
                  onClick={() => trackEvent("4lessons_chat_jump", { lesson: l.title })}
                  className="inline-flex items-center justify-center rounded-full border border-sky-400/70 bg-slate-950/40 px-4 py-1.5 text-[11px] font-semibold text-sky-300 hover:bg-slate-950 hover:text-sky-200 transition"
                >
                  Ask Z-Girl about {l.title}
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* How it fits */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
          <h2 className="text-base font-bold text-sky-200">How Z-Girl fits in</h2>
          <p className="text-[11px] sm:text-xs text-slate-300">
            Z-Girl is a fictional hero coach from The 4 Lessons universe. She helps users slow down, name what they feel,
            and choose one small next “hero move.”
          </p>
          <p className="text-[10px] text-slate-500">
            Note: The full website is being refreshed. In the meantime, this in-app page is your reliable “home base.”
          </p>
        </section>

        {/* Safety */}
        <section className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
          <h3 className="text-sm font-bold text-amber-100">Safety reminder</h3>
          <p className="mt-1 text-[11px] sm:text-xs text-amber-100/90">
            Z-Girl is not a therapist, doctor, or emergency service. If someone feels unsafe or in danger, contact a trusted adult
            and local emergency services (911 in the U.S.) right away.
          </p>
          <div className="mt-3">
            <Link
              href="/safety"
              onClick={() => trackEvent("nav_safety_from_4lessons")}
              className="text-[11px] text-amber-200 underline underline-offset-2 hover:text-amber-100"
            >
              View Safety & Use Guidelines
            </Link>
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Link
            href="/?chat=1"
            onClick={() => trackEvent("nav_back_to_chat_bottom")}
            className="text-[11px] text-sky-300 underline underline-offset-2 hover:text-sky-200"
          >
            ← Back to chat
          </Link>
          <Link
            href="/"
            onClick={() => trackEvent("nav_home_from_4lessons")}
            className="text-[11px] text-slate-400 underline underline-offset-2 hover:text-slate-200"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
