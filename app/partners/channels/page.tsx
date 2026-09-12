import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CommerceLeadForm from "@/components/CommerceLeadForm";

export const metadata: Metadata = {
  title: "Z-Girl Partner Channels",
  description:
    "Governed referral, reseller, sponsored-access, and community funding pathways for Z-Girl.",
};

const channels = [
  {
    name: "Referral / Affiliate",
    badge: "Lead generation",
    summary:
      "Introduce qualified schools, teams, congregations, families, or organizations to an approved Z-Girl offer.",
    earns: "Future referral fee on eligible closed commercial business after written program activation.",
    protects: [
      "Clear affiliate disclosure",
      "No commission-driven clinical, counseling, or safeguarding recommendation",
      "No access to participant reflection data",
      "Attribution window and eligible-offer rules defined in writing",
    ],
  },
  {
    name: "Authorized Reseller / Implementation Partner",
    badge: "Channel sales + delivery",
    summary:
      "Sell approved Z-Girl licenses or support implementation within an authorized market or customer base.",
    earns: "Future reseller margin and/or implementation-service revenue under an executed agreement.",
    protects: [
      "Approved pricing, territory, and brand use",
      "Training and implementation-quality requirements",
      "Customer relationship and support responsibilities defined",
      "No authority to alter safety, privacy, or professional boundaries",
    ],
  },
  {
    name: "Sponsored Access",
    badge: "Underwrite access",
    summary:
      "A business, foundation, institution, or community partner funds access for a defined team, school, family group, or community population.",
    earns: "Z-Girl receives contracted commercial sponsorship or license revenue; the beneficiary receives approved access.",
    protects: [
      "Sponsor never receives private reflection content",
      "Recognition is separated from participant surveillance",
      "Population, term, access scope, and reporting are explicit",
      "Only aggregate, non-identifying reporting where approved",
    ],
  },
  {
    name: "Community Fundraising",
    badge: "Mission-aligned access",
    summary:
      "An approved nonprofit or community campaign raises funds to expand access for an identified public-benefit purpose.",
    earns: "Funds are governed by the authorized entity and purpose; commercial licenses remain separately documented.",
    protects: [
      "Entity-specific charitable claims and receipts",
      "Separate nonprofit and commercial accounting",
      "No implied tax deductibility without authorization",
      "No participant-level data exchanged for sponsorship or donations",
    ],
  },
] as const;

export default function PartnerChannelsPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <section className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,77,184,.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(73,216,194,.16),transparent_38%),#081b29] p-7 shadow-2xl shadow-black/25 sm:p-10 lg:p-12">
          <p className="section-kicker">Z-Girl Partner Network — Candidate</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-black tracking-tight sm:text-6xl">
            Grow access without compromising trust.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Z-Girl can scale through referrals, authorized resellers, sponsored access, and community funding—while participants remain in control of their stories and private reflections.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#apply" className="button-primary !min-h-0">Explore a partner pathway →</a>
            <Link href="/partners" className="button-secondary !min-h-0">Founding implementations</Link>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {channels.map((channel) => (
            <article key={channel.name} className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-6 sm:p-7">
              <span className="inline-flex rounded-full border border-[#49d8c2]/20 bg-[#49d8c2]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-[#9af3e4]">
                {channel.badge}
              </span>
              <h2 className="mt-4 font-display text-3xl font-black">{channel.name}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{channel.summary}</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-200">Commercial model</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{channel.earns}</p>
              </div>
              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#76ead6]">Required guardrails</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  {channel.protects.map((item) => <li key={item}>✓ {item}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-4 rounded-[2rem] border border-amber-200/20 bg-amber-200/[.045] p-6 sm:grid-cols-3 sm:p-8">
          <div><p className="section-kicker">Status</p><p className="mt-2 text-sm leading-6 text-slate-300">Applications may be collected. Commission schedules, reseller margins, territories, sponsor recognition, and fundraising authority are not active yet.</p></div>
          <div><p className="section-kicker">Privacy</p><p className="mt-2 text-sm leading-6 text-slate-300">Partner economics never create access to private reflections, youth records, counseling notes, safeguarding narratives, or participant surveillance.</p></div>
          <div><p className="section-kicker">Activation</p><p className="mt-2 text-sm leading-6 text-slate-300">Each channel requires approved written terms, seller/entity authority, disclosure rules, and owner activation before money or customer entitlements flow.</p></div>
        </section>

        <section id="apply" className="mx-auto mt-10 max-w-5xl">
          <CommerceLeadForm
            leadType="founding-partner"
            heading="Apply to become a Z-Girl distribution or access partner."
            intro="Tell us which pathway fits your organization, audience, reach, implementation capability, or sponsored-access goal. Do not include private information about a child, athlete, client, student, or participant."
            submitLabel="Submit partner interest"
            showOfferSelect={false}
          />
        </section>
      </div>
    </main>
  );
}
