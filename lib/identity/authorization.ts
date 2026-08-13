import "server-only";

import { credentialRpc, CredentialStoreError } from "@/lib/credentials/store";
import { credentialSessionToken } from "@/lib/credentials/session";

export type OperatorContext={sessionId:string;operatorId:string|null;displayName:string;email:string|null;authMethod:"break_glass"|"local_code"|"supabase_auth"|"sso_saml";breakGlass:boolean;roles:Array<{roleKey:string;institutionId:string|null}>};

async function sessionToken(){const token=await credentialSessionToken();if(!token)throw new CredentialStoreError("unauthorized",401);return token;}

export async function requireOperatorCapability(capability:string,institutionId?:string|null){
 const token=await sessionToken();
 const context=await credentialRpc<OperatorContext>("zgirl_identity_authorize",{p_session_token:token,p_capability:capability,p_institution_id:institutionId||null});
 return {token,context};
}

export async function requireEntityCapability(capability:string,entityType:"institution"|"opportunity"|"proposal"|"followup"|"contact"|"activity"|"workflow"|"handoff"|"license"|"allocation"|"site"|"agreement",entityId:string){
 const token=await sessionToken();
 const context=await credentialRpc<OperatorContext&{institutionId:string}>("zgirl_identity_authorize_entity",{p_session_token:token,p_capability:capability,p_entity_type:entityType,p_entity_id:entityId});
 return {token,context};
}
