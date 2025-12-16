"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ConditionalPilotCTA() {
  const pathname = usePathname();

  // Only show CTA on these pages
  const showOn = ["/one-pager", "/safety"];
  if (!showOn.includes(pathname)) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Link
        href="/pilot"
        className="flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 text-slate-950 font-semibold shadow-lg hover:bg-sky-400 transition"
      >
        🚀 Start a 30-Day Pilot
      </Link>
    </div>
  );
}
