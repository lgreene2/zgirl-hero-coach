import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PilotOperationsConsole from "@/components/institutions/PilotOperationsConsole";

export const metadata:Metadata={title:"Institutional Pilot Workspace | Z-Girl",description:"Restricted Z-Girl institutional pilot implementation workspace.",robots:{index:false,follow:false}};

export default async function InstitutionalPilotWorkspace({params}:{params:Promise<{id:string}>}){const {id}=await params;return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="border-b border-white/10 bg-[#04111b]"><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12"><div className="flex items-center justify-between gap-4"><div><span className="eyebrow">Institutional implementation workspace · v3.11</span><h1 className="mt-2 font-display text-3xl font-black">Operational Pilot</h1></div><Link href="/institutions/ops/pilots" className="button-secondary">Pilot Command Center</Link></div></div></section><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><PilotOperationsConsole pilotId={id}/></section></main>}
