-- Z-Girl v3.13 — GLS qualification → governed pilot workspace handoff
--
-- GLS remains authoritative for opportunity, buyer qualification, proposal, agreement,
-- engagement and commercial state. Z-Girl consumes only the administrative metadata
-- required to prepare implementation. This migration never carries participant private
-- reflection text, participant case data, clinical records, safeguarding narratives or
-- payment-card data.

create or replace function public.zgirl_gls_pilot_candidates(
  p_session_token text
)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'private'
as $function$
declare
  v_context jsonb;
  v_rows jsonb;
begin
  v_context := private.zgirl_operator_require_capability(p_session_token,'pipeline.read',null);

  select coalesce(jsonb_agg(row_payload order by sort_priority, sort_updated desc nulls last),'[]'::jsonb)
  into v_rows
  from (
    select
      case when o.priority='urgent' then 0 when o.priority='high' then 1 when o.priority='medium' then 2 else 3 end as sort_priority,
      o.updated_at as sort_updated,
      jsonb_build_object(
        'id',o.id,
        'decisionMakerName',o.name,
        'decisionMakerEmail',o.email,
        'organization',o.organization,
        'decisionMakerRole',o.role,
        'organizationType',o.organization_type,
        'interest',o.interest,
        'interestLabel',o.interest_label,
        'audienceSize',o.audience_size,
        'timeline',o.timeline,
        'stage',o.stage,
        'priority',o.priority,
        'estimatedValue',o.estimated_value,
        'nextAction',o.next_action,
        'nextActionAt',o.next_action_at,
        'owner',o.owner,
        'updatedAt',o.updated_at,

        'qualificationType',q.qualification_type,
        'outreachStatus',coalesce(q.outreach_status,'not_started'),
        'responseStatus',coalesce(q.response_status,'awaiting_response'),
        'qualificationConfirmedCount',
          (case when q.decision_authority_status='confirmed' then 1 else 0 end +
           case when q.credible_use_case_status='confirmed' then 1 else 0 end +
           case when q.participant_group_status='confirmed' then 1 else 0 end +
           case when q.implementation_owner_status='confirmed' then 1 else 0 end +
           case when q.facilitator_access_status='confirmed' then 1 else 0 end +
           case when q.structured_feedback_status='confirmed' then 1 else 0 end +
           case when q.privacy_accessibility_status='confirmed' then 1 else 0 end +
           case when q.contracting_path_status='confirmed' then 1 else 0 end),
        'qualificationReady',
          coalesce(q.qualified_at is not null
            and q.response_status in ('positive','neutral')
            and q.decision_authority_status='confirmed'
            and q.credible_use_case_status='confirmed'
            and q.participant_group_status='confirmed'
            and q.implementation_owner_status='confirmed'
            and q.facilitator_access_status='confirmed'
            and q.structured_feedback_status='confirmed'
            and q.privacy_accessibility_status='confirmed'
            and q.contracting_path_status='confirmed'
            and nullif(trim(q.participant_group),'') is not null
            and q.participant_capacity is not null
            and nullif(trim(q.implementation_owner_name),'') is not null
            and nullif(trim(q.facilitator_model),'') is not null
            and nullif(trim(q.feedback_plan),'') is not null
            and nullif(trim(q.contracting_path),'') is not null
            and nullif(trim(q.contracting_entity_name),'') is not null,false),
        'qualifiedAt',q.qualified_at,
        'participantGroup',q.participant_group,
        'participantCapacity',q.participant_capacity,
        'implementationOwner',q.implementation_owner_name,
        'contractingEntityName',q.contracting_entity_name,
        'plannedStartDate',q.planned_start_date,
        'plannedEndDate',q.planned_end_date,

        'proposalId',p.id,
        'proposalStatus',p.status,
        'proposalTitle',p.title,
        'proposalValue',p.price,
        'agreementId',a.id,
        'agreementStatus',a.status,
        'engagementId',e.id,
        'engagementStatus',e.status,

        'zGirlPilotId',zp.id,
        'zGirlPilotCode',zp.pilot_code,
        'zGirlStage',zp.stage,
        'zGirlReadinessStatus',zp.readiness_status,
        'workspacePrepared',zp.id is not null,
        'workspaceEligible',
          coalesce(q.qualified_at is not null
            and q.response_status in ('positive','neutral')
            and q.decision_authority_status='confirmed'
            and q.credible_use_case_status='confirmed'
            and q.participant_group_status='confirmed'
            and q.implementation_owner_status='confirmed'
            and q.facilitator_access_status='confirmed'
            and q.structured_feedback_status='confirmed'
            and q.privacy_accessibility_status='confirmed'
            and q.contracting_path_status='confirmed'
            and nullif(trim(q.participant_group),'') is not null
            and q.participant_capacity is not null
            and nullif(trim(q.implementation_owner_name),'') is not null
            and nullif(trim(q.facilitator_model),'') is not null
            and nullif(trim(q.feedback_plan),'') is not null
            and nullif(trim(q.contracting_path),'') is not null
            and nullif(trim(q.contracting_entity_name),'') is not null
            and a.status='executed'
            and e.id is not null
            and zp.id is null,false),
        'recommendedNextStep',
          case
            when zp.id is not null then 'Open the Z-Girl workspace and complete operational readiness; live release remains human-gated.'
            when q.opportunity_id is null or q.outreach_status in ('not_started','draft_prepared') then 'Complete/send outreach and record the institutional response in GLS.'
            when q.response_status='awaiting_response' then 'Await the institutional response; do not manufacture qualification.'
            when q.response_status='declined' then 'Nurture or close the GLS opportunity; do not create a Z-Girl pilot.'
            when q.response_status='no_response' then 'Follow up or move to nurture according to GLS outreach discipline.'
            when q.qualified_at is null then 'Complete the eight fit gates and apply explicit human qualification approval in GLS.'
            when p.id is null then 'Generate the scoped Z-Girl Institutional Pilot proposal in GLS.'
            when a.status is distinct from 'executed' then 'Complete the controlled proposal and agreement workflow in GLS.'
            when e.id is null then 'Create the GLS engagement after agreement execution.'
            else 'Prepare the governed Z-Girl implementation workspace.'
          end
      ) as row_payload
    from public.gls_opportunities o
    left join public.gls_opportunity_qualification q on q.opportunity_id=o.id
    left join lateral (
      select x.* from public.gls_proposals x
      where x.opportunity_id=o.id order by x.created_at desc limit 1
    ) p on true
    left join lateral (
      select x.* from public.gls_agreements x
      where x.opportunity_id=o.id order by x.created_at desc limit 1
    ) a on true
    left join lateral (
      select x.* from public.gls_engagements x
      where x.opportunity_id=o.id order by x.created_at desc limit 1
    ) e on true
    left join lateral (
      select x.* from public.zgirl_pilot_programs x
      where x.gls_opportunity_id=o.id::text order by x.created_at desc limit 1
    ) zp on true
    where coalesce(o.archived,false)=false
      and (
        lower(coalesce(o.interest,'')) like '%z-girl%'
        or lower(coalesce(o.interest,'')) like '%zgirl%'
        or lower(coalesce(o.interest_label,'')) like '%z-girl%'
        or lower(coalesce(o.interest_label,'')) like '%zgirl%'
        or q.qualification_type='zgirl_institutional_pilot'
      )
  ) s;

  return jsonb_build_object(
    'sourceOfTruth','GLS',
    'duplicateCrmCreated',false,
    'participantPrivateReflectionData',false,
    'count',jsonb_array_length(v_rows),
    'opportunities',v_rows
  );
end;
$function$;

revoke all on function public.zgirl_gls_pilot_candidates(text) from public;
grant execute on function public.zgirl_gls_pilot_candidates(text) to anon, authenticated;

create or replace function public.zgirl_prepare_gls_pilot_workspace(
  p_session_token text,
  p_gls_opportunity_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'private', 'extensions'
as $function$
declare
  v_context jsonb;
  v_o public.gls_opportunities%rowtype;
  v_q public.gls_opportunity_qualification%rowtype;
  v_p public.gls_proposals%rowtype;
  v_a public.gls_agreements%rowtype;
  v_e public.gls_engagements%rowtype;
  v_existing public.zgirl_pilot_programs%rowtype;
  v_institution public.zgirl_institutions%rowtype;
  v_system_owner_id uuid;
  v_pilot_id uuid;
  v_profiles text[];
  v_institution_type text;
  v_institution_profile text;
  v_institution_code text;
  v_price_cents integer;
  v_actor_id uuid;
begin
  v_context := private.zgirl_operator_require_capability(p_session_token,'pilot.write',null);
  v_actor_id := case when coalesce((v_context->>'breakGlass')::boolean,false) then null else (v_context->>'operatorId')::uuid end;

  select * into v_o from public.gls_opportunities where id=p_gls_opportunity_id and coalesce(archived,false)=false;
  if v_o.id is null then raise exception 'gls_opportunity_not_found'; end if;

  select * into v_q from public.gls_opportunity_qualification where opportunity_id=v_o.id;
  if v_q.opportunity_id is null or v_q.qualification_type<>'zgirl_institutional_pilot' then
    raise exception 'zgirl_qualification_required';
  end if;
  if v_q.qualified_at is null or v_q.response_status not in ('positive','neutral') then
    raise exception 'zgirl_qualification_not_approved';
  end if;
  if not (
    v_q.decision_authority_status='confirmed'
    and v_q.credible_use_case_status='confirmed'
    and v_q.participant_group_status='confirmed'
    and v_q.implementation_owner_status='confirmed'
    and v_q.facilitator_access_status='confirmed'
    and v_q.structured_feedback_status='confirmed'
    and v_q.privacy_accessibility_status='confirmed'
    and v_q.contracting_path_status='confirmed'
  ) then raise exception 'zgirl_qualification_gates_incomplete'; end if;
  if nullif(trim(coalesce(v_q.participant_group,'')),'') is null or v_q.participant_capacity is null then
    raise exception 'pilot_participant_group_required';
  end if;
  if nullif(trim(coalesce(v_q.implementation_owner_name,'')),'') is null then
    raise exception 'pilot_implementation_owner_required';
  end if;
  if nullif(trim(coalesce(v_q.facilitator_model,'')),'') is null then
    raise exception 'pilot_facilitator_model_required';
  end if;
  if nullif(trim(coalesce(v_q.feedback_plan,'')),'') is null then
    raise exception 'pilot_feedback_plan_required';
  end if;
  if nullif(trim(coalesce(v_q.contracting_path,'')),'') is null then
    raise exception 'pilot_contracting_path_required';
  end if;
  if nullif(trim(coalesce(v_q.contracting_entity_name,'')),'') is null then
    raise exception 'pilot_contracting_entity_required';
  end if;

  select * into v_existing
  from public.zgirl_pilot_programs
  where gls_opportunity_id=v_o.id::text
  order by created_at desc limit 1;
  if v_existing.id is not null then
    return jsonb_build_object(
      'created',false,
      'existing',true,
      'pilotId',v_existing.id,
      'pilotCode',v_existing.pilot_code,
      'institutionId',v_existing.institution_id,
      'stage',v_existing.stage,
      'nextStep','Open the existing Z-Girl workspace and continue operational readiness.'
    );
  end if;

  select * into v_p from public.gls_proposals where opportunity_id=v_o.id order by created_at desc limit 1;
  select * into v_a from public.gls_agreements where opportunity_id=v_o.id order by created_at desc limit 1;
  select * into v_e from public.gls_engagements where opportunity_id=v_o.id order by created_at desc limit 1;

  if v_a.id is null or v_a.status<>'executed' then raise exception 'gls_executed_agreement_required'; end if;
  if v_e.id is null then raise exception 'gls_engagement_required'; end if;

  select o.id into v_system_owner_id
  from public.zgirl_operator_identities o
  join public.zgirl_operator_role_assignments r on r.operator_id=o.id
  where o.status='active' and r.role_key='system_owner' and r.institution_id is null and r.status='active'
  order by o.created_at asc limit 1;
  if v_system_owner_id is null then raise exception 'named_system_owner_required'; end if;

  v_institution_type := case v_o.organization_type
    when 'school' then 'school'
    when 'school_district' then 'district'
    when 'college_university' then 'university'
    when 'nonprofit' then 'nonprofit'
    when 'youth_serving_org' then 'youth_org'
    when 'faith_organization' then 'congregation'
    when 'athletic_program' then 'athletic_team'
    when 'municipality' then 'municipal'
    else 'other'
  end;
  v_institution_profile := case v_o.organization_type
    when 'school' then 'school'
    when 'school_district' then 'school_district'
    when 'college_university' then 'college_university'
    when 'nonprofit' then 'nonprofit'
    when 'youth_serving_org' then 'youth_serving_org'
    when 'faith_organization' then 'faith_organization'
    when 'athletic_program' then 'athletic_program'
    when 'municipality' then 'municipality'
    when 'community_organization' then 'community_organization'
    else 'other'
  end;
  v_profiles := case v_o.organization_type
    when 'faith_organization' then array['faith']::text[]
    when 'athletic_program' then array['athlete']::text[]
    when 'school' then array['edu']::text[]
    when 'school_district' then array['edu']::text[]
    when 'college_university' then array['edu']::text[]
    when 'youth_serving_org' then array['edu']::text[]
    else array['general']::text[]
  end;

  select * into v_institution
  from public.zgirl_institutions
  where lower(name)=lower(v_o.organization) and status<>'closed'
  order by created_at asc limit 1;

  if v_institution.id is null then
    v_institution_code := 'ZG-INST-' || extract(year from current_date)::int || '-' || upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10));
    insert into public.zgirl_institutions(
      institution_code,name,institution_type,status,primary_contact_name,primary_contact_email
    ) values(
      v_institution_code,v_o.organization,v_institution_type,'pilot',v_o.name,lower(v_o.email)
    ) returning * into v_institution;
  else
    update public.zgirl_institutions
    set status=case when status='prospect' then 'pilot' else status end,
        primary_contact_name=coalesce(primary_contact_name,v_o.name),
        primary_contact_email=coalesce(primary_contact_email,lower(v_o.email)),
        updated_at=now()
    where id=v_institution.id
    returning * into v_institution;
  end if;

  v_price_cents := case
    when v_p.price is null then null
    else least(2147483647,round(v_p.price*100)::bigint)::integer
  end;

  v_pilot_id := public.zgirl_pilot_create(
    p_session_token,
    v_institution.id,
    v_o.organization || ' — Z-Girl Institutional Pilot',
    v_institution_profile,
    v_profiles,
    v_o.id::text,
    v_a.id::text,
    v_e.id::text,
    v_q.contracting_entity_name,
    case when v_o.record_type='test' then 'test' else 'commercial' end,
    v_o.name,
    coalesce(v_o.role,''),
    v_o.email,
    v_system_owner_id,
    v_q.participant_capacity,
    v_price_cents,
    'USD',
    v_q.planned_start_date,
    v_q.planned_end_date,
    v_o.record_type='test'
  );

  update public.zgirl_pilot_programs
  set commercial_status=case when v_o.record_type='test' then commercial_status else 'agreement_executed' end,
      contracted_price_cents=case when v_a.amount is null then null else least(2147483647,round(v_a.amount*100)::bigint)::integer end,
      gls_stage_snapshot=v_o.stage,
      gls_last_synced_at=now(),
      next_action='Complete Z-Girl operational readiness: safety route, named team assignments, cohort configuration, accessibility review, and human pilot release.',
      blocker_summary='Workspace prepared from executed GLS handoff. Live participant delivery is not authorized until Z-Girl readiness and human release gates are complete.',
      updated_at=now()
  where id=v_pilot_id;

  update public.zgirl_pilot_intakes
  set pilot_goals=left(coalesce(v_q.qualification_summary,v_o.challenge,'Validate institutional Z-Girl fit through a focused pilot.'),6000),
      intended_population=left(v_q.participant_group,3000),
      participant_structure=left(v_q.participant_group,2000),
      implementation_environment=left(coalesce(v_o.organization_type,'institutional'),3000),
      facilitator_requirements=left(v_q.facilitator_model,3000),
      accessibility_considerations=left(coalesce(v_q.privacy_accessibility_notes,'Accessibility requirements confirmed during GLS fit review; complete Z-Girl implementation review before launch.'),4000),
      risk_safety_considerations='Safety route must be explicitly confirmed inside Z-Girl before pilot readiness. Do not infer safeguarding readiness from commercial qualification.',
      data_privacy_requirements=left('Reflection without surveillance. Institutional reporting is aggregate; private participant reflections and participant case data are excluded. ' || coalesce(v_q.privacy_accessibility_notes,''),4000),
      desired_outcomes=left(coalesce(v_o.challenge,v_q.qualification_summary,'Focused pilot learning and an evidence-based stop / revise / renew / expand decision.'),5000),
      timeline_notes=left('GLS target dates: ' || coalesce(v_q.planned_start_date::text,'TBD') || ' through ' || coalesce(v_q.planned_end_date::text,'TBD'),3000),
      decision_status='approved',
      decision_maker_accessible=true,
      defined_participant_group=true,
      manageable_pilot_size=true,
      structured_feedback_commitment=true,
      credible_use_case=true,
      realistic_implementation_access=true,
      safety_route_confirmed=false,
      privacy_requirements_confirmed=true,
      accessibility_plan_confirmed=true,
      facilitator_capacity_confirmed=true,
      readiness_blockers='["safety_route_confirmation","pilot_team_review","cohort_readiness","human_release"]'::jsonb,
      readiness_notes='Administrative fit was qualified in GLS. Z-Girl operational readiness remains separate and incomplete by design.',
      updated_by_operator_id=v_actor_id,
      updated_at=now()
  where pilot_id=v_pilot_id;

  perform public.zgirl_pilot_save_team_assignment(
    p_session_token,v_pilot_id,null,'implementation_contact',v_q.implementation_owner_name,
    coalesce(v_q.implementation_owner_email,''),null,false,'planned',
    'Coordinate institutional implementation, scheduling, facilitator access, and operational readiness. No access to participant private reflection content.',
    'active'
  );

  perform public.zgirl_pilot_save_cohort(
    p_session_token,v_pilot_id,null,
    left(v_q.participant_group,180),'cohort',v_q.participant_group,v_profiles,v_q.participant_capacity,
    'planned',v_q.planned_start_date,v_q.planned_end_date,
    coalesce(v_q.privacy_accessibility_notes,''),
    'Aggregate cohort shell prepared from the qualified GLS fit review. No participant roster or private reflection data imported.'
  );

  insert into public.zgirl_pilot_events(
    pilot_id,institution_id,actor_operator_id,event_type,summary,details
  ) values(
    v_pilot_id,v_institution.id,v_actor_id,'gls_governed_workspace_prepared',
    'Governed Z-Girl pilot workspace prepared from qualified and executed GLS institutional handoff',
    jsonb_build_object(
      'glsOpportunityId',v_o.id,
      'glsAgreementId',v_a.id,
      'glsEngagementId',v_e.id,
      'privateReflectionImported',false,
      'liveActivated',false,
      'safetyRouteConfirmed',false
    )
  );

  return jsonb_build_object(
    'created',true,
    'existing',false,
    'pilotId',v_pilot_id,
    'pilotCode',(select pilot_code from public.zgirl_pilot_programs where id=v_pilot_id),
    'institutionId',v_institution.id,
    'institutionCode',v_institution.institution_code,
    'stage','opportunity',
    'privateReflectionImported',false,
    'liveActivated',false,
    'nextStep','Open the Z-Girl pilot workspace and complete operational readiness. Safety route confirmation and human release remain required.'
  );
end;
$function$;

revoke all on function public.zgirl_prepare_gls_pilot_workspace(text,uuid) from public;
grant execute on function public.zgirl_prepare_gls_pilot_workspace(text,uuid) to anon, authenticated;
