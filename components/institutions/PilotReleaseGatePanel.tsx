"use client";

import { FormEvent, useState } from "react";

type Json=Record<string,unknown>;

export type ReleaseGateItem={
  gateKey:string;
  label:string;
  sortOrder:number;
  status:"not_assessed"|"pass"|"conditional"|"fail";
  evidenceReference:string|null;
  reviewerNotes:string|null;
  reviewedByOperatorId:string|null;
  reviewedByName:string|null;
  reviewedAt:string|null;
  updatedAt:string|null;
};

export type ReleaseGateSummary={
  required:number;
  passed:number;
  conditional:number;
  failed:number;
  notAssessed:number;
  missing:string[];
  conditionalKeys:string[];
  failedKeys:string[];
  releaseReady:boolean;
  items:ReleaseGateItem[];
};

export type ReleaseOperationalSummary={
  intakeReadiness:{passed:number;total:number;missing:string[];ready:boolean};
  namedSystemOwner:boolean;
  implementationContact:boolean;
  facilitator:boolean;
  safetyContact:boolean;
  accessibilityContact:boolean;
  cohortReady:boolean;
  operationalReady:boolean;
};

const pretty=(value:string)=>value.replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
const str=(row:Json,key:string)=>typeof row[key]==="string"?row[key] as string:"";
const bool=(row:Json,key:string)=>row[key]===true;

export default function PilotReleaseGatePanel({
  pilotId,
  isTest,
  releaseGate,
  operational,
  decisions,
  busy,
  onAct,
}:{
  pilotId:string;
  isTest:boolean;
  releaseGate:ReleaseGateSummary;
  operational:ReleaseOperationalSummary;
  decisions:Json[];
  busy:boolean;
  onAct:(payload:Json,message:string)=>Promise<void>;
}){
 const latest=decisions[0];
 return <div className="space-y-6">
  <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6 sm:p-7">
   <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
    <div>
     <p className="section-kicker">Human release gate · v3.14</p>
     <h3 className="mt-2 font-display text-3xl font-black">Evidence first. Human decision last.</h3>
     <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">The system can show whether evidence is complete. It cannot decide that a pilot is safe to release. A named operator must finalize one of three decisions: Ready, Ready with conditions, or Not ready.</p>
    </div>
    <div className={`rounded-2xl border px-5 py-4 ${releaseGate.releaseReady&&operational.operationalReady?"border-[#76ead6]/30 bg-[#49d8c2]/[.08]":"border-amber-300/20 bg-amber-300/[.05]"}`}>
     <div className="text-xs font-black uppercase tracking-[.12em] text-slate-400">Release evidence</div>
     <div className="mt-1 font-display text-2xl font-black">{releaseGate.passed}/{releaseGate.required}</div>
     <div className="mt-1 text-xs text-slate-400">{releaseGate.releaseReady&&operational.operationalReady?"Evidence and operations complete":"Human release remains locked"}</div>
    </div>
   </div>
   {isTest&&<div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-4 text-sm leading-7 text-amber-100"><strong>Governed test record.</strong> Review rehearsal is allowed, but database controls prohibit real release authorization and Live-stage activation.</div>}
  </section>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
   <Metric label="Passed" value={releaseGate.passed}/>
   <Metric label="Conditional" value={releaseGate.conditional}/>
   <Metric label="Failed" value={releaseGate.failed}/>
   <Metric label="Not assessed" value={releaseGate.notAssessed}/>
  </div>

  <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6 sm:p-7">
   <div className="flex items-start justify-between gap-4">
    <div><p className="section-kicker">Governed evidence review</p><h3 className="mt-2 font-display text-2xl font-black">Required release evidence</h3></div>
    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">No private reflection content</span>
   </div>
   <p className="mt-3 text-xs leading-6 text-slate-500">Use administrative references, test receipts, policies, review records, or aggregate plans. Do not paste participant reflections, diagnoses, counseling notes, safeguarding narratives, or individual case data.</p>
   <div className="mt-6 space-y-3">
    {releaseGate.items.map(item=><GateEvidenceRow key={item.gateKey} pilotId={pilotId} item={item} busy={busy} onAct={onAct}/>) }
   </div>
  </section>

  <OperationalEvidence operational={operational}/>

  <DecisionForm
   pilotId={pilotId}
   isTest={isTest}
   releaseGate={releaseGate}
   operational={operational}
   busy={busy}
   onAct={onAct}
  />

  <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6 sm:p-7">
   <p className="section-kicker">Append-only decision ledger</p>
   <h3 className="mt-2 font-display text-2xl font-black">Human decision history</h3>
   <div className="mt-5 space-y-3">
    {decisions.map(decision=><div key={str(decision,"id")} className="rounded-2xl border border-white/10 bg-[#04111b] p-5">
     <div className="flex flex-wrap items-center gap-2">
      <Badge>{`Decision ${String(decision.decisionSequence??"")}`}</Badge>
      <Badge>{pretty(str(decision,"decision"))}</Badge>
      <Badge>{bool(decision,"releaseAuthorized")?"Release authorized":"Release locked"}</Badge>
     </div>
     <p className="mt-4 text-sm leading-7 text-slate-300">{str(decision,"rationale")}</p>
     {str(decision,"conditions")&&<p className="mt-3 text-xs leading-6 text-amber-100"><strong>Conditions:</strong> {str(decision,"conditions")}</p>}
     <p className="mt-3 text-xs text-slate-500">{str(decision,"decidedByName")||"Named operator"} · {formatDate(str(decision,"decidedAt"))}</p>
    </div>)}
    {!latest&&<div className="rounded-xl border border-dashed border-white/10 p-5 text-sm leading-7 text-slate-500">No human readiness decision has been finalized. Live release is locked.</div>}
   </div>
  </section>
 </div>;
}

function GateEvidenceRow({pilotId,item,busy,onAct}:{pilotId:string;item:ReleaseGateItem;busy:boolean;onAct:(payload:Json,message:string)=>Promise<void>}){
 const[status,setStatus]=useState(item.status);
 const[reference,setReference]=useState(item.evidenceReference||"");
 const[notes,setNotes]=useState(item.reviewerNotes||"");
 const save=()=>void onAct({action:"save_release_evidence",pilotId,gateKey:item.gateKey,status,evidenceReference:reference,reviewerNotes:notes},`${item.label} evidence review saved.`);
 return <div className="rounded-2xl border border-white/10 bg-[#04111b] p-4 sm:p-5">
  <div className="grid gap-3 xl:grid-cols-[1.1fr_.55fr_1.25fr_1.25fr_auto] xl:items-center">
   <div><div className="font-black">{item.label}</div><div className="mt-1 text-xs text-slate-500">{item.reviewedByName?`Last reviewed by ${item.reviewedByName}`:"Awaiting named reviewer"}</div></div>
   <select className="input" value={status} onChange={e=>setStatus(e.target.value as ReleaseGateItem["status"])} aria-label={`${item.label} status`}>
    {(["not_assessed","pass","conditional","fail"] as const).map(value=><option key={value} value={value}>{pretty(value)}</option>)}
   </select>
   <input className="input" value={reference} onChange={e=>setReference(e.target.value)} placeholder="Evidence reference / receipt / policy" aria-label={`${item.label} evidence reference`}/>
   <input className="input" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Reviewer notes / condition / failure reason" aria-label={`${item.label} reviewer notes`}/>
   <button type="button" disabled={busy||(status!=="not_assessed"&&!reference.trim())||(["conditional","fail"].includes(status)&&!notes.trim())} onClick={save} className="button-secondary">Save</button>
  </div>
 </div>;
}

function OperationalEvidence({operational}:{operational:ReleaseOperationalSummary}){
 const checks:[string,boolean,string][]=[
  ["12-point intake readiness",operational.intakeReadiness.ready,`${operational.intakeReadiness.passed}/${operational.intakeReadiness.total} confirmed`],
  ["Named System Owner",operational.namedSystemOwner,"Required for accountable real-pilot ownership"],
  ["Implementation contact",operational.implementationContact,"Institutional administrator or implementation contact"],
  ["Active facilitator",operational.facilitator,"Named adult facilitation responsibility"],
  ["Safety contact",operational.safetyContact,"Named escalation route owner"],
  ["Accessibility contact",operational.accessibilityContact,"Named accommodation responsibility"],
  ["Ready cohort",operational.cohortReady,"At least one aggregate cohort is Ready or Active"],
 ];
 return <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6 sm:p-7">
  <p className="section-kicker">Operational corroboration</p>
  <h3 className="mt-2 font-display text-2xl font-black">Named roles and cohort readiness</h3>
  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{checks.map(([label,pass,detail])=><div key={label} className="rounded-2xl border border-white/10 bg-[#04111b] p-4"><div className={`text-sm font-black ${pass?"text-[#76ead6]":"text-amber-200"}`}>{pass?"✓":"○"} {label}</div><p className="mt-2 text-xs leading-6 text-slate-500">{detail}</p></div>)}</div>
 </section>;
}

function DecisionForm({pilotId,isTest,releaseGate,operational,busy,onAct}:{pilotId:string;isTest:boolean;releaseGate:ReleaseGateSummary;operational:ReleaseOperationalSummary;busy:boolean;onAct:(payload:Json,message:string)=>Promise<void>}){
 const[decision,setDecision]=useState("not_ready");
 const[rationale,setRationale]=useState("");
 const[conditions,setConditions]=useState("");
 const[releaseAuthorized,setReleaseAuthorized]=useState(false);
 const[acknowledged,setAcknowledged]=useState(false);
 const canAuthorize=!isTest&&decision==="ready"&&releaseGate.releaseReady&&operational.operationalReady;
 function submit(event:FormEvent){event.preventDefault();void onAct({action:"finalize_readiness_decision",pilotId,decision,rationale,conditions,releaseAuthorized:canAuthorize&&releaseAuthorized,humanAcknowledged:acknowledged},`Human readiness decision finalized: ${pretty(decision)}.`);}
 return <section className="rounded-[2rem] border border-[#76ead6]/20 bg-[#49d8c2]/[.05] p-6 sm:p-7">
  <p className="section-kicker">Final human authority</p>
  <h3 className="mt-2 font-display text-2xl font-black">Finalize readiness decision</h3>
  <p className="mt-3 text-sm leading-7 text-slate-400">This creates an immutable receipt. Later decisions append to—not rewrite—the history. Finalizing Ready does not itself change the pilot stage; Live still requires a separate authorized stage action.</p>
  <form onSubmit={submit} className="mt-6 grid gap-4 lg:grid-cols-2">
   <label><span className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-slate-400">Decision</span><select className="input w-full" value={decision} onChange={e=>{setDecision(e.target.value);setReleaseAuthorized(false);}}><option value="ready">Ready</option><option value="ready_with_conditions">Ready with conditions</option><option value="not_ready">Not ready</option></select></label>
   <label><span className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-slate-400">Conditions</span><input className="input w-full" value={conditions} onChange={e=>setConditions(e.target.value)} placeholder={decision==="ready_with_conditions"?"Required conditions and accountable owner":"Optional decision conditions"}/></label>
   <label className="lg:col-span-2"><span className="mb-2 block text-xs font-black uppercase tracking-[.12em] text-slate-400">Human rationale</span><textarea className="input min-h-28 w-full" value={rationale} onChange={e=>setRationale(e.target.value)} placeholder="Evidence-based reason for the decision. Do not include private participant content." required/></label>
   <label className={`lg:col-span-2 flex gap-3 rounded-2xl border p-4 text-sm ${canAuthorize?"border-[#76ead6]/20 bg-[#49d8c2]/[.06]":"border-white/10 bg-[#04111b] text-slate-500"}`}><input type="checkbox" checked={releaseAuthorized} disabled={!canAuthorize} onChange={e=>setReleaseAuthorized(e.target.checked)}/><span><strong>Authorize real live-pilot release.</strong> Available only for a non-test pilot when every release-evidence and operational gate passes. This authorization is still followed by a separate Live-stage action.</span></label>
   <label className="lg:col-span-2 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-4 text-sm leading-7 text-amber-100"><input type="checkbox" checked={acknowledged} onChange={e=>setAcknowledged(e.target.checked)}/><span>I am a named human operator making this decision. I understand the system recommendation is not the decision and that no private reflection content belongs in this record.</span></label>
   <div className="lg:col-span-2"><button disabled={busy||!acknowledged||rationale.trim().length<3||(decision==="ready_with_conditions"&&!conditions.trim())} className="button-primary">Finalize immutable decision</button></div>
  </form>
 </section>;
}

function Metric({label,value}:{label:string;value:number}){return <div className="rounded-2xl border border-white/10 bg-[#04111b] p-5"><div className="text-xs font-black uppercase tracking-[.12em] text-slate-500">{label}</div><div className="mt-2 font-display text-2xl font-black">{value}</div></div>}
function Badge({children}:{children:React.ReactNode}){return <span className="rounded-full border border-[#76ead6]/20 bg-[#49d8c2]/[.06] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[#b8fff3]">{children}</span>}
function formatDate(value:string){if(!value)return "Date unavailable";const date=new Date(value);return Number.isNaN(date.getTime())?value:date.toLocaleString();}
