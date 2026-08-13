-- Z-Girl v3.4 Executive Briefing & Renewal Intelligence Automation
-- Institutional executive/business intelligence only. No participant reflections, youth case data, clinical records, diagnoses, counseling notes, safeguarding narratives, clergy records, sports-medicine records, or credential assessment detail.

create table if not exists public.zgirl_executive_briefing_settings (
  id text primary key default 'default' check (id='default'),
  weekly_enabled boolean not null default true,
  monthly_enabled boolean not null default true,
  exception_enabled boolean not null default true,
  default_preparer text check (default_preparer is null or char_length(default_preparer)<=120),
  default_recipient_name text check (default_recipient_name is null or char_length(default_recipient_name)<=160),
  default_recipient_email text check (default_recipient_email is null or char_length(default_recipient_email)<=254),
  updated_at timestamptz not null default now()
);
insert into public.zgirl_executive_briefing_settings(id) values('default') on conflict(id) do nothing;

create table if not exists public.zgirl_executive_briefings (
  id uuid primary key default gen_random_uuid(),
  briefing_code text not null unique,
  briefing_type text not null check (briefing_type in ('weekly','monthly','exception','renewal','board','manual')),
  generation_mode text not null check (generation_mode in ('scheduled','manual')),
  period_key text unique,
  title text not null check (char_length(title) between 2 and 220),
  period_start date,
  period_end date,
  generated_by text check (generated_by is null or char_length(generated_by)<=120),
  status text not null default 'prepared' check (status in ('prepared','reviewed','archived')),
  briefing_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists zgirl_executive_briefings_created_idx on public.zgirl_executive_briefings(created_at desc);
create index if not exists zgirl_executive_briefings_type_idx on public.zgirl_executive_briefings(briefing_type,status,created_at desc);

create table if not exists public.zgirl_executive_briefing_deliveries (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.zgirl_executive_briefings(id) on delete cascade,
  delivery_type text not null default 'email' check (delivery_type in ('email','internal')),
  recipient_name text check (recipient_name is null or char_length(recipient_name)<=160),
  recipient_email text check (recipient_email is null or char_length(recipient_email)<=254),
  subject text not null check (char_length(subject) between 2 and 240),
  body text not null check (char_length(body) between 2 and 5000),
  status text not null default 'prepared' check (status in ('prepared','sent','dismissed')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists zgirl_executive_briefing_deliveries_status_idx on public.zgirl_executive_briefing_deliveries(status,created_at desc);

alter table public.zgirl_executive_briefing_settings enable row level security;
alter table public.zgirl_executive_briefings enable row level security;
alter table public.zgirl_executive_briefing_deliveries enable row level security;
revoke all on public.zgirl_executive_briefing_settings,public.zgirl_executive_briefings,public.zgirl_executive_briefing_deliveries from anon,authenticated;

create or replace function private.zgirl_build_executive_intelligence()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_summary jsonb;v_renewals jsonb;v_expansions jsonb;v_exceptions jsonb;v_reminders jsonb;
begin
 select jsonb_build_object('institutions',count(*),'activeInstitutions',count(*) filter(where status='active'),'pilots',count(*) filter(where status='pilot'),'prospects',count(*) filter(where status='prospect')) into v_summary from public.zgirl_institutions;
 v_summary:=v_summary||(select jsonb_build_object('activeLicenses',count(*) filter(where status in ('active','conditional')),'licensesDue30',count(*) filter(where status not in ('closed','lapsed') and expires_at between current_date and current_date+30),'licensesDue60',count(*) filter(where status not in ('closed','lapsed') and expires_at between current_date and current_date+60),'licensesDue90',count(*) filter(where status not in ('closed','lapsed') and expires_at between current_date and current_date+90),'seatCapacity',coalesce(sum(seat_limit) filter(where status not in ('closed','lapsed')),0),'trainerCapacity',coalesce(sum(trainer_limit) filter(where status not in ('closed','lapsed')),0)) from public.zgirl_institution_licenses);
 v_summary:=v_summary||(select jsonb_build_object('allocatedSeats',count(*) filter(where status<>'released'),'trainerSeats',count(*) filter(where status<>'released' and seat_role='institutional_trainer')) from public.zgirl_institution_seat_allocations);
 v_summary:=v_summary||(select jsonb_build_object('activeCredentials',count(*) filter(where status='active'),'credentialsDue90',count(*) filter(where status in ('active','conditional') and expires_at between current_date and current_date+90),'institutionalTrainers',count(*) filter(where credential_level='institutional_trainer' and status in ('active','conditional'))) from public.zgirl_credentials);
 v_summary:=v_summary||(select jsonb_build_object('openWorkflows',count(*) filter(where status not in ('released','rejected','cancelled')),'approvalsPending',count(*) filter(where status in ('approvals_pending','agreement_pending','release_review'))) from public.zgirl_institution_workflows);
 v_summary:=v_summary||(select jsonb_build_object('openOpportunities',count(*) filter(where stage not in ('converted','closed_lost')),'pipelineValueCents',coalesce(sum(estimated_value_cents) filter(where stage not in ('converted','closed_lost')),0),'weightedPipelineValueCents',coalesce(sum((coalesce(estimated_value_cents,0)*probability_percent/100.0)::bigint) filter(where stage not in ('converted','closed_lost')),0),'expansionOpportunities',count(*) filter(where stage not in ('converted','closed_lost') and contract_path in ('expansion','train_the_trainer_addendum'))) from public.zgirl_partner_opportunities);
 v_summary:=v_summary||(select jsonb_build_object('riskInstitutions',count(*) filter(where health_status in ('risk','critical')),'watchInstitutions',count(*) filter(where health_status='watch'),'expansionReady',count(*) filter(where expansion_readiness='ready')) from public.zgirl_portfolio_reviews);

 select coalesce(jsonb_agg(to_jsonb(x) order by x.days_remaining nulls last,x.institution_name),'[]'::jsonb) into v_renewals from (
  select i.id institution_id,i.name institution_name,l.id license_id,l.license_code,l.license_type,l.status license_status,l.renewal_status,l.expires_at,(l.expires_at-current_date) days_remaining,
   coalesce(r.health_status,'unrated') health_status,r.executive_owner,r.next_executive_action,r.next_review_date,
   coalesce(a.seats_used,0) seats_used,l.seat_limit,coalesce(c.credentials_due90,0) credentials_due90,coalesce(w.renewal_workflows,0) renewal_workflows,
   case when l.expires_at<=current_date+30 then 'critical' when l.expires_at<=current_date+60 and coalesce(w.renewal_workflows,0)=0 then 'risk' when l.expires_at<=current_date+90 or coalesce(c.credentials_due90,0)>0 then 'watch' else 'planned' end renewal_risk,
   case when l.expires_at<=current_date+30 then 'Complete renewal decision and governed workflow now.' when l.expires_at<=current_date+60 and coalesce(w.renewal_workflows,0)=0 then 'Open renewal workflow and confirm executive owner.' when coalesce(c.credentials_due90,0)>0 then 'Coordinate credential renewals with institutional term planning.' else 'Maintain renewal planning cadence.' end recommended_action
  from public.zgirl_institution_licenses l join public.zgirl_institutions i on i.id=l.institution_id
  left join public.zgirl_portfolio_reviews r on r.institution_id=i.id
  left join lateral(select count(*) seats_used from public.zgirl_institution_seat_allocations s where s.license_id=l.id and s.status<>'released') a on true
  left join lateral(select count(distinct z.id) credentials_due90 from public.zgirl_institution_seat_allocations s join public.zgirl_credentials z on z.id=s.credential_id where s.license_id=l.id and s.status<>'released' and z.status in ('active','conditional') and z.expires_at between current_date and current_date+90) c on true
  left join lateral(select count(*) renewal_workflows from public.zgirl_institution_workflows q where q.license_id=l.id and q.workflow_type='renewal' and q.status not in ('released','rejected','cancelled')) w on true
  where l.status not in ('closed','lapsed') and l.expires_at<=current_date+180
 ) x;

 select coalesce(jsonb_agg(to_jsonb(x) order by x.readiness_rank,x.institution_name),'[]'::jsonb) into v_expansions from (
  select i.id institution_id,i.name institution_name,l.license_code,l.status license_status,coalesce(r.health_status,'unrated') health_status,coalesce(r.expansion_readiness,'not_assessed') expansion_readiness,r.executive_owner,
   coalesce(a.seats_used,0) seats_used,l.seat_limit,case when l.seat_limit>0 then round((coalesce(a.seats_used,0)::numeric/l.seat_limit)*100)::int else 0 end seat_utilization_percent,
   coalesce(o.expansion_opportunities,0) open_expansion_opportunities,
   array_remove(array[case when r.expansion_readiness='ready' then 'executive_ready' end,case when l.seat_limit>0 and coalesce(a.seats_used,0)::numeric/l.seat_limit>=.75 then 'capacity_pressure' end,case when coalesce(o.expansion_opportunities,0)>0 then 'open_expansion_opportunity' end,case when l.trainer_limit>0 and coalesce(a.trainers_used,0)>=l.trainer_limit then 'trainer_capacity_full' end],null) signals,
   case when r.expansion_readiness='ready' and coalesce(r.health_status,'unrated') in ('green','watch') then 0 when coalesce(o.expansion_opportunities,0)>0 then 1 when l.seat_limit>0 and coalesce(a.seats_used,0)::numeric/l.seat_limit>=.75 then 2 else 3 end readiness_rank
  from public.zgirl_institution_licenses l join public.zgirl_institutions i on i.id=l.institution_id left join public.zgirl_portfolio_reviews r on r.institution_id=i.id
  left join lateral(select count(*) filter(where status<>'released') seats_used,count(*) filter(where status<>'released' and seat_role='institutional_trainer') trainers_used from public.zgirl_institution_seat_allocations s where s.license_id=l.id) a on true
  left join lateral(select count(*) expansion_opportunities from public.zgirl_partner_opportunities p where p.institution_id=i.id and p.stage not in ('converted','closed_lost') and p.contract_path in ('expansion','train_the_trainer_addendum')) o on true
  where l.status in ('active','conditional') and (coalesce(r.expansion_readiness,'not_assessed')='ready' or coalesce(o.expansion_opportunities,0)>0 or (l.seat_limit>0 and coalesce(a.seats_used,0)::numeric/l.seat_limit>=.75))
 ) x;

 select coalesce(jsonb_agg(item order by severity_rank,due_date nulls last,institution_name),'[]'::jsonb) into v_exceptions from (
  select 0 severity_rank,l.expires_at due_date,i.name institution_name,jsonb_build_object('severity','critical','type','license_due_30','institutionId',i.id,'institutionName',i.name,'dueDate',l.expires_at,'owner',r.executive_owner,'detail',l.license_code||' expires within 30 days.') item from public.zgirl_institution_licenses l join public.zgirl_institutions i on i.id=l.institution_id left join public.zgirl_portfolio_reviews r on r.institution_id=i.id where l.status not in ('closed','lapsed') and l.expires_at between current_date and current_date+30
  union all select 1,l.expires_at,i.name,jsonb_build_object('severity','risk','type','renewal_workflow_missing','institutionId',i.id,'institutionName',i.name,'dueDate',l.expires_at,'owner',r.executive_owner,'detail',l.license_code||' expires within 90 days with no open renewal workflow.') from public.zgirl_institution_licenses l join public.zgirl_institutions i on i.id=l.institution_id left join public.zgirl_portfolio_reviews r on r.institution_id=i.id where l.status not in ('closed','lapsed') and l.expires_at between current_date and current_date+90 and not exists(select 1 from public.zgirl_institution_workflows w where w.license_id=l.id and w.workflow_type='renewal' and w.status not in ('released','rejected','cancelled'))
  union all select 2,r.next_review_date,i.name,jsonb_build_object('severity','risk','type','executive_review_overdue','institutionId',i.id,'institutionName',i.name,'dueDate',r.next_review_date,'owner',r.executive_owner,'detail',coalesce(r.next_executive_action,'Executive portfolio review is overdue.')) from public.zgirl_portfolio_reviews r join public.zgirl_institutions i on i.id=r.institution_id where r.next_review_date<current_date
  union all select 3,p.target_decision_date,i.name,jsonb_build_object('severity','watch','type','pipeline_decision_overdue','institutionId',i.id,'institutionName',i.name,'dueDate',p.target_decision_date,'owner',p.owner_name,'detail',p.opportunity_code||' target decision date has passed.') from public.zgirl_partner_opportunities p join public.zgirl_institutions i on i.id=p.institution_id where p.stage not in ('converted','closed_lost') and p.target_decision_date<current_date
  union all select 4,null::date,i.name,jsonb_build_object('severity','watch','type','seat_capacity_pressure','institutionId',i.id,'institutionName',i.name,'dueDate',null,'owner',r.executive_owner,'detail',l.license_code||' is at or above 85% seat utilization.') from public.zgirl_institution_licenses l join public.zgirl_institutions i on i.id=l.institution_id left join public.zgirl_portfolio_reviews r on r.institution_id=i.id where l.status in ('active','conditional') and l.seat_limit>0 and (select count(*) from public.zgirl_institution_seat_allocations a where a.license_id=l.id and a.status<>'released')::numeric/l.seat_limit>=.85
 ) q;

 select coalesce(jsonb_agg(to_jsonb(x) order by x.due_date nulls last,x.institution_name),'[]'::jsonb) into v_reminders from (
  select i.id institution_id,i.name institution_name,r.executive_owner owner,r.next_review_date due_date,coalesce(r.next_executive_action,'Complete executive portfolio review.') action,'portfolio_review' reminder_type from public.zgirl_portfolio_reviews r join public.zgirl_institutions i on i.id=r.institution_id where r.executive_owner is not null and r.next_review_date is not null and r.next_review_date<=current_date+14
  union all select i.id,i.name,r.executive_owner,l.expires_at,case when exists(select 1 from public.zgirl_institution_workflows w where w.license_id=l.id and w.workflow_type='renewal' and w.status not in ('released','rejected','cancelled')) then 'Advance institutional renewal workflow.' else 'Open institutional renewal workflow.' end,'license_renewal' from public.zgirl_institution_licenses l join public.zgirl_institutions i on i.id=l.institution_id join public.zgirl_portfolio_reviews r on r.institution_id=i.id where r.executive_owner is not null and l.status not in ('closed','lapsed') and l.expires_at<=current_date+90
 ) x;
 return jsonb_build_object('generatedAt',now(),'summary',v_summary,'renewalForecast',v_renewals,'expansionForecast',v_expansions,'exceptions',v_exceptions,'ownerReminders',v_reminders);
end; $$;

create or replace function private.zgirl_generate_executive_brief(p_briefing_type text,p_generation_mode text,p_generated_by text,p_title text,p_period_key text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_id uuid;v_code text;v_live jsonb;v_settings public.zgirl_executive_briefing_settings%rowtype;v_subject text;v_body text;
begin
 if p_briefing_type not in ('weekly','monthly','exception','renewal','board','manual') then raise exception 'invalid_executive_briefing_type'; end if;
 if p_generation_mode not in ('scheduled','manual') then raise exception 'invalid_executive_briefing_mode'; end if;
 if char_length(trim(coalesce(p_title,'')))<2 or char_length(trim(p_title))>220 then raise exception 'invalid_executive_briefing'; end if;
 v_live:=private.zgirl_build_executive_intelligence();v_code:='ZG-BRIEF-'||extract(year from current_date)::int||'-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10));
 insert into public.zgirl_executive_briefings(briefing_code,briefing_type,generation_mode,period_key,title,period_start,period_end,generated_by,briefing_data) values(v_code,p_briefing_type,p_generation_mode,p_period_key,trim(p_title),case when p_briefing_type='weekly' then current_date-((extract(isodow from current_date)::int)-1) when p_briefing_type='monthly' then date_trunc('month',current_date)::date else current_date end,current_date,nullif(trim(p_generated_by),''),v_live) returning id into v_id;
 select * into v_settings from public.zgirl_executive_briefing_settings where id='default';
 if nullif(trim(coalesce(v_settings.default_recipient_email,'')),'') is not null then
  v_subject:='Z-Girl Executive Brief — '||trim(p_title);
  v_body:='A new Z-Girl institutional executive brief is prepared.'||E'\n\n'||'Brief: '||trim(p_title)||E'\n'||'Generated: '||to_char(now(),'YYYY-MM-DD HH24:MI UTC')||E'\n'||'Institutions: '||coalesce(v_live#>>'{summary,institutions}','0')||E'\n'||'Licenses due within 90 days: '||coalesce(v_live#>>'{summary,licensesDue90}','0')||E'\n'||'Credential capacity due within 90 days: '||coalesce(v_live#>>'{summary,credentialsDue90}','0')||E'\n'||'Open opportunities: '||coalesce(v_live#>>'{summary,openOpportunities}','0')||E'\n'||'Exceptions: '||jsonb_array_length(coalesce(v_live->'exceptions','[]'::jsonb))||E'\n\n'||'Review the secure Z-Girl Executive Briefing Console. This message contains administrative summary information only and does not include participant reflections or case data.';
  insert into public.zgirl_executive_briefing_deliveries(briefing_id,recipient_name,recipient_email,subject,body) values(v_id,v_settings.default_recipient_name,v_settings.default_recipient_email,v_subject,v_body);
 end if;
 return v_id;
end; $$;

create or replace function private.zgirl_process_executive_briefing_automation()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions,cron as $$
declare v_settings public.zgirl_executive_briefing_settings%rowtype;v_live jsonb;v_week text;v_month text;v_day text;v_generated int:=0;
begin
 select * into v_settings from public.zgirl_executive_briefing_settings where id='default';
 if not exists(select 1 from public.zgirl_institutions) and not exists(select 1 from public.zgirl_partner_opportunities) and not exists(select 1 from public.zgirl_institution_licenses) then return jsonb_build_object('processedAt',now(),'generated',0,'noData',true); end if;
 v_live:=private.zgirl_build_executive_intelligence();v_week:='weekly:'||to_char(current_date,'IYYY-IW');v_month:='monthly:'||to_char(current_date,'YYYY-MM');v_day:='exception:'||to_char(current_date,'YYYY-MM-DD');
 if v_settings.weekly_enabled and extract(isodow from current_date)=1 and not exists(select 1 from public.zgirl_executive_briefings where period_key=v_week) then perform private.zgirl_generate_executive_brief('weekly','scheduled',coalesce(v_settings.default_preparer,'Z-Girl Executive Automation'),'Weekly Institutional Executive Brief',v_week);v_generated:=v_generated+1;end if;
 if v_settings.monthly_enabled and extract(day from current_date)=1 and not exists(select 1 from public.zgirl_executive_briefings where period_key=v_month) then perform private.zgirl_generate_executive_brief('monthly','scheduled',coalesce(v_settings.default_preparer,'Z-Girl Executive Automation'),'Monthly Institutional Portfolio Brief',v_month);v_generated:=v_generated+1;end if;
 if v_settings.exception_enabled and jsonb_array_length(coalesce(v_live->'exceptions','[]'::jsonb))>0 and not exists(select 1 from public.zgirl_executive_briefings where period_key=v_day) then perform private.zgirl_generate_executive_brief('exception','scheduled',coalesce(v_settings.default_preparer,'Z-Girl Executive Automation'),'Executive Exception Brief',v_day);v_generated:=v_generated+1;end if;
 return jsonb_build_object('processedAt',now(),'generated',v_generated,'noData',false,'exceptions',jsonb_array_length(coalesce(v_live->'exceptions','[]'::jsonb)));
end; $$;

create or replace function public.zgirl_executive_briefing_dashboard(p_session_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_settings jsonb;v_briefs jsonb;v_deliveries jsonb;v_live jsonb;
begin
 perform private.zgirl_credential_require_session(p_session_token);v_live:=private.zgirl_build_executive_intelligence();
 select to_jsonb(s) into v_settings from(select weekly_enabled "weeklyEnabled",monthly_enabled "monthlyEnabled",exception_enabled "exceptionEnabled",default_preparer "defaultPreparer",default_recipient_name "defaultRecipientName",default_recipient_email "defaultRecipientEmail",updated_at "updatedAt" from public.zgirl_executive_briefing_settings where id='default')s;
 select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]'::jsonb) into v_briefs from(select id,briefing_code "briefingCode",briefing_type "briefingType",generation_mode "generationMode",period_key "periodKey",title,period_start "periodStart",period_end "periodEnd",generated_by "generatedBy",status,created_at "createdAt" from public.zgirl_executive_briefings order by created_at desc limit 50)x;
 select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]'::jsonb) into v_deliveries from(select d.id,d.briefing_id "briefingId",b.briefing_code "briefingCode",b.title briefing_title,d.recipient_name "recipientName",d.recipient_email "recipientEmail",d.subject,d.body,d.status,d.sent_at "sentAt",d.created_at "createdAt" from public.zgirl_executive_briefing_deliveries d join public.zgirl_executive_briefings b on b.id=d.briefing_id order by d.created_at desc limit 50)x;
 return jsonb_build_object('live',v_live,'settings',v_settings,'briefings',v_briefs,'deliveries',v_deliveries);
end; $$;

create or replace function public.zgirl_executive_briefing_generate(p_session_token text,p_briefing_type text,p_title text,p_generated_by text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
begin perform private.zgirl_credential_require_session(p_session_token);return private.zgirl_generate_executive_brief(p_briefing_type,'manual',p_generated_by,p_title,null);end; $$;

create or replace function public.zgirl_executive_briefing_save_settings(p_session_token text,p_weekly_enabled boolean,p_monthly_enabled boolean,p_exception_enabled boolean,p_default_preparer text,p_default_recipient_name text,p_default_recipient_email text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
begin
 perform private.zgirl_credential_require_session(p_session_token);
 if char_length(coalesce(p_default_preparer,''))>120 or char_length(coalesce(p_default_recipient_name,''))>160 or char_length(coalesce(p_default_recipient_email,''))>254 then raise exception 'invalid_executive_briefing_settings'; end if;
 if nullif(trim(coalesce(p_default_recipient_email,'')),'') is not null and trim(p_default_recipient_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid_executive_briefing_email'; end if;
 update public.zgirl_executive_briefing_settings set weekly_enabled=p_weekly_enabled,monthly_enabled=p_monthly_enabled,exception_enabled=p_exception_enabled,default_preparer=nullif(trim(p_default_preparer),''),default_recipient_name=nullif(trim(p_default_recipient_name),''),default_recipient_email=nullif(lower(trim(p_default_recipient_email)),''),updated_at=now() where id='default';return true;
end; $$;

create or replace function public.zgirl_executive_briefing_mark_delivery(p_session_token text,p_delivery_id uuid,p_status text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
begin perform private.zgirl_credential_require_session(p_session_token);if p_status not in ('prepared','sent','dismissed') then raise exception 'invalid_executive_briefing_delivery';end if;update public.zgirl_executive_briefing_deliveries set status=p_status,sent_at=case when p_status='sent' then coalesce(sent_at,now()) else sent_at end,updated_at=now() where id=p_delivery_id;if not found then raise exception 'executive_briefing_delivery_not_found';end if;return true;end; $$;

create or replace function public.zgirl_executive_briefing_get(p_session_token text,p_briefing_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v jsonb;begin perform private.zgirl_credential_require_session(p_session_token);select jsonb_build_object('id',id,'briefingCode',briefing_code,'briefingType',briefing_type,'generationMode',generation_mode,'periodKey',period_key,'title',title,'periodStart',period_start,'periodEnd',period_end,'generatedBy',generated_by,'status',status,'createdAt',created_at,'data',briefing_data) into v from public.zgirl_executive_briefings where id=p_briefing_id;if v is null then raise exception 'executive_briefing_not_found';end if;return v;end; $$;

create or replace function public.zgirl_executive_briefing_run_automation(p_session_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
begin perform private.zgirl_credential_require_session(p_session_token);return private.zgirl_process_executive_briefing_automation();end; $$;

grant execute on function public.zgirl_executive_briefing_dashboard(text) to anon,authenticated;
grant execute on function public.zgirl_executive_briefing_generate(text,text,text,text) to anon,authenticated;
grant execute on function public.zgirl_executive_briefing_save_settings(text,boolean,boolean,boolean,text,text,text) to anon,authenticated;
grant execute on function public.zgirl_executive_briefing_mark_delivery(text,uuid,text) to anon,authenticated;
grant execute on function public.zgirl_executive_briefing_get(text,uuid) to anon,authenticated;
grant execute on function public.zgirl_executive_briefing_run_automation(text) to anon,authenticated;

do $$ declare v_job bigint;begin select jobid into v_job from cron.job where jobname='zgirl-executive-briefing-daily';if v_job is not null then perform cron.unschedule(v_job);end if;end $$;
select cron.schedule('zgirl-executive-briefing-daily','37 11 * * *','select private.zgirl_process_executive_briefing_automation();');
