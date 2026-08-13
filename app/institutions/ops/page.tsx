import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import InstitutionLicenseConsole from "@/components/institutions/InstitutionLicenseConsole";

export const metadata: Metadata = {
  title: "Institutional License Administration",
  description: "Restricted Z-Girl institutional credential-seat and license administration.",
  robots: { index: false, follow: false },
};

export default function InstitutionalOpsPage(){
  return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="border-b border-white/10 bg-[#04111b]"><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><span className="eyebrow">Restricted institutional administration</span><h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">Institutional Credential & License Administration</h1><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">Manage organization records, sites, approved license terms, credential-seat allocations, adult facilitator/trainer roster imports, institutional renewal tracking, and governance reporting without collecting participant reflection data.</p></div><div className="flex flex-wrap gap-2"><Link href="/institutions/ops/portfolio" className="button-primary">Executive portfolio</Link><Link href="/institutions/ops/pipeline" className="button-secondary">Partner pipeline</Link><Link href="/institutions/ops/workflows" className="button-secondary">Agreement workflows</Link><Link href="/credentials/ops" className="button-secondary">Credential operations</Link><Link href="/institutions/license-administration" className="button-secondary">Public product page</Link></div></div></div></section><section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12"><InstitutionLicenseConsole/></section></main>;
}
