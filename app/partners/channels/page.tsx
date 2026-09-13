import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CommerceLeadForm from "@/components/CommerceLeadForm";
import CommercialHumanHero from "@/components/CommercialHumanHero";

export const metadata: Metadata = {title:"Z-Girl Partner Channels",description:"Referral, reseller, sponsored-access, and community funding pathways for Z-Girl."};

const channels=[
  {name:"Referral / Affiliate",badge:"Introduce + earn",icon:"↗",value:"Connect Z-Girl with a qualified school, team, congregation, family, or organization.",bestFor:"Community connectors, advocates, creators, consultants, and aligned organizations.",how:"Refer an eligible opportunity. When an approved commercial engagement closes under an active referral program, the referral may qualify for compensation."},
  {name:"Reseller / Implementation Partner",badge:"Sell + support",icon:"◎",value:"Bring approved Z-Girl offerings to customers and help them launch successfully.",bestFor:"Consultants, training organizations, service providers, agencies, and implementation partners.",how:"Operate under an approved agreement covering offers, pricing, territory, brand use, customer responsibility, and implementation standards."},
  {name:"Sponsored Access",badge:"Fund access",icon:"✦",value:"Underwrite Z-Girl access for a school, team, youth program, congregation, family group, or community.",bestFor:"Businesses, foundations, institutions, employers, and philanthropic partners.",how:"Sponsor a defined population or implementation. Sponsors receive approved recognition and aggregate reporting—not private participant reflections."},
  {name:"Community Fundraising",badge:"Mobilize support",icon:"♡",value:"Help raise resources so more people can access Z-Girl through an approved community campaign.",bestFor:"Nonprofits, community organizations, schools, teams, ministries, and local campaigns.",how:"Use an approved entity and campaign purpose. Charitable funds and commercial Z-Girl licensing remain separately governed."},
] as const;

export default function PartnerChannelsPage(){return <main className="min-h-screen bg-[#061521] text-white"><SiteHeader/><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
  <CommercialHumanHero variant="partner" ctaHref="#pathways" ctaLabel="Explore partner pathways"/>

  <section id="pathways" className="mt-12">
    <p className="section-kicker">Ways to partner</p>
    <h1 className="section-title max-w-4xl">Choose the role that fits how you create impact.</h1>
    <p className="section-copy max-w-3xl">Z-Girl can grow through trusted introductions, authorized delivery partners, sponsored access, and community-led funding—without compromising participant privacy or human-centered support.</p>

    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {channels.map(channel=><article key={channel.name} className="group rounded-[2rem] border border-white/10 bg-[#0b2030]/90 p-6 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-[#49d8c2]/30 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><span className="inline-flex rounded-full border border-[#49d8c2]/20 bg-[#49d8c2]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-[#9af3e4]">{channel.badge}</span><h2 className="mt-4 font-display text-3xl font-black">{channel.name}</h2></div><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[.04] text-2xl text-[#76ead6]">{channel.icon}</span></div>
        <p className="mt-4 text-base font-semibold leading-7 text-white">{channel.value}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#76ead6]">Best for</p><p className="mt-2 text-sm leading-6 text-slate-300">{channel.bestFor}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#ff8bd0]">How it works</p><p className="mt-2 text-sm leading-6 text-slate-300">{channel.how}</p></div></div>
        <a href="#apply" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#76ead6]">I’m interested in this pathway →</a>
      </article>)}
    </div>
  </section>

  <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[.025] p-6 sm:p-8">
    <div className="max-w-3xl"><p className="section-kicker">Trust + program terms</p><h2 className="mt-2 font-display text-3xl font-black">Simple on the surface. Governed underneath.</h2><p className="mt-3 text-sm leading-7 text-slate-300">Partner economics never create access to private reflections or participant-level support records. Exact commissions, margins, territories, sponsorship benefits, charitable claims, reporting, and customer entitlements become active only through approved written terms.</p></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 p-4"><p className="font-black text-[#76ead6]">Privacy stays intact</p><p className="mt-2 text-sm leading-6 text-slate-400">No partner receives private reflection content simply because they referred, sold, sponsored, or funded access.</p></div><div className="rounded-2xl border border-white/10 p-4"><p className="font-black text-[#76ead6]">Commercial terms are explicit</p><p className="mt-2 text-sm leading-6 text-slate-400">Compensation, territory, pricing, attribution, and responsibilities are defined before activation.</p></div><div className="rounded-2xl border border-white/10 p-4"><p className="font-black text-[#76ead6]">Charitable activity stays separate</p><p className="mt-2 text-sm leading-6 text-slate-400">Fundraising and tax claims require the appropriate authorized entity, disclosures, and accounting.</p></div></div>
  </section>

  <section id="apply" className="mx-auto mt-10 max-w-5xl"><CommerceLeadForm leadType="founding-partner" heading="Tell us how you want to partner with Z-Girl." intro="Choose the pathway that best fits your organization, audience, reach, implementation capability, or sponsored-access goal. Do not include private information about a child, athlete, client, student, or participant." submitLabel="Submit partner interest" showOfferSelect={false}/></section>
  <div className="mt-8"><Link href="/partners" className="button-secondary !min-h-0">View founding implementations</Link></div>
</div></main>}
