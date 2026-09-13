"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HERO_WITHIN_30_DAY } from "@/app/lib/hero-within-30-day";

type DayStatus = {
  day?: number;
  representative?: boolean;
  ready?: boolean;
  failureClass?: string | null;
  errorCode?: string | null;
  asset?: { checksum_sha256?: string; state?: string } | null;
  job?: { status?: string; selected_model?: string } | null;
};

type Summary = {
  ok?: boolean;
  representativeGateUnlocked?: boolean;
  readyCount?: number;
  total?: number;
  expansionReadyCount?: number;
  expansionTotal?: number;
  activeDay?: number | null;
  nextDay?: number | null;
  quotaBlockedDay?: number | null;
  statuses?: Record<string, DayStatus>;
  model?: string;
  voice?: string;
};

const API = "/api/library/30-day/audio-expansion";
const REPRESENTATIVE = new Set([1, 8, 15, 22, 30]);
const POLL_MS = 7000;
const QUOTA_COOLDOWN_MS = 70_000;

function label(status?: DayStatus) {
  if (!status) return "CHECKING";
  if (status.ready) return "READY";
  const job = status.job?.status || "";
  if (["QUEUED", "ROUTING", "RENDERING", "RETRYING", "QA"].includes(job)) return "RENDERING";
  if (status.failureClass === "QUOTA_EXHAUSTED") return "QUOTA COOLDOWN";
  if (status.failureClass) return "FAILED";
  return "PENDING";
}

function labelClass(value: string) {
  if (value === "READY") return "text-[#9cf2e3]";
  if (value === "RENDERING") return "text-sky-200";
  if (value === "QUOTA COOLDOWN") return "text-amber-200";
  if (value === "FAILED") return "text-rose-200";
  return "text-slate-500";
}

export default function AudioExpansionClientV2() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [queueing, setQueueing] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const [message, setMessage] = useState("Reading governed expansion state…");
  const [activeDay, setActiveDay] = useState(2);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const retriedQuotaDayRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollRef = useRef<number | null>(null);
  const queueTimerRef = useRef<number | null>(null);

  const status = summary?.statuses?.[String(activeDay)];
  const ready = Boolean(status?.ready);
  const item = useMemo(() => HERO_WITHIN_30_DAY.find((d) => d.day === activeDay) || HERO_WITHIN_30_DAY[0], [activeDay]);
  const expansionReady = summary?.expansionReadyCount ?? 0;
  const expansionTotal = summary?.expansionTotal ?? 25;
  const activeRenderDay = summary?.activeDay ?? null;
  const nextDay = summary?.nextDay ?? null;
  const quotaBlockedDay = summary?.quotaBlockedDay ?? null;
  const cooldownSeconds = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(API, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as Summary | null;
      if (!response.ok || !payload?.ok) throw new Error(`status_${response.status}`);
      setSummary(payload);

      if (!payload.representativeGateUnlocked) {
        setAutoRun(false);
        setMessage("Expansion is locked because the five-track representative approval gate is not complete.");
      } else if ((payload.expansionReadyCount ?? 0) === (payload.expansionTotal ?? 25)) {
        setAutoRun(false);
        setCooldownUntil(null);
        setMessage("All 25 expansion candidates are stored. No track has been promoted to a master or released.");
      } else if (payload.quotaBlockedDay) {
        if (retriedQuotaDayRef.current === payload.quotaBlockedDay) {
          setAutoRun(false);
          setMessage(`Day ${payload.quotaBlockedDay} is still quota-blocked after the controlled cooldown retry. The factory is safely paused with no fallback voice.`);
        } else if (autoRun) {
          setCooldownUntil((current) => current ?? Date.now() + QUOTA_COOLDOWN_MS);
        } else {
          setMessage(`Day ${payload.quotaBlockedDay} hit the Gemini request limit. Resume the factory to use a controlled cooldown retry; no fallback voice will be used.`);
        }
      } else if (payload.activeDay) {
        setCooldownUntil(null);
        setMessage(`Day ${payload.activeDay} is rendering with the approved Gemini 3.1 + Sulafat baseline recipe.`);
      } else {
        if (retriedQuotaDayRef.current && payload.nextDay !== retriedQuotaDayRef.current) retriedQuotaDayRef.current = null;
        setCooldownUntil(null);
        setMessage(`${payload.expansionReadyCount ?? 0} of ${payload.expansionTotal ?? 25} expansion candidates are stored. Next governed track: Day ${payload.nextDay ?? "—"}.`);
      }
      return payload;
    } catch (error) {
      setAutoRun(false);
      setMessage(`Status check failed (${error instanceof Error ? error.message : "unknown"}). No provider request was sent.`);
      return null;
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [autoRun]);

  const queue = useCallback(async (day?: number, forceRetry = false) => {
    if (queueing || activeRenderDay) return false;
    setQueueing(true);
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(day ? { day } : {}), ...(forceRetry ? { forceRetry: true } : {}) }),
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; day?: number; code?: string; complete?: boolean; alreadyRendering?: boolean } | null;
      if (!response.ok || !payload?.ok) {
        if (response.status === 429 || payload?.code === "PROVIDER_QUOTA_EXHAUSTED") {
          setMessage(`Provider quota is still blocking Day ${payload?.day ?? day ?? "—"}. The factory is paused and did not switch voices.`);
          return false;
        }
        throw new Error(payload?.code || `queue_${response.status}`);
      }
      if (payload.complete) {
        setAutoRun(false);
        setMessage("The 25-track expansion set is complete.");
      } else if (payload.alreadyRendering && payload.day) {
        setMessage(`Day ${payload.day} is already rendering. No duplicate was created.`);
      } else if (payload.day) {
        setActiveDay(payload.day);
        setMessage(`Day ${payload.day} queued with the exact approved v3 baseline recipe. Gemini 3.1 + Sulafat only.`);
      }
      await refresh(true);
      return true;
    } catch (error) {
      setAutoRun(false);
      setMessage(`Could not queue the next track (${error instanceof Error ? error.message : "unknown"}). Existing stored audio remains intact.`);
      return false;
    } finally {
      setQueueing(false);
    }
  }, [activeRenderDay, queueing, refresh]);

  useEffect(() => {
    void refresh();
    pollRef.current = window.setInterval(() => void refresh(true), POLL_MS);
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (queueTimerRef.current) window.clearTimeout(queueTimerRef.current);
      window.clearInterval(clock);
    };
  }, [refresh]);

  useEffect(() => {
    if (!autoRun || loading || queueing || activeRenderDay || !summary?.representativeGateUnlocked) return;
    if (expansionReady >= expansionTotal || !nextDay) {
      setAutoRun(false);
      return;
    }

    if (quotaBlockedDay) {
      if (retriedQuotaDayRef.current === quotaBlockedDay) return;
      if (!cooldownUntil) {
        setCooldownUntil(Date.now() + QUOTA_COOLDOWN_MS);
        return;
      }
      if (cooldownUntil > Date.now()) {
        setMessage(`Day ${quotaBlockedDay} hit Gemini's request window. Cooling down ${cooldownSeconds}s, then the factory will make one controlled retry with the same Z-Girl voice.`);
        return;
      }
      retriedQuotaDayRef.current = quotaBlockedDay;
      setCooldownUntil(null);
      void queue(quotaBlockedDay, true);
      return;
    }

    if (queueTimerRef.current) window.clearTimeout(queueTimerRef.current);
    queueTimerRef.current = window.setTimeout(() => void queue(), 3500);
    return () => {
      if (queueTimerRef.current) window.clearTimeout(queueTimerRef.current);
      queueTimerRef.current = null;
    };
  }, [autoRun, loading, queueing, activeRenderDay, quotaBlockedDay, cooldownUntil, cooldownSeconds, summary?.representativeGateUnlocked, expansionReady, expansionTotal, nextDay, queue]);

  useEffect(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [activeDay]);

  const manualRetry = async () => {
    const day = quotaBlockedDay || nextDay;
    if (!day) return;
    retriedQuotaDayRef.current = day;
    setCooldownUntil(null);
    await queue(day, true);
  };

  const play = async () => {
    if (!ready || !audioRef.current) return;
    try {
      if (audioRef.current.ended) audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setMessage(`Playing stored Day ${activeDay}. Replay makes no Gemini request.`);
    } catch {
      setMessage("The stored candidate is ready. Use the native audio Play control below if browser playback is blocked.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[#49d8c2]/25 bg-[#49d8c2]/[.05] p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">25-track expansion factory · quota-aware v2</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-black sm:text-3xl">Keep the approved Z-Girl voice while the factory handles provider limits safely.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">The factory renders one track at a time. When Gemini reaches its request window, it waits 70 seconds and makes one controlled retry with the same Gemini 3.1 + Sulafat recipe. If that retry is also blocked, the factory pauses rather than switching voices or burning repeated requests.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#061521]/75 p-5 lg:min-w-[220px]">
            <p className="text-4xl font-black">{expansionReady} / {expansionTotal}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[.15em] text-slate-400">Expansion stored</p>
            <p className="mt-3 text-sm font-black text-[#9cf2e3]">5 / 5 baseline approved</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => setAutoRun((value) => !value)} disabled={loading || !summary?.representativeGateUnlocked || expansionReady >= expansionTotal} className="button-primary disabled:opacity-45">
            {autoRun ? "Pause expansion factory" : expansionReady ? "Resume expansion factory" : "Start 25-track expansion"}
          </button>
          {quotaBlockedDay ? <button type="button" onClick={() => void manualRetry()} disabled={queueing || Boolean(activeRenderDay)} className="button-secondary disabled:opacity-45">Retry Day {quotaBlockedDay} now</button> : null}
          <button type="button" onClick={() => void queue()} disabled={loading || queueing || Boolean(activeRenderDay) || Boolean(quotaBlockedDay) || expansionReady >= expansionTotal} className="button-secondary disabled:opacity-45">{queueing ? "Queuing…" : activeRenderDay ? `Rendering Day ${activeRenderDay}…` : "Prepare next track"}</button>
          <button type="button" onClick={() => void refresh()} className="button-secondary">Refresh status</button>
        </div>

        <p className="mt-5 text-base font-black leading-7 text-[#9cf2e3]">{message}</p>
        {quotaBlockedDay && autoRun && cooldownSeconds > 0 ? <p className="mt-2 text-sm font-black text-amber-200">Automatic quota cooldown: {cooldownSeconds}s remaining</p> : null}
        <p className="mt-2 text-xs leading-5 text-slate-500">Completed tracks are already in private Greene storage. Closing or sleeping the browser cannot erase them. If the browser suspends during a cooldown, reopen the page and press Resume.</p>
      </section>

      <section className="mt-7 rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-10">
          {HERO_WITHIN_30_DAY.map((day) => {
            const candidate = summary?.statuses?.[String(day.day)];
            const state = label(candidate);
            const representative = REPRESENTATIVE.has(day.day);
            return (
              <button key={day.day} type="button" onClick={() => setActiveDay(day.day)} className={`rounded-2xl border p-3 text-left transition ${activeDay === day.day ? "border-[#49d8c2] bg-[#49d8c2]/10" : "border-white/10 bg-[#061521]/45"}`}>
                <span className="block text-sm font-black text-white">Day {day.day}</span>
                <span className={`mt-1 block text-[10px] font-black uppercase tracking-[.06em] ${labelClass(state)}`}>{state}</span>
                <span className="mt-1 block text-[9px] font-black uppercase tracking-[.06em] text-slate-600">{representative ? "Baseline gate" : "Expansion"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Day {item.day} · {item.theme}</p>
          <h3 className="mt-2 font-display text-3xl font-black">{item.title}</h3>
          <p className="mt-3 text-lg leading-8 text-slate-300">{item.focus}</p>
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#061521]/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">{ready ? "Stored review candidate" : label(status)}</p>
                <p className="mt-1 text-xs text-slate-400">{status?.job?.selected_model || summary?.model || "Gemini 3.1 Flash TTS"}</p>
              </div>
              {ready ? <button type="button" onClick={() => void play()} className="button-primary">Play stored Day {activeDay}</button> : null}
            </div>
            {ready ? <audio ref={audioRef} src={`${API}?day=${activeDay}&audio=1`} controls preload="none" className="mt-4 w-full" /> : null}
            <dl className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
              <div><dt className="font-black uppercase tracking-[.1em]">Audio checksum</dt><dd className="mt-1 break-all text-slate-200">{status?.asset?.checksum_sha256 || "—"}</dd></div>
              <div><dt className="font-black uppercase tracking-[.1em]">Release state</dt><dd className="mt-1 text-slate-200">Candidate only · not a master</dd></div>
            </dl>
          </div>
        </article>

        <aside className="rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Locked production recipe</p>
          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
            <p><strong className="text-white">Voice:</strong> Sulafat</p>
            <p><strong className="text-white">Model:</strong> Gemini 3.1 Flash TTS only</p>
            <p><strong className="text-white">Voice baseline:</strong> Human-approved Days 1 and 8</p>
            <p><strong className="text-white">Fallback:</strong> Disabled</p>
            <p><strong className="text-white">Scripts:</strong> Server-side locked canonical transcripts</p>
            <p><strong className="text-white">Storage:</strong> Private Greene governed staging</p>
            <p><strong className="text-white">Release:</strong> Review candidates only; no automatic master promotion</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
