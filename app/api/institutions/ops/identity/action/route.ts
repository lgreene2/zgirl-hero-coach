import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { credentialSessionToken, clearCredentialSession } from "@/lib/credentials/session";

export const dynamic="force-dynamic";export const runtime="nodejs";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const text=(v:unknown,max=300)=>typeof v==="string"?v.trim().slice(0,max):"";
const MODES=new Set(["local_code","supabase_auth","sso_saml"]);const STATUSES=new Set(["active","suspended","disabled"]);const ROLES=new Set(["system_owner","executive","institutional_admin","pipeline_manager","credential_admin","auditor"]);

export async function POST(request:Request){
 const token=await credentialSessionToken();if(!token)return Response.json({ok:false,error:"unauthorized"},{status:401});
 try{
  const body=(await request.json()) as Record<string,unknown>;const action=text(body.action,80);
  if(action==="create_operator"){
   const email=text(body.email,254),displayName=text(body.displayName,120),mode=text(body.allowedAuthMode,30)||"local_code";
   if(!email.includes("@")||displayName.length<2||!MODES.has(mode))return Response.json({ok:false,error:"invalid_operator"},{status:400});
   const result=await credentialRpc<Record<string,unknown>>("zgirl_identity_create_operator",{p_session_token:token,p_email:email,p_display_name:displayName,p_allowed_auth_mode:mode});return Response.json({ok:true,result});
  }
  if(action==="set_roles"){
   const operatorId=text(body.operatorId,64);const roles=Array.isArray(body.roles)?body.roles:[];
   if(!UUID.test(operatorId)||roles.length>30)return Response.json({ok:false,error:"invalid_operator_roles"},{status:400});
   for(const item of roles){if(!item||typeof item!=="object")return Response.json({ok:false,error:"invalid_operator_roles"},{status:400});const r=item as Record<string,unknown>;if(!ROLES.has(text(r.roleKey,40)))return Response.json({ok:false,error:"invalid_operator_role"},{status:400});const institutionId=text(r.institutionId,64);if(institutionId&&!UUID.test(institutionId))return Response.json({ok:false,error:"invalid_operator_roles"},{status:400});}
   await credentialRpc<boolean>("zgirl_identity_set_roles",{p_session_token:token,p_operator_id:operatorId,p_roles:roles});return Response.json({ok:true});
  }
  if(action==="set_operator"){
   const operatorId=text(body.operatorId,64),status=text(body.status,24),mode=text(body.allowedAuthMode,30);
   if(!UUID.test(operatorId)||!STATUSES.has(status)||!MODES.has(mode))return Response.json({ok:false,error:"invalid_operator"},{status:400});
   await credentialRpc<boolean>("zgirl_identity_set_operator",{p_session_token:token,p_operator_id:operatorId,p_status:status,p_allowed_auth_mode:mode});return Response.json({ok:true});
  }
  if(action==="revoke_sessions"){
   const operatorId=text(body.operatorId,64);if(!UUID.test(operatorId))return Response.json({ok:false,error:"operator_not_found"},{status:400});
   const count=await credentialRpc<number>("zgirl_identity_revoke_sessions",{p_session_token:token,p_operator_id:operatorId});return Response.json({ok:true,revoked:count});
  }
  if(action==="rotate_personal_access"){
   const currentCode=text(body.currentCode,200),newCode=text(body.newCode,200);if(currentCode.length<24||newCode.length<24)return Response.json({ok:false,error:"personal_access_code_too_short"},{status:400});
   await credentialRpc<boolean>("zgirl_identity_rotate_personal_access",{p_session_token:token,p_current_code:currentCode,p_new_code:newCode});return Response.json({ok:true});
  }
  return Response.json({ok:false,error:"invalid_action"},{status:400});
 }catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
