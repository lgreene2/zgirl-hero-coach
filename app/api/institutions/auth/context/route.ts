import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession, credentialSessionToken } from "@/lib/credentials/session";

export const dynamic="force-dynamic";export const runtime="nodejs";
export async function GET(){
 const token=await credentialSessionToken();if(!token)return Response.json({ok:false,error:"unauthorized"},{status:401});
 try{const context=await credentialRpc<Record<string,unknown>>("zgirl_identity_session_context",{p_session_token:token});return Response.json({ok:true,context},{headers:{"Cache-Control":"no-store, max-age=0"}});}catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
