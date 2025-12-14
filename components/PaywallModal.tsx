"use client";

import React from "react";

type Props = {
  reason: string | null;
  priceLabel: string;
  onClose: () => void;
  onUpgrade: () => void;
};

const REASONS: Record<string, { title: string; blurb: string }> = {
  hero_moments: {
    title: "Unlimited Hero Moments",
    blurb: "Save as many encouraging Z-Girl replies as you want — build your own pocket-sized hero toolkit.",
  },
  video_script: {
    title: "Unlimited Hero Video Scripts",
    blurb: "Turn chats into short, cozy scripts any time you need a confidence boost.",
  },
  audio_replay: {
    title: "Audio Replay",
    blurb: "Replay Z-Girl’s encouragement out loud — great for calming down and resetting.",
  },
  hero_path: {
    title: "Weekly Hero Paths",
    blurb: "A guided 5-minute weekly reflection journey to build habits over time.",
  },
};

export default function PaywallModal({ reason, priceLabel, onClose, onUpgrade }: Props) {
  const r = (reason && REASONS[reason]) || {
    title: "Unlock Z-Girl Plus 🌟",
    blurb: "Get extra tools that help confidence and calm grow over time — with guidance you can trust.",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl border border-sky-500/40 bg-slate-900/95 shadow-[0_0_50px_rgba(56,189,248,0.35)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-50">{r.title}</h2>
            <p className="mt-1 text-sm text-slate-300">{r.blurb}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-[11px] font-semibold text-sky-200">Z-Girl Plus includes</div>
          <ul className="mt-2 space-y-2 text-sm text-slate-100">
            <li className="flex gap-2"><span aria-hidden>✔</span><span>Unlimited Hero Moments</span></li>
            <li className="flex gap-2"><span aria-hidden>✔</span><span>Weekly Hero Paths</span></li>
            <li className="flex gap-2"><span aria-hidden>✔</span><span>Audio affirmations replay</span></li>
            <li className="flex gap-2"><span aria-hidden>✔</span><span>Unlimited hero video scripts</span></li>
            <li className="flex gap-2"><span aria-hidden>✔</span><span>Seasonal support (school stress, exams, holidays)</span></li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onUpgrade}
          className="mt-4 w-full inline-flex items-center justify-center rounded-full bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-teal-400/30 hover:bg-teal-300 transition"
        >
          Start Z-Girl Plus · {priceLabel}
        </button>

        <div className="mt-3 text-center text-[11px] text-slate-400">
          No ads. No data selling. Cancel anytime.
        </div>

        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-sky-300 hover:text-sky-200 underline underline-offset-2"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
