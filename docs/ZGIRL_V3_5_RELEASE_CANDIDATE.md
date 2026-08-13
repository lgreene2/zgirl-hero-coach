# Z-Girl v3.5.0 — Release Candidate Checklist

## Release

Institutional Identity, Role-Based Access & SSO Foundation

## Required code state

- package version `3.5.0`
- v3.4 functionality remains present because v3.5 is stacked on the verified v3.4 head
- migration files source-controlled
- temporary Vercel branch suppression removed only after code review / hardening

## Identity data model

Verify:

- `zgirl_operator_identities` exists, RLS enabled, no direct anon/authenticated table grants
- `zgirl_operator_role_assignments` exists, RLS enabled, no direct anon/authenticated table grants
- `zgirl_operator_audit_events` exists, RLS enabled, no direct anon/authenticated table grants
- private operator credential/invite tables are not public
- credential sessions include optional operator identity + auth method
- current identity tables remain empty unless a real operator has deliberately been created

## Local named access

Verify:

- named login rejects unknown/inactive/non-local operator
- invitation is high entropy and expires after seven days
- invitation is single use
- personal access code must be 24+ characters
- only hashes are persisted
- successful login creates 12-hour session
- operator status suspension/disable revokes sessions
- auth mode changes revoke sessions
- personal access rotation revokes other sessions

## Role/capability matrix

Verify pure capability checks:

- System Owner -> all tested capabilities
- Executive -> workflow.release true; credential.issue false; identity.manage false
- Institutional Admin -> license.write true; workflow.approve true; workflow.release false
- Pipeline Manager -> pipeline.write/handoff true; credential.write false
- Credential Admin -> credential.issue/status true; pipeline.write false
- Auditor -> read capabilities true; write/release/issue false

## Scope behavior

Verify:

- global role can satisfy capability with or without institution id
- institution-scoped operational role satisfies capability only for matching institution
- institution-scoped role does not satisfy broad/global dashboard capability request
- global-only roles reject institution-scoped assignment

## API enforcement

Verify RBAC guard exists on:

- `/api/institutions/ops/portfolio/dashboard`
- `/api/institutions/ops/portfolio/action`
- `/api/institutions/ops/briefings/dashboard`
- `/api/institutions/ops/briefings/action`
- `/api/institutions/ops/briefings/packet`
- `/api/institutions/ops/pipeline/dashboard`
- `/api/institutions/ops/pipeline/action`
- `/api/institutions/ops/workflows/dashboard`
- `/api/institutions/ops/workflows/action`
- `/api/institutions/ops/dashboard`
- `/api/institutions/ops/action`
- `/api/institutions/ops/roster`
- `/api/credentials/ops/dashboard`
- `/api/credentials/ops/action`
- `/api/credentials/ops/candidate`
- `/api/credentials/ops/roster`
- `/api/credentials/ops/rotate-access`

## Identity APIs

Verify:

- `/api/institutions/auth/login`
- `/api/institutions/auth/accept-invite`
- `/api/institutions/auth/exchange`
- `/api/institutions/ops/identity/dashboard`
- `/api/institutions/ops/identity/action`

Unauthenticated identity-admin dashboard/action must return 401.

## SSO bridge

Verify database behavior:

- `zgirl_identity_exchange_auth_session` executable only by authenticated Supabase role
- requires `auth.uid()`
- binds only a pre-authorized named operator
- `sso_saml` mode requires `amr` containing `sso/saml`
- email alone never creates a Z-Girl operator record or role
- Auth UUID is durable identity after first permitted binding

Do not claim live SAML until an IdP is actually configured and tested.

## Privacy boundary

Confirm no v3.5 identity/RBAC table or API contains:

- participant private reflection text
- youth/student/athlete/family case data
- diagnoses
- therapy/counseling notes
- safeguarding narratives
- clinical records
- clergy/spiritual-direction records
- sports medicine records
- credential assessment answers or practicum evidence

## Authority boundary

Confirm authentication or role assignment alone cannot:

- execute an agreement
- satisfy approval gates
- activate/renew/expand a license
- issue/renew/suspend/revoke credentials without credential capability plus existing credential requirements
- release implementation without workflow.release plus existing workflow conditions
- mark payment received
- activate commerce

## Build verification

Require independent GitHub Actions verification on exact v3.5 head:

- dependency install succeeds
- prebuild reviewer activation safety self-test succeeds
- Next.js compile succeeds
- TypeScript succeeds
- all routes/pages generate

Vercel status may remain build-rate-limited. Do not merge a stacked v3.5 PR into v3.4 or main until release order is explicit and hosting deployment capacity is available.

## Release-order rule

v3.5 is stacked on v3.4.

Preferred release sequence:

1. clear Vercel build-rate gate
2. merge/deploy v3.4 PR #20
3. rebase/retarget v3.5 onto updated `main`
4. exact-head v3.5 build verification
5. merge v3.5
6. verify production custom domain

Do not merge v3.5 directly to production while v3.4 remains intentionally held unless the v3.5 PR includes the complete verified v3.4 lineage and the release is deliberately treated as a combined v3.4+v3.5 production release.
