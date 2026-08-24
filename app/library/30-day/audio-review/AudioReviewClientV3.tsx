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
  | "waiting"
  | "ready"
  | "playing"
  | "paused"
  | "busy"
  | "error";

type CandidateStatus = {
  configured?: boolean;
  enabled?: boolean;
  profile?: string;
  voice?: string;
  model?: string;
  trackCount?: number;
  ephemeralReplayCache?: boolean;
};

export default function AudioReviewClientV3() {
  const [active, setActive] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [status, setStatus] = useState<CandidateStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDay, setAudioDay] = useState<number | null>(null);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [lastTranscriptSha, setLastTranscriptSha] = useState<string | null>(null);
  const [lastCache, setLastCache] = useState<string | null>(null);
  const [listenedDays, setListenedDays] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const abortRef = useRef<AbortController | null>(null);
  const waitingTimerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  const item = HERO_WITHIN_30_DAY[active];
  const transcript = useMemo(() => getHeroWithin30DayTranscript(item), [item]);
  const candidateReady = Boolean(audioUrl && audioDay === item.day);

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

  const releaseLocalCandidate = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (waitingTimerRef.current) window.clearTimeout(waitingTimerRef.current);
    waitingTimerRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setAudioDay(null);
    setPlaybackState("idle");
  }, []);

  useEffect(() => {
    releaseLocalCandidate();
  }, [active, releaseLocalCandidate]);

  useEffect(() => () => releaseLocalCandidate(), [releaseLocalCandidate]);

  const prepareCandidate = useCallback(async () => {
    if (abortRef.current || !status?.enabled || !status?.configured) return;
    if (candidateReady) {
      setPlaybackState("ready");
      return;
    }

    releaseLocalCandidate();
    const controller = new AbortController();
    abortRef.current = controller;
    setPlaybackState("preparing");
    setLastModel(null);
    setLastTranscriptSha(null);
    setLastCache(null);
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Preparing Day ${item.day}. Playback will wait for a separate tap after the candidate is ready.`;
    }

    waitingTimerRef.current = window.setTimeout(() => {
      if (!controller.signal.aborted) {
        setPlaybackState("waiting");
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = "The provider is taking longer than usual. Keep this page open; no second request is being sent.";
        }
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

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioDay(item.day);
      setLastModel(response.headers.get("X-ZGirl-Audio-Model"));
      setLastTranscriptSha(response.headers.get("X-ZGirl-Audio-Transcript-SHA256"));
      setLastCache(response.headers.get("X-ZGirl-Audio-Replay-Cache"));
      abortRef.current = null;
      setPlaybackState("ready");
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = `Day ${item.day} is ready. Tap Play candidate to hear it.`;
      }
    } catch (error) {
      if (waitingTimerRef.current) window.clearTimeout(waitingTimerRef.current);
      waitingTimerRef.current = null;
      if (controller.signal.aborted) return;
      abortRef.current = null;
      const busy = error instanceof Error && error.message === "candidate_busy";
      setPlaybackState(busy ? "busy" : "error");
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = busy
          ? "The provider stayed busy. Wait briefly, then prepare this candidate again."
          : "The candidate could not be prepared.";
      }
    }
  }, [candidateReady, item.day, releaseLocalCandidate, status?.configured, status?.enabled]);

  const playReadyCandidate = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !candidateReady) return;

    try {
      if (audio.ended || audio.currentTime >= audio.duration) audio.currentTime = 0;
      await audio.play();
      setPlaybackState("playing");
    } catch {
      setPlaybackState("error");
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "iPhone blocked playback. Use the native audio Play control shown below.";
      }
    }
  }, [candidateReady]);

  const pauseCandidate = useCallback(() => {
    audioRef.current?.pause();
    setPlaybackState(candidateReady ? "paused" : "idle");
  }, [candidateReady]);

  const mainAction = useCallback(() => {
    if (playbackState === "playing") {
      pauseCandidate();
      return;
    }
    if (candidateReady) {
      void playReadyCandidate();
      return;
    }
    void prepareCandidate();
  }, [candidateReady, pauseCandidate, playReadyCandidate, playbackState, prepareCandidate]);

  const actionLabel =
    playbackState === "preparing"
      ? "Preparing…"
      : playbackState === "waiting"
        ? "Still preparing…"
        : playbackState === "playing"
          ? "Pause candidate"
          : candidateReady
            ? playbackState === "paused"
              ? "Resume candidate"
              : "Play candidate"
            : playbackState === "busy"
              ? "Prepare candidate again"
              : "Prepare candidate";

  const statusMessage =
    playbackState === "waiting"
      ? "The provider is slow right now. Keep this page open. When generation finishes, the button will change to Play candidate."
      : candidateReady && playbackState !== "playing"
        ? "Candidate ready. Playback is intentionally a separate tap so iPhone treats Play as a fresh user action. No new provider request will be made."
        : playbackState === "playing"
          ? "Playing the generated candidate from this page."
          : playbackState === "busy"
            ? "The provider stayed busy after its controlled retry. Nothing was approved or persisted; wait about 30 seconds before preparing again."
            : playbackState === "error"
              ? "Playback did not start. Use the native iPhone audio control below; the candidate will not be regenerated."
              : null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Listening set</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Step 1 prepares one candidate. Step 2 plays it with a fresh iPhone tap. No autoplay and no regeneration on Play.
            </p>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {HERO_WITHIN_30_DAY.map((day, index) => (
                <button
                  type="button"
                  key={day.day}
                  onClick={() => setActive(index)}
                  aria-current={active === index ? "step" : undefined}
                  className={`grid aspect-square place-items-center rounded-xl border text-xs font-black ${
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
                <div className="flex justify-between gap-3"><dt>Playback</dt><dd className="font-black">Explicit tap</dd></div>
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
            <button
              type="button"
              onClick={mainAction}
              disabled={!status?.enabled || !status?.configured || playbackState === "preparing" || playbackState === "waiting"}
              className="button-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {actionLabel}
            </button>
            <p className="mt-4 text-sm font-bold text-slate-400">No autoplay · no device voice fallback · no chime</p>
            {statusMessage && (
              <p className={`mt-4 text-base font-black leading-7 ${playbackState === "busy" || playbackState === "error" ? "text-amber-200" : "text-[#9cf2e3]"}`}>
                {statusMessage}
              </p>
            )}

            {candidateReady && audioUrl && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#061521] p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[.15em] text-slate-300">iPhone-native playback fallback</p>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full"
                  onPlay={() => {
                    setPlaybackState("playing");
                    setListenedDays((days) => days.includes(item.day) ? days : [...days, item.day].sort((a, b) => a - b));
                  }}
                  onPause={() => setPlaybackState((current) => current === "playing" ? "paused" : current)}
                  onEnded={() => setPlaybackState("ready")}
                  onError={() => setPlaybackState("error")}
                >
                  Your browser does not support audio playback.
                </audio>
                <p className="mt-3 text-xs leading-5 text-slate-400">If the large Play candidate button does not start sound, press Play in this native control. This uses the same already-generated candidate.</p>
              </div>
            )}
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
              <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Generation evidence</p>
              <dl className="mt-4 space-y-3 text-sm text-slate-300">
                <div><dt className="font-black text-white">Model</dt><dd className="mt-1 break-words">{lastModel || "Not generated yet"}</dd></div>
                <div><dt className="font-black text-white">Replay cache</dt><dd className="mt-1">{lastCache || "—"}</dd></div>
                <div><dt className="font-black text-white">Transcript SHA-256</dt><dd className="mt-1 break-all font-mono text-xs">{lastTranscriptSha || "—"}</dd></div>
              </dl>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
              <label htmlFor="audio-notes-v3" className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Human listening notes</label>
              <textarea
                id="audio-notes-v3"
                value={notes[item.day] || ""}
                onChange={(event) => setNotes((current) => ({ ...current, [item.day]: event.target.value }))}
                className="mt-4 min-h-36 w-full rounded-2xl border border-white/10 bg-[#061521] p-4 text-sm leading-6 text-white outline-none focus:border-[#49d8c2]"
                placeholder="Voice quality, pacing, warmth, pronunciation, pauses, anything to change…"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">Notes stay in this page state only and are not an approval record.</p>
            </div>
          </div>

          <details className="mt-7 rounded-3xl border border-white/10 bg-white/[.025] p-5">
            <summary className="cursor-pointer font-black text-sky-200">View exact transcript</summary>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{transcript}</div>
          </details>

          <div className="mt-7 border-t border-white/10 pt-5 text-xs leading-6 text-slate-500">
            {HERO_WITHIN_30_DAY_VERSION} · {HERO_WITHIN_30_DAY_AUDIO_STATUS} · candidate playback v3
          </div>
        </section>
      </div>

      <div ref={liveRegionRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
