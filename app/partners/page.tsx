import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CommerceLeadForm from "@/components/CommerceLeadForm";
import { getCommerceOffer } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Founding Partners",
  description:
    "Become a founding congregation, team, school, league, or youth-organization partner for the Z-Girl Hero Within reflection system.",
};

const partnerTypes = [
  {
    title: "Founding Congregation",
    copy: "Implement four guided sessions, orient up to five facilitators, and help shape the faith-profile and family-resource pathway.",
    price: "$750–$1,500 annual founding range",
    offer: "congregation-annual-license",
  },
  {
    title: "Founding Athlete Team",
    copy: "Run a supported four-week mindset and character pilot with coach orientation, athlete resources, family communication, and findings.",
    price: "$1,500–$2,500 founding range",
    offer: "athlete-team-pilot",
  },
  {
    title: "Design Partner",
    copy: "Bring approved content, accessibility requirements, or a specialized implementation setting and co-design a controlled profile or pilot.",
    price: "Scoped after a short discovery review",
    offer: "",
  },
];

const benefits = [
  "Founding pricing protected for the agreed pilot or license term",
  "Direct implementation support and orientation",
  "Influence over practical workflow and resource improvements",
  "Clear privacy, accessibility, safeguarding, and content-governance boundaries",
  "A findings summary and recommended next-step pathway",
  "Priority consideration for future licensing and train-the-trainer opportunities",
];

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string }>;
}) {
  const params = await searchParams;
  const selected = params.offer ? getCommerceOffer(params.offer) : undefined;

  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />

      <section className="relative isolate border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_16%,rgba(251,191,36,.17),transparent_32%),radial-gradient(circle_at_12%_72%,rgba(73,216,194,.13),transparent_34%)]" />
        <div className="hero-grid absolute inset-0 -z-10 opacity-25" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">Founding partner program</span>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-amber-100">Limited early implementations</span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              Help prove what works before Z-Girl scales it.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              Founding partners receive a lean, supported implementation—not an unfinished technology experiment. Together, we validate adoption, accessibility, family communication, and practical value.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#interest" className="rounded-full bg-amber-300 px-6 py-3.5 text-center text-sm font-black text-[#201400] transition hover:bg-amber-200">Request founding terms →</a>
              <Link href="/store" className="button-secondary text-center">View all offers</Link>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <section className="border-b border-[#49d8c2]/20 bg-[#49d8c2]/10">
          <div className="mx-auto max-w-7xl px-5 py-4 text-sm leading-6 text-slate-100 sm:px-8 lg:px-12">
            You selected <strong>{selected.title}</strong>. The inquiry form below is pre-set for that pathway.
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">Choose a partner path</p>
          <h2 className="section-title">One clear implementation. One measurable learning cycle.</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {partnerTypes.map((partner) => (
            <article key={partner.title} className="flex min-h-[25rem] flex-col rounded-[2rem] border border-white/10 bg-white/[.035] p-7">
              <span className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Founding pathway</span>
              <h3 className="mt-3 font-display text-3xl font-black">{partner.title}</h3>
              <p className="mt-4 flex-1 text-sm leading-7 text-slate-400">{partner.copy}</p>
              <p className="font-display text-2xl font-black">{partner.price}</p>
              <Link
                href={`/partners${partner.offer ? `?offer=${partner.offer}` : ""}#interest`}
                className="mt-5 text-sm font-black text-[#76ead6] transition hover:text-white"
              >
                Select this pathway →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12">
          <div>
            <p className="section-kicker">Founding partner value</p>
            <h2 className="section-title">More than access to a webpage.</h2>
            <p className="section-copy">The partnership includes the human implementation work required to make the product usable and responsible.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl border border-white/10 bg-[#071925] p-4 text-sm font-bold leading-6 text-slate-200">
                <span className="mr-2 text-[#76ead6]">✓</span>{benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6">
            <span className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">1 · Confirm</span>
            <h2 className="mt-3 text-2xl font-black">Scope and readiness</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Confirm the audience, decision-maker, timeline, safeguarding structure, and implementation owner.</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6">
            <span className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">2 · Implement</span>
            <h2 className="mt-3 text-2xl font-black">Run the focused cycle</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Orient facilitators or coaches, communicate with families, and complete the agreed four-session or four-week sequence.</p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-6">
            <span className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">3 · Decide</span>
            <h2 className="mt-3 text-2xl font-black">Review and scale</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">Use feedback and findings to improve, renew, expand, license, or stop—without being trapped in a large platform commitment.</p>
          </article>
        </div>
      </section>

      <section id="interest" className="mx-auto max-w-5xl px-5 pb-20 sm:px-8 lg:px-12">
        <CommerceLeadForm
          leadType="founding-partner"
          defaultOffer={params.offer || ""}
          heading="Request founding-partner terms."
          intro="Share the organization, audience, timeline, and desired pathway. Do not include private information about youth, athletes, or safeguarding incidents."
          submitLabel="Send founding-partner inquiry"
        />
      </section>
    </main>
  );
}
