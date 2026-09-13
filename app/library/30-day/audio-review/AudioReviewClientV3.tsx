"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getHeroWithin30DayTranscript,
  HERO_WITHIN_30_DAY,
  HERO_WITHIN_30_DAY_AUDIO_STATUS,
  HERO_WITHIN_30_DAY_VERSION,
} from "@/app/lib/hero-within-30-day";

type ReviewState = "checking" | "idle" | "queueing" | "rendering" | "ready" | "playing" | "failed" | "error";

type CandidateStatus = {
  ok?: boolean;
  day?: number;
  ready?: boolean;
  persistentReviewCandidate?: boolean;
  profile?: string;
  contentVersion?: string;
  releaseApproved?: boolean;
  asset?: {
    asset_id?: string;
    title?: string;
    state?: string;
    storage_bucket?: string;
    storage_path?: string;
    mime_type?: string;
    checksum_sha256?: string;
    version?: string;
    rights_status?: string;
    updated_at?: string;
  } | null;
  job?: {
    job_id?: string;
    status?: string;
    selected_provider_id?: string;
    selected_model?: string;
    updated_at?: string;
  } | null;
};

const API = "/api/library/30-day/audio-candidate-v3";
const REVIEW_SET = new Set([1, 8, 15, 22, 30]);
const POLL_MS = 5_000;
const NOTES_KEY = "zgirl-30-day-audio-review-notes-v3";

export default function AudioReviewClientV3() {
  const [active, setActive] = useState(0);
  const [reviewState, setReviewState] = useState<ReviewState>("checking");
  const [status, setStatus] = useState<CandidateStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [listenedDays, setListenedDays] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollRef = useRef<number | null>(null);

  const item = HERO_WITHIN_30_DAY[active];
  const transcript = useMemo(() => getHeroWithin30DayTranscript(item), [item]);
  const audioUrl = `${API}?day=${item.day}&audio=1`;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NOTES_KEY);
      if (raw) setNotes(JSON.parse(raw) as Record<number, string>);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = null;
  }, []);

  const readStatus = useCallback(async (day: number, quiet = false) => {
    if (!quiet) setReviewState("checking");
    try {
      const response = await fetch(`${API}?day=${day}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`status_${response.status}`);
      const payload = (await response.json()) as CandidateStatus;
      setStatus(payload);

      if (payload.ready) {
        stopPolling();
        setReviewState("ready");
        setStatusMessage("A persistent review candidate is ready in Greene-controlled staging storage. Press Play when you are ready to listen.");
        return payload;
      }

      const jobStatus = payload.job?.status;
      if (["QUEUED", "ROUTING", "RENDERING", "RETRYING", "FALLBACK", "QA"].includes(jobStatus || "")) {
        setReviewState("rendering");
        setStatusMessage("The render is running independently of this page. You may keep this page open or return later; do not create duplicate requests while the job is rendering.");
      } else if (["FAILED", "REJECTED"].includes(jobStatus || "")) {
        stopPolling();
        setReviewState("failed");
        setStatusMessage("The provider did not complete this candidate. Nothing was promoted to a master. You can prepare the same day again without losing the governed job history.");
      } else {
        setReviewState("idle");
        setStatusMessage("No stored review candidate exists for this day yet. Preparing creates one governed render job instead of making you wait on a live playback request.");
      }
      return payload;
    } catch {
      stopPolling();
      setReviewState("error");
      setStatusMessage("The review system could not read the stored candidate status. No device voice was substituted.");
      return null;
    }
  }, [stopPolling]);

  const beginPolling = useCallback((day: number) => {
    stopPolling();
    pollRef.current = window.setInterval(() => {
      void readStatus(day, true);
    }, POLL_MS);
  }, [readStatus, stopPolling]);

  useEffect(() => {
    stopPolling();
    audioRef.current?.pause();
    setStatus(null);
    setStatusMessage(null);
    void readStatus(item.day).then((payload) => {
      const jobStatus = payload?.job?.status;
      if (!payload?.ready && ["QUEUED", "ROUTING", "RENDERING", "RETRYING", "FALLBACK", "QA"].includes(jobStatus || "")) {
        beginPolling(item.day);
      }
    });
    return stopPolling;
  }, [active, beginPolling, item.day, readStatus, stopPolling]);

  const prepareCandidate = useCallback(async () => {
    if (reviewState === "queueing" || reviewState === "rendering") return;
    setReviewState("queueing");
    setStatusMessage("Creating a governed render job…");
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: item.day }),
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as { alreadyReady?: boolean; queued?: boolean; code?: string } | null;
      if (!response.ok) throw new Error(payload?.code || `prepare_${response.status}`);
      if (payload?.alreadyReady) {
        await readStatus(item.day, true);
        return;
      }
      setReviewState("rendering");
      setStatusMessage("Render queued in Greene-controlled staging. The provider can recover and finish without holding this iPhone request open. This page will check the governed job status automatically.");
      beginPolling(item.day);
      await readStatus(item.day, true);
    } catch {
      setReviewState("error");
      setStatusMessage("The render job could not be queued. No candidate was approved or substituted.");
    }
  }, [beginPolling, item.day, readStatus, reviewState]);

  const playStoredCandidate = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !status?.ready) return;
    if (!audio.paused) {
      audio.pause();
      setReviewState("ready");
      return;
    }
    try {
      if (audio.ended) audio.currentTime = 0;
      await audio.play();
      setReviewState("playing");
      setListenedDays((days) => days.includes(item.day) ? days : [...days, item.day].sort((a, b) => a - b));
      setStatusMessage("Playing the stored review candidate. Replay uses Greene storage and does not call the voice provider again.");
    } catch {
      setReviewState("ready");
      setStatusMessage("The stored candidate is ready. If iPhone blocks the large Play button, use the native audio Play control directly below it.");
    }
  }, [item.day, status?.ready]);

  const buttonLabel = reviewState === "checking"
    ? "Checking stored candidate…"
    : reviewState === "queueing"
      ? "Queuing render…"
      : reviewState === "rendering"
        ? "Rendering in Greene storage…"
        : reviewState === "playing"
          ? "Pause candidate"
          : reviewState === "ready"
            ? "Play stored candidate"
            : reviewState === "failed"
              ? "Prepare candidate again"
              : "Prepare candidate";

  const buttonDisabled = reviewState === "checking" || reviewState === "queueing" || reviewState === "rendering";
  const buttonAction = status?.ready ? playStoredCandidate : prepareCandidate;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Listening set</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Days 1, 8, 15, 22, and 30 are the first representative listening gate. All 30 days remain available for later QA.</p>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {HERO_WITHIN_30_DAY.map((day, index) => (
                <button
                  type="button"
                  key={day.day}
                  onClick={() => setActive(index)}
                  aria-current={active === index ? "step" : undefined}
                  aria-label={`Open Day ${day.day}: ${day.title}${REVIEW_SET.has(day.day) ? ", recommended review day" : ""}`}
                  className={`relative grid aspect-square place-items-center rounded-xl border text-xs font-black transition ${
                    active === index
                      ? "border-[#49d8c2] bg-[#49d8c2] text-[#04151c]"
                      : listenedDays.includes(day.day)
                        ? "border-[#49d8c2]/45 bg-[#49d8c2]/10 text-[#9cf2e3]"
                        : REVIEW_SET.has(day.day)
                          ? "border-amber-200/35 bg-amber-200/[.06] text-amber-100"
                          : "border-white/10 bg-white/[.025] text-slate-300"
                  }`}
                >
                  {listenedDays.includes(day.day) ? "✓" : day.day}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-slate-500">Gold outline = representative listening gate · ✓ = listened on this device</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5 text-sm leading-6 text-slate-300">
            <p className="font-black text-white">Governed candidate status</p>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3"><dt>Storage</dt><dd className="text-right font-black">Greene staging</dd></div>
              <div className="flex justify-between gap-3"><dt>Job</dt><dd className="text-right font-black">{status?.job?.status || "—"}</dd></div>
              <div className="flex justify-between gap-3"><dt>Asset</dt><dd className="text-right font-black">{status?.asset?.state || "—"}</dd></div>
              <div className="flex justify-between gap-3"><dt>Rights</dt><dd className="text-right font-black">{status?.asset?.rights_status || "Pending review"}</dd></div>
              <div className="flex justify-between gap-3"><dt>Master approved</dt><dd className="text-right font-black">No</dd></div>
            </dl>
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
              onClick={() => void buttonAction()}
              disabled={buttonDisabled}
              className="button-primary disabled:cursor-not-allowed disabled:opacity-45"
            >
              {buttonLabel}
            </button>
            <p className="mt-4 text-sm font-bold text-slate-400">No autoplay · no device voice fallback · no chime · no regeneration on replay</p>
            {statusMessage && (
              <p className={`mt-4 text-base font-black leading-7 ${reviewState === "failed" || reviewState === "error" ? "text-amber-200" : "text-[#9cf2e3]"}`}>{statusMessage}</p>
            )}

            {status?.ready && (
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="mb-3 text-sm font-black text-white">iPhone playback control</p>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  preload="metadata"
                  className="w-full"
                  onPlay={() => {
                    setReviewState("playing");
                    setListenedDays((days) => days.includes(item.day) ? days : [...days, item.day].sort((a, b) => a - b));
                  }}
                  onPause={() => setReviewState("ready")}
                  onEnded={() => setReviewState("ready")}
                  onError={() => {
                    setReviewState("error");
                    setStatusMessage("The stored candidate could not be read from Greene staging. No device voice was substituted.");
                  }}
                >
                  Your browser does not support the audio element.
                </audio>
                <p className="mt-2 text-xs leading-5 text-slate-500">This player reads the same persisted review candidate. Pressing Play here never creates another TTS request.</p>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Generation evidence</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="font-black text-white">Model</dt><dd className="mt-1 break-words text-slate-400">{status?.job?.selected_model || "Not generated yet"}</dd></div>
                <div><dt className="font-black text-white">Stored audio SHA-256</dt><dd className="mt-1 break-all text-xs text-slate-500">{status?.asset?.checksum_sha256 || "—"}</dd></div>
                <div><dt className="font-black text-white">Asset ID</dt><dd className="mt-1 break-all text-xs text-slate-500">{status?.asset?.asset_id || "—"}</dd></div>
                <div><dt className="font-black text-white">Content version</dt><dd className="mt-1 text-slate-400">{status?.contentVersion || HERO_WITHIN_30_DAY_VERSION}</dd></div>
              </dl>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
              <label htmlFor="listening-notes" className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Human listening notes</label>
              <textarea
                id="listening-notes"
                value={notes[item.day] || ""}
                onChange={(event) => setNotes((current) => ({ ...current, [item.day]: event.target.value }))}
                placeholder="Voice quality, pacing, warmth, pronunciation, pauses, anything to change…"
                className="mt-4 min-h-[170px] w-full rounded-2xl border border-white/10 bg-[#04151c] p-4 text-sm leading-6 text-white outline-none focus:border-[#49d8c2] focus:ring-4 focus:ring-[#49d8c2]/10"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">Notes stay in this browser during preview. They are not an approval until you explicitly approve the candidate.</p>
            </div>
          </div>

          <details className="mt-6 rounded-3xl border border-white/10 bg-white/[.02] p-5">
            <summary className="cursor-pointer text-sm font-black text-sky-200">Exact record-ready transcript</summary>
            <div className="mt-4 whitespace-pre-wrap rounded-2xl bg-[#04151c]/70 p-4 text-sm leading-7 text-slate-200">{transcript}</div>
          </details>

          <div className="mt-6 rounded-3xl border border-amber-300/15 bg-amber-300/[.035] p-5 text-sm leading-6 text-slate-300">
            <p className="font-black text-amber-100">Release boundary</p>
            <p className="mt-2">A stored candidate is still only a review artifact. Human listening, transcript match, voice rights, accessibility/mastering QA, and explicit release approval remain required before any candidate becomes a master.</p>
          </div>

          <p className="mt-6 text-xs text-slate-600">{HERO_WITHIN_30_DAY_VERSION} · {HERO_WITHIN_30_DAY_AUDIO_STATUS} · persistent-review-v3</p>
        </section>
      </div>
    </div>
  );
}
