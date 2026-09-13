"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getHeroWithin30DayTranscript, HERO_WITHIN_30_DAY } from "@/app/lib/hero-within-30-day";

type CandidateStatus = {
  day?: number;
  ready?: boolean;
  statusError?: string;
  attempt?: { failureClass?: "QUOTA_EXHAUSTED" | "PROVIDER_BUSY" | "GENERATION_FAILED" | null } | null;
  asset?: { state?: string; checksum_sha256?: string; rights_status?: string } | null;
  job?: { status?: string; selected_model?: string } | null;
};

type HumanReviewDay = {
  day?: number;
  approved?: boolean;
  decision?: string;
  reviewStatus?: string;
  reviewMatchesCurrentAudio?: boolean;
};

type GateSummary = {
  ok?: boolean;
  readyCount?: number;
  activeDay?: number | null;
  quotaBlockedDay?: number | null;
  statuses?: Record<string, CandidateStatus>;
  humanGate?: {
    approvedCount?: number;
    expansionUnlocked?: boolean;
    reviewDays?: HumanReviewDay[];
  };
  code?: string;
};

const REVIEW_DAYS = [1, 8, 15, 22, 30] as const;
const GATE_API = "/api/library/30-day/audio-review-gate";
const AUDIO_API = "/api/library/30-day/audio-candidate-v3";
const POLL_MS = 7000;
const NOTES_KEY = "zgirl-30-day-audio-review-notes-v7";

function stateLabel(status?: CandidateStatus) {
  if (!status) return "CHECKING";
  if (status.ready) return "READY";
  if (status.asset?.state === "CHANGES_REQUESTED") return "RE-RENDER REQUIRED";
  if (status.statusError) return "STATUS ERROR";
  if (status.attempt?.failureClass === "QUOTA_EXHAUSTED") return "QUOTA BLOCKED";
  if (["QUEUED", "ROUTING", "RENDERING", "QA"].includes(status.job?.status || "")) return "RENDERING";
  if (status.job?.status === "FAILED") return "FAILED";
  return "NOT STARTED";
}

function stateClass(state: string) {
  if (state === "READY") return "text-[#9cf2e3]";
  if (state === "RENDERING") return "text-sky-200";
  if (state === "RE-RENDER REQUIRED" || state === "QUOTA BLOCKED") return "text-amber-200";
  if (state === "FAILED" || state === "STATUS ERROR") return "text-rose-200";
  return "text-slate-500";
}

export default function AudioReviewClientV7() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [summary, setSummary] = useState<GateSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [queueing, setQueueing] = useState(false);
  const [message, setMessage] = useState("Reading Greene-controlled staging…");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const item = HERO_WITHIN_30_DAY.find((entry) => entry.day === activeDay) || HERO_WITHIN_30_DAY[0];
  const transcript = useMemo(() => getHeroWithin30DayTranscript(item), [item]);
  const status = summary?.statuses?.[String(activeDay)];
  const human = summary?.humanGate?.reviewDays?.find((entry) => entry.day === activeDay);
  const ready = Boolean(status?.ready);
  const readyCount = summary?.readyCount ?? 0;
  const approvedCount = summary?.humanGate?.approvedCount ?? 0;
  const activeRenderDay = summary?.activeDay ?? null;
  const quotaBlockedDay = summary?.quotaBlockedDay ?? null;
  const audioUrl = `${AUDIO_API}?day=${activeDay}&audio=1`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTES_KEY);
      if (saved) setNotes(JSON.parse(saved) as Record<number, string>);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {}
  }, [notes]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(GATE_API, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as GateSummary | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.code || `gate_${response.status}`);
      setSummary(payload);
      const count = payload.readyCount ?? 0;
      const approved = payload.humanGate?.approvedCount ?? 0;
      if (payload.activeDay) setMessage(`Day ${payload.activeDay} is rendering with the locked Day 1/8 voice route.`);
      else if (payload.quotaBlockedDay) setMessage(`Day ${payload.quotaBlockedDay} is quota-blocked. Voice continuity is protected: Gemini 2.5 fallback is disabled.`);
      else if (count === 5) setMessage(`All five candidates are stored. Human voice approvals are ${approved}/5.`);
      else setMessage(`${count} of 5 candidates are currently ready. Day 1 and Day 8 are the approved voice baseline.`);
      return payload;
    } catch (error) {
      setMessage(`Status check failed (${error instanceof Error ? error.message : "unknown"}). No provider request was sent.`);
      return null;
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return stopPolling;
  }, [refresh, stopPolling]);

  useEffect(() => {
    stopPolling();
    if (activeRenderDay) timerRef.current = window.setInterval(() => void refresh(true), POLL_MS);
    return stopPolling;
  }, [activeRenderDay, refresh, stopPolling]);

  useEffect(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [activeDay]);

  const queue = useCallback(async (action: "prepare-next" | "retry-blocked") => {
    if (queueing || activeRenderDay) return;
    if (action === "retry-blocked" && !quotaBlockedDay) return;
    if (action === "retry-blocked" && !window.confirm(`Retry Day ${quotaBlockedDay} once with the locked Gemini 3.1 / Sulafat voice route? Cross-model fallback is disabled to protect voice continuity.`)) return;

    setQueueing(true);
    setMessage(action === "retry-blocked" ? `Retrying Day ${quotaBlockedDay} with the locked voice route…` : "Queuing the next voice-lock review candidate…");
    try {
      const response = await fetch(GATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; day?: number; code?: string; complete?: boolean; alreadyRendering?: boolean } | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.code || `queue_${response.status}`);
      if (payload.complete) setMessage("The representative render set is already complete.");
      else if (payload.alreadyRendering && payload.day) setMessage(`Day ${payload.day} is already rendering. No duplicate was created.`);
      else if (payload.day) setMessage(`Day ${payload.day} is queued with the Day 1/8 voice-lock profile. No Gemini 2.5 fallback will be used.`);
      await refresh(true);
    } catch (error) {
      setMessage(`Could not queue the track (${error instanceof Error ? error.message : "unknown"}). Voice continuity safeguards remained in place.`);
    } finally {
      setQueueing(false);
    }
  }, [activeRenderDay, queueing, quotaBlockedDay, refresh]);

  const play = useCallback(async () => {
    if (!ready || !audioRef.current) return;
    try {
      if (audioRef.current.ended) audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setMessage(`Playing stored Day ${activeDay}. Replay makes no Gemini request.`);
    } catch {
      setMessage("The stored candidate is ready. Use the native Play control below if the large button is blocked.");
    }
  }, [activeDay, ready]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[#49d8c2]/25 bg-[#49d8c2]/[.05] p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Voice continuity gate · Day 1 + Day 8 baseline</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-black sm:text-3xl">The preferred Z-Girl voice is now locked to the Day 1 and Day 8 review baseline.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Day 1 and Day 8 were explicitly approved as matching. Day 15 and Day 22 were rejected for voice drift. New representative renders use Gemini 3.1 TTS with Sulafat only; the Gemini 2.5 fallback is disabled because it changed the voice.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#061521]/75 p-5 lg:min-w-[220px]">
            <p className="text-4xl font-black">{readyCount} / 5</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[.15em] text-slate-400">Ready now</p>
            <p className="mt-3 text-lg font-black text-[#9cf2e3]">{approvedCount} / 5</p>
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">Human approved</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {REVIEW_DAYS.map((day) => {
            const candidate = summary?.statuses?.[String(day)];
            const state = stateLabel(candidate);
            const review = summary?.humanGate?.reviewDays?.find((entry) => entry.day === day);
            const reviewLabel = review?.approved ? "VOICE APPROVED" : review?.decision === "REJECTED" ? "VOICE REJECTED" : "REVIEW PENDING";
            return (
              <button key={day} type="button" onClick={() => setActiveDay(day)} className={`rounded-2xl border px-4 py-3 text-left transition ${activeDay === day ? "border-[#49d8c2] bg-[#49d8c2]/10" : "border-white/10 bg-[#061521]/45"}`}>
                <span className="block text-sm font-black text-white">Day {day}</span>
                <span className={`mt-1 block text-[11px] font-black uppercase tracking-[.08em] ${stateClass(state)}`}>{state}</span>
                <span className={`mt-1 block text-[10px] font-black uppercase tracking-[.08em] ${review?.approved ? "text-emerald-200" : review?.decision === "REJECTED" ? "text-rose-200" : "text-slate-600"}`}>{reviewLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {quotaBlockedDay ? (
            <button type="button" onClick={() => void queue("retry-blocked")} disabled={loading || queueing || Boolean(activeRenderDay)} className="button-primary disabled:cursor-not-allowed disabled:opacity-45">{queueing ? "Retrying…" : `Retry Day ${quotaBlockedDay} · locked voice`}</button>
          ) : (
            <button type="button" onClick={() => void queue("prepare-next")} disabled={loading || queueing || Boolean(activeRenderDay) || readyCount === 5} className="button-primary disabled:cursor-not-allowed disabled:opacity-45">{activeRenderDay ? `Rendering Day ${activeRenderDay}…` : queueing ? "Queuing…" : readyCount === 5 ? "Representative renders complete" : "Prepare next voice-lock track"}</button>
          )}
          <button type="button" onClick={() => void refresh()} className="button-secondary">Refresh status</button>
        </div>
        <p className="mt-5 text-base font-black leading-7 text-[#9cf2e3]">{message}</p>
      </section>

      <section className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Day {item.day} · {item.theme}</p>
          <h3 className="mt-2 font-display text-3xl font-black">{item.title}</h3>
          <p className="mt-3 text-lg leading-8 text-slate-300">{item.focus}</p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#061521]/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">{ready ? "Stored review candidate" : "Candidate not ready"}</p>
                <p className="mt-1 text-xs text-slate-400">{status?.job?.selected_model || "Gemini 3.1 voice-lock route"}</p>
              </div>
              {ready ? <button type="button" onClick={() => void play()} className="button-primary">Play stored Day {activeDay}</button> : null}
            </div>
            {ready ? <audio ref={audioRef} src={audioUrl} controls preload="none" className="mt-4 w-full" /> : null}
            <dl className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
              <div><dt className="font-black uppercase tracking-[.1em]">Voice decision</dt><dd className="mt-1 text-slate-200">{human?.approved ? "Approved" : human?.decision === "REJECTED" ? "Rejected — rerender required" : "Pending"}</dd></div>
              <div><dt className="font-black uppercase tracking-[.1em]">Audio checksum</dt><dd className="mt-1 break-all text-slate-200">{status?.asset?.checksum_sha256 || "—"}</dd></div>
            </dl>
          </div>

          <details className="mt-6 rounded-3xl border border-white/10 bg-[#061521]/55 p-5">
            <summary className="cursor-pointer font-black">Exact canonical transcript</summary>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">{transcript}</p>
          </details>
        </article>

        <aside className="rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Human listening notes</p>
          <p className="mt-3 text-sm leading-6 text-slate-400">These notes stay on this device. Formal approval is recorded separately from your explicit review decision.</p>
          <textarea value={notes[activeDay] || ""} onChange={(event) => setNotes((current) => ({ ...current, [activeDay]: event.target.value }))} placeholder="Voice identity, warmth, pacing, pronunciation, pauses, anything to change…" className="mt-5 min-h-44 w-full rounded-3xl border border-white/10 bg-[#061521] p-4 text-sm leading-6 text-white outline-none focus:border-[#49d8c2]" />
          <div className="mt-6 rounded-3xl border border-[#49d8c2]/20 bg-[#49d8c2]/[.05] p-5 text-sm leading-6 text-slate-300">
            <p className="font-black text-[#9cf2e3]">Current voice baseline</p>
            <p className="mt-2">Day 1 + Day 8 · Gemini 3.1 Flash TTS · Sulafat · same-speaker continuity required.</p>
            <p className="mt-2">Cross-model fallback is off. A quota error pauses the render instead of changing Z-Girl’s voice.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
