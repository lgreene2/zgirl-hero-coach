import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PilotEvidencePackage from "@/components/institutions/PilotEvidencePackage";

export const metadata:Metadata={title:"Pilot Evidence Package | Z-Girl",description:"Restricted institutional pilot implementation evidence package.",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="border-b border-white/10 bg-[#04111b]"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-7 sm:px-8 lg:px-12"><div><span className="eyebrow">Pilot evidence · v3.11</span><h1 className="mt-2 font-display text-3xl font-black">Implementation Evidence Package</h1></div><Link href={`/institutions/ops/pilots/${id}`} className="button-secondary">Pilot workspace</Link></div></section><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><PilotEvidencePackage pilotId={id}/></section></main>}
