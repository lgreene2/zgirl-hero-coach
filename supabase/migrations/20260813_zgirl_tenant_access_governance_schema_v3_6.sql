-- Z-Girl v3.6 tenant access governance schema
-- Applied to Greene Managed Cloud Staging as zgirl_tenant_access_governance_schema_v3_6.
-- Administrative identity/access data only; no participant reflection or case data.

alter table public.zgirl_operator_role_assignments add column if not exists status text not null default 'active' check (status in ('active','revoked'));
alter table public.zgirl_operator_role_assignments add column if not exists revoked_at timestamptz;
alter table public.zgirl_operator_role_assignments add column if not exists updated_at timestamptz not null default now();

create table if not exists public.zgirl_tenant_access_review_schedules (
 institution_id uuid primary key references public.zgirl_institutions(id), enabled boolean not null default true,
 cadence text not null default 'quarterly' check (cadence in ('quarterly','semiannual','annual')),
 next_review_date date not null default (current_date + 90), owner_name text not null default '' check (char_length(owner_name)<=120), updated_at timestamptz not null default now());

create table if not exists public.zgirl_tenant_access_reviews (
 id uuid primary key default gen_random_uuid(), review_code text not null unique, institution_id uuid not null references public.zgirl_institutions(id),
 review_type text not null default 'quarterly' check (review_type in ('quarterly','semiannual','annual','event_driven','sso_activation')),
 status text not null default 'draft' check (status in ('draft','open','in_review','completed','cancelled')),
 period_start date, period_end date, due_at date, summary text not null default '' check (char_length(summary)<=1200),
 opened_by_operator_id uuid references public.zgirl_operator_identities(id), completed_by_operator_id uuid references public.zgirl_operator_identities(id),
 opened_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index if not exists zgirl_tenant_access_reviews_institution_idx on public.zgirl_tenant_access_reviews(institution_id,status,due_at);
create unique index if not exists zgirl_tenant_access_reviews_open_unique on public.zgirl_tenant_access_reviews(institution_id) where status in ('draft','open','in_review');

create table if not exists public.zgirl_tenant_access_review_items (
 id uuid primary key default gen_random_uuid(), review_id uuid not null references public.zgirl_tenant_access_reviews(id), role_assignment_id uuid references public.zgirl_operator_role_assignments(id),
 operator_id uuid references public.zgirl_operator_identities(id), institution_id uuid not null references public.zgirl_institutions(id),
 operator_name_snapshot text not null check (char_length(operator_name_snapshot) between 2 and 120), operator_email_snapshot text not null check (char_length(operator_email_snapshot)<=254),
 role_key_snapshot text not null, operator_status_snapshot text not null, auth_mode_snapshot text not null,
 decision text not null default 'pending' check (decision in ('pending','retain','change','remove')),
 recommended_role_key text check (recommended_role_key is null or recommended_role_key in ('institutional_admin','pipeline_manager','credential_admin')),
 decision_note text not null default '' check (char_length(decision_note)<=800), decided_by_operator_id uuid references public.zgirl_operator_identities(id), decided_at timestamptz,
 applied_by_operator_id uuid references public.zgirl_operator_identities(id), applied_at timestamptz, created_at timestamptz not null default now(), unique(review_id,role_assignment_id));
create index if not exists zgirl_tenant_access_review_items_review_idx on public.zgirl_tenant_access_review_items(review_id,decision);

create table if not exists public.zgirl_tenant_sso_onboarding (
 id uuid primary key default gen_random_uuid(), onboarding_code text not null unique, institution_id uuid not null unique references public.zgirl_institutions(id),
 status text not null default 'not_started' check (status in ('not_started','discovery','metadata_pending','configuration','testing','ready','active','paused','closed')),
 provider_type text not null default 'other' check (provider_type in ('entra_id','google_workspace','okta','auth0','onelogin','ping','other')),
 provider_name text not null default '' check (char_length(provider_name)<=120), domain_hint text not null default '' check (char_length(domain_hint)<=180),
 metadata_reference text not null default '' check (char_length(metadata_reference)<=300), configuration_reference text not null default '' check (char_length(configuration_reference)<=300),
 test_reference text not null default '' check (char_length(test_reference)<=300), technical_owner_name text not null default '' check (char_length(technical_owner_name)<=120),
 technical_owner_email text not null default '' check (char_length(technical_owner_email)<=254), activation_approval_reference text not null default '' check (char_length(activation_approval_reference)<=300),
 activation_approved_by_operator_id uuid references public.zgirl_operator_identities(id), activated_at timestamptz, notes text not null default '' check (char_length(notes)<=1200),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.zgirl_operator_offboarding_records (
 id uuid primary key default gen_random_uuid(), offboarding_code text not null unique, operator_id uuid not null references public.zgirl_operator_identities(id), institution_id uuid not null references public.zgirl_institutions(id),
 reason_code text not null check (reason_code in ('role_change','employment_end','contract_end','security','duplicate','other')), status text not null default 'planned' check (status in ('planned','completed','cancelled')),
 effective_at timestamptz not null default now(), reference text not null default '' check (char_length(reference)<=300), notes text not null default '' check (char_length(notes)<=800),
 requested_by_operator_id uuid references public.zgirl_operator_identities(id), executed_by_operator_id uuid references public.zgirl_operator_identities(id), requested_at timestamptz not null default now(),
 session_revoked_at timestamptz, roles_revoked_at timestamptz, completed_at timestamptz, updated_at timestamptz not null default now());
create index if not exists zgirl_operator_offboarding_institution_idx on public.zgirl_operator_offboarding_records(institution_id,status,effective_at);
create unique index if not exists zgirl_operator_offboarding_open_unique on public.zgirl_operator_offboarding_records(operator_id,institution_id) where status='planned';

alter table public.zgirl_tenant_access_review_schedules enable row level security;
alter table public.zgirl_tenant_access_reviews enable row level security;
alter table public.zgirl_tenant_access_review_items enable row level security;
alter table public.zgirl_tenant_sso_onboarding enable row level security;
alter table public.zgirl_operator_offboarding_records enable row level security;
