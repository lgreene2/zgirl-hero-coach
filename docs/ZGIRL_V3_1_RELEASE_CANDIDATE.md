# Z-Girl v3.1 Release Candidate — Institutional Agreement, Renewal & Expansion Workflow

## Release objective
Operationalize institutional renewal, expansion, change-order, and Train-the-Trainer addendum decisions above the v3.0 license administration layer.

## Version
`package.json`: `3.1.0`

The legacy root version metadata in `package-lock.json` remains non-blocking and should be corrected during a normal npm-generated lockfile refresh rather than by manual editing.

## New public route
- `/institutions/agreement-workflow`

## New restricted routes
- `/institutions/ops/workflows`
- `/institutions/ops/workflows/packet/[id]`
- `/api/institutions/ops/workflows/dashboard`
- `/api/institutions/ops/workflows/action`

Restricted routes use the existing Credential Operations HttpOnly operator session.

## New database tables
- `zgirl_institution_agreements`
- `zgirl_institution_workflows`
- `zgirl_institution_evidence_packets`
- `zgirl_institution_approval_gates`
- `zgirl_institution_delivery_handoffs`

## New workflow controls
- structured administrative evidence packet
- Program Quality gate
- Privacy Governance gate
- Agreement Authority gate
- Commercial Authority gate
- Executive Release gate
- executed-agreement requirement
- release-review state
- contract-to-delivery handoff
- separate human release
- future effective-date scheduling
- automatic scheduled activation
- friendly duplicate open-workflow guard
- automatic linked-agreement workflow synchronization

## Renewal automation
`zgirl-institution-workflow-daily`

Schedule: `07 10 * * *` UTC.

Ordering:
1. Workflow/scheduled activation — 10:07 UTC
2. Credential renewal — 10:17 UTC
3. Institutional license lifecycle — 10:27 UTC

This ordering prevents an approved future-dated renewal from being processed as lapsed before its new scope activates.

## Governance boundaries
Release is blocked unless:
- evidence packet is Complete
- all required gates are Approved or formally Waived
- linked agreement is Executed
- requested limits are not below live allocation usage
- current license is not Suspended or Closed
- implementation owner is recorded

Payment cannot auto-approve a gate, execute an agreement, renew a license, expand scope, issue a credential, prepare a handoff, or release delivery.

## Privacy boundaries
No new workflow table or UI is designed to store:
- private participant reflection text
- youth/student/athlete rosters
- diagnoses
- counseling/therapy notes
- safeguarding narratives
- clinical records
- clergy/spiritual-direction records
- sports-medicine records

Evidence packets contain institutional administrative counts only.

## Commercial boundary
Paid launch remains governed separately through `/api/commerce/status`. v3.1 does not configure a seller, merchant of record, checkout links, or charitable donation flow.

## Verification checklist before merge
- [ ] Supabase migrations applied cleanly.
- [ ] New tables start clean unless real institutional data exists.
- [ ] Security advisor reviewed after DDL.
- [ ] Workflow cron exists and is active at 10:07 UTC.
- [ ] Existing credential and institutional license crons remain active.
- [ ] Package version reports 3.1.0.
- [ ] Reviewer activation self-test passes.
- [ ] Next.js production compilation passes.
- [ ] TypeScript passes.
- [ ] New public workflow page appears in route manifest.
- [ ] Restricted workflow console appears in route manifest.
- [ ] Restricted decision packet dynamic route appears in route manifest.
- [ ] New workflow APIs appear in route manifest.
- [ ] Unauthenticated workflow API returns 401.
- [ ] Restricted workflow page is noindex/nofollow.
- [ ] Public page returns 200 on custom domain after production merge.
- [ ] Exact-ID credential verification remains unchanged.
- [ ] Commerce status remains intentionally gated unless separately authorized.
