import { setCredentialSession } from "@/lib/credentials/session";

export const dynamic="force-dynamic";export const runtime="nodejs";
const DEFAULT_URL="https://pysoqiubmmhsbfawrrrc.supabase.co";
const DEFAULT_KEY="sb_publishable_l7Xnjeb-yym4OaVmGbcnYQ_g8i9UIsX";

type Result={token:string;expiresAt:string;sessionId:string;operatorId:string;displayName:string;authMethod:string};
export async function POST(request:Request){
 const body=(await request.json().catch(()=>({}))) as {accessToken?:unknown};
 const accessToken=typeof body.accessToken==="string"?body.accessToken.trim():"";
 if(accessToken.length<40)return Response.json({ok:false,error:"unauthorized"},{status:401});
 const url=(process.env.ZGIRL_CREDENTIAL_SUPABASE_URL||DEFAULT_URL).replace(/\/$/,"");const key=process.env.ZGIRL_CREDENTIAL_SUPABASE_PUBLISHABLE_KEY||DEFAULT_KEY;
 const r=await fetch(`${url}/rest/v1/rpc/zgirl_identity_exchange_auth_session`,{method:"POST",headers:{apikey:key,Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json",Accept:"application/json"},body:"{}",cache:"no-store"});
 if(!r.ok){const raw=await r.text();const error=raw.includes("sso_required")?"sso_required":raw.includes("operator_not_authorized")?"operator_not_authorized":"unauthorized";return Response.json({ok:false,error},{status:error==="unauthorized"?401:403});}
 const result=(await r.json()) as Result;await setCredentialSession(result.token,result.expiresAt);
 return Response.json({ok:true,expiresAt:result.expiresAt,operator:{id:result.operatorId,displayName:result.displayName},authMethod:result.authMethod});
}
