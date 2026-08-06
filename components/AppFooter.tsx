"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function navClass(active: boolean) {
  return [
    "transition",
    active
      ? "text-[#76ead6] font-extrabold"
      : "text-slate-400 hover:text-white",
  ].join(" ");
}

export default function AppFooter() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const isReflect = pathname.startsWith("/reflect");
  const isJourney = pathname.startsWith("/journey");
  const isCoach = pathname.startsWith("/coach");
  const isPilot = pathname.startsWith("/pilot");
  const isEdu = pathname.startsWith("/edu");
  const isFaith = pathname.startsWith("/faith");
  const isAthletes = pathname.startsWith("/athletes");
  const isSafety = pathname === "/safety" || pathname.startsWith("/safety/");
  const isAdults = pathname === "/for-adults" || pathname.startsWith("/for-adults/");
  const isPrivacy = pathname.startsWith("/privacy");
  const isAccessibility = pathname.startsWith("/accessibility");

  return (
    <footer className="border-t border-white/10 bg-[#04111b]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <Link href="/reflect" className={navClass(isReflect)}>Reflect</Link>
          <Link href="/journey" className={navClass(isJourney)}>7-Day Journey</Link>
          <Link href="/coach" className={navClass(isCoach)}>AI Coach</Link>
          <Link href="/faith" className={navClass(isFaith)}>Faith &amp; Values</Link>
          <Link href="/athletes" className={navClass(isAthletes)}>Athletes</Link>
          <Link href="/for-adults" className={navClass(isAdults)}>For Adults</Link>
          <Link href="/safety" className={navClass(isSafety)}>Safety &amp; Use Guidelines</Link>
          <Link href="/privacy" className={navClass(isPrivacy)}>Privacy</Link>
          <Link href="/accessibility" className={navClass(isAccessibility)}>Accessibility</Link>
          <Link href="/edu" className={navClass(isEdu)}>Z-Girl EDU</Link>
          <Link href="/pilot" className={navClass(isPilot)}>Pilot Program</Link>
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">
          Z-Girl is a reflection and encouragement system—not therapy, medical
          care, clergy, spiritual direction, sports medicine, or emergency services. © {new Date().getFullYear()} Z-Girl Initiative.
        </p>
      </div>
    </footer>
  );
}
