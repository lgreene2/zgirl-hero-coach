-- Z-Girl v3.11 Operational Activation & Institutional Pilot Engine
-- Reusable institution-agnostic implementation layer linked to, but not duplicating, the GLS commercial pipeline.
-- No participant private-reflection text, youth/student/athlete case records, diagnosis/treatment data,
-- credential assessment detail, payment-card data, or clinical/clergy/sports-medicine records belong here.

create table if not exists public.zgirl_pilot_programs (
  id uuid primary key default gen_random_uuid(),
  pilot_code text not null unique,
  institution_id uuid not null references public.zgirl_institutions(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 180),
  institution_profile text not null check (institution_profile in ('school','school_district','college_university','nonprofit','youth_serving_org','faith_organization','athletic_program','municipality','community_organization','other')),
  solution_profiles text[] not null default array['general']::text[] check (solution_profiles <@ array['general','edu','faith','athlete','accessibility_support']::text[] and cardinality(solution_profiles)>0),
  stage text not null default 'opportunity' check (stage in ('opportunity','qualified','agreement_scope','institution_setup','onboarding','pilot_ready','live','evidence_collection','completed','renewal','expansion','on_hold','cancelled')),
  qualification_status text not null default 'not_assessed' check (qualification_status in ('not_assessed','needs_information','qualified','not_ready','declined')),
  readiness_status text not null default 'not_assessed' check (readiness_status in ('not_assessed','blocked','conditional','ready')),
  commercial_status text not null default 'not_scoped' check (commercial_status in ('not_scoped','scope_draft','proposal_ready','proposal_sent','agreement_pending','agreement_executed','invoice_ready','payment_pending','paid','sponsored','no_charge')),
  gls_opportunity_id text check (gls_opportunity_id is null or char_length(gls_opportunity_id)<=100),
  gls_agreement_id text check (gls_agreement_id is null or char_length(gls_agreement_id)<=100),
  gls_engagement_id text check (gls_engagement_id is null or char_length(gls_engagement_id)<=100),
  gls_stage_snapshot text check (gls_stage_snapshot is null or char_length(gls_stage_snapshot)<=80),
  gls_last_synced_at timestamptz,
  contracting_entity_name text not null check (char_length(trim(contracting_entity_name)) between 2 and 180),
  engagement_nature text not null default 'commercial' check (engagement_nature in ('commercial','nonprofit_mission','sponsored','no_charge','test')),
  decision_maker_name text check (decision_maker_name is null or char_length(decision_maker_name)<=160),
  decision_maker_role text check (decision_maker_role is null or char_length(decision_maker_role)<=160),
  decision_maker_email text check (decision_maker_email is null or (position('@' in decision_maker_email)>1 and char_length(decision_maker_email)<=254)),
  system_owner_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  implementation_owner_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  participant_capacity integer not null default 1 check (participant_capacity between 1 and 100000),
  proposed_price_cents integer check (proposed_price_cents is null or proposed_price_cents between 0 and 1000000000),
  contracted_price_cents integer check (contracted_price_cents is null or contracted_price_cents between 0 and 1000000000),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  planned_start_date date,
  planned_end_date date,
  activation_date date,
  completion_date date,
  renewal_date date,
  next_action text check (next_action is null or char_length(next_action)<=500),
  next_action_due date,
  blocker_summary text check (blocker_summary is null or char_length(blocker_summary)<=1000),
  completion_status text not null default 'not_started' check (completion_status in ('not_started','in_progress','blocked','complete')),
  renewal_status text not null default 'not_assessed' check (renewal_status in ('not_assessed','not_ready','ready','discussion','renewed','declined')),
  expansion_status text not null default 'not_assessed' check (expansion_status in ('not_assessed','no_signal','potential','qualified','proposal','expanded','declined')),
  is_test boolean not null default false,
  created_by_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (planned_end_date is null or planned_start_date is null or planned_end_date>=planned_start_date)
);
create unique index if not exists zgirl_pilot_gls_engagement_unique on public.zgirl_pilot_programs(gls_engagement_id) where gls_engagement_id is not null;
create index if not exists zgirl_pilot_institution_stage_idx on public.zgirl_pilot_programs(institution_id,stage,updated_at desc);
create index if not exists zgirl_pilot_renewal_idx on public.zgirl_pilot_programs(renewal_date,renewal_status) where stage not in ('cancelled','on_hold');

create table if not exists public.zgirl_pilot_intakes (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null unique references public.zgirl_pilot_programs(id) on delete cascade,
  pilot_goals text check (pilot_goals is null or char_length(pilot_goals)<=6000),
  intended_population text check (intended_population is null or char_length(intended_population)<=3000),
  participant_structure text check (participant_structure is null or char_length(participant_structure)<=2000),
  implementation_environment text check (implementation_environment is null or char_length(implementation_environment)<=3000),
  facilitator_requirements text check (facilitator_requirements is null or char_length(facilitator_requirements)<=3000),
  accessibility_considerations text check (accessibility_considerations is null or char_length(accessibility_considerations)<=4000),
  special_population_support text check (special_population_support is null or char_length(special_population_support)<=4000),
  faith_values_profile text check (faith_values_profile is null or char_length(faith_values_profile)<=3000),
  athletics_profile text check (athletics_profile is null or char_length(athletics_profile)<=3000),
  risk_safety_considerations text check (risk_safety_considerations is null or char_length(risk_safety_considerations)<=4000),
  data_privacy_requirements text check (data_privacy_requirements is null or char_length(data_privacy_requirements)<=4000),
  desired_outcomes text check (desired_outcomes is null or char_length(desired_outcomes)<=5000),
  timeline_notes text check (timeline_notes is null or char_length(timeline_notes)<=3000),
  budget_pricing_notes text check (budget_pricing_notes is null or char_length(budget_pricing_notes)<=3000),
  decision_status text not null default 'exploring' check (decision_status in ('exploring','internal_review','decision_pending','approved','declined','on_hold')),
  decision_maker_accessible boolean,
  defined_participant_group boolean,
  manageable_pilot_size boolean,
  structured_feedback_commitment boolean,
  credible_use_case boolean,
  realistic_implementation_access boolean,
  reference_case_study_potential boolean,
  renewal_expansion_potential boolean,
  safety_route_confirmed boolean,
  privacy_requirements_confirmed boolean,
  accessibility_plan_confirmed boolean,
  facilitator_capacity_confirmed boolean,
  readiness_blockers jsonb not null default '[]'::jsonb,
  readiness_notes text check (readiness_notes is null or char_length(readiness_notes)<=5000),
  updated_by_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.zgirl_pilot_team_assignments (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.zgirl_pilot_programs(id) on delete cascade,
  operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  role_key text not null check (role_key in ('system_owner','institutional_admin','facilitator','reviewer','executive_sponsor','implementation_contact','safety_contact','accessibility_contact')),
  display_name text not null check (char_length(trim(display_name)) between 2 and 160),
  email text check (email is null or (position('@' in email)>1 and char_length(email)<=254)),
  platform_access_required boolean not null default false,
  access_status text not null default 'none' check (access_status in ('none','planned','invited','active','suspended','complete')),
  responsibilities text check (responsibilities is null or char_length(responsibilities)<=3000),
  status text not null default 'active' check (status in ('active','inactive','complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists zgirl_pilot_team_operator_role_unique on public.zgirl_pilot_team_assignments(pilot_id,operator_id,role_key) where operator_id is not null and status='active';
create index if not exists zgirl_pilot_team_idx on public.zgirl_pilot_team_assignments(pilot_id,status,role_key);

create table if not exists public.zgirl_pilot_cohorts (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.zgirl_pilot_programs(id) on delete cascade,
  cohort_code text not null unique,
  name text not null check (char_length(trim(name)) between 2 and 180),
  structure_type text not null check (structure_type in ('class','grade','team','group','program','department','congregation_group','cohort','other')),
  target_population text check (target_population is null or char_length(target_population)<=2000),
  solution_profiles text[] not null default array['general']::text[] check (solution_profiles <@ array['general','edu','faith','athlete','accessibility_support']::text[] and cardinality(solution_profiles)>0),
  capacity integer not null check (capacity between 1 and 100000),
  status text not null default 'planned' check (status in ('planned','ready','active','complete','paused','cancelled')),
  planned_start_date date,
  planned_end_date date,
  accommodation_configuration text check (accommodation_configuration is null or char_length(accommodation_configuration)<=4000),
  notes text check (notes is null or char_length(notes)<=3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (planned_end_date is null or planned_start_date is null or planned_end_date>=planned_start_date)
);
create index if not exists zgirl_pilot_cohort_idx on public.zgirl_pilot_cohorts(pilot_id,status);

create table if not exists public.zgirl_pilot_milestones (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.zgirl_pilot_programs(id) on delete cascade,
  phase text not null check (phase in ('qualification','agreement_scope','institution_setup','onboarding','pilot_ready','live','evidence_collection','closeout','renewal','expansion')),
  title text not null check (char_length(trim(title)) between 3 and 240),
  status text not null default 'not_started' check (status in ('not_started','in_progress','blocked','done','waived')),
  responsible_party text check (responsible_party is null or char_length(responsible_party)<=180),
  due_date date,
  completed_at timestamptz,
  blocker text check (blocker is null or char_length(blocker)<=1000),
  evidence_reference text check (evidence_reference is null or char_length(evidence_reference)<=500),
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists zgirl_pilot_milestone_idx on public.zgirl_pilot_milestones(pilot_id,sort_order,status);

create table if not exists public.zgirl_pilot_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.zgirl_pilot_programs(id) on delete cascade,
  cohort_id uuid references public.zgirl_pilot_cohorts(id) on delete cascade,
  snapshot_date date not null default current_date,
  source_type text not null check (source_type in ('system_analytics','administrator_report','facilitator_report','manual_verified','import')),
  source_reference text check (source_reference is null or char_length(source_reference)<=500),
  participants_invited integer not null default 0 check (participants_invited>=0),
  participants_activated integer not null default 0 check (participants_activated>=0),
  active_participants integer not null default 0 check (active_participants>=0),
  activities_started integer not null default 0 check (activities_started>=0),
  activities_completed integer not null default 0 check (activities_completed>=0),
  reflection_sessions integer not null default 0 check (reflection_sessions>=0),
  support_requests integer not null default 0 check (support_requests>=0),
  accessibility_issues integer not null default 0 check (accessibility_issues>=0),
  notes text check (notes is null or char_length(notes)<=2000),
  recorded_by_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(pilot_id,cohort_id,snapshot_date,source_type)
);
create index if not exists zgirl_pilot_metrics_idx on public.zgirl_pilot_metric_snapshots(pilot_id,snapshot_date desc);

create table if not exists public.zgirl_pilot_evidence (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.zgirl_pilot_programs(id) on delete cascade,
  cohort_id uuid references public.zgirl_pilot_cohorts(id) on delete set null,
  evidence_category text not null check (evidence_category in ('activation','engagement','completion','facilitator_observation','implementation_friction','support_request','accessibility_issue','configuration_change','qualitative_outcome','quantitative_outcome','administrator_feedback','participant_feedback','facilitator_feedback','renewal_signal','expansion_signal','other')),
  provenance_type text not null check (provenance_type in ('system_analytics','administrator_report','facilitator_observation','participant_feedback_aggregate','document','support_log','implementation_record','other')),
  claim_type text not null check (claim_type in ('observed','participant_reported','facilitator_reported','administrator_reported','system_analytic','administrative_fact')),
  summary text not null check (char_length(trim(summary)) between 3 and 5000),
  quantitative_data jsonb not null default '{}'::jsonb,
  source_reference text check (source_reference is null or char_length(source_reference)<=500),
  evidence_date date not null default current_date,
  permission_status text not null default 'internal_only' check (permission_status in ('internal_only','institution_approved','public_use_approved','restricted','withdrawn')),
  verified boolean not null default false,
  recorded_by_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists zgirl_pilot_evidence_idx on public.zgirl_pilot_evidence(pilot_id,evidence_category,evidence_date desc);

create table if not exists public.zgirl_pilot_permissions (
  pilot_id uuid primary key references public.zgirl_pilot_programs(id) on delete cascade,
  testimonial_status text not null default 'not_requested' check (testimonial_status in ('not_requested','requested','granted','declined','withdrawn')),
  case_study_status text not null default 'not_requested' check (case_study_status in ('not_requested','requested','granted','declined','withdrawn')),
  reference_status text not null default 'not_requested' check (reference_status in ('not_requested','requested','granted','declined','withdrawn')),
  funder_evidence_status text not null default 'not_requested' check (funder_evidence_status in ('not_requested','requested','granted','declined','withdrawn','not_applicable')),
  permission_reference text check (permission_reference is null or char_length(permission_reference)<=500),
  notes text check (notes is null or char_length(notes)<=3000),
  updated_by_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.zgirl_pilot_competency_signals (
  id uuid primary key default gen_random_uuid(),
  pilot_id uuid not null references public.zgirl_pilot_programs(id) on delete cascade,
  evidence_id uuid references public.zgirl_pilot_evidence(id) on delete set null,
  domain text not null check (domain in ('safeguarding','escalation','platform_administration','reflection_facilitation','accessibility_adaptation','institutional_communication','evidence_reporting','fidelity','implementation_planning','other')),
  signal_type text not null check (signal_type in ('knowledge_need','common_mistake','training_need','workflow_gap','observed_strength','required_competency')),
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  summary text not null check (char_length(trim(summary)) between 3 and 3000),
  source_role text check (source_role is null or char_length(source_role)<=120),
  included_in_training_backlog boolean not null default false,
  recorded_by_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists zgirl_pilot_competency_idx on public.zgirl_pilot_competency_signals(pilot_id,domain,priority);

create table if not exists public.zgirl_pilot_closeouts (
  pilot_id uuid primary key references public.zgirl_pilot_programs(id) on delete cascade,
  implementation_summary text check (implementation_summary is null or char_length(implementation_summary)<=8000),
  executive_outcome_summary text check (executive_outcome_summary is null or char_length(executive_outcome_summary)<=8000),
  what_worked text check (what_worked is null or char_length(what_worked)<=5000),
  implementation_friction text check (implementation_friction is null or char_length(implementation_friction)<=5000),
  lessons_for_facilitator_training text check (lessons_for_facilitator_training is null or char_length(lessons_for_facilitator_training)<=6000),
  renewal_recommendation text check (renewal_recommendation is null or char_length(renewal_recommendation)<=5000),
  expansion_recommendation text check (expansion_recommendation is null or char_length(expansion_recommendation)<=5000),
  evidence_quality text not null default 'developing' check (evidence_quality in ('insufficient','developing','usable','strong')),
  case_study_readiness text not null default 'not_ready' check (case_study_readiness in ('not_ready','internal_only','permission_pending','ready')),
  finalized boolean not null default false,
  finalized_by_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  finalized_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.zgirl_pilot_events (
  id bigint generated always as identity primary key,
  pilot_id uuid not null references public.zgirl_pilot_programs(id) on delete cascade,
  institution_id uuid not null references public.zgirl_institutions(id) on delete cascade,
  actor_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  event_type text not null check (char_length(event_type) between 2 and 80),
  summary text not null check (char_length(summary) between 3 and 500),
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index if not exists zgirl_pilot_events_idx on public.zgirl_pilot_events(pilot_id,occurred_at desc);

alter table public.zgirl_pilot_programs enable row level security;
alter table public.zgirl_pilot_intakes enable row level security;
alter table public.zgirl_pilot_team_assignments enable row level security;
alter table public.zgirl_pilot_cohorts enable row level security;
alter table public.zgirl_pilot_milestones enable row level security;
alter table public.zgirl_pilot_metric_snapshots enable row level security;
alter table public.zgirl_pilot_evidence enable row level security;
alter table public.zgirl_pilot_permissions enable row level security;
alter table public.zgirl_pilot_competency_signals enable row level security;
alter table public.zgirl_pilot_closeouts enable row level security;
alter table public.zgirl_pilot_events enable row level security;

revoke all on public.zgirl_pilot_programs, public.zgirl_pilot_intakes, public.zgirl_pilot_team_assignments,
 public.zgirl_pilot_cohorts, public.zgirl_pilot_milestones, public.zgirl_pilot_metric_snapshots,
 public.zgirl_pilot_evidence, public.zgirl_pilot_permissions, public.zgirl_pilot_competency_signals,
 public.zgirl_pilot_closeouts, public.zgirl_pilot_events from anon, authenticated;

-- Extend existing named-operator RBAC without changing the meaning of older capabilities.
create or replace function private.zgirl_role_has_capability(p_role text,p_capability text)
returns boolean language sql immutable set search_path=pg_catalog as $$
 select case p_role
  when 'system_owner' then true
  when 'executive' then p_capability = any(array['identity.read','portfolio.read','portfolio.review','briefing.read','briefing.manage','briefing.delivery','pipeline.read','workflow.read','workflow.approve','workflow.release','license.read','credential.read','audit.read','pilot.read','pilot.review','pilot.activate','pilot.closeout'])
  when 'institutional_admin' then p_capability = any(array['portfolio.read','portfolio.review','briefing.read','pipeline.read','pipeline.write','pipeline.handoff','workflow.read','workflow.write','workflow.approve','license.read','license.write','credential.read','pilot.read','pilot.write','pilot.activate','pilot.evidence'])
  when 'pipeline_manager' then p_capability = any(array['portfolio.read','pipeline.read','pipeline.write','pipeline.handoff','workflow.read','pilot.read'])
  when 'credential_admin' then p_capability = any(array['portfolio.read','license.read','credential.read','credential.write','credential.issue','credential.status','pilot.read'])
  when 'auditor' then p_capability = any(array['identity.read','portfolio.read','briefing.read','pipeline.read','workflow.read','license.read','credential.read','audit.read','pilot.read'])
  else false end;
$$;
revoke all on function private.zgirl_role_has_capability(text,text) from public, anon, authenticated;

create or replace function private.zgirl_pilot_require(p_session_token text,p_pilot_id uuid,p_capability text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_institution_id uuid; begin
 select institution_id into v_institution_id from public.zgirl_pilot_programs where id=p_pilot_id;
 if v_institution_id is null then raise exception 'pilot_not_found'; end if;
 return private.zgirl_operator_require_capability(p_session_token,p_capability,v_institution_id);
end; $$;
revoke all on function private.zgirl_pilot_require(text,uuid,text) from public,anon,authenticated;

create or replace function private.zgirl_pilot_actor(p_context jsonb)
returns uuid language sql immutable set search_path=pg_catalog as $$ select nullif(p_context->>'operatorId','')::uuid $$;
revoke all on function private.zgirl_pilot_actor(jsonb) from public,anon,authenticated;

create or replace function private.zgirl_pilot_readiness(p_pilot_id uuid)
returns jsonb language sql stable set search_path=pg_catalog,public as $$
 with i as (select * from public.zgirl_pilot_intakes where pilot_id=p_pilot_id),
 checks as (
  select unnest(array['decision_maker_accessible','defined_participant_group','manageable_pilot_size','structured_feedback_commitment','credible_use_case','realistic_implementation_access','reference_case_study_potential','renewal_expansion_potential','safety_route_confirmed','privacy_requirements_confirmed','accessibility_plan_confirmed','facilitator_capacity_confirmed']) label,
         unnest(array[coalesce(i.decision_maker_accessible,false),coalesce(i.defined_participant_group,false),coalesce(i.manageable_pilot_size,false),coalesce(i.structured_feedback_commitment,false),coalesce(i.credible_use_case,false),coalesce(i.realistic_implementation_access,false),coalesce(i.reference_case_study_potential,false),coalesce(i.renewal_expansion_potential,false),coalesce(i.safety_route_confirmed,false),coalesce(i.privacy_requirements_confirmed,false),coalesce(i.accessibility_plan_confirmed,false),coalesce(i.facilitator_capacity_confirmed,false)]) passed from i
 )
 select jsonb_build_object('passed',coalesce((select count(*) from checks where passed),0),'total',12,'missing',coalesce((select jsonb_agg(label order by label) from checks where not passed),'[]'::jsonb),'ready',coalesce((select count(*) from checks where passed),0)=12) $$;
revoke all on function private.zgirl_pilot_readiness(uuid) from public,anon,authenticated;

create or replace function private.zgirl_seed_pilot_milestones(p_pilot_id uuid)
returns void language plpgsql security definer set search_path=pg_catalog,public as $$ begin
 insert into public.zgirl_pilot_milestones(pilot_id,phase,title,sort_order) values
 (p_pilot_id,'qualification','Institutional intake and pilot readiness confirmed',10),
 (p_pilot_id,'agreement_scope','GLS opportunity, proposal, scope and contracting entity confirmed',20),
 (p_pilot_id,'institution_setup','Institution record and named System Owner confirmed',30),
 (p_pilot_id,'onboarding','Institutional welcome and administrator orientation complete',40),
 (p_pilot_id,'onboarding','Facilitator/reviewer responsibilities and safety escalation route confirmed',50),
 (p_pilot_id,'onboarding','Cohort, participant capacity, accessibility and configuration plan complete',60),
 (p_pilot_id,'pilot_ready','Launch checklist and implementation calendar approved',70),
 (p_pilot_id,'live','Participant activation and implementation launch recorded',80),
 (p_pilot_id,'live','Midpoint adoption, support and implementation-friction review complete',90),
 (p_pilot_id,'evidence_collection','Evidence provenance, feedback and permissions reviewed',100),
 (p_pilot_id,'closeout','Executive implementation summary and closeout review complete',110),
 (p_pilot_id,'renewal','Renewal readiness and annual-license opportunity reviewed',120),
 (p_pilot_id,'expansion','Additional cohort/profile/network and GLS expansion opportunities reviewed',130);
end; $$;
revoke all on function private.zgirl_seed_pilot_milestones(uuid) from public,anon,authenticated;

create or replace function public.zgirl_pilot_create(
 p_session_token text,p_institution_id uuid,p_title text,p_institution_profile text,p_solution_profiles text[],
 p_gls_opportunity_id text,p_gls_agreement_id text,p_gls_engagement_id text,p_contracting_entity_name text,p_engagement_nature text,
 p_decision_maker_name text,p_decision_maker_role text,p_decision_maker_email text,p_system_owner_operator_id uuid,
 p_participant_capacity integer,p_proposed_price_cents integer,p_currency text,p_planned_start_date date,p_planned_end_date date,p_is_test boolean default false)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_context jsonb; v_id uuid; v_code text; begin
 v_context:=private.zgirl_operator_require_capability(p_session_token,'pilot.write',p_institution_id);
 if not exists(select 1 from public.zgirl_institutions where id=p_institution_id) then raise exception 'institution_not_found'; end if;
 if trim(coalesce(p_title,''))='' or p_institution_profile not in ('school','school_district','college_university','nonprofit','youth_serving_org','faith_organization','athletic_program','municipality','community_organization','other') then raise exception 'invalid_pilot'; end if;
 if p_solution_profiles is null or cardinality(p_solution_profiles)=0 or not(p_solution_profiles <@ array['general','edu','faith','athlete','accessibility_support']::text[]) then raise exception 'invalid_pilot_profiles'; end if;
 if trim(coalesce(p_contracting_entity_name,''))='' or p_engagement_nature not in ('commercial','nonprofit_mission','sponsored','no_charge','test') then raise exception 'invalid_pilot_boundary'; end if;
 if p_participant_capacity is null or p_participant_capacity<1 or p_participant_capacity>100000 then raise exception 'invalid_pilot_capacity'; end if;
 if not coalesce(p_is_test,false) then
   if p_system_owner_operator_id is null or not exists(select 1 from public.zgirl_operator_identities o join public.zgirl_operator_role_assignments r on r.operator_id=o.id where o.id=p_system_owner_operator_id and o.status='active' and r.role_key='system_owner' and r.institution_id is null) then raise exception 'named_system_owner_required'; end if;
   if p_engagement_nature='commercial' and nullif(trim(coalesce(p_gls_opportunity_id,'')),'') is null then raise exception 'gls_opportunity_required'; end if;
 end if;
 v_code:='ZG-PILOT-'||extract(year from current_date)::int||'-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10));
 insert into public.zgirl_pilot_programs(pilot_code,institution_id,title,institution_profile,solution_profiles,gls_opportunity_id,gls_agreement_id,gls_engagement_id,contracting_entity_name,engagement_nature,decision_maker_name,decision_maker_role,decision_maker_email,system_owner_operator_id,implementation_owner_operator_id,participant_capacity,proposed_price_cents,currency,planned_start_date,planned_end_date,is_test,created_by_operator_id)
 values(v_code,p_institution_id,trim(p_title),p_institution_profile,p_solution_profiles,nullif(trim(p_gls_opportunity_id),''),nullif(trim(p_gls_agreement_id),''),nullif(trim(p_gls_engagement_id),''),trim(p_contracting_entity_name),p_engagement_nature,nullif(trim(p_decision_maker_name),''),nullif(trim(p_decision_maker_role),''),nullif(lower(trim(p_decision_maker_email)),''),p_system_owner_operator_id,private.zgirl_pilot_actor(v_context),p_participant_capacity,p_proposed_price_cents,upper(coalesce(p_currency,'USD')),p_planned_start_date,p_planned_end_date,coalesce(p_is_test,false),private.zgirl_pilot_actor(v_context)) returning id into v_id;
 insert into public.zgirl_pilot_intakes(pilot_id,updated_by_operator_id) values(v_id,private.zgirl_pilot_actor(v_context));
 insert into public.zgirl_pilot_permissions(pilot_id,updated_by_operator_id) values(v_id,private.zgirl_pilot_actor(v_context));
 perform private.zgirl_seed_pilot_milestones(v_id);
 insert into public.zgirl_pilot_events(pilot_id,institution_id,actor_operator_id,event_type,summary,details) values(v_id,p_institution_id,private.zgirl_pilot_actor(v_context),'pilot_created','Institutional pilot workspace created',jsonb_build_object('pilotCode',v_code,'testMode',coalesce(p_is_test,false),'glsOpportunityId',p_gls_opportunity_id));
 return v_id;
end; $$;

create or replace function public.zgirl_pilot_save_intake(p_session_token text,p_pilot_id uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_context jsonb; v_readiness jsonb; v_status text; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.write');
 update public.zgirl_pilot_intakes set
  pilot_goals=nullif(trim(p_payload->>'pilotGoals'),''), intended_population=nullif(trim(p_payload->>'intendedPopulation'),''), participant_structure=nullif(trim(p_payload->>'participantStructure'),''), implementation_environment=nullif(trim(p_payload->>'implementationEnvironment'),''), facilitator_requirements=nullif(trim(p_payload->>'facilitatorRequirements'),''), accessibility_considerations=nullif(trim(p_payload->>'accessibilityConsiderations'),''), special_population_support=nullif(trim(p_payload->>'specialPopulationSupport'),''), faith_values_profile=nullif(trim(p_payload->>'faithValuesProfile'),''), athletics_profile=nullif(trim(p_payload->>'athleticsProfile'),''), risk_safety_considerations=nullif(trim(p_payload->>'riskSafetyConsiderations'),''), data_privacy_requirements=nullif(trim(p_payload->>'dataPrivacyRequirements'),''), desired_outcomes=nullif(trim(p_payload->>'desiredOutcomes'),''), timeline_notes=nullif(trim(p_payload->>'timelineNotes'),''), budget_pricing_notes=nullif(trim(p_payload->>'budgetPricingNotes'),''), decision_status=coalesce(nullif(p_payload->>'decisionStatus',''),'exploring'),
  decision_maker_accessible=coalesce((p_payload->>'decisionMakerAccessible')::boolean,false), defined_participant_group=coalesce((p_payload->>'definedParticipantGroup')::boolean,false), manageable_pilot_size=coalesce((p_payload->>'manageablePilotSize')::boolean,false), structured_feedback_commitment=coalesce((p_payload->>'structuredFeedbackCommitment')::boolean,false), credible_use_case=coalesce((p_payload->>'credibleUseCase')::boolean,false), realistic_implementation_access=coalesce((p_payload->>'realisticImplementationAccess')::boolean,false), reference_case_study_potential=coalesce((p_payload->>'referenceCaseStudyPotential')::boolean,false), renewal_expansion_potential=coalesce((p_payload->>'renewalExpansionPotential')::boolean,false), safety_route_confirmed=coalesce((p_payload->>'safetyRouteConfirmed')::boolean,false), privacy_requirements_confirmed=coalesce((p_payload->>'privacyRequirementsConfirmed')::boolean,false), accessibility_plan_confirmed=coalesce((p_payload->>'accessibilityPlanConfirmed')::boolean,false), facilitator_capacity_confirmed=coalesce((p_payload->>'facilitatorCapacityConfirmed')::boolean,false), readiness_blockers=coalesce(p_payload->'readinessBlockers','[]'::jsonb), readiness_notes=nullif(trim(p_payload->>'readinessNotes'),''),updated_by_operator_id=private.zgirl_pilot_actor(v_context),updated_at=now()
 where pilot_id=p_pilot_id;
 v_readiness:=private.zgirl_pilot_readiness(p_pilot_id); v_status:=case when coalesce((v_readiness->>'ready')::boolean,false) then 'ready' when jsonb_array_length(v_readiness->'missing')<=3 then 'conditional' else 'blocked' end;
 update public.zgirl_pilot_programs set readiness_status=v_status,qualification_status=case when v_status='ready' then 'qualified' else qualification_status end,updated_at=now() where id=p_pilot_id;
 return v_readiness||jsonb_build_object('readinessStatus',v_status);
end; $$;

create or replace function public.zgirl_pilot_save_team_assignment(p_session_token text,p_pilot_id uuid,p_assignment_id uuid,p_role_key text,p_display_name text,p_email text,p_operator_id uuid,p_platform_access_required boolean,p_access_status text,p_responsibilities text,p_status text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_context jsonb; v_id uuid; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.write');
 if p_role_key not in ('system_owner','institutional_admin','facilitator','reviewer','executive_sponsor','implementation_contact','safety_contact','accessibility_contact') or trim(coalesce(p_display_name,''))='' then raise exception 'invalid_pilot_team'; end if;
 if p_operator_id is not null and not exists(select 1 from public.zgirl_operator_identities where id=p_operator_id and status='active') then raise exception 'operator_not_found'; end if;
 if p_assignment_id is null then insert into public.zgirl_pilot_team_assignments(pilot_id,operator_id,role_key,display_name,email,platform_access_required,access_status,responsibilities,status) values(p_pilot_id,p_operator_id,p_role_key,trim(p_display_name),nullif(lower(trim(p_email)),''),coalesce(p_platform_access_required,false),p_access_status,nullif(trim(p_responsibilities),''),p_status) returning id into v_id;
 else update public.zgirl_pilot_team_assignments set operator_id=p_operator_id,role_key=p_role_key,display_name=trim(p_display_name),email=nullif(lower(trim(p_email)),''),platform_access_required=coalesce(p_platform_access_required,false),access_status=p_access_status,responsibilities=nullif(trim(p_responsibilities),''),status=p_status,updated_at=now() where id=p_assignment_id and pilot_id=p_pilot_id returning id into v_id; if v_id is null then raise exception 'pilot_team_not_found'; end if; end if;
 return v_id;
end; $$;

create or replace function public.zgirl_pilot_save_cohort(p_session_token text,p_pilot_id uuid,p_cohort_id uuid,p_name text,p_structure_type text,p_target_population text,p_solution_profiles text[],p_capacity integer,p_status text,p_start date,p_end date,p_accommodation_configuration text,p_notes text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_context jsonb; v_id uuid; v_code text; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.write');
 if trim(coalesce(p_name,''))='' or p_structure_type not in ('class','grade','team','group','program','department','congregation_group','cohort','other') or p_status not in ('planned','ready','active','complete','paused','cancelled') or p_capacity<1 then raise exception 'invalid_pilot_cohort'; end if;
 if p_solution_profiles is null or cardinality(p_solution_profiles)=0 or not(p_solution_profiles <@ array['general','edu','faith','athlete','accessibility_support']::text[]) then raise exception 'invalid_pilot_profiles'; end if;
 if p_cohort_id is null then v_code:='ZG-COHORT-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10)); insert into public.zgirl_pilot_cohorts(pilot_id,cohort_code,name,structure_type,target_population,solution_profiles,capacity,status,planned_start_date,planned_end_date,accommodation_configuration,notes) values(p_pilot_id,v_code,trim(p_name),p_structure_type,nullif(trim(p_target_population),''),p_solution_profiles,p_capacity,p_status,p_start,p_end,nullif(trim(p_accommodation_configuration),''),nullif(trim(p_notes),'')) returning id into v_id;
 else update public.zgirl_pilot_cohorts set name=trim(p_name),structure_type=p_structure_type,target_population=nullif(trim(p_target_population),''),solution_profiles=p_solution_profiles,capacity=p_capacity,status=p_status,planned_start_date=p_start,planned_end_date=p_end,accommodation_configuration=nullif(trim(p_accommodation_configuration),''),notes=nullif(trim(p_notes),''),updated_at=now() where id=p_cohort_id and pilot_id=p_pilot_id returning id into v_id; if v_id is null then raise exception 'pilot_cohort_not_found'; end if; end if;
 return v_id;
end; $$;

create or replace function public.zgirl_pilot_save_milestone(p_session_token text,p_pilot_id uuid,p_milestone_id uuid,p_status text,p_responsible_party text,p_due_date date,p_blocker text,p_evidence_reference text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$ declare v_context jsonb; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.write');
 if p_status not in ('not_started','in_progress','blocked','done','waived') then raise exception 'invalid_pilot_milestone'; end if;
 update public.zgirl_pilot_milestones set status=p_status,responsible_party=nullif(trim(p_responsible_party),''),due_date=p_due_date,blocker=nullif(trim(p_blocker),''),evidence_reference=nullif(trim(p_evidence_reference),''),completed_at=case when p_status in ('done','waived') then coalesce(completed_at,now()) else null end,updated_at=now() where id=p_milestone_id and pilot_id=p_pilot_id;
 if not found then raise exception 'pilot_milestone_not_found'; end if; return true;
end; $$;

create or replace function public.zgirl_pilot_record_metrics(p_session_token text,p_pilot_id uuid,p_cohort_id uuid,p_snapshot_date date,p_source_type text,p_source_reference text,p_metrics jsonb,p_notes text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$ declare v_context jsonb; v_id uuid; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.evidence');
 if p_source_type not in ('system_analytics','administrator_report','facilitator_report','manual_verified','import') then raise exception 'invalid_pilot_metric_source'; end if;
 if p_cohort_id is not null and not exists(select 1 from public.zgirl_pilot_cohorts where id=p_cohort_id and pilot_id=p_pilot_id) then raise exception 'pilot_cohort_not_found'; end if;
 insert into public.zgirl_pilot_metric_snapshots(pilot_id,cohort_id,snapshot_date,source_type,source_reference,participants_invited,participants_activated,active_participants,activities_started,activities_completed,reflection_sessions,support_requests,accessibility_issues,notes,recorded_by_operator_id)
 values(p_pilot_id,p_cohort_id,coalesce(p_snapshot_date,current_date),p_source_type,nullif(trim(p_source_reference),''),greatest(coalesce((p_metrics->>'participantsInvited')::int,0),0),greatest(coalesce((p_metrics->>'participantsActivated')::int,0),0),greatest(coalesce((p_metrics->>'activeParticipants')::int,0),0),greatest(coalesce((p_metrics->>'activitiesStarted')::int,0),0),greatest(coalesce((p_metrics->>'activitiesCompleted')::int,0),0),greatest(coalesce((p_metrics->>'reflectionSessions')::int,0),0),greatest(coalesce((p_metrics->>'supportRequests')::int,0),0),greatest(coalesce((p_metrics->>'accessibilityIssues')::int,0),0),nullif(trim(p_notes),''),private.zgirl_pilot_actor(v_context))
 on conflict(pilot_id,cohort_id,snapshot_date,source_type) do update set source_reference=excluded.source_reference,participants_invited=excluded.participants_invited,participants_activated=excluded.participants_activated,active_participants=excluded.active_participants,activities_started=excluded.activities_started,activities_completed=excluded.activities_completed,reflection_sessions=excluded.reflection_sessions,support_requests=excluded.support_requests,accessibility_issues=excluded.accessibility_issues,notes=excluded.notes,recorded_by_operator_id=excluded.recorded_by_operator_id returning id into v_id;
 return v_id;
end; $$;

create or replace function public.zgirl_pilot_add_evidence(p_session_token text,p_pilot_id uuid,p_cohort_id uuid,p_evidence_category text,p_provenance_type text,p_claim_type text,p_summary text,p_quantitative_data jsonb,p_source_reference text,p_evidence_date date,p_permission_status text,p_verified boolean)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$ declare v_context jsonb; v_id uuid; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.evidence');
 if p_evidence_category not in ('activation','engagement','completion','facilitator_observation','implementation_friction','support_request','accessibility_issue','configuration_change','qualitative_outcome','quantitative_outcome','administrator_feedback','participant_feedback','facilitator_feedback','renewal_signal','expansion_signal','other') or p_provenance_type not in ('system_analytics','administrator_report','facilitator_observation','participant_feedback_aggregate','document','support_log','implementation_record','other') or p_claim_type not in ('observed','participant_reported','facilitator_reported','administrator_reported','system_analytic','administrative_fact') then raise exception 'invalid_pilot_evidence'; end if;
 insert into public.zgirl_pilot_evidence(pilot_id,cohort_id,evidence_category,provenance_type,claim_type,summary,quantitative_data,source_reference,evidence_date,permission_status,verified,recorded_by_operator_id) values(p_pilot_id,p_cohort_id,p_evidence_category,p_provenance_type,p_claim_type,trim(p_summary),coalesce(p_quantitative_data,'{}'::jsonb),nullif(trim(p_source_reference),''),coalesce(p_evidence_date,current_date),p_permission_status,coalesce(p_verified,false),private.zgirl_pilot_actor(v_context)) returning id into v_id; return v_id;
end; $$;

create or replace function public.zgirl_pilot_save_permissions(p_session_token text,p_pilot_id uuid,p_testimonial_status text,p_case_study_status text,p_reference_status text,p_funder_status text,p_permission_reference text,p_notes text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$ declare v_context jsonb; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.evidence');
 update public.zgirl_pilot_permissions set testimonial_status=p_testimonial_status,case_study_status=p_case_study_status,reference_status=p_reference_status,funder_evidence_status=p_funder_status,permission_reference=nullif(trim(p_permission_reference),''),notes=nullif(trim(p_notes),''),updated_by_operator_id=private.zgirl_pilot_actor(v_context),updated_at=now() where pilot_id=p_pilot_id; return true;
end; $$;

create or replace function public.zgirl_pilot_add_competency_signal(p_session_token text,p_pilot_id uuid,p_evidence_id uuid,p_domain text,p_signal_type text,p_priority text,p_summary text,p_source_role text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$ declare v_context jsonb; v_id uuid; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.evidence');
 if p_domain not in ('safeguarding','escalation','platform_administration','reflection_facilitation','accessibility_adaptation','institutional_communication','evidence_reporting','fidelity','implementation_planning','other') or p_signal_type not in ('knowledge_need','common_mistake','training_need','workflow_gap','observed_strength','required_competency') then raise exception 'invalid_competency_signal'; end if;
 insert into public.zgirl_pilot_competency_signals(pilot_id,evidence_id,domain,signal_type,priority,summary,source_role,recorded_by_operator_id) values(p_pilot_id,p_evidence_id,p_domain,p_signal_type,p_priority,trim(p_summary),nullif(trim(p_source_role),''),private.zgirl_pilot_actor(v_context)) returning id into v_id; return v_id;
end; $$;

create or replace function public.zgirl_pilot_advance_stage(p_session_token text,p_pilot_id uuid,p_stage text,p_next_action text,p_next_action_due date,p_blocker_summary text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$ declare v_context jsonb; v_current text; v_inst uuid; v_ready jsonb; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.activate'); select stage,institution_id into v_current,v_inst from public.zgirl_pilot_programs where id=p_pilot_id;
 if p_stage not in ('opportunity','qualified','agreement_scope','institution_setup','onboarding','pilot_ready','live','evidence_collection','completed','renewal','expansion','on_hold','cancelled') then raise exception 'invalid_pilot_stage'; end if;
 if p_stage='pilot_ready' then v_ready:=private.zgirl_pilot_readiness(p_pilot_id); if not coalesce((v_ready->>'ready')::boolean,false) then raise exception 'pilot_readiness_incomplete'; end if; if not exists(select 1 from public.zgirl_pilot_cohorts where pilot_id=p_pilot_id and status in ('ready','active')) then raise exception 'pilot_cohort_required'; end if; end if;
 if p_stage='live' and not exists(select 1 from public.zgirl_pilot_team_assignments where pilot_id=p_pilot_id and role_key='facilitator' and status='active') then raise exception 'pilot_facilitator_required'; end if;
 update public.zgirl_pilot_programs set stage=p_stage,activation_date=case when p_stage='live' then coalesce(activation_date,current_date) else activation_date end,completion_date=case when p_stage='completed' then coalesce(completion_date,current_date) else completion_date end,completion_status=case when p_stage='completed' then 'complete' when p_stage in ('live','evidence_collection') then 'in_progress' else completion_status end,next_action=nullif(trim(p_next_action),''),next_action_due=p_next_action_due,blocker_summary=nullif(trim(p_blocker_summary),''),updated_at=now() where id=p_pilot_id;
 insert into public.zgirl_pilot_events(pilot_id,institution_id,actor_operator_id,event_type,summary,details) values(p_pilot_id,v_inst,private.zgirl_pilot_actor(v_context),'stage_changed','Pilot lifecycle stage changed',jsonb_build_object('from',v_current,'to',p_stage)); return true;
end; $$;

create or replace function public.zgirl_pilot_save_closeout(p_session_token text,p_pilot_id uuid,p_payload jsonb,p_finalize boolean default false)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$ declare v_context jsonb; v_inst uuid; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,case when coalesce(p_finalize,false) then 'pilot.closeout' else 'pilot.evidence' end); select institution_id into v_inst from public.zgirl_pilot_programs where id=p_pilot_id;
 insert into public.zgirl_pilot_closeouts(pilot_id,implementation_summary,executive_outcome_summary,what_worked,implementation_friction,lessons_for_facilitator_training,renewal_recommendation,expansion_recommendation,evidence_quality,case_study_readiness,finalized,finalized_by_operator_id,finalized_at,updated_at)
 values(p_pilot_id,nullif(trim(p_payload->>'implementationSummary'),''),nullif(trim(p_payload->>'executiveOutcomeSummary'),''),nullif(trim(p_payload->>'whatWorked'),''),nullif(trim(p_payload->>'implementationFriction'),''),nullif(trim(p_payload->>'lessonsForFacilitatorTraining'),''),nullif(trim(p_payload->>'renewalRecommendation'),''),nullif(trim(p_payload->>'expansionRecommendation'),''),coalesce(nullif(p_payload->>'evidenceQuality',''),'developing'),coalesce(nullif(p_payload->>'caseStudyReadiness',''),'not_ready'),coalesce(p_finalize,false),case when p_finalize then private.zgirl_pilot_actor(v_context) else null end,case when p_finalize then now() else null end,now())
 on conflict(pilot_id) do update set implementation_summary=excluded.implementation_summary,executive_outcome_summary=excluded.executive_outcome_summary,what_worked=excluded.what_worked,implementation_friction=excluded.implementation_friction,lessons_for_facilitator_training=excluded.lessons_for_facilitator_training,renewal_recommendation=excluded.renewal_recommendation,expansion_recommendation=excluded.expansion_recommendation,evidence_quality=excluded.evidence_quality,case_study_readiness=excluded.case_study_readiness,finalized=case when coalesce(p_finalize,false) then true else public.zgirl_pilot_closeouts.finalized end,finalized_by_operator_id=case when coalesce(p_finalize,false) then private.zgirl_pilot_actor(v_context) else public.zgirl_pilot_closeouts.finalized_by_operator_id end,finalized_at=case when coalesce(p_finalize,false) then now() else public.zgirl_pilot_closeouts.finalized_at end,updated_at=now();
 if p_finalize then insert into public.zgirl_pilot_events(pilot_id,institution_id,actor_operator_id,event_type,summary) values(p_pilot_id,v_inst,private.zgirl_pilot_actor(v_context),'closeout_finalized','Pilot implementation evidence closeout finalized'); end if; return true;
end; $$;

create or replace function public.zgirl_pilot_record_gls_sync(p_session_token text,p_pilot_id uuid,p_gls_stage text,p_gls_agreement_id text,p_gls_engagement_id text,p_commercial_status text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$ declare v_context jsonb; begin
 v_context:=private.zgirl_pilot_require(p_session_token,p_pilot_id,'pilot.write');
 update public.zgirl_pilot_programs set gls_stage_snapshot=nullif(trim(p_gls_stage),''),gls_agreement_id=coalesce(nullif(trim(p_gls_agreement_id),''),gls_agreement_id),gls_engagement_id=coalesce(nullif(trim(p_gls_engagement_id),''),gls_engagement_id),commercial_status=coalesce(nullif(trim(p_commercial_status),''),commercial_status),gls_last_synced_at=now(),updated_at=now() where id=p_pilot_id; return true;
end; $$;

create or replace function public.zgirl_pilot_dashboard(p_session_token text,p_pilot_id uuid default null,p_institution_id uuid default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_context jsonb; v_pilot public.zgirl_pilot_programs%rowtype; begin
 if p_pilot_id is not null then select * into v_pilot from public.zgirl_pilot_programs where id=p_pilot_id; if v_pilot.id is null then raise exception 'pilot_not_found'; end if; v_context:=private.zgirl_operator_require_capability(p_session_token,'pilot.read',v_pilot.institution_id);
 return jsonb_build_object('context',v_context,'pilot',to_jsonb(v_pilot),'institution',(select to_jsonb(i) from public.zgirl_institutions i where i.id=v_pilot.institution_id),'readiness',private.zgirl_pilot_readiness(v_pilot.id),'intake',(select to_jsonb(x) from public.zgirl_pilot_intakes x where x.pilot_id=v_pilot.id),'team',coalesce((select jsonb_agg(to_jsonb(x) order by x.role_key,x.display_name) from public.zgirl_pilot_team_assignments x where x.pilot_id=v_pilot.id),'[]'::jsonb),'cohorts',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.zgirl_pilot_cohorts x where x.pilot_id=v_pilot.id),'[]'::jsonb),'milestones',coalesce((select jsonb_agg(to_jsonb(x) order by x.sort_order) from public.zgirl_pilot_milestones x where x.pilot_id=v_pilot.id),'[]'::jsonb),'metrics',coalesce((select jsonb_agg(to_jsonb(x) order by x.snapshot_date desc,x.created_at desc) from public.zgirl_pilot_metric_snapshots x where x.pilot_id=v_pilot.id limit 100),'[]'::jsonb),'evidence',coalesce((select jsonb_agg(to_jsonb(x) order by x.evidence_date desc,x.created_at desc) from public.zgirl_pilot_evidence x where x.pilot_id=v_pilot.id limit 200),'[]'::jsonb),'permissions',(select to_jsonb(x) from public.zgirl_pilot_permissions x where x.pilot_id=v_pilot.id),'competencySignals',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.zgirl_pilot_competency_signals x where x.pilot_id=v_pilot.id),'[]'::jsonb),'closeout',(select to_jsonb(x) from public.zgirl_pilot_closeouts x where x.pilot_id=v_pilot.id),'events',coalesce((select jsonb_agg(to_jsonb(x) order by x.occurred_at desc) from (select * from public.zgirl_pilot_events where pilot_id=v_pilot.id order by occurred_at desc limit 100)x),'[]'::jsonb));
 end if;
 v_context:=private.zgirl_operator_require_capability(p_session_token,'pilot.read',p_institution_id);
 return jsonb_build_object('context',v_context,'activation',jsonb_build_object('namedSystemOwners',(select count(*) from public.zgirl_operator_identities o join public.zgirl_operator_role_assignments r on r.operator_id=o.id where o.status='active' and r.role_key='system_owner' and r.institution_id is null),'institutions',(select count(*) from public.zgirl_institutions),'realPilots',(select count(*) from public.zgirl_pilot_programs where not is_test),'testPilots',(select count(*) from public.zgirl_pilot_programs where is_test),'realActivationReady',(select exists(select 1 from public.zgirl_operator_identities o join public.zgirl_operator_role_assignments r on r.operator_id=o.id where o.status='active' and r.role_key='system_owner' and r.institution_id is null))),'pilots',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'pilotCode',p.pilot_code,'institutionId',p.institution_id,'institutionName',i.name,'title',p.title,'institutionProfile',p.institution_profile,'solutionProfiles',p.solution_profiles,'stage',p.stage,'qualificationStatus',p.qualification_status,'readinessStatus',p.readiness_status,'commercialStatus',p.commercial_status,'glsOpportunityId',p.gls_opportunity_id,'glsEngagementId',p.gls_engagement_id,'contractingEntityName',p.contracting_entity_name,'engagementNature',p.engagement_nature,'participantCapacity',p.participant_capacity,'plannedStartDate',p.planned_start_date,'plannedEndDate',p.planned_end_date,'activationDate',p.activation_date,'completionDate',p.completion_date,'renewalDate',p.renewal_date,'nextAction',p.next_action,'nextActionDue',p.next_action_due,'blockerSummary',p.blocker_summary,'completionStatus',p.completion_status,'renewalStatus',p.renewal_status,'expansionStatus',p.expansion_status,'isTest',p.is_test,'readiness',private.zgirl_pilot_readiness(p.id)) order by p.updated_at desc) from public.zgirl_pilot_programs p join public.zgirl_institutions i on i.id=p.institution_id where p_institution_id is null or p.institution_id=p_institution_id),'[]'::jsonb));
end; $$;

-- RPC execute grants only. Direct table access remains revoked.
grant execute on function public.zgirl_pilot_create(text,uuid,text,text,text[],text,text,text,text,text,text,text,text,uuid,integer,integer,text,date,date,boolean) to anon,authenticated;
grant execute on function public.zgirl_pilot_save_intake(text,uuid,jsonb) to anon,authenticated;
grant execute on function public.zgirl_pilot_save_team_assignment(text,uuid,uuid,text,text,text,uuid,boolean,text,text,text) to anon,authenticated;
grant execute on function public.zgirl_pilot_save_cohort(text,uuid,uuid,text,text,text,text[],integer,text,date,date,text,text) to anon,authenticated;
grant execute on function public.zgirl_pilot_save_milestone(text,uuid,uuid,text,text,date,text,text) to anon,authenticated;
grant execute on function public.zgirl_pilot_record_metrics(text,uuid,uuid,date,text,text,jsonb,text) to anon,authenticated;
grant execute on function public.zgirl_pilot_add_evidence(text,uuid,uuid,text,text,text,text,jsonb,text,date,text,boolean) to anon,authenticated;
grant execute on function public.zgirl_pilot_save_permissions(text,uuid,text,text,text,text,text,text) to anon,authenticated;
grant execute on function public.zgirl_pilot_add_competency_signal(text,uuid,uuid,text,text,text,text,text) to anon,authenticated;
grant execute on function public.zgirl_pilot_advance_stage(text,uuid,text,text,date,text) to anon,authenticated;
grant execute on function public.zgirl_pilot_save_closeout(text,uuid,jsonb,boolean) to anon,authenticated;
grant execute on function public.zgirl_pilot_record_gls_sync(text,uuid,text,text,text,text) to anon,authenticated;
grant execute on function public.zgirl_pilot_dashboard(text,uuid,uuid) to anon,authenticated;

insert into public.zgirl_credential_migrations(name) values('zgirl_operational_activation_pilot_engine_v3_11') on conflict(name) do nothing;
