import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession, credentialSessionToken } from "@/lib/credentials/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPES=new Set(["weekly","monthly","exception","renewal","board","manual"]);
const DELIVERY=new Set(["prepared","sent","dismissed"]);
const text=(v:unknown,max=5000)=>typeof v==="string"?v.trim().slice(0,max):"";

export async function POST(request:Request){
 const token=await credentialSessionToken();
 if(!token)return Response.json({ok:false,error:"unauthorized"},{status:401});
 try{
  const body=(await request.json()) as Record<string,unknown>;const action=text(body.action,80);
  if(action==="generate"){
   const briefingType=text(body.briefingType,30);const title=text(body.title,220);if(!TYPES.has(briefingType)||title.length<2)return Response.json({ok:false,error:"invalid_executive_briefing"},{status:400});
   const id=await credentialRpc<string>("zgirl_executive_briefing_generate",{p_session_token:token,p_briefing_type:briefingType,p_title:title,p_generated_by:text(body.generatedBy,120)});return Response.json({ok:true,id});
  }
  if(action==="save_settings"){
   const email=text(body.defaultRecipientEmail,254).toLowerCase();if(email&&!EMAIL.test(email))return Response.json({ok:false,error:"invalid_executive_briefing_email"},{status:400});
   await credentialRpc<boolean>("zgirl_executive_briefing_save_settings",{p_session_token:token,p_weekly_enabled:body.weeklyEnabled!==false,p_monthly_enabled:body.monthlyEnabled!==false,p_exception_enabled:body.exceptionEnabled!==false,p_default_preparer:text(body.defaultPreparer,120),p_default_recipient_name:text(body.defaultRecipientName,160),p_default_recipient_email:email});return Response.json({ok:true});
  }
  if(action==="mark_delivery"){
   const deliveryId=text(body.deliveryId,64);const status=text(body.status,20);if(!UUID.test(deliveryId)||!DELIVERY.has(status))return Response.json({ok:false,error:"invalid_executive_briefing_delivery"},{status:400});
   await credentialRpc<boolean>("zgirl_executive_briefing_mark_delivery",{p_session_token:token,p_delivery_id:deliveryId,p_status:status});return Response.json({ok:true});
  }
  if(action==="run_automation"){
   const result=await credentialRpc<Record<string,unknown>>("zgirl_executive_briefing_run_automation",{p_session_token:token});return Response.json({ok:true,result});
  }
  return Response.json({ok:false,error:"invalid_action"},{status:400});
 }catch(error){const response=credentialErrorResponse(error);if(response.status===401)await clearCredentialSession();return response;}
}
