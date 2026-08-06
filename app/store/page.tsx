import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CommerceLeadForm from "@/components/CommerceLeadForm";
import { commerceOffers } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Z-Girl Store",
  description:
    "Purchase or request Z-Girl Faith and Athlete reflection products, facilitator toolkits, licenses, and founding pilots.",
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; offer?: string }>;
}) {
  const params = await searchParams;
  const digitalOffers = commerceOffers.filter((offer) => offer.mode === "checkout");
  const institutionalOffers = commerceOffers.filter((offer) => offer.mode === "inquiry");
  const checkoutPending = params.status === "checkout-pending";

  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />

      <section className="relative isolate border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_16%,rgba(73,216,194,.17),transparent_32%),radial-gradient(circle_at_12%_72%,rgba(251,191,36,.12),transparent_34%)]" />
        <div className="hero-grid absolute inset-0 -z-10 opacity-25" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">Z-Girl product store</span>
              <span className="eyebrow eyebrow-muted">Founding launch pricing</span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              Start with one usable resource. Expand only when the audience is ready.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              Choose an individual pack, a facilitator toolkit, or an institutional implementation. Digital products are checkout-ready; organization-wide offers begin with a short inquiry.
            </p>
          </div>
        </div>
      </section>

      {checkoutPending && (
        <section className="border-b border-amber-300/20 bg-amber-300/10">
          <div className="mx-auto max-w-7xl px-5 py-4 text-sm leading-6 text-amber-50 sm:px-8 lg:px-12">
            <strong>Checkout activation is pending for this offer.</strong> Use the interest form below to reserve the founding price or request an invoice. No payment was collected.
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">Digital products</p>
          <h2 className="section-title">Immediate-use packs and toolkits</h2>
          <p className="section-copy">
            Each digital product includes online access to a print-ready resource. Checkout links can be activated independently without another platform release.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {digitalOffers.map((offer) => (
            <article
              key={offer.slug}
              className={`flex min-h-[31rem] flex-col rounded-[2rem] border p-6 sm:p-7 ${
                offer.featured
                  ? "border-[#49d8c2]/35 bg-[#0b2433] shadow-xl shadow-black/20"
                  : "border-white/10 bg-white/[.035]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">{offer.lane}</span>
                {offer.featured && <span className="rounded-full bg-[#49d8c2]/15 px-3 py-1 text-xs font-black text-[#a6f5e8]">Featured</span>}
              </div>
              <h3 className="mt-4 font-display text-3xl font-black">{offer.title}</h3>
              <p className="mt-2 text-sm font-bold text-slate-300">{offer.audience}</p>
              <p className="mt-4 text-sm leading-7 text-slate-400">{offer.summary}</p>
              <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
                {offer.includes.map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-[#76ead6]">✓</span>{item}</li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <p className="font-display text-2xl font-black">{offer.priceLabel}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{offer.launchNote}</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a href={`/api/checkout/${offer.slug}`} className="button-primary text-center">Purchase or reserve →</a>
                  {offer.resourceHref && <Link href={offer.resourceHref} className="button-secondary text-center">Preview resource</Link>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="section-kicker">Institutional offers</p>
            <h2 className="section-title">Licenses and supported pilots</h2>
            <p className="section-copy">These offers begin with a short scope review so the price matches the number of sites, facilitators, teams, and customization needs.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {institutionalOffers.map((offer) => (
              <article key={offer.slug} className="rounded-[2rem] border border-white/10 bg-[#071925] p-7">
                <span className="text-xs font-black uppercase tracking-[.18em] text-amber-200">{offer.lane}</span>
                <h3 className="mt-3 font-display text-3xl font-black">{offer.title}</h3>
                <p className="mt-2 text-sm font-bold text-slate-300">{offer.audience}</p>
                <p className="mt-4 text-sm leading-7 text-slate-400">{offer.summary}</p>
                <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
                  {offer.includes.map((item) => <li key={item} className="flex gap-2"><span className="text-amber-200">✓</span>{item}</li>)}
                </ul>
                <p className="mt-6 font-display text-2xl font-black">{offer.priceLabel}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{offer.launchNote}</p>
                <a href={`/api/checkout/${offer.slug}`} className="mt-5 inline-flex rounded-full bg-amber-300 px-5 py-3 text-sm font-black text-[#201400] transition hover:bg-amber-200">Request scope and founding terms →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="interest" className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:px-12">
        <CommerceLeadForm
          leadType="product-interest"
          defaultOffer={params.offer || ""}
          heading="Reserve a founding price or request an invoice."
          intro="Use this form when checkout is not active yet, when your organization needs an invoice, or when you need help choosing the correct license."
          submitLabel="Send product inquiry"
        />
      </section>
    </main>
  );
}
