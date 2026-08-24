-- Z-Girl v3.14 release-evidence relationship index hardening.
-- Kept separate from the already-applied feature migration so migration history stays append-only.

create index if not exists zgirl_pilot_release_evidence_reviewer_idx
  on public.zgirl_pilot_release_evidence(reviewed_by_operator_id)
  where reviewed_by_operator_id is not null;

create index if not exists zgirl_pilot_readiness_decisions_actor_idx
  on public.zgirl_pilot_readiness_decisions(decided_by_operator_id);

create index if not exists zgirl_pilot_readiness_decisions_supersedes_idx
  on public.zgirl_pilot_readiness_decisions(supersedes_decision_id)
  where supersedes_decision_id is not null;
