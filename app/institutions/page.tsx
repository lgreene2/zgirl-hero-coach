import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CommerceLeadForm from "@/components/CommerceLeadForm";

export const metadata: Metadata = {
  title: "Institutional Pilots & Licensing",
  description:
    "Explore Z-Girl pilots and licensing pathways for schools, congregations, athlete teams, and youth-serving organizations.",
};

const pathways = [
  {
    title: "Schools & Youth Programs",
    label: "Z-Girl EDU",
    copy: "A privacy-first 30-day facilitated reflection experience with staff orientation, family communication, accessibility supports, aggregate outcome measures, and a structured closeout decision.",
    action: "Explore Z-Girl EDU",
    href: "/edu",
  },
  {
    title: "Congregations & Faith Communities",
    label: "Faith & Values",
    copy: "A values-aligned implementation pathway with optional faith-profile onboarding, facilitator guidance, family-facing resources, and clear boundaries between spiritual reflection and professional care.",
    action: "Explore Faith & Values",
    href: "/faith",
  },
  {
    title: "Athlete Teams & Leagues",
    label: "Athlete Edition",
    copy: "A four-week mindset and character pilot with coach orientation, athlete reflection resources, family communication, accessibility guidance, and a findings summary for the next decision.",
    action: "Explore Athlete Edition",
    href: "/athletes",
  },
  {
    title: "Specialized Design Partners",
    label: "Controlled Co-Design",
    copy: "For approved organizations that bring specialized accessibility, content, or implementation requirements and need a controlled profile or pilot rather than a one-size-fits-all deployment.",
    action: "Request a fit review",
    href: "#institutional-interest",
  },
];

const lifecycle = [
  ["1", "Fit & readiness", "Confirm audience, decision-maker, safeguarding structure, accessibility needs, implementation owner, and timing before launch."],
  ["2", "Pilot & orientation", "Run a defined implementation cycle with facilitator or coach orientation, family communication, and clear privacy boundaries."],
  ["3", "Aggregate learning", "Review participation, usefulness, completion, action, accessibility, and safety in aggregate—never private reflections."],
  ["4", "Decision", "Stop, revise, renew, expand, or move into an annual license based on implementation evidence rather than platform lock-in."],
  ["5", "License & scale", "Document the approved audience, term, facilitator scope, support level, content profile, renewal conditions, and train-the-trainer pathway where appropriate."],
];

const licensingLayers = [
  {
    title: "Pilot",
    copy: "A limited implementation used to validate fit, workflow, accessibility, adoption, and support requirements before a broader commitment.",
  },
  {
    title: "Annual License",
    copy: "A defined organizational right to use the approved Z-Girl implementation package for the agreed audience, term, facilitator scope, and content profile.",
  },
  {
    title: "Train-the-Trainer",
    copy: "A controlled expansion pathway for organizations ready to prepare additional internal facilitators while preserving implementation, privacy, and brand standards.",
  },
  {
    title: "Strategic / Design Partner",
    copy: "A scoped engagement for approved specialized profiles, accessibility requirements, institutional integrations, or research-and-learning collaborations.",
  },
];

const boundaries = [
  "Private participant reflections are not institutional reporting data.",
  "Institutions do not receive a student, athlete, or youth reflection dashboard.",
  "No diagnosis, treatment, clinical scoring, or representation that Z-Girl replaces qualified professional care.",
  "Only approved aggregate implementation and experience measures are used for organizational learning.",
  "Youth-facing experiences preserve pause, skip, stop, and trusted-person pathways.",
  "Commercial product and license payments remain separate from charitable donations.",
  "Specialized content profiles are governed and versioned rather than silently changing the core reflection system.",
];

export default function InstitutionsPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_18%,rgba(251,191,36,.14),transparent_32%),radial-gradient(circle_at_14%_72%,rgba(73,216,194,.16),transparent_34%)]" />
        <div className="hero-grid absolute inset-0 -z-10 opacity-25" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">Institutional pilots & licensing</span>
              <span className="rounded-full border border-[#76ead6]/25 bg-[#49d8c2]/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-[#b8fff3]">Privacy-first implementation</span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              Start focused. Learn responsibly. Scale what works.
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
              Z-Girl gives schools, congregations, teams, and youth-serving organizations a controlled path from pilot to license without turning private reflection into surveillance data.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#institutional-interest" className="rounded-full bg-[#49d8c2] px-6 py-3.5 text-center text-sm font-black text-[#04151c] transition hover:bg-[#76ead6]">Request institutional fit review →</a>
              <Link href="/partners" className="button-secondary text-center">View founding-partner paths</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">Choose the implementation lane</p>
          <h2 className="section-title">One core reflection system. Multiple governed profiles.</h2>
          <p className="section-copy">The core privacy and safety boundaries stay consistent while the implementation materials, language, facilitator supports, and institutional workflow adapt to the setting.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {pathways.map((pathway) => (
            <article key={pathway.title} className="flex min-h-[22rem] flex-col rounded-[2rem] border border-white/10 bg-white/[.035] p-7">
              <span className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">{pathway.label}</span>
              <h3 className="mt-3 font-display text-3xl font-black">{pathway.title}</h3>
              <p className="mt-4 flex-1 text-sm leading-7 text-slate-400">{pathway.copy}</p>
              <Link href={pathway.href} className="mt-6 text-sm font-black text-[#76ead6] transition hover:text-white">{pathway.action} →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#04111b]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="section-kicker">Pilot-to-license lifecycle</p>
            <h2 className="section-title">A repeatable institutional decision system.</h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {lifecycle.map(([number, title, copy]) => (
              <article key={number} className="rounded-3xl border border-white/10 bg-white/[.025] p-5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#49d8c2] text-sm font-black text-[#04151c]">{number}</span>
                <h3 className="mt-5 font-display text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr]">
          <div>
            <p className="section-kicker">Commercial architecture</p>
            <h2 className="section-title">Build once. License responsibly.</h2>
            <p className="section-copy">Institutional growth is structured as a product ladder rather than a collection of one-off consulting engagements.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {licensingLayers.map((layer) => (
              <article key={layer.title} className="rounded-3xl border border-white/10 bg-white/[.035] p-6">
                <h3 className="font-display text-2xl font-black">{layer.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{layer.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12">
          <div>
            <p className="section-kicker">Governance boundary</p>
            <h2 className="section-title">Scale the implementation—not access to private reflections.</h2>
            <p className="section-copy">The institutional product is the facilitated system, implementation resources, approved content profile, support model, and aggregate learning framework.</p>
          </div>
          <div className="space-y-3">
            {boundaries.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-[#071925] p-4 text-sm font-bold leading-6 text-slate-200">
                <span className="mr-2 text-[#76ead6]">✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="institutional-interest" className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:px-12">
        <CommerceLeadForm
          leadType="institutional-fit"
          heading="Request an institutional fit review."
          intro="Share the organization, audience, setting, approximate group size, timing, and desired pathway. Do not include private information about youth, athletes, students, counseling, diagnoses, or safeguarding incidents."
          submitLabel="Send institutional inquiry"
        />
      </section>
    </main>
  );
}
