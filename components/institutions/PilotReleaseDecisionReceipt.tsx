"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ReleaseGateSummary, ReleaseOperationalSummary } from "@/components/institutions/PilotReleaseGatePanel";

type Json=Record<string,unknown>;
type Dashboard={
  pilot:Json;
  institution:Json;
  releaseGate:ReleaseGateSummary;
  releaseOperational:ReleaseOperationalSummary;
  readinessDecisions:Json[];
};

const str=(row:Json|undefined,key:string)=>typeof row?.[key]==="string"?row[key] as string:"";
const bool=(row:Json|undefined,key:string)=>row?.[key]===true;
const pretty=(value:string)=>value.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());

export default function PilotReleaseDecisionReceipt({pilotId}:{pilotId:string}){
 const[state,setState]=useState<"loading"|"ready"|"unauthorized"|"error">("loading");
 const[dashboard,setDashboard]=useState<Dashboard|null>(null);
 const load=useCallback(async()=>{
  try{
   const response=await fetch(`/api/institutions/ops/pilots/dashboard?pilotId=${encodeURIComponent(pilotId)}`,{cache:"no-store"});
   const body=await response.json().catch(()=>({}));
   if(response.status===401){setState("unauthorized");return;}
   if(!response.ok||!body.ok)throw new Error(body.error||"request_failed");
   setDashboard(body.dashboard as Dashboard);setState("ready");
  }catch{setState("error");}
 },[pilotId]);
 useEffect(()=>{void load();},[load]);

 if(state==="loading")return <Panel>Loading governed release-decision receipt…</Panel>;
 if(state==="unauthorized")return <Panel><h2 className="font-display text-2xl font-black">Authorized institutional access required</h2><p className="mt-3 text-sm leading-7 text-slate-400">This receipt is restricted to named Z-Girl operators with pilot access.</p><Link href="/institutions/auth" className="button-primary mt-5 inline-flex">Institutional sign in</Link></Panel>;
 if(state==="error"||!dashboard)return <Panel>Unable to load the release-decision receipt.</Panel>;

 const latest=dashboard.readinessDecisions[0];
 const pilot=dashboard.pilot;
 return <div className="space-y-6">
  <div className="flex flex-wrap gap-2 print:hidden"><button type="button" className="button-primary" onClick={()=>window.print()}>Print / Save PDF</button><Link href={`/institutions/ops/pilots/${pilotId}`} className="button-secondary">Return to pilot</Link></div>
  <Panel>
   <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
    <div><p className="section-kicker">Z-Girl v3.14 governed receipt</p><h2 className="mt-2 font-display text-3xl font-black">Human Readiness & Release Decision</h2><p className="mt-3 text-sm text-slate-400">{str(dashboard.institution,"name")} · {str(pilot,"pilot_code")}</p></div>
    <div className={`rounded-2xl border px-5 py-4 ${latest&&bool(latest,"releaseAuthorized")?"border-[#76ead6]/30 bg-[#49d8c2]/[.08]":"border-amber-300/20 bg-amber-300/[.05]"}`}><div className="text-xs font-black uppercase tracking-[.12em] text-slate-400">Live release</div><div className="mt-1 font-display text-xl font-black">{latest&&bool(latest,"releaseAuthorized")?"Authorized":"Locked"}</div></div>
   </div>
   {pilot.is_test===true&&<div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[.05] p-4 text-sm text-amber-100"><strong>TEST RECORD.</strong> This receipt cannot authorize real participant delivery.</div>}
  </Panel>

  <Panel>
   <p className="section-kicker">Latest immutable decision</p>
   {latest?<div className="mt-4">
    <div className="flex flex-wrap gap-2"><Badge>{`Decision ${String(latest.decisionSequence??"")}`}</Badge><Badge>{pretty(str(latest,"decision"))}</Badge><Badge>{bool(latest,"releaseAuthorized")?"Release authorized":"Release locked"}</Badge></div>
    <dl className="mt-5 divide-y divide-white/10"><Row label="Decided by" value={str(latest,"decidedByName")||"Named operator"}/><Row label="Decided at" value={formatDate(str(latest,"decidedAt"))}/><Row label="Human acknowledgement" value={bool(latest,"humanAcknowledged")?"Recorded":"Missing"}/><Row label="Rationale" value={str(latest,"rationale")}/><Row label="Conditions" value={str(latest,"conditions")||"None recorded"}/></dl>
   </div>:<div className="mt-4 rounded-xl border border-dashed border-white/10 p-5 text-sm text-slate-500">No human decision has been finalized. Live release remains locked.</div>}
  </Panel>

  <Panel>
   <div className="flex items-center justify-between gap-4"><div><p className="section-kicker">Current release evidence</p><h3 className="mt-2 font-display text-2xl font-black">{dashboard.releaseGate.passed}/{dashboard.releaseGate.required} gates passed</h3></div><Badge>{dashboard.releaseGate.releaseReady?"Complete":"Incomplete"}</Badge></div>
   <div className="mt-5 divide-y divide-white/10">{dashboard.releaseGate.items.map(item=><div key={item.gateKey} className="grid gap-2 py-4 md:grid-cols-[1fr_.45fr_1.25fr]"><div className="font-bold">{item.label}</div><div className={item.status==="pass"?"text-[#76ead6]":item.status==="fail"?"text-rose-300":"text-amber-200"}>{pretty(item.status)}</div><div className="text-sm leading-6 text-slate-400">{item.evidenceReference||"No evidence reference recorded"}{item.reviewerNotes?` — ${item.reviewerNotes}`:""}</div></div>)}</div>
  </Panel>

  <Panel>
   <p className="section-kicker">Current operational corroboration</p>
   <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {[
     ["Intake readiness",dashboard.releaseOperational.intakeReadiness.ready],
     ["Named System Owner",dashboard.releaseOperational.namedSystemOwner],
     ["Implementation contact",dashboard.releaseOperational.implementationContact],
     ["Facilitator",dashboard.releaseOperational.facilitator],
     ["Safety contact",dashboard.releaseOperational.safetyContact],
     ["Accessibility contact",dashboard.releaseOperational.accessibilityContact],
     ["Ready cohort",dashboard.releaseOperational.cohortReady],
    ].map(([label,pass])=><div key={String(label)} className="rounded-xl border border-white/10 bg-[#04111b] p-4 text-sm font-bold"><span className={pass?"text-[#76ead6]":"text-amber-200"}>{pass?"✓":"○"}</span> {label}</div>)}
   </div>
  </Panel>

  <Panel><p className="section-kicker">Data boundary</p><p className="mt-3 text-sm leading-7 text-slate-400">This administrative receipt excludes participant private reflections, journals, diagnoses, counseling notes, safeguarding narratives, individual case records, and clinical scoring. It records release evidence and named adult operator judgment only.</p></Panel>
 </div>;
}

function Panel({children}:{children:React.ReactNode}){return <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6 sm:p-7">{children}</section>}
function Badge({children}:{children:React.ReactNode}){return <span className="rounded-full border border-[#76ead6]/20 bg-[#49d8c2]/[.06] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#b8fff3]">{children}</span>}
function Row({label,value}:{label:string;value:string}){return <div className="grid gap-2 py-4 md:grid-cols-[.4fr_1fr]"><dt className="text-sm text-slate-500">{label}</dt><dd className="text-sm font-bold leading-7 text-slate-200">{value}</dd></div>}
function formatDate(value:string){if(!value)return "Not recorded";const date=new Date(value);return Number.isNaN(date.getTime())?value:date.toLocaleString();}
