-- Z-Girl v3.1 workflow transition hardening
-- Synchronize linked agreement state, provide a friendly duplicate-workflow guard, and activate scheduled scope before the license-lapse cron.

create or replace function private.zgirl_sync_workflows_from_agreement()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare r record; v_pending integer;
begin
  for r in
    select id from public.zgirl_institution_workflows
    where agreement_id=new.id and status in ('draft','evidence_build','approvals_pending','agreement_pending','release_review')
  loop
    select count(*) into v_pending from public.zgirl_institution_approval_gates where workflow_id=r.id and required and status not in ('approved','waived');
    update public.zgirl_institution_workflows
    set status=case when v_pending=0 and new.status='executed' then 'release_review' when v_pending=0 then 'agreement_pending' else 'approvals_pending' end,updated_at=now()
    where id=r.id;
  end loop;
  return new;
end; $$;

drop trigger if exists zgirl_institution_agreement_workflow_sync on public.zgirl_institution_agreements;
create trigger zgirl_institution_agreement_workflow_sync
after insert or update of status,reference,effective_date,expires_at on public.zgirl_institution_agreements
for each row execute function private.zgirl_sync_workflows_from_agreement();

create or replace function private.zgirl_guard_open_institution_workflow()
returns trigger language plpgsql security definer set search_path=pg_catalog,public,private as $$
begin
  if exists(
    select 1 from public.zgirl_institution_workflows w
    where w.license_id=new.license_id and w.workflow_type=new.workflow_type
      and w.status not in ('released','rejected','cancelled')
      and (new.id is null or w.id<>new.id)
  ) then
    raise exception 'workflow_already_open';
  end if;
  return new;
end; $$;

drop trigger if exists zgirl_institution_workflow_open_guard on public.zgirl_institution_workflows;
create trigger zgirl_institution_workflow_open_guard
before insert on public.zgirl_institution_workflows
for each row execute function private.zgirl_guard_open_institution_workflow();

do $$
begin
  if exists(select 1 from pg_extension where extname='pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname='zgirl-institution-workflow-daily';
    perform cron.schedule('zgirl-institution-workflow-daily','7 10 * * *','select private.zgirl_process_institution_workflow_automation();');
  end if;
end $$;
