"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function navClass(active: boolean) {
  return [
    "underline underline-offset-2",
    active
      ? "text-sky-300 hover:text-sky-200 font-semibold"
      : "text-slate-300 hover:text-sky-300",
  ].join(" ");
}

export default function AppFooter() {
  const pathname = usePathname();

  // Hide footer on main chat page only
  if (pathname === "/") return null;

  const isPilot = pathname === "/pilot" || pathname.startsWith("/pilot/");
  const isOnePager = pathname === "/one-pager" || pathname.startsWith("/one-pager/");
  const isSafety = pathname === "/safety" || pathname.startsWith("/safety/");
  const isAdults = pathname === "/for-adults" || pathname.startsWith("/for-adults/");

  return (
    <footer className="border-t border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <Link href="/for-adults" className={navClass(isAdults)}>
            Parent &amp; Educator Guide
          </Link>

          <Link href="/safety" className={navClass(isSafety)}>
            Safety &amp; Use Guidelines
          </Link>

          <Link href="/one-pager" className={navClass(isOnePager)}>
            One-Pager
          </Link>

          <Link href="/pilot" className={navClass(isPilot)}>
            Pilot Program
          </Link>
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">
          Z-Girl is a digital hero coach for reflection and encouragement — not
          therapy and not emergency services.
        </p>
      </div>
    </footer>
  );
}
