-- Z-Girl v3.0 institutional license administration hardening
-- Enforces site limits, credential hierarchy, active-agreement requirement, and prevents limit shrinkage below current usage.

create or replace function public.zgirl_institution_allocate_seat(p_session_token text,p_license_id uuid,p_candidate_id uuid,p_site_id uuid,p_seat_role text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_license public.zgirl_institution_licenses%rowtype; v_id uuid; v_count integer; v_status text;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_license from public.zgirl_institution_licenses where id=p_license_id; if v_license.id is null then raise exception 'license_not_found'; end if;
  if v_license.status in ('suspended','lapsed','closed') then raise exception 'license_not_allocatable'; end if;
  if not exists(select 1 from public.zgirl_credential_candidates where id=p_candidate_id) then raise exception 'candidate_not_found'; end if;
  if p_site_id is not null and not exists(select 1 from public.zgirl_institution_sites where id=p_site_id and institution_id=v_license.institution_id and status<>'closed') then raise exception 'invalid_license_site'; end if;
  if p_seat_role not in ('facilitator','lead_facilitator','institutional_trainer') then raise exception 'invalid_seat_role'; end if;
  if p_site_id is not null and not exists(select 1 from public.zgirl_institution_seat_allocations where license_id=p_license_id and site_id=p_site_id and status<>'released') then
    select count(distinct site_id) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and site_id is not null and status<>'released';
    if v_count>=v_license.site_limit then raise exception 'site_limit_reached'; end if;
  end if;
  if p_seat_role='institutional_trainer' then select count(*) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and seat_role='institutional_trainer' and status<>'released'; if v_count>=v_license.trainer_limit then raise exception 'trainer_limit_reached'; end if; end if;
  select count(*) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and status<>'released'; if v_count>=v_license.seat_limit then raise exception 'seat_limit_reached'; end if;
  v_status:=case when v_license.status in ('active','conditional') and v_license.effective_date<=current_date and v_license.expires_at>=current_date then 'active' else 'reserved' end;
  insert into public.zgirl_institution_seat_allocations(license_id,candidate_id,site_id,seat_role,status) values(p_license_id,p_candidate_id,p_site_id,p_seat_role,v_status) returning id into v_id;
  insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_license.institution_id,p_license_id,'seat_allocated','Credential seat allocated'); return v_id;
end; $$;

create or replace function public.zgirl_institution_link_credential(p_session_token text,p_allocation_id uuid,p_credential_id uuid)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_candidate uuid; v_license uuid; v_org uuid; v_cred_candidate uuid; v_level text; v_role text;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select candidate_id,license_id,seat_role into v_candidate,v_license,v_role from public.zgirl_institution_seat_allocations where id=p_allocation_id and status<>'released'; if v_candidate is null then raise exception 'allocation_not_found'; end if;
  select candidate_id,credential_level into v_cred_candidate,v_level from public.zgirl_credentials where id=p_credential_id; if v_cred_candidate is null then raise exception 'credential_not_found'; end if;
  if v_candidate<>v_cred_candidate then raise exception 'credential_candidate_mismatch'; end if;
  if (v_role='lead_facilitator' and v_level not in ('authorized_lead_facilitator','institutional_trainer')) or (v_role='institutional_trainer' and v_level<>'institutional_trainer') then raise exception 'credential_level_mismatch'; end if;
  if not exists(select 1 from public.zgirl_institution_licenses where id=v_license and v_level=any(allowed_credential_levels)) then raise exception 'credential_level_not_allowed'; end if;
  update public.zgirl_institution_seat_allocations set credential_id=p_credential_id,updated_at=now() where id=p_allocation_id; select institution_id into v_org from public.zgirl_institution_licenses where id=v_license;
  insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_org,v_license,'credential_linked','Program credential linked to institutional seat'); return true;
end; $$;

create or replace function public.zgirl_institution_save_license(p_session_token text,p_license_id uuid,p_institution_id uuid,p_license_type text,p_status text,p_effective_date date,p_expires_at date,p_seat_limit integer,p_site_limit integer,p_trainer_limit integer,p_allowed_profiles text[],p_allowed_levels text[],p_agreement_status text,p_agreement_reference text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_id uuid; v_code text; v_count integer;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  if not exists(select 1 from public.zgirl_institutions where id=p_institution_id) then raise exception 'institution_not_found'; end if;
  if p_license_type not in ('pilot','annual','multisite','train_the_trainer') or p_status not in ('draft','pending','active','conditional','suspended','lapsed','closed') then raise exception 'invalid_license'; end if;
  if p_effective_date is null or p_expires_at is null or p_expires_at<=p_effective_date then raise exception 'invalid_license_term'; end if;
  if p_seat_limit<1 or p_site_limit<1 or p_trainer_limit<0 then raise exception 'invalid_license_limits'; end if;
  if p_allowed_profiles is null or cardinality(p_allowed_profiles)=0 or not(p_allowed_profiles <@ array['general','edu','faith','athlete']::text[]) then raise exception 'invalid_profiles'; end if;
  if p_allowed_levels is null or cardinality(p_allowed_levels)=0 or not(p_allowed_levels <@ array['authorized_facilitator','authorized_lead_facilitator','institutional_trainer']::text[]) then raise exception 'invalid_levels'; end if;
  if p_agreement_status not in ('draft','review','executed','expired','closed') then raise exception 'invalid_agreement_status'; end if;
  if p_status in ('active','conditional') and p_agreement_status<>'executed' then raise exception 'agreement_required_for_active_license'; end if;
  if p_license_id is null then
    v_code:='ZG-LIC-'||extract(year from current_date)::int||'-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10));
    insert into public.zgirl_institution_licenses(institution_id,license_code,license_type,status,effective_date,expires_at,seat_limit,site_limit,trainer_limit,allowed_profiles,allowed_credential_levels,agreement_status,agreement_reference)
    values(p_institution_id,v_code,p_license_type,p_status,p_effective_date,p_expires_at,p_seat_limit,p_site_limit,p_trainer_limit,p_allowed_profiles,p_allowed_levels,p_agreement_status,nullif(trim(p_agreement_reference),'')) returning id into v_id;
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(p_institution_id,v_id,'license_created','Institution license created: '||v_code);
  else
    select count(*) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and status<>'released'; if p_seat_limit<v_count then raise exception 'seat_limit_below_usage'; end if;
    select count(distinct site_id) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and site_id is not null and status<>'released'; if p_site_limit<v_count then raise exception 'site_limit_below_usage'; end if;
    select count(*) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and seat_role='institutional_trainer' and status<>'released'; if p_trainer_limit<v_count then raise exception 'trainer_limit_below_usage'; end if;
    update public.zgirl_institution_licenses set license_type=p_license_type,status=p_status,effective_date=p_effective_date,expires_at=p_expires_at,seat_limit=p_seat_limit,site_limit=p_site_limit,trainer_limit=p_trainer_limit,allowed_profiles=p_allowed_profiles,allowed_credential_levels=p_allowed_levels,agreement_status=p_agreement_status,agreement_reference=nullif(trim(p_agreement_reference),''),renewal_status=case when p_status='lapsed' then 'lapsed' when p_expires_at<=current_date+90 then 'due' else 'not_due' end,updated_at=now() where id=p_license_id and institution_id=p_institution_id returning id into v_id;
    if v_id is null then raise exception 'license_not_found'; end if;
    if p_status in ('suspended','lapsed','closed') then update public.zgirl_institution_seat_allocations set status='blocked',updated_at=now() where license_id=v_id and status in ('active','reserved'); elsif p_status in ('active','conditional') then update public.zgirl_institution_seat_allocations set status='active',updated_at=now() where license_id=v_id and status='blocked'; end if;
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(p_institution_id,v_id,'license_updated','Institution license updated');
  end if; return v_id;
end; $$;
