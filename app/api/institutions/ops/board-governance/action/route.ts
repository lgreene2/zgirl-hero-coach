import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const text=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";

export async function POST(request:Request){
 try{
  const body=(await request.json()) as Record<string,unknown>;
  const action=text(body.action,80);
  if(action==="create"){
   const institutionId=text(body.institutionId,64),periodStart=text(body.periodStart,20),periodEnd=text(body.periodEnd,20),title=text(body.title,220),preparedFor=text(body.preparedFor,220),preparedBy=text(body.preparedBy,120),executiveSummary=text(body.executiveSummary,3000),annualCycleId=text(body.annualCycleId,64);
   if(!UUID.test(institutionId)||!DATE.test(periodStart)||!DATE.test(periodEnd)||periodStart>periodEnd||title.length<3||(annualCycleId&&!UUID.test(annualCycleId)))return Response.json({ok:false,error:"invalid_board_governance_pack"},{status:400});
   const {token}=await requireOperatorCapability("license.write",institutionId);
   const packId=await credentialRpc<string>("zgirl_board_create_pack",{p_session_token:token,p_institution_id:institutionId,p_period_start:periodStart,p_period_end:periodEnd,p_title:title,p_prepared_for:preparedFor,p_prepared_by:preparedBy,p_executive_summary:executiveSummary,p_annual_cycle_id:annualCycleId||null});
   return Response.json({ok:true,packId});
  }
  if(action==="refresh"){
   const packId=text(body.packId,64),executiveSummary=typeof body.executiveSummary==="string"?text(body.executiveSummary,3000):null;
   if(!UUID.test(packId))return Response.json({ok:false,error:"invalid_board_governance_pack"},{status:400});
   const {token}=await requireOperatorCapability("license.write");
   await credentialRpc<boolean>("zgirl_board_refresh_pack",{p_session_token:token,p_pack_id:packId,p_executive_summary:executiveSummary});
   return Response.json({ok:true});
  }
  if(action==="finalize"){
   const packId=text(body.packId,64);if(!UUID.test(packId))return Response.json({ok:false,error:"invalid_board_governance_pack"},{status:400});
   const {token}=await requireOperatorCapability("identity.manage");
   await credentialRpc<boolean>("zgirl_board_finalize_pack",{p_session_token:token,p_pack_id:packId});
   return Response.json({ok:true});
  }
  if(action==="archive"){
   const packId=text(body.packId,64);if(!UUID.test(packId))return Response.json({ok:false,error:"invalid_board_governance_pack"},{status:400});
   const {token}=await requireOperatorCapability("identity.manage");
   await credentialRpc<boolean>("zgirl_board_archive_pack",{p_session_token:token,p_pack_id:packId});
   return Response.json({ok:true});
  }
  return Response.json({ok:false,error:"invalid_action"},{status:400});
 }catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
