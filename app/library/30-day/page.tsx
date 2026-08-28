"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import {
  getHeroWithin30DayTranscript,
  HERO_WITHIN_30_DAY,
  HERO_WITHIN_30_DAY_AUDIO_STATUS,
  HERO_WITHIN_30_DAY_VERSION,
} from "@/app/lib/hero-within-30-day";

type Entry = {
  reflection: string;
  strength: string;
  move: string;
};

type SavedState = {
  active?: number;
  completed?: boolean[];
  entries?: Entry[];
};

const STORAGE_KEY = "zgirl-hero-within-30-day-foundation-v01";

const emptyEntries = (): Entry[] =>
  HERO_WITHIN_30_DAY.map(() => ({ reflection: "", strength: "", move: "" }));

function downloadText(contents: string, fileName: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function HeroWithin30DayLibraryPage() {
  const [active, setActive] = useState(0);
  const [entries, setEntries] = useState<Entry[]>(emptyEntries);
  const [completed, setCompleted] = useState<boolean[]>(HERO_WITHIN_30_DAY.map(() => false));
  const [loaded, setLoaded] = useState(false);

  const item = HERO_WITHIN_30_DAY[active];
  const entry = entries[active];
  const progress = completed.filter(Boolean).length;
  const canComplete = Boolean(entry.reflection.trim() && entry.move.trim());
  const transcript = useMemo(() => getHeroWithin30DayTranscript(item), [item]);
  const weekGroups = useMemo(
    () => Array.from(new Set(HERO_WITHIN_30_DAY.map((day) => day.week))),
    []
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedState;
        if (Array.isArray(saved.entries) && saved.entries.length === HERO_WITHIN_30_DAY.length) {
          setEntries(saved.entries);
        }
        if (Array.isArray(saved.completed) && saved.completed.length === HERO_WITHIN_30_DAY.length) {
          setCompleted(saved.completed);
        }
        if (typeof saved.active === "number") {
          setActive(Math.max(0, Math.min(HERO_WITHIN_30_DAY.length - 1, saved.active)));
        }
      }
    } catch {
      // A damaged local draft should never block a new journey.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ active, completed, entries }));
    } catch {
      // The experience still works in-session when storage is unavailable.
    }
  }, [active, completed, entries, loaded]);

  const updateEntry = (key: keyof Entry, value: string) => {
    setEntries((all) =>
      all.map((current, index) =>
        index === active ? { ...current, [key]: value } : current
      )
    );
  };

  const completeDay = () => {
    setCompleted((all) => all.map((value, index) => (index === active ? true : value)));
    if (active < HERO_WITHIN_30_DAY.length - 1) setActive(active + 1);
  };

  const downloadTranscript = () => {
    downloadText(
      `Z-GIRL · 30-DAY HERO WITHIN AUDIO JOURNEY\nDAY ${item.day}: ${item.title}\n${item.theme}\n\n${transcript}\n\nAudio status: ${HERO_WITHIN_30_DAY_AUDIO_STATUS}\nContent version: ${HERO_WITHIN_30_DAY_VERSION}\n`,
      `Z-Girl-30-Day-Hero-Within-Day-${String(item.day).padStart(2, "0")}-Transcript.txt`
    );
  };

  const downloadEntries = () => {
    const body = HERO_WITHIN_30_DAY.map((day, index) => {
      const saved = entries[index];
      return [
        `DAY ${day.day}: ${day.title}`,
        `Theme: ${day.theme}`,
        `Reflection: ${saved.reflection || "—"}`,
        `Strength: ${saved.strength || "—"}`,
        `Hero Move: ${saved.move || "—"}`,
        `Complete: ${completed[index] ? "Yes" : "No"}`,
      ].join("\n");
    }).join("\n\n");

    downloadText(
      `Z-GIRL · 30-DAY HERO WITHIN JOURNEY\nPRIVATE LOCAL COPY\n\n${body}\n\nCreated with Z-Girl: The Hero Within Reflection System.\n`,
      "Z-Girl-30-Day-Hero-Within-My-Journey.txt"
    );
  };

  const clearJourney = () => {
    if (!window.confirm("Clear all 30 days from this device?")) return;
    setEntries(emptyEntries());
    setCompleted(HERO_WITHIN_30_DAY.map(() => false));
    setActive(0);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_15%,rgba(73,216,194,.16),transparent_34%)]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <p className="section-kicker">Membership foundation · private preview</p>
              <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                30-Day Hero Within Journey
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                A month of guided reflection built from the same Hero Within method as the free 7-Day Journey:
                pause, name the moment, find strength, choose one achievable Hero Move, and reflect forward.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-3xl border border-amber-300/25 bg-amber-300/[.06] p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Audio release gate</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                The 30-day scripts and learner experience are ready for review. Studio audio is intentionally locked until the exact English master, transcript match, voice rights, music rights, accessibility mix, and human listening gate are approved.
              </p>
              <p className="mt-3 text-xs font-bold text-amber-100">No autoplay · no provisional audio presented as a master</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="eyebrow">{progress} / 30 complete</span>
            <div className="h-2 w-64 max-w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={30} aria-valuenow={progress}>
              <div className="h-full bg-[#49d8c2] transition-all" style={{ width: `${(progress / 30) * 100}%` }} />
            </div>
            {progress === 30 && <span className="font-black text-[#76ead6]">Journey complete ✓</span>}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[320px_1fr] lg:px-12">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-4">
            <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">30-day path</p>
            <div className="mt-4 space-y-5">
              {weekGroups.map((week) => {
                const days = HERO_WITHIN_30_DAY.filter((day) => day.week === week);
                return (
                  <div key={week}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-[.15em] text-[#76ead6]">
                        {week <= 4 ? `Week ${week}` : "Integration"}
                      </p>
                      <span className="text-[11px] font-bold text-slate-500">{days[0].theme}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {days.map((day) => {
                        const index = day.day - 1;
                        return (
                          <button
                            type="button"
                            key={day.day}
                            onClick={() => setActive(index)}
                            aria-label={`Open day ${day.day}: ${day.title}`}
                            aria-current={active === index ? "step" : undefined}
                            className={`grid aspect-square min-h-9 place-items-center rounded-xl border text-xs font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#49d8c2]/30 ${
                              active === index
                                ? "border-[#49d8c2] bg-[#49d8c2] text-[#04151c]"
                                : completed[index]
                                  ? "border-[#49d8c2]/40 bg-[#49d8c2]/10 text-[#9cf2e3]"
                                  : "border-white/10 bg-white/[.025] text-slate-300 hover:border-white/25"
                            }`}
                          >
                            {completed[index] ? "✓" : day.day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 p-5 text-sm leading-6 text-slate-300">
            <p className="font-black text-white">Privacy by default</p>
            <p className="mt-2">Your entries stay in this browser on this device. This preview does not require an account and does not send your written reflection to staff dashboards.</p>
          </div>

          <div className="rounded-3xl border border-white/10 p-5 text-sm leading-6 text-slate-300">
            This journey supports reflection and self-improvement. It is not therapy or emergency support. <Link href="/safety" className="font-black text-sky-300 underline">Safety guidance</Link>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 pb-6">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Day {item.day} / 30 · {item.theme}</p>
              <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">{item.title}</h2>
              <p className="mt-3 text-base leading-7 text-slate-300">{item.focus}</p>
            </div>
            <span className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-black text-slate-300">About 4–6 minutes</span>
          </div>

          <div className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/[.04] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-amber-100">Studio audio pending approval</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Review the exact record-ready transcript now. Audio will unlock only from the approved master.</p>
              </div>
              <button type="button" onClick={downloadTranscript} className="button-secondary !min-h-0 !px-4 !py-2 text-sm">Download transcript</button>
            </div>
            <details className="mt-4 border-t border-white/10 pt-4">
              <summary className="cursor-pointer text-sm font-black text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">View record-ready transcript</summary>
              <div className="mt-3 whitespace-pre-wrap rounded-2xl bg-[#04151c]/70 p-4 text-sm leading-7 text-slate-200">{transcript}</div>
            </details>
          </div>

          <div className="mt-7 space-y-7">
            <div>
              <label htmlFor="journey-30-reflection" className="field-label">Reflect · {item.reflection}</label>
              <textarea id="journey-30-reflection" className="reflection-field" value={entry.reflection} onChange={(event) => updateEntry("reflection", event.target.value)} />
            </div>

            <div>
              <label htmlFor="journey-30-strength" className="field-label">Find the Strength · {item.strength}</label>
              <textarea id="journey-30-strength" className="reflection-field !min-h-[110px]" value={entry.strength} onChange={(event) => updateEntry("strength", event.target.value)} />
            </div>

            <div className="rounded-3xl border border-[#49d8c2]/25 bg-[#49d8c2]/[.06] p-5 sm:p-6">
              <label htmlFor="journey-30-move" className="field-label !text-[#9cf2e3]">Hero Move · {item.move}</label>
              <textarea id="journey-30-move" className="reflection-field !min-h-[110px]" value={entry.move} onChange={(event) => updateEntry("move", event.target.value)} placeholder="Write the action in your own words…" />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Affirmation</p>
              <p className="mt-2 text-lg font-bold leading-8 text-white">{item.affirmation}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setActive((value) => Math.max(0, value - 1))} disabled={active === 0} className="button-secondary disabled:cursor-not-allowed disabled:opacity-35">Previous</button>
              <button type="button" onClick={() => setActive((value) => Math.min(29, value + 1))} disabled={active === 29} className="button-secondary disabled:cursor-not-allowed disabled:opacity-35">Next</button>
            </div>
            <button type="button" onClick={completeDay} disabled={!canComplete} className="button-primary disabled:cursor-not-allowed disabled:opacity-35">
              {completed[active] ? "Update & continue" : "Complete this day"}
            </button>
          </div>
        </section>
      </div>

      <section className="border-t border-white/10 bg-[#041019]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="section-kicker">Keep your journey</p>
              <h2 className="font-display text-2xl font-black">Your private progress stays under your control.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Download a plain-text copy or print this page to PDF. Clear the local journey whenever you choose.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={downloadEntries} className="button-secondary">Download my entries</button>
              <button type="button" onClick={() => window.print()} className="button-secondary">Print / save PDF</button>
              <button type="button" onClick={clearJourney} className="button-secondary">Clear journey</button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6 text-sm text-slate-400">
            <span>Want the free starting experience?</span>
            <Link href="/journey" className="font-black text-[#76ead6] underline">Open the 7-Day Hero Within Journey</Link>
            <span className="ml-auto text-xs">{HERO_WITHIN_30_DAY_VERSION} · {HERO_WITHIN_30_DAY_AUDIO_STATUS}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
