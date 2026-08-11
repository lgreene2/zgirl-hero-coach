# Z-Girl v3.2 Release Candidate — Institutional Partner Pipeline & Contract Operations

## Release objective
Operationalize the pre-contract side of the Z-Girl institutional lifecycle without creating a parallel license/credential authority system.

## Release assets
Public:
- `/institutions/partner-pipeline`

Restricted:
- `/institutions/ops/pipeline`
- `/institutions/ops/pipeline/packet/[id]`
- `/api/institutions/ops/pipeline/dashboard`
- `/api/institutions/ops/pipeline/action`

Docs:
- `ZGIRL_V3_2_PARTNER_PIPELINE_CONTRACT_OPS.md`
- `ZGIRL_V3_2_OPERATOR_RUNBOOK.md`
- `ZGIRL_INSTITUTIONAL_FIT_REVIEW_TEMPLATE.md`
- `ZGIRL_INSTITUTIONAL_PROPOSAL_SOW_TEMPLATE.md`

Migration:
- `20260811_zgirl_partner_pipeline_contract_ops_v3_2.sql`

## Database additions
- `zgirl_partner_opportunities`
- `zgirl_partner_contacts`
- `zgirl_partner_activities`
- `zgirl_partner_proposals`
- `zgirl_partner_followups`

v3.1 integration adds `initial_contract` as a governed workflow type.

## Required release checks
- [ ] package version is 3.2.0.
- [ ] reviewer activation safety self-test passes.
- [ ] Next.js production build passes.
- [ ] TypeScript passes.
- [ ] public partner-pipeline route generates and returns 200.
- [ ] restricted partner-pipeline route contains `noindex, nofollow`.
- [ ] restricted pipeline dashboard API returns 401 without operator session.
- [ ] restricted pipeline action API returns 401 without operator session.
- [ ] v3.1 workflow API still rejects unauthenticated access.
- [ ] unknown exact credential ID returns `found:false`.
- [ ] commerce status remains seller=false, checkout 0/4, readyForPaidLaunch=false.
- [ ] five pipeline tables remain clean unless real institutional data has intentionally been entered.
- [ ] v3.1 cron order remains 10:07 / 10:17 / 10:27 UTC.
- [ ] no production runtime errors after release.

## Security interpretation
The Z-Girl operator architecture intentionally exposes selected `SECURITY DEFINER` RPC entry points through Supabase REST because the browser/server app uses a publishable key. Every administrative RPC requires the separate high-entropy, hashed, unexpired Credential Operations session token. Direct table reads/writes are denied for anon/authenticated roles.

Supabase advisor may therefore flag the RPC entry point as callable by anon/authenticated. That warning does not mean the administrative operation is sessionless; release testing must prove a missing/invalid operator session cannot read or mutate pipeline data.

## Privacy boundary
No participant reflection text, student/youth/athlete case data, diagnosis, counseling/therapy record, safeguarding narrative, clinical record, clergy/spiritual-direction record, or sports-medicine record belongs in v3.2.

## Authority boundary
Proposal acceptance can prepare a Draft license + Draft agreement + governed workflow. It cannot activate delivery. v3.1 remains the authority engine for evidence, approval gates, executed agreement, handoff, and human release.

## Commerce boundary
No merchant-of-record configuration or checkout activation is included in v3.2.
