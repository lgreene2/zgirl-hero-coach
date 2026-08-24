-- Z-Girl v3.14 — human readiness decision and governed release-evidence workflow.
--
-- This layer stores adult operator review evidence and immutable human release
-- decisions only. It must never store participant private reflections, journals,
-- diagnoses, counseling notes, safeguarding narratives, or individual case data.

create table if not exists public.zgirl_pilot_release_evidence (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.zgirl_pilot_programs(id) on delete cascade,
  gate_key text not null check (gate_key in (
    'method_fidelity',
    'safety_escalation',
    'age_fit',
    'participant_agency',
    'privacy_data_boundary',
    'accessibility',
    'technical_reliability',
    'family_notice_consent',
    'staff_orientation',
    'cohort_schedule_devices',
    'aggregate_measurement_plan'
  )),
  status text not null default 'not_assessed' check (status in ('not_assessed','pass','conditional','fail')),
  evidence_reference text check (evidence_reference is null or char_length(evidence_reference) <= 1000),
  reviewer_notes text check (reviewer_notes is null or char_length(reviewer_notes) <= 4000),
  reviewed_by_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pilot_id, gate_key)
);

comment on table public.zgirl_pilot_release_evidence is
  'Adult operator release-gate evidence only. No participant private reflection, case, clinical, diagnosis, counseling, or safeguarding narrative data.';

create index if not exists zgirl_pilot_release_evidence_status_idx
  on public.zgirl_pilot_release_evidence(pilot_id,status,gate_key);

create table if not exists public.zgirl_pilot_readiness_decisions (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.zgirl_pilot_programs(id) on delete cascade,
  decision_sequence integer not null check (decision_sequence > 0),
  decision text not null check (decision in ('ready','ready_with_conditions','not_ready')),
  rationale text not null check (char_length(trim(rationale)) between 3 and 5000),
  conditions text check (conditions is null or char_length(conditions) <= 5000),
  release_authorized boolean not null default false,
  human_acknowledged boolean not null check (human_acknowledged),
  evidence_snapshot jsonb not null,
  operational_snapshot jsonb not null,
  supersedes_decision_id uuid references public.zgirl_pilot_readiness_decisions(id) on delete restrict,
  decided_by_operator_id uuid not null references public.zgirl_operator_identities(id) on delete restrict,
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (pilot_id, decision_sequence),
  check (not release_authorized or decision = 'ready')
);

comment on table public.zgirl_pilot_readiness_decisions is
  'Append-only human readiness and live-release decision ledger. A decision never contains participant private reflection or individual case data.';

create index if not exists zgirl_pilot_readiness_decisions_latest_idx
  on public.zgirl_pilot_readiness_decisions(pilot_id,decision_sequence desc);

alter table public.zgirl_pilot_release_evidence enable row level security;
alter table public.zgirl_pilot_readiness_decisions enable row level security;

revoke all on public.zgirl_pilot_release_evidence, public.zgirl_pilot_readiness_decisions
  from public, anon, authenticated;

create or replace function private.zgirl_pilot_release_gate_summary(p_pilot_id uuid)
returns jsonb
language sql
stable
set search_path = pg_catalog, public
as $$
  with required(gate_key,label,sort_order) as (values
    ('method_fidelity','Method fidelity',10),
    ('safety_escalation','Safety and escalation route',20),
    ('age_fit','Age and audience fit',30),
    ('participant_agency','Participant agency and voluntary disclosure',40),
    ('privacy_data_boundary','Privacy and data boundary',50),
    ('accessibility','Accessibility and accommodations',60),
    ('technical_reliability','Technical and device reliability',70),
    ('family_notice_consent','Family notice / consent or documented not-applicable basis',80),
    ('staff_orientation','Staff orientation and named responsibilities',90),
    ('cohort_schedule_devices','Cohort, schedule and device plan',100),
    ('aggregate_measurement_plan','Aggregate-only measurement plan',110)
  ), rows as (
    select
      r.gate_key,
      r.label,
      r.sort_order,
      coalesce(e.status,'not_assessed') as status,
      e.evidence_reference,
      e.reviewer_notes,
      e.reviewed_by_operator_id,
      o.display_name as reviewed_by_name,
      e.reviewed_at,
      e.updated_at
    from required r
    left join public.zgirl_pilot_release_evidence e
      on e.pilot_id=p_pilot_id and e.gate_key=r.gate_key
    left join public.zgirl_operator_identities o on o.id=e.reviewed_by_operator_id
  )
  select jsonb_build_object(
    'required',count(*),
    'passed',count(*) filter (where status='pass'),
    'conditional',count(*) filter (where status='conditional'),
    'failed',count(*) filter (where status='fail'),
    'notAssessed',count(*) filter (where status='not_assessed'),
    'missing',coalesce(jsonb_agg(gate_key order by sort_order) filter (where status='not_assessed'),'[]'::jsonb),
    'conditionalKeys',coalesce(jsonb_agg(gate_key order by sort_order) filter (where status='conditional'),'[]'::jsonb),
    'failedKeys',coalesce(jsonb_agg(gate_key order by sort_order) filter (where status='fail'),'[]'::jsonb),
    'releaseReady',count(*) filter (where status='pass')=count(*),
    'items',jsonb_agg(jsonb_build_object(
      'gateKey',gate_key,
      'label',label,
      'sortOrder',sort_order,
      'status',status,
      'evidenceReference',evidence_reference,
      'reviewerNotes',reviewer_notes,
      'reviewedByOperatorId',reviewed_by_operator_id,
      'reviewedByName',reviewed_by_name,
      'reviewedAt',reviewed_at,
      'updatedAt',updated_at
    ) order by sort_order)
  ) from rows
$$;

revoke all on function private.zgirl_pilot_release_gate_summary(uuid)
  from public, anon, authenticated;

create or replace function private.zgirl_pilot_release_operational_summary(p_pilot_id uuid)
returns jsonb
language sql
stable
set search_path = pg_catalog, public, private
as $$
  with pilot as (
    select * from public.zgirl_pilot_programs where id=p_pilot_id
  ), flags as (
    select
      private.zgirl_pilot_readiness(p_pilot_id) as intake_readiness,
      exists(select 1 from pilot where system_owner_operator_id is not null) as named_system_owner,
      exists(select 1 from public.zgirl_pilot_team_assignments where pilot_id=p_pilot_id and status='active' and role_key in ('institutional_admin','implementation_contact')) as implementation_contact,
      exists(select 1 from public.zgirl_pilot_team_assignments where pilot_id=p_pilot_id and status='active' and role_key='facilitator') as facilitator,
      exists(select 1 from public.zgirl_pilot_team_assignments where pilot_id=p_pilot_id and status='active' and role_key='safety_contact') as safety_contact,
      exists(select 1 from public.zgirl_pilot_team_assignments where pilot_id=p_pilot_id and status='active' and role_key='accessibility_contact') as accessibility_contact,
      exists(select 1 from public.zgirl_pilot_cohorts where pilot_id=p_pilot_id and status in ('ready','active')) as cohort_ready
  )
  select jsonb_build_object(
    'intakeReadiness',intake_readiness,
    'namedSystemOwner',named_system_owner,
    'implementationContact',implementation_contact,
    'facilitator',facilitator,
    'safetyContact',safety_contact,
    'accessibilityContact',accessibility_contact,
    'cohortReady',cohort_ready,
    'operationalReady',
      coalesce((intake_readiness->>'ready')::boolean,false)
      and named_system_owner
      and implementation_contact
      and facilitator
      and safety_contact
      and accessibility_contact
      and cohort_ready
  ) from flags
$$;

revoke all on function private.zgirl_pilot_release_operational_summary(uuid)
  from public, anon, authenticated;

create or replace function public.zgirl_pilot_save_release_evidence(
  p_session_token text,
  p_pilot_id uuid,
  p_gate_key text,
  p_status text,
  p_evidence_reference text,
  p_reviewer_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_context jsonb;
  v_actor uuid;
  v_institution_id uuid;
begin
  v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.evidence');
  v_actor:=private.zgirl_pilot_actor(v_context);
  if v_actor is null then raise exception 'named_release_reviewer_required'; end if;
  if p_gate_key not in (
    'method_fidelity','safety_escalation','age_fit','participant_agency','privacy_data_boundary',
    'accessibility','technical_reliability','family_notice_consent','staff_orientation',
    'cohort_schedule_devices','aggregate_measurement_plan'
  ) then raise exception 'invalid_release_gate'; end if;
  if p_status not in ('not_assessed','pass','conditional','fail') then raise exception 'invalid_release_gate_status'; end if;
  if p_status<>'not_assessed' and nullif(trim(coalesce(p_evidence_reference,'')),'') is null then
    raise exception 'release_evidence_reference_required';
  end if;
  if p_status in ('conditional','fail') and nullif(trim(coalesce(p_reviewer_notes,'')),'') is null then
    raise exception 'release_reviewer_notes_required';
  end if;

  insert into public.zgirl_pilot_release_evidence(
    pilot_id,gate_key,status,evidence_reference,reviewer_notes,reviewed_by_operator_id,reviewed_at
  ) values(
    p_pilot_id,p_gate_key,p_status,
    case when p_status='not_assessed' then null else nullif(trim(p_evidence_reference),'') end,
    case when p_status='not_assessed' then null else nullif(trim(p_reviewer_notes),'') end,
    v_actor,case when p_status='not_assessed' then null else now() end
  )
  on conflict(pilot_id,gate_key) do update set
    status=excluded.status,
    evidence_reference=excluded.evidence_reference,
    reviewer_notes=excluded.reviewer_notes,
    reviewed_by_operator_id=excluded.reviewed_by_operator_id,
    reviewed_at=excluded.reviewed_at,
    updated_at=now();

  select institution_id into v_institution_id from public.zgirl_pilot_programs where id=p_pilot_id;
  insert into public.zgirl_pilot_events(
    pilot_id,institution_id,actor_operator_id,event_type,summary,details
  ) values(
    p_pilot_id,v_institution_id,v_actor,'release_evidence_reviewed',
    'Pilot release-evidence gate reviewed',
    jsonb_build_object('gateKey',p_gate_key,'status',p_status)
  );

  return private.zgirl_pilot_release_gate_summary(p_pilot_id);
end;
$$;
revoke all on function public.zgirl_pilot_save_release_evidence(text,uuid,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.zgirl_pilot_save_release_evidence(text,uuid,text,text,text,text)
  to anon, authenticated;

create or replace function public.zgirl_pilot_finalize_readiness_decision(
  p_session_token text,
  p_pilot_id uuid,
  p_decision text,
  p_rationale text,
  p_conditions text,
  p_release_authorized boolean,
  p_human_acknowledged boolean
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_context jsonb;
  v_actor uuid;
  v_pilot public.zgirl_pilot_programs%rowtype;
  v_gate jsonb;
  v_operational jsonb;
  v_sequence integer;
  v_supersedes uuid;
  v_decision_id uuid;
begin
  v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.activate');
  v_actor:=private.zgirl_pilot_actor(v_context);
  if v_actor is null then raise exception 'named_release_decision_maker_required'; end if;
  if not coalesce(p_human_acknowledged,false) then raise exception 'human_release_acknowledgement_required'; end if;
  if p_decision not in ('ready','ready_with_conditions','not_ready') then raise exception 'invalid_readiness_decision'; end if;
  if char_length(trim(coalesce(p_rationale,'')))<3 then raise exception 'readiness_decision_rationale_required'; end if;

  select * into v_pilot from public.zgirl_pilot_programs where id=p_pilot_id;
  if v_pilot.id is null then raise exception 'pilot_not_found'; end if;
  v_gate:=private.zgirl_pilot_release_gate_summary(p_pilot_id);
  v_operational:=private.zgirl_pilot_release_operational_summary(p_pilot_id);

  if p_decision='ready' then
    if not coalesce((v_gate->>'releaseReady')::boolean,false) then raise exception 'release_evidence_incomplete'; end if;
    if not coalesce((v_operational->>'operationalReady')::boolean,false) then raise exception 'pilot_operational_readiness_incomplete'; end if;
  end if;
  if p_decision='ready_with_conditions' then
    if nullif(trim(coalesce(p_conditions,'')),'') is null then raise exception 'readiness_conditions_required'; end if;
    if coalesce((v_gate->>'notAssessed')::integer,0)>0 or coalesce((v_gate->>'failed')::integer,0)>0 or coalesce((v_gate->>'conditional')::integer,0)=0 then
      raise exception 'conditional_release_evidence_invalid';
    end if;
    if coalesce(p_release_authorized,false) then raise exception 'conditional_decision_cannot_authorize_release'; end if;
  end if;
  if p_decision='not_ready' and coalesce(p_release_authorized,false) then
    raise exception 'not_ready_decision_cannot_authorize_release';
  end if;
  if coalesce(p_release_authorized,false) then
    if p_decision<>'ready' then raise exception 'ready_decision_required_for_release'; end if;
    if v_pilot.is_test then raise exception 'test_pilot_release_prohibited'; end if;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_pilot_id::text));
  select id,decision_sequence into v_supersedes,v_sequence
  from public.zgirl_pilot_readiness_decisions
  where pilot_id=p_pilot_id order by decision_sequence desc limit 1;
  v_sequence:=coalesce(v_sequence,0)+1;

  insert into public.zgirl_pilot_readiness_decisions(
    pilot_id,decision_sequence,decision,rationale,conditions,release_authorized,human_acknowledged,
    evidence_snapshot,operational_snapshot,supersedes_decision_id,decided_by_operator_id
  ) values(
    p_pilot_id,v_sequence,p_decision,trim(p_rationale),nullif(trim(p_conditions),''),
    coalesce(p_release_authorized,false),true,v_gate,v_operational,v_supersedes,v_actor
  ) returning id into v_decision_id;

  insert into public.zgirl_pilot_events(
    pilot_id,institution_id,actor_operator_id,event_type,summary,details
  ) values(
    p_pilot_id,v_pilot.institution_id,v_actor,'readiness_decision_finalized',
    'Human pilot readiness decision finalized',
    jsonb_build_object(
      'decisionId',v_decision_id,
      'decisionSequence',v_sequence,
      'decision',p_decision,
      'releaseAuthorized',coalesce(p_release_authorized,false),
      'testPilot',v_pilot.is_test
    )
  );

  return jsonb_build_object(
    'decisionId',v_decision_id,
    'decisionSequence',v_sequence,
    'decision',p_decision,
    'releaseAuthorized',coalesce(p_release_authorized,false),
    'evidenceSnapshot',v_gate,
    'operationalSnapshot',v_operational
  );
end;
$$;

revoke all on function public.zgirl_pilot_finalize_readiness_decision(text,uuid,text,text,text,boolean,boolean)
  from public, anon, authenticated;
grant execute on function public.zgirl_pilot_finalize_readiness_decision(text,uuid,text,text,text,boolean,boolean)
  to anon, authenticated;

-- Replace the v3.11 transition function with the same lifecycle protections plus
-- the v3.14 evidence-backed, latest-human-decision live-release lock.
create or replace function public.zgirl_pilot_advance_stage(
  p_session_token text,p_pilot_id uuid,p_stage text,p_next_action text,p_next_action_due date,p_blocker_summary text
)
returns boolean
language plpgsql
security definer
set search_path=pg_catalog,public,private
as $$
declare
 v_context jsonb;
 v_pilot public.zgirl_pilot_programs%rowtype;
 v_readiness jsonb;
 v_qualification jsonb;
 v_release_gate jsonb;
 v_latest_decision public.zgirl_pilot_readiness_decisions%rowtype;
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
  if v_pilot.is_test then raise exception 'test_pilot_live_release_prohibited'; end if;
  v_release_gate:=private.zgirl_pilot_release_gate_summary(p_pilot_id);
  if not coalesce((v_release_gate->>'releaseReady')::boolean,false) then raise exception 'release_evidence_incomplete'; end if;
  select * into v_latest_decision from public.zgirl_pilot_readiness_decisions
  where pilot_id=p_pilot_id order by decision_sequence desc limit 1;
  if v_latest_decision.id is null
    or v_latest_decision.decision<>'ready'
    or not v_latest_decision.release_authorized
  then raise exception 'human_live_release_required'; end if;
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
  next_action=nullif(trim(p_next_action),''),
  next_action_due=p_next_action_due,
  blocker_summary=nullif(trim(p_blocker_summary),''),
  updated_at=now()
 where id=p_pilot_id;

 insert into public.zgirl_pilot_events(pilot_id,institution_id,actor_operator_id,event_type,summary,details)
 values(p_pilot_id,v_pilot.institution_id,private.zgirl_pilot_actor(v_context),'stage_changed','Pilot lifecycle stage changed',jsonb_build_object('from',v_pilot.stage,'to',p_stage));
 return true;
end;
$$;

-- Add v3.14 release evidence and immutable decisions to the existing restricted dashboard.
create or replace function public.zgirl_pilot_dashboard(
  p_session_token text,p_pilot_id uuid default null,p_institution_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path=pg_catalog,public,private
as $$
declare
  v_context jsonb;
  v_pilot public.zgirl_pilot_programs%rowtype;
begin
 if p_pilot_id is not null then
  select * into v_pilot from public.zgirl_pilot_programs where id=p_pilot_id;
  if v_pilot.id is null then raise exception 'pilot_not_found'; end if;
  v_context:=private.zgirl_operator_require_capability(p_session_token,'pilot.read',v_pilot.institution_id);
  return jsonb_build_object(
    'context',v_context,
    'pilot',to_jsonb(v_pilot),
    'institution',(select to_jsonb(i) from public.zgirl_institutions i where i.id=v_pilot.institution_id),
    'readiness',private.zgirl_pilot_readiness(v_pilot.id),
    'releaseGate',private.zgirl_pilot_release_gate_summary(v_pilot.id),
    'releaseOperational',private.zgirl_pilot_release_operational_summary(v_pilot.id),
    'readinessDecisions',coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',d.id,
        'decisionSequence',d.decision_sequence,
        'decision',d.decision,
        'rationale',d.rationale,
        'conditions',d.conditions,
        'releaseAuthorized',d.release_authorized,
        'humanAcknowledged',d.human_acknowledged,
        'evidenceSnapshot',d.evidence_snapshot,
        'operationalSnapshot',d.operational_snapshot,
        'supersedesDecisionId',d.supersedes_decision_id,
        'decidedByOperatorId',d.decided_by_operator_id,
        'decidedByName',o.display_name,
        'decidedAt',d.decided_at
      ) order by d.decision_sequence desc)
      from public.zgirl_pilot_readiness_decisions d
      left join public.zgirl_operator_identities o on o.id=d.decided_by_operator_id
      where d.pilot_id=v_pilot.id
    ),'[]'::jsonb),
    'intake',(select to_jsonb(x) from public.zgirl_pilot_intakes x where x.pilot_id=v_pilot.id),
    'team',coalesce((select jsonb_agg(to_jsonb(x) order by x.role_key,x.display_name) from public.zgirl_pilot_team_assignments x where x.pilot_id=v_pilot.id),'[]'::jsonb),
    'cohorts',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.zgirl_pilot_cohorts x where x.pilot_id=v_pilot.id),'[]'::jsonb),
    'milestones',coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.zgirl_pilot_milestones x where x.pilot_id=v_pilot.id),'[]'::jsonb),
    'metrics',coalesce((select jsonb_agg(to_jsonb(x) order by x.snapshot_date desc,x.created_at desc) from public.zgirl_pilot_metric_snapshots x where x.pilot_id=v_pilot.id limit 100),'[]'::jsonb),
    'evidence',coalesce((select jsonb_agg(to_jsonb(x) order by x.evidence_date desc,x.created_at desc) from public.zgirl_pilot_evidence x where x.pilot_id=v_pilot.id limit 200),'[]'::jsonb),
    'permissions',(select to_jsonb(x) from public.zgirl_pilot_permissions x where x.pilot_id=v_pilot.id),
    'competencySignals',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.zgirl_pilot_competency_signals x where x.pilot_id=v_pilot.id),'[]'::jsonb),
    'closeout',(select to_jsonb(x) from public.zgirl_pilot_closeouts x where x.pilot_id=v_pilot.id),
    'events',coalesce((select jsonb_agg(to_jsonb(x) order by x.occurred_at desc) from (select * from public.zgirl_pilot_events where pilot_id=v_pilot.id order by occurred_at desc limit 100)x),'[]'::jsonb)
  );
 end if;

 v_context:=private.zgirl_operator_require_capability(p_session_token,'pilot.read',p_institution_id);
 return jsonb_build_object(
  'context',v_context,
  'activation',jsonb_build_object(
    'namedSystemOwners',(select count(*) from public.zgirl_operator_identities o join public.zgirl_operator_role_assignments r on r.operator_id=o.id where o.status='active' and r.role_key='system_owner' and r.institution_id is null),
    'institutions',(select count(*) from public.zgirl_institutions),
    'realPilots',(select count(*) from public.zgirl_pilot_programs where not is_test),
    'testPilots',(select count(*) from public.zgirl_pilot_programs where is_test),
    'realActivationReady',(select exists(select 1 from public.zgirl_operator_identities o join public.zgirl_operator_role_assignments r on r.operator_id=o.id where o.status='active' and r.role_key='system_owner' and r.institution_id is null))
  ),
  'pilots',coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'pilotCode',p.pilot_code,'institutionId',p.institution_id,'institutionName',i.name,
    'title',p.title,'institutionProfile',p.institution_profile,'solutionProfiles',p.solution_profiles,
    'stage',p.stage,'qualificationStatus',p.qualification_status,'readinessStatus',p.readiness_status,
    'commercialStatus',p.commercial_status,'glsOpportunityId',p.gls_opportunity_id,'glsEngagementId',p.gls_engagement_id,
    'contractingEntityName',p.contracting_entity_name,'engagementNature',p.engagement_nature,
    'participantCapacity',p.participant_capacity,'plannedStartDate',p.planned_start_date,'plannedEndDate',p.planned_end_date,
    'activationDate',p.activation_date,'completionDate',p.completion_date,'renewalDate',p.renewal_date,
    'nextAction',p.next_action,'nextActionDue',p.next_action_due,'blockerSummary',p.blocker_summary,
    'completionStatus',p.completion_status,'renewalStatus',p.renewal_status,'expansionStatus',p.expansion_status,
    'isTest',p.is_test,'readiness',private.zgirl_pilot_readiness(p.id),
    'releaseGate',private.zgirl_pilot_release_gate_summary(p.id),
    'latestReadinessDecision',(select jsonb_build_object(
      'decision',d.decision,'releaseAuthorized',d.release_authorized,'decisionSequence',d.decision_sequence,'decidedAt',d.decided_at
    ) from public.zgirl_pilot_readiness_decisions d where d.pilot_id=p.id order by d.decision_sequence desc limit 1)
  ) order by p.updated_at desc)
  from public.zgirl_pilot_programs p
  join public.zgirl_institutions i on i.id=p.institution_id
  where p_institution_id is null or p.institution_id=p_institution_id),'[]'::jsonb)
 );
end;
$$;
