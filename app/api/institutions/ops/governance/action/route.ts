import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const ITEM_TYPES=new Set(["annual_review","access_review","governance_report","attestation","audit_package","retention_review","sso_review","offboarding_review","license_renewal","credential_capacity","custom"]);
const ITEM_STATUS=new Set(["scheduled","due","in_progress","completed","cancelled"]);
const RETENTION_ACTIONS=new Set(["retain","continue_review","hold","archive_candidate"]);
const text=(v:unknown,max=1600)=>typeof v==="string"?v.trim().slice(0,max):"";
const integer=(v:unknown)=>typeof v==="number"&&Number.isInteger(v)?v:Number.parseInt(String(v),10);

export async function POST(request:Request){
 try{
  const body=(await request.json()) as Record<string,unknown>;
  const action=text(body.action,80);
  const institutionId=text(body.institutionId,64);

  if(action==="save_settings"){
   if(!UUID.test(institutionId))return Response.json({ok:false,error:"invalid_institution"},{status:400});
   const month=integer(body.annualReviewMonth),day=integer(body.annualReviewDay),lead=integer(body.annualReviewLeadDays),reviewMonths=integer(body.evidenceReviewIntervalMonths);
   const retentionRaw=body.retentionMonths;const retentionMonths=retentionRaw===""||retentionRaw===null||retentionRaw===undefined?null:integer(retentionRaw);
   if(month<1||month>12||day<1||day>28||lead<7||lead>180||reviewMonths<1||reviewMonths>60||(retentionMonths!==null&&(retentionMonths<1||retentionMonths>300)))return Response.json({ok:false,error:"invalid_governance_calendar_settings"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   await credentialRpc<boolean>("zgirl_governance_save_calendar_settings",{p_session_token:token,p_institution_id:institutionId,p_enabled:body.enabled!==false,p_annual_review_month:month,p_annual_review_day:day,p_annual_review_lead_days:lead,p_evidence_review_interval_months:reviewMonths,p_retention_months:retentionMonths,p_retention_policy_label:text(body.retentionPolicyLabel,220),p_governance_owner_name:text(body.governanceOwnerName,120),p_notes:text(body.notes,1600)});
   return Response.json({ok:true});
  }

  if(action==="create_calendar_item"){
   const itemType=text(body.itemType,40),title=text(body.title,220),windowOpenDate=text(body.windowOpenDate,20),dueDate=text(body.dueDate,20);
   if(!UUID.test(institutionId)||!ITEM_TYPES.has(itemType)||title.length<2||(windowOpenDate&&!DATE.test(windowOpenDate))||!DATE.test(dueDate))return Response.json({ok:false,error:"invalid_governance_calendar_item"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   const itemId=await credentialRpc<string>("zgirl_governance_create_calendar_item",{p_session_token:token,p_institution_id:institutionId,p_item_type:itemType,p_title:title,p_window_open_date:windowOpenDate||null,p_due_date:dueDate,p_owner_name:text(body.ownerName,120),p_notes:text(body.notes,1200)});
   return Response.json({ok:true,itemId});
  }

  if(action==="update_calendar_item"){
   const itemId=text(body.itemId,64),status=text(body.status,30);
   if(!UUID.test(institutionId)||!UUID.test(itemId)||!ITEM_STATUS.has(status))return Response.json({ok:false,error:"invalid_governance_calendar_item"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   await credentialRpc<boolean>("zgirl_governance_update_calendar_item",{p_session_token:token,p_item_id:itemId,p_status:status,p_owner_name:text(body.ownerName,120),p_notes:text(body.notes,1200)});
   return Response.json({ok:true});
  }

  if(action==="review_retention"){
   const retentionId=text(body.retentionId,64),reviewAction=text(body.reviewAction,40),nextReviewDate=text(body.nextReviewDate,20);
   if(!UUID.test(institutionId)||!UUID.test(retentionId)||!RETENTION_ACTIONS.has(reviewAction)||!DATE.test(nextReviewDate))return Response.json({ok:false,error:"invalid_retention_review"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   await credentialRpc<boolean>("zgirl_governance_review_retention_record",{p_session_token:token,p_retention_id:retentionId,p_action:reviewAction,p_next_review_date:nextReviewDate,p_reference:text(body.reference,300)});
   return Response.json({ok:true});
  }

  if(action==="approve_archive"){
   const retentionId=text(body.retentionId,64),reference=text(body.reference,300);
   if(!UUID.test(retentionId)||reference.length<3)return Response.json({ok:false,error:"retention_reference_required"},{status:400});
   const {token}=await requireOperatorCapability("identity.manage");
   await credentialRpc<boolean>("zgirl_governance_approve_archive_candidate",{p_session_token:token,p_retention_id:retentionId,p_reference:reference});
   return Response.json({ok:true});
  }

  if(action==="link_annual_evidence"){
   const cycleId=text(body.cycleId,64),reportId=text(body.reportId,64),attestationId=text(body.attestationId,64),packageId=text(body.packageId,64);
   if(!UUID.test(institutionId)||![cycleId,reportId,attestationId,packageId].every(v=>UUID.test(v)))return Response.json({ok:false,error:"invalid_annual_review_evidence"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   await credentialRpc<boolean>("zgirl_governance_link_annual_evidence",{p_session_token:token,p_cycle_id:cycleId,p_report_id:reportId,p_attestation_id:attestationId,p_package_id:packageId});
   return Response.json({ok:true});
  }

  if(action==="close_annual_cycle"){
   const cycleId=text(body.cycleId,64);if(!UUID.test(cycleId))return Response.json({ok:false,error:"invalid_annual_review_cycle"},{status:400});
   const {token}=await requireOperatorCapability("identity.manage");
   await credentialRpc<boolean>("zgirl_governance_close_annual_cycle",{p_session_token:token,p_cycle_id:cycleId,p_summary:text(body.summary,2000)});
   return Response.json({ok:true});
  }

  return Response.json({ok:false,error:"invalid_action"},{status:400});
 }catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
