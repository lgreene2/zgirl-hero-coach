-- Z-Girl v3.9 Board Governance Calendar, Executive Evidence Pack & Calendar Export
-- Administrative governance evidence only. No participant reflection/case data and no compliance certification.

create table if not exists public.zgirl_board_governance_packs (
  id uuid primary key default gen_random_uuid(),
  pack_code text not null unique,
  institution_id uuid not null references public.zgirl_institutions(id),
  annual_cycle_id uuid references public.zgirl_governance_annual_review_cycles(id),
  period_start date not null,
  period_end date not null,
  title text not null check (char_length(title) between 3 and 220),
  prepared_for text not null default '' check (char_length(prepared_for) <= 220),
  prepared_by text not null default '' check (char_length(prepared_by) <= 120),
  executive_summary text not null default '' check (char_length(executive_summary) <= 3000),
  status text not null default 'draft' check (status in ('draft','finalized','archived')),
  snapshot jsonb not null default '{}'::jsonb,
  created_by_operator_id uuid references public.zgirl_operator_identities(id),
  finalized_by_operator_id uuid references public.zgirl_operator_identities(id),
  archived_by_operator_id uuid references public.zgirl_operator_identities(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finalized_at timestamptz,
  archived_at timestamptz,
  check (period_start <= period_end)
);

create index if not exists zgirl_board_governance_packs_institution_idx
  on public.zgirl_board_governance_packs(institution_id, period_end desc, created_at desc);

alter table public.zgirl_board_governance_packs enable row level security;
revoke all on public.zgirl_board_governance_packs from anon, authenticated;

comment on table public.zgirl_board_governance_packs is
  'Frozen administrative governance snapshots for authorized institutional board/executive review. Excludes participant reflection and case data.';
