-- Z-Girl v3.1 effective-date hardening
-- Approval prepares the handoff. Future-dated scope changes are scheduled and activate only on their effective date.

alter table public.zgirl_institution_workflows drop constraint if exists zgirl_institution_workflows_status_check;
alter table public.zgirl_institution_workflows add constraint zgirl_institution_workflows_status_check check (status in ('draft','evidence_build','approvals_pending','agreement_pending','release_review','ready_for_handoff','scheduled','released','rejected','cancelled'));

alter table public.zgirl_institution_delivery_handoffs drop constraint if exists zgirl_institution_delivery_handoffs_status_check;
alter table public.zgirl_institution_delivery_handoffs add constraint zgirl_institution_delivery_handoffs_status_check check (status in ('pending','ready','scheduled','released','cancelled'));
alter table public.zgirl_institution_delivery_handoffs add column if not exists scheduled_at timestamptz;
alter table public.zgirl_institution_delivery_handoffs add column if not exists activated_at timestamptz;

create or replace function private.zgirl_apply_institution_workflow_scope(p_workflow_id uuid)
returns void language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_w public.zgirl_institution_workflows%rowtype; v_l public.zgirl_institution_licenses%rowtype; v_a public.zgirl_institution_agreements%rowtype; v_packet public.zgirl_institution_evidence_packets%rowtype; v_pending integer; v_seats integer; v_sites integer; v_trainers integer;
begin
  select * into v_w from public.zgirl_institution_workflows where id=p_workflow_id; if v_w.id is null then raise exception 'workflow_not_found'; end if;
  if v_w.status not in ('ready_for_handoff','scheduled') then raise exception 'workflow_not_ready'; end if;
  select * into v_l from public.zgirl_institution_licenses where id=v_w.license_id for update; if v_l.id is null then raise exception 'license_not_found'; end if;
  if v_l.status in ('suspended','closed') then raise exception 'license_not_releasable'; end if;
  select * into v_a from public.zgirl_institution_agreements where id=v_w.agreement_id; if v_a.id is null or v_a.status<>'executed' or nullif(trim(coalesce(v_a.reference,'')),'') is null then raise exception 'executed_agreement_required'; end if;
  select * into v_packet from public.zgirl_institution_evidence_packets where workflow_id=p_workflow_id; if v_packet.id is null or v_packet.packet_status<>'complete' then raise exception 'evidence_packet_required'; end if;
  select count(*) into v_pending from public.zgirl_institution_approval_gates where workflow_id=p_workflow_id and required and status not in ('approved','waived'); if v_pending>0 then raise exception 'approval_gates_incomplete'; end if;
  select count(*) into v_seats from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released';
  select count(distinct site_id) into v_sites from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released' and site_id is not null;
  select count(*) into v_trainers from public.zgirl_institution_seat_allocations where license_id=v_w.license_id and status<>'released' and seat_role='institutional_trainer';
  if coalesce(v_w.requested_seat_limit,v_l.seat_limit)<v_seats then raise exception 'seat_limit_below_usage'; end if;
  if coalesce(v_w.requested_site_limit,v_l.site_limit)<v_sites then raise exception 'site_limit_below_usage'; end if;
  if coalesce(v_w.requested_trainer_limit,v_l.trainer_limit)<v_trainers then raise exception 'trainer_limit_below_usage'; end if;
  update public.zgirl_institution_licenses set effective_date=coalesce(v_w.requested_effective_date,effective_date),expires_at=coalesce(v_w.requested_expires_at,expires_at),seat_limit=coalesce(v_w.requested_seat_limit,seat_limit),site_limit=coalesce(v_w.requested_site_limit,site_limit),trainer_limit=coalesce(v_w.requested_trainer_limit,trainer_limit),allowed_profiles=coalesce(v_w.requested_profiles,allowed_profiles),allowed_credential_levels=coalesce(v_w.requested_credential_levels,allowed_credential_levels),agreement_status='executed',agreement_reference=v_a.reference,status=case when coalesce(v_w.requested_effective_date,effective_date)<=current_date and coalesce(v_w.requested_expires_at,expires_at)>=current_date then 'active' else 'pending' end,renewal_status=case when coalesce(v_w.requested_expires_at,expires_at)<=current_date+90 then 'due' else 'not_due' end,updated_at=now() where id=v_w.license_id;
  update public.zgirl_institution_seat_allocations set status='active',updated_at=now() where license_id=v_w.license_id and status='blocked' and coalesce(v_w.requested_effective_date,v_l.effective_date)<=current_date and coalesce(v_w.requested_expires_at,v_l.expires_at)>=current_date;
end; $$;

create or replace function public.zgirl_institution_finalize_workflow(p_session_token text,p_workflow_id uuid,p_implementation_owner text,p_handoff_reference text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_w public.zgirl_institution_workflows%rowtype; v_a public.zgirl_institution_agreements%rowtype; v_packet public.zgirl_institution_evidence_packets%rowtype; v_pending integer; v_handoff uuid;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_w from public.zgirl_institution_workflows where id=p_workflow_id; if v_w.id is null then raise exception 'workflow_not_found'; end if;
  if v_w.status<>'release_review' then raise exception 'workflow_not_ready'; end if;
  if exists(select 1 from public.zgirl_institution_licenses where id=v_w.license_id and status in ('suspended','closed')) then raise exception 'license_not_releasable'; end if;
  select * into v_a from public.zgirl_institution_agreements where id=v_w.agreement_id; if v_a.id is null or v_a.status<>'executed' or nullif(trim(coalesce(v_a.reference,'')),'') is null then raise exception 'executed_agreement_required'; end if;
  select * into v_packet from public.zgirl_institution_evidence_packets where workflow_id=p_workflow_id; if v_packet.id is null or v_packet.packet_status<>'complete' then raise exception 'evidence_packet_required'; end if;
  select count(*) into v_pending from public.zgirl_institution_approval_gates where workflow_id=p_workflow_id and required and status not in ('approved','waived'); if v_pending>0 then raise exception 'approval_gates_incomplete'; end if;
  if nullif(trim(coalesce(p_implementation_owner,'')),'') is null then raise exception 'implementation_owner_required'; end if;
  update public.zgirl_institution_workflows set status='ready_for_handoff',updated_at=now() where id=p_workflow_id;
  insert into public.zgirl_institution_delivery_handoffs(workflow_id,institution_id,license_id,status,implementation_owner,target_start_date,release_reference)
  values(p_workflow_id,v_w.institution_id,v_w.license_id,'ready',trim(p_implementation_owner),coalesce(v_w.target_start_date,v_w.requested_effective_date),nullif(trim(p_handoff_reference),''))
  on conflict (workflow_id) do update set status='ready',implementation_owner=excluded.implementation_owner,target_start_date=excluded.target_start_date,release_reference=excluded.release_reference,scheduled_at=null,released_at=null,activated_at=null,updated_at=now() returning id into v_handoff;
  insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_w.institution_id,v_w.license_id,'workflow_ready_for_handoff','Approved institutional workflow is ready for contract-to-delivery handoff; license scope is unchanged until release/effective date');
  return v_handoff;
end; $$;

create or replace function public.zgirl_institution_release_handoff(p_session_token text,p_handoff_id uuid,p_release_reference text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_h public.zgirl_institution_delivery_handoffs%rowtype; v_w public.zgirl_institution_workflows%rowtype;
begin
  perform private.zgirl_credential_require_session(p_session_token);
  select * into v_h from public.zgirl_institution_delivery_handoffs where id=p_handoff_id for update; if v_h.id is null then raise exception 'handoff_not_found'; end if;
  if v_h.status<>'ready' then raise exception 'handoff_not_ready'; end if;
  if char_length(trim(coalesce(p_release_reference,'')))<3 then raise exception 'handoff_reference_required'; end if;
  select * into v_w from public.zgirl_institution_workflows where id=v_h.workflow_id; if v_w.id is null then raise exception 'workflow_not_found'; end if;
  if v_w.requested_effective_date is not null and v_w.requested_effective_date>current_date then
    update public.zgirl_institution_delivery_handoffs set status='scheduled',release_reference=trim(p_release_reference),scheduled_at=now(),updated_at=now() where id=p_handoff_id;
    update public.zgirl_institution_workflows set status='scheduled',updated_at=now() where id=v_h.workflow_id;
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_h.institution_id,v_h.license_id,'delivery_handoff_scheduled','Delivery handoff released for future activation on approved effective date');
  else
    perform private.zgirl_apply_institution_workflow_scope(v_h.workflow_id);
    update public.zgirl_institution_delivery_handoffs set status='released',release_reference=trim(p_release_reference),released_at=now(),activated_at=now(),updated_at=now() where id=p_handoff_id;
    update public.zgirl_institution_workflows set status='released',updated_at=now() where id=v_h.workflow_id;
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(v_h.institution_id,v_h.license_id,'delivery_handoff_released','Contract-to-delivery handoff released and approved license scope activated');
  end if;
  return true;
end; $$;

create or replace function private.zgirl_process_institution_workflow_automation()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare r record; h record; v_workflow uuid; v_created integer:=0; v_expired integer:=0; v_activated integer:=0;
begin
  update public.zgirl_institution_agreements set status='expired',updated_at=now() where status in ('approved','executed') and expires_at is not null and expires_at<current_date; get diagnostics v_expired = row_count;
  for r in select l.* from public.zgirl_institution_licenses l where l.status in ('active','conditional','lapsed') and l.expires_at<=current_date+90 and l.expires_at>=current_date-30 and not exists(select 1 from public.zgirl_institution_workflows w where w.license_id=l.id and w.workflow_type='renewal' and w.status not in ('released','rejected','cancelled')) loop
    insert into public.zgirl_institution_workflows(institution_id,license_id,workflow_code,workflow_type,status,requested_effective_date,requested_expires_at,requested_seat_limit,requested_site_limit,requested_trainer_limit,requested_profiles,requested_credential_levels,target_start_date,request_reference)
    values(r.institution_id,r.id,'ZG-WF-'||extract(year from current_date)::int||'-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10)),'renewal','evidence_build',r.expires_at+1,(r.expires_at+interval '1 year')::date,r.seat_limit,r.site_limit,r.trainer_limit,r.allowed_profiles,r.allowed_credential_levels,r.expires_at+1,'AUTO-90-DAY-RENEWAL') returning id into v_workflow;
    perform private.zgirl_seed_institution_workflow_gates(v_workflow); perform private.zgirl_refresh_institution_evidence(v_workflow);
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(r.institution_id,r.id,'renewal_workflow_auto_created','90-day renewal workflow and evidence packet created automatically'); v_created:=v_created+1;
  end loop;
  for h in select dh.id handoff_id,dh.workflow_id,dh.institution_id,dh.license_id from public.zgirl_institution_delivery_handoffs dh join public.zgirl_institution_workflows w on w.id=dh.workflow_id where dh.status='scheduled' and coalesce(w.requested_effective_date,current_date)<=current_date loop
    perform private.zgirl_apply_institution_workflow_scope(h.workflow_id);
    update public.zgirl_institution_delivery_handoffs set status='released',released_at=now(),activated_at=now(),updated_at=now() where id=h.handoff_id;
    update public.zgirl_institution_workflows set status='released',updated_at=now() where id=h.workflow_id;
    insert into public.zgirl_institution_license_events(institution_id,license_id,event_type,summary) values(h.institution_id,h.license_id,'delivery_handoff_activated','Scheduled institutional scope activated on approved effective date'); v_activated:=v_activated+1;
  end loop;
  return jsonb_build_object('renewalWorkflowsCreated',v_created,'agreementsExpired',v_expired,'scheduledHandoffsActivated',v_activated,'processedAt',now());
end; $$;

create or replace function public.zgirl_institution_workflow_dashboard(p_session_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
begin
  perform private.zgirl_credential_require_session(p_session_token); perform private.zgirl_process_institution_workflow_automation();
  return jsonb_build_object(
    'summary',jsonb_build_object('openWorkflows',(select count(*) from public.zgirl_institution_workflows where status not in ('released','rejected','cancelled')),'renewalsOpen',(select count(*) from public.zgirl_institution_workflows where workflow_type='renewal' and status not in ('released','rejected','cancelled')),'expansionsOpen',(select count(*) from public.zgirl_institution_workflows where workflow_type='expansion' and status not in ('released','rejected','cancelled')),'approvalQueue',(select count(*) from public.zgirl_institution_workflows where status='approvals_pending'),'agreementQueue',(select count(*) from public.zgirl_institution_workflows where status='agreement_pending'),'releaseReview',(select count(*) from public.zgirl_institution_workflows where status='release_review'),'handoffsReady',(select count(*) from public.zgirl_institution_delivery_handoffs where status='ready'),'handoffsScheduled',(select count(*) from public.zgirl_institution_delivery_handoffs where status='scheduled'),'executedAgreements',(select count(*) from public.zgirl_institution_agreements where status='executed')),
    'institutions',coalesce((select jsonb_agg(to_jsonb(x) order by x.name) from (select id,institution_code,name,institution_type,status from public.zgirl_institutions where status<>'closed' order by name limit 200)x),'[]'::jsonb),
    'licenses',coalesce((select jsonb_agg(to_jsonb(x) order by x.expires_at) from (select l.id,l.institution_id,i.name institution_name,l.license_code,l.license_type,l.status,l.renewal_status,l.effective_date,l.expires_at,l.seat_limit,l.site_limit,l.trainer_limit,l.allowed_profiles,l.allowed_credential_levels,l.agreement_status,l.agreement_reference from public.zgirl_institution_licenses l join public.zgirl_institutions i on i.id=l.institution_id where l.status<>'closed' order by l.expires_at limit 200)x),'[]'::jsonb),
    'agreements',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc) from (select a.id,a.institution_id,a.license_id,a.agreement_code,a.agreement_type,a.version,a.status,a.reference,a.effective_date,a.expires_at,a.executed_at,a.scope_summary,a.created_at,a.updated_at,i.name institution_name,l.license_code from public.zgirl_institution_agreements a join public.zgirl_institutions i on i.id=a.institution_id left join public.zgirl_institution_licenses l on l.id=a.license_id order by a.updated_at desc limit 250)x),'[]'::jsonb),
    'workflows',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc) from (select w.id,w.institution_id,w.license_id,w.agreement_id,w.workflow_code,w.workflow_type,w.status,w.requested_effective_date,w.requested_expires_at,w.requested_seat_limit,w.requested_site_limit,w.requested_trainer_limit,w.requested_profiles,w.requested_credential_levels,w.target_start_date,w.request_reference,w.created_at,w.updated_at,i.name institution_name,l.license_code,a.agreement_code,a.status agreement_status from public.zgirl_institution_workflows w join public.zgirl_institutions i on i.id=w.institution_id join public.zgirl_institution_licenses l on l.id=w.license_id left join public.zgirl_institution_agreements a on a.id=w.agreement_id order by w.updated_at desc limit 250)x),'[]'::jsonb),
    'evidencePackets',coalesce((select jsonb_agg(to_jsonb(x) order by x.generated_at desc) from (select * from public.zgirl_institution_evidence_packets order by generated_at desc limit 250)x),'[]'::jsonb),
    'approvalGates',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc) from (select * from public.zgirl_institution_approval_gates order by updated_at desc limit 1000)x),'[]'::jsonb),
    'handoffs',coalesce((select jsonb_agg(to_jsonb(x) order by x.updated_at desc) from (select h.id,h.workflow_id,h.institution_id,h.license_id,h.status,h.implementation_owner,h.target_start_date,h.release_reference,h.scheduled_at,h.released_at,h.activated_at,h.created_at,h.updated_at,i.name institution_name,l.license_code,w.workflow_code from public.zgirl_institution_delivery_handoffs h join public.zgirl_institutions i on i.id=h.institution_id join public.zgirl_institution_licenses l on l.id=h.license_id join public.zgirl_institution_workflows w on w.id=h.workflow_id order by h.updated_at desc limit 250)x),'[]'::jsonb),
    'events',coalesce((select jsonb_agg(to_jsonb(x) order by x.occurred_at desc) from (select id,institution_id,license_id,event_type,summary,occurred_at from public.zgirl_institution_license_events where event_type like 'workflow_%' or event_type like 'agreement_%' or event_type like 'delivery_%' or event_type='renewal_workflow_auto_created' order by occurred_at desc limit 150)x),'[]'::jsonb)
  );
end; $$;
