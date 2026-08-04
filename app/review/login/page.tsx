"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

export default function ReviewLoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/review/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Access could not be verified.");
      window.location.assign("/review");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Access could not be verified.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#061521] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0b2030] p-7 shadow-2xl shadow-black/30 sm:p-9">
        <div className="flex items-center gap-4">
          <span className="relative h-14 w-14 overflow-hidden rounded-2xl border border-[#76ead6]/25">
            <Image src="/icons/zgirl-icon-1024.png" alt="" fill sizes="56px" className="object-cover" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Internal review</p>
            <h1 className="font-display text-2xl font-black">Native-language portal</h1>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-300">
          Candidate recordings are confidential and not approved for public use. Enter the access code supplied separately by the Z-Girl product owner.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-black text-slate-200">
            Review access code
            <input
              type="password"
              autoComplete="current-password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              className="mt-2 min-h-12 w-full rounded-2xl border border-white/15 bg-[#061521] px-4 text-white outline-none focus:border-[#49d8c2] focus:ring-4 focus:ring-[#49d8c2]/15"
            />
          </label>
          {error && <p role="alert" className="rounded-xl border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
          <button disabled={busy || !code.trim()} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? "Verifying…" : "Open protected workspace"}
          </button>
        </form>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Access expires after eight hours. Review records remain in this browser until you export or clear them.
        </p>
      </section>
    </main>
  );
}
