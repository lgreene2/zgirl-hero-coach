# Z-Girl v3.10 — Cross-Version Regression Matrix

## Purpose

This matrix defines the minimum proof required before the consolidated v3.4–v3.9 application can replace the current production v3.3 application.

The goal is not only to prove the newest features compile. The release must also prove that older credential, institutional, privacy, reviewer, and commerce boundaries remain intact.

## Build and release integrity

### R-001 — Release identity

Expected:

- `package.json` = `3.10.0`
- `lib/release.ts` = `3.10.0`
- release manifest = `3.10.0`
- `/api/release/status` reports `3.10.0` after deployment

Failure blocks release.

### R-002 — Release-train manifest

Expected:

- production parent = current `main`
- feature parent = verified v3.9 head
- v3.4–v3.9 PR/head inventory present
- required source migrations present
- known lockfile debt explicitly recorded until resolved

Failure blocks release.

### R-003 — Production build

Expected:

- reviewer activation self-test passes without exposing secrets
- release-train static verifier passes
- Next.js optimized production compile passes
- TypeScript passes
- route manifest contains all required consolidated routes

Failure blocks release.

### R-004 — Reviewer activation regression

Expected:

- activation scripts parse
- application builds
- confidential bundle generator exercise passes
- no secret contents are printed

Failure blocks release.

## Legacy participant and public product continuity

### P-001 — Core site

Public routes such as `/`, `/reflect`, `/journey`, `/safety`, `/faith`, `/athletes`, and `/edu` must remain buildable and reachable.

### P-002 — Accessibility boundary

Existing accessibility resources and participant pause/skip/stop/trusted-person patterns remain present. v3.10 does not replace them with institutional monitoring.

### P-003 — Commerce storefront continuity

The storefront and inquiry paths remain available, but paid checkout remains seller-gated.

## v2.8–v2.9 credential regression

### C-001 — Public exact-ID verification

Request:

`/api/credentials/verify?id=ZG-AF-2026-DEADBEEF00`

Expected:

- HTTP 200
- `found:false`
- `credential:null`
- no holder directory or fuzzy search

### C-002 — Restricted credential dashboard

Request without operator session:

`/api/credentials/ops/dashboard`

Expected: HTTP 401.

### C-003 — Credential claim boundary

Credential pages and records remain Z-Girl program authorization only; no professional licensure, academic accreditation, government certification, clinical qualification, or third-party professional-certification claim is introduced by v3.10.

## v3.0 license administration regression

### L-001 — Institutional dashboard authentication

Request without operator session:

`/api/institutions/ops/dashboard`

Expected: HTTP 401.

### L-002 — Agreement/license/payment separation

The consolidated application must not make payment equivalent to an executed agreement, active license, credential, or delivery release.

### L-003 — Adult roster boundary

Institutional roster operations remain limited to adult facilitator/trainer administration; youth/student/athlete participant rosters are not introduced by v3.10.

## v3.1 workflow regression

### W-001 — Workflow API authentication

Request without operator session:

`/api/institutions/ops/workflows/dashboard`

Expected: HTTP 401.

### W-002 — Human approval gates

Program Quality, Privacy Governance, Agreement Authority, Commercial Authority, and Executive Release remain explicit human gates.

### W-003 — Effective-date protection

A future-dated approved change must not prematurely mutate current license scope.

## v3.2 pipeline regression

### PL-001 — Pipeline API authentication

Request without operator session:

`/api/institutions/ops/pipeline/dashboard`

Expected: HTTP 401.

### PL-002 — Planning value boundary

Opportunity/proposal value remains planning metadata rather than payment status or recognized revenue.

### PL-003 — Accepted proposal boundary

Proposal acceptance does not activate an institutional license.

## v3.3 portfolio regression

### PF-001 — Portfolio API authentication

Request without operator session:

`/api/institutions/ops/portfolio/dashboard`

Expected: HTTP 401.

### PF-002 — Executive rating boundary

Portfolio health and expansion-readiness ratings remain institutional/business metadata, not participant or clinical scores.

## v3.4 executive briefing regression

### B-001 — Public executive briefing product

`/institutions/executive-briefing-automation`

Expected: HTTP 200 after consolidated deployment.

### B-002 — Briefing API authentication

`/api/institutions/ops/briefings/dashboard`

Expected without session: HTTP 401.

### B-003 — Delivery boundary

Briefing generation/delivery remains operator-controlled and does not autonomously send email or perform authority-changing actions.

## v3.5 identity/RBAC regression

### I-001 — Identity API authentication

`/api/institutions/ops/identity/dashboard`

Expected without session: HTTP 401.

### I-002 — Server-side capability enforcement

High-power institutional APIs must contain server-side capability/session enforcement. Browser visibility controls do not substitute for authorization.

### I-003 — Break-glass preservation

Emergency owner access remains available for recovery and first named System Owner bootstrap.

### I-004 — SSO boundary

Email-domain membership never auto-creates an operator or role. SSO proves identity; Z-Girl RBAC grants authority.

## v3.6 tenant/access-review regression

### T-001 — Tenant mode authentication

Request without session using a syntactically valid institution ID:

`/api/institutions/ops/dashboard?institutionId=00000000-0000-4000-8000-000000000000`

Expected: HTTP 401 before tenant data is returned.

### T-002 — Governance-calendar tenant mode authentication

`/api/institutions/ops/dashboard?mode=governanceCalendar&institutionId=00000000-0000-4000-8000-000000000000`

Expected without session: HTTP 401.

### T-003 — Access review authority

Access review decisions do not directly bypass the v3.5 System Owner identity-administration controls.

## v3.7 governance evidence regression

### E-001 — Public product

`/institutions/access-governance-evidence`

Expected: HTTP 200.

### E-002 — Evidence tenant mode authentication

`/api/institutions/ops/dashboard?mode=evidenceDashboard&institutionId=00000000-0000-4000-8000-000000000000`

Expected without session: HTTP 401.

### E-003 — Evidence claim boundary

Governance evidence is an administrative record, not regulatory certification, legal compliance opinion, accreditation, licensure, clinical documentation, or independent audit opinion.

## v3.8 governance calendar regression

### G-001 — Public governance-calendar product

`/institutions/governance-calendar`

Expected: HTTP 200.

### G-002 — Automation authority boundary

The 12:07 UTC governance job may open work windows/register review work but may not delete evidence, change access, issue credentials, activate licenses, execute agreements, attest records, or authorize commerce.

### G-003 — Retention boundary

Archive status is administrative metadata and does not delete underlying evidence.

## v3.9 board governance regression

### BG-001 — Public board-governance product

`/institutions/board-governance-reporting`

Expected: HTTP 200.

### BG-002 — Board dashboard authentication

Use a valid-shaped institution UUID and date range against:

`/api/institutions/ops/board-governance/dashboard`

Expected without session: HTTP 401.

### BG-003 — Export boundary

ICS/evidence CSV/action-owner CSV are read-only administrative exports and cannot change system authority.

### BG-004 — Board pack claim boundary

A finalized board pack is a frozen administrative snapshot, not an audit opinion, accreditation, regulatory certification, or legal compliance finding.

## Database regression

### DB-001 — RLS

Expected baseline:

- Z-Girl public tables: 43
- RLS-enabled Z-Girl public tables: 43
- direct anon/authenticated Z-Girl table grants: 0

Any exception blocks release until deliberately explained and reviewed.

### DB-002 — Migration inventory

All v3.4–v3.9 applied migration names in `release/zgirl-v3.10-release-train.json` must be present in the managed-cloud migration history.

### DB-003 — Empty institutional data baseline

At the v3.10 build checkpoint the following remain zero:

- institutions
- institutional licenses
- named operators
- role assignments
- credentials
- opportunities
- access reviews
- governance reports
- attestations
- audit packages
- calendar items
- annual cycles
- retention records
- executive briefings/deliveries
- board packs

Unexpected records require investigation; do not delete real records merely to restore a zero count.

## Scheduler regression

Expected active order:

1. `zgirl-tenant-access-review-daily` — 09:47 UTC
2. `zgirl-institution-workflow-daily` — 10:07 UTC
3. `zgirl-credential-renewal-daily` — 10:17 UTC
4. `zgirl-institution-license-daily` — 10:27 UTC
5. `zgirl-executive-briefing-daily` — 11:37 UTC
6. `zgirl-governance-calendar-daily` — 12:07 UTC

v3.9 board reporting remains human-generated and must not gain a scheduler as an incidental side effect of v3.10.

## Commerce regression

### COM-001 — Seller-first checkout

`getCheckoutLink()` must return `null` when no seller name is configured.

### COM-002 — HTTPS-only checkout

Configured checkout URLs must use HTTPS.

### COM-003 — Four checkout-required offers

Current checkout gate count: 4.

### COM-004 — Production paid-launch posture

Unless separately authorized, `/api/commerce/status` must report:

- `readyForPaidLaunch:false`

v3.10 release approval is not commercial activation approval.

## Runtime regression

After production deployment:

- inspect error/fatal logs
- investigate unexpected 5xx responses
- verify release status and custom-domain alias
- verify no secrets are emitted by the release status, commerce status, or reviewer tooling

## Release decision

v3.10 is production-ready only when the build gates, exact-head Preview, custom-domain production boundary suite, database checks, scheduler checks, and runtime checks all pass on the same release lineage.
