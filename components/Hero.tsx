"use client";

import Image from "next/image";
import { useState } from "react";

export default function Hero() {
  const [showChat, setShowChat] = useState(false);

  if (showChat) return null; // hides hero once user starts session

  return (
    <section className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-10">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Top badges */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wide">
          <span className="px-2 py-1 rounded-full border border-teal-400/50 bg-teal-400/10 text-teal-300">
            LIVE COACH
          </span>
          <span className="px-2 py-1 rounded-full border border-sky-400/50 bg-sky-400/10 text-sky-300">
            HOLIDAY HERO MODE
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold leading-tight">
          Meet Z-Girl, <span className="text-teal-300">Your Hero Coach</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm text-slate-300">
          Feeling stressed, overwhelmed, or stuck? Z-Girl helps you manage
          challenges and <span className="text-teal-300 font-semibold">unwrap the hero within.</span>
        </p>

        {/* Z-Girl Portrait */}
        <div className="relative mx-auto w-48 h-48">
          <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="relative rounded-full overflow-hidden shadow-[0_0_35px_rgba(34,211,238,0.35)] border border-slate-800">
            <Image
              src="/icons/zgirl-icon-1024.png" 
              alt="Z-Girl Hero Coach"
              width={512}
              height={512}
              className="w-48 h-48 object-cover"
              priority
            />
          </div>
        </div>

        {/* Start Session Button */}
        <button
          onClick={() => setShowChat(true)}
          className="w-full inline-flex items-center justify-center rounded-full bg-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-400/40 hover:bg-teal-300 transition"
        >
          Start Session
        </button>

        {/* Microcopy */}
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Private, judgment-free, hero-powered guidance. Z-Girl can’t provide
          medical or emergency help.
        </p>
      </div>
    </section>
  );
}
