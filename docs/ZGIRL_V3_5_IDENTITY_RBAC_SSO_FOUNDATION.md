# Z-Girl v3.5 — Institutional Identity, RBAC & SSO Foundation

## Product purpose

v3.5 replaces routine shared-superuser behavior with named operator identity and least-privilege authorization while preserving the existing emergency owner access path.

Authentication and authorization remain separate:

- Authentication answers **who is this operator?**
- Authorization answers **what may this operator do, and in what institutional scope?**

Neither authentication nor authorization replaces the existing agreement, license, credential, delivery-release, privacy, or commerce controls.

## Identity records

`public.zgirl_operator_identities`

- canonical email
- display name
- status: active / suspended / disabled
- allowed auth mode: local_code / supabase_auth / sso_saml
- optional durable Supabase Auth UUID
- last login timestamp

No password or plaintext operator secret is stored.

## Local named access

A System Owner may create a `local_code` operator. The database returns a high-entropy one-time invitation code that:

- is shown once to the administrator
- is stored only as SHA-256 hash
- expires after seven days
- is single-use

The invited operator accepts the invite and establishes a personal access code of at least 24 characters. The personal code is stored only as SHA-256 hash.

Successful named login creates a random 256-bit internal operator session, stores only its SHA-256 token hash, and uses the same HttpOnly / Secure / SameSite=Strict application cookie pattern already used by Credential Operations.

## Break-glass access

The legacy high-entropy Credential Operations access code remains an emergency System Owner path.

Break-glass sessions:

- are treated as `system_owner` by the v3.5 capability engine
- should not be shared as routine team credentials
- can establish the first named System Owner
- can rotate the emergency access code

Routine multi-user operation should move to named identity.

## Role hierarchy

### System Owner
All capabilities. Identity administration and emergency governance.

### Executive
Global executive visibility and decision authority:
- identity.read
- portfolio.read
- portfolio.review
- briefing.read
- briefing.manage
- briefing.delivery
- pipeline.read
- workflow.read
- workflow.approve
- workflow.release
- license.read
- credential.read
- audit.read

### Institutional Admin
Operational administration, global or institution-scoped:
- portfolio.read
- portfolio.review
- briefing.read
- pipeline.read
- pipeline.write
- pipeline.handoff
- workflow.read
- workflow.write
- workflow.approve
- license.read
- license.write
- credential.read

### Pipeline Manager
- portfolio.read
- pipeline.read
- pipeline.write
- pipeline.handoff
- workflow.read

### Credential Admin
- portfolio.read
- license.read
- credential.read
- credential.write
- credential.issue
- credential.status

### Auditor
Read-only governance visibility:
- identity.read
- portfolio.read
- briefing.read
- pipeline.read
- workflow.read
- license.read
- credential.read
- audit.read

## Scope

`system_owner`, `executive`, and `auditor` are global roles.

Operational roles may be global or associated with a specific `zgirl_institutions.id`. A scoped role satisfies a capability only when the requested operation is explicitly tied to that institution. Broad dashboards that currently return the complete portfolio require a global role assignment.

This prevents a school-level administrator from obtaining a district-wide or cross-institution dashboard merely because they hold an institutional role.

## SSO-ready bridge

v3.5 does not silently enable SAML.

The database includes an authenticated-only RPC, `zgirl_identity_exchange_auth_session`, which:

1. reads `auth.uid()` from a verified Supabase Auth JWT;
2. reads the verified JWT email;
3. detects SAML authentication through the Auth `amr` claim (`sso/saml`);
4. resolves a pre-authorized named operator;
5. binds the durable Auth UUID on first permitted login when not already bound;
6. rejects a non-SAML login when the operator is configured `sso_saml`;
7. creates the same internal 12-hour operator session used by the institutional app.

Email-domain membership alone never creates an operator or role.

## Session revocation

Active sessions are revoked when:

- an operator is suspended or disabled;
- the operator authentication mode changes;
- an identity administrator explicitly revokes sessions;
- a local operator rotates personal access (other sessions revoked);
- the global break-glass secret is rotated through the existing security control.

## Audit trail

`public.zgirl_operator_audit_events` records administrative identity events only:

- operator created
- invitation accepted
- local login
- Auth/SSO login
- role changes
- status changes
- auth-mode changes
- Auth UUID binding
- session revocation
- personal access rotation

It contains no participant reflections, youth/student/athlete case records, clinical notes, diagnoses, safeguarding narratives, credential assessment answers, or practicum detail.

## API enforcement introduced in v3.5

The Next.js institutional API layer now checks RBAC capabilities before invoking the existing secured operational RPCs across:

- Portfolio Command Center
- Executive Briefings
- Partner Pipeline
- Agreement Workflows
- Institutional License Administration
- institutional credential roster export
- Credential Operations
- credential candidate administration
- credential roster export
- break-glass access rotation

The internal session token remains server-side in an HttpOnly cookie, so browser code does not receive the token used to invoke Supabase administrative RPCs.

## Governance boundaries

A successful identity login or role assignment cannot:

- execute an agreement
- satisfy an agreement approval gate
- activate, renew, or expand an institutional license
- issue, renew, suspend, or revoke a program credential without the corresponding credential capability and existing credential requirements
- release implementation without the workflow release capability and existing workflow gates
- mark payment received
- convert pipeline planning value into recognized revenue
- expose participant private reflections

## Migration path

1. Keep break-glass owner access available.
2. Create the first named System Owner.
3. Enroll and verify that operator.
4. Create additional named operators with least-privilege roles.
5. Use local named access immediately if desired.
6. Configure Supabase Auth / SAML only when the project plan and institutional IdP are intentionally ready.
7. Change the operator auth mode to `sso_saml` only after testing the provider.
8. Verify login, authorization, revocation, and emergency owner recovery before broader rollout.
