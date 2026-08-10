import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import SiteHeader from "@/components/SiteHeader";
import CredentialPrintActions from "@/components/credentials/CredentialPrintActions";
import { credentialLevelLabel, findPublicCredential, normalizeCredentialId } from "@/lib/credentials/public";

export const dynamic = "force-dynamic";

function displayDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Z-Girl Program Authorization ${normalizeCredentialId(id)}`,
    description: "Public Z-Girl program authorization record and exact-ID verification document.",
    robots: { index: false, follow: false },
  };
}

export default async function CredentialRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const credential = await findPublicCredential(id);
  if (!credential) notFound();

  const level = credentialLevelLabel[credential.credential_level] || credential.credential_level;

  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <div className="no-print"><SiteHeader /></div>
      <style>{`@media print{.no-print{display:none!important}body{background:#fff!important}.credential-record{box-shadow:none!important;border:1px solid #cbd5e1!important;color:#0f172a!important;background:#fff!important}.credential-record .muted{color:#475569!important}.credential-record .panel{background:#f8fafc!important;border-color:#e2e8f0!important}.credential-record .accent{color:#0f766e!important}}`}</style>

      <section className="no-print border-b border-white/10 bg-[#04111b]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12">
          <span className="eyebrow">Program authorization record</span>
          <h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">Z-Girl credential record</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">A printable, exact-ID public record for a governed Z-Girl facilitator or trainer authorization.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="no-print mb-6"><CredentialPrintActions credentialId={credential.credential_id} /></div>

        <article className="credential-record rounded-[2rem] border border-[#76ead6]/25 bg-white/[.04] p-7 shadow-2xl shadow-black/20 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[.15em] ${credential.valid_now ? "bg-[#49d8c2] text-[#04151c]" : "bg-amber-200 text-amber-950"}`}>
                  {credential.valid_now ? "Current program credential" : "Not currently active"}
                </span>
                <span className="accent font-mono text-xs font-bold text-[#76ead6]">{credential.credential_id}</span>
              </div>
              <p className="accent mt-8 text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Authorized holder</p>
              <h2 className="mt-3 font-display text-4xl font-black sm:text-5xl">{credential.holder_name}</h2>
              <p className="accent mt-3 text-xl font-black text-[#b8fff3]">{level}</p>
              {credential.organization && <p className="muted mt-2 text-base text-slate-400">{credential.organization}</p>}
            </div>

            <div className="panel flex shrink-0 flex-col items-center rounded-3xl border border-white/10 bg-white p-4 text-[#04151c]">
              <Image src={`/api/credentials/qr?id=${encodeURIComponent(credential.credential_id)}`} alt={`QR code to verify ${credential.credential_id}`} width={220} height={220} unoptimized />
              <p className="mt-2 text-xs font-black uppercase tracking-[.15em]">Scan to verify</p>
            </div>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="panel rounded-2xl border border-white/10 bg-[#04111b]/70 p-5"><dt className="muted text-xs font-black uppercase tracking-[.14em] text-slate-500">Status</dt><dd className="mt-2 text-sm font-black capitalize">{credential.status.replaceAll("_", " ")}</dd></div>
            <div className="panel rounded-2xl border border-white/10 bg-[#04111b]/70 p-5"><dt className="muted text-xs font-black uppercase tracking-[.14em] text-slate-500">Training version</dt><dd className="mt-2 text-sm font-black">{credential.training_version}</dd></div>
            <div className="panel rounded-2xl border border-white/10 bg-[#04111b]/70 p-5"><dt className="muted text-xs font-black uppercase tracking-[.14em] text-slate-500">Issued</dt><dd className="mt-2 text-sm font-black">{displayDate(credential.issue_date)}</dd></div>
            <div className="panel rounded-2xl border border-white/10 bg-[#04111b]/70 p-5"><dt className="muted text-xs font-black uppercase tracking-[.14em] text-slate-500">Expires</dt><dd className="mt-2 text-sm font-black">{displayDate(credential.expires_at)}</dd></div>
          </dl>

          <div className="panel mt-6 rounded-2xl border border-white/10 bg-[#04111b]/70 p-6">
            <p className="muted text-xs font-black uppercase tracking-[.14em] text-slate-500">Authorized scope</p>
            <p className="mt-3 text-sm font-bold leading-7">{credential.scope}</p>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-xs leading-6 text-slate-500 muted">
            <p><strong>Z-Girl program authorization boundary:</strong> This record confirms only the current Z-Girl program credential and scope shown above. It is not professional licensure, academic accreditation, government certification, clinical qualification, clergy authorization, sports-medicine qualification, or permission to access participant private reflections.</p>
            <p className="mt-3">Verification source: <Link href={`/credentials/verify?id=${encodeURIComponent(credential.credential_id)}`} className="accent font-bold text-[#76ead6]">zgirlinitiative.org credential verification</Link></p>
          </div>
        </article>
      </section>
    </main>
  );
}
