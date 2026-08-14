import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;

export async function GET(request:Request){
 try{
  const url=new URL(request.url);
  const institutionId=(url.searchParams.get("institutionId")||"").trim();
  const periodStart=(url.searchParams.get("periodStart")||"").trim();
  const periodEnd=(url.searchParams.get("periodEnd")||"").trim();
  if(!UUID.test(institutionId)||!DATE.test(periodStart)||!DATE.test(periodEnd)||periodStart>periodEnd)return Response.json({ok:false,error:"invalid_board_governance_period"},{status:400});
  const {token}=await requireOperatorCapability("portfolio.read",institutionId);
  const dashboard=await credentialRpc<Record<string,unknown>>("zgirl_board_governance_dashboard",{p_session_token:token,p_institution_id:institutionId,p_period_start:periodStart,p_period_end:periodEnd});
  return Response.json({ok:true,dashboard},{headers:{"Cache-Control":"no-store, max-age=0"}});
 }catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
