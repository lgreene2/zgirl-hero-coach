import Link from "next/link";

export default function PilotPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-6 rounded-3xl bg-slate-900/80 border border-slate-800 px-6 py-8 shadow-xl">

        <header className="space-y-2">
          <p className="text-xs text-slate-400">
            <Link href="/" className="underline underline-offset-2">
              ← Back to Z-Girl
            </Link>
          </p>
          <h1 className="text-2xl md:text-3xl font-bold">
            Z-Girl 30-Day Pilot
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            A low-risk, safety-first pilot for schools and youth organizations
            exploring a youth-friendly SEL reflection tool.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">What This Pilot Is</h2>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            <li>30-day, time-bound pilot</li>
            <li>One classroom, advisory group, or youth program</li>
            <li>Recommended ages 10–16</li>
            <li>Designed to complement existing SEL practices</li>
          </ul>
        </section>

        <section className="rounded-xl bg-sky-500/10 border border-sky-500/30 p-4 space-y-2">
          <h3 className="font-semibold">Safety & Boundaries</h3>
          <p className="text-sm text-slate-200">
            Z-Girl is not therapy, not medical care, and not emergency support.
            Messages are screened for safety risk, and sensitive topics encourage
            trusted-adult involvement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Download Pilot Materials</h2>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href="/Z-Girl_Visual_One-Pager_v1.1.pdf"
              className="underline underline-offset-2 text-sky-300"
            >
              ⬇ Visual One-Pager (PDF)
            </a>
            <a
              href="/Z-Girl_30-Day_Pilot_Overview_v1.1_VISUAL.pdf"
              className="underline underline-offset-2 text-sky-300"
            >
              ⬇ 30-Day Pilot Overview (PDF)
            </a>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Interested in Piloting?</h2>
          <p className="text-sm text-slate-300">
            If you’d like to explore a pilot, complete the short interest form
            below. We’ll follow up with a brief orientation call.
          </p>
          <a
            href="#interest"
            className="inline-block rounded-xl bg-sky-500 px-4 py-2 text-slate-950 font-semibold"
          >
            Start Pilot Interest
          </a>
        </section>

      </div>
    </main>
  );
}
