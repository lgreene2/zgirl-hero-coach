"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppFooter() {
  const pathname = usePathname();

  // Hide footer on main chat page only
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <Link
            href="/for-adults"
            className="text-slate-300 hover:text-sky-300 underline underline-offset-2"
          >
            Parent &amp; Educator Guide
          </Link>

          <Link
            href="/safety"
            className="text-slate-300 hover:text-sky-300 underline underline-offset-2"
          >
            Safety &amp; Use Guidelines
          </Link>

          <Link
            href="/one-pager"
            className="text-slate-300 hover:text-sky-300 underline underline-offset-2"
          >
            One-Pager
          </Link>

          <Link
            href="/pilot"
            className="text-sky-300 hover:text-sky-200 underline underline-offset-2 font-semibold"
          >
            Pilot Program
          </Link>
        </div>

        <p className="mt-3 text-center text-xs text-slate-500">
          Z-Girl is a digital hero coach for reflection and encouragement —
          not therapy and not emergency services.
        </p>
      </div>
    </footer>
  );
}
