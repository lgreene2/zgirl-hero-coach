import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { setCredentialSession } from "@/lib/credentials/session";

export const dynamic="force-dynamic";export const runtime="nodejs";
type LoginResult={token:string;expiresAt:string;sessionId:string;operatorId:string;displayName:string};

export async function POST(request:Request){
 try{
  const body=(await request.json()) as {email?:unknown;accessCode?:unknown};
  const email=typeof body.email==="string"?body.email.trim():"";const accessCode=typeof body.accessCode==="string"?body.accessCode.trim():"";
  if(!email.includes("@")||email.length>254||accessCode.length<24||accessCode.length>200)return Response.json({ok:false,error:"invalid_operator_login"},{status:401});
  const result=await credentialRpc<LoginResult>("zgirl_identity_login",{p_email:email,p_access_code:accessCode});
  await setCredentialSession(result.token,result.expiresAt);
  return Response.json({ok:true,expiresAt:result.expiresAt,operator:{id:result.operatorId,displayName:result.displayName}});
 }catch(error){return credentialErrorResponse(error);}
}
