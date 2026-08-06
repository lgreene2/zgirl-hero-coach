import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Faith & Values Hub",
  description:
    "Faith-aligned Z-Girl reflection resources for youth, families, congregations, and organizations using approved content profiles.",
};

const pathways = [
  {
    title: "Faith & Values",
    label: "Open to many traditions",
    copy: "Reflect on courage, forgiveness, gratitude, service, patience, compassion, responsibility, and hope.",
    href: "/faith/start",
    cta: "Start a sample",
  },
  {
    title: "Christian Reflection",
    label: "Starter pack",
    copy: "Bible-connected reflection prompts with optional prayer, trusted-adult guidance, and practical Hero Moves.",
    href: "/faith/christian",
    cta: "Explore Christian pack",
  },
  {
    title: "Catholic Faith & Virtue",
    label: "Preview edition",
    copy: "A Catholic-oriented concept built around scripture connections, virtue language, prayerful reflection, and service.",
    href: "/faith/catholic",
    cta: "View Catholic preview",
  },
  {
    title: "Congregation Toolkit",
    label: "Self-service group use",
    copy: "Facilitator guidance, family communication, accessible participation, and a four-session implementation path.",
    href: "/faith/congregations",
    cta: "See the toolkit",
  },
  {
    title: "Create a Faith Profile",
    label: "Bring approved content",
    copy: "Submit your tradition, terminology, approved values, text references, prayer preferences, and youth-safety boundaries.",
    href: "/faith/create-a-profile",
    cta: "Start profile intake",
  },
];

const safeguards = [
  "No implied endorsement by a church, denomination, parish, diocese, or religious authority without written approval.",
  "No forced disclosure, public scoring, or collection of a young person’s private reflection words.",
  "Faith content is identified as Z-Girl-approved, institution-approved, or family-selected.",
  "Prayer and faith practices remain optional; users may choose quiet reflection or no religious closing.",
  "Z-Girl does not act as clergy, spiritual direction, therapy, confession, counseling, or emergency support.",
];

export default function FaithHubPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#061521] text-white">
      <SiteHeader />
      <section className="relative isolate border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_18%,rgba(251,191,36,0.17),transparent_31%),radial-gradient(circle_at_12%_72%,rgba(73,216,194,0.12),transparent_34%)]" />
        <div className="hero-grid absolute inset-0 -z-10 opacity-30" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-12 lg:py-24">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">New market lane</span>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-amber-100">Self-service access</span>
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[.25em] text-amber-200">Z-Girl Faith &amp; Values Hub</p>
            <h1 className="mt-4 font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              Connect everyday choices with faith, values, and practical action.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              A guided reflection system for youth, families, and faith communities. Start immediately with a public sample, use a ready-made pack, or create a profile from content your organization already approves.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/faith/start" className="rounded-full bg-amber-300 px-6 py-3.5 text-sm font-black text-[#201400] transition hover:bg-amber-200">Start a faith-aligned reflection →</Link>
              <Link href="/faith/congregations" className="button-secondary">Use with a congregation</Link>
            </div>
          </div>

          <aside className="rounded-[2.1rem] border border-amber-300/20 bg-[#0a2030]/90 p-6 shadow-2xl shadow-black/25 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">One engine. Many approved profiles.</p>
            <div className="mt-5 space-y-3">
              {[
                "Z-Girl Core reflection method",
                "Faith or values content profile",
                "Age and reading-level selection",
                "Accessible participation options",
                "Family, individual, or facilitated use",
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-sm font-black text-amber-200">{index + 1}</span>
                  <p className="pt-1 text-sm font-bold leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-400">
              The Hero Within method remains consistent. Profiles change examples, references, optional practices, and facilitator guidance without changing Z-Girl into a theological authority.
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">Choose your path</p>
          <h2 className="section-title">Begin without waiting for a long approval process.</h2>
          <p className="section-copy">Families and individuals can use the independent resources now. Institutions can review, customize, and approve profiles when they are ready.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pathways.map((pathway) => (
            <article key={pathway.title} className="flex min-h-64 flex-col rounded-3xl border border-white/10 bg-white/[.035] p-6 transition hover:-translate-y-0.5 hover:bg-white/[.06]">
              <span className="text-xs font-black uppercase tracking-[.16em] text-amber-200">{pathway.label}</span>
              <h3 className="mt-3 font-display text-2xl font-black">{pathway.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{pathway.copy}</p>
              <Link href={pathway.href} className="mt-6 text-sm font-black text-[#76ead6] transition hover:text-white">{pathway.cta} →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12">
          <div>
            <p className="section-kicker">Content governance</p>
            <h2 className="section-title">Faith-aligned, not authority-claiming.</h2>
            <p className="section-copy">The platform can support many traditions while clearly identifying who selected or approved the content.</p>
          </div>
          <ul className="space-y-3">
            {safeguards.map((item) => (
              <li key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-[#061521]/55 p-4 text-sm leading-6 text-slate-300">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-amber-300/20 bg-gradient-to-br from-[#173044] to-[#0b2130] p-7 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Start simple</p>
            <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">Use the public sampler now. Add institutional customization only when demand requires it.</h2>
            <p className="mt-4 leading-7 text-slate-300">This keeps the product moving while preserving a clear path to congregation, school, and multi-site licensing.</p>
          </div>
          <Link href="/faith/start" className="mt-7 shrink-0 rounded-full bg-amber-300 px-6 py-3.5 text-sm font-black text-[#201400] transition hover:bg-amber-200 lg:mt-0">Try the sampler →</Link>
        </div>
      </section>
    </main>
  );
}
