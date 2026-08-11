import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import InstitutionPartnerPipelineConsole from "@/components/institutions/InstitutionPartnerPipelineConsole";

export const metadata: Metadata = {
  title: "Institutional Partner Pipeline",
  description: "Restricted Z-Girl institutional prospect, proposal, follow-up, and contract-handoff operations.",
  robots: { index: false, follow: false },
};

export default function InstitutionPartnerPipelinePage() {
  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <section className="border-b border-white/10 bg-[#04111b]"><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><span className="eyebrow">Restricted institutional growth operations</span><h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">Partner Pipeline & Contract Operations</h1><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">Manage institutional prospects, fit review, decision-makers, follow-up, proposals, and governed contract handoff without storing participant reflection or case data.</p></div><div className="flex flex-wrap gap-2"><Link href="/institutions/ops/workflows" className="button-primary">Agreement workflows</Link><Link href="/institutions/ops" className="button-secondary">License administration</Link><Link href="/credentials/ops" className="button-secondary">Credential operations</Link><Link href="/institutions/partner-pipeline" className="button-secondary">Public product page</Link></div></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><InstitutionPartnerPipelineConsole /></section>
  </main>;
}
