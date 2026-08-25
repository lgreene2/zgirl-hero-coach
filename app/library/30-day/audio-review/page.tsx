import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import AudioReviewClient from "./AudioReviewClientV7";

export const metadata: Metadata = {
  title: "30-Day Hero Within Audio Review | Z-Girl",
  description: "Private production review surface for Z-Girl 30-Day Hero Within English audio candidates.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AudioReviewPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_15%,rgba(73,216,194,.16),transparent_34%)]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <p className="section-kicker">Production listening room · preview only</p>
          <h1 className="mt-2 max-w-4xl font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            30-Day Hero Within English Audio Review
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Day 1 and Day 8 are now the approved Z-Girl voice baseline. New review candidates use the locked Gemini 3.1 / Sulafat route only; cross-model fallback is disabled so quota pressure cannot silently change the character voice.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[.12em] text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Day 1 + 8 voice baseline</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Gemini 3.1 only</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">2.5 fallback disabled</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Persistent private review audio</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Human listening required</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">No autoplay</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">No production release</span>
          </div>
        </div>
      </section>
      <AudioReviewClient />
    </main>
  );
}
