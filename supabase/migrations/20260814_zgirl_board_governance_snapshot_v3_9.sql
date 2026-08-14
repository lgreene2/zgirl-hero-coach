-- Z-Girl v3.9 deterministic board-governance snapshot engine.
-- Uses only institutional administrative governance metadata.

create or replace function private.zgirl_build_board_governance_snapshot(
  p_institution_id uuid,
  p_period_start date,
  p_period_end date
) returns jsonb
language plpgsql
security definer
set search_path=pg_catalog,public,private
as $$
declare
  v_inst public.zgirl_institutions%rowtype;
begin
  if p_period_start is null or p_period_end is null or p_period_start > p_period_end then
    raise exception 'invalid_board_governance_period';
  end if;
  select * into v_inst from public.zgirl_institutions where id=p_institution_id;
  if v_inst.id is null then raise exception 'institution_not_found'; end if;

  return jsonb_build_object(
    'generatedAt', now(),
    'period', jsonb_build_object('start',p_period_start,'end',p_period_end),
    'institution', jsonb_build_object(
      'id',v_inst.id,'institutionCode',v_inst.institution_code,'name',v_inst.name,
      'institutionType',v_inst.institution_type,'status',v_inst.status
    ),
    'summary', jsonb_build_object(
      'calendarItems', (select count(*) from public.zgirl_governance_calendar_items c where c.institution_id=p_institution_id and c.due_date between p_period_start and p_period_end and c.status<>'cancelled'),
      'calendarDue', (select count(*) from public.zgirl_governance_calendar_items c where c.institution_id=p_institution_id and c.due_date between p_period_start and p_period_end and c.status='due'),
      'calendarOpen', (select count(*) from public.zgirl_governance_calendar_items c where c.institution_id=p_institution_id and c.due_date between p_period_start and p_period_end and c.status in ('scheduled','due','in_progress')),
      'calendarCompleted', (select count(*) from public.zgirl_governance_calendar_items c where c.institution_id=p_institution_id and c.due_date between p_period_start and p_period_end and c.status='completed'),
      'governanceReports', (select count(*) from public.zgirl_tenant_governance_reports r where r.institution_id=p_institution_id and r.period_end>=p_period_start and r.period_start<=p_period_end),
      'attestations', (select count(*) from public.zgirl_tenant_access_attestations a where a.institution_id=p_institution_id and a.created_at::date between p_period_start and p_period_end),
      'auditPackages', (select count(*) from public.zgirl_tenant_audit_packages a where a.institution_id=p_institution_id and a.created_at::date between p_period_start and p_period_end),
      'retentionReviewsDue', (select count(*) from public.zgirl_evidence_retention_records r where r.institution_id=p_institution_id and r.next_review_date between p_period_start and p_period_end and r.status in ('active','review_due','hold','archive_candidate')),
      'annualCycles', (select count(*) from public.zgirl_governance_annual_review_cycles c where c.institution_id=p_institution_id and c.due_date between p_period_start and p_period_end)
    ),
    'calendarItems', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',c.id,'calendarCode',c.calendar_code,'itemType',c.item_type,'status',c.status,
        'title',c.title,'windowOpenDate',c.window_open_date,'dueDate',c.due_date,
        'ownerName',c.owner_name,'sourceType',c.source_type,'sourceCode',c.source_code,
        'completedAt',c.completed_at
      ) order by c.due_date,c.title)
      from public.zgirl_governance_calendar_items c
      where c.institution_id=p_institution_id and c.due_date between p_period_start and p_period_end and c.status<>'cancelled'
    ),'[]'::jsonb),
    'annualCycles', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',c.id,'cycleCode',c.cycle_code,'cycleYear',c.cycle_year,'status',c.status,
        'periodStart',c.period_start,'periodEnd',c.period_end,'windowOpenDate',c.window_open_date,
        'dueDate',c.due_date,'ownerName',c.owner_name,'completedAt',c.completed_at
      ) order by c.due_date)
      from public.zgirl_governance_annual_review_cycles c
      where c.institution_id=p_institution_id and c.due_date between p_period_start and p_period_end
    ),'[]'::jsonb),
    'evidenceIndex', jsonb_build_object(
      'reports', coalesce((select jsonb_agg(jsonb_build_object(
        'id',r.id,'reportCode',r.report_code,'reportType',r.report_type,'status',r.status,
        'title',r.title,'periodStart',r.period_start,'periodEnd',r.period_end,
        'preparedBy',r.prepared_by,'finalizedAt',r.finalized_at
      ) order by r.period_end desc,r.created_at desc)
      from public.zgirl_tenant_governance_reports r
      where r.institution_id=p_institution_id and r.period_end>=p_period_start and r.period_start<=p_period_end),'[]'::jsonb),
      'attestations', coalesce((select jsonb_agg(jsonb_build_object(
        'id',a.id,'attestationCode',a.attestation_code,'attestationType',a.attestation_type,
        'status',a.status,'attestorName',a.attestor_name,'attestorTitle',a.attestor_title,
        'attestedAt',a.attested_at
      ) order by a.created_at desc)
      from public.zgirl_tenant_access_attestations a
      where a.institution_id=p_institution_id and a.created_at::date between p_period_start and p_period_end),'[]'::jsonb),
      'packages', coalesce((select jsonb_agg(jsonb_build_object(
        'id',a.id,'packageCode',a.package_code,'packageType',a.package_type,'status',a.status,
        'generatedBy',a.generated_by,'createdAt',a.created_at,'archivedAt',a.archived_at
      ) order by a.created_at desc)
      from public.zgirl_tenant_audit_packages a
      where a.institution_id=p_institution_id and a.created_at::date between p_period_start and p_period_end),'[]'::jsonb),
      'retention', coalesce((select jsonb_agg(jsonb_build_object(
        'id',r.id,'retentionCode',r.retention_code,'evidenceType',r.evidence_type,
        'evidenceCode',r.evidence_code,'status',r.status,'retainedFrom',r.retained_from,
        'nextReviewDate',r.next_review_date,'retentionUntil',r.retention_until,
        'policyLabel',r.policy_label,'lastReviewAction',r.last_review_action,'lastReviewedAt',r.last_reviewed_at
      ) order by r.next_review_date,r.evidence_code)
      from public.zgirl_evidence_retention_records r
      where r.institution_id=p_institution_id and (r.next_review_date between p_period_start and p_period_end or r.retained_from between p_period_start and p_period_end)),'[]'::jsonb)
    ),
    'actionOwners', coalesce((
      select jsonb_agg(jsonb_build_object(
        'ownerName',x.owner_name,'openItems',x.open_items,'dueItems',x.due_items,
        'completedItems',x.completed_items,'nextDueDate',x.next_due_date
      ) order by x.due_items desc,x.open_items desc,x.owner_name)
      from (
        select coalesce(nullif(trim(c.owner_name),''),'Unassigned') owner_name,
          count(*) filter(where c.status in ('scheduled','due','in_progress')) open_items,
          count(*) filter(where c.status='due') due_items,
          count(*) filter(where c.status='completed') completed_items,
          min(c.due_date) filter(where c.status in ('scheduled','due','in_progress')) next_due_date
        from public.zgirl_governance_calendar_items c
        where c.institution_id=p_institution_id and c.due_date between p_period_start and p_period_end and c.status<>'cancelled'
        group by 1
      ) x
    ),'[]'::jsonb),
    'dataBoundary', jsonb_build_object(
      'administrativeGovernanceOnly',true,
      'participantReflectionExcluded',true,
      'participantCaseDataExcluded',true,
      'credentialAssessmentDetailExcluded',true,
      'complianceCertification',false,
      'independentAuditOpinion',false
    )
  );
end;
$$;

revoke all on function private.zgirl_build_board_governance_snapshot(uuid,date,date) from public,anon,authenticated;
