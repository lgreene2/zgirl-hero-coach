-- Z-Girl v3.7 Institutional Access Review Evidence & Audit Pack
-- Administrative identity/access governance evidence only.
-- No participant reflections, case records, clinical/safeguarding narratives, or credential-assessment detail.

create table if not exists public.zgirl_tenant_governance_reports (
  id uuid primary key default gen_random_uuid(),
  report_code text not null unique,
  institution_id uuid not null references public.zgirl_institutions(id),
  report_type text not null check (report_type in ('access_review','annual_governance','sso_readiness','offboarding_closeout')),
  status text not null default 'draft' check (status in ('draft','finalized','archived')),
  source_review_id uuid references public.zgirl_tenant_access_reviews(id),
  period_start date not null,
  period_end date not null,
  title text not null check (char_length(title) between 3 and 220),
  executive_summary text not null default '' check (char_length(executive_summary)<=2400),
  prepared_by text not null default '' check (char_length(prepared_by)<=120),
  prepared_by_operator_id uuid references public.zgirl_operator_identities(id),
  finalized_by_operator_id uuid references public.zgirl_operator_identities(id),
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  finalized_at timestamptz,
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  check ((period_end - period_start) <= 400)
);
create index if not exists zgirl_tenant_governance_reports_inst_idx on public.zgirl_tenant_governance_reports(institution_id,status,period_end desc);

create table if not exists public.zgirl_tenant_access_attestations (
  id uuid primary key default gen_random_uuid(),
  attestation_code text not null unique,
  institution_id uuid not null references public.zgirl_institutions(id),
  report_id uuid references public.zgirl_tenant_governance_reports(id),
  review_id uuid references public.zgirl_tenant_access_reviews(id),
  attestation_type text not null check (attestation_type in ('access_review_completion','annual_access_governance','sso_readiness','offboarding_closeout')),
  status text not null default 'draft' check (status in ('draft','attested','void')),
  attestor_name text not null default '' check (char_length(attestor_name)<=120),
  attestor_title text not null default '' check (char_length(attestor_title)<=160),
  statement text not null default '' check (char_length(statement)<=1800),
  reference text not null default '' check (char_length(reference)<=300),
  prepared_by_operator_id uuid references public.zgirl_operator_identities(id),
  attested_by_operator_id uuid references public.zgirl_operator_identities(id),
  created_at timestamptz not null default now(),
  attested_at timestamptz,
  voided_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists zgirl_tenant_access_attestations_inst_idx on public.zgirl_tenant_access_attestations(institution_id,status,created_at desc);

create table if not exists public.zgirl_tenant_audit_packages (
  id uuid primary key default gen_random_uuid(),
  package_code text not null unique,
  institution_id uuid not null references public.zgirl_institutions(id),
  report_id uuid not null references public.zgirl_tenant_governance_reports(id),
  source_review_id uuid references public.zgirl_tenant_access_reviews(id),
  package_type text not null check (package_type in ('access_review_evidence','annual_governance','sso_readiness','offboarding_closeout')),
  status text not null default 'ready' check (status in ('ready','archived')),
  generated_by text not null default '' check (char_length(generated_by)<=120),
  generated_by_operator_id uuid references public.zgirl_operator_identities(id),
  manifest jsonb not null,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);
create index if not exists zgirl_tenant_audit_packages_inst_idx on public.zgirl_tenant_audit_packages(institution_id,status,created_at desc);

alter table public.zgirl_tenant_governance_reports enable row level security;
alter table public.zgirl_tenant_access_attestations enable row level security;
alter table public.zgirl_tenant_audit_packages enable row level security;
revoke all on public.zgirl_tenant_governance_reports from anon, authenticated;
revoke all on public.zgirl_tenant_access_attestations from anon, authenticated;
revoke all on public.zgirl_tenant_audit_packages from anon, authenticated;

create or replace function private.zgirl_tenant_governance_snapshot(
  p_institution_id uuid,
  p_period_start date,
  p_period_end date,
  p_source_review_id uuid default null
)
returns jsonb language plpgsql security definer
set search_path=pg_catalog,public,private as $$
declare v_inst public.zgirl_institutions%rowtype; v_review jsonb;
begin
  select * into v_inst from public.zgirl_institutions where id=p_institution_id;
  if v_inst.id is null then raise exception 'institution_not_found'; end if;
  if p_period_start is null or p_period_end is null or p_period_end<p_period_start or (p_period_end-p_period_start)>400 then raise exception 'invalid_governance_period'; end if;
  if p_source_review_id is not null then
    if not exists(select 1 from public.zgirl_tenant_access_reviews where id=p_source_review_id and institution_id=p_institution_id) then raise exception 'access_review_not_found'; end if;
    select jsonb_build_object(
      'review',jsonb_build_object('id',r.id,'reviewCode',r.review_code,'reviewType',r.review_type,'status',r.status,'periodStart',r.period_start,'periodEnd',r.period_end,'dueAt',r.due_at,'openedAt',r.opened_at,'completedAt',r.completed_at,'summary',r.summary),
      'items',coalesce((select jsonb_agg(jsonb_build_object('operatorName',i.operator_name_snapshot,'roleKey',i.role_key_snapshot,'operatorStatus',i.operator_status_snapshot,'authMode',i.auth_mode_snapshot,'decision',i.decision,'recommendedRoleKey',i.recommended_role_key,'decisionNote',i.decision_note,'decidedAt',i.decided_at,'appliedAt',i.applied_at) order by i.operator_name_snapshot,i.role_key_snapshot) from public.zgirl_tenant_access_review_items i where i.review_id=r.id),'[]'::jsonb)
    ) into v_review from public.zgirl_tenant_access_reviews r where r.id=p_source_review_id;
  end if;
  return jsonb_build_object(
    'schemaVersion','zgirl-governance-evidence-v3.7',
    'generatedAt',now(),
    'institution',jsonb_build_object('id',v_inst.id,'institutionCode',v_inst.institution_code,'name',v_inst.name,'institutionType',v_inst.institution_type,'status',v_inst.status),
    'reportingPeriod',jsonb_build_object('start',p_period_start,'end',p_period_end),
    'accessSchedule',(select jsonb_build_object('enabled',s.enabled,'cadence',s.cadence,'nextReviewDate',s.next_review_date,'ownerName',s.owner_name) from public.zgirl_tenant_access_review_schedules s where s.institution_id=p_institution_id),
    'currentAccess',coalesce((select jsonb_agg(jsonb_build_object('operatorName',o.display_name,'roleKey',r.role_key,'authMode',o.allowed_auth_mode,'operatorStatus',o.status,'lastLoginAt',o.last_login_at,'assignmentStatus',r.status) order by o.display_name,r.role_key) from public.zgirl_operator_role_assignments r join public.zgirl_operator_identities o on o.id=r.operator_id where r.institution_id=p_institution_id and r.status='active'),'[]'::jsonb),
    'reviewHistory',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'reviewCode',r.review_code,'reviewType',r.review_type,'status',r.status,'periodStart',r.period_start,'periodEnd',r.period_end,'dueAt',r.due_at,'completedAt',r.completed_at,'pendingItems',(select count(*) from public.zgirl_tenant_access_review_items i where i.review_id=r.id and i.decision='pending'),'changeOrRemoveItems',(select count(*) from public.zgirl_tenant_access_review_items i where i.review_id=r.id and i.decision in ('change','remove')),'unimplementedItems',(select count(*) from public.zgirl_tenant_access_review_items i where i.review_id=r.id and i.decision in ('change','remove') and i.applied_at is null)) order by r.created_at desc) from public.zgirl_tenant_access_reviews r where r.institution_id=p_institution_id and coalesce(r.period_end,r.created_at::date) between p_period_start and p_period_end),'[]'::jsonb),
    'sourceReview',v_review,
    'ssoReadiness',(select jsonb_build_object('status',s.status,'providerType',s.provider_type,'providerName',s.provider_name,'metadataReference',s.metadata_reference,'configurationReference',s.configuration_reference,'testReference',s.test_reference,'activationApprovalReference',s.activation_approval_reference,'activatedAt',s.activated_at) from public.zgirl_tenant_sso_onboarding s where s.institution_id=p_institution_id),
    'offboardingHistory',coalesce((select jsonb_agg(jsonb_build_object('offboardingCode',x.offboarding_code,'operatorName',o.display_name,'reasonCode',x.reason_code,'status',x.status,'effectiveAt',x.effective_at,'reference',x.reference,'completedAt',x.completed_at) order by x.requested_at desc) from public.zgirl_operator_offboarding_records x join public.zgirl_operator_identities o on o.id=x.operator_id where x.institution_id=p_institution_id and x.requested_at::date between p_period_start and p_period_end),'[]'::jsonb),
    'administrativeContext',jsonb_build_object('licenseCount',(select count(*) from public.zgirl_institution_licenses l where l.institution_id=p_institution_id),'activeOrConditionalLicenseCount',(select count(*) from public.zgirl_institution_licenses l where l.institution_id=p_institution_id and l.status in ('active','conditional')),'siteCount',(select count(*) from public.zgirl_institution_sites s where s.institution_id=p_institution_id)),
    'evidenceBoundary',jsonb_build_object('administrativeOnly',true,'participantReflectionsIncluded',false,'participantCaseDataIncluded',false,'credentialAssessmentDetailIncluded',false,'regulatoryCertification',false)
  );
end; $$;
revoke all on function private.zgirl_tenant_governance_snapshot(uuid,date,date,uuid) from public,anon,authenticated;

create or replace function public.zgirl_tenant_evidence_dashboard(p_session_token text,p_institution_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_context jsonb;
begin
  v_context:=private.zgirl_tenant_require_access(p_session_token,p_institution_id,'read');
  return jsonb_build_object(
    'context',v_context,
    'reports',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'reportCode',r.report_code,'reportType',r.report_type,'status',r.status,'sourceReviewId',r.source_review_id,'periodStart',r.period_start,'periodEnd',r.period_end,'title',r.title,'executiveSummary',r.executive_summary,'preparedBy',r.prepared_by,'createdAt',r.created_at,'finalizedAt',r.finalized_at) order by r.created_at desc) from public.zgirl_tenant_governance_reports r where r.institution_id=p_institution_id),'[]'::jsonb),
    'attestations',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'attestationCode',a.attestation_code,'reportId',a.report_id,'reviewId',a.review_id,'attestationType',a.attestation_type,'status',a.status,'attestorName',a.attestor_name,'attestorTitle',a.attestor_title,'statement',a.statement,'reference',a.reference,'createdAt',a.created_at,'attestedAt',a.attested_at) order by a.created_at desc) from public.zgirl_tenant_access_attestations a where a.institution_id=p_institution_id),'[]'::jsonb),
    'packages',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'packageCode',p.package_code,'reportId',p.report_id,'sourceReviewId',p.source_review_id,'packageType',p.package_type,'status',p.status,'generatedBy',p.generated_by,'createdAt',p.created_at,'manifest',p.manifest) order by p.created_at desc) from public.zgirl_tenant_audit_packages p where p.institution_id=p_institution_id),'[]'::jsonb)
  );
end; $$;

create or replace function public.zgirl_tenant_create_governance_report(
  p_session_token text,p_institution_id uuid,p_report_type text,p_period_start date,p_period_end date,p_source_review_id uuid,p_title text,p_executive_summary text,p_prepared_by text
)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_context jsonb; v_operator uuid; v_id uuid; v_code text; v_snapshot jsonb;
begin
  v_context:=private.zgirl_tenant_require_access(p_session_token,p_institution_id,'manage'); v_operator:=nullif(v_context->>'operatorId','')::uuid;
  if p_report_type not in ('access_review','annual_governance','sso_readiness','offboarding_closeout') then raise exception 'invalid_governance_report_type'; end if;
  if p_period_start is null or p_period_end is null or p_period_end<p_period_start or (p_period_end-p_period_start)>400 then raise exception 'invalid_governance_period'; end if;
  if char_length(trim(coalesce(p_title,'')))<3 or char_length(p_title)>220 or char_length(coalesce(p_executive_summary,''))>2400 or char_length(coalesce(p_prepared_by,''))>120 then raise exception 'invalid_governance_report'; end if;
  if p_report_type='access_review' then
    if p_source_review_id is null or not exists(select 1 from public.zgirl_tenant_access_reviews where id=p_source_review_id and institution_id=p_institution_id and status='completed') then raise exception 'completed_access_review_required'; end if;
  elsif p_source_review_id is not null and not exists(select 1 from public.zgirl_tenant_access_reviews where id=p_source_review_id and institution_id=p_institution_id) then raise exception 'access_review_not_found';
  end if;
  v_snapshot:=private.zgirl_tenant_governance_snapshot(p_institution_id,p_period_start,p_period_end,p_source_review_id);
  v_code:='ZG-GR-'||to_char(current_date,'YYYY')||'-'||upper(substr(encode(extensions.gen_random_bytes(6),'hex'),1,10));
  insert into public.zgirl_tenant_governance_reports(report_code,institution_id,report_type,source_review_id,period_start,period_end,title,executive_summary,prepared_by,prepared_by_operator_id,snapshot)
  values(v_code,p_institution_id,p_report_type,p_source_review_id,p_period_start,p_period_end,trim(p_title),trim(coalesce(p_executive_summary,'')),trim(coalesce(p_prepared_by,'')),v_operator,v_snapshot) returning id into v_id;
  return v_id;
end; $$;

create or replace function public.zgirl_tenant_finalize_governance_report(p_session_token text,p_report_id uuid)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_inst uuid; v_status text; v_context jsonb; v_operator uuid;
begin
  select institution_id,status into v_inst,v_status from public.zgirl_tenant_governance_reports where id=p_report_id;
  if v_inst is null then raise exception 'governance_report_not_found'; end if;
  v_context:=private.zgirl_tenant_require_access(p_session_token,v_inst,'owner'); v_operator:=nullif(v_context->>'operatorId','')::uuid;
  if v_status<>'draft' then raise exception 'governance_report_not_draft'; end if;
  update public.zgirl_tenant_governance_reports set status='finalized',finalized_by_operator_id=v_operator,finalized_at=now(),updated_at=now() where id=p_report_id;
  return true;
end; $$;

create or replace function public.zgirl_tenant_prepare_attestation(p_session_token text,p_institution_id uuid,p_report_id uuid,p_attestation_type text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_context jsonb; v_operator uuid; v_id uuid; v_code text; v_review uuid;
begin
  v_context:=private.zgirl_tenant_require_access(p_session_token,p_institution_id,'manage'); v_operator:=nullif(v_context->>'operatorId','')::uuid;
  if p_attestation_type not in ('access_review_completion','annual_access_governance','sso_readiness','offboarding_closeout') then raise exception 'invalid_access_attestation_type'; end if;
  select source_review_id into v_review from public.zgirl_tenant_governance_reports where id=p_report_id and institution_id=p_institution_id and status='finalized';
  if not found then raise exception 'finalized_governance_report_required'; end if;
  v_code:='ZG-AT-'||to_char(current_date,'YYYY')||'-'||upper(substr(encode(extensions.gen_random_bytes(6),'hex'),1,10));
  insert into public.zgirl_tenant_access_attestations(attestation_code,institution_id,report_id,review_id,attestation_type,prepared_by_operator_id)
  values(v_code,p_institution_id,p_report_id,v_review,p_attestation_type,v_operator) returning id into v_id;
  return v_id;
end; $$;

create or replace function public.zgirl_tenant_attest_access_governance(p_session_token text,p_attestation_id uuid,p_attestor_name text,p_attestor_title text,p_statement text,p_reference text)
returns boolean language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_inst uuid; v_status text; v_context jsonb; v_operator uuid;
begin
  select institution_id,status into v_inst,v_status from public.zgirl_tenant_access_attestations where id=p_attestation_id;
  if v_inst is null then raise exception 'access_attestation_not_found'; end if;
  v_context:=private.zgirl_tenant_require_access(p_session_token,v_inst,'owner'); v_operator:=nullif(v_context->>'operatorId','')::uuid;
  if v_status<>'draft' then raise exception 'access_attestation_not_draft'; end if;
  if char_length(trim(coalesce(p_attestor_name,'')))<2 or char_length(p_attestor_name)>120 or char_length(trim(coalesce(p_attestor_title,'')))<2 or char_length(p_attestor_title)>160 or char_length(trim(coalesce(p_statement,'')))<10 or char_length(p_statement)>1800 or char_length(coalesce(p_reference,''))>300 then raise exception 'invalid_access_attestation'; end if;
  update public.zgirl_tenant_access_attestations set status='attested',attestor_name=trim(p_attestor_name),attestor_title=trim(p_attestor_title),statement=trim(p_statement),reference=trim(coalesce(p_reference,'')),attested_by_operator_id=v_operator,attested_at=now(),updated_at=now() where id=p_attestation_id;
  return true;
end; $$;

create or replace function public.zgirl_tenant_create_audit_package(p_session_token text,p_report_id uuid,p_package_type text,p_generated_by text)
returns uuid language plpgsql security definer set search_path=pg_catalog,public,private,extensions as $$
declare v_report public.zgirl_tenant_governance_reports%rowtype; v_context jsonb; v_operator uuid; v_id uuid; v_code text; v_manifest jsonb;
begin
  select * into v_report from public.zgirl_tenant_governance_reports where id=p_report_id;
  if v_report.id is null then raise exception 'governance_report_not_found'; end if;
  v_context:=private.zgirl_tenant_require_access(p_session_token,v_report.institution_id,'owner'); v_operator:=nullif(v_context->>'operatorId','')::uuid;
  if v_report.status<>'finalized' then raise exception 'finalized_governance_report_required'; end if;
  if p_package_type not in ('access_review_evidence','annual_governance','sso_readiness','offboarding_closeout') then raise exception 'invalid_audit_package_type'; end if;
  if char_length(coalesce(p_generated_by,''))>120 then raise exception 'invalid_audit_package'; end if;
  v_manifest:=jsonb_build_object(
    'schemaVersion','zgirl-audit-package-v3.7',
    'report',jsonb_build_object('id',v_report.id,'reportCode',v_report.report_code,'reportType',v_report.report_type,'periodStart',v_report.period_start,'periodEnd',v_report.period_end,'finalizedAt',v_report.finalized_at),
    'sourceReviewId',v_report.source_review_id,
    'attestations',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'attestationCode',a.attestation_code,'attestationType',a.attestation_type,'status',a.status,'attestorName',a.attestor_name,'attestorTitle',a.attestor_title,'reference',a.reference,'attestedAt',a.attested_at) order by a.created_at) from public.zgirl_tenant_access_attestations a where a.report_id=v_report.id),'[]'::jsonb),
    'evidenceSections',jsonb_build_array('institution','reportingPeriod','accessSchedule','currentAccess','reviewHistory','sourceReview','ssoReadiness','offboardingHistory','administrativeContext','evidenceBoundary'),
    'authorityBoundary',jsonb_build_object('systemOwnerGenerated',true,'autoPermissionChange',false,'autoLicenseChange',false,'autoCredentialChange',false,'regulatoryCertification',false),
    'createdAt',now()
  );
  v_code:='ZG-AP-'||to_char(current_date,'YYYY')||'-'||upper(substr(encode(extensions.gen_random_bytes(6),'hex'),1,10));
  insert into public.zgirl_tenant_audit_packages(package_code,institution_id,report_id,source_review_id,package_type,generated_by,generated_by_operator_id,manifest)
  values(v_code,v_report.institution_id,v_report.id,v_report.source_review_id,p_package_type,trim(coalesce(p_generated_by,'')),v_operator,v_manifest) returning id into v_id;
  return v_id;
end; $$;

create or replace function public.zgirl_tenant_governance_report_packet(p_session_token text,p_report_id uuid)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public,private as $$
declare v_report public.zgirl_tenant_governance_reports%rowtype; v_context jsonb; v_inst public.zgirl_institutions%rowtype;
begin
  select * into v_report from public.zgirl_tenant_governance_reports where id=p_report_id;
  if v_report.id is null then raise exception 'governance_report_not_found'; end if;
  v_context:=private.zgirl_tenant_require_access(p_session_token,v_report.institution_id,'read');
  select * into v_inst from public.zgirl_institutions where id=v_report.institution_id;
  return jsonb_build_object(
    'context',v_context,
    'institution',jsonb_build_object('id',v_inst.id,'name',v_inst.name,'institutionCode',v_inst.institution_code,'institutionType',v_inst.institution_type,'status',v_inst.status),
    'report',jsonb_build_object('id',v_report.id,'reportCode',v_report.report_code,'reportType',v_report.report_type,'status',v_report.status,'sourceReviewId',v_report.source_review_id,'periodStart',v_report.period_start,'periodEnd',v_report.period_end,'title',v_report.title,'executiveSummary',v_report.executive_summary,'preparedBy',v_report.prepared_by,'createdAt',v_report.created_at,'finalizedAt',v_report.finalized_at,'snapshot',v_report.snapshot),
    'attestations',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'attestationCode',a.attestation_code,'attestationType',a.attestation_type,'status',a.status,'attestorName',a.attestor_name,'attestorTitle',a.attestor_title,'statement',a.statement,'reference',a.reference,'createdAt',a.created_at,'attestedAt',a.attested_at) order by a.created_at) from public.zgirl_tenant_access_attestations a where a.report_id=v_report.id),'[]'::jsonb),
    'packages',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'packageCode',p.package_code,'packageType',p.package_type,'status',p.status,'generatedBy',p.generated_by,'createdAt',p.created_at,'manifest',p.manifest) order by p.created_at) from public.zgirl_tenant_audit_packages p where p.report_id=v_report.id),'[]'::jsonb)
  );
end; $$;

revoke all on function public.zgirl_tenant_evidence_dashboard(text,uuid) from public;
revoke all on function public.zgirl_tenant_create_governance_report(text,uuid,text,date,date,uuid,text,text,text) from public;
revoke all on function public.zgirl_tenant_finalize_governance_report(text,uuid) from public;
revoke all on function public.zgirl_tenant_prepare_attestation(text,uuid,uuid,text) from public;
revoke all on function public.zgirl_tenant_attest_access_governance(text,uuid,text,text,text,text) from public;
revoke all on function public.zgirl_tenant_create_audit_package(text,uuid,text,text) from public;
revoke all on function public.zgirl_tenant_governance_report_packet(text,uuid) from public;

grant execute on function public.zgirl_tenant_evidence_dashboard(text,uuid) to anon, authenticated;
grant execute on function public.zgirl_tenant_create_governance_report(text,uuid,text,date,date,uuid,text,text,text) to anon, authenticated;
grant execute on function public.zgirl_tenant_finalize_governance_report(text,uuid) to anon, authenticated;
grant execute on function public.zgirl_tenant_prepare_attestation(text,uuid,uuid,text) to anon, authenticated;
grant execute on function public.zgirl_tenant_attest_access_governance(text,uuid,text,text,text,text) to anon, authenticated;
grant execute on function public.zgirl_tenant_create_audit_package(text,uuid,text,text) to anon, authenticated;
grant execute on function public.zgirl_tenant_governance_report_packet(text,uuid) to anon, authenticated;
