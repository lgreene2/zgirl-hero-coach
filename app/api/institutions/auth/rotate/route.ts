import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession, credentialSessionToken } from "@/lib/credentials/session";

export const dynamic="force-dynamic";export const runtime="nodejs";
export async function POST(request:Request){
 const token=await credentialSessionToken();if(!token)return Response.json({ok:false,error:"unauthorized"},{status:401});
 try{
  const body=(await request.json()) as {currentCode?:unknown;newCode?:unknown};
  const currentCode=typeof body.currentCode==="string"?body.currentCode.trim():"";const newCode=typeof body.newCode==="string"?body.newCode.trim():"";
  if(currentCode.length<24||currentCode.length>200||newCode.length<24||newCode.length>200)return Response.json({ok:false,error:"personal_access_code_too_short"},{status:400});
  await credentialRpc<boolean>("zgirl_identity_rotate_personal_access",{p_session_token:token,p_current_code:currentCode,p_new_code:newCode});
  return Response.json({ok:true});
 }catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
