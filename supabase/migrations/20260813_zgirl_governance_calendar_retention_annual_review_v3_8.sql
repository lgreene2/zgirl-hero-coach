-- Z-Girl v3.8 governance calendar and annual review schema
-- Administrative metadata only. No automatic deletion, attestation, access change, credential action, or legal/compliance determination.

create table if not exists public.zgirl_governance_calendar_settings (
 institution_id uuid primary key references public.zgirl_institutions(id), enabled boolean not null default true,
 annual_review_month integer not null default 12 check (annual_review_month between 1 and 12), annual_review_day integer not null default 15 check (annual_review_day between 1 and 28),
 annual_review_lead_days integer not null default 30 check (annual_review_lead_days between 7 and 180), evidence_review_interval_months integer not null default 12 check (evidence_review_interval_months between 1 and 60),
 retention_months integer check (retention_months is null or retention_months between 1 and 300), retention_policy_label text not null default 'Institution-defined administrative retention schedule' check (char_length(retention_policy_label)<=220),
 governance_owner_name text not null default '' check (char_length(governance_owner_name)<=120), notes text not null default '' check (char_length(notes)<=1600), created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.zgirl_governance_annual_review_cycles (
 id uuid primary key default gen_random_uuid(), cycle_code text not null unique, institution_id uuid not null references public.zgirl_institutions(id), cycle_year integer not null check (cycle_year between 2020 and 2100),
 status text not null default 'open' check (status in ('planning','open','evidence_pending','attestation_pending','package_pending','ready_to_close','completed','cancelled')),
 period_start date not null, period_end date not null, window_open_date date not null, due_date date not null, owner_name text not null default '' check (char_length(owner_name)<=120),
 governance_report_id uuid references public.zgirl_tenant_governance_reports(id), attestation_id uuid references public.zgirl_tenant_access_attestations(id), audit_package_id uuid references public.zgirl_tenant_audit_packages(id),
 summary text not null default '' check (char_length(summary)<=2000), completed_by_operator_id uuid references public.zgirl_operator_identities(id), completed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(institution_id,cycle_year), check(period_start<=period_end and window_open_date<=due_date));
create index if not exists zgirl_governance_annual_cycles_due_idx on public.zgirl_governance_annual_review_cycles(institution_id,status,due_date);

create table if not exists public.zgirl_governance_calendar_items (
 id uuid primary key default gen_random_uuid(), calendar_code text not null unique, institution_id uuid not null references public.zgirl_institutions(id),
 item_type text not null check (item_type in ('annual_review','access_review','governance_report','attestation','audit_package','retention_review','sso_review','offboarding_review','license_renewal','credential_capacity','custom')),
 status text not null default 'scheduled' check (status in ('scheduled','due','in_progress','completed','cancelled')), title text not null check(char_length(title) between 2 and 220), window_open_date date, due_date date not null,
 owner_name text not null default '' check(char_length(owner_name)<=120), source_type text not null default '' check(char_length(source_type)<=60), source_id uuid, source_code text not null default '' check(char_length(source_code)<=100),
 notes text not null default '' check(char_length(notes)<=1200), completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists zgirl_governance_calendar_due_idx on public.zgirl_governance_calendar_items(institution_id,status,due_date);
create unique index if not exists zgirl_governance_calendar_source_unique on public.zgirl_governance_calendar_items(institution_id,item_type,source_type,source_id) where source_id is not null and status<>'cancelled';

create table if not exists public.zgirl_evidence_retention_records (
 id uuid primary key default gen_random_uuid(), retention_code text not null unique, institution_id uuid not null references public.zgirl_institutions(id), evidence_type text not null check(evidence_type in ('governance_report','attestation','audit_package')),
 governance_report_id uuid references public.zgirl_tenant_governance_reports(id), attestation_id uuid references public.zgirl_tenant_access_attestations(id), audit_package_id uuid references public.zgirl_tenant_audit_packages(id),
 evidence_code text not null check(char_length(evidence_code) between 3 and 100), status text not null default 'active' check(status in ('active','review_due','hold','archive_candidate','archived')),
 retained_from date not null, next_review_date date not null, retention_until date, policy_label text not null default '' check(char_length(policy_label)<=220),
 last_review_action text check(last_review_action is null or last_review_action in ('retain','continue_review','hold','archive_candidate')), last_review_reference text not null default '' check(char_length(last_review_reference)<=300),
 last_reviewed_by_operator_id uuid references public.zgirl_operator_identities(id), last_reviewed_at timestamptz, disposition_approved_by_operator_id uuid references public.zgirl_operator_identities(id), disposition_approved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(num_nonnulls(governance_report_id,attestation_id,audit_package_id)=1), check(retention_until is null or retention_until>=retained_from));
create unique index if not exists zgirl_retention_report_unique on public.zgirl_evidence_retention_records(governance_report_id) where governance_report_id is not null;
create unique index if not exists zgirl_retention_attestation_unique on public.zgirl_evidence_retention_records(attestation_id) where attestation_id is not null;
create unique index if not exists zgirl_retention_package_unique on public.zgirl_evidence_retention_records(audit_package_id) where audit_package_id is not null;
create index if not exists zgirl_retention_review_due_idx on public.zgirl_evidence_retention_records(institution_id,status,next_review_date);

alter table public.zgirl_governance_calendar_settings enable row level security;
alter table public.zgirl_governance_annual_review_cycles enable row level security;
alter table public.zgirl_governance_calendar_items enable row level security;
alter table public.zgirl_evidence_retention_records enable row level security;
revoke all on public.zgirl_governance_calendar_settings from anon,authenticated;
revoke all on public.zgirl_governance_annual_review_cycles from anon,authenticated;
revoke all on public.zgirl_governance_calendar_items from anon,authenticated;
revoke all on public.zgirl_evidence_retention_records from anon,authenticated;
