import Image from "next/image";
import Link from "next/link";
import InstitutionGuidedCoach from "@/components/institutions/InstitutionGuidedCoach";

export default function SiteHeader() {
  return (
    <>
      <header className="relative z-30 border-b border-white/10 bg-[#061521]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-3" aria-label="Z-Girl home">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-cyan-300/20 bg-slate-900"><Image src="/icons/zgirl-icon-1024.png" alt="" fill sizes="40px" className="object-cover" /></span>
            <span className="min-w-0"><span className="block truncate font-display text-base font-black leading-none sm:text-lg">Z-Girl</span><span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[.18em] text-[#76ead6] sm:block">Hero Within</span></span>
          </Link>
          <nav aria-label="Primary navigation" className="hidden items-center gap-3 text-xs font-bold text-slate-300 md:flex lg:gap-5 lg:text-sm">
            <Link href="/reflect" className="transition hover:text-white">Reflect</Link>
            <Link href="/support" className="transition hover:text-white">Support Handoff</Link>
            <Link href="/support/adaptive" className="hidden transition hover:text-white xl:inline">Adaptive Support</Link>
            <Link href="/support/share" className="transition hover:text-white">Secure Share</Link>
            <Link href="/journey" className="transition hover:text-white">7-Day Journey</Link>
            <Link href="/faith" className="transition hover:text-white">Faith &amp; Values</Link>
            <Link href="/athletes" className="transition hover:text-white">Athletes</Link>
            <Link href="/store" className="transition hover:text-white">Store</Link>
            <Link href="/institutions" className="transition hover:text-white">Institutions</Link>
            <Link href="/edu" className="hidden transition hover:text-white 2xl:inline">Z-Girl EDU</Link>
            <Link href="/safety" className="hidden transition hover:text-white 2xl:inline">Trust &amp; Safety</Link>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/support/share" className="rounded-full border border-[#49d8c2]/45 bg-[#49d8c2]/10 px-3 py-2.5 text-[11px] font-black text-[#9af3e4] transition hover:border-[#76ead6] hover:bg-[#49d8c2]/15 md:hidden" aria-label="Create secure supporter handoff">Share</Link>
            <Link href="/support" className="hidden rounded-full border border-white/15 px-3 py-2.5 text-[11px] font-black text-slate-200 sm:inline-flex md:hidden" aria-label="Open Support Handoff">Support</Link>
            <Link href="/reflect" className="rounded-full bg-[#49d8c2] px-3 py-2.5 text-[11px] font-black text-[#04151c] transition hover:bg-[#76ead6] sm:px-4 sm:text-sm"><span className="sm:hidden">Reflect</span><span className="hidden sm:inline">Start reflection</span></Link>
          </div>
        </div>
      </header>
      <InstitutionGuidedCoach />
    </>
  );
}
