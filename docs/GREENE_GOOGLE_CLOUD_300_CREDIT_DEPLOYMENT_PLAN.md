# Greene Google Cloud $300 Welcome Credit Deployment Plan

Status: Planning / governance artifact
Window: 90 days from Google Cloud welcome-credit activation
Scope: Greene ecosystem infrastructure only. Gemini API usage is billed separately and is not assumed to be covered by the welcome credit.

## Objective

Use the Google Cloud welcome credit to strengthen capabilities the Greene ecosystem actually needs without duplicating Vercel, Supabase, or existing governed storage/runtime services.

## Guardrails

1. Do not migrate working production systems simply to consume credit.
2. Do not create duplicate identity, storage, database, or orchestration layers without a documented capability gap.
3. Keep The 4 Lessons / Z-Girl learner reflection privacy boundary intact: raw private learner reflections do not flow into institutional dashboards.
4. Keep Gemini API billing separate from welcome-credit accounting.
5. Prefer small, reversible pilots with spend caps and clear teardown dates.
6. No public release, institutional data migration, or permanent architecture change solely because the credit exists.

## 90-Day Allocation Framework

### Lane A — Greene Communications Router / secure backend workers
Target envelope: up to $90

Use Cloud Run for narrowly scoped services where Google Cloud adds clear value beyond Vercel serverless functions, such as long-running or integration-heavy backend workers, secure connector mediation, scheduled export jobs, and governance evidence packaging.

Success gate: at least one reusable service demonstrates lower operational friction or a capability unavailable in the current stack.

### Lane B — Governed backup and portability storage
Target envelope: up to $60

Use Cloud Storage for encrypted backups / portability copies of governed manifests, release receipts, approved media masters, and export bundles. Supabase remains the active governed application store unless a formal migration decision is made.

Success gate: automated restore test from a Greene-controlled backup package.

### Lane C — Analytics / institutional reporting prototype
Target envelope: up to $45

Test BigQuery only for aggregate, non-sensitive implementation/outcomes data where cross-program institutional reporting would materially improve. Do not ingest raw private learner reflections.

Success gate: one aggregate dashboard/report query with documented source lineage and zero private-reflection leakage.

### Lane D — AI Lab cloud experiment
Target envelope: up to $75

Use a small Compute Engine or Cloud Run GPU/CPU experiment only when a defined Greene workload benefits from cloud compute. Compare cost, security, setup burden, and repeatability against RunPod/current providers before making any permanent infrastructure decision.

Success gate: written benchmark and keep/stop recommendation.

### Lane E — Reserve / overage buffer
Target envelope: up to $30

Hold for egress, logging, monitoring, test databases, or short-lived services required by the four lanes above.

## Phase Plan

### Days 1–15 — Inventory and controls
- Confirm credit expiration date and billing account.
- Add budget alerts and service-specific spend monitoring.
- Inventory Vercel, Supabase, RunPod, Google Cloud, and Greene repos to identify actual capability gaps.
- Select no more than two first pilots.

### Days 16–45 — First production-adjacent pilots
- Pilot Cloud Run worker for Greene Communications Router or artifact export.
- Pilot governed Cloud Storage backup/restore.
- Capture spend and operational evidence weekly.

### Days 46–70 — Institutional / AI Lab experiments
- Run aggregate analytics prototype if justified.
- Run one cloud AI-lab benchmark if justified.
- Tear down anything not earning its keep.

### Days 71–90 — Consolidate before expiration
- Export evidence and cost report.
- Remove idle resources.
- Decide what remains after credits expire.
- No service continues into paid operation without an explicit keep decision and expected monthly cost.

## Do-Not-Duplicate Matrix

| Capability | Existing primary system | Google Cloud role |
| --- | --- | --- |
| Web/app deployment | Vercel | Add only when Cloud Run materially improves backend execution |
| App database / governed staging | Supabase | No duplicate database by default |
| Auth / application identity | Existing ecosystem auth + Google integrations | Do not replace without architecture decision |
| Governed Z-Girl candidate storage | Supabase private storage | Backup / portability only unless formally changed |
| Gemini voice generation | Gemini API paid tier | Separate billing; not charged against welcome-credit plan |
| Heavy media/GPU production | Current governed provider routing / RunPod as applicable | Benchmark only where useful |
| Institutional analytics | Existing application reporting | BigQuery pilot for aggregate data only |

## Weekly Executive Check

Track: credit remaining, spend by service, active resources, completed experiments, duplicate infrastructure risk, security/privacy issues, teardown candidates, and next 7-day decision.

## Exit Criteria

The welcome-credit program is successful if at least one durable Greene capability is strengthened, all unused experiments are removed, no surprise recurring spend remains, and the architecture is simpler or more capable—not merely larger.
