"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Credential = {
  credential_id: string;
  holder_name: string;
  organization: string | null;
  credential_level: string;
  scope: string;
  training_version: string;
  status: string;
  issue_date: string;
  expires_at: string;
  valid_now: boolean;
};

const levelLabel: Record<string, string> = {
  authorized_facilitator: "Z-Girl Authorized Facilitator",
  authorized_lead_facilitator: "Z-Girl Authorized Lead Facilitator",
  institutional_trainer: "Z-Girl Institutional Trainer — Authorized",
};

function displayDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function CredentialVerifier() {
  const searchParams = useSearchParams();
  const [credentialId, setCredentialId] = useState("");
  const [credential, setCredential] = useState<Credential | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runVerification(value: string) {
    setLoading(true);
    setError("");
    setCredential(null);
    setSearched(false);
    try {
      const response = await fetch(`/api/credentials/verify?id=${encodeURIComponent(value.trim())}`, { cache: "no-store" });
      const data = (await response.json()) as { ok?: boolean; found?: boolean; credential?: Credential | null; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Verification service unavailable");
      setCredential(data.credential || null);
      setSearched(true);
    } catch {
      setError("Credential verification is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = (searchParams.get("id") || "").trim().toUpperCase();
    if (!initial) return;
    setCredentialId(initial);
    void runVerification(initial);
    // Run only when the URL-provided ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function verify(event: FormEvent) {
    event.preventDefault();
    await runVerification(credentialId);
  }

  return (
    <div className="space-y-7">
      <form onSubmit={verify} className="rounded-[2rem] border border-white/10 bg-white/[.04] p-6 sm:p-8">
        <label htmlFor="credential-id" className="text-sm font-black uppercase tracking-[.15em] text-[#76ead6]">Credential ID</label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input id="credential-id" value={credentialId} onChange={(event) => setCredentialId(event.target.value.toUpperCase())} placeholder="ZG-AF-2026-XXXXXXXXXX" autoCapitalize="characters" autoComplete="off" maxLength={32} className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-[#04111b] px-4 py-3 text-base font-bold tracking-wide text-white outline-none transition focus:border-[#76ead6]/60" />
          <button type="submit" disabled={loading || credentialId.trim().length < 8} className="button-primary disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Checking…" : "Verify credential"}</button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">Verification requires the complete credential ID. This page does not provide a searchable directory of credential holders.</p>
      </form>

      {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-5 text-sm font-bold text-rose-100">{error}</div>}

      {searched && !credential && (
        <div className="rounded-[2rem] border border-amber-300/20 bg-amber-300/[.07] p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">No public match</p>
          <h2 className="mt-2 font-display text-3xl font-black">Credential not verified.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Check the credential ID carefully. A credential may also be unavailable for public verification if it has been disabled by credential operations.</p>
        </div>
      )}

      {credential && (
        <article className={`rounded-[2rem] border p-7 sm:p-9 ${credential.valid_now ? "border-[#76ead6]/30 bg-[#49d8c2]/[.07]" : "border-amber-300/20 bg-amber-300/[.06]"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.15em] ${credential.valid_now ? "bg-[#49d8c2] text-[#04151c]" : "bg-amber-200 text-amber-950"}`}>{credential.valid_now ? "Current credential" : "Not currently active"}</span>
            <span className="font-mono text-xs font-bold text-slate-400">{credential.credential_id}</span>
          </div>
          <h2 className="mt-6 font-display text-4xl font-black">{credential.holder_name}</h2>
          <p className="mt-2 text-lg font-bold text-[#b8fff3]">{levelLabel[credential.credential_level] || credential.credential_level}</p>
          {credential.organization && <p className="mt-1 text-sm text-slate-400">{credential.organization}</p>}

          <dl className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#04111b]/70 p-4"><dt className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Status</dt><dd className="mt-2 text-sm font-bold capitalize text-white">{credential.status.replaceAll("_", " ")}</dd></div>
            <div className="rounded-2xl border border-white/10 bg-[#04111b]/70 p-4"><dt className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Training version</dt><dd className="mt-2 text-sm font-bold text-white">{credential.training_version}</dd></div>
            <div className="rounded-2xl border border-white/10 bg-[#04111b]/70 p-4"><dt className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Issued</dt><dd className="mt-2 text-sm font-bold text-white">{displayDate(credential.issue_date)}</dd></div>
            <div className="rounded-2xl border border-white/10 bg-[#04111b]/70 p-4"><dt className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Expires</dt><dd className="mt-2 text-sm font-bold text-white">{displayDate(credential.expires_at)}</dd></div>
          </dl>

          <div className="mt-5 rounded-2xl border border-white/10 bg-[#04111b]/70 p-5">
            <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Authorized scope</p>
            <p className="mt-2 text-sm leading-7 text-slate-200">{credential.scope}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`/credentials/record/${encodeURIComponent(credential.credential_id)}`} className="button-primary">View authorization record</a>
            <a href={`/api/credentials/card?id=${encodeURIComponent(credential.credential_id)}`} className="button-secondary">Download credential card</a>
          </div>
          <p className="mt-6 text-xs leading-6 text-slate-500">Z-Girl authorization is a program credential. It is not professional licensure, academic accreditation, government certification, clinical qualification, or evidence that the holder is authorized beyond the scope shown above.</p>
        </article>
      )}
    </div>
  );
}
