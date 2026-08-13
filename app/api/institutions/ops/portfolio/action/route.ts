import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const HEALTH=new Set(["unrated","green","watch","risk","critical"]);
const PRIORITY=new Set(["normal","growth","renewal","recovery","hold"]);
const EXPANSION=new Set(["not_assessed","not_ready","watch","ready"]);
const REVIEW_TYPES=new Set(["quarterly","semiannual","annual","event_driven","sso_activation"]);
const CADENCES=new Set(["quarterly","semiannual","annual"]);
const DECISIONS=new Set(["pending","retain","change","remove"]);
const SCOPED_ROLES=new Set(["institutional_admin","pipeline_manager","credential_admin"]);
const text=(v:unknown,max=1600)=>typeof v==="string"?v.trim().slice(0,max):"";

export async function POST(request:Request){
 try{
  const body=(await request.json()) as Record<string,unknown>;
  const action=text(body.action,80);

  if(action==="tenant_save_review_schedule"){
   const institutionId=text(body.institutionId,64),cadence=text(body.cadence,24),nextReviewDate=text(body.nextReviewDate,20),ownerName=text(body.ownerName,120);
   if(!UUID.test(institutionId)||!CADENCES.has(cadence)||!DATE.test(nextReviewDate))return Response.json({ok:false,error:"invalid_access_review_schedule"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   await credentialRpc<boolean>("zgirl_tenant_save_access_review_schedule",{p_session_token:token,p_institution_id:institutionId,p_enabled:body.enabled!==false,p_cadence:cadence,p_next_review_date:nextReviewDate,p_owner_name:ownerName});
   return Response.json({ok:true});
  }

  if(action==="tenant_create_review"){
   const institutionId=text(body.institutionId,64),reviewType=text(body.reviewType,30),periodStart=text(body.periodStart,20),periodEnd=text(body.periodEnd,20),dueAt=text(body.dueAt,20),summary=text(body.summary,1200);
   if(!UUID.test(institutionId)||!REVIEW_TYPES.has(reviewType)||(periodStart&&!DATE.test(periodStart))||(periodEnd&&!DATE.test(periodEnd))||(dueAt&&!DATE.test(dueAt)))return Response.json({ok:false,error:"invalid_access_review"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   const reviewId=await credentialRpc<string>("zgirl_tenant_create_access_review",{p_session_token:token,p_institution_id:institutionId,p_review_type:reviewType,p_period_start:periodStart||null,p_period_end:periodEnd||null,p_due_at:dueAt||null,p_summary:summary});
   return Response.json({ok:true,reviewId});
  }

  if(action==="tenant_open_review"){
   const institutionId=text(body.institutionId,64),reviewId=text(body.reviewId,64);if(!UUID.test(institutionId)||!UUID.test(reviewId))return Response.json({ok:false,error:"invalid_access_review"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   await credentialRpc<boolean>("zgirl_tenant_open_access_review",{p_session_token:token,p_review_id:reviewId});return Response.json({ok:true});
  }

  if(action==="tenant_review_decision"){
   const institutionId=text(body.institutionId,64),itemId=text(body.itemId,64),decision=text(body.decision,20),recommendedRoleKey=text(body.recommendedRoleKey,40),decisionNote=text(body.decisionNote,800);
   if(!UUID.test(institutionId)||!UUID.test(itemId)||!DECISIONS.has(decision)||(decision==="change"&&!SCOPED_ROLES.has(recommendedRoleKey)))return Response.json({ok:false,error:"invalid_access_review_decision"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   await credentialRpc<boolean>("zgirl_tenant_set_access_review_decision",{p_session_token:token,p_item_id:itemId,p_decision:decision,p_recommended_role_key:decision==="change"?recommendedRoleKey:null,p_decision_note:decisionNote});return Response.json({ok:true});
  }

  if(action==="tenant_complete_review"){
   const institutionId=text(body.institutionId,64),reviewId=text(body.reviewId,64),summary=text(body.summary,1200);if(!UUID.test(institutionId)||!UUID.test(reviewId))return Response.json({ok:false,error:"invalid_access_review"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   await credentialRpc<boolean>("zgirl_tenant_complete_access_review",{p_session_token:token,p_review_id:reviewId,p_summary:summary});return Response.json({ok:true});
  }

  if(action==="tenant_record_review_implementation"){
   const itemId=text(body.itemId,64),implementationReference=text(body.implementationReference,300);if(!UUID.test(itemId)||implementationReference.length<3)return Response.json({ok:false,error:"access_review_reference_required"},{status:400});
   const {token}=await requireOperatorCapability("identity.manage");
   await credentialRpc<boolean>("zgirl_tenant_record_access_review_implementation",{p_session_token:token,p_item_id:itemId,p_implementation_reference:implementationReference});return Response.json({ok:true});
  }

  if(action==="save_review"){
   const institutionId=text(body.institutionId,64);const health=text(body.healthStatus,20);const priority=text(body.strategicPriority,20);const expansion=text(body.expansionReadiness,24);const nextReview=text(body.nextReviewDate,20);
   if(!UUID.test(institutionId)||!HEALTH.has(health)||!PRIORITY.has(priority)||!EXPANSION.has(expansion)||(nextReview&&!DATE.test(nextReview)))return Response.json({ok:false,error:"invalid_portfolio_review"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review",institutionId);
   const id=await credentialRpc<string>("zgirl_portfolio_save_review",{p_session_token:token,p_institution_id:institutionId,p_health_status:health,p_strategic_priority:priority,p_expansion_readiness:expansion,p_executive_owner:text(body.executiveOwner,120),p_executive_summary:text(body.executiveSummary,1600),p_next_executive_action:text(body.nextExecutiveAction,600),p_next_review_date:nextReview||null});
   return Response.json({ok:true,id});
  }
  if(action==="create_snapshot"){
   const title=text(body.title,220);if(title.length<2)return Response.json({ok:false,error:"invalid_portfolio_snapshot"},{status:400});
   const {token}=await requireOperatorCapability("portfolio.review");
   const id=await credentialRpc<string>("zgirl_portfolio_create_snapshot",{p_session_token:token,p_title:title,p_generated_by:text(body.generatedBy,120)});
   return Response.json({ok:true,id});
  }
  return Response.json({ok:false,error:"invalid_action"},{status:400});
 }catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
