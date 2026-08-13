-- Z-Girl v3.6 controlled access-review preparation automation.
-- Creates draft review packets only; never changes identity permissions.

create or replace function private.zgirl_process_tenant_access_review_automation()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_schedule record; v_id uuid; v_created integer:=0; v_code text; v_next date;
begin
 for v_schedule in select * from public.zgirl_tenant_access_review_schedules where enabled and next_review_date<=current_date order by next_review_date loop
  if not exists(select 1 from public.zgirl_tenant_access_reviews where institution_id=v_schedule.institution_id and status in ('draft','open','in_review')) then
   v_code:='ZG-AR-'||to_char(current_date,'YYYY')||'-'||upper(substr(encode(extensions.gen_random_bytes(6),'hex'),1,10));
   insert into public.zgirl_tenant_access_reviews(review_code,institution_id,review_type,status,period_start,period_end,due_at,summary)
   values(v_code,v_schedule.institution_id,v_schedule.cadence,'draft',case v_schedule.cadence when 'quarterly' then current_date-90 when 'semiannual' then current_date-182 else current_date-365 end,current_date,current_date+14,'Scheduled access recertification prepared automatically; human review required.') returning id into v_id;
   perform private.zgirl_access_review_snapshot(v_id); v_created:=v_created+1;
  end if;
  v_next:=case v_schedule.cadence when 'quarterly' then v_schedule.next_review_date+90 when 'semiannual' then v_schedule.next_review_date+182 else (v_schedule.next_review_date+interval '1 year')::date end;
  update public.zgirl_tenant_access_review_schedules set next_review_date=v_next,updated_at=now() where institution_id=v_schedule.institution_id;
 end loop;
 return jsonb_build_object('prepared',v_created,'processedAt',now());
end; $$;
revoke all on function private.zgirl_process_tenant_access_review_automation() from public,anon,authenticated;

do $$ begin
 if exists(select 1 from pg_extension where extname='pg_cron') and not exists(select 1 from cron.job where jobname='zgirl-tenant-access-review-daily') then
  perform cron.schedule('zgirl-tenant-access-review-daily','47 9 * * *','select private.zgirl_process_tenant_access_review_automation();');
 end if;
end $$;
