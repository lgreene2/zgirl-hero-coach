import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import CredentialVerifier from "@/components/credentials/CredentialVerifier";

export const metadata: Metadata = {
  title: "Verify a Z-Girl Credential",
  description: "Verify the current public status, scope, level, and term of a Z-Girl program credential using its exact credential ID.",
};

export default function CredentialVerificationPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_12%,rgba(73,216,194,.16),transparent_34%),radial-gradient(circle_at_15%_75%,rgba(251,191,36,.10),transparent_30%)]" />
        <div className="hero-grid absolute inset-0 -z-10 opacity-20" />
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <span className="eyebrow">Credential verification</span>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl">Verify a Z-Girl program credential.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Use the exact credential ID printed on an authorization record to confirm the public credential level, authorized scope, issue and expiration dates, and current status.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/institutions/train-the-trainer" className="button-secondary">About facilitator authorization</Link>
            <Link href="/institutions" className="button-secondary">Institutional pathways</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:px-12">
        <Suspense fallback={<div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-8 text-sm text-slate-400">Loading credential verifier…</div>}><CredentialVerifier /></Suspense>
      </section>

      <section className="border-t border-white/10 bg-[#04111b]">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-12">
          <h2 className="font-display text-2xl font-black">Privacy by design</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">This verifier is not a people-search directory. It requires an exact credential ID and returns only approved public credential fields. Candidate email, assessment details, practicum records, operational history, renewal records, and private participant reflections are never returned here.</p>
        </div>
      </section>
    </main>
  );
}
