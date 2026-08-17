import "server-only";

export const GLS_PILOT_BRIDGE_BOUNDARY={
  commercialSourceOfTruth:"GLS",
  implementationSourceOfTruth:"Z-Girl",
  participantPrivateReflectionData:false,
  participantCaseData:false,
  credentialAssessmentDetail:false,
  paymentCardData:false,
} as const;

export class GlsPilotBridgeError extends Error {
  code:string;
  status:number;
  constructor(code:string,status=502){super(code);this.name="GlsPilotBridgeError";this.code=code;this.status=status;}
}

function config(){
  const base=(process.env.ZGIRL_GLS_BRIDGE_URL||"").trim().replace(/\/$/,"");
  const secret=(process.env.ZGIRL_GLS_BRIDGE_SECRET||"").trim();
  return {base,secret};
}

export function glsPilotBridgeStatus(){
  const {base,secret}=config();
  return {configured:Boolean(base&&secret),urlConfigured:Boolean(base),secretConfigured:Boolean(secret),boundary:GLS_PILOT_BRIDGE_BOUNDARY};
}

async function request<T>(path:string,init?:RequestInit):Promise<T>{
  const {base,secret}=config();
  if(!base||!secret)throw new GlsPilotBridgeError("gls_bridge_not_configured",503);
  const response=await fetch(`${base}${path}`,{
    ...init,
    cache:"no-store",
    headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/json",Accept:"application/json",...(init?.headers||{})},
  });
  const raw=await response.text();
  let data:unknown=null;
  try{data=raw?JSON.parse(raw):null;}catch{data=null;}
  if(!response.ok){
    const code=typeof data==="object"&&data!==null&&"error" in data&&typeof (data as {error?:unknown}).error==="string"?(data as {error:string}).error:"gls_bridge_request_failed";
    throw new GlsPilotBridgeError(code,response.status>=500?502:response.status);
  }
  return data as T;
}

export type GlsPilotHandoff={
  ok:boolean;
  opportunity?:Record<string,unknown>|null;
  proposal?:Record<string,unknown>|null;
  agreement?:Record<string,unknown>|null;
  engagement?:Record<string,unknown>|null;
  implementation?:Record<string,unknown>|null;
};

export function fetchGlsPilotHandoff(opportunityId:string,engagementId?:string|null){
  const params=new URLSearchParams({opportunityId});
  if(engagementId)params.set("engagementId",engagementId);
  return request<GlsPilotHandoff>(`/api/gls-zgirl-pilot?${params.toString()}`);
}

export function pushGlsPilotImplementation(payload:Record<string,unknown>){
  return request<{ok:boolean;implementation?:Record<string,unknown>}>("/api/gls-zgirl-pilot",{method:"PATCH",body:JSON.stringify(payload)});
}
