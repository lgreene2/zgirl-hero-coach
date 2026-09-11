"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

type Handoff = {
  role: string;
  supporter_name: string | null;
  brief: string;
  supporter_response: string | null;
  next_focus: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
  expires_at: string;
};

function FollowUpContent() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closed, setClosed] = useState(false);

  async function refresh() {
    if (!token) { setError("This follow-up link is missing its access token."); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/trusted-support/handoff", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action:"view", token, mode:"participant" }) });
      const data = await response.json();
      if(!response.ok||!data.ok) throw new Error(data.error||"Could not open follow-up");
      setHandoff(data.handoff);
    } catch(e) { setError(e instanceof Error ? e.message : "Could not open follow-up"); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ refresh(); }, [token]);

  async function closeLoop() {
    const response = await fetch("/api/trusted-support/handoff", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action:"close", token }) });
    const data = await response.json();
    if(response.ok && data.ok) { setClosed(true); setHandoff(handoff ? { ...handoff, status:"closed" } : handoff); }
  }

  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-7 lg:py-12">
      <p className="section-kicker">Private participant follow-up</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">Bring the human response back into your next Hero Move.</h1>
      <p className="mt-4 max-w-3xl text-slate-300">This private link lets you see whether your chosen supporter responded. It does not expose other reflections or create an automatic monitoring feed.</p>

      {loading && <div className="mt-8 rounded-3xl border border-white/10 bg-white/[.03] p-8 text-slate-400">Checking for a response…</div>}
      {error && <div className="mt-8 rounded-3xl border border-rose-300/20 bg-rose-300/[.05] p-6 text-rose-200">{error}</div>}
      {handoff && <div className="mt-8 grid gap-6">
        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-wider text-[#76ead6]">What you chose to share</p>
          <div className="mt-4 whitespace-pre-wrap rounded-3xl border border-white/10 bg-[#071824] p-5 text-sm leading-7 text-slate-200">{handoff.brief}</div>
        </section>

        {!handoff.supporter_response && !handoff.next_focus ? <section className="rounded-[2rem] border border-white/10 bg-white/[.025] p-6 text-center">
          <h2 className="font-display text-2xl font-black">No response yet.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Your supporter may not have opened or answered the handoff yet. You can keep reflecting without waiting for a response.</p>
          <button onClick={refresh} className="button-secondary mt-5 !min-h-0">Check again</button>
        </section> : <section className="rounded-[2rem] border border-[#49d8c2]/20 bg-[#49d8c2]/[.045] p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Human response received</p>
          {handoff.supporter_response && <div className="mt-4"><h2 className="font-display text-2xl font-black">What they heard</h2><div className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/10 p-4 text-sm leading-7 text-slate-200">{handoff.supporter_response}</div></div>}
          {handoff.next_focus && <div className="mt-5"><h2 className="font-display text-2xl font-black">Agreed next focus</h2><div className="mt-3 whitespace-pre-wrap rounded-2xl border border-[#49d8c2]/25 bg-[#49d8c2]/10 p-4 text-sm leading-7 text-[#d8fff8]">{handoff.next_focus}</div></div>}
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/reflect" className="button-primary !min-h-0">Reflect on this next focus</Link><Link href="/journey" className="button-secondary !min-h-0">Continue 7-Day Journey</Link></div>
        </section>}

        <section className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-black">Close this handoff when the conversation cycle is complete.</p><p className="mt-1 text-xs text-slate-500">Closing stops this handoff from being treated as active. It does not erase your private reflections.</p></div><button onClick={closeLoop} disabled={handoff.status==="closed" || closed} className="rounded-full border border-white/15 px-4 py-2 text-xs font-black disabled:opacity-40">{handoff.status==="closed" || closed ? "Handoff closed" : "Close handoff"}</button></div>
        </section>
      </div>}
    </div>
  </main>;
}

export default function SupportFollowUpPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#061521] text-white"><SiteHeader /><div className="mx-auto max-w-4xl px-4 py-12 text-slate-400">Opening private follow-up…</div></main>}><FollowUpContent /></Suspense>;
}
