import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic="force-dynamic";export const runtime="nodejs";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request:Request){
 const id=new URL(request.url).searchParams.get("id")||"";if(!UUID.test(id))return Response.json({ok:false,error:"invalid_executive_briefing"},{status:400});
 try{const {token}=await requireOperatorCapability("briefing.read");const briefing=await credentialRpc<Record<string,unknown>>("zgirl_executive_briefing_get",{p_session_token:token,p_briefing_id:id});return Response.json({ok:true,briefing},{headers:{"Cache-Control":"no-store, max-age=0"}});}catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
