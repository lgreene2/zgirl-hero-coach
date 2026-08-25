import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import AudioExpansionClient from "./AudioExpansionClientV3";

export const metadata: Metadata = {
  title: "30-Day Audio Expansion Factory | Z-Girl",
  description: "Private production surface for the governed Z-Girl 30-Day Hero Within audio expansion set.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AudioExpansionPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_15%,rgba(73,216,194,.16),transparent_34%)]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <p className="section-kicker">Production factory · preview only</p>
          <h1 className="mt-2 max-w-5xl font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Z-Girl 30-Day Audio Expansion Factory
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            The five-track representative listening gate is approved. This factory produces the remaining 25 English review candidates with the approved voice recipe, spaces successful provider requests, and handles temporary Gemini quota windows without switching voices.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[.12em] text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">5/5 representative approved</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Gemini 3.1 + Sulafat</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Fallback disabled</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">75s provider pacing</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Quota-aware cooldown</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">30 locked canonical scripts</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Private Greene storage</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">No automatic master release</span>
          </div>
          <div className="mt-7">
            <Link href="/library/30-day/audio-review" className="button-secondary">Back to representative listening gate</Link>
          </div>
        </div>
      </section>
      <AudioExpansionClient />
    </main>
  );
}
