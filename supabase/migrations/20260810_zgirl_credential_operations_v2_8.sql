-- Z-Girl v2.8 Credential Operations Portal
-- Applied to Greene managed-cloud staging as migration: zgirl_credential_operations_v2_8
-- The access hash below corresponds to the one-time deployment bootstrap code.
-- Rotate the code immediately after first operator login. The plaintext code is never stored here.

create schema if not exists private;

create table if not exists private.zgirl_credential_access (
  singleton boolean primary key default true check (singleton),
  access_hash bytea not null,
  updated_at timestamptz not null default now()
);

create table if not exists private.zgirl_credential_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash bytea not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  rotated_from uuid references private.zgirl_credential_sessions(id)
);

insert into private.zgirl_credential_access (singleton, access_hash)
values (true, decode('1f62cff7c43c3c5721d0b0d506bbe31d88194d907d9604bb960fb36bc78d8241','hex'))
on conflict (singleton) do nothing;

create table if not exists public.zgirl_credential_candidates (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (position('@' in email) > 1 and char_length(email) <= 254),
  organization text check (organization is null or char_length(organization) <= 180),
  pathway text not null default 'general' check (pathway in ('general','edu','faith','athlete','institutional')),
  status text not null default 'candidate' check (status in ('candidate','eligible','training','assessment','practicum','decision','authorized','declined','withdrawn')),
  training_version text not null default '2.7',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists zgirl_credential_candidates_email_lower_idx on public.zgirl_credential_candidates (lower(email));

create table if not exists public.zgirl_credential_requirements (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.zgirl_credential_candidates(id) on delete cascade,
  requirement_key text not null check (requirement_key in ('orientation','curriculum','knowledge_assessment','critical_items','practicum','conduct_ack','local_safeguarding','lead_evidence','trainer_teachback','trainer_calibration','institutional_trainer_license')),
  status text not null default 'pending' check (status in ('pending','in_progress','pass','fail','not_required')),
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(candidate_id, requirement_key)
);

create table if not exists public.zgirl_credentials (
  id uuid primary key default gen_random_uuid(),
  credential_id text not null unique,
  candidate_id uuid not null references public.zgirl_credential_candidates(id),
  holder_name text not null,
  organization text,
  credential_level text not null check (credential_level in ('authorized_facilitator','authorized_lead_facilitator','institutional_trainer')),
  scope text not null default 'Z-Girl facilitated reflection within approved institutional scope' check (char_length(scope) between 10 and 500),
  training_version text not null,
  status text not null default 'active' check (status in ('active','conditional','suspended','revoked','lapsed')),
  status_reason_category text check (status_reason_category is null or status_reason_category in ('quality','conduct','privacy','safety','scope','administrative','renewal','other')),
  issue_date date not null default current_date,
  expires_at date not null,
  public_verification_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at >= issue_date)
);
create index if not exists zgirl_credentials_candidate_idx on public.zgirl_credentials(candidate_id);
create index if not exists zgirl_credentials_status_idx on public.zgirl_credentials(status, expires_at);

create table if not exists public.zgirl_credential_renewals (
  id uuid primary key default gen_random_uuid(),
  credential_id uuid not null references public.zgirl_credentials(id) on delete cascade,
  renewal_due_at date not null,
  status text not null default 'scheduled' check (status in ('scheduled','in_progress','approved','declined','lapsed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zgirl_credential_audit_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('candidate_created','candidate_updated','requirement_updated','credential_issued','credential_status_changed','credential_renewed','access_rotated','session_revoked')),
  entity_type text not null check (entity_type in ('candidate','credential','access','session')),
  entity_id text not null,
  summary text not null check (char_length(summary) <= 240),
  occurred_at timestamptz not null default now()
);

alter table public.zgirl_credential_candidates enable row level security;
alter table public.zgirl_credential_requirements enable row level security;
alter table public.zgirl_credentials enable row level security;
alter table public.zgirl_credential_renewals enable row level security;
alter table public.zgirl_credential_audit_events enable row level security;

revoke all on public.zgirl_credential_candidates from anon, authenticated;
revoke all on public.zgirl_credential_requirements from anon, authenticated;
revoke all on public.zgirl_credentials from anon, authenticated;
revoke all on public.zgirl_credential_renewals from anon, authenticated;
revoke all on public.zgirl_credential_audit_events from anon, authenticated;

create or replace function private.zgirl_credential_require_session(p_token text)
returns uuid language plpgsql security definer
set search_path = pg_catalog, private, extensions
as $$
declare v_session_id uuid;
begin
  if p_token is null or char_length(p_token) < 40 then raise exception 'unauthorized'; end if;
  select id into v_session_id from private.zgirl_credential_sessions
   where token_hash = extensions.digest(convert_to(p_token,'UTF8'),'sha256')
     and revoked_at is null and expires_at > now() limit 1;
  if v_session_id is null then raise exception 'unauthorized'; end if;
  return v_session_id;
end; $$;
revoke all on function private.zgirl_credential_require_session(text) from public, anon, authenticated;

create or replace function public.zgirl_credential_login(p_access_code text)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, private, extensions
as $$
declare v_expected bytea; v_token text; v_id uuid; v_expires timestamptz;
begin
  select access_hash into v_expected from private.zgirl_credential_access where singleton=true;
  if v_expected is null or extensions.digest(convert_to(coalesce(p_access_code,''),'UTF8'),'sha256') <> v_expected then raise exception 'invalid_access_code'; end if;
  v_token := encode(extensions.gen_random_bytes(32),'hex'); v_expires := now()+interval '12 hours';
  insert into private.zgirl_credential_sessions(token_hash,expires_at)
  values (extensions.digest(convert_to(v_token,'UTF8'),'sha256'),v_expires) returning id into v_id;
  return jsonb_build_object('token',v_token,'expiresAt',v_expires,'sessionId',v_id);
end; $$;

create or replace function public.zgirl_credential_logout(p_session_token text)
returns boolean language plpgsql security definer
set search_path = pg_catalog, public, private, extensions
as $$
declare v_id uuid;
begin
  v_id := private.zgirl_credential_require_session(p_session_token);
  update private.zgirl_credential_sessions set revoked_at=now() where id=v_id;
  insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values ('session_revoked','session',v_id::text,'Credential operations session revoked');
  return true;
end; $$;

create or replace function public.zgirl_credential_rotate_access(p_session_token text,p_new_access_code text)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, private, extensions
as $$
declare v_old_id uuid; v_token text; v_new_id uuid; v_expires timestamptz;
begin
  v_old_id := private.zgirl_credential_require_session(p_session_token);
  if p_new_access_code is null or char_length(p_new_access_code)<24 then raise exception 'access_code_too_short'; end if;
  update private.zgirl_credential_access set access_hash=extensions.digest(convert_to(p_new_access_code,'UTF8'),'sha256'),updated_at=now() where singleton=true;
  update private.zgirl_credential_sessions set revoked_at=now() where revoked_at is null;
  v_token:=encode(extensions.gen_random_bytes(32),'hex'); v_expires:=now()+interval '12 hours';
  insert into private.zgirl_credential_sessions(token_hash,expires_at,rotated_from) values (extensions.digest(convert_to(v_token,'UTF8'),'sha256'),v_expires,v_old_id) returning id into v_new_id;
  insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values ('access_rotated','access','credential-ops','Credential operations access code rotated');
  return jsonb_build_object('token',v_token,'expiresAt',v_expires,'sessionId',v_new_id);
end; $$;

create or replace function public.zgirl_credential_dashboard(p_session_token text)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
begin
  perform private.zgirl_credential_require_session(p_session_token);
  return jsonb_build_object(
    'summary',jsonb_build_object(
      'candidates',(select count(*) from public.zgirl_credential_candidates),
      'activeCredentials',(select count(*) from public.zgirl_credentials where status in ('active','conditional') and expires_at>=current_date),
      'renewalsDue60',(select count(*) from public.zgirl_credentials where status in ('active','conditional') and expires_at between current_date and current_date+60),
      'suspendedOrRevoked',(select count(*) from public.zgirl_credentials where status in ('suspended','revoked'))),
    'candidates',coalesce((select jsonb_agg(to_jsonb(c) order by c.updated_at desc) from (select id,full_name,email,organization,pathway,status,training_version,created_at,updated_at from public.zgirl_credential_candidates order by updated_at desc limit 200)c),'[]'::jsonb),
    'credentials',coalesce((select jsonb_agg(to_jsonb(c) order by c.updated_at desc) from (select id,credential_id,candidate_id,holder_name,organization,credential_level,scope,training_version,status,status_reason_category,issue_date,expires_at,public_verification_enabled,created_at,updated_at from public.zgirl_credentials order by updated_at desc limit 200)c),'[]'::jsonb),
    'events',coalesce((select jsonb_agg(to_jsonb(e) order by e.occurred_at desc) from (select id,event_type,entity_type,entity_id,summary,occurred_at from public.zgirl_credential_audit_events order by occurred_at desc limit 50)e),'[]'::jsonb));
end; $$;

create or replace function public.zgirl_credential_get_candidate(p_session_token text,p_candidate_id uuid)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_candidate jsonb;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select to_jsonb(c) into v_candidate from (select id,full_name,email,organization,pathway,status,training_version,created_at,updated_at from public.zgirl_credential_candidates where id=p_candidate_id)c;
  if v_candidate is null then raise exception 'candidate_not_found'; end if;
  return jsonb_build_object('candidate',v_candidate,
   'requirements',coalesce((select jsonb_agg(to_jsonb(r) order by requirement_key) from (select id,requirement_key,status,score,completed_at,updated_at from public.zgirl_credential_requirements where candidate_id=p_candidate_id)r),'[]'::jsonb),
   'credentials',coalesce((select jsonb_agg(to_jsonb(cr) order by issue_date desc) from (select id,credential_id,credential_level,scope,training_version,status,status_reason_category,issue_date,expires_at,public_verification_enabled from public.zgirl_credentials where candidate_id=p_candidate_id)cr),'[]'::jsonb));
end; $$;

create or replace function public.zgirl_credential_save_candidate(p_session_token text,p_candidate_id uuid,p_full_name text,p_email text,p_organization text,p_pathway text,p_status text,p_training_version text)
returns uuid language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_id uuid; v_event text;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  if p_candidate_id is null then
    insert into public.zgirl_credential_candidates(full_name,email,organization,pathway,status,training_version) values(trim(p_full_name),lower(trim(p_email)),nullif(trim(p_organization),''),p_pathway,p_status,p_training_version) returning id into v_id; v_event:='candidate_created';
  else
    update public.zgirl_credential_candidates set full_name=trim(p_full_name),email=lower(trim(p_email)),organization=nullif(trim(p_organization),''),pathway=p_pathway,status=p_status,training_version=p_training_version,updated_at=now() where id=p_candidate_id returning id into v_id;
    if v_id is null then raise exception 'candidate_not_found'; end if; v_event:='candidate_updated';
  end if;
  insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values(v_event,'candidate',v_id::text,case when v_event='candidate_created' then 'Credential candidate created' else 'Credential candidate updated' end);
  return v_id;
end; $$;

create or replace function public.zgirl_credential_set_requirement(p_session_token text,p_candidate_id uuid,p_requirement_key text,p_status text,p_score numeric)
returns uuid language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_id uuid;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  if not exists(select 1 from public.zgirl_credential_candidates where id=p_candidate_id) then raise exception 'candidate_not_found'; end if;
  insert into public.zgirl_credential_requirements(candidate_id,requirement_key,status,score,completed_at) values(p_candidate_id,p_requirement_key,p_status,p_score,case when p_status in ('pass','fail','not_required') then now() else null end)
  on conflict(candidate_id,requirement_key) do update set status=excluded.status,score=excluded.score,completed_at=excluded.completed_at,updated_at=now() returning id into v_id;
  insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values('requirement_updated','candidate',p_candidate_id::text,'Credential requirement updated: '||p_requirement_key);
  return v_id;
end; $$;

create or replace function public.zgirl_credential_issue(p_session_token text,p_candidate_id uuid,p_credential_level text,p_scope text,p_expires_at date)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, private, extensions
as $$
declare v_candidate public.zgirl_credential_candidates%rowtype; v_id uuid; v_credential_id text; v_prefix text; v_required text[]; v_key text;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_candidate from public.zgirl_credential_candidates where id=p_candidate_id; if v_candidate.id is null then raise exception 'candidate_not_found'; end if;
  v_required:=array['orientation','curriculum','knowledge_assessment','critical_items','practicum','conduct_ack','local_safeguarding'];
  if p_credential_level in ('authorized_lead_facilitator','institutional_trainer') then v_required:=array_append(v_required,'lead_evidence'); end if;
  if p_credential_level='institutional_trainer' then v_required:=array_append(v_required,'trainer_teachback'); v_required:=array_append(v_required,'trainer_calibration'); v_required:=array_append(v_required,'institutional_trainer_license'); end if;
  foreach v_key in array v_required loop if not exists(select 1 from public.zgirl_credential_requirements where candidate_id=p_candidate_id and requirement_key=v_key and status='pass') then raise exception 'missing_required_pass:%',v_key; end if; end loop;
  if p_expires_at is null or p_expires_at<=current_date then raise exception 'invalid_expiration'; end if;
  v_prefix:=case p_credential_level when 'authorized_facilitator' then 'AF' when 'authorized_lead_facilitator' then 'ALF' when 'institutional_trainer' then 'IT' else null end; if v_prefix is null then raise exception 'invalid_credential_level'; end if;
  v_credential_id:='ZG-'||v_prefix||'-'||extract(year from current_date)::int||'-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10));
  insert into public.zgirl_credentials(credential_id,candidate_id,holder_name,organization,credential_level,scope,training_version,issue_date,expires_at) values(v_credential_id,p_candidate_id,v_candidate.full_name,v_candidate.organization,p_credential_level,trim(p_scope),v_candidate.training_version,current_date,p_expires_at) returning id into v_id;
  insert into public.zgirl_credential_renewals(credential_id,renewal_due_at,status) values(v_id,greatest(current_date,p_expires_at-45),'scheduled');
  update public.zgirl_credential_candidates set status='authorized',updated_at=now() where id=p_candidate_id;
  insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values('credential_issued','credential',v_id::text,'Z-Girl program credential issued: '||v_credential_id);
  return jsonb_build_object('id',v_id,'credentialId',v_credential_id,'expiresAt',p_expires_at);
end; $$;

create or replace function public.zgirl_credential_change_status(p_session_token text,p_credential_id uuid,p_status text,p_reason_category text,p_public_verification_enabled boolean)
returns boolean language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_code text;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  update public.zgirl_credentials set status=p_status,status_reason_category=p_reason_category,public_verification_enabled=p_public_verification_enabled,updated_at=now() where id=p_credential_id returning credential_id into v_code;
  if v_code is null then raise exception 'credential_not_found'; end if;
  insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values('credential_status_changed','credential',p_credential_id::text,'Credential status changed for '||v_code||' to '||p_status);
  return true;
end; $$;

create or replace function public.zgirl_credential_renew(p_session_token text,p_credential_id uuid,p_new_expires_at date)
returns boolean language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_code text;
begin
  perform private.zgirl_credential_require_session(p_session_token); if p_new_expires_at is null or p_new_expires_at<=current_date then raise exception 'invalid_expiration'; end if;
  update public.zgirl_credentials set expires_at=p_new_expires_at,status='active',status_reason_category=null,updated_at=now() where id=p_credential_id returning credential_id into v_code; if v_code is null then raise exception 'credential_not_found'; end if;
  update public.zgirl_credential_renewals set status='approved',completed_at=now(),updated_at=now() where credential_id=p_credential_id and status in ('scheduled','in_progress');
  insert into public.zgirl_credential_renewals(credential_id,renewal_due_at,status) values(p_credential_id,greatest(current_date,p_new_expires_at-45),'scheduled');
  insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values('credential_renewed','credential',p_credential_id::text,'Credential renewed: '||v_code); return true;
end; $$;

create or replace function public.zgirl_verify_credential(p_credential_code text)
returns table(credential_id text,holder_name text,organization text,credential_level text,scope text,training_version text,status text,issue_date date,expires_at date,valid_now boolean)
language sql security definer set search_path = pg_catalog, public
as $$
 select c.credential_id,c.holder_name,c.organization,c.credential_level,c.scope,c.training_version,
  case when c.status in ('active','conditional') and c.expires_at<current_date then 'lapsed' else c.status end,
  c.issue_date,c.expires_at,(c.status in ('active','conditional') and c.expires_at>=current_date)
 from public.zgirl_credentials c where c.public_verification_enabled=true and upper(c.credential_id)=upper(trim(p_credential_code)) limit 1;
$$;

revoke all on function public.zgirl_credential_login(text) from public;
revoke all on function public.zgirl_credential_logout(text) from public;
revoke all on function public.zgirl_credential_rotate_access(text,text) from public;
revoke all on function public.zgirl_credential_dashboard(text) from public;
revoke all on function public.zgirl_credential_get_candidate(text,uuid) from public;
revoke all on function public.zgirl_credential_save_candidate(text,uuid,text,text,text,text,text,text) from public;
revoke all on function public.zgirl_credential_set_requirement(text,uuid,text,text,numeric) from public;
revoke all on function public.zgirl_credential_issue(text,uuid,text,text,date) from public;
revoke all on function public.zgirl_credential_change_status(text,uuid,text,text,boolean) from public;
revoke all on function public.zgirl_credential_renew(text,uuid,date) from public;
revoke all on function public.zgirl_verify_credential(text) from public;

grant execute on function public.zgirl_credential_login(text) to anon, authenticated;
grant execute on function public.zgirl_credential_logout(text) to anon, authenticated;
grant execute on function public.zgirl_credential_rotate_access(text,text) to anon, authenticated;
grant execute on function public.zgirl_credential_dashboard(text) to anon, authenticated;
grant execute on function public.zgirl_credential_get_candidate(text,uuid) to anon, authenticated;
grant execute on function public.zgirl_credential_save_candidate(text,uuid,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.zgirl_credential_set_requirement(text,uuid,text,text,numeric) to anon, authenticated;
grant execute on function public.zgirl_credential_issue(text,uuid,text,text,date) to anon, authenticated;
grant execute on function public.zgirl_credential_change_status(text,uuid,text,text,boolean) to anon, authenticated;
grant execute on function public.zgirl_credential_renew(text,uuid,date) to anon, authenticated;
grant execute on function public.zgirl_verify_credential(text) to anon, authenticated;
