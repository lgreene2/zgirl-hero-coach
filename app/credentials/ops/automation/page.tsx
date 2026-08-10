import type { Metadata } from "next";
import Link from "next/link";

import SiteHeader from "@/components/SiteHeader";
import CredentialAutomationPortal from "@/components/credentials/CredentialAutomationPortal";

export const metadata: Metadata = {
  title: "Credential Renewal Automation",
  description: "Restricted Z-Girl credential renewal, delivery queue, records, and roster operations.",
  robots: { index: false, follow: false },
};

export default function CredentialAutomationPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[#04111b]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">Restricted credential automation</span>
              <h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">Issuance & Renewal Automation</h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">Operate the 90/60/30-day renewal schedule, controlled delivery queue, lapse automation, printable authorization records, QR credential cards, and institutional roster export.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/credentials/ops" className="button-secondary">Credential operations</Link>
              <Link href="/credentials/verify" className="button-secondary">Public verifier</Link>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><CredentialAutomationPortal /></section>
    </main>
  );
}
