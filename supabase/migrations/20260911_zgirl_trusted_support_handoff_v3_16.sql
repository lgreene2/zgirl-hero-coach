-- Applied to Greene-controlled Supabase project on 2026-09-11.
-- Purpose: secure, expiring participant-to-supporter handoff and return loop.
-- Direct table access remains revoked; only narrow SECURITY DEFINER RPCs are executable by publishable-key clients.

create extension if not exists pgcrypto;

create table if not exists public.zgirl_trusted_support_handoffs (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('parent','coach','educator','therapist','faith','mentor')),
  age_band text not null check (age_band in ('child','teen','adult')),
  supporter_name text,
  brief text not null check (char_length(brief) between 1 and 12000),
  selected_fields jsonb not null default '[]'::jsonb,
  supporter_token_hash text not null unique,
  participant_token_hash text not null unique,
  supporter_response text,
  next_focus text,
  status text not null default 'shared' check (status in ('shared','opened','responded','closed')),
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  responded_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days')
);

alter table public.zgirl_trusted_support_handoffs enable row level security;
revoke all on table public.zgirl_trusted_support_handoffs from anon, authenticated;

-- See the applied migration in Supabase migration history for the current RPC definitions:
-- zgirl_create_trusted_support_handoff
-- zgirl_view_trusted_support_handoff
-- zgirl_respond_trusted_support_handoff
-- zgirl_close_trusted_support_handoff
