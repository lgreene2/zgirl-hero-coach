import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";

const IMAGE="https://images.unsplash.com/photo-1758270705696-ec9caffc73dd?auto=format&fit=crop&w=1800&q=95";

export default function PilotLayout({children}:{children:ReactNode}){
  return <div className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="mx-auto max-w-5xl px-4 pt-8"><div className="relative min-h-[300px] overflow-hidden rounded-[2rem] border border-[#76ead6]/20 shadow-2xl shadow-black/25"><img src={IMAGE} alt="School and youth-program professionals creating a supportive environment" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,21,33,.96),rgba(6,21,33,.72),rgba(6,21,33,.28))]"/><div className="relative max-w-2xl p-7 sm:p-10"><p className="text-xs font-black uppercase tracking-[.22em] text-[#76ead6]">Schools + youth programs</p><h1 className="mt-3 font-display text-3xl font-black leading-tight sm:text-5xl">A pilot should feel human before it feels technical.</h1><p className="mt-4 max-w-xl leading-7 text-slate-200">One organization. Thirty days. Clear safeguards, adult support, family communication, and a practical path to deciding what comes next.</p></div></div></section>{children}</div>;
}