import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="relative z-30 border-b border-white/10 bg-[#061521]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Z-Girl home">
          <span className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-300/20 bg-slate-900"><Image src="/icons/zgirl-icon-1024.png" alt="" fill sizes="40px" className="object-cover" /></span>
          <span><span className="block font-display text-lg font-black leading-none">Z-Girl</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[.18em] text-[#76ead6]">Hero Within</span></span>
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-4 text-xs font-bold text-slate-300 md:flex lg:gap-6 lg:text-sm">
          <Link href="/reflect" className="transition hover:text-white">Reflect</Link>
          <Link href="/journey" className="transition hover:text-white">7-Day Journey</Link>
          <Link href="/faith" className="transition hover:text-white">Faith &amp; Values</Link>
          <Link href="/athletes" className="transition hover:text-white">Athletes</Link>
          <Link href="/edu" className="transition hover:text-white">Z-Girl EDU</Link>
          <Link href="/safety" className="transition hover:text-white">Trust &amp; Safety</Link>
        </nav>
        <Link href="/reflect" className="shrink-0 rounded-full bg-[#49d8c2] px-4 py-2.5 text-xs font-black text-[#04151c] transition hover:bg-[#76ead6] sm:text-sm">Start reflection</Link>
      </div>
    </header>
  );
}
