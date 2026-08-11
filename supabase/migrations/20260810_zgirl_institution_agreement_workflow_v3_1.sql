-- Z-Girl v3.1 Institutional Agreement, Renewal & Expansion Workflow
-- Governs institutional agreements, renewal/expansion decisions, approval gates, and contract-to-delivery handoff.
-- No participant reflection, youth roster, diagnosis, counseling, safeguarding narrative, clergy, or sports-medicine data belongs here.

create table if not exists public.zgirl_institution_agreements (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.zgirl_institutions(id) on delete cascade,
  license_id uuid references public.zgirl_institution_licenses(id) on delete set null,
  agreement_code text not null unique,
  agreement_type text not null check (agreement_type in ('pilot','annual','renewal','expansion','change_order','train_the_trainer_addendum')),
  version integer not null default 1 check (version between 1 and 999),
  status text not null default 'draft' check (status in ('draft','internal_review','counterparty_review','approved','executed','superseded','expired','void')),
  reference text check (reference is null or char_length(reference) <= 180),
  effective_date date,
  expires_at date,
  executed_at timestamptz,
  scope_summary text check (scope_summary is null or char_length(scope_summary) <= 1200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or effective_date is null or expires_at > effective_date)
);
create index if not exists zgirl_institution_agreements_org_idx on public.zgirl_institution_agreements(institution_id,status,updated_at desc);
create index if not exists zgirl_institution_agreements_license_idx on public.zgirl_institution_agreements(license_id,status,updated_at desc) where license_id is not null;

create table if not exists public.zgirl_institution_workflows (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.zgirl_institutions(id) on delete cascade,
  license_id uuid not null references public.zgirl_institution_licenses(id) on delete cascade,
  agreement_id uuid references public.zgirl_institution_agreements(id) on delete set null,
  workflow_code text not null unique,
  workflow_type text not null check (workflow_type in ('renewal','expansion','change_order','train_the_trainer_addendum')),
  status text not null default 'draft' check (status in ('draft','evidence_build','approvals_pending','agreement_pending','release_review','ready_for_handoff','released','rejected','cancelled')),
  requested_effective_date date,
  requested_expires_at date,
  requested_seat_limit integer check (requested_seat_limit is null or requested_seat_limit between 1 and 10000),
  requested_site_limit integer check (requested_site_limit is null or requested_site_limit between 1 and 1000),
  requested_trainer_limit integer check (requested_trainer_limit is null or requested_trainer_limit between 0 and 1000),
  requested_profiles text[] check (requested_profiles is null or (requested_profiles <@ array['general','edu','faith','athlete']::text[] and cardinality(requested_profiles) > 0)),
  requested_credential_levels text[] check (requested_credential_levels is null or (requested_credential_levels <@ array['authorized_facilitator','authorized_lead_facilitator','institutional_trainer']::text[] and cardinality(requested_credential_levels) > 0)),
  target_start_date date,
  request_reference text check (request_reference is null or char_length(request_reference) <= 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requested_expires_at is null or requested_effective_date is null or requested_expires_at > requested_effective_date)
);
create index if not exists zgirl_institution_workflows_org_idx on public.zgirl_institution_workflows(institution_id,status,updated_at desc);
create index if not exists zgirl_institution_workflows_license_idx on public.zgirl_institution_workflows(license_id,status,updated_at desc);
create unique index if not exists zgirl_institution_workflows_open_type_unique on public.zgirl_institution_workflows(license_id,workflow_type) where status not in ('released','rejected','cancelled');

create table if not exists public.zgirl_institution_evidence_packets (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null unique references public.zgirl_institution_workflows(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  active_sites integer not null default 0,
  allocated_seats integer not null default 0,
  linked_credentials integer not null default 0,
  facilitator_seats integer not null default 0,
  trainer_seats integer not null default 0,
  license_status text not null,
  license_expires_at date not null,
  license_days_remaining integer not null,
  packet_status text not null default 'draft' check (packet_status in ('draft','complete','superseded')),
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table if not exists public.zgirl_institution_approval_gates (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.zgirl_institution_workflows(id) on delete cascade,
  gate_key text not null check (gate_key in ('program_quality','privacy_governance','agreement_authority','commercial_authority','executive_release')),
  required boolean not null default true,
  status text not null default 'pending' check (status in ('pending','approved','rejected','waived')),
  decided_by text check (decided_by is null or char_length(decided_by) <= 120),
  decision_reference text check (decision_reference is null or char_length(decision_reference) <= 180),
  decided_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(workflow_id,gate_key)
);
create index if not exists zgirl_institution_approval_gates_idx on public.zgirl_institution_approval_gates(workflow_id,status);

create table if not exists public.zgirl_institution_delivery_handoffs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null unique references public.zgirl_institution_workflows(id) on delete cascade,
  institution_id uuid not null references public.zgirl_institutions(id) on delete cascade,
  license_id uuid not null references public.zgirl_institution_licenses(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','ready','released','cancelled')),
  implementation_owner text check (implementation_owner is null or char_length(implementation_owner) <= 120),
  target_start_date date,
  release_reference text check (release_reference is null or char_length(release_reference) <= 180),
  created_at timestamptz not null default now(),
  released_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists zgirl_institution_handoffs_status_idx on public.zgirl_institution_delivery_handoffs(status,updated_at desc);

alter table public.zgirl_institution_agreements enable row level security;
alter table public.zgirl_institution_workflows enable row level security;
alter table public.zgirl_institution_evidence_packets enable row level security;
alter table public.zgirl_institution_approval_gates enable row level security;
alter table public.zgirl_institution_delivery_handoffs enable row level security;
revoke all on public.zgirl_institution_agreements, public.zgirl_institution_workflows, public.zgirl_institution_evidence_packets, public.zgirl_institution_approval_gates, public.zgirl_institution_delivery_handoffs from anon, authenticated;

create or replace function private.zgirl_seed_institution_workflow_gates(p_workflow_id uuid)
returns void language plpgsql security definer set search_path=pg_catalog,public,private as $$
begin
  insert into public.zgirl_institution_approval_gates(workflow_id,gate_key,required,status)
  values
    (p_workflow_id,'program_quality',true,'pending'),
    (p_workflow_id,'privacy_governance',true,'pending'),
    (p_workflow_id,'agreement_authority',true,'pending'),
    (p_workflow_id,'commercial_authority',true,'pending'),
    (p_workflow_id,'executive_release',true,'pending')
  on conflict (workflow_id,gate_key) do nothing;
end; $$;

create or replace function private.zgirl_refresh_institution_evidence(p_workflow_id uuid)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare
  v_w public.zgirl_institution_workflows%rowtype;
  v_l public.zgirl_institution_licenses%rowtype;
  v_packet_id uuid;
  v_active_sites integer;
  v_allocated integer;
  v_linked integer;
  v_facilitators integer;
  v_trainers integer;
begin
  select * into v_w from public.zgirl_institution_workflows where id=p_workflow_id;
  if v_w.id is null then raise exception 'workflow_not_found'; end if;
  select * into v_l from public.zgirl_institution_licenses where id=v_w.license_id;
  if v_l.id is null then raise exception 'license_not_found'; end if;
  select count(*) into v_active_sites from public.zgirl_institution_sites where institution_id=v_w.institution_id and status='active';
  select count(*) into v_allocated from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released';
  select count(*) into v_linked from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released' and credential_id is not null;
  select count(*) into v_facilitators from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released' and seat_role in ('facilitator','lead_facilitator');
  select count(*) into v_trainers from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released' and seat_role='institutional_trainer';
  insert into public.zgirl_institution_evidence_packets(workflow_id,period_start,period_end,active_sites,allocated_seats,linked_credentials,facilitator_seats,trainer_seats,license_status,license_expires_at,license_days_remaining,packet_status,generated_at,updated_at)
  values(p_workflow_id,v_l.effective_date,current_date,v_active_sites,v_allocated,v_linked,v_facilitators,v_trainers,v_l.status,v_l.expires_at,(v_l.expires_at-current_date),'complete',now(),now())
  on conflict (workflow_id) do update set period_start=excluded.period_start,period_end=excluded.period_end,active_sites=excluded.active_sites,allocated_seats=excluded.allocated_seats,linked_credentials=excluded.linked_credentials,facilitator_seats=excluded.facilitator_seats,trainer_seats=excluded.trainer_seats,license_status=excluded.license_status,license_expires_at=excluded.license_expires_at,license_days_remaining=excluded.license_days_remaining,packet_status='complete',generated_at=now(),updated_at=now()
  returning id into v_packet_id;
  update public.zgirl_institution_workflows set status=case when status in ('draft','evidence_build') then 'approvals_pending' else status end,updated_at=now() where id=p_workflow_id and status not in ('released','rejected','cancelled');
  return v_packet_id;
end; $$;

create or replace function public.zgirl_institution_save_agreement(p_session_token text,p_agreement_id uuid,p_institution_id uuid,p_license_id uuid,p_agreement_type text,p_version integer,p_status text,p_reference text,p_effective_date date,p_expires_at date,p_scope_summary text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_id uuid; v_code text; v_existing_executed timestamptz;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  if not exists(select 1 from public.zgirl_institutions where id=p_institution_id) then raise exception 'institution_not_found'; end if;
  if p_license_id is not null and not exists(select 1 from public.zgirl_institution_licenses where id=p_license_id and institution_id=p_institution_id) then raise exception 'invalid_agreement_license'; end if;
  if p_agreement_type not in ('pilot','annual','renewal','expansion','change_order','train_the_trainer_addendum') then raise exception 'invalid_agreement_type'; end if;
  if p_version is null or p_version<1 or p_version>999 then raise exception 'invalid_agreement_version'; end if;
  if p_status not in ('draft','internal_review','counterparty_review','approved','executed','superseded','expired','void') then raise exception 'invalid_agreement_status'; end if;
  if p_effective_date is not null and p_expires_at is not null and p_expires_at<=p_effective_date then raise exception 'invalid_agreement_term'; end if;
  if p_status='executed' and (nullif(trim(coalesce(p_reference,'')),'') is null or p_effective_date is null) then raise exception 'executed_agreement_requires_reference'; end if;
  if char_length(coalesce(p_scope_summary,''))>1200 then raise exception 'invalid_scope_summary'; end if;
  if p_agreement_id is null then
    v_code:='ZG-AGR-'||extract(year from current_date)::int||'-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10));
    insert into public.zgirl_institution_agreements(institution_id,license_id,agreement_code,agreement_type,version,status,reference,effective_date,expires_at,executed_at,scope_summary)
    values(p_institution_id,p_license_id,v_code,p_agreement_type,p_version,p_status,nullif(trim(p_reference),''),p_effective_date,p_expires_at,case when p_status='executed' then now() end,nullif(trim(p_scope_summary),'')) returning id into v_id;
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(p_institution_id,p_license_id,'agreement_created','Agreement created: '||v_code);
  else
    select executed_at into v_existing_executed from public.zgirl_institution_agreements where id=p_agreement_id and institution_id=p_institution_id;
    update public.zgirl_institution_agreements set license_id=p_license_id,agreement_type=p_agreement_type,version=p_version,status=p_status,reference=nullif(trim(p_reference),''),effective_date=p_effective_date,expires_at=p_expires_at,executed_at=case when p_status='executed' then coalesce(v_existing_executed,now()) else executed_at end,scope_summary=nullif(trim(p_scope_summary),''),updated_at=now() where id=p_agreement_id and institution_id=p_institution_id returning id into v_id;
    if v_id is null then raise exception 'agreement_not_found'; end if;
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(p_institution_id,p_license_id,'agreement_updated','Agreement updated');
  end if;
  return v_id;
end; $$;

create or replace function public.zgirl_institution_create_workflow(p_session_token text,p_workflow_id uuid,p_license_id uuid,p_workflow_type text,p_agreement_id uuid,p_requested_effective_date date,p_requested_expires_at date,p_requested_seat_limit integer,p_requested_site_limit integer,p_requested_trainer_limit integer,p_requested_profiles text[],p_requested_levels text[],p_target_start_date date,p_request_reference text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_l public.zgirl_institution_licenses%rowtype; v_id uuid; v_code text; v_seat integer; v_site integer; v_trainer integer; v_profiles text[]; v_levels text[]; v_eff date; v_exp date; v_seats_used integer; v_sites_used integer; v_trainers_used integer;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_l from public.zgirl_institution_licenses where id=p_license_id;
  if v_l.id is null then raise exception 'license_not_found'; end if;
  if v_l.status='closed' then raise exception 'license_not_releasable'; end if;
  if p_workflow_type not in ('renewal','expansion','change_order','train_the_trainer_addendum') then raise exception 'invalid_workflow_type'; end if;
  if p_agreement_id is not null and not exists(select 1 from public.zgirl_institution_agreements where id=p_agreement_id and institution_id=v_l.institution_id and (license_id is null or license_id=p_license_id)) then raise exception 'invalid_workflow_agreement'; end if;
  v_seat:=coalesce(p_requested_seat_limit,v_l.seat_limit); v_site:=coalesce(p_requested_site_limit,v_l.site_limit); v_trainer:=coalesce(p_requested_trainer_limit,v_l.trainer_limit);
  v_profiles:=coalesce(p_requested_profiles,v_l.allowed_profiles); v_levels:=coalesce(p_requested_levels,v_l.allowed_credential_levels);
  v_eff:=coalesce(p_requested_effective_date,case when p_workflow_type='renewal' then v_l.expires_at+1 else v_l.effective_date end);
  v_exp:=coalesce(p_requested_expires_at,case when p_workflow_type='renewal' then (v_l.expires_at + interval '1 year')::date else v_l.expires_at end);
  if v_seat<1 or v_site<1 or v_trainer<0 then raise exception 'invalid_workflow_limits'; end if;
  if v_profiles is null or cardinality(v_profiles)=0 or not(v_profiles <@ array['general','edu','faith','athlete']::text[]) then raise exception 'invalid_profiles'; end if;
  if v_levels is null or cardinality(v_levels)=0 or not(v_levels <@ array['authorized_facilitator','authorized_lead_facilitator','institutional_trainer']::text[]) then raise exception 'invalid_levels'; end if;
  if v_eff is not null and v_exp is not null and v_exp<=v_eff then raise exception 'invalid_workflow_term'; end if;
  select count(*) into v_seats_used from public.zgirl_institution_seat_allocations where license_id=p_license_id and status<>'released';
  select count(distinct site_id) into v_sites_used from public.zgirl_institution_seat_allocations where license_id=p_license_id and status<>'released' and site_id is not null;
  select count(*) into v_trainers_used from public.zgirl_institution_seat_allocations where license_id=p_license_id and status<>'released' and seat_role='institutional_trainer';
  if v_seat<v_seats_used then raise exception 'seat_limit_below_usage'; end if;
  if v_site<v_sites_used then raise exception 'site_limit_below_usage'; end if;
  if v_trainer<v_trainers_used then raise exception 'trainer_limit_below_usage'; end if;
  if p_workflow_id is null then
    v_code:='ZG-WF-'||extract(year from current_date)::int||'-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10));
    insert into public.zgirl_institution_workflows(institution_id,license_id,agreement_id,workflow_code,workflow_type,status,requested_effective_date,requested_expires_at,requested_seat_limit,requested_site_limit,requested_trainer_limit,requested_profiles,requested_credential_levels,target_start_date,request_reference)
    values(v_l.institution_id,p_license_id,p_agreement_id,v_code,p_workflow_type,'evidence_build',v_eff,v_exp,v_seat,v_site,v_trainer,v_profiles,v_levels,p_target_start_date,nullif(trim(p_request_reference),'')) returning id into v_id;
    perform private.zgirl_seed_institution_workflow_gates(v_id); perform private.zgirl_refresh_institution_evidence(v_id);
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_l.institution_id,p_license_id,'workflow_created','Institution workflow created: '||v_code||' ('||p_workflow_type||')');
  else
    update public.zgirl_institution_workflows set agreement_id=p_agreement_id,workflow_type=p_workflow_type,requested_effective_date=v_eff,requested_expires_at=v_exp,requested_seat_limit=v_seat,requested_site_limit=v_site,requested_trainer_limit=v_trainer,requested_profiles=v_profiles,requested_credential_levels=v_levels,target_start_date=p_target_start_date,request_reference=nullif(trim(p_request_reference),''),updated_at=now() where id=p_workflow_id and license_id=p_license_id and status in ('draft','evidence_build','approvals_pending','agreement_pending','release_review') returning id into v_id;
    if v_id is null then raise exception 'workflow_locked'; end if;
    perform private.zgirl_seed_institution_workflow_gates(v_id); perform private.zgirl_refresh_institution_evidence(v_id);
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_l.institution_id,p_license_id,'workflow_updated','Institution workflow updated');
  end if;
  return v_id;
end; $$;

create or replace function public.zgirl_institution_link_workflow_agreement(p_session_token text,p_workflow_id uuid,p_agreement_id uuid)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_w public.zgirl_institution_workflows%rowtype; v_a public.zgirl_institution_agreements%rowtype; v_pending integer;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_w from public.zgirl_institution_workflows where id=p_workflow_id; if v_w.id is null then raise exception 'workflow_not_found'; end if;
  if v_w.status in ('released','rejected','cancelled') then raise exception 'workflow_locked'; end if;
  select * into v_a from public.zgirl_institution_agreements where id=p_agreement_id;
  if v_a.id is null or v_a.institution_id<>v_w.institution_id or (v_a.license_id is not null and v_a.license_id<>v_w.license_id) then raise exception 'invalid_workflow_agreement'; end if;
  update public.zgirl_institution_workflows set agreement_id=p_agreement_id,updated_at=now() where id=p_workflow_id;
  select count(*) into v_pending from public.zgirl_institution_approval_gates where workflow_id=p_workflow_id and required and status not in ('approved','waived');
  update public.zgirl_institution_workflows set status=case when v_pending=0 and v_a.status='executed' then 'release_review' when v_pending=0 then 'agreement_pending' else 'approvals_pending' end,updated_at=now() where id=p_workflow_id;
  insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_w.institution_id,v_w.license_id,'workflow_agreement_linked','Agreement linked to institutional workflow');
  return true;
end; $$;

create or replace function public.zgirl_institution_build_evidence_packet(p_session_token text,p_workflow_id uuid)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$ begin perform private.zgirl_credential_require_session(p_session_token); return private.zgirl_refresh_institution_evidence(p_workflow_id); end; $$;

create or replace function public.zgirl_institution_set_approval_gate(p_session_token text,p_workflow_id uuid,p_gate_key text,p_status text,p_decided_by text,p_decision_reference text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_w public.zgirl_institution_workflows%rowtype; v_pending integer; v_a_status text;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_w from public.zgirl_institution_workflows where id=p_workflow_id; if v_w.id is null then raise exception 'workflow_not_found'; end if;
  if v_w.status in ('released','cancelled') then raise exception 'workflow_locked'; end if;
  if p_gate_key not in ('program_quality','privacy_governance','agreement_authority','commercial_authority','executive_release') then raise exception 'invalid_approval_gate'; end if;
  if p_status not in ('pending','approved','rejected','waived') then raise exception 'invalid_approval_status'; end if;
  if p_status in ('approved','rejected','waived') and nullif(trim(coalesce(p_decided_by,'')),'') is null then raise exception 'approval_actor_required'; end if;
  update public.zgirl_institution_approval_gates set status=p_status,decided_by=nullif(trim(p_decided_by),''),decision_reference=nullif(trim(p_decision_reference),''),decided_at=case when p_status='pending' then null else now() end,updated_at=now() where workflow_id=p_workflow_id and gate_key=p_gate_key;
  if not found then raise exception 'approval_gate_not_found'; end if;
  if p_status='rejected' then update public.zgirl_institution_workflows set status='rejected',updated_at=now() where id=p_workflow_id;
  else
    select count(*) into v_pending from public.zgirl_institution_approval_gates where workflow_id=p_workflow_id and required and status not in ('approved','waived');
    select status into v_a_status from public.zgirl_institution_agreements where id=v_w.agreement_id;
    update public.zgirl_institution_workflows set status=case when v_pending=0 and v_a_status='executed' then 'release_review' when v_pending=0 then 'agreement_pending' else 'approvals_pending' end,updated_at=now() where id=p_workflow_id and status<>'rejected';
  end if;
  insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_w.institution_id,v_w.license_id,'workflow_gate_decision','Approval gate updated: '||p_gate_key||' → '||p_status);
  return true;
end; $$;

create or replace function public.zgirl_institution_finalize_workflow(p_session_token text,p_workflow_id uuid,p_implementation_owner text,p_handoff_reference text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_w public.zgirl_institution_workflows%rowtype; v_l public.zgirl_institution_licenses%rowtype; v_a public.zgirl_institution_agreements%rowtype; v_packet public.zgirl_institution_evidence_packets%rowtype; v_pending integer; v_seats integer; v_sites integer; v_trainers integer; v_handoff uuid;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_w from public.zgirl_institution_workflows where id=p_workflow_id; if v_w.id is null then raise exception 'workflow_not_found'; end if;
  if v_w.status<>'release_review' then raise exception 'workflow_not_ready'; end if;
  select * into v_l from public.zgirl_institution_licenses where id=v_w.license_id for update; if v_l.id is null then raise exception 'license_not_found'; end if;
  if v_l.status in ('suspended','closed') then raise exception 'license_not_releasable'; end if;
  select * into v_a from public.zgirl_institution_agreements where id=v_w.agreement_id;
  if v_a.id is null or v_a.status<>'executed' or nullif(trim(coalesce(v_a.reference,'')),'') is null then raise exception 'executed_agreement_required'; end if;
  select * into v_packet from public.zgirl_institution_evidence_packets where workflow_id=p_workflow_id; if v_packet.id is null or v_packet.packet_status<>'complete' then raise exception 'evidence_packet_required'; end if;
  select count(*) into v_pending from public.zgirl_institution_approval_gates where workflow_id=p_workflow_id and required and status not in ('approved','waived'); if v_pending>0 then raise exception 'approval_gates_incomplete'; end if;
  if nullif(trim(coalesce(p_implementation_owner,'')),'') is null then raise exception 'implementation_owner_required'; end if;
  select count(*) into v_seats from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released';
  select count(distinct site_id) into v_sites from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released' and site_id is not null;
  select count(*) into v_trainers from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released' and seat_role='institutional_trainer';
  if coalesce(v_w.requested_seat_limit,v_l.seat_limit)<v_seats then raise exception 'seat_limit_below_usage'; end if;
  if coalesce(v_w.requested_site_limit,v_l.site_limit)<v_sites then raise exception 'site_limit_below_usage'; end if;
  if coalesce(v_w.requested_trainer_limit,v_l.trainer_limit)<v_trainers then raise exception 'trainer_limit_below_usage'; end if;
  update public.zgirl_institution_licenses set effective_date=coalesce(v_w.requested_effective_date,effective_date),expires_at=coalesce(v_w.requested_expires_at,expires_at),seat_limit=coalesce(v_w.requested_seat_limit,seat_limit),site_limit=coalesce(v_w.requested_site_limit,site_limit),trainer_limit=coalesce(v_w.requested_trainer_limit,trainer_limit),allowed_profiles=coalesce(v_w.requested_profiles,allowed_profiles),allowed_credential_levels=coalesce(v_w.requested_credential_levels,allowed_credential_levels),agreement_status='executed',agreement_reference=v_a.reference,status=case when coalesce(v_w.requested_effective_date,effective_date)<=current_date and coalesce(v_w.requested_expires_at,expires_at)>=current_date then 'active' else 'pending' end,renewal_status=case when coalesce(v_w.requested_expires_at,expires_at)<=current_date+90 then 'due' else 'not_due' end,updated_at=now() where id=v_w.license_id;
  update public.zgirl_institution_seat_allocations set status='active',updated_at=now() where license_id=v_w.license_id and status='blocked' and coalesce(v_w.requested_effective_date,v_l.effective_date)<=current_date and coalesce(v_w.requested_expires_at,v_l.expires_at)>=current_date;
  update public.zgirl_institution_workflows set status='ready_for_handoff',updated_at=now() where id=p_workflow_id;
  insert into public.zgirl_institution_delivery_handoffs(workflow_id,institution_id,license_id,status,implementation_owner,target_start_date,release_reference)
  values(p_workflow_id,v_w.institution_id,v_w.license_id,'ready',trim(p_implementation_owner),coalesce(v_w.target_start_date,v_w.requested_effective_date),nullif(trim(p_handoff_reference),''))
  on conflict (workflow_id) do update set status='ready',implementation_owner=excluded.implementation_owner,target_start_date=excluded.target_start_date,release_reference=excluded.release_reference,updated_at=now() returning id into v_handoff;
  insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_w.institution_id,v_w.license_id,'workflow_ready_for_handoff','Approved institutional workflow is ready for contract-to-delivery handoff');
  return v_handoff;
end; $$;

create or replace function public.zgirl_institution_release_handoff(p_session_token text,p_handoff_id uuid,p_release_reference text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_h public.zgirl_institution_delivery_handoffs%rowtype;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_h from public.zgirl_institution_delivery_handoffs where id=p_handoff_id for update; if v_h.id is null then raise exception 'handoff_not_found'; end if;
  if v_h.status<>'ready' then raise exception 'handoff_not_ready'; end if;
  if char_length(trim(coalesce(p_release_reference,'')))<3 then raise exception 'handoff_reference_required'; end if;
  update public.zgirl_institution_delivery_handoffs set status='released',release_reference=trim(p_release_reference),released_at=now(),updated_at=now() where id=p_handoff_id;
  update public.zgirl_institution_workflows set status='released',updated_at=now() where id=v_h.workflow_id;
  insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_h.institution_id,v_h.license_id,'delivery_handoff_released','Contract-to-delivery handoff released');
  return true;
end; $$;

create or replace function private.zgirl_process_institution_workflow_automation()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare r record; v_workflow uuid; v_created integer:=0; v_expired integer:=0;
begin
  update public.zgirl_institution_agreements set status='expired',updated_at=now() where status in ('approved','executed') and expires_at is not null and expires_at<current_date; get diagnostics v_expired = row_count;
  for r in select l.* from public.zgirl_institution_licenses l where l.status in ('active','conditional','lapsed') and l.expires_at<=current_date+90 and l.expires_at>=current_date-30 and not exists(select 1 from public.zgirl_institution_workflows w where w.license_id=l.id and w.workflow_type='renewal' and w.status not in ('released','rejected','cancelled')) loop
    insert into public.zgirl_institution_workflows(institution_id,license_id,workflow_code,workflow_type,status,requested_effective_date,requested_expires_at,requested_seat_limit,requested_site_limit,requested_trainer_limit,requested_profiles,requested_credential_levels,target_start_date,request_reference)
    values(r.institution_id,r.id,'ZG-WF-'||extract(year from current_date)::int||'-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10)),'renewal','evidence_build',r.expires_at+1,(r.expires_at+interval '1 year')::date,r.seat_limit,r.site_limit,r.trainer_limit,r.allowed_profiles,r.allowed_credential_levels,r.expires_at+1,'AUTO-90-DAY-RENEWAL') returning id into v_workflow;
    perform private.zgirl_seed_institution_workflow_gates(v_workflow); perform private.zgirl_refresh_institution_evidence(v_workflow);
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(r.institution_id,r.id,'renewal_workflow_auto_created','90-day renewal workflow and evidence packet created automatically'); v_created:=v_created+1;
  end loop;
  return jsonb_build_object('renewalWorkflowsCreated',v_created,'agreementsExpired',v_expired,'processedAt',now());
end; $$;

create or replace function public.zgirl_institution_workflow_run_automation(p_session_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$ begin perform private.zgirl_credential_require_session(p_session_token); return private.zgirl_process_institution_workflow_automation(); end; $$;

create or replace function public.zgirl_institution_workflow_dashboard(p_session_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
begin
  perform private.zgirl_credential_require_session(p_session_token); perform private.zgirl_process_institution_workflow_automation();
  return jsonb_build_object(
    'summary',jsonb_build_object('openWorkflows',(select count(*) from public.zgirl_institution_workflows where status not in ('released','rejected','cancelled')),'renewalsOpen',(select count(*) from public.zgirl_institution_workflows where workflow_type='renewal' and status not in ('released','rejected','cancelled')),'expansionsOpen',(select count(*) from public.zgirl_institution_workflows where workflow_type='expansion' and status not in ('released','rejected','cancelled')),'approvalQueue',(select count(*) from public.zgirl_institution_workflows where status='approvals_pending'),'agreementQueue',(select count(*) from public.zgirl_institution_workflows where status='agreement_pending'),'releaseReview',(select count(*) from public.zgirl_institution_workflows where status='release_review'),'handoffsReady',(select count(*) from public.zgirl_institution_delivery_handoffs where status='ready'),'executedAgreements',(select count(*) from public.zgirl_institution_agreements where status='executed')),
    'institutions',coalesce((select jsonb_agg(to_jsonb(x) order by x.name) from (select id,institution_code,name,institution_type,status from public.zgirl_institutions where status<>'closed' order by name limit 200)x),'[]'::jsonb),
    'licenses',coalesce((select jsonb_agg(to_jsonb(x) order by x.expires_at) from (select l.id,l.institution_id,i.name institution_name,l.license_code,l.license_type,l.status,l.renewal_status,l.effective_date,l.expires_at,l.seat_limit,l.site_limit,l.trainer_limit,l.allowed_profiles,l.allowed_credential_levels,l.agreement_status,l.agreement_reference from public.zgirl_institution_licenses l join public.zgirl_institutions i on i.id=l.institution_id where l.status<>'closed' order by l.expires_at limit 200)x),'[]'::jsonb),
    'agreements',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc) from (select a.id,a.institution_id,a.license_id,a.agreement_code,a.agreement_type,a.version,a.status,a.reference,a.effective_date,a.expires_at,a.executed_at,a.scope_summary,a.created_at,a.updated_at,i.name institution_name,l.license_code from public.zgirl_institution_agreements a join public.zgirl_institutions i on i.id=a.institution_id left join public.zgirl_institution_licenses l on l.id=a.license_id order by a.updated_at desc limit 250)x),'[]'::jsonb),
    'workflows',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc) from (select w.id,w.institution_id,w.license_id,w.agreement_id,w.workflow_code,w.workflow_type,w.status,w.requested_effective_date,w.requested_expires_at,w.requested_seat_limit,w.requested_site_limit,w.requested_trainer_limit,w.requested_profiles,w.requested_credential_levels,w.target_start_date,w.request_reference,w.created_at,w.updated_at,i.name institution_name,l.license_code,a.agreement_code,a.status agreement_status from public.zgirl_institution_workflows w join public.zgirl_institutions i on i.id=w.institution_id join public.zgirl_institution_licenses l on l.id=w.license_id left join public.zgirl_institution_agreements a on a.id=w.agreement_id order by w.updated_at desc limit 250)x),'[]'::jsonb),
    'evidencePackets',coalesce((select jsonb_agg(to_jsonb(x) order by x.generated_at desc) from (select * from public.zgirl_institution_evidence_packets order by generated_at desc limit 250)x),'[]'::jsonb),
    'approvalGates',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc) from (select * from public.zgirl_institution_approval_gates order by updated_at desc limit 1000)x),'[]'::jsonb),
    'handoffs',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc) from (select h.id,h.workflow_id,h.institution_id,h.license_id,h.status,h.implementation_owner,h.target_start_date,h.release_reference,h.created_at,h.released_at,h.updated_at,i.name institution_name,l.license_code,w.workflow_code from public.zgirl_institution_delivery_handoffs h join public.zgirl_institutions i on i.id=h.institution_id join public.zgirl_institution_licenses l on l.id=h.license_id join public.zgirl_institution_workflows w on w.id=h.workflow_id order by h.updated_at desc limit 250)x),'[]'::jsonb),
    'events',coalesce((select jsonb_agg(to_jsonb(x) order by x.occurred_at desc) from (select id,institution_id,license_id,event_type,summary,occurred_at from public.zgirl_institution_license_events where event_type like 'workflow_%' or event_type like 'agreement_%' or event_type like 'delivery_%' or event_type='renewal_workflow_auto_created' order by occurred_at desc limit 150)x),'[]'::jsonb)
  );
end; $$;

do $$
begin
  if exists(select 1 from pg_extension where extname='pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname='zgirl-institution-workflow-daily';
    perform cron.schedule('zgirl-institution-workflow-daily','37 10 * * *','select private.zgirl_process_institution_workflow_automation();');
  end if;
end $$;
