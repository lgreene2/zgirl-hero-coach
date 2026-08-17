import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { credentialSessionToken, clearCredentialSession } from "@/lib/credentials/session";
import { fetchGlsPilotHandoff, pushGlsPilotImplementation, GlsPilotBridgeError } from "@/lib/gls/pilot-bridge";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function stringValue(value:unknown){return typeof value==="string"?value.trim():"";}
function mapCommercialStatus(agreement:Record<string,unknown>|null|undefined){
 const status=stringValue(agreement?.status);
 if(status==="executed")return "agreement_executed";
 if(status==="sent"||status==="accepted")return "agreement_pending";
 if(status==="draft"||status==="ready")return "scope_draft";
 return "not_scoped";
}

export async function POST(request:Request){
 try{
  const body=(await request.json()) as Record<string,unknown>;
  const pilotId=stringValue(body.pilotId);
  if(!UUID.test(pilotId))return Response.json({ok:false,error:"invalid_pilot"},{status:400});
  const token=await credentialSessionToken();
  if(!token)return Response.json({ok:false,error:"unauthorized"},{status:401});
  const dashboard=await credentialRpc<Record<string,unknown>>("zgirl_pilot_dashboard",{p_session_token:token,p_pilot_id:pilotId,p_institution_id:null});
  const pilot=(dashboard.pilot||{}) as Record<string,unknown>;
  const opportunityId=stringValue(pilot.gls_opportunity_id);
  if(!opportunityId)return Response.json({ok:false,error:"gls_opportunity_required"},{status:409});
  const handoff=await fetchGlsPilotHandoff(opportunityId,stringValue(pilot.gls_engagement_id)||null);
  const opportunity=(handoff.opportunity||{}) as Record<string,unknown>;
  const agreement=(handoff.agreement||{}) as Record<string,unknown>;
  const engagement=(handoff.engagement||{}) as Record<string,unknown>;
  await credentialRpc<boolean>("zgirl_pilot_record_gls_sync",{
   p_session_token:token,p_pilot_id:pilotId,p_gls_stage:stringValue(opportunity.stage),p_gls_agreement_id:stringValue(agreement.id),p_gls_engagement_id:stringValue(engagement.id),p_commercial_status:mapCommercialStatus(agreement),
  });
  const implementation=await pushGlsPilotImplementation({
   action:"sync_implementation",opportunityId,engagementId:stringValue(engagement.id)||stringValue(pilot.gls_engagement_id)||null,
   zGirlPilotId:pilotId,zGirlPilotCode:stringValue(pilot.pilot_code),zGirlStage:stringValue(pilot.stage),
   implementationStatus:stringValue(pilot.completion_status),readinessStatus:stringValue(pilot.readiness_status),
   renewalStatus:stringValue(pilot.renewal_status),expansionStatus:stringValue(pilot.expansion_status),nextAction:stringValue(pilot.next_action),
   contractingEntity:stringValue(pilot.contracting_entity_name),engagementNature:stringValue(pilot.engagement_nature),
  });
  return Response.json({ok:true,handoff,implementation},{headers:{"Cache-Control":"no-store, max-age=0"}});
 }catch(error){
  if(error instanceof GlsPilotBridgeError)return Response.json({ok:false,error:error.code},{status:error.status});
  const response=credentialErrorResponse(error); if(response.status===401)await clearCredentialSession(); return response;
 }
}
