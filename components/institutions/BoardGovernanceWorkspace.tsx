"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Institution={id:string;name:string;institutionCode:string;institutionType:string;status:string};
type Role={roleKey:string;institutionId:string|null};
type Context={breakGlass?:boolean;displayName?:string;roles?:Role[]};
type Pack={id:string;packCode:string;title:string;status:string;periodStart:string;periodEnd:string;preparedFor:string;preparedBy:string;createdAt:string;finalizedAt?:string|null;archivedAt?:string|null};
type Snapshot={summary?:Record<string,number>;calendarItems?:any[];evidenceIndex?:Record<string,any[]>;actionOwners?:any[];annualCycles?:any[];institution?:Institution};
type Dashboard={context?:Context;snapshot?:Snapshot;packs?:Pack[]};

const nowYear=()=>new Date().getFullYear();
const yearStart=(y:number)=>`${y}-01-01`;
const yearEnd=(y:number)=>`${y}-12-31`;

export default function BoardGovernanceWorkspace(){
 const [institutions,setInstitutions]=useState<Institution[]>([]);
 const [institutionId,setInstitutionId]=useState("");
 const [periodStart,setPeriodStart]=useState(yearStart(nowYear()));
 const [periodEnd,setPeriodEnd]=useState(yearEnd(nowYear()));
 const [dashboard,setDashboard]=useState<Dashboard|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [title,setTitle]=useState(`${nowYear()} Board Governance & Evidence Pack`);
 const [preparedFor,setPreparedFor]=useState("Board / Executive Leadership");
 const [preparedBy,setPreparedBy]=useState("");
 const [executiveSummary,setExecutiveSummary]=useState("");

 const context=dashboard?.context||{};
 const roles=context.roles||[];
 const canManage=Boolean(context.breakGlass||roles.some(r=>r.roleKey==="system_owner"||(r.roleKey==="institutional_admin"&&(r.institutionId===null||r.institutionId===institutionId))));
 const canOwner=Boolean(context.breakGlass||roles.some(r=>r.roleKey==="system_owner"&&r.institutionId===null));

 const loadDirectory=useCallback(async()=>{
  try{
   const res=await fetch("/api/institutions/ops/dashboard?mode=tenantDirectory",{cache:"no-store"});
   const data=await res.json();
   if(!res.ok)throw new Error(data?.error||"Unable to load institutions");
   const list=Array.isArray(data?.directory?.institutions)?data.directory.institutions:[];
   setInstitutions(list);
   if(!institutionId&&list[0]?.id)setInstitutionId(list[0].id);
  }catch(e:any){setMessage(e?.message||"Unable to load institutional access. Sign in through Institutional Operations.");}
 },[institutionId]);

 const loadDashboard=useCallback(async()=>{
  if(!institutionId)return;
  setBusy(true);setMessage("");
  try{
   const params=new URLSearchParams({institutionId,periodStart,periodEnd});
   const res=await fetch(`/api/institutions/ops/board-governance/dashboard?${params}`,{cache:"no-store"});
   const data=await res.json();
   if(!res.ok)throw new Error(data?.error||"Unable to load board governance data");
   setDashboard(data.dashboard||null);
  }catch(e:any){setMessage(e?.message||"Unable to load board governance data");}
  finally{setBusy(false);}
 },[institutionId,periodStart,periodEnd]);

 useEffect(()=>{void loadDirectory();},[loadDirectory]);
 useEffect(()=>{if(institutionId)void loadDashboard();},[institutionId,loadDashboard]);

 const summary=dashboard?.snapshot?.summary||{};
 const exports=useMemo(()=>{
  const p=new URLSearchParams({institutionId,periodStart,periodEnd});
  return {
   ics:`/api/institutions/ops/board-governance/export?${p}&kind=ics`,
   evidence:`/api/institutions/ops/board-governance/export?${p}&kind=evidence_csv`,
   actions:`/api/institutions/ops/board-governance/export?${p}&kind=actions_csv`
  };
 },[institutionId,periodStart,periodEnd]);

 async function act(payload:Record<string,unknown>){
  setBusy(true);setMessage("");
  try{
   const res=await fetch("/api/institutions/ops/board-governance/action",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await res.json();if(!res.ok)throw new Error(data?.error||"Action failed");
   setMessage("Saved.");await loadDashboard();return data;
  }catch(e:any){setMessage(e?.message||"Action failed");return null;}
  finally{setBusy(false);}
 }

 async function createPack(){
  const data=await act({action:"create",institutionId,periodStart,periodEnd,title,preparedFor,preparedBy,executiveSummary});
  if(data?.packId)window.location.href=`/institutions/governance-board/pack/${data.packId}`;
 }

 return <div className="space-y-8">
  <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
   <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
    <label className="text-sm text-slate-300">Institution<select className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b2130] px-3 py-3" value={institutionId} onChange={e=>setInstitutionId(e.target.value)}>{institutions.length?institutions.map(i=><option key={i.id} value={i.id}>{i.name} · {i.institutionCode}</option>):<option value="">No authorized institutions</option>}</select></label>
    <label className="text-sm text-slate-300">Period start<input type="date" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b2130] px-3 py-3" value={periodStart} onChange={e=>setPeriodStart(e.target.value)}/></label>
    <label className="text-sm text-slate-300">Period end<input type="date" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b2130] px-3 py-3" value={periodEnd} onChange={e=>setPeriodEnd(e.target.value)}/></label>
    <button disabled={busy||!institutionId} onClick={()=>void loadDashboard()} className="button-primary self-end disabled:opacity-50">Refresh</button>
   </div>
   {message&&<p className="mt-4 text-sm text-amber-200">{message}</p>}
  </section>

  {dashboard&&<>
   <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
    ["Governance items",summary.calendarItems||0],["Due now",summary.calendarDue||0],["Evidence reports",summary.governanceReports||0],["Retention reviews",summary.retentionReviewsDue||0]
   ].map(([label,value])=><article key={String(label)} className="rounded-[1.7rem] border border-white/10 bg-white/[.035] p-5"><p className="text-xs uppercase tracking-[.18em] text-slate-500">{label}</p><p className="mt-2 font-display text-4xl font-black">{value}</p></article>)}</section>

   <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-display text-2xl font-black">Calendar & working-paper exports</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Read-only exports use the selected institutional period. ICS contains administrative governance dates only.</p></div><div className="flex flex-wrap gap-2"><a className="button-secondary" href={exports.ics}>Download ICS</a><a className="button-secondary" href={exports.evidence}>Evidence CSV</a><a className="button-secondary" href={exports.actions}>Action-owner CSV</a></div></div></section>

   <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
    <article className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><h2 className="font-display text-2xl font-black">Executive action owners</h2><div className="mt-5 space-y-3">{(dashboard.snapshot?.actionOwners||[]).length?(dashboard.snapshot?.actionOwners||[]).map((o:any)=><div key={o.ownerName} className="rounded-xl border border-white/10 p-4"><div className="flex justify-between gap-3"><strong>{o.ownerName}</strong><span className="text-sm text-slate-400">Next: {o.nextDueDate||"—"}</span></div><p className="mt-2 text-sm text-slate-400">Open {o.openItems||0} · Due {o.dueItems||0} · Completed {o.completedItems||0}</p></div>):<p className="text-sm text-slate-500">No governance actions in this period.</p>}</div></article>
    <article className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><h2 className="font-display text-2xl font-black">Evidence index</h2><div className="mt-5 grid grid-cols-2 gap-3 text-sm">{[["Reports",summary.governanceReports||0],["Attestations",summary.attestations||0],["Audit packages",summary.auditPackages||0],["Annual cycles",summary.annualCycles||0]].map(([l,v])=><div key={String(l)} className="rounded-xl border border-white/10 p-4"><span className="text-slate-400">{l}</span><strong className="mt-1 block text-2xl">{v}</strong></div>)}</div></article>
   </section>

   {canManage&&<section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/[.04] p-6"><h2 className="font-display text-2xl font-black">Prepare board / committee pack</h2><p className="mt-2 text-sm leading-6 text-slate-400">Creates a frozen draft snapshot for the selected period. Only System Owner can finalize it.</p><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-sm">Title<input className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b2130] px-3 py-3" value={title} onChange={e=>setTitle(e.target.value)}/></label><label className="text-sm">Prepared for<input className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b2130] px-3 py-3" value={preparedFor} onChange={e=>setPreparedFor(e.target.value)}/></label><label className="text-sm">Prepared by<input className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b2130] px-3 py-3" value={preparedBy} onChange={e=>setPreparedBy(e.target.value)}/></label><label className="text-sm md:col-span-2">Executive summary<textarea rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b2130] px-3 py-3" value={executiveSummary} onChange={e=>setExecutiveSummary(e.target.value)}/></label></div><button disabled={busy||!institutionId||title.trim().length<3} onClick={()=>void createPack()} className="button-primary mt-5 disabled:opacity-50">Create frozen draft pack</button></section>}

   <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-display text-2xl font-black">Board governance packs</h2><span className="text-xs uppercase tracking-[.15em] text-slate-500">{canOwner?"System Owner controls enabled":"Read / prepare access"}</span></div><div className="mt-5 space-y-3">{(dashboard.packs||[]).length?(dashboard.packs||[]).map(p=><div key={p.id} className="rounded-xl border border-white/10 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><strong>{p.title}</strong><p className="mt-1 text-sm text-slate-500">{p.packCode} · {p.periodStart} → {p.periodEnd} · {p.status}</p></div><div className="flex flex-wrap gap-2"><Link className="button-secondary" href={`/institutions/governance-board/pack/${p.id}`}>Open packet</Link>{canManage&&p.status==="draft"&&<button className="button-secondary" disabled={busy} onClick={()=>void act({action:"refresh",packId:p.id})}>Refresh draft</button>}{canOwner&&p.status==="draft"&&<button className="button-primary" disabled={busy} onClick={()=>void act({action:"finalize",packId:p.id})}>Finalize</button>}{canOwner&&p.status!=="archived"&&<button className="button-secondary" disabled={busy} onClick={()=>void act({action:"archive",packId:p.id})}>Archive</button>}</div></div></div>):<p className="text-sm text-slate-500">No packs have been prepared for this institution.</p>}</div></section>
  </>}

  <aside className="rounded-[2rem] border border-amber-300/20 bg-amber-300/[.06] p-6 text-sm leading-7 text-amber-50"><strong>Authority boundary:</strong> pack preparation and export do not execute agreements, change operator access, issue credentials, activate licenses, attest evidence, alter payment state or create a compliance determination. Finalization freezes an administrative snapshot only.</aside>
 </div>;
}
