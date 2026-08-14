import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import OperatorSecuritySelfService from "@/components/institutions/OperatorSecuritySelfService";

export const metadata:Metadata={title:"Institutional Operator Security",description:"Restricted named operator session and personal access security for Z-Girl institutional operations.",robots:{index:false,follow:false}};

export default function OperatorSecurityPage(){return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="border-b border-white/10 bg-[#04111b]"><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><span className="eyebrow">Restricted operator security · v3.5</span><h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">My Institutional Access Security</h1><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">Review the identity attached to this session and rotate your own personal access code without receiving broader identity-administration authority.</p></div><div className="flex gap-2"><Link href="/institutions/ops/portfolio" className="button-primary">Institutional operations</Link><Link href="/institutions/auth" className="button-secondary">Sign-in options</Link></div></div></div></section><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><OperatorSecuritySelfService/></section></main>}
