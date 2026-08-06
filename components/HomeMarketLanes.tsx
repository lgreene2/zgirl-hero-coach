"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeMarketLanes() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <section className="border-t border-white/10 bg-[#04111b] text-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="section-kicker">New Hero Within profiles</p>
          <h2 className="section-title">The same reflection method—now ready for two new communities.</h2>
          <p className="section-copy">
            Start with a public sample, open a print-ready resource, or bring the method to a congregation or team without waiting for a complex platform rollout.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-amber-300/20 bg-[radial-gradient(circle_at_85%_10%,rgba(251,191,36,.15),transparent_35%),#081d2b] p-7 sm:p-9">
            <span className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Faith &amp; Values</span>
            <h3 className="mt-3 font-display text-3xl font-black">Reflection for families and faith communities</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Public values-based reflections, a Christian starter pack, Catholic preview, congregation toolkit, and self-service faith-profile intake.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/faith" className="rounded-full bg-amber-300 px-5 py-3 text-center text-sm font-black text-[#201400] transition hover:bg-amber-200">Explore Faith &amp; Values →</Link>
              <Link href="/faith/start" className="button-secondary text-center">Try a sample</Link>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[#49d8c2]/20 bg-[radial-gradient(circle_at_85%_10%,rgba(73,216,194,.15),transparent_35%),#081d2b] p-7 sm:p-9">
            <span className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Athlete Edition</span>
            <h3 className="mt-3 font-display text-3xl font-black">Mindset and character for athletes and teams</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Pregame focus, mistake resets, confidence, coachability, teamwork, postgame reflection, a coach toolkit, and a four-week team pilot.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/athletes" className="button-primary text-center">Explore Athlete Edition →</Link>
              <Link href="/athletes/start" className="button-secondary text-center">Try a sample</Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
