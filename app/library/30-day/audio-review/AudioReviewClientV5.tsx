"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getHeroWithin30DayTranscript,
  HERO_WITHIN_30_DAY,
  HERO_WITHIN_30_DAY_AUDIO_STATUS,
  HERO_WITHIN_30_DAY_VERSION,
} from "@/app/lib/hero-within-30-day";

type CandidateStatus = {
  day?: number;
  ready?: boolean;
  statusError?: string;
  asset?: {
    asset_id?: string;
    state?: string;
    checksum_sha256?: string;
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

type GateSummary = {
  ok?: boolean;
  reviewDays?: number[];
  readyCount?: number;
  activeDay?: number | null;
  statuses?: Record<string, CandidateStatus>;
  code?: string;
};

const REVIEW_DAYS = [1, 8, 15, 22, 30] as const;
const GATE_API = "/api/library/30-day/audio-review-gate";
const AUDIO_API = "/api/library/30-day/audio-candidate-v3";
const POLL_MS = 7_000;
const NOTES_KEY = "zgirl-30-day-audio-review-notes-v5";

function label(status?: CandidateStatus) {
  if (!status) return "CHECKING";
  if (status.ready) return "READY";
  if (status.statusError) return "STATUS ERROR";
  const job = status.job?.status || "";
  if (["QUEUED", "ROUTING", "RENDERING", "RETRYING", "FALLBACK", "QA"].includes(job)) return "RENDERING";
  if (["FAILED", "REJECTED"].includes(job)) return "FAILED";
  return "NOT STARTED";
}

export default function AudioReviewClientV5() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [summary, setSummary] = useState<GateSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [queueing, setQueueing] = useState(false);
  const [message, setMessage] = useState("Reading Greene-controlled staging…");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [listened, setListened] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollRef = useRef<number | null>(null);

  const item = HERO_WITHIN_30_DAY.find((day) => day.day === activeDay) || HERO_WITHIN_30_DAY[0];
  const transcript = useMemo(() => getHeroWithin30DayTranscript(item), [item]);
  const activeStatus = summary?.statuses?.[String(activeDay)];
  const activeReady = Boolean(activeStatus?.ready);
  const readyCount = summary?.readyCount ?? 0;
  const activeRenderDay = summary?.activeDay ?? null;
  const audioUrl = `${AUDIO_API}?day=${activeDay}&audio=1`;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(NOTES_KEY);
      if (saved) setNotes(JSON.parse(saved) as Record<number, string>);
    } catch {}
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = null;
  }, []);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(GATE_API, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as GateSummary | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.code || `gate_${response.status}`);
      setSummary(payload);

      const count = payload.readyCount ?? 0;
      if (count === REVIEW_DAYS.length) {
        stopPolling();
        setMessage("All five representative candidates are stored. Listen to each before any master or release decision.");
      } else if (payload.activeDay) {
        setMessage(`Day ${payload.activeDay} is rendering independently in Greene staging. You can leave this page and return later.`);
      } else if (count > 0) {
        setMessage(`${count} of 5 representative candidates are stored. Prepare the next track when ready.`);
      } else {
        setMessage("No representative candidate is shown as ready yet. Prepare the next track to create one governed render job.");
      }
      return payload;
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown_status_error";
      setMessage(`Status check failed (${detail}). No provider request was sent.`);
      return null;
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [stopPolling]);

  useEffect(() => {
    void refresh();
    return stopPolling;
  }, [refresh, stopPolling]);

  useEffect(() => {
    stopPolling();
    if (activeRenderDay) {
      pollRef.current = window.setInterval(() => void refresh(true), POLL_MS);
    }
    return stopPolling;
  }, [activeRenderDay, refresh, stopPolling]);

  useEffect(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [activeDay]);

  const prepareNext = useCallback(async () => {
    if (queueing || activeRenderDay || readyCount === REVIEW_DAYS.length) return;
    setQueueing(true);
    setMessage("Creating one governed render job…");
    try {
      const response = await fetch(GATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prepare-next" }),
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; day?: number; code?: string; alreadyRendering?: boolean; complete?: boolean } | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.code || `queue_${response.status}`);

      if (payload.complete) setMessage("The representative set is already complete.");
      else if (payload.alreadyRendering && payload.day) setMessage(`Day ${payload.day} is already rendering. No duplicate request was created.`);
      else if (payload.day) setMessage(`Day ${payload.day} was queued. The render continues in Greene staging without holding this iPhone request open.`);
      await refresh(true);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown_queue_error";
      setMessage(`Could not queue the next track (${detail}). No duplicate or fallback voice was created.`);
    } finally {
      setQueueing(false);
    }
  }, [activeRenderDay, queueing, readyCount, refresh]);

  const play = useCallback(async () => {
    if (!activeReady || !audioRef.current) return;
    try {
      if (audioRef.current.ended) audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setListened((days) => days.includes(activeDay) ? days : [...days, activeDay]);
      setMessage(`Playing stored Day ${activeDay}. This replay does not call Gemini.`);
    } catch {
      setMessage("The stored candidate is ready. Use the native iPhone Play control below if the large button is blocked.");
    }
  }, [activeDay, activeReady]);

  const nextButton = readyCount === REVIEW_DAYS.length
    ? "5-track set stored"
    : activeRenderDay
      ? `Rendering Day ${activeRenderDay}…`
      : queueing
        ? "Queuing…"
        : readyCount > 0
          ? "Prepare next review track"
          : "Prepare first review track";

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[#49d8c2]/25 bg-[#49d8c2]/[.05] p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Representative listening gate</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-black sm:text-3xl">One governed render at a time. Stored once. Replayed without regeneration.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">The previous browser-side five-track loop has been removed. The server now determines the next unfinished track and will not queue another while one is rendering.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#061521]/75 p-5 lg:min-w-[220px]">
            <p className="text-4xl font-black">{readyCount} / 5</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[.15em] text-slate-400">Stored candidates</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {REVIEW_DAYS.map((day) => {
            const status = summary?.statuses?.[String(day)];
            const state = label(status);
            const selected = activeDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${selected ? "border-[#49d8c2] bg-[#49d8c2]/10" : "border-white/10 bg-[#061521]/45"}`}
              >
                <span className="block text-sm font-black text-white">Day {day}{listened.includes(day) ? " ✓" : ""}</span>
                <span className={`mt-1 block text-[11px] font-black uppercase tracking-[.08em] ${state === "READY" ? "text-[#9cf2e3]" : state === "FAILED" || state === "STATUS ERROR" ? "text-amber-200" : state === "RENDERING" ? "text-sky-200" : "text-slate-500"}`}>{state}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => void prepareNext()} disabled={loading || queueing || Boolean(activeRenderDay) || readyCount === REVIEW_DAYS.length} className="button-primary disabled:cursor-not-allowed disabled:opacity-45">{nextButton}</button>
          <button type="button" onClick={() => void refresh()} className="button-secondary">Refresh status</button>
        </div>
        <p className={`mt-5 text-base font-black leading-7 ${message.includes("failed") || message.includes("Could not") ? "text-amber-200" : "text-[#9cf2e3]"}`}>{message}</p>
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Day {item.day} · {item.theme}</p>
          <h2 className="mt-2 font-display text-3xl font-black">{item.title}</h2>
          <p className="mt-3 leading-7 text-slate-300">{item.focus}</p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#061521]/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[.1em] ${activeReady ? "border-[#49d8c2]/40 text-[#9cf2e3]" : "border-amber-200/25 text-amber-100"}`}>
                {activeReady ? "Stored review candidate" : label(activeStatus)}
              </span>
              <span className="text-xs font-bold text-slate-500">Not a master</span>
            </div>

            {activeReady ? (
              <>
                <button type="button" onClick={() => void play()} className="button-primary mt-5">Play stored Day {activeDay}</button>
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#04151c] p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-[.12em] text-slate-400">iPhone-native audio control</p>
                  <audio ref={audioRef} key={audioUrl} src={audioUrl} controls playsInline preload="metadata" className="w-full" onPlay={() => setListened((days) => days.includes(activeDay) ? days : [...days, activeDay])} />
                </div>
              </>
            ) : (
              <p className="mt-5 text-sm leading-6 text-slate-400">No playable stored candidate is available for this day yet. Use the single queue button above; do not repeatedly tap individual generation controls.</p>
            )}
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div><dt className="font-black text-white">Job</dt><dd className="mt-1 break-all text-slate-400">{activeStatus?.job?.job_id || "—"} {activeStatus?.job?.status ? `· ${activeStatus.job.status}` : ""}</dd></div>
            <div><dt className="font-black text-white">Model</dt><dd className="mt-1 text-slate-400">{activeStatus?.job?.selected_model || "—"}</dd></div>
            <div><dt className="font-black text-white">Asset</dt><dd className="mt-1 break-all text-slate-400">{activeStatus?.asset?.asset_id || "—"}</dd></div>
            <div><dt className="font-black text-white">Audio SHA-256</dt><dd className="mt-1 break-all font-mono text-xs text-slate-500">{activeStatus?.asset?.checksum_sha256 || "—"}</dd></div>
            <div><dt className="font-black text-white">Rights</dt><dd className="mt-1 text-slate-400">{activeStatus?.asset?.rights_status || "Pending review"}</dd></div>
          </dl>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
          <label htmlFor="listening-notes-v5" className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Human listening notes · Day {activeDay}</label>
          <textarea id="listening-notes-v5" value={notes[activeDay] || ""} onChange={(event) => setNotes((current) => ({ ...current, [activeDay]: event.target.value }))} placeholder="Voice quality, pacing, warmth, pronunciation, pauses, anything to change…" className="mt-4 min-h-[180px] w-full rounded-2xl border border-white/10 bg-[#04151c] p-4 text-sm leading-6 text-white outline-none focus:border-[#49d8c2]" />
          <p className="mt-2 text-xs leading-5 text-slate-500">Notes stay on this device during preview. They are not approval until you explicitly approve.</p>

          <details className="mt-6 rounded-2xl border border-white/10 bg-[#061521]/50 p-4">
            <summary className="cursor-pointer text-sm font-black text-sky-200">Exact record-ready transcript</summary>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{transcript}</div>
          </details>

          <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/[.035] p-4 text-sm leading-6 text-slate-300">
            <p className="font-black text-amber-100">Release boundary</p>
            <p className="mt-2">Stored candidates remain review artifacts. Human listening, transcript match, rights review, accessibility/mastering QA, and explicit release approval are still required.</p>
          </div>
        </section>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <Link href="/library/30-day" className="font-black text-[#76ead6] underline">Back to learner preview</Link>
        <span>·</span>
        <span>{HERO_WITHIN_30_DAY_VERSION}</span>
        <span>·</span>
        <span>{HERO_WITHIN_30_DAY_AUDIO_STATUS}</span>
        <span>· resilient-review-v5</span>
      </div>
    </div>
  );
}
