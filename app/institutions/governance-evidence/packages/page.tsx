import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import AccessGovernancePackageControls from "@/components/institutions/AccessGovernancePackageControls";

export const metadata:Metadata={title:"Governance Evidence Packages",description:"Institutional governance evidence package generation workspace.",robots:{index:false,follow:false}};

export default function GovernanceEvidencePackagesPage(){return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-12"><AccessGovernancePackageControls/></section></main>}
