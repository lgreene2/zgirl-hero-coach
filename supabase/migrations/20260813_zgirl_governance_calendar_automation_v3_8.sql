-- Z-Girl v3.8 controlled governance-calendar automation.
-- Opens work windows, registers evidence metadata, and flags due reviews only.
create or replace function private.zgirl_process_governance_calendar_automation()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_s record; v_target date; v_window date; v_cycle uuid; v_created integer:=0; v_registered integer:=0; v_rows integer:=0; v_due integer:=0;
begin
 for v_s in select * from public.zgirl_governance_calendar_settings where enabled loop
  v_target:=make_date(extract(year from current_date)::integer,v_s.annual_review_month,v_s.annual_review_day);
  v_window:=v_target-v_s.annual_review_lead_days;
  if current_date>=v_window and not exists(select 1 from public.zgirl_governance_annual_review_cycles c where c.institution_id=v_s.institution_id and c.cycle_year=extract(year from current_date)::integer) then
   insert into public.zgirl_governance_annual_review_cycles(cycle_code,institution_id,cycle_year,status,period_start,period_end,window_open_date,due_date,owner_name,summary)
   values(private.zgirl_governance_code('ZG-GOV'),v_s.institution_id,extract(year from current_date)::integer,'open',make_date(extract(year from current_date)::integer-1,1,1),make_date(extract(year from current_date)::integer-1,12,31),v_window,v_target,v_s.governance_owner_name,'Annual governance review window opened automatically; human review, finalization, attestation, packaging, and closeout remain required.') returning id into v_cycle;
   insert into public.zgirl_governance_calendar_items(calendar_code,institution_id,item_type,status,title,window_open_date,due_date,owner_name,source_type,source_id,notes)
   values(private.zgirl_governance_code('ZG-CAL'),v_s.institution_id,'annual_review',case when current_date>=v_target then 'due' else 'scheduled' end,'Annual institutional governance review',v_window,v_target,v_s.governance_owner_name,'annual_review_cycle',v_cycle,'Automation opened the work window only; no evidence authority was created.');
   v_created:=v_created+1;
  end if;
  v_registered:=v_registered+private.zgirl_governance_register_evidence(v_s.institution_id);
 end loop;
 update public.zgirl_evidence_retention_records set status='review_due',updated_at=now() where status='active' and next_review_date<=current_date;
 get diagnostics v_due=row_count;
 insert into public.zgirl_governance_calendar_items(calendar_code,institution_id,item_type,status,title,window_open_date,due_date,owner_name,source_type,source_id,source_code,notes)
 select private.zgirl_governance_code('ZG-CAL'),r.institution_id,'retention_review',case when r.next_review_date<=current_date then 'due' else 'scheduled' end,'Evidence retention review',r.next_review_date-30,r.next_review_date,s.governance_owner_name,'retention_record',r.id,r.retention_code,'Administrative evidence review only; no automatic deletion or disposition.'
 from public.zgirl_evidence_retention_records r join public.zgirl_governance_calendar_settings s on s.institution_id=r.institution_id
 where r.status in ('active','review_due') and not exists(select 1 from public.zgirl_governance_calendar_items c where c.source_type='retention_record' and c.source_id=r.id and c.status<>'cancelled');
 get diagnostics v_rows=row_count;
 update public.zgirl_governance_calendar_items set status='due',updated_at=now() where status='scheduled' and due_date<=current_date;
 return jsonb_build_object('createdAnnualCycles',v_created,'registeredEvidence',v_registered,'retentionReviewsDue',v_due,'newCalendarItems',v_rows,'processedAt',now());
end; $$;
revoke all on function private.zgirl_process_governance_calendar_automation() from public,anon,authenticated;

do $$ begin
 if exists(select 1 from pg_extension where extname='pg_cron') and not exists(select 1 from cron.job where jobname='zgirl-governance-calendar-daily') then
  perform cron.schedule('zgirl-governance-calendar-daily','7 12 * * *','select private.zgirl_process_governance_calendar_automation();');
 end if;
end $$;
