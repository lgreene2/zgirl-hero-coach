-- Z-Girl v3.11.1 operational hotfix
--
-- The first-owner bootstrap originally emitted an audit event type that was not part of the
-- established zgirl_operator_audit_events event_type constraint. PostgreSQL correctly rejected
-- the bootstrap atomically. This migration changes only the audit event key to the existing
-- allowed `operator_created` event while preserving the one-time bootstrap, invite entropy,
-- application-role revocations, and all existing identity/RBAC boundaries.

create or replace function private.zgirl_bootstrap_first_system_owner(
  p_email text,
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'private', 'extensions'
as $function$
declare
  v_email text := lower(trim(coalesce(p_email,'')));
  v_display_name text := trim(coalesce(p_display_name,''));
  v_operator_id uuid;
  v_invite_code text;
  v_expires_at timestamptz := now() + interval '7 days';
begin
  if v_email = '' or position('@' in v_email) <= 1 or char_length(v_email) > 254 then
    raise exception 'invalid_operator_email';
  end if;
  if char_length(v_display_name) < 2 or char_length(v_display_name) > 120 then
    raise exception 'invalid_operator_display_name';
  end if;

  if exists(select 1 from public.zgirl_operator_identities) then
    raise exception 'first_owner_bootstrap_closed';
  end if;
  if exists(
    select 1
    from public.zgirl_operator_role_assignments
    where role_key='system_owner' and institution_id is null and status='active'
  ) then
    raise exception 'first_owner_bootstrap_closed';
  end if;

  insert into public.zgirl_operator_identities(email,display_name,status,allowed_auth_mode)
  values(v_email,v_display_name,'active','local_code')
  returning id into v_operator_id;

  insert into public.zgirl_operator_role_assignments(operator_id,role_key,institution_id,status)
  values(v_operator_id,'system_owner',null,'active');

  v_invite_code := 'ZG-OWNER-' || upper(encode(extensions.gen_random_bytes(24),'hex'));
  insert into private.zgirl_operator_invites(operator_id,invite_hash,expires_at)
  values(
    v_operator_id,
    extensions.digest(convert_to(v_invite_code,'UTF8'),'sha256'),
    v_expires_at
  );

  insert into public.zgirl_operator_audit_events(operator_id,actor_operator_id,event_type,summary)
  values(
    v_operator_id,
    null,
    'operator_created',
    'Database-admin-only bootstrap prepared the first named global System Owner invitation'
  );

  return jsonb_build_object(
    'operatorId',v_operator_id,
    'email',v_email,
    'displayName',v_display_name,
    'inviteCode',v_invite_code,
    'expiresAt',v_expires_at,
    'nextStep','Use the existing /institutions/auth invite acceptance flow to set a personal access code of at least 24 characters.'
  );
end;
$function$;

revoke all on function private.zgirl_bootstrap_first_system_owner(text,text) from public;
revoke all on function private.zgirl_bootstrap_first_system_owner(text,text) from anon;
revoke all on function private.zgirl_bootstrap_first_system_owner(text,text) from authenticated;
