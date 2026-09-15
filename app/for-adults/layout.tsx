import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";

const IMAGE="https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1800&q=95";

export default function ForAdultsLayout({children}:{children:ReactNode}){
  return <div className="min-h-screen bg-[#061521] text-white"><SiteHeader/><section className="mx-auto max-w-5xl px-4 pt-8"><div className="relative min-h-[300px] overflow-hidden rounded-[2rem] border border-[#ff4bb5]/20 shadow-2xl shadow-black/25"><img src={IMAGE} alt="Family members connecting in a supportive home setting" className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,21,33,.96),rgba(6,21,33,.72),rgba(6,21,33,.28))]"/><div className="relative max-w-2xl p-7 sm:p-10"><p className="text-xs font-black uppercase tracking-[.22em] text-[#ff7bc8]">Parents + educators + trusted adults</p><h1 className="mt-3 font-display text-3xl font-black leading-tight sm:text-5xl">Support the young person without taking over their story.</h1><p className="mt-4 max-w-xl leading-7 text-slate-200">Understand Z-Girl’s boundaries, privacy model, support pathways, and practical ways adults can help turn reflection into a stronger real-world conversation.</p></div></div></section>{children}</div>;
}