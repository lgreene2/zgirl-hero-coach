import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Institutional License Administration",
  description: "A governed Z-Girl operating layer for institutional licenses, credential seats, renewals, sites, and facilitator authorization linkage.",
};

const capabilities = [
  ["Institution records", "Create a controlled organization record for a school, district, university, congregation, team, municipality, nonprofit, or youth-serving partner."],
  ["Defined license terms", "Track pilot, annual, multi-site, and Train-the-Trainer license scope by term, approved profiles, seat limits, site limits, trainer limits, and agreement status."],
  ["Credential seats", "Allocate adult facilitator and trainer seats, connect a seat to an issued Z-Girl program credential, and release or block authority without changing participant data."],
  ["Multi-site administration", "Associate credential seats with approved schools, campuses, congregations, teams, departments, programs, or branches under one institution."],
  ["Renewal governance", "Surface licenses entering the 90-day renewal window, record renewals, and automatically block institutional seat authority after a license expires."],
  ["Roster operations", "Import adult facilitator/trainer CSV rosters and export a controlled institutional credential roster without student, athlete, youth, or reflection records."],
];

const boundaries = [
  "Institutional licensing does not create access to private participant reflections.",
  "A lapsed institutional license blocks organizational delivery authority; it does not silently revoke an individual facilitator credential.",
  "Credential status, license status, agreement status, and commercial payment status remain distinct governance records.",
  "No student, youth-athlete, clinical, counseling, diagnosis, safeguarding narrative, or private reflection data belongs in the institutional license console.",
  "Commercial checkout remains gated until the approved merchant of record is configured.",
];

export default function LicenseAdministrationPage(){
  return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="relative isolate overflow-hidden border-b border-white/10"><div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_16%,rgba(73,216,194,.17),transparent_34%),radial-gradient(circle_at_15%_70%,rgba(251,191,36,.10),transparent_30%)]"/><div className="hero-grid absolute inset-0 -z-10 opacity-20"/><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><span className="eyebrow">Institutional operating layer</span><h1 className="mt-5 max-w-5xl font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">License the implementation. Govern the people authorized to deliver it.</h1><p className="mt-7 max-w-4xl text-lg leading-8 text-slate-300">Z-Girl Institutional License Administration connects the institutional agreement, approved sites, facilitator/trainer seats, individual program credentials, and renewal lifecycle without turning private reflection into institutional surveillance.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/partners#interest" className="button-primary">Request institutional fit review</Link><Link href="/institutions/train-the-trainer" className="button-secondary">Train-the-Trainer pathway</Link><Link href="/institutions/implementation-kit" className="button-secondary">Implementation kit</Link></div></div></section><section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12"><p className="section-kicker">What the layer manages</p><h2 className="section-title">One governed chain from agreement to authorized delivery.</h2><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{capabilities.map(([title,copy])=><article key={title} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7"><h3 className="font-display text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-400">{copy}</p></article>)}</div></section><section className="border-y border-white/10 bg-[#04111b]"><div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12"><p className="section-kicker">Governance boundary</p><h2 className="section-title">Institutional scale does not expand private-data access.</h2><div className="mt-8 grid gap-3">{boundaries.map(item=><div key={item} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm leading-7 text-slate-300">✓ {item}</div>)}</div></div></section><section className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 lg:px-12"><p className="section-kicker">Product ladder</p><h2 className="section-title">Pilot → Annual License → Multi-Site → Train-the-Trainer</h2><p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-400">The administration layer is designed to support repeatable institutional revenue and licensing while preserving the existing Z-Girl privacy, credential, implementation, and merchant-of-record boundaries.</p><Link href="/partners#interest" className="button-primary mt-8 inline-flex">Start institutional fit review</Link></section></main>;
}
