"use client";
import Link from "next/link";

export default function HomeCTAAddon() {
  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <Link
        href="/4-lessons"
        className="inline-flex items-center justify-center rounded-full border border-sky-400/70 bg-slate-900/80 px-6 py-2 text-sm font-semibold text-sky-300 hover:bg-slate-900 hover:text-sky-200 transition"
      >
        The 4 Lessons
      </Link>
      <p className="text-[11px] text-slate-400 text-center max-w-xs">
        Learn about Leadership, Education, Attitude, and Personal Development —
        the framework behind Z-Girl.
      </p>
    </div>
  );
}
