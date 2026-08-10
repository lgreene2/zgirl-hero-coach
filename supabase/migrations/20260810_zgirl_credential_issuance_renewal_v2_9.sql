-- Z-Girl v2.9 Credential Issuance & Renewal Automation
-- Applied to Greene managed-cloud staging as migration: zgirl_credential_issuance_renewal_v2_9
-- Adds credential notice scheduling, daily renewal/lapse automation, delivery queue controls, and v2.9 dashboard data.

create extension if not exists pg_cron;

create table if not exists public.zgirl_credential_notifications (
  id uuid primary key default gen_random_uuid(),
  credential_id uuid not null references public.zgirl_credentials(id) on delete cascade,
  notice_type text not null check (notice_type in ('issued','renewed','renewal_90','renewal_60','renewal_30','expired')),
  recipient_email text not null check (position('@' in recipient_email) > 1 and char_length(recipient_email) <= 254),
  recipient_name text not null check (char_length(recipient_name) between 2 and 120),
  subject text not null check (char_length(subject) between 3 and 200),
  body text not null check (char_length(body) between 10 and 5000),
  scheduled_for date not null,
  status text not null default 'scheduled' check (status in ('scheduled','queued','prepared','sent','dismissed')),
  delivery_reference text check (delivery_reference is null or char_length(delivery_reference) <= 240),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (credential_id, notice_type, scheduled_for)
);
create index if not exists zgirl_credential_notifications_queue_idx on public.zgirl_credential_notifications(status, scheduled_for);
create index if not exists zgirl_credential_notifications_credential_idx on public.zgirl_credential_notifications(credential_id, created_at desc);
alter table public.zgirl_credential_notifications enable row level security;
revoke all on public.zgirl_credential_notifications from anon, authenticated;

create or replace function private.zgirl_queue_credential_notice(p_credential_id uuid,p_notice_type text,p_scheduled_for date,p_status text default 'scheduled')
returns uuid language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_credential public.zgirl_credentials%rowtype; v_candidate public.zgirl_credential_candidates%rowtype; v_subject text; v_body text; v_id uuid; v_record_url text; v_days text;
begin
  if p_notice_type not in ('issued','renewed','renewal_90','renewal_60','renewal_30','expired') then raise exception 'invalid_notice_type'; end if;
  if p_status not in ('scheduled','queued') then raise exception 'invalid_notice_status'; end if;
  select * into v_credential from public.zgirl_credentials where id=p_credential_id; if v_credential.id is null then raise exception 'credential_not_found'; end if;
  select * into v_candidate from public.zgirl_credential_candidates where id=v_credential.candidate_id; if v_candidate.id is null then raise exception 'candidate_not_found'; end if;
  v_record_url:='https://zgirlinitiative.org/credentials/record/'||v_credential.credential_id;
  v_days:=case p_notice_type when 'renewal_90' then '90' when 'renewal_60' then '60' when 'renewal_30' then '30' else null end;
  if p_notice_type='issued' then
    v_subject:='Your Z-Girl program authorization is ready';
    v_body:='Hello '||v_candidate.full_name||E',\n\nYour Z-Girl program authorization has been issued.\n\nCredential ID: '||v_credential.credential_id||E'\nExpiration: '||v_credential.expires_at::text||E'\nAuthorization record: '||v_record_url||E'\n\nThis is a Z-Girl program authorization. It is not professional licensure, academic accreditation, government certification, or clinical qualification.\n\nZ-Girl Initiative';
  elsif p_notice_type='renewed' then
    v_subject:='Your Z-Girl program authorization has been renewed';
    v_body:='Hello '||v_candidate.full_name||E',\n\nYour Z-Girl program authorization has been renewed.\n\nCredential ID: '||v_credential.credential_id||E'\nNew expiration: '||v_credential.expires_at::text||E'\nAuthorization record: '||v_record_url||E'\n\nPlease continue to follow the current Z-Girl implementation, privacy, safety, scope, and version-control requirements.\n\nZ-Girl Initiative';
  elsif p_notice_type in ('renewal_90','renewal_60','renewal_30') then
    v_subject:='Z-Girl authorization renewal — '||v_days||' day notice';
    v_body:='Hello '||v_candidate.full_name||E',\n\nYour Z-Girl program authorization is scheduled to expire in approximately '||v_days||E' days.\n\nCredential ID: '||v_credential.credential_id||E'\nExpiration: '||v_credential.expires_at::text||E'\nCurrent authorization record: '||v_record_url||E'\n\nPlease begin or complete the applicable renewal requirements before the expiration date. Authorization does not continue automatically after expiration.\n\nZ-Girl Initiative';
  else
    v_subject:='Z-Girl program authorization has lapsed';
    v_body:='Hello '||v_candidate.full_name||E',\n\nYour Z-Girl program authorization has reached its expiration date and is now recorded as lapsed.\n\nCredential ID: '||v_credential.credential_id||E'\nExpiration: '||v_credential.expires_at::text||E'\nAuthorization record: '||v_record_url||E'\n\nDo not represent yourself as currently authorized to deliver Z-Girl independently unless and until renewal or reactivation is approved.\n\nZ-Girl Initiative';
  end if;
  insert into public.zgirl_credential_notifications(credential_id,notice_type,recipient_email,recipient_name,subject,body,scheduled_for,status)
  values(p_credential_id,p_notice_type,lower(v_candidate.email),v_candidate.full_name,v_subject,v_body,p_scheduled_for,p_status)
  on conflict(credential_id,notice_type,scheduled_for) do nothing returning id into v_id;
  if v_id is null then select id into v_id from public.zgirl_credential_notifications where credential_id=p_credential_id and notice_type=p_notice_type and scheduled_for=p_scheduled_for; end if;
  return v_id;
end; $$;
revoke all on function private.zgirl_queue_credential_notice(uuid,text,date,text) from public, anon, authenticated;

create or replace function private.zgirl_schedule_credential_renewal_notices(p_credential_id uuid)
returns void language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_expiry date; v_date date;
begin
  select expires_at into v_expiry from public.zgirl_credentials where id=p_credential_id; if v_expiry is null then raise exception 'credential_not_found'; end if;
  update public.zgirl_credential_notifications set status='dismissed',updated_at=now() where credential_id=p_credential_id and notice_type in ('renewal_90','renewal_60','renewal_30') and status in ('scheduled','queued','prepared');
  v_date:=v_expiry-90; perform private.zgirl_queue_credential_notice(p_credential_id,'renewal_90',v_date,case when v_date<=current_date then 'queued' else 'scheduled' end);
  v_date:=v_expiry-60; perform private.zgirl_queue_credential_notice(p_credential_id,'renewal_60',v_date,case when v_date<=current_date then 'queued' else 'scheduled' end);
  v_date:=v_expiry-30; perform private.zgirl_queue_credential_notice(p_credential_id,'renewal_30',v_date,case when v_date<=current_date then 'queued' else 'scheduled' end);
end; $$;
revoke all on function private.zgirl_schedule_credential_renewal_notices(uuid) from public, anon, authenticated;

create or replace function private.zgirl_process_credential_automation()
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_promoted integer:=0; v_lapsed integer:=0; v_credential record;
begin
  with promoted as (update public.zgirl_credential_notifications set status='queued',updated_at=now() where status='scheduled' and scheduled_for<=current_date returning id) select count(*) into v_promoted from promoted;
  update public.zgirl_credential_renewals r set status='in_progress',updated_at=now() from public.zgirl_credentials c where r.credential_id=c.id and r.status='scheduled' and c.status in ('active','conditional') and c.expires_at<=current_date+90;
  for v_credential in update public.zgirl_credentials set status='lapsed',status_reason_category='renewal',updated_at=now() where status in ('active','conditional') and expires_at<current_date returning id,credential_id,expires_at loop
    v_lapsed:=v_lapsed+1;
    update public.zgirl_credential_renewals set status='lapsed',updated_at=now() where credential_id=v_credential.id and status in ('scheduled','in_progress');
    perform private.zgirl_queue_credential_notice(v_credential.id,'expired',current_date,'queued');
    insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values('credential_status_changed','credential',v_credential.id::text,'Credential automatically lapsed after expiration: '||v_credential.credential_id);
  end loop;
  return jsonb_build_object('queuedNotices',v_promoted,'lapsedCredentials',v_lapsed,'processedAt',now());
end; $$;
revoke all on function private.zgirl_process_credential_automation() from public, anon, authenticated;

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
  insert into public.zgirl_credential_renewals(credential_id,renewal_due_at,status) values(v_id,greatest(current_date,p_expires_at-90),'scheduled');
  update public.zgirl_credential_candidates set status='authorized',updated_at=now() where id=p_candidate_id;
  perform private.zgirl_queue_credential_notice(v_id,'issued',current_date,'queued'); perform private.zgirl_schedule_credential_renewal_notices(v_id);
  insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values('credential_issued','credential',v_id::text,'Z-Girl program credential issued: '||v_credential_id);
  return jsonb_build_object('id',v_id,'credentialId',v_credential_id,'expiresAt',p_expires_at,'recordUrl','https://zgirlinitiative.org/credentials/record/'||v_credential_id);
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
  insert into public.zgirl_credential_renewals(credential_id,renewal_due_at,status) values(p_credential_id,greatest(current_date,p_new_expires_at-90),'scheduled');
  perform private.zgirl_queue_credential_notice(p_credential_id,'renewed',current_date,'queued'); perform private.zgirl_schedule_credential_renewal_notices(p_credential_id);
  insert into public.zgirl_credential_audit_events(event_type,entity_type,entity_id,summary) values('credential_renewed','credential',p_credential_id::text,'Credential renewed: '||v_code); return true;
end; $$;

create or replace function public.zgirl_credential_mark_notification(p_session_token text,p_notification_id uuid,p_status text,p_delivery_reference text default null)
returns boolean language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
declare v_id uuid;
begin
  perform private.zgirl_credential_require_session(p_session_token); if p_status not in ('prepared','sent','dismissed') then raise exception 'invalid_notice_status'; end if;
  update public.zgirl_credential_notifications set status=p_status,delivery_reference=nullif(trim(p_delivery_reference),''),sent_at=case when p_status='sent' then now() else sent_at end,updated_at=now() where id=p_notification_id returning id into v_id;
  if v_id is null then raise exception 'notification_not_found'; end if; return true;
end; $$;

create or replace function public.zgirl_credential_run_automation(p_session_token text)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, private
as $$ begin perform private.zgirl_credential_require_session(p_session_token); return private.zgirl_process_credential_automation(); end; $$;

create or replace function public.zgirl_credential_dashboard(p_session_token text)
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public, private
as $$
begin
  perform private.zgirl_credential_require_session(p_session_token); perform private.zgirl_process_credential_automation();
  return jsonb_build_object(
    'summary',jsonb_build_object('candidates',(select count(*) from public.zgirl_credential_candidates),'activeCredentials',(select count(*) from public.zgirl_credentials where status in ('active','conditional') and expires_at>=current_date),'renewalsDue60',(select count(*) from public.zgirl_credentials where status in ('active','conditional') and expires_at between current_date and current_date+60),'renewalsDue90',(select count(*) from public.zgirl_credentials where status in ('active','conditional') and expires_at between current_date and current_date+90),'queuedNotices',(select count(*) from public.zgirl_credential_notifications where status in ('queued','prepared')),'suspendedOrRevoked',(select count(*) from public.zgirl_credentials where status in ('suspended','revoked'))),
    'candidates',coalesce((select jsonb_agg(to_jsonb(c) order by c.updated_at desc) from (select id,full_name,email,organization,pathway,status,training_version,created_at,updated_at from public.zgirl_credential_candidates order by updated_at desc limit 200)c),'[]'::jsonb),
    'credentials',coalesce((select jsonb_agg(to_jsonb(c) order by c.updated_at desc) from (select id,credential_id,candidate_id,holder_name,organization,credential_level,scope,training_version,status,status_reason_category,issue_date,expires_at,public_verification_enabled,created_at,updated_at from public.zgirl_credentials order by updated_at desc limit 200)c),'[]'::jsonb),
    'notifications',coalesce((select jsonb_agg(to_jsonb(n) order by n.scheduled_for asc,n.created_at desc) from (select n.id,n.credential_id,n.notice_type,n.recipient_email,n.recipient_name,n.subject,n.body,n.scheduled_for,n.status,n.delivery_reference,n.sent_at,n.created_at,n.updated_at,c.credential_id as credential_code,c.holder_name,c.expires_at from public.zgirl_credential_notifications n join public.zgirl_credentials c on c.id=n.credential_id order by case n.status when 'queued' then 0 when 'prepared' then 1 when 'scheduled' then 2 when 'sent' then 3 else 4 end,n.scheduled_for asc,n.created_at desc limit 200)n),'[]'::jsonb),
    'events',coalesce((select jsonb_agg(to_jsonb(e) order by e.occurred_at desc) from (select id,event_type,entity_type,entity_id,summary,occurred_at from public.zgirl_credential_audit_events order by occurred_at desc limit 50)e),'[]'::jsonb));
end; $$;

revoke all on function public.zgirl_credential_mark_notification(text,uuid,text,text) from public; revoke all on function public.zgirl_credential_run_automation(text) from public;
grant execute on function public.zgirl_credential_mark_notification(text,uuid,text,text) to anon, authenticated; grant execute on function public.zgirl_credential_run_automation(text) to anon, authenticated;
revoke all on function public.zgirl_credential_issue(text,uuid,text,text,date) from public; revoke all on function public.zgirl_credential_renew(text,uuid,date) from public; revoke all on function public.zgirl_credential_dashboard(text) from public;
grant execute on function public.zgirl_credential_issue(text,uuid,text,text,date) to anon, authenticated; grant execute on function public.zgirl_credential_renew(text,uuid,date) to anon, authenticated; grant execute on function public.zgirl_credential_dashboard(text) to anon, authenticated;

do $$ declare v_job record; begin
  for v_job in select jobid from cron.job where jobname='zgirl-credential-renewal-daily' loop perform cron.unschedule(v_job.jobid); end loop;
  perform cron.schedule('zgirl-credential-renewal-daily','17 10 * * *',$cron$select private.zgirl_process_credential_automation();$cron$);
end $$;
