-- Z-Girl v3.8 governance calendar helpers.
create or replace function private.zgirl_governance_code(p_prefix text)
returns text language sql security definer set search_path=pg_catalog,extensions as $$
 select p_prefix||'-'||to_char(current_date,'YYYY')||'-'||upper(substr(encode(extensions.gen_random_bytes(6),'hex'),1,10));
$$;
revoke all on function private.zgirl_governance_code(text) from public,anon,authenticated;

create or replace function private.zgirl_governance_register_evidence(p_institution_id uuid)
returns integer language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_settings public.zgirl_governance_calendar_settings%rowtype; v_total integer:=0; v_rows integer:=0;
begin
 select * into v_settings from public.zgirl_governance_calendar_settings where institution_id=p_institution_id;
 if v_settings.institution_id is null then return 0; end if;
 insert into public.zgirl_evidence_retention_records(retention_code,institution_id,evidence_type,governance_report_id,evidence_code,retained_from,next_review_date,retention_until,policy_label)
 select private.zgirl_governance_code('ZG-RET'),r.institution_id,'governance_report',r.id,r.report_code,r.created_at::date,(r.created_at+make_interval(months=>v_settings.evidence_review_interval_months))::date,case when v_settings.retention_months is null then null else (r.created_at+make_interval(months=>v_settings.retention_months))::date end,v_settings.retention_policy_label
 from public.zgirl_tenant_governance_reports r where r.institution_id=p_institution_id and not exists(select 1 from public.zgirl_evidence_retention_records x where x.governance_report_id=r.id) on conflict do nothing;
 get diagnostics v_rows=row_count; v_total:=v_total+v_rows;
 insert into public.zgirl_evidence_retention_records(retention_code,institution_id,evidence_type,attestation_id,evidence_code,retained_from,next_review_date,retention_until,policy_label)
 select private.zgirl_governance_code('ZG-RET'),a.institution_id,'attestation',a.id,a.attestation_code,a.created_at::date,(a.created_at+make_interval(months=>v_settings.evidence_review_interval_months))::date,case when v_settings.retention_months is null then null else (a.created_at+make_interval(months=>v_settings.retention_months))::date end,v_settings.retention_policy_label
 from public.zgirl_tenant_access_attestations a where a.institution_id=p_institution_id and not exists(select 1 from public.zgirl_evidence_retention_records x where x.attestation_id=a.id) on conflict do nothing;
 get diagnostics v_rows=row_count; v_total:=v_total+v_rows;
 insert into public.zgirl_evidence_retention_records(retention_code,institution_id,evidence_type,audit_package_id,evidence_code,retained_from,next_review_date,retention_until,policy_label)
 select private.zgirl_governance_code('ZG-RET'),p.institution_id,'audit_package',p.id,p.package_code,p.created_at::date,(p.created_at+make_interval(months=>v_settings.evidence_review_interval_months))::date,case when v_settings.retention_months is null then null else (p.created_at+make_interval(months=>v_settings.retention_months))::date end,v_settings.retention_policy_label
 from public.zgirl_tenant_audit_packages p where p.institution_id=p_institution_id and not exists(select 1 from public.zgirl_evidence_retention_records x where x.audit_package_id=p.id) on conflict do nothing;
 get diagnostics v_rows=row_count; v_total:=v_total+v_rows;
 return v_total;
end; $$;
revoke all on function private.zgirl_governance_register_evidence(uuid) from public,anon,authenticated;
