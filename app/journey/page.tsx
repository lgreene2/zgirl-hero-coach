"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import {
  getDayTranscript,
  getJourneyTrack,
  JOURNEY_TRACKS,
  type JourneyLocale,
} from "@/app/lib/journey";
import { pickVoice, voiceMatchesLanguage } from "@/app/lib/voice";

type Entry = { reflection: string; strength: string; move: string };
type SavedVoiceSettings = {
  speechRate?: number;
  speechPitch?: number;
  preferredVoiceNames?: Record<string, string>;
};

const STORAGE_KEY = "zgirl-hero-within-7-day-v2";
const LANGUAGE_KEY = "zgirl-journey-language-v2-1";
const VOICE_SETTINGS_KEY = "zgirl-voice-settings-v3";
const emptyEntries = (): Entry[] =>
  JOURNEY_TRACKS[0].days.map(() => ({ reflection: "", strength: "", move: "" }));

function downloadText(contents: string, fileName: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function JourneyPage() {
  const [active, setActive] = useState(0);
  const [entries, setEntries] = useState<Entry[]>(emptyEntries);
  const [completed, setCompleted] = useState<boolean[]>(JOURNEY_TRACKS[0].days.map(() => false));
  const [locale, setLocale] = useState<JourneyLocale>("en-US");
  const [loaded, setLoaded] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const track = getJourneyTrack(locale);
  const days = track.days;
  const { ui } = track;

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { active?: number; entries?: Entry[]; completed?: boolean[] };
          if (Array.isArray(saved.entries) && saved.entries.length === 7) setEntries(saved.entries);
          if (Array.isArray(saved.completed) && saved.completed.length === 7) setCompleted(saved.completed);
          if (typeof saved.active === "number") setActive(Math.max(0, Math.min(6, saved.active)));
        }
        const savedLocale = window.localStorage.getItem(LANGUAGE_KEY);
        if (JOURNEY_TRACKS.some((candidate) => candidate.code === savedLocale)) {
          setLocale(savedLocale as JourneyLocale);
        }
      } catch {
        // A damaged local draft should never block a new journey.
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ active, entries, completed }));
      window.localStorage.setItem(LANGUAGE_KEY, locale);
    } catch {
      // Private browsing may prevent local storage; the journey still works in-session.
    }
  }, [active, completed, entries, loaded, locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = "en";
    };
  }, [locale]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    let activeEffect = true;
    const loadVoices = () => {
      if (!activeEffect) return;
      const available = synth.getVoices();
      if (available.length) setVoices(available);
    };
    loadVoices();
    synth.addEventListener?.("voiceschanged", loadVoices);
    const retries = [150, 500, 1200].map((delay) => window.setTimeout(loadVoices, delay));
    return () => {
      activeEffect = false;
      retries.forEach(window.clearTimeout);
      synth.removeEventListener?.("voiceschanged", loadVoices);
      synth.cancel();
    };
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const resetTimer = window.setTimeout(() => setIsSpeaking(false), 0);
    return () => window.clearTimeout(resetTimer);
  }, [active, locale]);

  const progress = completed.filter(Boolean).length;
  const current = days[active];
  const entry = entries[active];
  const canComplete = Boolean(entry.reflection.trim() && entry.move.trim());
  const spokenTranscript = useMemo(() => getDayTranscript(track, active), [active, track]);
  const matchingVoice = useMemo(
    () => voices.some((voice) => voiceMatchesLanguage(voice, locale)),
    [locale, voices]
  );

  const update = (key: keyof Entry, value: string) =>
    setEntries((all) =>
      all.map((item, index) => (index === active ? { ...item, [key]: value } : item))
    );

  const fullJourney = useMemo(
    () =>
      days
        .map(
          (day, index) =>
            `${ui.day.toUpperCase()} ${index + 1}: ${day.title}\n${ui.reflect}: ${entries[index].reflection || "—"}\n${ui.findStrength}: ${entries[index].strength || "—"}\n${ui.heroMove}: ${entries[index].move || "—"}`
        )
        .join("\n\n"),
    [days, entries, ui]
  );

  const completeDay = () => {
    setCompleted((all) => all.map((value, index) => (index === active ? true : value)));
    if (active < 6) setActive(active + 1);
  };

  const speakTranscript = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    let saved: SavedVoiceSettings = {};
    try {
      saved = JSON.parse(window.localStorage.getItem(VOICE_SETTINGS_KEY) || "{}") as SavedVoiceSettings;
    } catch {}

    const preferredName = saved.preferredVoiceNames?.[locale];
    const voice = pickVoice(voices, { lang: locale, preferredName, preferFemale: true });
    if (!voice) return;

    const utterance = new SpeechSynthesisUtterance(spokenTranscript);
    utterance.lang = locale;
    utterance.voice = voice;
    utterance.rate = Math.min(1.15, Math.max(0.75, saved.speechRate ?? 0.94));
    utterance.pitch = Math.min(1.25, Math.max(0.8, saved.speechPitch ?? 1.03));
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
  }, [isSpeaking, locale, spokenTranscript, voices]);

  const downloadTranscript = () =>
    downloadText(
      `${ui.transcriptTitle}\n${track.language}\n\n${spokenTranscript}\n`,
      `Z-Girl-Day-${active + 1}-${track.transcriptFileLabel}-Transcript.txt`
    );

  const downloadEntries = () =>
    downloadText(
      `${ui.title.toUpperCase()}\n\n${fullJourney}\n\n${ui.createdWith}`,
      `Z-Girl-7-Day-Hero-Within-${track.transcriptFileLabel}.txt`
    );

  const reset = () => {
    if (!window.confirm(ui.clearConfirm)) return;
    setEntries(emptyEntries());
    setCompleted(days.map(() => false));
    setActive(0);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_85%_20%,rgba(73,216,194,.13),transparent_30%)]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <p className="section-kicker">{ui.kicker}</p>
              <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">{ui.title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">{ui.intro}</p>
            </div>
            <label className="w-full max-w-xs text-sm font-black text-slate-200">
              <span className="mb-2 block">Journey language</span>
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value as JourneyLocale)}
                className="min-h-12 w-full rounded-2xl border border-white/15 bg-[#0b2030] px-4 text-white outline-none focus:border-[#49d8c2] focus:ring-4 focus:ring-[#49d8c2]/15"
                aria-label="Choose journey language"
              >
                {JOURNEY_TRACKS.map((option) => (
                  <option key={option.code} value={option.code}>{option.language}</option>
                ))}
              </select>
              <span className="mt-2 block text-xs font-medium text-slate-400">{ui.browserVoice}</span>
            </label>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="eyebrow">{progress} {ui.complete}</span>
            <div className="h-2 w-52 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={7} aria-valuenow={progress}>
              <div className="h-full bg-[#49d8c2] transition-all" style={{ width: `${(progress / 7) * 100}%` }} />
            </div>
            {progress === 7 && <span className="font-black text-[#76ead6]">{ui.journeyComplete} ✓</span>}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-12">
        <aside>
          <h2 className="mb-3 text-xs font-black uppercase tracking-[.18em] text-slate-400">{ui.daysLabel}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {days.map((day, index) => (
              <button
                key={`${locale}-${day.title}`}
                onClick={() => setActive(index)}
                aria-current={active === index ? "step" : undefined}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#49d8c2]/30 ${active === index ? "border-[#49d8c2]/60 bg-[#49d8c2]/10" : "border-white/10 bg-white/[.025] hover:border-white/25"}`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${completed[index] ? "bg-[#49d8c2] text-[#04151c]" : "bg-white/10 text-slate-300"}`}>{completed[index] ? "✓" : index + 1}</span>
                <span><span className="block text-xs font-bold text-slate-400">{ui.day} {index + 1}</span><span className="block font-black">{day.title}</span></span>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 p-4 text-xs leading-5 text-slate-400">{ui.safety} <Link href="/safety" className="font-black text-sky-300 underline">{ui.safetyLink}</Link></div>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 shadow-2xl shadow-black/20 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 pb-6">
            <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">{ui.day} {active + 1} / 7</p><h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">{current.title}</h2><p className="mt-3 text-base leading-7 text-slate-300">{current.focus}</p></div>
            <span className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-black text-slate-300">{ui.about} 8 {ui.minutes}</span>
          </div>

          <div className="mt-5 rounded-3xl border border-sky-300/20 bg-sky-300/[.045] p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={speakTranscript}
                disabled={!matchingVoice}
                aria-pressed={isSpeaking}
                className="button-secondary !min-h-0 !px-4 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSpeaking ? `■ ${ui.stop}` : `▶ ${ui.listen}`}
              </button>
              <button type="button" onClick={downloadTranscript} className="button-secondary !min-h-0 !px-4 !py-2 text-sm">{ui.downloadTranscript}</button>
              {isSpeaking && <span aria-live="polite" className="text-xs font-bold text-[#9cf2e3]">{ui.listening}</span>}
            </div>
            {!matchingVoice && voices.length > 0 && <p className="mt-3 text-xs leading-5 text-amber-200">{ui.voiceUnavailable}</p>}
            <details className="mt-4 border-t border-white/10 pt-4">
              <summary className="cursor-pointer text-sm font-black text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">View exact spoken transcript</summary>
              <p className="mt-2 text-xs text-slate-400">{ui.transcriptHelp}</p>
              <div className="mt-3 whitespace-pre-wrap rounded-2xl bg-[#04151c]/70 p-4 text-sm leading-7 text-slate-200">{spokenTranscript}</div>
            </details>
          </div>

          <div className="mt-7 space-y-7">
            <div><label htmlFor="journey-reflection" className="field-label">{ui.reflect} · {current.reflection}</label><textarea id="journey-reflection" className="reflection-field" value={entry.reflection} onChange={(event) => update("reflection", event.target.value)} /></div>
            <div><label htmlFor="journey-strength" className="field-label">{ui.findStrength} · {current.strength}</label><textarea id="journey-strength" className="reflection-field !min-h-[110px]" value={entry.strength} onChange={(event) => update("strength", event.target.value)} /></div>
            <div className="rounded-3xl border border-[#49d8c2]/25 bg-[#49d8c2]/[.06] p-5 sm:p-6"><label htmlFor="journey-move" className="field-label !text-[#9cf2e3]">{ui.heroMove} · {current.move}</label><textarea id="journey-move" className="reflection-field !min-h-[110px]" value={entry.move} onChange={(event) => update("move", event.target.value)} placeholder={ui.placeholder} /></div>
            <blockquote className="border-l-4 border-sky-400 pl-5 text-lg font-bold italic leading-8 text-slate-200">“{current.affirmation}”</blockquote>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex gap-2"><button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0} className="rounded-full px-4 py-3 text-sm font-black text-slate-300 disabled:opacity-30">← {ui.previous}</button><button onClick={() => setActive(Math.min(6, active + 1))} disabled={active === 6} className="rounded-full px-4 py-3 text-sm font-black text-slate-300 disabled:opacity-30">{ui.next} →</button></div>
            <button onClick={completeDay} disabled={!canComplete} className="button-primary disabled:cursor-not-allowed disabled:opacity-40">{completed[active] ? ui.updateContinue : ui.completeDay}</button>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-white/10 bg-white/[.03] p-5 sm:p-7">
          <div><h2 className="font-display text-xl font-black">{ui.keepTitle}</h2><p className="mt-1 text-sm text-slate-400">{ui.keepCopy}</p></div>
          <div className="flex flex-wrap gap-2"><button onClick={downloadEntries} className="button-secondary !min-h-0 !px-4 !py-2 text-sm">{ui.downloadEntries}</button><button onClick={() => window.print()} className="button-secondary !min-h-0 !px-4 !py-2 text-sm">{ui.print}</button><button onClick={reset} className="rounded-full px-4 py-2 text-sm font-black text-rose-300">{ui.clear}</button></div>
        </div>
      </section>
    </main>
  );
}
