"use client";

import Link from "next/link";
import { useCallback } from "react";

function trackEvent(event: string, meta: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  try {
    const key = "zgirl-analytics-v1";
    const raw = window.localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(arr) ? arr : [];
    next.push({ event, meta, ts: Date.now() });
    while (next.length > 200) next.shift();
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {}
}

export default function FooterCtas() {
  const onLearn = useCallback(() => trackEvent("nav_to_4_lessons", { from: "hero_footer" }), []);
  const onBack = useCallback(() => trackEvent("nav_back_to_chat", { from: "hero_footer" }), []);

  return (
    <>
      <Link
        href="/4-lessons"
        onClick={onLearn}
        className="inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-[11px] font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-200 md:text-xs"
      >
        Learn About The 4 Lessons®
      </Link>

      <Link
        href="/?chat=1"
        onClick={onBack}
        className="inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-[11px] font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-200 md:text-xs"
      >
        Back to Chat
      </Link>
    </>
  );
}
