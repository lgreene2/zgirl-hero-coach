import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PilotOperationsConsole from "@/components/institutions/PilotOperationsConsole";
import GlsPilotCandidateQueue from "@/components/institutions/GlsPilotCandidateQueue";

export const metadata:Metadata={
 title:"Institutional Pilot Command Center | Z-Girl",
 description:"Restricted operational activation, onboarding, implementation evidence, renewal and expansion workspace for Z-Girl institutional pilots.",
 robots:{index:false,follow:false},
};

export default function InstitutionalPilotsPage(){return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="border-b border-white/10 bg-[#04111b]"><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><span className="eyebrow">Operational activation · v3.13</span><h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">Institutional Pilot Command Center</h1><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">Move qualified institutions from GLS handoff through governed onboarding, cohort activation, implementation evidence, closeout, renewal and expansion without creating a duplicate CRM.</p></div><div className="flex flex-wrap gap-2"><Link href="/institutions/ops/guide" className="button-primary">Guided orientation</Link><Link href="/institutions/ops/identity" className="button-secondary">Identity</Link><Link href="/institutions/ops/tenant" className="button-secondary">Tenant governance</Link><Link href="/institutions/partner-pipeline" className="button-secondary">Institutional lifecycle</Link></div></div></div></section><section className="mx-auto max-w-7xl space-y-6 px-5 py-10 sm:px-8 lg:px-12"><GlsPilotCandidateQueue/><div data-guide-target="pilot-operations"><PilotOperationsConsole/></div></section></main>}
