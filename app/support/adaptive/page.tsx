"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { getHumanSupportAdaptation, type HumanSupportAgeBand, type HumanSupportRole } from "@/lib/human-support-system";

const ROLES: {id:HumanSupportRole;label:string;description:string}[] = [
  {id:"parent",label:"Parent / Guardian",description:"Family communication, routines, school, confidence, and shared goals."},
  {id:"coach",label:"Coach",description:"Performance, pressure, effort, confidence, leadership, and recovery."},
  {id:"educator",label:"Teacher / Educator",description:"Learning, belonging, self-management, communication, and attendance."},
  {id:"therapist",label:"Therapist / Counselor",description:"Session preparation, themes, questions, goals, and between-session reflection."},
  {id:"faith",label:"Faith Leader",description:"Values, meaning, community, reflection, and approved faith profiles."},
  {id:"mentor",label:"Mentor / Trusted Adult",description:"Goals, decisions, confidence, accountability, and growth."},
];

export default function AdaptiveHumanSupportPage(){
  const [role,setRole]=useState<HumanSupportRole>("parent");
  const [ageBand,setAgeBand]=useState<HumanSupportAgeBand>("teen");
  const adaptation=useMemo(()=>getHumanSupportAdaptation(role,ageBand),[role,ageBand]);
  const selected=ROLES.find(r=>r.id===role)!;
  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-7 lg:py-12">
      <p className="section-kicker">AI-Adaptive Human Support Platform</p>
      <h1 className="mt-2 max-w-4xl font-display text-4xl font-black tracking-tight sm:text-5xl">One Z-Girl core. Different support for different humans and moments.</h1>
      <p className="mt-4 max-w-4xl text-base leading-7 text-slate-300 sm:text-lg">Z-Girl changes its language, prompts, handoff guidance, and return loop according to who is helping, the participant's age band, and the purpose of the conversation—without creating separate products or giving AI professional authority.</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Choose context</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{ROLES.map(item=><button key={item.id} onClick={()=>setRole(item.id)} className={`rounded-2xl border p-4 text-left transition ${role===item.id?"border-[#49d8c2] bg-[#49d8c2]/10":"border-white/10 bg-white/[.025] hover:border-white/25"}`}><span className="block font-black">{item.label}</span><span className="mt-2 block text-xs leading-5 text-slate-400">{item.description}</span></button>)}</div>
          <label className="mt-5 block text-sm font-black">Participant communication style
            <select value={ageBand} onChange={e=>setAgeBand(e.target.value as HumanSupportAgeBand)} className="mt-2 w-full rounded-2xl border border-white/15 bg-[#071824] px-4 py-3 text-white"><option value="child">Child</option><option value="teen">Teen</option><option value="adult">Adult</option></select>
          </label>
        </section>

        <section className="rounded-[2rem] border border-[#49d8c2]/20 bg-[#49d8c2]/[.045] p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Live adaptation profile</p>
          <h2 className="mt-2 font-display text-3xl font-black">{selected.label}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Z-Girl opening</p><p className="mt-2 text-sm leading-6 text-slate-200">“{adaptation.opening}”</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Human handoff</p><p className="mt-2 text-sm leading-6 text-slate-200">{adaptation.handoff}</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Return loop</p><p className="mt-2 text-sm leading-6 text-slate-200">“{adaptation.returnPrompt}”</p></div>
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Age-aware tone</p><p className="mt-2 text-sm leading-6 text-slate-200">{adaptation.ageTone}</p></div>
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-4"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Priority signals</p><div className="mt-3 flex flex-wrap gap-2">{adaptation.emphasis.map(item=><span key={item} className="rounded-full border border-[#49d8c2]/20 bg-[#49d8c2]/10 px-3 py-1 text-xs font-bold text-[#9af3e4]">{item}</span>)}</div></div>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/support" className="button-primary !min-h-0">Start adaptive handoff</Link><Link href="/support/share" className="button-secondary !min-h-0">Secure Share</Link><Link href="/support/visual-system" className="rounded-full border border-white/15 px-4 py-2 text-sm font-black text-slate-300">Visual system</Link></div>
        </section>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-3xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-black uppercase tracking-wider text-[#76ead6]">Adaptive, not autonomous</p><p className="mt-2 text-sm leading-6 text-slate-400">AI changes language, prompts, summaries, and suggested reflection paths. It does not diagnose, discipline, coach over the coach, or replace human judgment.</p></div><div className="rounded-3xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-black uppercase tracking-wider text-[#76ead6]">Consent remains central</p><p className="mt-2 text-sm leading-6 text-slate-400">Adaptability never grants a supporter automatic access to private reflections. The participant controls normal handoff content.</p></div><div className="rounded-3xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-black uppercase tracking-wider text-[#76ead6]">Human relationship is the outcome</p><p className="mt-2 text-sm leading-6 text-slate-400">The product is designed to make the next human conversation clearer, safer, and more useful—not to maximize time spent talking to AI.</p></div></section>
    </div>
  </main>
}
