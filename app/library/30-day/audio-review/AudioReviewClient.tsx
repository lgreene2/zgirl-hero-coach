"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getHeroWithin30DayTranscript,
  HERO_WITHIN_30_DAY,
  HERO_WITHIN_30_DAY_AUDIO_STATUS,
  HERO_WITHIN_30_DAY_VERSION,
} from "@/app/lib/hero-within-30-day";

type PlaybackState =
  | "idle"
  | "preparing"
  | "retrying"
  | "playing"
  | "ready"
  | "busy"
  | "error";

type CandidateStatus = {
  configured?: boolean;
  enabled?: boolean;
  candidate?: boolean;
  releaseApproved?: boolean;
  profile?: string;
  voice?: string;
  model?: string;
  contentVersion?: string;
  trackCount?: number;
};

const RETRY_LIMIT = 1;
const DEFAULT_RETRY_MS = 5_000;
const MAX_RETRY_MS = 8_000;

function retryDelayMs(response: Response) {
  const seconds = Number(response.headers.get("Retry-After"));
  if (!Number.isFinite(seconds) || seconds <= 0) return DEFAULT_RETRY_MS;
  return Math.min(MAX_RETRY_MS, seconds * 1_000);
}

function waitForRetry(delayMs: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("audio_aborted"));
      return;
    }

    const onAbort = () => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(new Error("audio_aborted"));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export default function AudioReviewClient() {
  const [active, setActive] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [status, setStatus] = useState<CandidateStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [lastTranscriptSha, setLastTranscriptSha] = useState<string | null>(null);
  const [listenedDays, setListenedDays] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const abortRef = useRef<AbortController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const bufferDayRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const item = HERO_WITHIN_30_DAY[active];
  const transcript = useMemo(() => getHeroWithin30DayTranscript(item), [item]);

  useEffect(() => {
    let activeEffect = true;
    fetch("/api/library/30-day/audio-candidate", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`candidate_status_${response.status}`);
        return (await response.json()) as CandidateStatus;
      })
      .then((payload) => {
        if (activeEffect) setStatus(payload);
      })
      .catch(() => {
        if (activeEffect) setStatusError(true);
      });
    return () => {
      activeEffect = false;
    };
  }, []);

  const clearAudio = useCallback((resetState = true) => {
    abortRef.current?.abort();
    abortRef.current = null;

    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    bufferRef.current = null;
    bufferDayRef.current = null;
    if (resetState) setPlaybackState("idle");
  }, []);

  useEffect(() => {
    clearAudio();
  }, [active, clearAudio]);

  useEffect(
    () => () => {
      clearAudio(false);
      const context = audioContextRef.current;
      audioContextRef.current = null;
      if (context && context.state !== "closed") void context.close();
    },
    [clearAudio]
  );

  const primeAudioContext = useCallback(async () => {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
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
      try {
        sourceRef.current.stop();
      } catch {}
      sourceRef.current.disconnect();
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    sourceRef.current = source;
    source.onended = () => {
      if (sourceRef.current === source) sourceRef.current = null;
      source.disconnect();
      setPlaybackState("idle");
    };
    setPlaybackState("playing");
    source.start(0);
  }, []);

  const stopAudio = useCallback(() => {
    clearAudio();
    if (liveRegionRef.current) liveRegionRef.current.textContent = "Audio stopped.";
  }, [clearAudio]);

  const playCandidate = useCallback(async () => {
    if (playbackState === "playing") {
      stopAudio();
      return;
    }

    if (abortRef.current) {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "This candidate is still preparing. No duplicate request was sent.";
      }
      return;
    }

    if (!status?.enabled || !status?.configured) return;

    if (bufferRef.current && bufferDayRef.current === item.day) {
      const context = await primeAudioContext().catch(() => null);
      if (context) {
        startBuffer(context, bufferRef.current);
        return;
      }
    }

    clearAudio();
    const primedContext = primeAudioContext().catch(() => null);
    const controller = new AbortController();
    abortRef.current = controller;
    setPlaybackState("preparing");
    setLastModel(null);
    setLastTranscriptSha(null);
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Preparing Day ${item.day} audio candidate.`;
    }

    try {
      let response: Response | null = null;
      for (let attempt = 0; attempt <= RETRY_LIMIT; attempt += 1) {
        response = await fetch("/api/library/30-day/audio-candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day: item.day }),
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.ok) break;

        const errorBody = (await response.json().catch(() => null)) as
          | { code?: unknown }
          | null;
        const retryable =
          response.status === 429 &&
          (errorBody?.code === "AUDIO_CANDIDATE_PROVIDER_RATE_LIMITED" ||
            errorBody?.code === "AUDIO_CANDIDATE_RATE_LIMITED");
        if (!retryable || attempt >= RETRY_LIMIT) {
          throw new Error(response.status === 429 ? "candidate_busy" : `candidate_${response.status}`);
        }

        setPlaybackState("retrying");
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = "The voice service is busy. Retrying this candidate once.";
        }
        await waitForRetry(retryDelayMs(response), controller.signal);
      }

      if (!response?.ok) throw new Error("candidate_busy");

      const blob = await response.blob();
      if (!blob.size) throw new Error("candidate_empty");

      setLastModel(response.headers.get("X-ZGirl-Audio-Model"));
      setLastTranscriptSha(response.headers.get("X-ZGirl-Audio-Transcript-SHA256"));
      setListenedDays((days) =>
        days.includes(item.day) ? days : [...days, item.day].sort((a, b) => a - b)
      );

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
          if (liveRegionRef.current) {
            liveRegionRef.current.textContent = `Playing Day ${item.day} audio candidate.`;
          }
          return;
        } catch {
          // Persistent media-element fallback below. No device speech fallback is used.
        }
      }

      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.preload = "auto";
      audio.volume = 1;
      abortRef.current = null;
      audio.onplay = () => setPlaybackState("playing");
      audio.onended = () => setPlaybackState("idle");
      audio.onerror = () => setPlaybackState("error");

      try {
        await audio.play();
      } catch {
        setPlaybackState("ready");
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      abortRef.current = null;
      const busy = error instanceof Error && error.message === "candidate_busy";
      setPlaybackState(busy ? "busy" : "error");
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = busy
          ? "The voice service is busy. Try this candidate again later."
          : "The candidate could not be generated. No device voice was substituted.";
      }
    }
  }, [
    clearAudio,
    item.day,
    playbackState,
    primeAudioContext,
    startBuffer,
    status?.configured,
    status?.enabled,
    stopAudio,
  ]);

  const buttonLabel =
    playbackState === "preparing"
      ? "Preparing…"
      : playbackState === "retrying"
        ? "Retrying…"
        : playbackState === "playing"
          ? "Stop candidate"
          : playbackState === "ready"
            ? "Play ready candidate"
            : playbackState === "busy"
              ? "Try candidate again"
              : "Listen to candidate";

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Listening set</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Review each day independently. A candidate is generated only after you press Listen. Nothing autoplays and no candidate is stored as a master.
            </p>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {HERO_WITHIN_30_DAY.map((day, index) => (
                <button
                  type="button"
                  key={day.day}
                  onClick={() => setActive(index)}
                  aria-current={active === index ? "step" : undefined}
                  className={`grid aspect-square place-items-center rounded-xl border text-xs font-black transition ${
                    active === index
                      ? "border-[#49d8c2] bg-[#49d8c2] text-[#04151c]"
                      : listenedDays.includes(day.day)
                        ? "border-[#49d8c2]/45 bg-[#49d8c2]/10 text-[#9cf2e3]"
                        : "border-white/10 bg-white/[.025] text-slate-300"
                  }`}
                >
                  {listenedDays.includes(day.day) ? "✓" : day.day}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5 text-sm leading-6 text-slate-300">
            <p className="font-black text-white">Candidate status</p>
            {statusError ? (
              <p className="mt-2 text-rose-200">Could not read candidate status.</p>
            ) : !status ? (
              <p className="mt-2">Checking preview configuration…</p>
            ) : (
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-3"><dt>Preview enabled</dt><dd className="font-black">{status.enabled ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between gap-3"><dt>Voice configured</dt><dd className="font-black">{status.configured ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between gap-3"><dt>Master approved</dt><dd className="font-black">No</dd></div>
                <div className="flex justify-between gap-3"><dt>Tracks</dt><dd className="font-black">{status.trackCount ?? 30}</dd></div>
              </dl>
            )}
          </div>

          <Link href="/library/30-day" className="button-secondary block text-center">Back to learner preview</Link>
        </aside>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 pb-6">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Day {item.day} / 30 · {item.theme}</p>
              <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">{item.title}</h2>
              <p className="mt-3 text-base leading-7 text-slate-300">{item.focus}</p>
            </div>
            <span className="rounded-2xl border border-amber-300/20 bg-amber-300/[.06] px-4 py-3 text-xs font-black uppercase tracking-[.12em] text-amber-100">Candidate · not a master</span>
          </div>

          <div className="mt-6 rounded-3xl border border-[#49d8c2]/25 bg-[#49d8c2]/[.05] p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void playCandidate()}
                disabled={
                  !status?.enabled ||
                  !status?.configured ||
                  playbackState === "preparing" ||
                  playbackState === "retrying"
                }
                className="button-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {buttonLabel}
              </button>
              {playbackState === "playing" && (
                <button type="button" onClick={stopAudio} className="button-secondary">Stop voice</button>
              )}
              <span className="text-xs font-bold text-slate-400">No autoplay · no device voice fallback · no chime</span>
            </div>

            {playbackState === "busy" && (
              <p className="mt-3 text-sm font-bold text-amber-200">The provider is temporarily busy. This candidate was not approved or stored; try again later.</p>
            )}
            {playbackState === "error" && (
              <p className="mt-3 text-sm font-bold text-rose-200">Candidate generation failed. No alternate robotic voice was substituted.</p>
            )}
            {playbackState === "ready" && (
              <p className="mt-3 text-sm font-bold text-sky-200">The media candidate is ready. Tap the same button again to play it.</p>
            )}

            <div ref={liveRegionRef} className="sr-only" aria-live="polite" />
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Human listening notes</p>
              <textarea
                value={notes[item.day] || ""}
                onChange={(event) => setNotes((all) => ({ ...all, [item.day]: event.target.value }))}
                placeholder="Voice quality, pacing, warmth, pronunciation, pauses, anything to change…"
                className="reflection-field mt-3 !min-h-[180px]"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">Notes stay only in this page session. They are not a release decision.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Generation evidence</p>
              <dl className="mt-3 space-y-3 text-sm text-slate-300">
                <div><dt className="text-xs font-black text-slate-500">Profile</dt><dd className="mt-1 break-all">{status?.profile || "—"}</dd></div>
                <div><dt className="text-xs font-black text-slate-500">Voice</dt><dd className="mt-1">{status?.voice || "—"}</dd></div>
                <div><dt className="text-xs font-black text-slate-500">Last model</dt><dd className="mt-1 break-all">{lastModel || "—"}</dd></div>
                <div><dt className="text-xs font-black text-slate-500">Transcript SHA-256</dt><dd className="mt-1 break-all font-mono text-[11px]">{lastTranscriptSha || "Generated after listening"}</dd></div>
              </dl>
            </div>
          </div>

          <details className="mt-6 rounded-3xl border border-white/10 bg-[#04151c]/60 p-5">
            <summary className="cursor-pointer text-sm font-black text-sky-200">View exact spoken candidate transcript</summary>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-200">{transcript}</div>
          </details>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
            <div className="flex gap-3">
              <button type="button" onClick={() => setActive((value) => Math.max(0, value - 1))} disabled={active === 0} className="button-secondary disabled:opacity-35">Previous</button>
              <button type="button" onClick={() => setActive((value) => Math.min(29, value + 1))} disabled={active === 29} className="button-secondary disabled:opacity-35">Next</button>
            </div>
            <p className="text-xs text-slate-500">{HERO_WITHIN_30_DAY_VERSION} · {HERO_WITHIN_30_DAY_AUDIO_STATUS}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
