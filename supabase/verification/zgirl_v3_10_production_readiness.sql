-- Z-Girl v3.10 production-readiness verification
-- READ ONLY. This file must not mutate schema, data, roles, grants, jobs, or migration history.

-- 1. Applied Z-Girl migration inventory.
select version, name
from supabase_migrations.schema_migrations
where name like 'zgirl_%'
order by version;

-- 2. Every public Z-Girl table must have RLS enabled.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname like 'zgirl_%'
order by c.relname;

-- 3. Direct anon/authenticated Z-Girl table grants must remain empty.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name like 'zgirl_%'
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- 4. Consolidated RLS/grant summary.
with t as (
  select c.relname, c.relrowsecurity
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relname like 'zgirl_%'
), g as (
  select table_name, count(*)::int as direct_grants
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name like 'zgirl_%'
    and grantee in ('anon', 'authenticated')
  group by table_name
)
select
  (select count(*) from t) as zgirl_public_tables,
  (select count(*) from t where relrowsecurity) as rls_enabled_tables,
  (select coalesce(sum(direct_grants), 0) from g) as direct_anon_authenticated_grants,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'table', t.relname,
        'rls', t.relrowsecurity,
        'directGrants', coalesce(g.direct_grants, 0)
      ) order by t.relname
    )
    from t
    left join g on g.table_name = t.relname
    where not t.relrowsecurity or coalesce(g.direct_grants, 0) > 0
  ), '[]'::jsonb) as exceptions;

-- 5. Operational record counts. Zero is the v3.10 build baseline, but do not delete legitimate
-- future records merely to reproduce the original zero baseline.
select jsonb_build_object(
  'institutions', (select count(*) from public.zgirl_institutions),
  'licenses', (select count(*) from public.zgirl_institution_licenses),
  'opportunities', (select count(*) from public.zgirl_partner_opportunities),
  'operators', (select count(*) from public.zgirl_operator_identities),
  'roleAssignments', (select count(*) from public.zgirl_operator_role_assignments),
  'credentials', (select count(*) from public.zgirl_credentials),
  'accessReviews', (select count(*) from public.zgirl_tenant_access_reviews),
  'governanceReports', (select count(*) from public.zgirl_tenant_governance_reports),
  'attestations', (select count(*) from public.zgirl_tenant_access_attestations),
  'auditPackages', (select count(*) from public.zgirl_tenant_audit_packages),
  'calendarItems', (select count(*) from public.zgirl_governance_calendar_items),
  'annualCycles', (select count(*) from public.zgirl_governance_annual_review_cycles),
  'retentionRecords', (select count(*) from public.zgirl_evidence_retention_records),
  'executiveBriefings', (select count(*) from public.zgirl_executive_briefings),
  'briefingDeliveries', (select count(*) from public.zgirl_executive_briefing_deliveries),
  'boardPacks', (select count(*) from public.zgirl_board_governance_packs)
) as operational_counts;

-- 6. Scheduled governance jobs and ordering.
select jobid, jobname, schedule, active
from cron.job
where jobname in (
  'zgirl-tenant-access-review-daily',
  'zgirl-institution-workflow-daily',
  'zgirl-credential-renewal-daily',
  'zgirl-institution-license-daily',
  'zgirl-executive-briefing-daily',
  'zgirl-governance-calendar-daily'
)
order by
  case jobname
    when 'zgirl-tenant-access-review-daily' then 1
    when 'zgirl-institution-workflow-daily' then 2
    when 'zgirl-credential-renewal-daily' then 3
    when 'zgirl-institution-license-daily' then 4
    when 'zgirl-executive-briefing-daily' then 5
    when 'zgirl-governance-calendar-daily' then 6
    else 99
  end;

-- 7. Critical v3.4-v3.9 secured function inventory.
select n.nspname as schema_name, p.proname, pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where (n.nspname = 'public' or n.nspname = 'private')
  and p.proname in (
    'zgirl_executive_briefing_dashboard',
    'zgirl_executive_briefing_generate',
    'zgirl_identity_dashboard',
    'zgirl_identity_authorize',
    'zgirl_tenant_directory',
    'zgirl_tenant_dashboard',
    'zgirl_tenant_access_review_packet',
    'zgirl_tenant_evidence_dashboard',
    'zgirl_tenant_governance_report_packet',
    'zgirl_governance_calendar_dashboard',
    'zgirl_board_governance_dashboard',
    'zgirl_board_pack_packet'
  )
order by n.nspname, p.proname;
