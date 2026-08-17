-- Z-Girl v3.11 lifecycle and evidence hardening
-- Keeps commercial authority in GLS and implementation authority in Z-Girl.
-- No participant private-reflection text or individual participant registry is introduced.

create or replace function private.zgirl_pilot_qualification(p_pilot_id uuid)
returns jsonb language sql stable set search_path=pg_catalog,public as $$
 with i as (select * from public.zgirl_pilot_intakes where pilot_id=p_pilot_id),
 checks as (
  select unnest(array[
    'decision_maker_accessible','defined_participant_group','manageable_pilot_size','structured_feedback_commitment',
    'credible_use_case','realistic_implementation_access','safety_route_confirmed','privacy_requirements_confirmed'
  ]) label,
  unnest(array[
    coalesce(i.decision_maker_accessible,false),coalesce(i.defined_participant_group,false),coalesce(i.manageable_pilot_size,false),coalesce(i.structured_feedback_commitment,false),
    coalesce(i.credible_use_case,false),coalesce(i.realistic_implementation_access,false),coalesce(i.safety_route_confirmed,false),coalesce(i.privacy_requirements_confirmed,false)
  ]) passed from i
 )
 select jsonb_build_object(
  'passed',coalesce((select count(*) from checks where passed),0),
  'total',8,
  'missing',coalesce((select jsonb_agg(label order by label) from checks where not passed),'[]'::jsonb),
  'qualified',coalesce((select count(*) from checks where passed),0)=8
 )
$$;
revoke all on function private.zgirl_pilot_qualification(uuid) from public,anon,authenticated;

create or replace function private.zgirl_pilot_transition_allowed(p_from text,p_to text)
returns boolean language sql immutable set search_path=pg_catalog as $$
 select case
  when p_from=p_to then true
  when p_to in ('on_hold','cancelled') then true
  when p_from='opportunity' and p_to='qualified' then true
  when p_from='qualified' and p_to='agreement_scope' then true
  when p_from='agreement_scope' and p_to='institution_setup' then true
  when p_from='institution_setup' and p_to='onboarding' then true
  when p_from='onboarding' and p_to='pilot_ready' then true
  when p_from='pilot_ready' and p_to='live' then true
  when p_from='live' and p_to='evidence_collection' then true
  when p_from='evidence_collection' and p_to='completed' then true
  when p_from='completed' and p_to in ('renewal','expansion') then true
  when p_from='renewal' and p_to in ('completed','expansion') then true
  when p_from='expansion' and p_to in ('completed','renewal') then true
  -- A hold is a human-controlled pause. Re-entry still must satisfy the target-stage gates below.
  when p_from='on_hold' and p_to in ('opportunity','qualified','agreement_scope','institution_setup','onboarding','pilot_ready','live','evidence_collection','completed','renewal','expansion') then true
  else false end
$$;
revoke all on function private.zgirl_pilot_transition_allowed(text,text) from public,anon,authenticated;

create or replace function public.zgirl_pilot_advance_stage(p_session_token text,p_pilot_id uuid,p_stage text,p_next_action text,p_next_action_due date,p_blocker_summary text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare
 v_context jsonb; v_pilot public.zgirl_pilot_programs%rowtype; v_readiness jsonb; v_qualification jsonb;
begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.activate');
 select * into v_pilot from public.zgirl_pilot_programs where id=p_pilot_id;
 if v_pilot.id is null then raise exception 'pilot_not_found'; end if;
 if p_stage not in ('opportunity','qualified','agreement_scope','institution_setup','onboarding','pilot_ready','live','evidence_collection','completed','renewal','expansion','on_hold','cancelled') then raise exception 'invalid_pilot_stage'; end if;
 if not private.zgirl_pilot_transition_allowed(v_pilot.stage,p_stage) then raise exception 'pilot_stage_transition_not_allowed'; end if;

 if p_stage='qualified' then
  v_qualification:=private.zgirl_pilot_qualification(p_pilot_id);
  if not coalesce((v_qualification->>'qualified')::boolean,false) then raise exception 'pilot_qualification_incomplete'; end if;
 end if;

 if p_stage='agreement_scope' and v_pilot.engagement_nature='commercial' and nullif(trim(coalesce(v_pilot.gls_opportunity_id,'')),'') is null then
  raise exception 'gls_opportunity_required';
 end if;

 if p_stage='institution_setup' and not exists(
   select 1 from public.zgirl_operator_identities o
   join public.zgirl_operator_role_assignments r on r.operator_id=o.id
   where o.id=v_pilot.system_owner_operator_id and o.status='active' and r.role_key='system_owner' and r.institution_id is null
 ) then raise exception 'named_system_owner_required'; end if;

 if p_stage='onboarding' and not exists(
   select 1 from public.zgirl_pilot_team_assignments
   where pilot_id=p_pilot_id and status='active' and role_key in ('institutional_admin','implementation_contact')
 ) then raise exception 'pilot_implementation_owner_required'; end if;

 if p_stage='pilot_ready' then
  v_readiness:=private.zgirl_pilot_readiness(p_pilot_id);
  if not coalesce((v_readiness->>'ready')::boolean,false) then raise exception 'pilot_readiness_incomplete'; end if;
  if not exists(select 1 from public.zgirl_pilot_cohorts where pilot_id=p_pilot_id and status in ('ready','active')) then raise exception 'pilot_cohort_required'; end if;
  if not exists(select 1 from public.zgirl_pilot_team_assignments where pilot_id=p_pilot_id and role_key='facilitator' and status='active') then raise exception 'pilot_facilitator_required'; end if;
  if not exists(select 1 from public.zgirl_pilot_team_assignments where pilot_id=p_pilot_id and role_key='safety_contact' and status='active') then raise exception 'pilot_safety_contact_required'; end if;
 end if;

 if p_stage='live' then
  if v_pilot.engagement_nature='commercial' and v_pilot.commercial_status not in ('agreement_executed','invoice_ready','payment_pending','paid') then raise exception 'pilot_executed_agreement_required'; end if;
  if v_pilot.engagement_nature='sponsored' and v_pilot.commercial_status not in ('sponsored','agreement_executed','invoice_ready','paid') then raise exception 'pilot_commercial_authority_required'; end if;
  if v_pilot.engagement_nature='no_charge' and v_pilot.commercial_status not in ('no_charge','agreement_executed') then raise exception 'pilot_commercial_authority_required'; end if;
  if not v_pilot.is_test and v_pilot.system_owner_operator_id is null then raise exception 'named_system_owner_required'; end if;
 end if;

 if p_stage='evidence_collection' and not exists(
   select 1 from public.zgirl_pilot_metric_snapshots where pilot_id=p_pilot_id
   union all select 1 from public.zgirl_pilot_evidence where pilot_id=p_pilot_id limit 1
 ) then raise exception 'pilot_evidence_required'; end if;

 if p_stage='completed' then
  if not exists(select 1 from public.zgirl_pilot_evidence where pilot_id=p_pilot_id) then raise exception 'pilot_evidence_required'; end if;
  if not exists(select 1 from public.zgirl_pilot_closeouts where pilot_id=p_pilot_id and nullif(trim(coalesce(implementation_summary,'')),'') is not null) then raise exception 'pilot_closeout_required'; end if;
 end if;

 update public.zgirl_pilot_programs set
  stage=p_stage,
  activation_date=case when p_stage='live' then coalesce(activation_date,current_date) else activation_date end,
  completion_date=case when p_stage='completed' then coalesce(completion_date,current_date) else completion_date end,
  completion_status=case when p_stage='completed' then 'complete' when p_stage in ('live','evidence_collection') then 'in_progress' when p_stage='on_hold' then 'blocked' else completion_status end,
  qualification_status=case when p_stage='qualified' then 'qualified' else qualification_status end,
  next_action=nullif(trim(p_next_action),''),next_action_due=p_next_action_due,blocker_summary=nullif(trim(p_blocker_summary),''),updated_at=now()
 where id=p_pilot_id;
 insert into public.zgirl_pilot_events(pilot_id,institution_id,actor_operator_id,event_type,summary,details)
 values(p_pilot_id,v_pilot.institution_id,private.zgirl_pilot_actor(v_context),'stage_changed','Pilot lifecycle stage changed',jsonb_build_object('from',v_pilot.stage,'to',p_stage));
 return true;
end; $$;

create or replace function public.zgirl_pilot_record_metrics(p_session_token text,p_pilot_id uuid,p_cohort_id uuid,p_snapshot_date date,p_source_type text,p_source_reference text,p_metrics jsonb,p_notes text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare
 v_context jsonb; v_id uuid; v_capacity integer;
 v_invited integer:=greatest(coalesce((p_metrics->>'participantsInvited')::int,0),0);
 v_activated integer:=greatest(coalesce((p_metrics->>'participantsActivated')::int,0),0);
 v_active integer:=greatest(coalesce((p_metrics->>'activeParticipants')::int,0),0);
 v_started integer:=greatest(coalesce((p_metrics->>'activitiesStarted')::int,0),0);
 v_completed integer:=greatest(coalesce((p_metrics->>'activitiesCompleted')::int,0),0);
 v_sessions integer:=greatest(coalesce((p_metrics->>'reflectionSessions')::int,0),0);
 v_support integer:=greatest(coalesce((p_metrics->>'supportRequests')::int,0),0);
 v_accessibility integer:=greatest(coalesce((p_metrics->>'accessibilityIssues')::int,0),0);
begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.evidence');
 if p_source_type not in ('system_analytics','administrator_report','facilitator_report','manual_verified','import') then raise exception 'invalid_pilot_metric_source'; end if;
 if p_cohort_id is not null then
  select capacity into v_capacity from public.zgirl_pilot_cohorts where id=p_cohort_id and pilot_id=p_pilot_id;
  if v_capacity is null then raise exception 'pilot_cohort_not_found'; end if;
 else
  select participant_capacity into v_capacity from public.zgirl_pilot_programs where id=p_pilot_id;
 end if;
 if v_invited>v_capacity or v_activated>v_invited or v_active>v_activated or v_completed>v_started then raise exception 'pilot_metric_integrity_failed'; end if;
 insert into public.zgirl_pilot_metric_snapshots(pilot_id,cohort_id,snapshot_date,source_type,source_reference,participants_invited,participants_activated,active_participants,activities_started,activities_completed,reflection_sessions,support_requests,accessibility_issues,notes,recorded_by_operator_id)
 values(p_pilot_id,p_cohort_id,coalesce(p_snapshot_date,current_date),p_source_type,nullif(trim(p_source_reference),''),v_invited,v_activated,v_active,v_started,v_completed,v_sessions,v_support,v_accessibility,nullif(trim(p_notes),''),private.zgirl_pilot_actor(v_context))
 on conflict(pilot_id,cohort_id,snapshot_date,source_type) do update set source_reference=excluded.source_reference,participants_invited=excluded.participants_invited,participants_activated=excluded.participants_activated,active_participants=excluded.active_participants,activities_started=excluded.activities_started,activities_completed=excluded.activities_completed,reflection_sessions=excluded.reflection_sessions,support_requests=excluded.support_requests,accessibility_issues=excluded.accessibility_issues,notes=excluded.notes,recorded_by_operator_id=excluded.recorded_by_operator_id returning id into v_id;
 return v_id;
end; $$;

create or replace function public.zgirl_pilot_save_closeout(p_session_token text,p_pilot_id uuid,p_payload jsonb,p_finalize boolean default false)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_context jsonb; v_pilot public.zgirl_pilot_programs%rowtype;
begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,case when coalesce(p_finalize,false) then 'pilot.closeout' else 'pilot.evidence' end);
 select * into v_pilot from public.zgirl_pilot_programs where id=p_pilot_id;
 if coalesce(p_finalize,false) then
  if v_pilot.stage not in ('completed','renewal','expansion') then raise exception 'pilot_closeout_stage_required'; end if;
  if not exists(select 1 from public.zgirl_pilot_evidence where pilot_id=p_pilot_id) then raise exception 'pilot_evidence_required'; end if;
 end if;
 insert into public.zgirl_pilot_closeouts(pilot_id,implementation_summary,executive_outcome_summary,what_worked,implementation_friction,lessons_for_facilitator_training,renewal_recommendation,expansion_recommendation,evidence_quality,case_study_readiness,finalized,finalized_by_operator_id,finalized_at,updated_at)
 values(p_pilot_id,nullif(trim(p_payload->>'implementationSummary'),''),nullif(trim(p_payload->>'executiveOutcomeSummary'),''),nullif(trim(p_payload->>'whatWorked'),''),nullif(trim(p_payload->>'implementationFriction'),''),nullif(trim(p_payload->>'lessonsForFacilitatorTraining'),''),nullif(trim(p_payload->>'renewalRecommendation'),''),nullif(trim(p_payload->>'expansionRecommendation'),''),coalesce(nullif(p_payload->>'evidenceQuality',''),'developing'),coalesce(nullif(p_payload->>'caseStudyReadiness',''),'not_ready'),coalesce(p_finalize,false),case when p_finalize then private.zgirl_pilot_actor(v_context) else null end,case when p_finalize then now() else null end,now())
 on conflict(pilot_id) do update set implementation_summary=excluded.implementation_summary,executive_outcome_summary=excluded.executive_outcome_summary,what_worked=excluded.what_worked,implementation_friction=excluded.implementation_friction,lessons_for_facilitator_training=excluded.lessons_for_facilitator_training,renewal_recommendation=excluded.renewal_recommendation,expansion_recommendation=excluded.expansion_recommendation,evidence_quality=excluded.evidence_quality,case_study_readiness=excluded.case_study_readiness,finalized=case when coalesce(p_finalize,false) then true else public.zgirl_pilot_closeouts.finalized end,finalized_by_operator_id=case when coalesce(p_finalize,false) then private.zgirl_pilot_actor(v_context) else public.zgirl_pilot_closeouts.finalized_by_operator_id end,finalized_at=case when coalesce(p_finalize,false) then now() else public.zgirl_pilot_closeouts.finalized_at end,updated_at=now();
 if p_finalize then insert into public.zgirl_pilot_events(pilot_id,institution_id,actor_operator_id,event_type,summary) values(p_pilot_id,v_pilot.institution_id,private.zgirl_pilot_actor(v_context),'closeout_finalized','Pilot implementation evidence closeout finalized'); end if;
 return true;
end; $$;
