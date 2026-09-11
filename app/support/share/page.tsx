"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import SiteHeader from "@/components/SiteHeader";

const roleOptions = [
  ["parent", "Parent / Guardian"],
  ["coach", "Coach"],
  ["educator", "Teacher / Educator"],
  ["therapist", "Therapist / Counselor"],
  ["faith", "Faith Leader"],
  ["mentor", "Mentor / Trusted Adult"],
] as const;

type Created = { supporter_token: string; participant_token: string; expires_at: string };

export default function SupportSharePage() {
  const [role, setRole] = useState("parent");
  const [ageBand, setAgeBand] = useState("teen");
  const [supporterName, setSupporterName] = useState("");
  const [brief, setBrief] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const base = typeof window === "undefined" ? "" : window.location.origin;
  const supporterUrl = useMemo(() => created ? `${base}/support/receive?token=${encodeURIComponent(created.supporter_token)}` : "", [base, created]);
  const participantUrl = useMemo(() => created ? `${base}/support/follow-up?token=${encodeURIComponent(created.participant_token)}` : "", [base, created]);

  useEffect(() => {
    if (!supporterUrl) { setQr(""); return; }
    QRCode.toDataURL(supporterUrl, { width: 320, margin: 1 }).then(setQr).catch(() => setQr(""));
  }, [supporterUrl]);

  async function createHandoff() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/trusted-support/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", role, ageBand, supporterName, brief, selectedFields: ["brief"] }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not create handoff");
      setCreated(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create handoff");
    } finally { setBusy(false); }
  }

  async function shareLink() {
    if (!supporterUrl) return;
    if (navigator.share) await navigator.share({ title: "Z-Girl Support Handoff", text: "I chose to share a Z-Girl support brief with you.", url: supporterUrl });
    else await navigator.clipboard.writeText(supporterUrl);
  }

  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-7 lg:py-12">
      <p className="section-kicker">Secure supporter handoff</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-tight sm:text-5xl">Create the bridge to a trusted human.</h1>
      <p className="mt-4 max-w-3xl text-slate-300">Paste or refine the brief you chose to share. Z-Girl creates a private 30-day supporter link plus a separate participant follow-up link. The QR contains only an access token—not your reflection text.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.85fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-black">Support person
              <select value={role} onChange={(e)=>setRole(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/15 bg-[#071824] px-4 py-3 text-white">
                {roleOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm font-black">Reflection style
              <select value={ageBand} onChange={(e)=>setAgeBand(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/15 bg-[#071824] px-4 py-3 text-white">
                <option value="child">Child</option><option value="teen">Teen</option><option value="adult">Adult</option>
              </select>
            </label>
          </div>
          <label className="mt-5 block text-sm font-black">Their name <span className="font-normal text-slate-500">(optional)</span>
            <input value={supporterName} onChange={(e)=>setSupporterName(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/15 bg-[#071824] px-4 py-3 text-white" placeholder="First name or role" />
          </label>
          <label className="mt-5 block text-sm font-black">Your chosen support brief
            <textarea value={brief} onChange={(e)=>setBrief(e.target.value)} className="reflection-field mt-2 min-h-[280px]" placeholder="Paste the brief you reviewed in Support Handoff, or write the exact version you want this person to receive." />
          </label>
          <div className="mt-5 rounded-2xl border border-[#49d8c2]/20 bg-[#49d8c2]/[.05] p-4 text-sm leading-6 text-slate-300">Only create the link when this is the exact content you intend to share. The supporter cannot see your other Z-Girl reflections.</div>
          {error && <p className="mt-4 text-sm font-bold text-rose-300">{error}</p>}
          <button onClick={createHandoff} disabled={busy || !brief.trim()} className="button-primary mt-5 !min-h-0 disabled:opacity-40">{busy ? "Creating secure link…" : "Create secure supporter link"}</button>
        </section>

        <aside className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-7">
          {!created ? <div className="flex min-h-[420px] items-center justify-center text-center text-sm leading-6 text-slate-500">Your QR, supporter link, and private follow-up link will appear here.</div> : <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Ready to hand off</p>
            <h2 className="mt-2 font-display text-2xl font-black">Supporter access</h2>
            {qr && <img src={qr} alt="QR code for supporter handoff" className="mx-auto mt-5 w-64 rounded-2xl bg-white p-3" />}
            <button onClick={shareLink} className="button-primary mt-5 w-full !min-h-0">Share supporter link</button>
            <button onClick={()=>navigator.clipboard.writeText(supporterUrl)} className="button-secondary mt-3 w-full !min-h-0">Copy supporter link</button>
            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-4">
              <p className="text-xs font-black uppercase tracking-wider text-amber-200">Keep this participant link private</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Use it later to see whether your supporter responded and to bring the agreed next focus back into Z-Girl.</p>
              <button onClick={()=>navigator.clipboard.writeText(participantUrl)} className="mt-3 rounded-full border border-white/15 px-4 py-2 text-xs font-black">Copy my follow-up link</button>
            </div>
            <p className="mt-5 text-xs text-slate-500">Expires {new Date(created.expires_at).toLocaleDateString()}.</p>
          </div>}
        </aside>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/support" className="button-secondary !min-h-0">Back to Support Handoff</Link><Link href="/reflect" className="button-secondary !min-h-0">Start another reflection</Link></div>
    </div>
  </main>;
}
