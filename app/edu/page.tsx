import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Z-Girl EDU for Schools and Youth Programs",
  description: "A facilitated 30-day reflection experience built around privacy, adult support, accessibility, and aggregate outcomes—not surveillance.",
};

const components = [
  ["30-day facilitated journey", "Short, structured sessions that help participants pause, name the moment, find a strength, and choose one achievable Hero Move."],
  ["Staff orientation", "A practical launch session covering facilitation, privacy, safety boundaries, accessibility, and when to involve real-world support."],
  ["Facilitator resources", "Session plans, opening and closing language, discussion guidance, implementation checklists, and low-pressure follow-up prompts."],
  ["Family communication", "Plain-language notice and consent templates that explain what Z-Girl is, what it is not, and how information is handled."],
  ["Outcome scorecard", "De-identified, aggregate measures for participation, confidence, usefulness, completion, return, action, and safety."],
  ["Pilot closeout", "A structured review of implementation quality, participant experience, lessons learned, and the decision to stop, revise, or continue."],
];

const safeguards = [
  "No student reflection dashboard and no educator access to private entries.",
  "No ads, in-app purchases, or student-data monetization.",
  "No diagnosis, treatment, clinical scoring, or replacement for professional care.",
  "Private Reflection and the 7-Day Journey can be used without the AI Coach.",
  "Only de-identified aggregate measures are used for pilot learning.",
  "Youth can pause, skip, stop, and ask for a trusted person at any time.",
];

const outcomes = [
  ["Participation", "How many planned sessions were offered and attended"],
  ["Confidence", "Whether participants feel more able to name a strength or next step"],
  ["Usefulness", "Whether the reflection felt relevant and practical"],
  ["Completion", "Whether the planned experience was completed"],
  ["Return", "Whether participants chose to use the reflection experience again"],
  ["Action", "Whether participants identified an achievable Hero Move"],
  ["Safety", "Whether the experience felt respectful, understandable, and appropriately supported"],
];

export default function EduPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(73,216,194,.18),transparent_31%),radial-gradient(circle_at_10%_65%,rgba(56,189,248,.12),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:px-12 lg:py-24">
          <div>
            <p className="section-kicker">Z-Girl EDU · Institutional edition</p>
            <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">Reflection without surveillance.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              A facilitated 30-day experience for schools and youth programs that helps participants turn difficult moments into strengths, support, and achievable Hero Moves—without asking institutions to read private reflections.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#pilot-interest" className="button-primary">Explore a 30-day pilot</a>
              <a href="/edu/Z-Girl_EDU_Institutional_Overview_v1.0.pdf" className="button-secondary" download>Download institutional overview</a>
            </div>
            <p className="mt-5 text-sm text-slate-400">For schools, districts, after-school programs, mentoring organizations, camps, and youth-serving nonprofits.</p>
          </div>

          <aside className="rounded-[2rem] border border-[#76ead6]/25 bg-[#0b2030]/90 p-6 shadow-2xl shadow-black/25 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Institutional promise</p>
            <h2 className="mt-3 font-display text-2xl font-black">The reflection belongs to the participant.</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Facilitators support the process, not inspect the private answer. Institutions learn from aggregate participation and experience measures—not raw journals, counseling data, or individual surveillance scores.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#061521] p-4 text-sm leading-6 text-slate-300">
              Z-Girl is preventative, non-diagnostic, and educator-aligned. It is not therapy, medical care, emergency support, or a substitute for qualified professionals.
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">The package</p>
          <h2 className="font-display text-3xl font-black sm:text-4xl">One implementation system, six coordinated components.</h2>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {components.map(([title, copy], index) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/[.025] p-6">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#49d8c2] text-sm font-black text-[#04151c]">{index + 1}</span>
              <h3 className="mt-5 font-display text-xl font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#04111b]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <p className="section-kicker">30-day pilot</p>
            <h2 className="font-display text-3xl font-black">A controlled path from readiness to decision.</h2>
            <ol className="mt-7 space-y-4">
              {[
                ["Readiness", "Confirm setting, age range, adult supports, technology, accessibility, and local safety procedures."],
                ["Orientation", "Prepare staff and share family-facing notice before participant use."],
                ["Facilitated use", "Run short reflection sessions with predictable openings, privacy boundaries, and optional discussion."],
                ["Aggregate learning", "Collect only approved experience measures—never the private reflection itself."],
                ["Closeout", "Review implementation quality and decide whether to stop, revise, extend, or license."],
              ].map(([title, copy], index) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#76ead6]/35 text-sm font-black text-[#76ead6]">{index + 1}</span>
                  <div><h3 className="font-black">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{copy}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="section-kicker">Non-negotiable safeguards</p>
            <h2 className="font-display text-3xl font-black">Designed to support—not monitor—young people.</h2>
            <ul className="mt-7 space-y-3">
              {safeguards.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 text-sm leading-6 text-slate-300">
                  <span aria-hidden="true" className="font-black text-[#76ead6]">✓</span><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="section-kicker">Outcome framework</p>
            <h2 className="font-display text-3xl font-black">Useful evidence with a light data footprint.</h2>
            <p className="mt-5 leading-7 text-slate-300">
              The pilot scorecard measures whether the experience was delivered, understood, useful, and safe. Results are reviewed in aggregate so leaders can make an implementation decision without creating student profiles.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            {outcomes.map(([measure, definition], index) => (
              <div key={measure} className={`grid gap-2 p-4 sm:grid-cols-[140px_1fr] ${index ? "border-t border-white/10" : ""} ${index % 2 ? "bg-white/[.025]" : "bg-[#0b2030]"}`}>
                <span className="font-black text-[#b8fff3]">{measure}</span>
                <span className="text-sm leading-6 text-slate-300">{definition}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pilot-interest" className="border-t border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(73,216,194,.12),transparent_42%)]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 lg:py-20">
          <p className="section-kicker">Start with fit and readiness</p>
          <h2 className="font-display text-3xl font-black sm:text-5xl">Bring Z-Girl EDU to your school or youth program.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Begin with a short conversation about your participants, setting, staffing, technology, accessibility needs, and local safety process.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="mailto:info@zgirlinitiative.org?subject=Z-Girl%20EDU%2030-Day%20Pilot%20Interest&body=Name%3A%0ARole%3A%0AOrganization%3A%0AAge%20range%20or%20grade%3A%0AProgram%20setting%3A%0AApproximate%20group%20size%3A%0A" className="button-primary">Request a pilot conversation</a>
            <Link href="/safety" className="button-secondary">Review safety and use guidelines</Link>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">Pilots are free to participating students. Institutional terms, responsibilities, and any future license are documented separately.</p>
        </div>
      </section>
    </main>
  );
}
