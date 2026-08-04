import Image from "next/image";
import Link from "next/link";
import InstallPWAButton from "@/components/InstallPWAButton";
import SiteHeader from "@/components/SiteHeader";

const method = [
  ["01", "Pause", "Create a little space before reacting."],
  ["02", "Name It", "Put honest words to the moment."],
  ["03", "Understand It", "Notice what may be shaping it."],
  ["04", "Find the Strength", "Recognize what is already within reach."],
  ["05", "Choose a Hero Move", "Commit to one realistic next step."],
  ["06", "Reflect Forward", "Return, learn, and keep growing."],
];

const editions = [
  ["Youth", "Ages 10–17", "Feelings, confidence, school, friendships, and trusted support."],
  ["Personal", "Adults", "Decisions, goals, relationships, resilience, and growth."],
  ["Family", "Together", "Private reflection with an optional shared conversation prompt."],
  ["EDU", "Organizations", "Facilitated reflection for schools and youth-serving programs."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#061521] text-white">
      <SiteHeader />
      <section className="relative isolate">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_18%,rgba(47,224,192,0.15),transparent_32%),radial-gradient(circle_at_12%_68%,rgba(51,148,255,0.13),transparent_34%)]" />
        <div className="hero-grid absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto grid min-h-[780px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.12fr_.88fr] lg:px-12 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="eyebrow">Z-Girl Open v2.2</span>
              <span className="eyebrow eyebrow-muted">No login required</span>
            </div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[.26em] text-[#76ead6]">The Hero Within Reflection System</p>
            <h1 className="font-display text-5xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-7xl">
              Turn a difficult moment into one achievable<span className="text-gradient"> Hero Move.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              A character-powered, safety-first reflection experience for youth, adults, families, and the people who support them.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/reflect" className="button-primary">Start a private reflection <span aria-hidden="true">→</span></Link>
              <Link href="/journey" className="button-secondary">Begin the 7-Day Journey</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2"><span className="trust-dot" /> 3–5 minutes</span>
              <span className="inline-flex items-center gap-2"><span className="trust-dot" /> Private by default</span>
              <span className="inline-flex items-center gap-2"><span className="trust-dot" /> Installable</span>
              <InstallPWAButton />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.3rem] border border-white/10 bg-[#0b2030]/85 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[.2em] text-[#76ead6]">Your guide</span>
                <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">Ready when you are</span>
              </div>
              <div className="mt-5 grid items-center gap-5 sm:grid-cols-[170px_1fr]">
                <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-[2rem] border border-cyan-300/30 bg-slate-900 shadow-[0_0_45px_rgba(36,211,190,.18)]">
                  <Image src="/icons/zgirl-icon-1024.png" alt="Z-Girl, the Hero Within reflection guide" fill sizes="160px" className="object-cover" priority />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-black">Meet Z-Girl</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">She helps you slow the moment down, notice your strength, and choose what comes next.</p>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[.045] p-5">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">The promise</p>
                <p className="mt-2 text-lg font-bold leading-7 text-white">Pause. Name what you&apos;re experiencing. Discover your strength. Choose one Hero Move.</p>
              </div>
              <Link href="/coach" className="mt-4 flex items-center justify-between rounded-2xl border border-sky-300/20 px-4 py-3 text-sm font-bold text-sky-200 transition hover:border-sky-300/50 hover:bg-sky-300/5">
                Prefer a conversation? Talk with Z-Girl <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <p className="section-kicker">One method. Many moments.</p>
            <h2 className="section-title">The Hero Within Method</h2>
            <p className="section-copy">A simple six-part practice you can use in the app, in a journal, with family, or in a guided program.</p>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {method.map(([number, title, description]) => (
              <li key={number} className="method-card">
                <span className="font-display text-3xl font-black text-[#49d8c2]">{number}</span>
                <div><h3 className="text-lg font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="section-kicker">Choose your path</p>
            <h2 className="section-title">Built for real people, not one generic user.</h2>
            <p className="section-copy">The same reflection method adapts its language, prompts, and support to the person using it.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {editions.map(([title, audience, copy]) => (
              <article key={title} className="edition-card">
                <div className="flex items-center justify-between gap-4"><h3 className="font-display text-2xl font-black">Z-Girl {title}</h3><span className="text-xs font-bold uppercase tracking-wider text-[#76ead6]">{audience}</span></div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[2.2rem] border border-[#49d8c2]/20 bg-gradient-to-br from-[#103044] to-[#0b2130] p-7 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl"><p className="section-kicker">Start where you are</p><h2 className="font-display text-3xl font-black tracking-tight sm:text-4xl">You do not need the perfect words.</h2><p className="mt-4 text-base leading-7 text-slate-300">Choose a path, answer only what feels useful, and leave with one small next step. No account. No public profile. No judgment.</p></div>
          <Link href="/reflect" className="button-primary mt-7 shrink-0 lg:mt-0">Find my Hero Move <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}
