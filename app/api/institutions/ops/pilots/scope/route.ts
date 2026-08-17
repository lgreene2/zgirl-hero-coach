import { credentialRpc, credentialErrorResponse, CredentialStoreError } from "@/lib/credentials/store";
import { credentialSessionToken, clearCredentialSession } from "@/lib/credentials/session";

export const dynamic="force-dynamic";
export const runtime="nodejs";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
function text(body:Record<string,unknown>,key:string,max=2000){return typeof body[key]==="string"?(body[key] as string).trim().slice(0,max):"";}
function date(value:unknown){return typeof value==="string"&&DATE.test(value)?value:null;}

export async function POST(request:Request){
 try{
  const body=(await request.json()) as Record<string,unknown>;
  const pilotId=text(body,"pilotId",100);
  if(!UUID.test(pilotId))return Response.json({ok:false,error:"invalid_pilot"},{status:400});
  const capacity=Number(body.participantCapacity);
  const proposedPrice=body.proposedPriceCents===null||body.proposedPriceCents===undefined||body.proposedPriceCents===""?null:Number(body.proposedPriceCents);
  const currency=text(body,"currency",3).toUpperCase()||"USD";
  if(!Number.isInteger(capacity)||capacity<1||capacity>100000||(proposedPrice!==null&&(!Number.isInteger(proposedPrice)||proposedPrice<0)))return Response.json({ok:false,error:"invalid_pilot_scope"},{status:400});
  const token=await credentialSessionToken();
  if(!token)throw new CredentialStoreError("unauthorized",401);
  await credentialRpc<boolean>("zgirl_pilot_save_scope_metadata",{
   p_session_token:token,p_pilot_id:pilotId,p_decision_maker_name:text(body,"decisionMakerName",160),p_decision_maker_role:text(body,"decisionMakerRole",160),p_decision_maker_email:text(body,"decisionMakerEmail",254),
   p_participant_capacity:capacity,p_proposed_price_cents:proposedPrice,p_currency:currency,p_planned_start_date:date(body.plannedStartDate),p_planned_end_date:date(body.plannedEndDate),p_renewal_date:date(body.renewalDate),p_next_action:text(body,"nextAction",500),p_next_action_due:date(body.nextActionDue),
  });
  return Response.json({ok:true},{headers:{"Cache-Control":"no-store, max-age=0"}});
 }catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
