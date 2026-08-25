"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getHeroWithin30DayTranscript,
  HERO_WITHIN_30_DAY,
  HERO_WITHIN_30_DAY_AUDIO_STATUS,
  HERO_WITHIN_30_DAY_VERSION,
} from "@/app/lib/hero-within-30-day";

type AttemptStatus = {
  attemptNumber?: number | null;
  attemptStatus?: string | null;
  errorCode?: string | null;
  failureClass?: "QUOTA_EXHAUSTED" | "PROVIDER_BUSY" | "GENERATION_FAILED" | null;
};

type CandidateStatus = {
  day?: number;
  ready?: boolean;
  statusError?: string;
  attempt?: AttemptStatus | null;
  asset?: {
    asset_id?: string;
    state?: string;
    checksum_sha256?: string;
    rights_status?: string;
  } | null;
  job?: {
    job_id?: string;
    status?: string;
    selected_provider_id?: string;
    selected_model?: string;
  } | null;
};

type HumanReviewDay = {
  day?: number;
  assetId?: string;
  ready?: boolean;
  approved?: boolean;
  decision?: string;
  reviewStatus?: string;
  reviewedAt?: string | null;
};

type HumanGate = {
  reviewDays?: HumanReviewDay[];
  readyCount?: number;
  approvedCount?: number;
  allReady?: boolean;
  allApproved?: boolean;
  expansionUnlocked?: boolean;
};

type GateSummary = {
  ok?: boolean;
  readyCount?: number;
  activeDay?: number | null;
  quotaBlockedDay?: number | null;
  failedDay?: number | null;
  statuses?: Record<string, CandidateStatus>;
  humanGate?: HumanGate;
  code?: string;
};

const REVIEW_DAYS = [1, 8, 15, 22, 30] as const;
const GATE_API = "/api/library/30-day/audio-review-gate";
const EXPANSION_API = "/api/library/30-day/audio-expansion-gate";
const AUDIO_API = "/api/library/30-day/audio-candidate-v3";
const NOTES_KEY = "zgirl-30-day-audio-review-notes-v6";
const POLL_MS = 7000;

function stateLabel(status?: CandidateStatus) {
  if (!status) return "CHECKING";
  if (status.ready) return "READY";
  if (status.statusError) return "STATUS ERROR";
  if (status.attempt?.failureClass === "QUOTA_EXHAUSTED") return "QUOTA BLOCKED";
  const job = status.job?.status || "";
  if (["QUEUED", "ROUTING", "RENDERING", "RETRYING", "FALLBACK", "QA"].includes(job)) return "RENDERING";
  if (["FAILED", "REJECTED"].includes(job)) return "FAILED";
  return "NOT STARTED";
}

function stateClass(state: string) {
  if (state === "READY") return "text-[#9cf2e3]";
  if (state === "RENDERING") return "text-sky-200";
  if (state === "QUOTA BLOCKED") return "text-amber-200";
  if (state === "FAILED" || state === "STATUS ERROR") return "text-rose-200";
  return "text-slate-500";
}

export default function AudioReviewClientV6() {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [summary, setSummary] = useState<GateSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [queueing, setQueueing] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [message, setMessage] = useState("Reading Greene-controlled staging…");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [listened, setListened] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const item = HERO_WITHIN_30_DAY.find((day) => day.day === activeDay) || HERO_WITHIN_30_DAY[0];
  const transcript = useMemo(() => getHeroWithin30DayTranscript(item), [item]);
  const status = summary?.statuses?.[String(activeDay)];
  const ready = Boolean(status?.ready);
  const readyCount = summary?.readyCount ?? 0;
  const activeRenderDay = summary?.activeDay ?? null;
  const quotaBlockedDay = summary?.quotaBlockedDay ?? null;
  const humanGate = summary?.humanGate;
  const approvedCount = humanGate?.approvedCount ?? 0;
  const expansionUnlocked = Boolean(humanGate?.expansionUnlocked);
  const activeHumanReview = humanGate?.reviewDays?.find((review) => review.day === activeDay);
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
      if (count === 5 && payload.humanGate?.expansionUnlocked) setMessage("Representative render and human listening gates are complete. The remaining-track expansion lane is unlocked, but still produces review candidates only.");
      else if (count === 5) setMessage(`All five representative candidates are stored. Human listening evidence is ${approved}/5; expansion remains locked until explicit approval is recorded.`);
      else if (payload.activeDay) setMessage(`Day ${payload.activeDay} is rendering in Greene staging. The page may be left open or revisited later.`);
      else if (payload.quotaBlockedDay) setMessage(`Day ${payload.quotaBlockedDay} hit the primary-model quota. One deliberate retry can use the governed fallback route instead of repeating the same failing call.`);
      else setMessage(`${count} of 5 representative candidates are stored. Prepare the next unfinished track when ready.`);
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
    if (queueing || activeRenderDay || readyCount === 5) return;
    if (action === "retry-blocked" && !quotaBlockedDay) return;
    if (action === "retry-blocked" && !window.confirm(`Retry Day ${quotaBlockedDay} once with fallback-capable routing? The primary model is attempted first; if quota/transient failure occurs, the worker may try Gemini 2.5 TTS once. No master is created automatically.`)) return;

    setQueueing(true);
    setMessage(action === "retry-blocked" ? `Queuing one fallback-capable Day ${quotaBlockedDay} retry…` : "Creating one governed render job…");
    try {
      const response = await fetch(GATE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; day?: number; code?: string; complete?: boolean; alreadyRendering?: boolean } | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.code || `queue_${response.status}`);
      if (payload.complete) setMessage("The representative set is already complete.");
      else if (payload.alreadyRendering && payload.day) setMessage(`Day ${payload.day} is already rendering. No duplicate was created.`);
      else if (payload.day) setMessage(`Day ${payload.day} is queued. The worker may use the fallback TTS model if the primary route is quota-blocked.`);
      await refresh(true);
    } catch (error) {
      setMessage(`Could not queue the track (${error instanceof Error ? error.message : "unknown"}). No device voice or uncontrolled retry was used.`);
    } finally {
      setQueueing(false);
    }
  }, [activeRenderDay, queueing, quotaBlockedDay, readyCount, refresh]);

  const expandNext = useCallback(async () => {
    if (!expansionUnlocked || expanding) return;
    if (!window.confirm("Queue one remaining 30-Day review candidate? This does not approve a master, release audio, or batch all 25 tracks at once.")) return;
    setExpanding(true);
    setMessage("Checking the governed expansion lane and selecting one unfinished day…");
    try {
      const response = await fetch(EXPANSION_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; day?: number; complete?: boolean; alreadyRendering?: boolean; code?: string; storedCount?: number } | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.code || `expansion_${response.status}`);
      if (payload.complete) setMessage("All 30 review candidates are already stored. No new render was created.");
      else if (payload.alreadyRendering && payload.day) setMessage(`Day ${payload.day} is already rendering. No duplicate was created.`);
      else if (payload.day) setMessage(`Day ${payload.day} was queued through the approved expansion lane. It remains IN REVIEW after render.`);
    } catch (error) {
      setMessage(`Expansion stayed locked or could not queue (${error instanceof Error ? error.message : "unknown"}). No unapproved render was created.`);
    } finally {
      setExpanding(false);
    }
  }, [expanding, expansionUnlocked]);

  const play = useCallback(async () => {
    if (!ready || !audioRef.current) return;
    try {
      if (audioRef.current.ended) audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setListened((days) => days.includes(activeDay) ? days : [...days, activeDay]);
      setMessage(`Playing stored Day ${activeDay}. No Gemini request is made for replay.`);
    } catch {
      setMessage("The stored candidate is ready. Use the native iPhone Play control below if the large button is blocked.");
    }
  }, [activeDay, ready]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[#49d8c2]/25 bg-[#49d8c2]/[.05] p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Representative listening gate · resilient routing v6</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-black sm:text-3xl">Stored once. Replayed without regeneration. One controlled cross-model fallback.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">The worker no longer burns repeated attempts against the same quota-limited model. It tries Gemini 3.1 TTS once, then may try Gemini 2.5 TTS once if the first route is quota-blocked or transiently unavailable. Every result remains a review candidate.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#061521]/75 p-5 lg:min-w-[220px]">
            <p className="text-4xl font-black">{readyCount} / 5</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[.15em] text-slate-400">Stored candidates</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {REVIEW_DAYS.map((day) => {
            const candidate = summary?.statuses?.[String(day)];
            const state = stateLabel(candidate);
            const human = humanGate?.reviewDays?.find((review) => review.day === day);
            return (
              <button key={day} type="button" onClick={() => setActiveDay(day)} className={`rounded-2xl border px-4 py-3 text-left transition ${activeDay === day ? "border-[#49d8c2] bg-[#49d8c2]/10" : "border-white/10 bg-[#061521]/45"}`}>
                <span className="block text-sm font-black text-white">Day {day}{listened.includes(day) ? " ✓" : ""}</span>
                <span className={`mt-1 block text-[11px] font-black uppercase tracking-[.08em] ${stateClass(state)}`}>{state}</span>
                <span className={`mt-1 block text-[10px] font-black uppercase tracking-[.08em] ${human?.approved ? "text-emerald-200" : "text-slate-600"}`}>{human?.approved ? "Human approved" : "Human review pending"}</span>
              </button>
            );
          })}
        </div>

        {quotaBlockedDay ? (
          <div className="mt-6 rounded-3xl border border-amber-300/25 bg-amber-300/[.05] p-5">
            <p className="font-black text-amber-100">Primary quota block detected on Day {quotaBlockedDay}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Days already stored are safe. The next retry is deliberately different: one primary attempt, then one Gemini 2.5 TTS fallback attempt if needed. If both are quota-blocked, the circuit stops again.</p>
            <button type="button" onClick={() => void queue("retry-blocked")} disabled={loading || queueing || Boolean(activeRenderDay)} className="button-primary mt-4 disabled:cursor-not-allowed disabled:opacity-45">{queueing ? "Queuing…" : `Retry Day ${quotaBlockedDay} with fallback routing`}</button>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => void queue("prepare-next")} disabled={loading || queueing || Boolean(activeRenderDay) || readyCount === 5} className="button-primary disabled:cursor-not-allowed disabled:opacity-45">{activeRenderDay ? `Rendering Day ${activeRenderDay}…` : queueing ? "Queuing…" : readyCount === 5 ? "5-track set stored" : "Prepare next review track"}</button>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => void refresh()} className="button-secondary">Refresh status</button></div>
        <p className="mt-5 text-base font-black leading-7 text-[#9cf2e3]">{message}</p>
      </section>

      <section className="mt-7 rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-sky-200">Human listening evidence gate</p>
            <h2 className="mt-2 font-display text-2xl font-black">Listening is not approval. Expansion is locked behind recorded evidence.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">A play event only marks a track as listened on this device. Formal approval is recorded separately in Greene governance evidence after an explicit product-owner decision. The remaining 25-track lane cannot open until all five representative tracks are both stored and human-approved.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#061521]/75 p-5 lg:min-w-[220px]">
            <p className="text-4xl font-black">{approvedCount} / 5</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[.15em] text-slate-400">Human approvals</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[.1em] ${expansionUnlocked ? "border-emerald-300/40 text-emerald-200" : "border-amber-300/25 text-amber-100"}`}>{expansionUnlocked ? "Expansion unlocked" : "Expansion locked"}</span>
          <span className="text-sm text-slate-400">Representative audio ready: {readyCount}/5 · explicit approvals: {approvedCount}/5</span>
        </div>
        {expansionUnlocked ? (
          <button type="button" onClick={() => void expandNext()} disabled={expanding} className="button-primary mt-5 disabled:cursor-not-allowed disabled:opacity-45">{expanding ? "Queuing one track…" : "Prepare next remaining review track"}</button>
        ) : (
          <p className="mt-5 text-sm font-bold leading-6 text-slate-400">After the five tracks are heard and accepted, give an explicit approval decision in chat. That decision can then be written into the governed evidence record before expansion opens.</p>
        )}
      </section>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Day {item.day} · {item.theme}</p>
          <h2 className="mt-2 font-display text-3xl font-black">{item.title}</h2>
          <p className="mt-3 leading-7 text-slate-300">{item.focus}</p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#061521]/60 p-5">
            <div className="flex flex-wrap gap-3">
              <span className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[.1em] ${ready ? "border-[#49d8c2]/40 text-[#9cf2e3]" : "border-amber-200/25 text-amber-100"}`}>{ready ? "Stored review candidate" : stateLabel(status)}</span>
              <span className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[.1em] ${activeHumanReview?.approved ? "border-emerald-300/40 text-emerald-200" : "border-white/10 text-slate-500"}`}>{activeHumanReview?.approved ? "Human approved" : "Human approval pending"}</span>
              <span className="px-1 py-2 text-xs font-bold text-slate-500">Not a master</span>
            </div>
            {ready ? (
              <>
                <button type="button" onClick={() => void play()} className="button-primary mt-5 block">Play stored Day {activeDay}</button>
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#04151c] p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-[.12em] text-slate-400">iPhone-native audio control</p>
                  <audio ref={audioRef} key={audioUrl} src={audioUrl} controls playsInline preload="metadata" className="w-full" onPlay={() => setListened((days) => days.includes(activeDay) ? days : [...days, activeDay])} />
                </div>
              </>
            ) : <p className="mt-5 text-sm leading-6 text-slate-400">No stored audio is available for this day yet.</p>}
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div><dt className="font-black text-white">Job</dt><dd className="mt-1 break-all text-slate-400">{status?.job?.job_id || "—"} {status?.job?.status ? `· ${status.job.status}` : ""}</dd></div>
            <div><dt className="font-black text-white">Selected model</dt><dd className="mt-1 text-slate-400">{status?.job?.selected_model || "—"}</dd></div>
            <div><dt className="font-black text-white">Attempt</dt><dd className="mt-1 text-slate-400">{status?.attempt?.attemptNumber ?? "—"} {status?.attempt?.errorCode ? `· ${status.attempt.errorCode}` : ""}</dd></div>
            <div><dt className="font-black text-white">Asset</dt><dd className="mt-1 break-all text-slate-400">{status?.asset?.asset_id || "—"}</dd></div>
            <div><dt className="font-black text-white">Audio SHA-256</dt><dd className="mt-1 break-all font-mono text-xs text-slate-500">{status?.asset?.checksum_sha256 || "—"}</dd></div>
            <div><dt className="font-black text-white">Rights</dt><dd className="mt-1 text-slate-400">{status?.asset?.rights_status || "Pending review"}</dd></div>
          </dl>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
          <label htmlFor="listening-notes-v6" className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Human listening notes · Day {activeDay}</label>
          <textarea id="listening-notes-v6" value={notes[activeDay] || ""} onChange={(event) => setNotes((current) => ({ ...current, [activeDay]: event.target.value }))} placeholder="Voice quality, pacing, warmth, pronunciation, pauses, anything to change…" className="mt-4 min-h-[180px] w-full rounded-2xl border border-white/10 bg-[#04151c] p-4 text-sm leading-6 text-white outline-none focus:border-[#49d8c2]" />
          <p className="mt-2 text-xs leading-5 text-slate-500">Notes stay on this device during preview. They are not approval until you explicitly approve.</p>
          <details className="mt-6 rounded-2xl border border-white/10 bg-[#061521]/50 p-4"><summary className="cursor-pointer text-sm font-black text-sky-200">Exact record-ready transcript</summary><div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{transcript}</div></details>
          <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/[.035] p-4 text-sm leading-6 text-slate-300"><p className="font-black text-amber-100">Release boundary</p><p className="mt-2">A successful fallback render is still only a candidate. Human listening must confirm voice continuity before it can join the approved master set.</p></div>
        </section>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-slate-500"><Link href="/library/30-day" className="font-black text-[#76ead6] underline">Back to learner preview</Link><span>·</span><span>{HERO_WITHIN_30_DAY_VERSION}</span><span>·</span><span>{HERO_WITHIN_30_DAY_AUDIO_STATUS}</span><span>· governed-review-gate-v6.1</span></div>
    </div>
  );
}
