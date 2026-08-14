import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import InstitutionOperatorAccess from "@/components/institutions/InstitutionOperatorAccess";

export const metadata:Metadata={title:"Institutional Operator Access",description:"Restricted named operator access and SSO-ready identity foundation for Z-Girl institutional operations.",robots:{index:false,follow:false}};

export default function InstitutionAuthPage(){return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="border-b border-white/10 bg-[#04111b]"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12"><span className="eyebrow">Restricted institutional access · v3.5</span><h1 className="mt-4 max-w-4xl font-display text-4xl font-black sm:text-5xl">Named operator identity, least-privilege roles, and an SSO-ready access boundary.</h1><p className="mt-5 max-w-4xl text-base leading-8 text-slate-400">Use named access for routine institutional operations. The legacy owner access code remains a break-glass path and should not be shared as a normal team login.</p><div className="mt-6"><Link href="/credentials/ops" className="text-xs font-black uppercase tracking-[.16em] text-slate-500 hover:text-white">Break-glass owner access →</Link></div></div></section><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><InstitutionOperatorAccess/></section></main>}
