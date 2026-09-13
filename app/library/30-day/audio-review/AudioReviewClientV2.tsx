"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getHeroWithin30DayTranscript,
  HERO_WITHIN_30_DAY,
  HERO_WITHIN_30_DAY_AUDIO_STATUS,
  HERO_WITHIN_30_DAY_VERSION,
} from "@/app/lib/hero-within-30-day";

type PlaybackState = "idle" | "preparing" | "waiting" | "playing" | "ready" | "busy" | "error";
type CandidateStatus = {
  configured?: boolean;
  enabled?: boolean;
  profile?: string;
  voice?: string;
  model?: string;
  trackCount?: number;
  ephemeralReplayCache?: boolean;
};

export default function AudioReviewClientV2() {
  const [active, setActive] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [status, setStatus] = useState<CandidateStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [lastTranscriptSha, setLastTranscriptSha] = useState<string | null>(null);
  const [lastCache, setLastCache] = useState<string | null>(null);
  const [listenedDays, setListenedDays] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const abortRef = useRef<AbortController | null>(null);
  const waitingTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const bufferDayRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioDayRef = useRef<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const item = HERO_WITHIN_30_DAY[active];
  const transcript = useMemo(() => getHeroWithin30DayTranscript(item), [item]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/library/30-day/audio-candidate-v2", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`candidate_status_${response.status}`);
        return (await response.json()) as CandidateStatus;
      })
      .then((payload) => mounted && setStatus(payload))
      .catch(() => mounted && setStatusError(true));
    return () => {
      mounted = false;
    };
  }, []);

  const stopPlaybackOnly = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioRef.current) audioRef.current.pause();
    setPlaybackState(
      (bufferRef.current && bufferDayRef.current === HERO_WITHIN_30_DAY[active].day) ||
      (audioRef.current?.src && audioDayRef.current === HERO_WITHIN_30_DAY[active].day)
        ? "ready"
        : "idle"
    );
  }, [active]);

  const clearCandidate = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (waitingTimerRef.current) window.clearTimeout(waitingTimerRef.current);
    waitingTimerRef.current = null;
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    bufferRef.current = null;
    bufferDayRef.current = null;
    audioDayRef.current = null;
    setPlaybackState("idle");
  }, []);

  useEffect(() => {
    clearCandidate();
  }, [active, clearCandidate]);

  useEffect(() => () => {
    clearCandidate();
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") void context.close();
  }, [clearCandidate]);

  const primeAudioContext = useCallback(async () => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    let context = audioContextRef.current;
    if (!context || context.state === "closed") {
      context = new AudioContextClass();
      audioContextRef.current = context;
    }
    if (context.state === "suspended") await context.resume();
    return context.state === "running" ? context : null;
  }, []);

  const startBuffer = useCallback((context: AudioContext, buffer: AudioBuffer) => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current.disconnect();
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    sourceRef.current = source;
    source.onended = () => {
      if (sourceRef.current === source) sourceRef.current = null;
      source.disconnect();
      setPlaybackState("ready");
    };
    setPlaybackState("playing");
    source.start(0);
  }, []);

  const replayReadyCandidate = useCallback(async () => {
    if (bufferRef.current && bufferDayRef.current === item.day) {
      const context = await primeAudioContext().catch(() => null);
      if (context) {
        startBuffer(context, bufferRef.current);
        return true;
      }
    }
    const audio = audioRef.current;
    if (audio?.src && audioDayRef.current === item.day) {
      try {
        audio.currentTime = 0;
        await audio.play();
        return true;
      } catch {
        setPlaybackState("ready");
        if (liveRegionRef.current) liveRegionRef.current.textContent = "Candidate is ready. Tap Play ready candidate again if iPhone blocked the first playback attempt.";
        return true;
      }
    }
    return false;
  }, [item.day, primeAudioContext, startBuffer]);

  const playCandidate = useCallback(async () => {
    if (playbackState === "playing") {
      stopPlaybackOnly();
      return;
    }
    if (playbackState === "ready" && (await replayReadyCandidate())) return;
    if (abortRef.current) return;
    if (!status?.enabled || !status?.configured) return;

    clearCandidate();
    const primedContext = primeAudioContext().catch(() => null);
    const controller = new AbortController();
    abortRef.current = controller;
    setPlaybackState("preparing");
    setLastModel(null);
    setLastTranscriptSha(null);
    setLastCache(null);
    if (liveRegionRef.current) liveRegionRef.current.textContent = `Preparing Day ${item.day} audio candidate.`;

    waitingTimerRef.current = window.setTimeout(() => {
      if (!controller.signal.aborted) {
        setPlaybackState("waiting");
        if (liveRegionRef.current) liveRegionRef.current.textContent = "The provider is taking longer than usual. Holding this single request open; no duplicate request was sent.";
      }
    }, 10_000);

    try {
      const response = await fetch("/api/library/30-day/audio-candidate-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: item.day }),
        cache: "no-store",
        signal: controller.signal,
      });
      if (waitingTimerRef.current) window.clearTimeout(waitingTimerRef.current);
      waitingTimerRef.current = null;

      if (!response.ok) {
        if (response.status === 429) throw new Error("candidate_busy");
        throw new Error(`candidate_${response.status}`);
      }

      const blob = await response.blob();
      if (!blob.size) throw new Error("candidate_empty");
      setLastModel(response.headers.get("X-ZGirl-Audio-Model"));
      setLastTranscriptSha(response.headers.get("X-ZGirl-Audio-Transcript-SHA256"));
      setLastCache(response.headers.get("X-ZGirl-Audio-Replay-Cache"));
      setListenedDays((days) => days.includes(item.day) ? days : [...days, item.day].sort((a, b) => a - b));

      const encoded = await blob.arrayBuffer();
      const context = await primedContext;
      if (context) {
        try {
          const decoded = await context.decodeAudioData(encoded.slice(0));
          if (controller.signal.aborted) return;
          bufferRef.current = decoded;
          bufferDayRef.current = item.day;
          abortRef.current = null;
          startBuffer(context, decoded);
          if (liveRegionRef.current) liveRegionRef.current.textContent = `Playing Day ${item.day} audio candidate.`;
          return;
        } catch {}
      }

      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audioDayRef.current = item.day;
      audio.src = url;
      audio.preload = "auto";
      audio.volume = 1;
      abortRef.current = null;
      audio.onplay = () => setPlaybackState("playing");
      audio.onended = () => setPlaybackState("ready");
      audio.onerror = () => setPlaybackState("error");

      try {
        await audio.play();
      } catch {
        setPlaybackState("ready");
        if (liveRegionRef.current) liveRegionRef.current.textContent = "Candidate generated successfully. iPhone blocked automatic playback; tap Play ready candidate. The audio will not be regenerated.";
      }
    } catch (error) {
      if (waitingTimerRef.current) window.clearTimeout(waitingTimerRef.current);
      waitingTimerRef.current = null;
      if (controller.signal.aborted) return;
      abortRef.current = null;
      const busy = error instanceof Error && error.message === "candidate_busy";
      setPlaybackState(busy ? "busy" : "error");
      if (liveRegionRef.current) liveRegionRef.current.textContent = busy ? "The provider is still busy after the controlled retry. No candidate was approved or persisted." : "The candidate could not be generated.";
    }
  }, [clearCandidate, item.day, playbackState, primeAudioContext, replayReadyCandidate, startBuffer, status?.configured, status?.enabled, stopPlaybackOnly]);

  const buttonLabel = playbackState === "preparing" ? "Preparing…" : playbackState === "waiting" ? "Still preparing…" : playbackState === "playing" ? "Stop candidate" : playbackState === "ready" ? "Play ready candidate" : playbackState === "busy" ? "Try candidate again" : "Listen to candidate";

  const statusMessage = playbackState === "waiting"
    ? "The provider is slow right now. This single request is still working in the background—do not tap again."
    : playbackState === "ready"
      ? "Candidate is already generated on this phone. Tap Play ready candidate; it will replay without calling the provider again."
      : playbackState === "busy"
        ? "The provider stayed busy after a controlled retry. No candidate was approved or persisted; wait about 30 seconds before trying again."
        : playbackState === "error"
          ? "The candidate could not play. No device voice was substituted."
          : null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Listening set</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Generate once, then replay locally on this page. A replay does not create a new provider request.</p>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {HERO_WITHIN_30_DAY.map((day, index) => (
                <button type="button" key={day.day} onClick={() => setActive(index)} aria-current={active === index ? "step" : undefined} className={`grid aspect-square place-items-center rounded-xl border text-xs font-black ${active === index ? "border-[#49d8c2] bg-[#49d8c2] text-[#04151c]" : listenedDays.includes(day.day) ? "border-[#49d8c2]/45 bg-[#49d8c2]/10 text-[#9cf2e3]" : "border-white/10 bg-white/[.025] text-slate-300"}`}>
                  {listenedDays.includes(day.day) ? "✓" : day.day}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5 text-sm leading-6 text-slate-300">
            <p className="font-black text-white">Candidate status</p>
            {statusError ? <p className="mt-2 text-rose-200">Could not read candidate status.</p> : !status ? <p className="mt-2">Checking preview configuration…</p> : (
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-3"><dt>Preview enabled</dt><dd className="font-black">{status.enabled ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between gap-3"><dt>Voice configured</dt><dd className="font-black">{status.configured ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between gap-3"><dt>Master approved</dt><dd className="font-black">No</dd></div>
                <div className="flex justify-between gap-3"><dt>Replay cache</dt><dd className="font-black">Temporary only</dd></div>
              </dl>
            )}
          </div>
          <Link href="/library/30-day" className="button-secondary block text-center">Back to learner preview</Link>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-8 lg:p-10">
          <div className="border-b border-white/10 pb-6">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Day {item.day} / 30 · {item.theme}</p>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">{item.title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-300">{item.focus}</p>
            <span className="mt-5 inline-block rounded-2xl border border-amber-300/20 bg-amber-300/[.06] px-4 py-3 text-xs font-black uppercase tracking-[.12em] text-amber-100">Candidate · not a master</span>
          </div>

          <div className="mt-6 rounded-3xl border border-[#49d8c2]/25 bg-[#49d8c2]/[.05] p-5 sm:p-6">
            <button type="button" onClick={() => void playCandidate()} disabled={!status?.enabled || !status?.configured || playbackState === "preparing" || playbackState === "waiting"} className="button-primary disabled:cursor-not-allowed disabled:opacity-40">{buttonLabel}</button>
            <p className="mt-4 text-sm font-bold text-slate-400">No autoplay · no device voice fallback · no chime</p>
            {statusMessage && <p className={`mt-4 text-base font-black leading-7 ${playbackState === "busy" || playbackState === "error" ? "text-amber-200" : "text-[#9cf2e3]"}`}>{statusMessage}</p>}
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Human listening notes</p>
              <textarea className="reflection-field mt-4 min-h-[170px]" value={notes[item.day] || ""} onChange={(event) => setNotes((all) => ({ ...all, [item.day]: event.target.value }))} placeholder="Voice quality, pacing, warmth, pronunciation, pauses, anything to change…" />
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Generation evidence</p>
              <dl className="mt-4 space-y-3 text-sm text-slate-300">
                <div><dt className="font-black text-white">Model</dt><dd className="break-all">{lastModel || "—"}</dd></div>
                <div><dt className="font-black text-white">Transcript SHA-256</dt><dd className="break-all text-xs">{lastTranscriptSha || "—"}</dd></div>
                <div><dt className="font-black text-white">Server replay cache</dt><dd>{lastCache || "—"}</dd></div>
              </dl>
            </div>
          </div>

          <details className="mt-7 rounded-3xl border border-white/10 bg-[#04151c]/60 p-5">
            <summary className="cursor-pointer font-black text-sky-200">Exact record-ready transcript</summary>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-200">{transcript}</div>
          </details>

          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={() => setActive((value) => Math.max(0, value - 1))} disabled={active === 0} className="button-secondary disabled:opacity-35">Previous day</button>
            <button type="button" onClick={() => setActive((value) => Math.min(29, value + 1))} disabled={active === 29} className="button-secondary disabled:opacity-35">Next day</button>
          </div>

          <div ref={liveRegionRef} className="sr-only" aria-live="polite" />
          <p className="mt-8 text-xs text-slate-500">{HERO_WITHIN_30_DAY_VERSION} · {HERO_WITHIN_30_DAY_AUDIO_STATUS} · candidate-v2</p>
        </section>
      </div>
    </div>
  );
}
