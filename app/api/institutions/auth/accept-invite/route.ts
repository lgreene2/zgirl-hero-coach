import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { setCredentialSession } from "@/lib/credentials/session";

export const dynamic="force-dynamic";export const runtime="nodejs";
type LoginResult={token:string;expiresAt:string;sessionId:string;operatorId:string;displayName:string};

export async function POST(request:Request){
 try{
  const body=(await request.json()) as {email?:unknown;inviteCode?:unknown;newAccessCode?:unknown};
  const email=typeof body.email==="string"?body.email.trim():"";const inviteCode=typeof body.inviteCode==="string"?body.inviteCode.trim():"";const newAccessCode=typeof body.newAccessCode==="string"?body.newAccessCode.trim():"";
  if(!email.includes("@")||email.length>254||inviteCode.length<24||inviteCode.length>200||newAccessCode.length<24||newAccessCode.length>200)return Response.json({ok:false,error:"invalid_operator_invite"},{status:400});
  const result=await credentialRpc<LoginResult>("zgirl_identity_accept_invite",{p_email:email,p_invite_code:inviteCode,p_new_access_code:newAccessCode});
  await setCredentialSession(result.token,result.expiresAt);
  return Response.json({ok:true,expiresAt:result.expiresAt,operator:{id:result.operatorId,displayName:result.displayName}});
 }catch(error){return credentialErrorResponse(error);}
}
