import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CredentialOpsPortal from "@/components/credentials/CredentialOpsPortal";

export const metadata: Metadata = {
  title: "Credential Operations",
  description: "Restricted Z-Girl credential operations portal.",
  robots: { index: false, follow: false },
};

export default function CredentialOperationsPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[#04111b]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><span className="eyebrow">Restricted operations</span><h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">Credential Operations Portal</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Manage adult facilitator/trainer candidates, evidence status, credential issuance, public verification, renewal, suspension/revocation, and audit history. Participant reflections are outside this system.</p></div>
            <Link href="/credentials/verify" className="button-secondary shrink-0 text-center">Public verifier</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><CredentialOpsPortal /></section>
    </main>
  );
}
