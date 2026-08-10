-- Z-Girl v3.0 roster + renewal hardening
-- Bulk imports must obey the same license limits as manual allocations.
-- Institutional renewal must record an executed renewal agreement reference.

create or replace function public.zgirl_institution_import_roster(p_session_token text,p_license_id uuid,p_source_label text,p_rows jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare
  v_license public.zgirl_institution_licenses%rowtype; v_org public.zgirl_institutions%rowtype; v_row jsonb;
  v_email text; v_name text; v_pathway text; v_training text; v_site_name text; v_role text;
  v_candidate uuid; v_site uuid; v_allocation uuid; v_old_role text; v_old_site uuid;
  v_rows integer:=0; v_created integer:=0; v_allocated integer:=0; v_updated integer:=0; v_skipped integer:=0; v_count integer; v_batch uuid; v_status text;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_license from public.zgirl_institution_licenses where id=p_license_id;
  if v_license.id is null then raise exception 'license_not_found'; end if;
  if v_license.status in ('suspended','lapsed','closed') then raise exception 'license_not_allocatable'; end if;
  select * into v_org from public.zgirl_institutions where id=v_license.institution_id;
  if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>250 then raise exception 'invalid_roster'; end if;

  for v_row in select value from jsonb_array_elements(p_rows) loop
    v_rows:=v_rows+1;
    v_email:=lower(trim(coalesce(v_row->>'email',''))); v_name:=trim(coalesce(v_row->>'fullName',''));
    v_pathway:=coalesce(nullif(v_row->>'pathway',''),'institutional'); v_training:=coalesce(nullif(v_row->>'trainingVersion',''),'2.7');
    v_site_name:=trim(coalesce(v_row->>'siteName','')); v_role:=coalesce(nullif(v_row->>'seatRole',''),'facilitator');
    if position('@' in v_email)<=1 or char_length(v_name)<2 or v_pathway not in ('general','edu','faith','athlete','institutional') or v_role not in ('facilitator','lead_facilitator','institutional_trainer') then v_skipped:=v_skipped+1; continue; end if;

    select id into v_candidate from public.zgirl_credential_candidates where lower(email)=v_email;
    if v_candidate is null then
      insert into public.zgirl_credential_candidates(full_name,email,organization,pathway,status,training_version)
      values(v_name,v_email,v_org.name,v_pathway,'candidate',v_training) returning id into v_candidate; v_created:=v_created+1;
    end if;

    v_site:=null;
    if v_site_name<>'' then
      select id into v_site from public.zgirl_institution_sites where institution_id=v_org.id and lower(name)=lower(v_site_name) and status<>'closed' limit 1;
      if v_site is null then
        select count(distinct site_id) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and site_id is not null and status<>'released';
        if v_count>=v_license.site_limit then v_skipped:=v_skipped+1; continue; end if;
        insert into public.zgirl_institution_sites(institution_id,site_code,name,site_type,status)
        values(v_org.id,'ZG-SITE-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,8)),v_site_name,'program','active') returning id into v_site;
      elsif not exists(select 1 from public.zgirl_institution_seat_allocations where license_id=p_license_id and site_id=v_site and status<>'released') then
        select count(distinct site_id) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and site_id is not null and status<>'released';
        if v_count>=v_license.site_limit then v_skipped:=v_skipped+1; continue; end if;
      end if;
    end if;

    select id,seat_role,site_id into v_allocation,v_old_role,v_old_site from public.zgirl_institution_seat_allocations where license_id=p_license_id and candidate_id=v_candidate and status<>'released' limit 1;
    if v_allocation is not null then
      if v_role='institutional_trainer' and v_old_role<>'institutional_trainer' then
        select count(*) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and seat_role='institutional_trainer' and status<>'released';
        if v_count>=v_license.trainer_limit then v_skipped:=v_skipped+1; continue; end if;
      end if;
      update public.zgirl_institution_seat_allocations set site_id=v_site,seat_role=v_role,updated_at=now() where id=v_allocation; v_updated:=v_updated+1; continue;
    end if;

    select count(*) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and status<>'released';
    if v_count>=v_license.seat_limit then v_skipped:=v_skipped+1; continue; end if;
    if v_role='institutional_trainer' then
      select count(*) into v_count from public.zgirl_institution_seat_allocations where license_id=p_license_id and seat_role='institutional_trainer' and status<>'released';
      if v_count>=v_license.trainer_limit then v_skipped:=v_skipped+1; continue; end if;
    end if;
    v_status:=case when v_license.status in ('active','conditional') and v_license.effective_date<=current_date and v_license.expires_at>=current_date then 'active' else 'reserved' end;
    insert into public.zgirl_institution_seat_allocations(license_id,candidate_id,site_id,seat_role,status) values(p_license_id,v_candidate,v_site,v_role,v_status); v_allocated:=v_allocated+1;
  end loop;

  insert into public.zgirl_institution_import_batches(license_id,source_label,rows_received,candidates_created,seats_allocated,seats_updated,rows_skipped)
  values(p_license_id,nullif(trim(p_source_label),''),v_rows,v_created,v_allocated,v_updated,v_skipped) returning id into v_batch;
  insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary)
  values(v_org.id,p_license_id,'roster_imported','Adult facilitator roster import processed: '||v_rows||' rows; '||v_allocated||' seats allocated; '||v_skipped||' rows skipped');
  return jsonb_build_object('batchId',v_batch,'rowsReceived',v_rows,'candidatesCreated',v_created,'seatsAllocated',v_allocated,'seatsUpdated',v_updated,'rowsSkipped',v_skipped);
end; $$;

create or replace function public.zgirl_institution_renew_license_v3(p_session_token text,p_license_id uuid,p_new_expires_at date,p_new_seat_limit integer,p_agreement_reference text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_org uuid; v_code text; v_current_seats integer;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  if p_new_expires_at is null or p_new_expires_at<=current_date or p_new_seat_limit<1 then raise exception 'invalid_license_renewal'; end if;
  if nullif(trim(p_agreement_reference),'') is null or char_length(trim(p_agreement_reference))>180 then raise exception 'renewal_agreement_required'; end if;
  select count(*) into v_current_seats from public.zgirl_institution_seat_allocations where license_id=p_license_id and status<>'released';
  if p_new_seat_limit<v_current_seats then raise exception 'seat_limit_below_usage'; end if;
  update public.zgirl_institution_licenses
  set expires_at=p_new_expires_at,seat_limit=p_new_seat_limit,status='active',renewal_status='not_due',agreement_status='executed',agreement_reference=trim(p_agreement_reference),updated_at=now()
  where id=p_license_id returning institution_id,license_code into v_org,v_code;
  if v_org is null then raise exception 'license_not_found'; end if;
  update public.zgirl_institution_seat_allocations set status='active',updated_at=now() where license_id=p_license_id and status='blocked';
  insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary)
  values(v_org,p_license_id,'license_renewed','Institution license renewed under executed agreement: '||v_code||' through '||p_new_expires_at::text);
  return true;
end; $$;
revoke all on function public.zgirl_institution_renew_license_v3(text,uuid,date,integer,text) from public;
grant execute on function public.zgirl_institution_renew_license_v3(text,uuid,date,integer,text) to anon,authenticated;
