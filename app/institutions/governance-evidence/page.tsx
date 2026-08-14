import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import AccessGovernanceEvidenceConsole from "@/components/institutions/AccessGovernanceEvidenceConsole";

export const metadata:Metadata={title:"Institutional Governance Evidence",description:"Institutional administrative governance evidence workspace.",robots:{index:false,follow:false}};

export default function GovernanceEvidencePage(){return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12"><AccessGovernanceEvidenceConsole/></section></main>}
