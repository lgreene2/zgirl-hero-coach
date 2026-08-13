import "server-only";

import { credentialRpc, CredentialStoreError } from "@/lib/credentials/store";
import { credentialSessionToken } from "@/lib/credentials/session";

export type OperatorContext={sessionId:string;operatorId:string|null;displayName:string;email:string|null;authMethod:"break_glass"|"local_code"|"supabase_auth"|"sso_saml";breakGlass:boolean;roles:Array<{roleKey:string;institutionId:string|null}>};

export async function requireOperatorCapability(capability:string,institutionId?:string|null){
 const token=await credentialSessionToken();
 if(!token)throw new CredentialStoreError("unauthorized",401);
 const context=await credentialRpc<OperatorContext>("zgirl_identity_authorize",{p_session_token:token,p_capability:capability,p_institution_id:institutionId||null});
 return {token,context};
}
