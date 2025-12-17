import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Top badge */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300 ring-1 ring-emerald-500/20">
            Z-Girl Initiative
          </span>
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sm text-sky-300 ring-1 ring-sky-500/20">
            School-Friendly • Grant-Compatible • Pilot-Ready
          </span>
        </div>

        {/* Hero */}
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          A gentle, student-safe space for reflection and encouragement.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Z-Girl is a youth-friendly digital coach designed to support calm
          check-ins, positive self-talk, and small next steps. It’s built to
          align with school settings and community programs—without ads,
          subscriptions, or student monetization.
        </p>

        {/* Safety note */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <p className="text-sm text-slate-200">
            <span className="font-semibold">Important:</span> Z-Girl is{" "}
            <span className="font-semibold">not</span> a therapist or emergency
            service. If someone is in immediate danger or needs urgent help,
            contact local emergency services or a trusted adult/school support
            team right away.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/coach"
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            Enter Z-Girl
          </Link>

          <Link
            href="/pilot"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/40 px-5 py-3 text-base font-semibold text-slate-100 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Learn About the Pilot
          </Link>

          <Link
            href="/safety"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/40 px-5 py-3 text-base font-semibold text-slate-100 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Safety & Trust
          </Link>
        </div>

        {/* Three-column info */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h2 className="text-lg font-semibold">Designed for schools</h2>
            <p className="mt-2 text-sm text-slate-300">
              Built to support SEL-aligned reflection and classroom-friendly
              use—without adding burden or disrupting instruction.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h2 className="text-lg font-semibold">Non-commercial by design</h2>
            <p className="mt-2 text-sm text-slate-300">
              No ads. No student subscriptions. No monetization pressure. Funding
              is aligned to pilots, grants, and mission-compatible partners.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
            <h2 className="text-lg font-semibold">Pilot-ready reporting</h2>
            <p className="mt-2 text-sm text-slate-300">
              Outcomes focus on implementation, usability, and educator feedback
              with privacy-respecting, aggregate reporting.
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-14 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <Link className="hover:text-slate-200" href="/sponsor">
            Sponsor a School
          </Link>
          <span aria-hidden="true">•</span>
          <Link className="hover:text-slate-200" href="/contact">
            Contact
          </Link>
          <span aria-hidden="true">•</span>
          <span>© {new Date().getFullYear()} Z-Girl Initiative</span>
        </div>
      </div>
    </main>
  );
}
