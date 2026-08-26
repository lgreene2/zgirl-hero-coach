import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import AudioExpansionClient from "./AudioExpansionClientV4";

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
          <p className="section-kicker">Production factory · preview only · paid API tier active</p>
          <h1 className="mt-2 max-w-5xl font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Z-Girl 30-Day Audio Expansion Factory
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            The five-track representative listening gate is approved and the Gemini API project is on the paid tier. The factory continues the remaining English review candidates with the exact approved Z-Girl voice recipe while retaining checksum/provenance evidence and fail-closed voice continuity controls.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[.12em] text-slate-300">
            <span className="rounded-full border border-[#49d8c2]/35 bg-[#49d8c2]/10 px-3 py-2 text-[#9cf2e3]">Gemini API paid tier active</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">5/5 representative approved</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Gemini 3.1 + Sulafat</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Fallback disabled</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">25s paid-tier pacing</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Persistent auto-resume</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">30 locked canonical scripts</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Private Greene storage</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">No automatic master release</span>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-400">
            The paid-tier lane shortens provider pacing while preserving the proven voice recipe. Once you authorize Resume, that auto-run preference is remembered on the device so reopening the page can continue from governed server state without reopening the voice decision.
          </p>
          <div className="mt-7">
            <Link href="/library/30-day/audio-review" className="button-secondary">Back to representative listening gate</Link>
          </div>
        </div>
      </section>
      <AudioExpansionClient />
    </main>
  );
}
