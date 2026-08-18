-- Z-Girl v3.11.1 — first named System Owner bootstrap + GLS pilot candidate queue
--
-- Goals:
-- 1. Allow a database administrator to prepare the first named System Owner exactly once,
--    without exposing a reusable bootstrap route or requiring a pre-existing operator session.
-- 2. Let authorized Z-Girl pipeline operators read the canonical GLS opportunity queue from the
--    shared managed-cloud database without copying CRM records into Z-Girl.
--
-- This migration does not create a real operator, institution, opportunity, pilot, evidence item,
-- payment record, agreement, or participant record by itself.

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

  -- This path is intentionally one-time. If any named identity already exists, recovery or
  -- additional operator creation must use the established v3.5 identity controls / break-glass path.
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

  -- 192 bits of random invite material. Only the SHA-256 hash is persisted.
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
    'first_system_owner_bootstrap_prepared',
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
  -- This is a global commercial opportunity queue, so institution-scoped roles do not gain access.
  v_context := private.zgirl_operator_require_capability(p_session_token,'pipeline.read',null);

  select coalesce(jsonb_agg(jsonb_build_object(
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
      'updatedAt',o.updated_at
    ) order by
      case when o.priority='high' then 0 when o.priority='medium' then 1 else 2 end,
      o.updated_at desc nulls last,
      o.created_at desc
  ),'[]'::jsonb)
  into v_rows
  from public.gls_opportunities o
  where coalesce(o.archived,false)=false;

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
