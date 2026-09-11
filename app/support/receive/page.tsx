"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

type Handoff = {
  role: string;
  age_band: string;
  supporter_name: string | null;
  brief: string;
  supporter_response: string | null;
  next_focus: string | null;
  status: string;
  created_at: string;
  expires_at: string;
};

const roleLabels: Record<string,string> = { parent:"Parent / Guardian", coach:"Coach", educator:"Teacher / Educator", therapist:"Therapist / Counselor", faith:"Faith Leader", mentor:"Mentor / Trusted Adult" };

export default function SupportReceivePage() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [supporterResponse, setSupporterResponse] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setLoading(false); setError("This handoff link is missing its access token."); return; }
    fetch("/api/trusted-support/handoff", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action:"view", token, mode:"supporter" }) })
      .then(async r => { const d=await r.json(); if(!r.ok||!d.ok) throw new Error(d.error||"Could not open handoff"); return d.handoff as Handoff; })
      .then(h => { setHandoff(h); setSupporterResponse(h.supporter_response||""); setNextFocus(h.next_focus||""); })
      .catch(e => setError(e instanceof Error ? e.message : "Could not open handoff"))
      .finally(()=>setLoading(false));
  }, [token]);

  async function respond() {
    setError("");
    try {
      const response = await fetch("/api/trusted-support/handoff", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action:"respond", token, supporterResponse, nextFocus }) });
      const data = await response.json();
      if(!response.ok||!data.ok) throw new Error(data.error||"Could not save response");
      setSent(true);
    } catch(e) { setError(e instanceof Error ? e.message : "Could not save response"); }
  }

  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-7 lg:py-12">
      <p className="section-kicker">Z-Girl Trusted Support</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">A reflection was intentionally shared with you.</h1>
      <p className="mt-4 max-w-3xl text-slate-300">This is a participant-controlled handoff. You are seeing only what they chose to share—not their private Z-Girl history.</p>

      {loading && <div className="mt-8 rounded-3xl border border-white/10 bg-white/[.03] p-8 text-slate-400">Opening secure handoff…</div>}
      {error && !handoff && <div className="mt-8 rounded-3xl border border-rose-300/20 bg-rose-300/[.05] p-6 text-rose-200">{error}</div>}
      {handoff && <div className="mt-8 grid gap-6">
        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-wider text-[#76ead6]">{roleLabels[handoff.role] || handoff.role}</p><h2 className="mt-2 font-display text-2xl font-black">What they chose to share</h2></div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-slate-400">{handoff.age_band}</span>
          </div>
          <div className="mt-5 whitespace-pre-wrap rounded-3xl border border-white/10 bg-[#071824] p-5 text-sm leading-7 text-slate-200">{handoff.brief}</div>
          <p className="mt-4 text-xs text-slate-500">Shared {new Date(handoff.created_at).toLocaleString()} · expires {new Date(handoff.expires_at).toLocaleDateString()}</p>
        </section>

        <section className="rounded-[2rem] border border-[#49d8c2]/20 bg-[#49d8c2]/[.045] p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Human response</p>
          <h2 className="mt-2 font-display text-2xl font-black">Respond without taking over the reflection.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Listen first, reflect what you heard, and agree on one realistic next focus. For therapy/counseling use, this handoff is session preparation—not diagnosis or treatment direction.</p>
          <label className="mt-5 block text-sm font-black">What I heard / what seems important to discuss
            <textarea value={supporterResponse} onChange={(e)=>setSupporterResponse(e.target.value)} className="reflection-field mt-2 min-h-[150px]" placeholder="Use supportive, observable language. Avoid labels or hidden evaluation." />
          </label>
          <label className="mt-5 block text-sm font-black">Agreed next focus or support action
            <textarea value={nextFocus} onChange={(e)=>setNextFocus(e.target.value)} className="reflection-field mt-2 min-h-[120px]" placeholder="One action, question, practice, or follow-up to revisit." />
          </label>
          {error && <p className="mt-4 text-sm font-bold text-rose-300">{error}</p>}
          {sent ? <div className="mt-5 rounded-2xl border border-[#49d8c2]/30 bg-[#49d8c2]/10 p-4 text-sm font-bold text-[#9af3e4]">Response saved. The participant can now see the agreed next focus through their private follow-up link.</div> : <button onClick={respond} disabled={!supporterResponse.trim() && !nextFocus.trim()} className="button-primary mt-5 !min-h-0 disabled:opacity-40">Send response back to participant</button>}
        </section>
      </div>}
      <div className="mt-6"><Link href="/safety" className="text-sm font-bold text-slate-400 hover:text-white">Trust &amp; Safety →</Link></div>
    </div>
  </main>;
}
