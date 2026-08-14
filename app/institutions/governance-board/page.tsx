import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import BoardGovernanceWorkspace from "@/components/institutions/BoardGovernanceWorkspace";

export const metadata:Metadata={
 title:"Board Governance Workspace | Z-Girl",
 description:"Restricted institutional board-governance calendar, evidence and action-owner workspace.",
 robots:{index:false,follow:false}
};

export default function GovernanceBoardPage(){return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12"><span className="eyebrow">Restricted institutional operations · v3.9</span><h1 className="mt-4 max-w-5xl font-display text-5xl font-black sm:text-6xl">Board Governance Workspace</h1><p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">Build leadership-ready governance packets from authorized institutional calendars and evidence records, export board working files, and preserve a frozen administrative snapshot for review.</p><div className="mt-10"><BoardGovernanceWorkspace/></div></section></main>}
