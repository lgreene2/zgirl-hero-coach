# Z-Girl v3.6 Release Candidate

## Release name
Institutional Tenant Dashboards, Access Reviews & SSO Onboarding

## Base
Stacked on the verified v3.5 identity/RBAC branch. Do not merge ahead of the v3.4/v3.5 release chain.

## Product assets
- Restricted tenant governance console: `/institutions/ops/tenant`
- Expanded public identity/access positioning: `/institutions/identity-access`
- Tenant governance architecture: `docs/ZGIRL_V3_6_TENANT_ACCESS_GOVERNANCE.md`

## Tenant console capabilities
- institution selector constrained by existing named-operator scope
- tenant overview for institution, licenses, sites, workflows and opportunities
- scoped named-operator summary
- recurring access-review schedule
- automatic due-review preparation
- human retain/change/remove access decisions
- completed access-review packet
- System Owner implementation-reference recording
- SSO readiness guidance
- event-driven offboarding review preparation

## Governance boundaries
- No participant private reflections in tenant governance.
- No diagnosis, treatment, clinical, clergy, safeguarding, sports-medicine, student/youth case, credential-answer, or practicum-detail data in tenant records.
- Automated access-review preparation never changes permissions.
- Tenant access review does not silently mutate v3.5 identity roles.
- Final role/session changes remain in v3.5 Identity & Access Administration.
- SSO readiness does not configure or activate an identity provider.
- SSO never auto-grants a Z-Girl role.
- Payment, agreement execution, training completion, or institutional affiliation do not automatically grant tenant authority.

## Database additions
- `zgirl_tenant_access_review_schedules`
- `zgirl_tenant_access_reviews`
- `zgirl_tenant_access_review_items`
- `zgirl_tenant_sso_onboarding`
- `zgirl_operator_offboarding_records`
- administrative status/history columns on `zgirl_operator_role_assignments`

## Database RPCs
- `zgirl_tenant_directory`
- `zgirl_tenant_dashboard`
- `zgirl_tenant_save_access_review_schedule`
- `zgirl_tenant_create_access_review`
- `zgirl_tenant_open_access_review`
- `zgirl_tenant_set_access_review_decision`
- `zgirl_tenant_complete_access_review`
- `zgirl_tenant_record_access_review_implementation`
- `zgirl_tenant_access_review_packet`

## Automation
- job: `zgirl-tenant-access-review-daily`
- cadence: daily at 09:47 UTC
- behavior: prepare due draft reviews only; no permission mutation

## Data state requirement
Before release, verify there are no synthetic institutions, operators, access reviews, review items, SSO records, or offboarding records left behind.

## Build gates
- package/build metadata reflects v3.6 release intent
- reviewer activation self-test passes
- Next.js production build passes
- TypeScript passes
- all tenant routes appear in route manifest
- existing credential verifier remains exact-ID only
- existing protected institutional APIs remain unauthorized without a valid session
- commerce launch state remains unchanged unless separately authorized

## Release posture
Until the preceding stacked releases are production-verified, v3.6 remains an independently verified release candidate and must not leapfrog them into production.
