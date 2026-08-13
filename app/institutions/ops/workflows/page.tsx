import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import InstitutionWorkflowConsole from "@/components/institutions/InstitutionWorkflowConsole";

export const metadata: Metadata = {
  title: "Institutional Agreement Workflow",
  description: "Restricted Z-Girl institutional agreement, renewal, expansion, approval, and delivery-handoff administration.",
  robots: { index: false, follow: false },
};

export default function InstitutionalWorkflowOpsPage() {
  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <section className="border-b border-white/10 bg-[#04111b]"><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><span className="eyebrow">Restricted institutional workflow</span><h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">Agreement, Renewal & Expansion Workflow</h1><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">Move institutional licensing from renewal evidence through human approval gates, executed agreement, release review, and a controlled contract-to-delivery handoff without collecting participant reflection data.</p></div><div className="flex flex-wrap gap-2"><Link href="/institutions/ops/portfolio" className="button-primary">Executive portfolio</Link><Link href="/institutions/ops/pipeline" className="button-secondary">Partner pipeline</Link><Link href="/institutions/ops" className="button-secondary">License administration</Link><Link href="/credentials/ops" className="button-secondary">Credential operations</Link><Link href="/institutions/agreement-workflow" className="button-secondary">Public workflow page</Link></div></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><InstitutionWorkflowConsole /></section>
  </main>;
}
