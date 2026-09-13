import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import MasterReviewClient from "./MasterReviewClient";

export const metadata: Metadata = {
  title: "30-Day Whole-Library QA | Z-Girl",
  description: "Private checksum-bound human listening QA and governed master-promotion console for the Z-Girl 30-Day Hero Within audio library.",
  robots: { index: false, follow: false, nocache: true },
};

export default function MasterReviewPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_15%,rgba(73,216,194,.16),transparent_34%)]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <p className="section-kicker">30-track whole-library QA · preview only</p>
          <h1 className="mt-2 max-w-5xl font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl">Z-Girl 30-Day Audio Master Review</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">The generation factory is complete. This stage reviews the exact stored 30-track candidate library without regenerating audio, records checksum-bound human listening decisions, and keeps master promotion fail-closed behind technical, human, and rights gates.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-black uppercase tracking-[.12em] text-slate-300">
            <span className="rounded-full border border-[#49d8c2]/35 bg-[#49d8c2]/10 px-3 py-2 text-[#9cf2e3]">30 / 30 candidates stored</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Gemini 3.1 + Sulafat</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Checksum-bound approvals</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">No regeneration during QA</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Rights gate separate</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">No public release</span>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/library/30-day/audio-expansion" className="button-secondary">Back to completed factory</Link>
            <Link href="/library/30-day/audio-review" className="button-secondary">Representative gate</Link>
          </div>
        </div>
      </section>
      <MasterReviewClient />
    </main>
  );
}
