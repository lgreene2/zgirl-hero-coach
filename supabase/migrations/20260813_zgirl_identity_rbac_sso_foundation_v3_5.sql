-- Z-Girl v3.5 Institutional Identity, RBAC & SSO Foundation
-- Applied to Greene Managed Cloud Staging as migration: zgirl_identity_rbac_sso_foundation_v3_5

create schema if not exists private;

create table if not exists public.zgirl_operator_identities (
  id uuid primary key default gen_random_uuid(),
  email text not null check (position('@' in email) > 1 and char_length(email) <= 254),
  display_name text not null check (char_length(trim(display_name)) between 2 and 120),
  status text not null default 'active' check (status in ('active','suspended','disabled')),
  allowed_auth_mode text not null default 'local_code' check (allowed_auth_mode in ('local_code','supabase_auth','sso_saml')),
  auth_user_id uuid unique,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists zgirl_operator_identities_email_lower_idx on public.zgirl_operator_identities(lower(email));

create table if not exists public.zgirl_operator_role_assignments (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.zgirl_operator_identities(id) on delete cascade,
  role_key text not null check (role_key in ('system_owner','executive','institutional_admin','pipeline_manager','credential_admin','auditor')),
  institution_id uuid references public.zgirl_institutions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(operator_id, role_key, institution_id)
);
create unique index if not exists zgirl_operator_role_global_unique_idx on public.zgirl_operator_role_assignments(operator_id, role_key) where institution_id is null;

create table if not exists public.zgirl_operator_audit_events (
  id bigint generated always as identity primary key,
  operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  actor_operator_id uuid references public.zgirl_operator_identities(id) on delete set null,
  event_type text not null check (event_type in ('operator_created','invite_accepted','operator_login','auth_login','roles_changed','status_changed','auth_mode_changed','auth_identity_bound','sessions_revoked','personal_access_rotated')),
  summary text not null check (char_length(summary) between 2 and 300),
  occurred_at timestamptz not null default now()
);

create table if not exists private.zgirl_operator_credentials (
  operator_id uuid primary key references public.zgirl_operator_identities(id) on delete cascade,
  access_hash bytea not null,
  updated_at timestamptz not null default now()
);

create table if not exists private.zgirl_operator_invites (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.zgirl_operator_identities(id) on delete cascade,
  invite_hash bytea not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table private.zgirl_credential_sessions add column if not exists operator_id uuid references public.zgirl_operator_identities(id) on delete set null;
alter table private.zgirl_credential_sessions add column if not exists auth_method text not null default 'break_glass' check (auth_method in ('break_glass','local_code','supabase_auth','sso_saml'));
create index if not exists zgirl_credential_sessions_operator_idx on private.zgirl_credential_sessions(operator_id, expires_at) where revoked_at is null;

alter table public.zgirl_operator_identities enable row level security;
alter table public.zgirl_operator_role_assignments enable row level security;
alter table public.zgirl_operator_audit_events enable row level security;
revoke all on public.zgirl_operator_identities from anon, authenticated;
revoke all on public.zgirl_operator_role_assignments from anon, authenticated;
revoke all on public.zgirl_operator_audit_events from anon, authenticated;

create or replace function private.zgirl_role_has_capability(p_role text,p_capability text)
returns boolean language sql immutable set search_path=pg_catalog as $$
 select case p_role
  when 'system_owner' then true
  when 'executive' then p_capability = any(array['identity.read','portfolio.read','portfolio.review','briefing.read','briefing.manage','briefing.delivery','pipeline.read','workflow.read','license.read','credential.read','audit.read'])
  when 'institutional_admin' then p_capability = any(array['portfolio.read','portfolio.review','briefing.read','pipeline.read','pipeline.write','pipeline.handoff','workflow.read','workflow.write','workflow.approve','license.read','license.write','credential.read'])
  when 'pipeline_manager' then p_capability = any(array['portfolio.read','pipeline.read','pipeline.write','pipeline.handoff','workflow.read'])
  when 'credential_admin' then p_capability = any(array['portfolio.read','license.read','credential.read','credential.write','credential.issue','credential.status'])
  when 'auditor' then p_capability = any(array['identity.read','portfolio.read','briefing.read','pipeline.read','workflow.read','license.read','credential.read','audit.read'])
  else false end;
$$;
revoke all on function private.zgirl_role_has_capability(text,text) from public, anon, authenticated;

create or replace function private.zgirl_operator_context(p_session_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_session_id uuid; v_operator_id uuid; v_auth text; v_operator public.zgirl_operator_identities%rowtype;
begin
  v_session_id:=private.zgirl_credential_require_session(p_session_token);
  select operator_id,auth_method into v_operator_id,v_auth from private.zgirl_credential_sessions where id=v_session_id;
  if v_operator_id is null then
    return jsonb_build_object('sessionId',v_session_id,'operatorId',null,'displayName','Break-glass owner','email',null,'authMethod',coalesce(v_auth,'break_glass'),'breakGlass',true,'roles',jsonb_build_array(jsonb_build_object('roleKey','system_owner','institutionId',null)));
  end if;
  select * into v_operator from public.zgirl_operator_identities where id=v_operator_id;
  if v_operator.id is null or v_operator.status<>'active' then raise exception 'operator_inactive'; end if;
  return jsonb_build_object('sessionId',v_session_id,'operatorId',v_operator.id,'displayName',v_operator.display_name,'email',v_operator.email,'authMethod',v_auth,'breakGlass',false,'roles',coalesce((select jsonb_agg(jsonb_build_object('roleKey',r.role_key,'institutionId',r.institution_id) order by r.role_key) from public.zgirl_operator_role_assignments r where r.operator_id=v_operator.id),'[]'::jsonb));
end; $$;
revoke all on function private.zgirl_operator_context(text) from public, anon, authenticated;

create or replace function private.zgirl_operator_require_capability(p_session_token text,p_capability text,p_institution_id uuid default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_context jsonb; v_operator_id uuid;
begin
  v_context:=private.zgirl_operator_context(p_session_token);
  if coalesce((v_context->>'breakGlass')::boolean,false) then return v_context; end if;
  v_operator_id:=(v_context->>'operatorId')::uuid;
  if not exists(select 1 from public.zgirl_operator_role_assignments r where r.operator_id=v_operator_id and private.zgirl_role_has_capability(r.role_key,p_capability) and ((p_institution_id is null and r.institution_id is null) or (p_institution_id is not null and (r.institution_id is null or r.institution_id=p_institution_id)))) then raise exception 'forbidden_capability:%',p_capability; end if;
  return v_context;
end; $$;
revoke all on function private.zgirl_operator_require_capability(text,text,uuid) from public, anon, authenticated;

create or replace function public.zgirl_identity_authorize(p_session_token text,p_capability text,p_institution_id uuid default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$ begin return private.zgirl_operator_require_capability(p_session_token,p_capability,p_institution_id); end; $$;

create or replace function public.zgirl_identity_login(p_email text,p_access_code text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_operator public.zgirl_operator_identities%rowtype; v_hash bytea; v_token text; v_session_id uuid; v_expires timestamptz;
begin
  select * into v_operator from public.zgirl_operator_identities where lower(email)=lower(trim(coalesce(p_email,''))) limit 1;
  if v_operator.id is null or v_operator.status<>'active' or v_operator.allowed_auth_mode<>'local_code' then raise exception 'invalid_operator_login'; end if;
  select access_hash into v_hash from private.zgirl_operator_credentials where operator_id=v_operator.id;
  if v_hash is null or p_access_code is null or char_length(p_access_code)<24 or extensions.digest(convert_to(p_access_code,'UTF8'),'sha256')<>v_hash then raise exception 'invalid_operator_login'; end if;
  v_token:=encode(extensions.gen_random_bytes(32),'hex'); v_expires:=now()+interval '12 hours';
  insert into private.zgirl_credential_sessions(token_hash,expires_at,operator_id,auth_method) values(extensions.digest(convert_to(v_token,'UTF8'),'sha256'),v_expires,v_operator.id,'local_code') returning id into v_session_id;
  update public.zgirl_operator_identities set last_login_at=now(),updated_at=now() where id=v_operator.id;
  insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(v_operator.id,v_operator.id,'operator_login','Named operator signed in with personal access code');
  return jsonb_build_object('token',v_token,'expiresAt',v_expires,'sessionId',v_session_id,'operatorId',v_operator.id,'displayName',v_operator.display_name);
end; $$;

create or replace function public.zgirl_identity_accept_invite(p_email text,p_invite_code text,p_new_access_code text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_operator public.zgirl_operator_identities%rowtype; v_invite_id uuid; v_token text; v_session_id uuid; v_expires timestamptz;
begin
  if p_new_access_code is null or char_length(p_new_access_code)<24 then raise exception 'personal_access_code_too_short'; end if;
  select * into v_operator from public.zgirl_operator_identities where lower(email)=lower(trim(coalesce(p_email,''))) limit 1;
  if v_operator.id is null or v_operator.status<>'active' or v_operator.allowed_auth_mode<>'local_code' then raise exception 'invalid_operator_invite'; end if;
  select id into v_invite_id from private.zgirl_operator_invites where operator_id=v_operator.id and used_at is null and expires_at>now() and invite_hash=extensions.digest(convert_to(coalesce(p_invite_code,''),'UTF8'),'sha256') order by created_at desc limit 1;
  if v_invite_id is null then raise exception 'invalid_operator_invite'; end if;
  insert into private.zgirl_operator_credentials(operator_id,access_hash,updated_at) values(v_operator.id,extensions.digest(convert_to(p_new_access_code,'UTF8'),'sha256'),now()) on conflict(operator_id) do update set access_hash=excluded.access_hash,updated_at=now();
  update private.zgirl_operator_invites set used_at=now() where id=v_invite_id;
  v_token:=encode(extensions.gen_random_bytes(32),'hex'); v_expires:=now()+interval '12 hours';
  insert into private.zgirl_credential_sessions(token_hash,expires_at,operator_id,auth_method) values(extensions.digest(convert_to(v_token,'UTF8'),'sha256'),v_expires,v_operator.id,'local_code') returning id into v_session_id;
  update public.zgirl_operator_identities set last_login_at=now(),updated_at=now() where id=v_operator.id;
  insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(v_operator.id,v_operator.id,'invite_accepted','Named operator accepted invitation and established personal access');
  return jsonb_build_object('token',v_token,'expiresAt',v_expires,'sessionId',v_session_id,'operatorId',v_operator.id,'displayName',v_operator.display_name);
end; $$;

create or replace function public.zgirl_identity_exchange_auth_session()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,auth,extensions as $$
declare v_uid uuid; v_email text; v_amr jsonb; v_is_sso boolean; v_operator public.zgirl_operator_identities%rowtype; v_method text; v_token text; v_session_id uuid; v_expires timestamptz;
begin
  v_uid:=auth.uid(); if v_uid is null then raise exception 'unauthorized'; end if;
  v_email:=coalesce(auth.jwt()->>'email',''); v_amr:=coalesce(auth.jwt()->'amr','[]'::jsonb);
  v_is_sso:=exists(select 1 from jsonb_array_elements(v_amr) x where x->>'method'='sso/saml');
  select * into v_operator from public.zgirl_operator_identities where auth_user_id=v_uid limit 1;
  if v_operator.id is null then
    select * into v_operator from public.zgirl_operator_identities where auth_user_id is null and lower(email)=lower(v_email) and status='active' and allowed_auth_mode in ('supabase_auth','sso_saml') limit 1;
    if v_operator.id is not null then
      if v_operator.allowed_auth_mode='sso_saml' and not v_is_sso then raise exception 'sso_required'; end if;
      update public.zgirl_operator_identities set auth_user_id=v_uid,updated_at=now() where id=v_operator.id;
      insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(v_operator.id,v_operator.id,'auth_identity_bound','Supabase Auth identity bound to named operator');
    end if;
  end if;
  if v_operator.id is null or v_operator.status<>'active' or v_operator.allowed_auth_mode='local_code' then raise exception 'operator_not_authorized'; end if;
  if v_operator.allowed_auth_mode='sso_saml' and not v_is_sso then raise exception 'sso_required'; end if;
  v_method:=case when v_is_sso then 'sso_saml' else 'supabase_auth' end;
  v_token:=encode(extensions.gen_random_bytes(32),'hex'); v_expires:=now()+interval '12 hours';
  insert into private.zgirl_credential_sessions(token_hash,expires_at,operator_id,auth_method) values(extensions.digest(convert_to(v_token,'UTF8'),'sha256'),v_expires,v_operator.id,v_method) returning id into v_session_id;
  update public.zgirl_operator_identities set last_login_at=now(),updated_at=now() where id=v_operator.id;
  insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(v_operator.id,v_operator.id,'auth_login','Named operator signed in through Supabase Auth / SSO bridge');
  return jsonb_build_object('token',v_token,'expiresAt',v_expires,'sessionId',v_session_id,'operatorId',v_operator.id,'displayName',v_operator.display_name,'authMethod',v_method);
end; $$;

create or replace function public.zgirl_identity_dashboard(p_session_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_context jsonb;
begin
  v_context:=private.zgirl_operator_require_capability(p_session_token,'identity.read',null);
  return jsonb_build_object('context',v_context,'operators',coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'email',o.email,'displayName',o.display_name,'status',o.status,'allowedAuthMode',o.allowed_auth_mode,'authUserBound',o.auth_user_id is not null,'lastLoginAt',o.last_login_at,'createdAt',o.created_at,'roles',coalesce((select jsonb_agg(jsonb_build_object('roleKey',r.role_key,'institutionId',r.institution_id,'institutionName',i.name) order by r.role_key) from public.zgirl_operator_role_assignments r left join public.zgirl_institutions i on i.id=r.institution_id where r.operator_id=o.id),'[]'::jsonb)) order by o.created_at) from public.zgirl_operator_identities o),'[]'::jsonb),'recentEvents',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'operatorId',e.operator_id,'actorOperatorId',e.actor_operator_id,'eventType',e.event_type,'summary',e.summary,'occurredAt',e.occurred_at) order by e.occurred_at desc) from (select * from public.zgirl_operator_audit_events order by occurred_at desc limit 100)e),'[]'::jsonb),'institutions',coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'institutionCode',institution_code) order by name) from public.zgirl_institutions),'[]'::jsonb));
end; $$;

create or replace function public.zgirl_identity_create_operator(p_session_token text,p_email text,p_display_name text,p_allowed_auth_mode text default 'local_code')
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_actor jsonb; v_id uuid; v_invite text; v_expires timestamptz;
begin
  v_actor:=private.zgirl_operator_require_capability(p_session_token,'identity.manage',null);
  if p_allowed_auth_mode not in ('local_code','supabase_auth','sso_saml') then raise exception 'invalid_operator_auth_mode'; end if;
  insert into public.zgirl_operator_identities(email,display_name,allowed_auth_mode) values(lower(trim(p_email)),trim(p_display_name),p_allowed_auth_mode) returning id into v_id;
  if p_allowed_auth_mode='local_code' then v_invite:=encode(extensions.gen_random_bytes(24),'hex'); v_expires:=now()+interval '7 days'; insert into private.zgirl_operator_invites(operator_id,invite_hash,expires_at) values(v_id,extensions.digest(convert_to(v_invite,'UTF8'),'sha256'),v_expires); end if;
  insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(v_id,nullif(v_actor->>'operatorId','')::uuid,'operator_created','Named operator identity created');
  return jsonb_build_object('operatorId',v_id,'inviteCode',v_invite,'inviteExpiresAt',v_expires);
end; $$;

create or replace function public.zgirl_identity_set_roles(p_session_token text,p_operator_id uuid,p_roles jsonb)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_actor jsonb; v_item jsonb; v_role text; v_inst uuid;
begin
  v_actor:=private.zgirl_operator_require_capability(p_session_token,'identity.manage',null);
  if not exists(select 1 from public.zgirl_operator_identities where id=p_operator_id) then raise exception 'operator_not_found'; end if;
  if jsonb_typeof(coalesce(p_roles,'[]'::jsonb))<>'array' then raise exception 'invalid_operator_roles'; end if;
  delete from public.zgirl_operator_role_assignments where operator_id=p_operator_id;
  for v_item in select value from jsonb_array_elements(coalesce(p_roles,'[]'::jsonb)) loop
    v_role:=v_item->>'roleKey'; v_inst:=nullif(v_item->>'institutionId','')::uuid;
    if v_role not in ('system_owner','executive','institutional_admin','pipeline_manager','credential_admin','auditor') then raise exception 'invalid_operator_role'; end if;
    if v_role in ('system_owner','executive','auditor') and v_inst is not null then raise exception 'global_role_required'; end if;
    if v_inst is not null and not exists(select 1 from public.zgirl_institutions where id=v_inst) then raise exception 'institution_not_found'; end if;
    insert into public.zgirl_operator_role_assignments(operator_id,role_key,institution_id) values(p_operator_id,v_role,v_inst) on conflict do nothing;
  end loop;
  insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(p_operator_id,nullif(v_actor->>'operatorId','')::uuid,'roles_changed','Operator role assignments updated');
  return true;
end; $$;

create or replace function public.zgirl_identity_set_operator(p_session_token text,p_operator_id uuid,p_status text,p_allowed_auth_mode text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_actor jsonb; v_old_mode text;
begin
  v_actor:=private.zgirl_operator_require_capability(p_session_token,'identity.manage',null);
  if p_status not in ('active','suspended','disabled') then raise exception 'invalid_operator_status'; end if;
  if p_allowed_auth_mode not in ('local_code','supabase_auth','sso_saml') then raise exception 'invalid_operator_auth_mode'; end if;
  select allowed_auth_mode into v_old_mode from public.zgirl_operator_identities where id=p_operator_id;
  if v_old_mode is null then raise exception 'operator_not_found'; end if;
  update public.zgirl_operator_identities set status=p_status,allowed_auth_mode=p_allowed_auth_mode,updated_at=now() where id=p_operator_id;
  if p_status<>'active' then update private.zgirl_credential_sessions set revoked_at=now() where operator_id=p_operator_id and revoked_at is null; end if;
  if v_old_mode<>p_allowed_auth_mode then update private.zgirl_credential_sessions set revoked_at=now() where operator_id=p_operator_id and revoked_at is null; insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(p_operator_id,nullif(v_actor->>'operatorId','')::uuid,'auth_mode_changed','Operator authentication mode changed; active sessions revoked'); else insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(p_operator_id,nullif(v_actor->>'operatorId','')::uuid,'status_changed','Operator status updated'); end if;
  return true;
end; $$;

create or replace function public.zgirl_identity_revoke_sessions(p_session_token text,p_operator_id uuid)
returns integer language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_actor jsonb; v_count integer;
begin
  v_actor:=private.zgirl_operator_require_capability(p_session_token,'identity.manage',null);
  update private.zgirl_credential_sessions set revoked_at=now() where operator_id=p_operator_id and revoked_at is null; get diagnostics v_count=row_count;
  insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(p_operator_id,nullif(v_actor->>'operatorId','')::uuid,'sessions_revoked','Operator sessions revoked by identity administrator');
  return v_count;
end; $$;

create or replace function public.zgirl_identity_rotate_personal_access(p_session_token text,p_current_code text,p_new_code text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_context jsonb; v_operator_id uuid; v_hash bytea;
begin
  v_context:=private.zgirl_operator_context(p_session_token);
  if coalesce((v_context->>'breakGlass')::boolean,false) then raise exception 'named_operator_required'; end if;
  v_operator_id:=(v_context->>'operatorId')::uuid;
  if p_new_code is null or char_length(p_new_code)<24 then raise exception 'personal_access_code_too_short'; end if;
  select access_hash into v_hash from private.zgirl_operator_credentials where operator_id=v_operator_id;
  if v_hash is null or extensions.digest(convert_to(coalesce(p_current_code,''),'UTF8'),'sha256')<>v_hash then raise exception 'invalid_operator_login'; end if;
  update private.zgirl_operator_credentials set access_hash=extensions.digest(convert_to(p_new_code,'UTF8'),'sha256'),updated_at=now() where operator_id=v_operator_id;
  update private.zgirl_credential_sessions set revoked_at=now() where operator_id=v_operator_id and id<>(v_context->>'sessionId')::uuid and revoked_at is null;
  insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary) values(v_operator_id,v_operator_id,'personal_access_rotated','Personal operator access code rotated; other sessions revoked');
  return true;
end; $$;

revoke all on function public.zgirl_identity_authorize(text,text,uuid) from public;
revoke all on function public.zgirl_identity_login(text,text) from public;
revoke all on function public.zgirl_identity_accept_invite(text,text,text) from public;
revoke all on function public.zgirl_identity_exchange_auth_session() from public;
revoke all on function public.zgirl_identity_dashboard(text) from public;
revoke all on function public.zgirl_identity_create_operator(text,text,text,text) from public;
revoke all on function public.zgirl_identity_set_roles(text,uuid,jsonb) from public;
revoke all on function public.zgirl_identity_set_operator(text,uuid,text,text) from public;
revoke all on function public.zgirl_identity_revoke_sessions(text,uuid) from public;
revoke all on function public.zgirl_identity_rotate_personal_access(text,text,text) from public;

grant execute on function public.zgirl_identity_authorize(text,text,uuid) to anon, authenticated;
grant execute on function public.zgirl_identity_login(text,text) to anon, authenticated;
grant execute on function public.zgirl_identity_accept_invite(text,text,text) to anon, authenticated;
grant execute on function public.zgirl_identity_exchange_auth_session() to authenticated;
grant execute on function public.zgirl_identity_dashboard(text) to anon, authenticated;
grant execute on function public.zgirl_identity_create_operator(text,text,text,text) to anon, authenticated;
grant execute on function public.zgirl_identity_set_roles(text,uuid,jsonb) to anon, authenticated;
grant execute on function public.zgirl_identity_set_operator(text,uuid,text,text) to anon, authenticated;
grant execute on function public.zgirl_identity_revoke_sessions(text,uuid) to anon, authenticated;
grant execute on function public.zgirl_identity_rotate_personal_access(text,text,text) to anon, authenticated;
