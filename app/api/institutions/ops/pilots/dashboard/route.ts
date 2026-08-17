import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";
import { glsPilotBridgeStatus } from "@/lib/gls/pilot-bridge";

export const dynamic="force-dynamic";
export const runtime="nodejs";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request:Request){
  try{
    const url=new URL(request.url);
    const pilotId=(url.searchParams.get("pilotId")||"").trim();
    const institutionId=(url.searchParams.get("institutionId")||"").trim();
    if(pilotId&&!UUID.test(pilotId))return Response.json({ok:false,error:"invalid_pilot"},{status:400});
    if(institutionId&&!UUID.test(institutionId))return Response.json({ok:false,error:"invalid_institution"},{status:400});
    const {token}=await requireOperatorCapability("pilot.read",institutionId||undefined);
    const dashboard=await credentialRpc<Record<string,unknown>>("zgirl_pilot_dashboard",{p_session_token:token,p_pilot_id:pilotId||null,p_institution_id:institutionId||null});
    return Response.json({ok:true,dashboard,glsBridge:glsPilotBridgeStatus()},{headers:{"Cache-Control":"no-store, max-age=0"}});
  }catch(error){
    const response=credentialErrorResponse(error);
    if(response.status===401)await clearCredentialSession();
    return response;
  }
}
