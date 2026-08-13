-- Z-Girl v3.8 retention and annual closeout actions.
create or replace function public.zgirl_governance_review_retention_record(p_session_token text,p_retention_id uuid,p_action text,p_next_review_date date,p_reference text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_inst uuid; v_context jsonb; v_operator uuid;
begin
 select institution_id into v_inst from public.zgirl_evidence_retention_records where id=p_retention_id; if v_inst is null then raise exception 'retention_record_not_found'; end if;
 v_context:=private.zgirl_tenant_require_access(p_session_token,v_inst,'manage'); v_operator:=nullif(v_context->>'operatorId','')::uuid;
 if p_action not in ('retain','continue_review','hold','archive_candidate') or p_next_review_date is null or p_next_review_date<current_date then raise exception 'invalid_retention_review'; end if;
 update public.zgirl_evidence_retention_records set status=case p_action when 'hold' then 'hold' when 'archive_candidate' then 'archive_candidate' else 'active' end,last_review_action=p_action,last_review_reference=left(coalesce(p_reference,''),300),last_reviewed_by_operator_id=v_operator,last_reviewed_at=now(),next_review_date=p_next_review_date,updated_at=now() where id=p_retention_id;
 update public.zgirl_governance_calendar_items set status='completed',completed_at=now(),updated_at=now() where source_type='retention_record' and source_id=p_retention_id and status in ('scheduled','due','in_progress');
 return true;
end; $$;

create or replace function public.zgirl_governance_approve_archive_candidate(p_session_token text,p_retention_id uuid,p_reference text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_inst uuid; v_context jsonb; v_operator uuid;
begin
 select institution_id into v_inst from public.zgirl_evidence_retention_records where id=p_retention_id and status='archive_candidate'; if v_inst is null then raise exception 'retention_record_not_ready'; end if;
 v_context:=private.zgirl_tenant_require_access(p_session_token,v_inst,'owner'); v_operator:=nullif(v_context->>'operatorId','')::uuid;
 if char_length(trim(coalesce(p_reference,'')))<3 then raise exception 'retention_reference_required'; end if;
 update public.zgirl_evidence_retention_records set status='archived',disposition_approved_by_operator_id=v_operator,disposition_approved_at=now(),last_review_reference=left(p_reference,300),updated_at=now() where id=p_retention_id;
 return true;
end; $$;

create or replace function public.zgirl_governance_link_annual_evidence(p_session_token text,p_cycle_id uuid,p_report_id uuid,p_attestation_id uuid,p_package_id uuid)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_cycle public.zgirl_governance_annual_review_cycles%rowtype;
begin
 select * into v_cycle from public.zgirl_governance_annual_review_cycles where id=p_cycle_id; if v_cycle.id is null then raise exception 'annual_review_cycle_not_found'; end if;
 perform private.zgirl_tenant_require_access(p_session_token,v_cycle.institution_id,'manage');
 if not exists(select 1 from public.zgirl_tenant_governance_reports r where r.id=p_report_id and r.institution_id=v_cycle.institution_id and r.status='finalized') then raise exception 'annual_review_report_not_ready'; end if;
 if not exists(select 1 from public.zgirl_tenant_access_attestations a where a.id=p_attestation_id and a.institution_id=v_cycle.institution_id and a.status='attested') then raise exception 'annual_review_attestation_not_ready'; end if;
 if not exists(select 1 from public.zgirl_tenant_audit_packages p where p.id=p_package_id and p.institution_id=v_cycle.institution_id) then raise exception 'annual_review_package_not_ready'; end if;
 update public.zgirl_governance_annual_review_cycles set governance_report_id=p_report_id,attestation_id=p_attestation_id,audit_package_id=p_package_id,status='ready_to_close',updated_at=now() where id=p_cycle_id;
 return true;
end; $$;

create or replace function public.zgirl_governance_close_annual_cycle(p_session_token text,p_cycle_id uuid,p_summary text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_cycle public.zgirl_governance_annual_review_cycles%rowtype; v_context jsonb; v_operator uuid;
begin
 select * into v_cycle from public.zgirl_governance_annual_review_cycles where id=p_cycle_id; if v_cycle.id is null then raise exception 'annual_review_cycle_not_found'; end if;
 v_context:=private.zgirl_tenant_require_access(p_session_token,v_cycle.institution_id,'owner'); v_operator:=nullif(v_context->>'operatorId','')::uuid;
 if v_cycle.status<>'ready_to_close' or v_cycle.governance_report_id is null or v_cycle.attestation_id is null or v_cycle.audit_package_id is null then raise exception 'annual_review_cycle_not_ready'; end if;
 update public.zgirl_governance_annual_review_cycles set status='completed',summary=left(coalesce(p_summary,summary),2000),completed_by_operator_id=v_operator,completed_at=now(),updated_at=now() where id=p_cycle_id;
 update public.zgirl_governance_calendar_items set status='completed',completed_at=now(),updated_at=now() where source_type='annual_review_cycle' and source_id=p_cycle_id and status<>'cancelled';
 return true;
end; $$;
