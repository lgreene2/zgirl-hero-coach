"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HERO_WITHIN_30_DAY, getHeroWithin30DayTranscript } from "@/app/lib/hero-within-30-day";

type DayQA = {
  day: number;
  assetId: string;
  checksum?: string;
  state?: string;
  rightsStatus?: string;
  technicalVerified?: boolean;
  humanDecision?: "APPROVED" | "REJECTED" | null;
  humanEvidenceStatus?: string | null;
  humanReviewedAt?: string | null;
};

type Summary = {
  ok?: boolean;
  total?: number;
  technicalVerified?: number;
  humanApproved?: number;
  humanRejected?: number;
  rightsCleared?: number;
  masterPromotionUnlocked?: boolean;
  masterCount?: number;
  model?: string;
  voice?: string;
  voiceProfile?: string;
  days?: DayQA[];
};

const API = "/api/library/30-day/master-review";
const NOTES_KEY = "zgirl_30day_whole_library_qa_notes_v1";
const LISTENED_KEY = "zgirl_30day_whole_library_listened_v1";

function decisionLabel(day?: DayQA) {
  if (!day) return "CHECKING";
  if (day.humanDecision === "APPROVED" && day.humanEvidenceStatus === "VERIFIED") return "APPROVED";
  if (day.humanDecision === "REJECTED") return "REJECTED";
  return "PENDING";
}

function decisionClass(value: string) {
  if (value === "APPROVED") return "text-emerald-200";
  if (value === "REJECTED") return "text-rose-200";
  return "text-slate-500";
}

export default function MasterReviewClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Reading 30-track governed QA state…");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [listened, setListened] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const item = useMemo(() => HERO_WITHIN_30_DAY.find((d) => d.day === activeDay) || HERO_WITHIN_30_DAY[0], [activeDay]);
  const transcript = useMemo(() => getHeroWithin30DayTranscript(item), [item]);
  const day = summary?.days?.find((d) => d.day === activeDay);
  const decision = decisionLabel(day);
  const heard = listened.includes(activeDay) || decision === "APPROVED";
  const audioUrl = `${API}?day=${activeDay}&audio=1`;

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(NOTES_KEY);
      const savedListened = localStorage.getItem(LISTENED_KEY);
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedListened) setListened(JSON.parse(savedListened));
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {} }, [notes]);
  useEffect(() => { try { localStorage.setItem(LISTENED_KEY, JSON.stringify(listened)); } catch {} }, [listened]);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(API, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as Summary | null;
      if (!response.ok || !payload?.ok) throw new Error(`status_${response.status}`);
      setSummary(payload);
      const approved = payload.humanApproved ?? 0;
      const technical = payload.technicalVerified ?? 0;
      const rights = payload.rightsCleared ?? 0;
      if (payload.masterCount === 30) setMessage("30/30 masters are recorded in governed storage metadata. Public release remains separate.");
      else if (payload.masterPromotionUnlocked) setMessage("All QA and rights gates are complete. Master promotion is available but still requires an explicit final confirmation.");
      else if (approved === 30) setMessage(`Whole-library listening QA is complete. Rights gate is ${rights}/30, so master promotion remains locked.`);
      else setMessage(`${technical}/30 technical checks verified. ${approved}/30 human listening approvals recorded. Rights remain ${rights}/30.`);
    } catch (error) {
      setMessage(`Could not read QA state (${error instanceof Error ? error.message : "unknown"}).`);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [activeDay]);

  const markListened = () => setListened((current) => current.includes(activeDay) ? current : [...current, activeDay]);

  const review = async (nextDecision: "APPROVED" | "REJECTED") => {
    if (saving || !day?.technicalVerified) return;
    if (nextDecision === "APPROVED" && !heard) {
      setMessage(`Listen to Day ${activeDay} before approving this checksum-bound candidate.`);
      return;
    }
    const verb = nextDecision === "APPROVED" ? "approve" : "reject";
    if (!window.confirm(`${verb[0].toUpperCase()}${verb.slice(1)} Day ${activeDay}? This records checksum-bound human listening QA only. It does not publish or create a master.`)) return;
    setSaving(true);
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review-day", day: activeDay, decision: nextDecision, notes: notes[activeDay] || "", reviewer: "product-owner" }),
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null) as { ok?: boolean; code?: string; summary?: Summary } | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.code || `review_${response.status}`);
      if (payload.summary) setSummary(payload.summary);
      setMessage(`Day ${activeDay} ${nextDecision === "APPROVED" ? "approved" : "rejected"}. The decision is bound to the stored audio checksum.`);
      if (nextDecision === "APPROVED") {
        const pending = payload.summary?.days?.find((d) => d.day > activeDay && !d.humanDecision) || payload.summary?.days?.find((d) => !d.humanDecision);
        if (pending) setActiveDay(pending.day);
      }
    } catch (error) {
      setMessage(`Review was not recorded (${error instanceof Error ? error.message : "unknown"}).`);
    } finally { setSaving(false); }
  };

  const promote = async () => {
    if (!summary?.masterPromotionUnlocked || saving) return;
    const typed = window.prompt("Type PROMOTE 30 TRACKS to create governed master records. This still does not publish the library.");
    if (typed !== "PROMOTE 30 TRACKS") {
      setMessage("Master promotion cancelled. No master records were changed.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "promote-library", confirm: typed, reviewer: "product-owner" }),
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null) as { ok?: boolean; code?: string; promotedCount?: number; summary?: Summary } | null;
      if (!response.ok || !payload?.ok) throw new Error(payload?.code || `promote_${response.status}`);
      if (payload.summary) setSummary(payload.summary);
      setMessage(`${payload.promotedCount ?? 30}/30 governed master records created. Public release is still locked.`);
    } catch (error) {
      setMessage(`Master promotion stayed locked (${error instanceof Error ? error.message : "unknown"}).`);
    } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
      <section className="rounded-[2rem] border border-[#49d8c2]/25 bg-[#49d8c2]/[.05] p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Whole-library QA · checksum-bound review</p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-black sm:text-3xl">Listen once. Approve the exact stored file. Promote only after every gate passes.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">All 30 technical candidates are stored. This console records human listening decisions against each audio checksum. Replaying a track does not regenerate audio. Rights clearance and master promotion remain separate gates.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
            <Metric value={summary?.technicalVerified ?? 0} label="Technical / 30" />
            <Metric value={summary?.humanApproved ?? 0} label="Human / 30" />
            <Metric value={summary?.rightsCleared ?? 0} label="Rights / 30" />
            <Metric value={summary?.masterCount ?? 0} label="Masters / 30" />
          </div>
        </div>
        <p className="mt-5 text-base font-black leading-7 text-[#9cf2e3]">{message}</p>
        <button type="button" onClick={() => void refresh()} className="button-secondary mt-4">Refresh governed state</button>
      </section>

      <section className="mt-7 rounded-[2rem] border border-white/10 bg-white/[.025] p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
          {(summary?.days || Array.from({ length:30 }, (_,i)=>({day:i+1} as DayQA))).map((entry) => {
            const state = decisionLabel(entry);
            return (
              <button key={entry.day} type="button" onClick={() => setActiveDay(entry.day)} className={`rounded-2xl border p-3 text-left ${activeDay === entry.day ? "border-[#49d8c2] bg-[#49d8c2]/10" : "border-white/10 bg-[#061521]/50"}`}>
                <span className="block text-sm font-black">Day {entry.day}</span>
                <span className={`mt-1 block text-[10px] font-black uppercase tracking-[.08em] ${decisionClass(state)}`}>{state}</span>
                <span className={`mt-1 block text-[9px] font-bold uppercase ${entry.technicalVerified ? "text-sky-200" : "text-slate-600"}`}>{entry.technicalVerified ? "Tech ✓" : "Tech —"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7 grid gap-7 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Day {activeDay} · {item.phase}</p>
          <h3 className="mt-2 font-display text-3xl font-black">{item.title}</h3>
          <p className="mt-3 text-slate-300">{item.focus}</p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#061521]/70 p-4">
            <p className="text-xs font-black uppercase tracking-[.12em] text-slate-400">Stored candidate</p>
            <p className="mt-2 text-sm text-slate-300 break-all">SHA-256: {day?.checksum || "—"}</p>
            <p className="mt-2 text-sm text-slate-300">Technical: {day?.technicalVerified ? "VERIFIED" : "PENDING"} · Rights: {day?.rightsStatus || "PENDING_REVIEW"}</p>
            <audio key={activeDay} ref={audioRef} controls preload="metadata" className="mt-4 w-full" src={audioUrl} onPlay={markListened} />
            <button type="button" onClick={async () => { try { await audioRef.current?.play(); markListened(); } catch { setMessage("Use the native audio Play control if browser playback is blocked."); } }} className="button-primary mt-4">Play Day {activeDay}</button>
            <p className="mt-2 text-xs text-slate-500">{heard ? "Listening checkpoint recorded on this device." : "Listen before approving a new track."}</p>
          </div>

          <label className="mt-6 block text-sm font-black text-slate-200">Human listening notes</label>
          <textarea value={notes[activeDay] || ""} onChange={(e) => setNotes((current) => ({ ...current, [activeDay]: e.target.value }))} rows={4} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#061521] p-4 text-white outline-none focus:border-[#49d8c2]" placeholder="Voice continuity, pacing, pronunciation, noise, clipping, timing, or other QA notes…" />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={saving || !day?.technicalVerified || !heard} onClick={() => void review("APPROVED")} className="button-primary disabled:opacity-40">{saving ? "Recording…" : decision === "APPROVED" ? "Reconfirm approval" : "Approve and next"}</button>
            <button type="button" disabled={saving || !day?.technicalVerified} onClick={() => void review("REJECTED")} className="button-secondary disabled:opacity-40">Reject / flag track</button>
          </div>

          <details className="mt-6 rounded-2xl border border-white/10 bg-[#061521]/45 p-4">
            <summary className="cursor-pointer font-black">Exact canonical transcript</summary>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7 text-slate-300">{transcript}</pre>
          </details>
        </div>

        <aside className="space-y-7">
          <div className="rounded-[2rem] border border-white/10 bg-white/[.025] p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Locked production recipe</p>
            <p className="mt-4 text-sm leading-7 text-slate-300"><strong className="text-white">Model:</strong> {summary?.model || "Gemini 3.1 Flash TTS"}<br/><strong className="text-white">Voice:</strong> {summary?.voice || "Sulafat"}<br/><strong className="text-white">Profile:</strong> Z-Girl guided reflection<br/><strong className="text-white">Regeneration:</strong> Off during QA</p>
          </div>

          <div className="rounded-[2rem] border border-amber-300/25 bg-amber-300/[.04] p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Master promotion gate</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">Promotion requires 30/30 technical validations, 30/30 checksum-bound human approvals, and 30/30 rights clearances. Rights are intentionally not self-cleared from this listening screen.</p>
            <button type="button" disabled={!summary?.masterPromotionUnlocked || saving || summary?.masterCount === 30} onClick={() => void promote()} className="button-primary mt-4 w-full disabled:opacity-35">{summary?.masterCount === 30 ? "30 masters recorded" : summary?.masterPromotionUnlocked ? "Promote 30 approved tracks" : "Master promotion locked"}</button>
            <p className="mt-3 text-xs leading-5 text-slate-500">Master promotion creates governed master records only. It does not publish, activate subscriptions, or change the public Z-Girl site.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return <div className="rounded-2xl border border-white/10 bg-[#061521]/70 p-4"><p className="text-2xl font-black">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-[.1em] text-slate-500">{label}</p></div>;
}
