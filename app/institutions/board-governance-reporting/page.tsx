import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata:Metadata={
 title:"Board Governance Calendar & Executive Evidence Pack | Z-Girl",
 description:"Turn institutional governance dates, evidence and action ownership into board-ready administrative reporting and calendar exports."
};

const cards=[
 ["Board-ready calendar","Bring annual review, access governance, evidence review, SSO, offboarding, renewal and other administrative dates into one leadership view."],
 ["Frozen executive pack","Create a point-in-time board or committee packet from authorized institutional governance records without rewriting history later."],
 ["Evidence index","Present governance reports, attestations, audit packages and retention-review metadata in a structured administrative index."],
 ["Action-owner report","Show which governance owners have open, due and completed items and the next date requiring attention."],
 ["Calendar export","Export governance dates as ICS for Outlook, Google Calendar and other standards-compatible calendar systems."],
 ["Evidence exports","Export board-working CSV indexes for evidence and action owners without exposing participant reflections or case information."]
];

export default function BoardGovernanceReportingPage(){
 return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12"><span className="eyebrow">Institutional governance reporting · v3.9</span><h1 className="mt-4 max-w-5xl font-display text-5xl font-black sm:text-6xl">Board Governance Calendar & Executive Evidence Pack</h1><p className="mt-6 max-w-4xl text-lg leading-8 text-slate-300">Turn the institutional governance calendar into leadership-ready reporting: scheduled obligations, evidence indexes, action ownership, frozen board packets and standards-based calendar exports—without turning participant reflection into administrative surveillance.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/institutions/governance-board" className="button-primary">Open board governance workspace</Link><Link href="/institutions/governance-calendar" className="button-secondary">Governance calendar</Link><Link href="/institutions/access-governance-evidence" className="button-secondary">Evidence & audit pack</Link></div><div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{cards.map(([title,body])=><article key={title} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><h2 className="font-display text-2xl font-black">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-400">{body}</p></article>)}</div><aside className="mt-10 rounded-[2rem] border border-amber-300/20 bg-amber-300/[.06] p-6 text-sm leading-7 text-amber-50"><strong>Administrative governance record only.</strong> A Z-Girl board pack is not a legal compliance opinion, regulatory certification, accreditation, independent audit opinion, clinical record or participant outcome report. Finalization freezes administrative evidence; it does not grant authority or change operational state.</aside></section></main>
}
