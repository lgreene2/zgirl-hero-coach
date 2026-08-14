import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { credentialSessionToken, clearCredentialSession } from "@/lib/credentials/session";

export const dynamic="force-dynamic";export const runtime="nodejs";
export async function GET(){
 const token=await credentialSessionToken();if(!token)return Response.json({ok:false,error:"unauthorized"},{status:401});
 try{const dashboard=await credentialRpc<Record<string,unknown>>("zgirl_identity_dashboard",{p_session_token:token});return Response.json({ok:true,dashboard});}
 catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
