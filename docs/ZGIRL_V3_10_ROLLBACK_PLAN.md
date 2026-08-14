# Z-Girl v3.10 — Production Rollback Plan

## Rollback philosophy

v3.10 consolidates application code whose v3.4–v3.9 database schema is already present in the managed-cloud Supabase project. The safest rollback is therefore **application-first**: restore the prior verified production deployment while leaving additive database schema in place unless a specific database defect requires a separate controlled change.

Do not attempt an automatic destructive database rollback.

## Recorded pre-cutover application rollback point

At v3.10 build time:

- production `main`: `f92fa742199d8fbc5719ec8562e781f1b63af6ff`
- recorded Vercel production deployment: `dpl_Dzoz8yuouerxooTed6sWrWa4Zro8`
- production application family: v3.3 plus the activation-status documentation sync

Reconfirm the rollback point immediately before merge. If production moves, update the release record before cutover.

## Immediate rollback triggers

Rollback the application when any of these are confirmed after release:

- v3.10 production deployment fails or does not reach `READY`
- custom domain no longer resolves to the intended production deployment
- `/api/release/status` reports the wrong version or commit
- required public institutional routes fail materially
- an unauthenticated high-power institutional or credential API becomes accessible
- fake exact-format credential verification discloses a credential
- participant private-reflection administrative access is introduced
- commerce unexpectedly reports `readyForPaidLaunch:true` without separate commercial authorization
- persistent material 5xx/fatal runtime errors are attributable to v3.10
- named-identity/RBAC behavior prevents safe administrative recovery and break-glass access cannot resolve it

## Application rollback procedure

1. Stop further release-train cleanup. Do not close the superseded PRs yet.
2. Record the failing production deployment ID, production commit, failing routes, status codes, and relevant runtime request IDs.
3. Reassign production to the last verified pre-v3.10 Vercel deployment using the platform's normal rollback/promote mechanism.
4. Confirm `zgirlinitiative.org` resolves to the rollback deployment.
5. Re-run the legacy production boundaries that remain applicable:
   - public site reachable
   - Credential Operations API requires authentication
   - institutional portfolio API requires authentication
   - exact-format fake credential returns `found:false`
   - `/api/commerce/status` remains secret-safe and paid launch remains in the authorized state
6. Inspect runtime errors after rollback.
7. Keep the v3.10 PR open and document the failure before attempting a corrected candidate.

## Database posture during application rollback

The managed-cloud database already contains the additive v3.4–v3.9 schema before the v3.10 application cutover.

Therefore, an ordinary application rollback should **not**:

- drop v3.4–v3.9 tables
- drop identity/RBAC tables
- delete governance reports/evidence tables
- delete board-pack tables
- revoke or recreate database functions simply to match the older application
- erase migration history

The older v3.3 application ignores those additive surfaces.

At the recorded baseline there are no institutions, licenses, operators, credentials, governance reports, attestations, audit packages, board packs, or other live institutional operational records in these newer tables.

## Scheduled-job posture during rollback

The following jobs already exist before the application release:

- tenant access review — 09:47 UTC
- institutional workflow — 10:07 UTC
- credential renewal — 10:17 UTC
- institutional license — 10:27 UTC
- executive briefing — 11:37 UTC
- governance calendar — 12:07 UTC

With the current empty institutional data state, these jobs are designed to no-op or prepare only governed administrative work.

Do not unschedule all jobs reflexively during an application rollback.

If a specific scheduler is proven to cause the incident:

1. identify that job by exact name and job ID
2. capture its current schedule and command
3. disable only that job through a separately reviewed database action
4. restore it only after the corrected function is verified

## Commerce incident rollback

v3.10 does not activate commerce.

If commerce unexpectedly becomes ready during application cutover:

1. treat it as a configuration incident, not a reason to use donation checkout
2. inspect `ZGIRL_SELLER_NAME`, checkout-link configuration, and lead-delivery configuration
3. restore the intended commercial gate
4. verify `/api/commerce/status`
5. do not alter charitable donation configuration to solve a commercial-product problem

Commercial seller authority remains separate from Z-Girl software deployment.

## Identity incident rollback

If named identity/RBAC creates an administration problem after v3.10:

- use the existing break-glass owner path if available
- suspend or revoke the affected named operator session where appropriate
- do not expose internal session tokens to the browser or logs
- do not grant direct table access to work around authorization
- do not remove RLS
- do not convert all staff to System Owner

If application code must be rolled back, preserve identity/audit records for investigation.

## Data preservation

Never fix a release incident by deleting:

- identity audit history
- credential audit history
- access-review history
- governance reports
- attestations
- audit-package manifests
- board-pack snapshots

If future real records exist, those records are governance evidence and require their own retention/disposition process.

## Recovery release

A corrected v3.10 candidate must re-pass:

1. release-train static verification
2. exact-head GitHub build/TypeScript gate
3. Reviewer Activation CI
4. exact-head Vercel Preview
5. Preview checks
6. production deployment
7. custom-domain boundary suite
8. database/RLS/grant check
9. runtime error check

Do not reuse the failed deployment as evidence for the corrected head.

## Rollback success condition

Rollback is complete when the last verified application deployment is serving the custom domain, security/credential/commerce boundaries are re-proven, and the v3.10 release remains open for correction without destructive database changes.
