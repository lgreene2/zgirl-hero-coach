import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const csv=(v:unknown)=>`"${String(v??"").replaceAll('"','""')}"`;
const ics=(v:unknown)=>String(v??"").replaceAll("\\","\\\\").replaceAll(";","\\;").replaceAll(",","\\,").replace(/\r?\n/g,"\\n");
const safe=(v:unknown)=>String(v??"institution").replace(/[^a-z0-9_-]+/gi,"-").replace(/^-+|-+$/g,"").toLowerCase()||"institution";
const compact=(d:string)=>d.replaceAll("-","");
const stamp=()=>new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");

export async function GET(request:Request){
 try{
  const url=new URL(request.url);
  const institutionId=(url.searchParams.get("institutionId")||"").trim();
  const periodStart=(url.searchParams.get("periodStart")||"").trim();
  const periodEnd=(url.searchParams.get("periodEnd")||"").trim();
  const kind=(url.searchParams.get("kind")||"ics").trim();
  if(!UUID.test(institutionId)||!DATE.test(periodStart)||!DATE.test(periodEnd)||periodStart>periodEnd||!new Set(["ics","evidence_csv","actions_csv"]).has(kind))return Response.json({ok:false,error:"invalid_board_governance_export"},{status:400});
  const {token}=await requireOperatorCapability("portfolio.read",institutionId);
  const dashboard=await credentialRpc<any>("zgirl_board_governance_dashboard",{p_session_token:token,p_institution_id:institutionId,p_period_start:periodStart,p_period_end:periodEnd});
  const snapshot=dashboard?.snapshot||{};
  const institution=snapshot?.institution||{};
  const code=safe(institution.institutionCode||institution.name);
  const base=`zgirl-${code}-${periodStart}-${periodEnd}`;

  if(kind==="ics"){
   const items=Array.isArray(snapshot.calendarItems)?snapshot.calendarItems:[];
   const lines=["BEGIN:VCALENDAR","VERSION:2.0","CALSCALE:GREGORIAN","METHOD:PUBLISH","PRODID:-//Z-Girl//Institutional Governance Calendar v3.9//EN","X-WR-CALNAME:Z-Girl Institutional Governance"];
   for(const item of items){
    if(!DATE.test(String(item?.dueDate||"")))continue;
    lines.push("BEGIN:VEVENT",`UID:${ics(item?.calendarCode||item?.id)}@zgirlinitiative.org`,`DTSTAMP:${stamp()}`,`DTSTART;VALUE=DATE:${compact(String(item.dueDate))}`,`SUMMARY:${ics(`Governance: ${item?.title||"Institutional governance item"}`)}`,`DESCRIPTION:${ics(`Type: ${item?.itemType||"governance"}; Status: ${item?.status||""}; Owner: ${item?.ownerName||"Unassigned"}. Administrative governance date only; no participant data.`)}`,`CATEGORIES:${ics(item?.itemType||"governance")}`,"END:VEVENT");
   }
   lines.push("END:VCALENDAR");
   return new Response(lines.join("\r\n")+"\r\n",{headers:{"Content-Type":"text/calendar; charset=utf-8","Content-Disposition":`attachment; filename="${base}.ics"`,"Cache-Control":"no-store, max-age=0"}});
  }

  if(kind==="evidence_csv"){
   const evidence=snapshot?.evidenceIndex||{};
   const rows:[[string,string,string,string,string,string]]|any[]=[];
   for(const r of Array.isArray(evidence.reports)?evidence.reports:[])rows.push(["governance_report",r.reportCode,r.reportType,r.status,r.title,r.finalizedAt||r.periodEnd]);
   for(const a of Array.isArray(evidence.attestations)?evidence.attestations:[])rows.push(["attestation",a.attestationCode,a.attestationType,a.status,`${a.attestorName||""}${a.attestorTitle?` — ${a.attestorTitle}`:""}`,a.attestedAt]);
   for(const p of Array.isArray(evidence.packages)?evidence.packages:[])rows.push(["audit_package",p.packageCode,p.packageType,p.status,p.generatedBy,p.createdAt]);
   for(const r of Array.isArray(evidence.retention)?evidence.retention:[])rows.push(["retention_record",r.retentionCode,r.evidenceType,r.status,`${r.evidenceCode||""} | ${r.policyLabel||""}`,r.nextReviewDate]);
   const body=[["category","code","type","status","label","date"],...rows].map(row=>row.map(csv).join(",")).join("\r\n")+"\r\n";
   return new Response(body,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="${base}-evidence-index.csv"`,"Cache-Control":"no-store, max-age=0"}});
  }

  const owners=Array.isArray(snapshot.actionOwners)?snapshot.actionOwners:[];
  const body=[["owner","open_items","due_items","completed_items","next_due_date"],...owners.map((o:any)=>[o.ownerName,o.openItems,o.dueItems,o.completedItems,o.nextDueDate])].map(row=>row.map(csv).join(",")).join("\r\n")+"\r\n";
  return new Response(body,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="${base}-action-owners.csv"`,"Cache-Control":"no-store, max-age=0"}});
 }catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
