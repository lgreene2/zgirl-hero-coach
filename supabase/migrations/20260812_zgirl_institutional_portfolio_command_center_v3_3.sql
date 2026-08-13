-- Z-Girl v3.3 Institutional Portfolio & Executive Reporting Command Center
-- Executive-level institution health, portfolio snapshots, and derived reporting only.
-- No participant reflections, youth/student/athlete case data, diagnosis, counseling, safeguarding narratives, clinical notes, clergy records, or sports-medicine data.

create table if not exists public.zgirl_portfolio_reviews (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null unique references public.zgirl_institutions(id) on delete cascade,
  health_status text not null default 'unrated' check (health_status in ('unrated','green','watch','risk','critical')),
  strategic_priority text not null default 'normal' check (strategic_priority in ('normal','growth','renewal','recovery','hold')),
  expansion_readiness text not null default 'not_assessed' check (expansion_readiness in ('not_assessed','not_ready','watch','ready')),
  executive_owner text check (executive_owner is null or char_length(executive_owner) <= 120),
  executive_summary text check (executive_summary is null or char_length(executive_summary) <= 1600),
  next_executive_action text check (next_executive_action is null or char_length(next_executive_action) <= 600),
  next_review_date date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists zgirl_portfolio_reviews_health_idx on public.zgirl_portfolio_reviews(health_status,next_review_date);

create table if not exists public.zgirl_portfolio_snapshots (
  id uuid primary key default gen_random_uuid(), snapshot_code text not null unique,
  title text not null check (char_length(title) between 2 and 220), as_of_date date not null default current_date,
  generated_by text check (generated_by is null or char_length(generated_by) <= 120), snapshot_data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists zgirl_portfolio_snapshots_date_idx on public.zgirl_portfolio_snapshots(as_of_date desc,created_at desc);

alter table public.zgirl_portfolio_reviews enable row level security;
alter table public.zgirl_portfolio_snapshots enable row level security;
revoke all on public.zgirl_portfolio_reviews,public.zgirl_portfolio_snapshots from anon,authenticated;

create or replace function public.zgirl_portfolio_save_review(p_session_token text,p_institution_id uuid,p_health_status text,p_strategic_priority text,p_expansion_readiness text,p_executive_owner text,p_executive_summary text,p_next_executive_action text,p_next_review_date date)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_id uuid;
begin
 perform private.zgirl_credential_require_session(p_session_token);
 if not exists(select 1 from public.zgirl_institutions where id=p_institution_id) then raise exception 'institution_not_found'; end if;
 if p_health_status not in ('unrated','green','watch','risk','critical') then raise exception 'invalid_portfolio_health'; end if;
 if p_strategic_priority not in ('normal','growth','renewal','recovery','hold') then raise exception 'invalid_portfolio_priority'; end if;
 if p_expansion_readiness not in ('not_assessed','not_ready','watch','ready') then raise exception 'invalid_expansion_readiness'; end if;
 if char_length(coalesce(p_executive_summary,''))>1600 or char_length(coalesce(p_next_executive_action,''))>600 then raise exception 'invalid_portfolio_summary'; end if;
 insert into public.zgirl_portfolio_reviews(institution_id,health_status,strategic_priority,expansion_readiness,executive_owner,executive_summary,next_executive_action,next_review_date)
 values(p_institution_id,p_health_status,p_strategic_priority,p_expansion_readiness,nullif(trim(p_executive_owner),''),nullif(trim(p_executive_summary),''),nullif(trim(p_next_executive_action),''),p_next_review_date)
 on conflict(institution_id) do update set health_status=excluded.health_status,strategic_priority=excluded.strategic_priority,expansion_readiness=excluded.expansion_readiness,executive_owner=excluded.executive_owner,executive_summary=excluded.executive_summary,next_executive_action=excluded.next_executive_action,next_review_date=excluded.next_review_date,updated_at=now()
 returning id into v_id; return v_id;
end; $$;

create or replace function public.zgirl_portfolio_dashboard(p_session_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_summary jsonb;v_institutions jsonb;v_actions jsonb;v_snapshots jsonb;
begin
 perform private.zgirl_credential_require_session(p_session_token);
 select jsonb_build_object('institutions',count(*),'prospects',count(*) filter(where status='prospect'),'pilots',count(*) filter(where status='pilot'),'activeInstitutions',count(*) filter(where status='active'),'pausedInstitutions',count(*) filter(where status='paused')) into v_summary from public.zgirl_institutions;
 v_summary:=v_summary||(select jsonb_build_object('currentLicenses',count(*) filter(where status in ('active','conditional','pending')),'activeLicenses',count(*) filter(where status='active'),'licensesDue30',count(*) filter(where status not in ('closed','lapsed') and expires_at between current_date and current_date+30),'licensesDue90',count(*) filter(where status not in ('closed','lapsed') and expires_at between current_date and current_date+90),'renewalAttention',count(*) filter(where renewal_status in ('due','in_progress','lapsed')),'seatCapacity',coalesce(sum(seat_limit) filter(where status not in ('closed','lapsed')),0),'trainerCapacity',coalesce(sum(trainer_limit) filter(where status not in ('closed','lapsed')),0)) from public.zgirl_institution_licenses);
 v_summary:=v_summary||(select jsonb_build_object('allocatedSeats',count(*) filter(where status<>'released'),'activeSeats',count(*) filter(where status='active'),'trainerSeats',count(*) filter(where status<>'released' and seat_role='institutional_trainer')) from public.zgirl_institution_seat_allocations);
 v_summary:=v_summary||(select jsonb_build_object('activeCredentials',count(*) filter(where status='active'),'conditionalCredentials',count(*) filter(where status='conditional'),'credentialAttention',count(*) filter(where status in ('suspended','revoked','lapsed')),'credentialsDue90',count(*) filter(where status in ('active','conditional') and expires_at between current_date and current_date+90),'institutionalTrainers',count(*) filter(where credential_level='institutional_trainer' and status in ('active','conditional'))) from public.zgirl_credentials);
 v_summary:=v_summary||(select jsonb_build_object('openWorkflows',count(*) filter(where status not in ('released','rejected','cancelled')),'releaseReady',count(*) filter(where status in ('ready_for_handoff','scheduled')),'approvalsPending',count(*) filter(where status in ('approvals_pending','agreement_pending','release_review'))) from public.zgirl_institution_workflows);
 v_summary:=v_summary||(select jsonb_build_object('openOpportunities',count(*) filter(where stage not in ('converted','closed_lost')),'pipelineValueCents',coalesce(sum(estimated_value_cents) filter(where stage not in ('converted','closed_lost')),0),'weightedPipelineValueCents',coalesce(sum((coalesce(estimated_value_cents,0)*probability_percent/100.0)::bigint) filter(where stage not in ('converted','closed_lost')),0),'expansionOpportunities',count(*) filter(where stage not in ('converted','closed_lost') and contract_path in ('expansion','train_the_trainer_addendum')),'acceptedProposals',count(*) filter(where stage<>'closed_lost' and handoff_proposal_id is not null)) from public.zgirl_partner_opportunities);
 v_summary:=v_summary||(select jsonb_build_object('greenInstitutions',count(*) filter(where health_status='green'),'watchInstitutions',count(*) filter(where health_status='watch'),'riskInstitutions',count(*) filter(where health_status in ('risk','critical')),'expansionReady',count(*) filter(where expansion_readiness='ready')) from public.zgirl_portfolio_reviews);

 select coalesce(jsonb_agg(to_jsonb(x) order by x.sort_rank,x.institution_name),'[]'::jsonb) into v_institutions from (
  select i.id institution_id,i.institution_code,i.name institution_name,i.institution_type,i.status institution_status,l.id license_id,l.license_code,l.license_type,l.status license_status,l.renewal_status,l.expires_at license_expires_at,l.seat_limit,l.trainer_limit,
   coalesce(a.seats_used,0) seats_used,coalesce(a.trainers_used,0) trainers_used,coalesce(a.linked_credentials,0) linked_credentials,coalesce(w.open_workflows,0) open_workflows,coalesce(o.open_opportunities,0) open_opportunities,coalesce(o.pipeline_value_cents,0) pipeline_value_cents,
   h.status implementation_status,h.implementation_owner,h.target_start_date implementation_target_start,coalesce(r.health_status,'unrated') health_status,coalesce(r.strategic_priority,'normal') strategic_priority,coalesce(r.expansion_readiness,'not_assessed') expansion_readiness,r.executive_owner,r.executive_summary,r.next_executive_action,r.next_review_date,
   case coalesce(r.health_status,'unrated') when 'critical' then 0 when 'risk' then 1 when 'watch' then 2 when 'unrated' then 3 else 4 end sort_rank
  from public.zgirl_institutions i
  left join lateral(select * from public.zgirl_institution_licenses z where z.institution_id=i.id order by case z.status when 'active' then 0 when 'conditional' then 1 when 'pending' then 2 when 'draft' then 3 when 'suspended' then 4 when 'lapsed' then 5 else 6 end,z.expires_at desc limit 1) l on true
  left join lateral(select count(*) filter(where status<>'released') seats_used,count(*) filter(where status<>'released' and seat_role='institutional_trainer') trainers_used,count(distinct credential_id) filter(where status<>'released' and credential_id is not null) linked_credentials from public.zgirl_institution_seat_allocations s where s.license_id=l.id) a on true
  left join lateral(select count(*) open_workflows from public.zgirl_institution_workflows q where q.institution_id=i.id and q.status not in ('released','rejected','cancelled')) w on true
  left join lateral(select count(*) open_opportunities,coalesce(sum(estimated_value_cents),0) pipeline_value_cents from public.zgirl_partner_opportunities p where p.institution_id=i.id and p.stage not in ('converted','closed_lost')) o on true
  left join lateral(select d.status,d.implementation_owner,d.target_start_date from public.zgirl_institution_delivery_handoffs d where d.institution_id=i.id order by d.updated_at desc limit 1) h on true
  left join public.zgirl_portfolio_reviews r on r.institution_id=i.id
 ) x;

 select coalesce(jsonb_agg(item order by severity_rank,due_date nulls last,label),'[]'::jsonb) into v_actions from (
  select 0 severity_rank,l.expires_at due_date,'License renewal' label,jsonb_build_object('severity',case when l.expires_at<=current_date+30 then 'critical' else 'watch' end,'type','license_renewal','institutionId',i.id,'institutionName',i.name,'dueDate',l.expires_at,'detail',l.license_code||' · '||l.renewal_status) item from public.zgirl_institution_licenses l join public.zgirl_institutions i on i.id=l.institution_id where l.status not in ('closed','lapsed') and l.expires_at between current_date and current_date+90
  union all select 1,coalesce(w.target_start_date,w.requested_effective_date),'Agreement / release',jsonb_build_object('severity',case when coalesce(w.target_start_date,w.requested_effective_date,current_date+30)<=current_date+14 then 'critical' else 'watch' end,'type','workflow','institutionId',i.id,'institutionName',i.name,'dueDate',coalesce(w.target_start_date,w.requested_effective_date),'detail',w.workflow_code||' · '||w.status) from public.zgirl_institution_workflows w join public.zgirl_institutions i on i.id=w.institution_id where w.status not in ('released','rejected','cancelled')
  union all select 2,p.target_decision_date,'Pipeline decision',jsonb_build_object('severity',case when p.target_decision_date<current_date then 'critical' else 'watch' end,'type','pipeline','institutionId',i.id,'institutionName',i.name,'dueDate',p.target_decision_date,'detail',p.opportunity_code||' · '||p.stage) from public.zgirl_partner_opportunities p join public.zgirl_institutions i on i.id=p.institution_id where p.stage not in ('converted','closed_lost') and p.target_decision_date is not null and p.target_decision_date<=current_date+14
  union all select 3,r.next_review_date,'Executive review',jsonb_build_object('severity',case when r.health_status in ('risk','critical') or r.next_review_date<current_date then 'critical' else 'watch' end,'type','executive_review','institutionId',i.id,'institutionName',i.name,'dueDate',r.next_review_date,'detail',coalesce(r.next_executive_action,'Portfolio review due')) from public.zgirl_portfolio_reviews r join public.zgirl_institutions i on i.id=r.institution_id where r.next_review_date is not null and r.next_review_date<=current_date+14
  union all select 4,min(c.expires_at),'Credential capacity',jsonb_build_object('severity',case when min(c.expires_at)<=current_date+30 then 'critical' else 'watch' end,'type','credential_renewal','institutionId',i.id,'institutionName',i.name,'dueDate',min(c.expires_at),'detail',count(distinct c.id)||' linked credential(s) expire within 90 days') from public.zgirl_institution_seat_allocations a join public.zgirl_institution_licenses l on l.id=a.license_id join public.zgirl_institutions i on i.id=l.institution_id join public.zgirl_credentials c on c.id=a.credential_id where a.status<>'released' and c.status in ('active','conditional') and c.expires_at between current_date and current_date+90 group by i.id,i.name
 ) q;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'snapshotCode',snapshot_code,'title',title,'asOfDate',as_of_date,'generatedBy',generated_by,'createdAt',created_at) order by created_at desc),'[]'::jsonb) into v_snapshots from(select * from public.zgirl_portfolio_snapshots order by created_at desc limit 24)s;
 return jsonb_build_object('generatedAt',now(),'summary',v_summary,'institutions',v_institutions,'actionItems',v_actions,'snapshots',v_snapshots);
end; $$;

create or replace function public.zgirl_portfolio_create_snapshot(p_session_token text,p_title text,p_generated_by text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_id uuid;v_code text;v_dashboard jsonb;
begin
 perform private.zgirl_credential_require_session(p_session_token);
 if char_length(trim(coalesce(p_title,'')))<2 or char_length(trim(p_title))>220 then raise exception 'invalid_portfolio_snapshot'; end if;
 v_dashboard:=public.zgirl_portfolio_dashboard(p_session_token);v_code:='ZG-PORT-'||extract(year from current_date)::int||'-'||upper(substr(replace(extensions.gen_random_uuid()::text,'-',''),1,10));
 insert into public.zgirl_portfolio_snapshots(snapshot_code,title,as_of_date,generated_by,snapshot_data) values(v_code,trim(p_title),current_date,nullif(trim(p_generated_by),''),jsonb_build_object('generatedAt',v_dashboard->'generatedAt','summary',v_dashboard->'summary','actionItems',v_dashboard->'actionItems')) returning id into v_id;return v_id;
end; $$;

grant execute on function public.zgirl_portfolio_save_review(text,uuid,text,text,text,text,text,text,date) to anon,authenticated;
grant execute on function public.zgirl_portfolio_dashboard(text) to anon,authenticated;
grant execute on function public.zgirl_portfolio_create_snapshot(text,text,text) to anon,authenticated;
