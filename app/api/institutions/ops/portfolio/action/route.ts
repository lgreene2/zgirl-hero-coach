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
const text=(v:unknown,max=1600)=>typeof v==="string"?v.trim().slice(0,max):"";

export async function POST(request:Request){
 try{
  const body=(await request.json()) as Record<string,unknown>;
  const action=text(body.action,80);
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
