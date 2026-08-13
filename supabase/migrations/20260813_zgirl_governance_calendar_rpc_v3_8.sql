-- Z-Girl v3.8 governance calendar RPCs.
create or replace function public.zgirl_governance_calendar_dashboard(p_session_token text,p_institution_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_context jsonb; v_inst public.zgirl_institutions%rowtype;
begin
 v_context:=private.zgirl_tenant_require_access(p_session_token,p_institution_id,'read');
 select * into v_inst from public.zgirl_institutions where id=p_institution_id;
 return jsonb_build_object('context',v_context,'institution',jsonb_build_object('id',v_inst.id,'name',v_inst.name,'institutionCode',v_inst.institution_code,'status',v_inst.status),
 'settings',(select to_jsonb(s)-'institution_id' from public.zgirl_governance_calendar_settings s where s.institution_id=p_institution_id),
 'annualCycles',coalesce((select jsonb_agg(to_jsonb(c) order by c.cycle_year desc) from (select * from public.zgirl_governance_annual_review_cycles where institution_id=p_institution_id order by cycle_year desc limit 20)c),'[]'::jsonb),
 'calendarItems',coalesce((select jsonb_agg(to_jsonb(c) order by c.due_date,c.created_at) from (select * from public.zgirl_governance_calendar_items where institution_id=p_institution_id and status<>'cancelled' order by due_date,created_at limit 150)c),'[]'::jsonb),
 'retentionRecords',coalesce((select jsonb_agg(to_jsonb(r) order by r.next_review_date,r.created_at) from (select * from public.zgirl_evidence_retention_records where institution_id=p_institution_id order by next_review_date,created_at limit 200)r),'[]'::jsonb));
end; $$;

create or replace function public.zgirl_governance_save_calendar_settings(p_session_token text,p_institution_id uuid,p_enabled boolean,p_annual_review_month integer,p_annual_review_day integer,p_annual_review_lead_days integer,p_evidence_review_interval_months integer,p_retention_months integer,p_retention_policy_label text,p_governance_owner_name text,p_notes text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
begin
 perform private.zgirl_tenant_require_access(p_session_token,p_institution_id,'manage');
 if p_annual_review_month not between 1 and 12 or p_annual_review_day not between 1 and 28 or p_annual_review_lead_days not between 7 and 180 or p_evidence_review_interval_months not between 1 and 60 or (p_retention_months is not null and p_retention_months not between 1 and 300) then raise exception 'invalid_governance_calendar_settings'; end if;
 insert into public.zgirl_governance_calendar_settings(institution_id,enabled,annual_review_month,annual_review_day,annual_review_lead_days,evidence_review_interval_months,retention_months,retention_policy_label,governance_owner_name,notes)
 values(p_institution_id,coalesce(p_enabled,true),p_annual_review_month,p_annual_review_day,p_annual_review_lead_days,p_evidence_review_interval_months,p_retention_months,left(coalesce(p_retention_policy_label,''),220),left(coalesce(p_governance_owner_name,''),120),left(coalesce(p_notes,''),1600))
 on conflict(institution_id) do update set enabled=excluded.enabled,annual_review_month=excluded.annual_review_month,annual_review_day=excluded.annual_review_day,annual_review_lead_days=excluded.annual_review_lead_days,evidence_review_interval_months=excluded.evidence_review_interval_months,retention_months=excluded.retention_months,retention_policy_label=excluded.retention_policy_label,governance_owner_name=excluded.governance_owner_name,notes=excluded.notes,updated_at=now();
 return true;
end; $$;

create or replace function public.zgirl_governance_create_calendar_item(p_session_token text,p_institution_id uuid,p_item_type text,p_title text,p_window_open_date date,p_due_date date,p_owner_name text,p_notes text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_id uuid;
begin
 perform private.zgirl_tenant_require_access(p_session_token,p_institution_id,'manage');
 if p_item_type not in ('annual_review','access_review','governance_report','attestation','audit_package','retention_review','sso_review','offboarding_review','license_renewal','credential_capacity','custom') or char_length(trim(coalesce(p_title,'')))<2 or p_due_date is null then raise exception 'invalid_governance_calendar_item'; end if;
 insert into public.zgirl_governance_calendar_items(calendar_code,institution_id,item_type,status,title,window_open_date,due_date,owner_name,notes)
 values('ZG-CAL-'||to_char(current_date,'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),p_institution_id,p_item_type,case when p_due_date<=current_date then 'due' else 'scheduled' end,left(trim(p_title),220),p_window_open_date,p_due_date,left(coalesce(p_owner_name,''),120),left(coalesce(p_notes,''),1200)) returning id into v_id;
 return v_id;
end; $$;

create or replace function public.zgirl_governance_update_calendar_item(p_session_token text,p_item_id uuid,p_status text,p_owner_name text,p_notes text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_inst uuid;
begin
 select institution_id into v_inst from public.zgirl_governance_calendar_items where id=p_item_id; if v_inst is null then raise exception 'governance_calendar_item_not_found'; end if;
 perform private.zgirl_tenant_require_access(p_session_token,v_inst,'manage');
 if p_status not in ('scheduled','due','in_progress','completed','cancelled') then raise exception 'invalid_governance_calendar_item'; end if;
 update public.zgirl_governance_calendar_items set status=p_status,owner_name=left(coalesce(p_owner_name,owner_name),120),notes=left(coalesce(p_notes,notes),1200),completed_at=case when p_status='completed' then coalesce(completed_at,now()) else null end,updated_at=now() where id=p_item_id;
 return true;
end; $$;

revoke all on function public.zgirl_governance_calendar_dashboard(text,uuid) from public,anon,authenticated;
revoke all on function public.zgirl_governance_save_calendar_settings(text,uuid,boolean,integer,integer,integer,integer,integer,text,text,text) from public,anon,authenticated;
revoke all on function public.zgirl_governance_create_calendar_item(text,uuid,text,text,date,date,text,text) from public,anon,authenticated;
revoke all on function public.zgirl_governance_update_calendar_item(text,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.zgirl_governance_calendar_dashboard(text,uuid) to anon,authenticated;
grant execute on function public.zgirl_governance_save_calendar_settings(text,uuid,boolean,integer,integer,integer,integer,integer,text,text,text) to anon,authenticated;
grant execute on function public.zgirl_governance_create_calendar_item(text,uuid,text,text,date,date,text,text) to anon,authenticated;
grant execute on function public.zgirl_governance_update_calendar_item(text,uuid,text,text,text) to anon,authenticated;
