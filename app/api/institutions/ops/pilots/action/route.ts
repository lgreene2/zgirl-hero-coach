import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic="force-dynamic";
export const runtime="nodejs";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const PROFILES=new Set(["general","edu","faith","athlete","accessibility_support"]);
const INSTITUTION_PROFILES=new Set(["school","school_district","college_university","nonprofit","youth_serving_org","faith_organization","athletic_program","municipality","community_organization","other"]);
const STAGES=new Set(["opportunity","qualified","agreement_scope","institution_setup","onboarding","pilot_ready","live","evidence_collection","completed","renewal","expansion","on_hold","cancelled"]);
const TEAM_ROLES=new Set(["system_owner","institutional_admin","facilitator","reviewer","executive_sponsor","implementation_contact","safety_contact","accessibility_contact"]);
const COHORT_TYPES=new Set(["class","grade","team","group","program","department","congregation_group","cohort","other"]);
const COHORT_STATUSES=new Set(["planned","ready","active","complete","paused","cancelled"]);
const MILESTONE_STATUSES=new Set(["not_started","in_progress","blocked","done","waived"]);

function bad(error:string){return Response.json({ok:false,error},{status:400});}
function text(body:Record<string,unknown>,key:string,max=5000){const value=typeof body[key]==="string"?(body[key] as string).trim():"";return value.slice(0,max);}
function nullableUuid(value:unknown){return typeof value==="string"&&UUID.test(value)?value:null;}
function stringArray(value:unknown){return Array.isArray(value)?value.filter((v):v is string=>typeof v==="string"):[];}
function bool(value:unknown){return value===true;}
function date(value:unknown){return typeof value==="string"&&DATE.test(value)?value:null;}

export async function POST(request:Request){
 try{
  const body=(await request.json()) as Record<string,unknown>;
  const action=text(body,"action",80);

  if(action==="create_pilot"){
    const institutionId=text(body,"institutionId",100);
    const title=text(body,"title",180);
    const institutionProfile=text(body,"institutionProfile",80);
    const profiles=stringArray(body.solutionProfiles);
    const systemOwnerId=nullableUuid(body.systemOwnerOperatorId);
    const capacity=Number(body.participantCapacity);
    const proposedPrice=body.proposedPriceCents===null||body.proposedPriceCents===undefined?null:Number(body.proposedPriceCents);
    if(!UUID.test(institutionId)||title.length<3||!INSTITUTION_PROFILES.has(institutionProfile)||!profiles.length||profiles.some(v=>!PROFILES.has(v))||!Number.isInteger(capacity)||capacity<1||capacity>100000||(proposedPrice!==null&&(!Number.isInteger(proposedPrice)||proposedPrice<0)))return bad("invalid_pilot");
    const {token}=await requireOperatorCapability("pilot.write",institutionId);
    const pilotId=await credentialRpc<string>("zgirl_pilot_create",{
      p_session_token:token,p_institution_id:institutionId,p_title:title,p_institution_profile:institutionProfile,p_solution_profiles:profiles,
      p_gls_opportunity_id:text(body,"glsOpportunityId",100),p_gls_agreement_id:text(body,"glsAgreementId",100),p_gls_engagement_id:text(body,"glsEngagementId",100),
      p_contracting_entity_name:text(body,"contractingEntityName",180),p_engagement_nature:text(body,"engagementNature",40)||"commercial",
      p_decision_maker_name:text(body,"decisionMakerName",160),p_decision_maker_role:text(body,"decisionMakerRole",160),p_decision_maker_email:text(body,"decisionMakerEmail",254),
      p_system_owner_operator_id:systemOwnerId,p_participant_capacity:capacity,p_proposed_price_cents:proposedPrice,p_currency:text(body,"currency",3).toUpperCase()||"USD",
      p_planned_start_date:date(body.plannedStartDate),p_planned_end_date:date(body.plannedEndDate),p_is_test:bool(body.isTest),
    });
    return Response.json({ok:true,pilotId});
  }

  const pilotId=text(body,"pilotId",100);
  if(!UUID.test(pilotId))return bad("invalid_pilot");

  if(action==="save_intake"){
    await requireOperatorCapability("pilot.write");
    const {token}=await requireOperatorCapability("pilot.write");
    const readiness=await credentialRpc<Record<string,unknown>>("zgirl_pilot_save_intake",{p_session_token:token,p_pilot_id:pilotId,p_payload:typeof body.payload==="object"&&body.payload!==null?body.payload:{}});
    return Response.json({ok:true,readiness});
  }

  if(action==="save_team_assignment"){
    const roleKey=text(body,"roleKey",80); const displayName=text(body,"displayName",160); const accessStatus=text(body,"accessStatus",40)||"none"; const status=text(body,"status",40)||"active";
    if(!TEAM_ROLES.has(roleKey)||displayName.length<2)return bad("invalid_pilot_team");
    const {token}=await requireOperatorCapability("pilot.write");
    const assignmentId=await credentialRpc<string>("zgirl_pilot_save_team_assignment",{p_session_token:token,p_pilot_id:pilotId,p_assignment_id:nullableUuid(body.assignmentId),p_role_key:roleKey,p_display_name:displayName,p_email:text(body,"email",254),p_operator_id:nullableUuid(body.operatorId),p_platform_access_required:bool(body.platformAccessRequired),p_access_status:accessStatus,p_responsibilities:text(body,"responsibilities",3000),p_status:status});
    return Response.json({ok:true,assignmentId});
  }

  if(action==="save_cohort"){
    const name=text(body,"name",180),structureType=text(body,"structureType",80),status=text(body,"status",40)||"planned"; const profiles=stringArray(body.solutionProfiles); const capacity=Number(body.capacity);
    if(name.length<2||!COHORT_TYPES.has(structureType)||!COHORT_STATUSES.has(status)||!profiles.length||profiles.some(v=>!PROFILES.has(v))||!Number.isInteger(capacity)||capacity<1)return bad("invalid_pilot_cohort");
    const {token}=await requireOperatorCapability("pilot.write");
    const cohortId=await credentialRpc<string>("zgirl_pilot_save_cohort",{p_session_token:token,p_pilot_id:pilotId,p_cohort_id:nullableUuid(body.cohortId),p_name:name,p_structure_type:structureType,p_target_population:text(body,"targetPopulation",2000),p_solution_profiles:profiles,p_capacity:capacity,p_status:status,p_start:date(body.plannedStartDate),p_end:date(body.plannedEndDate),p_accommodation_configuration:text(body,"accommodationConfiguration",4000),p_notes:text(body,"notes",3000)});
    return Response.json({ok:true,cohortId});
  }

  if(action==="save_milestone"){
    const milestoneId=text(body,"milestoneId",100),status=text(body,"status",40); if(!UUID.test(milestoneId)||!MILESTONE_STATUSES.has(status))return bad("invalid_pilot_milestone");
    const {token}=await requireOperatorCapability("pilot.write");
    await credentialRpc<boolean>("zgirl_pilot_save_milestone",{p_session_token:token,p_pilot_id:pilotId,p_milestone_id:milestoneId,p_status:status,p_responsible_party:text(body,"responsibleParty",180),p_due_date:date(body.dueDate),p_blocker:text(body,"blocker",1000),p_evidence_reference:text(body,"evidenceReference",500)});
    return Response.json({ok:true});
  }

  if(action==="record_metrics"){
    const sourceType=text(body,"sourceType",60); const metrics=typeof body.metrics==="object"&&body.metrics!==null?body.metrics:{};
    const {token}=await requireOperatorCapability("pilot.evidence");
    const metricId=await credentialRpc<string>("zgirl_pilot_record_metrics",{p_session_token:token,p_pilot_id:pilotId,p_cohort_id:nullableUuid(body.cohortId),p_snapshot_date:date(body.snapshotDate),p_source_type:sourceType,p_source_reference:text(body,"sourceReference",500),p_metrics:metrics,p_notes:text(body,"notes",2000)});
    return Response.json({ok:true,metricId});
  }

  if(action==="add_evidence"){
    const summary=text(body,"summary",5000); if(summary.length<3)return bad("invalid_pilot_evidence");
    const {token}=await requireOperatorCapability("pilot.evidence");
    const evidenceId=await credentialRpc<string>("zgirl_pilot_add_evidence",{p_session_token:token,p_pilot_id:pilotId,p_cohort_id:nullableUuid(body.cohortId),p_evidence_category:text(body,"evidenceCategory",80),p_provenance_type:text(body,"provenanceType",80),p_claim_type:text(body,"claimType",80),p_summary:summary,p_quantitative_data:typeof body.quantitativeData==="object"&&body.quantitativeData!==null?body.quantitativeData:{},p_source_reference:text(body,"sourceReference",500),p_evidence_date:date(body.evidenceDate),p_permission_status:text(body,"permissionStatus",80)||"internal_only",p_verified:bool(body.verified)});
    return Response.json({ok:true,evidenceId});
  }

  if(action==="save_permissions"){
    const {token}=await requireOperatorCapability("pilot.evidence");
    await credentialRpc<boolean>("zgirl_pilot_save_permissions",{p_session_token:token,p_pilot_id:pilotId,p_testimonial_status:text(body,"testimonialStatus",40),p_case_study_status:text(body,"caseStudyStatus",40),p_reference_status:text(body,"referenceStatus",40),p_funder_status:text(body,"funderEvidenceStatus",40),p_permission_reference:text(body,"permissionReference",500),p_notes:text(body,"notes",3000)});
    return Response.json({ok:true});
  }

  if(action==="add_competency_signal"){
    const summary=text(body,"summary",3000); if(summary.length<3)return bad("invalid_competency_signal");
    const {token}=await requireOperatorCapability("pilot.evidence");
    const signalId=await credentialRpc<string>("zgirl_pilot_add_competency_signal",{p_session_token:token,p_pilot_id:pilotId,p_evidence_id:nullableUuid(body.evidenceId),p_domain:text(body,"domain",80),p_signal_type:text(body,"signalType",80),p_priority:text(body,"priority",40)||"normal",p_summary:summary,p_source_role:text(body,"sourceRole",120)});
    return Response.json({ok:true,signalId});
  }

  if(action==="advance_stage"){
    const stage=text(body,"stage",80); if(!STAGES.has(stage))return bad("invalid_pilot_stage");
    const {token}=await requireOperatorCapability("pilot.activate");
    await credentialRpc<boolean>("zgirl_pilot_advance_stage",{p_session_token:token,p_pilot_id:pilotId,p_stage:stage,p_next_action:text(body,"nextAction",500),p_next_action_due:date(body.nextActionDue),p_blocker_summary:text(body,"blockerSummary",1000)});
    return Response.json({ok:true});
  }

  if(action==="save_closeout"){
    const finalize=bool(body.finalize); const {token}=await requireOperatorCapability(finalize?"pilot.closeout":"pilot.evidence");
    await credentialRpc<boolean>("zgirl_pilot_save_closeout",{p_session_token:token,p_pilot_id:pilotId,p_payload:typeof body.payload==="object"&&body.payload!==null?body.payload:{},p_finalize:finalize});
    return Response.json({ok:true,finalized:finalize});
  }

  return bad("unsupported_action");
 }catch(error){
  const response=credentialErrorResponse(error); if(response.status===401)await clearCredentialSession(); return response;
 }
}
