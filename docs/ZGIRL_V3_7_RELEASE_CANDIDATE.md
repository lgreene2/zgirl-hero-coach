# Z-Girl v3.7 Release Candidate

## Release
Institutional Access Review Evidence & Audit Pack

## Base
Stacked on verified v3.6 branch `zgirl-v3.6-tenant-dashboards-access-reviews`.
Do not merge v3.7 ahead of v3.6.

## Version
`zgirl-hero-coach@3.7.0`

## Product surfaces
- Public: `/institutions/access-governance-evidence`
- Session-gated workspace: `/institutions/governance-evidence`
- Package workspace: `/institutions/governance-evidence/packages`
- Printable report: `/institutions/governance-evidence/report/[id]`
- Compatibility redirect: `/institutions/ops/evidence/report/[id]`

## Database objects
- `zgirl_tenant_governance_reports`
- `zgirl_tenant_access_attestations`
- `zgirl_tenant_audit_packages`

All new public tables must have RLS enabled with zero direct anon/authenticated table grants.

## Authority model
Institutional Admin:
- prepare draft governance reports within assigned tenant scope
- prepare draft attestations against finalized reports

System Owner:
- finalize governance report
- record attestation
- generate audit-package manifest

## Evidence types
- completed access-review evidence
- annual access-governance evidence
- SSO-readiness evidence
- offboarding closeout evidence

## Privacy boundary
Never include participant reflection text, youth/student/athlete case data, diagnosis/treatment data, counseling notes, safeguarding narratives, clergy/spiritual-direction records, sports-medicine records, credential assessment answers, practicum detail, or payment-card data.

## Operational boundary
Report preparation/finalization/attestation/package generation must not automatically:
- change role assignments
- revoke sessions
- activate SSO
- activate/renew/expand a license
- issue/renew/status a credential
- execute an agreement or approval gate
- release implementation
- recognize payment/revenue

## QA gates
- package version 3.7.0
- reviewer activation self-test passes
- Next.js production build passes
- TypeScript passes
- public v3.7 product route in manifest
- session-gated evidence route in manifest
- package route in manifest
- printable report route in manifest
- compatibility redirect in manifest
- existing identity/tenant APIs remain protected
- new evidence tables RLS enabled / direct grants zero
- staging has zero synthetic reports/attestations/packages
- commerce remains unchanged unless separately authorized
- Vercel Preview remains suppressed while prior stacked releases are held

## Release posture
This branch is a release candidate only until the v3.4–v3.6 stack can be safely advanced and production/custom-domain verification can be completed in order.
