# Z-Girl v3.10 — First Named System Owner Bootstrap

## Purpose

v3.5 introduced named operator identity and RBAC, but the current managed-cloud baseline intentionally contains zero named operators. v3.10 defines the controlled transition from emergency break-glass administration to routine named System Owner administration after the consolidated application is production-stable.

This is an administrative identity procedure. It does not create participant, institution, license, credential, payment, or commerce authority by itself.

## Preconditions

Do not bootstrap the first named System Owner until:

- v3.10 is deployed and production boundary verification passes
- the current break-glass access path is known to work
- the person being enrolled is intentionally approved to hold global System Owner authority
- a secure channel exists to deliver a one-time enrollment code if `local_code` is used

Do not place a break-glass code, one-time enrollment code, personal access code, session token, Supabase token, or SSO assertion in GitHub issues, PR comments, public documents, screenshots intended for publication, or ordinary shared notes.

## Role being created

The first named operator receives:

- role: `system_owner`
- scope: global (`institution_id = null`)
- status: active

System Owner is the highest Z-Girl administrative role. It can administer named identities and has all platform capabilities. It still cannot bypass the separate underlying agreement, credential, license, delivery, privacy, or commerce rules enforced by those subsystems.

## Step 1 — establish an emergency owner session

Use the existing Credential Operations break-glass access path to create the server-side HttpOnly operator session.

The break-glass secret remains a recovery credential and should not become the routine team login.

After successful authentication, open:

`/institutions/ops/identity`

The console should identify the current operator as a **Break-glass owner session** and state that it should be used to establish named System Owner identity.

If the identity dashboard does not recognize the break-glass session as System Owner, stop. Do not create an alternate bypass.

## Step 2 — create the named operator

In **Institutional Identity & Access Administration**:

1. Select **Create named operator**.
2. Enter the approved operator email.
3. Enter the operator display name.
4. For the first bootstrap, use `Personal code` / `local_code` unless Supabase Auth/SSO has already been separately configured and verified.
5. Create the operator.

For a local-code operator, the server returns a one-time invitation code.

The invitation:

- is high entropy
- is stored in the database only as a SHA-256 hash
- is displayed in plaintext only in the creation response
- expires after seven days
- can be used once

Deliver it only to the intended operator over a secure channel.

## Step 3 — assign the System Owner role

On the new operator record:

1. Add role `System Owner`.
2. Keep institutional scope **Global**.
3. Save role assignments.

Do not add a second role merely because System Owner already contains the needed capability. Minimize redundant privilege records.

## Step 4 — accept enrollment

The named operator opens:

`/institutions/auth`

Use the invitation/enrollment flow to establish a personal access code.

The local personal code must be at least 24 characters. The database stores only its hash.

After enrollment, do not preserve the one-time invitation plaintext as a reusable credential. It is not a password and should not be archived as one.

## Step 5 — prove named login

End the break-glass browser session or use a separate clean browser context.

Sign in through `/institutions/auth` with the new named operator credentials.

Verify:

- the session identifies the named operator rather than Break-glass owner
- `System Owner · Global` appears in identity context
- `/institutions/ops/identity` opens
- `/institutions/ops/portfolio` opens
- `/institutions/ops/briefings` opens
- `/institutions/ops/tenant` opens
- `/institutions/governance-evidence` opens
- `/institutions/governance-board` opens
- Credential Operations remains available under the intended RBAC rules

Do not create fake credentials, institutions, licenses, or evidence merely to test navigation.

## Step 6 — prove self-service security

Open:

`/institutions/auth/security`

Verify the named System Owner can:

- see the identity attached to the current session
- see the System Owner role
- rotate the operator's own personal access code

If performing a real rotation during bootstrap, use a new high-entropy code and verify that prior named sessions are revoked according to policy.

## Step 7 — prove administrative session revocation

From a valid named System Owner session:

1. Open Identity & Access Administration.
2. Use **Revoke sessions** on the named operator only if a deliberate test has been planned.
3. Confirm the revoked session can no longer use restricted institutional APIs.
4. Re-authenticate normally.

Do not rotate the global break-glass secret merely to test the user interface unless the replacement secret has been securely captured and recovery has been planned.

## Step 8 — preserve break-glass recovery

After named System Owner access is proven:

- keep break-glass access enabled as emergency recovery
- do not share it as a routine credential
- do not copy it into the named operator profile
- do not expose it to institution-scoped administrators
- document who is authorized to invoke break-glass recovery
- rotate it under the existing high-entropy control when operationally appropriate

The normal operating path should now be named identity.

## Step 9 — create additional operators by least privilege

Only after the first named System Owner is stable, create additional named operators as needed:

- Executive
- Institutional Admin
- Pipeline Manager
- Credential Admin
- Auditor

Use institution scope wherever practical for operational roles. Do not use System Owner as a convenience role for staff who only need one subsystem.

## Step 10 — SSO transition later

SAML/SSO is a separate activation step.

Do not change a named operator to `sso_saml` merely because their organization uses Google Workspace, Microsoft Entra, Okta, or another identity provider.

SSO transition requires:

1. an intentionally configured Supabase Auth/SSO provider
2. pre-authorized Z-Girl named operator
3. verified identity-provider authentication
4. durable Auth UUID binding
5. role/scope assignment in Z-Girl
6. login and revocation test
7. preserved break-glass recovery

Email-domain membership alone never grants a Z-Girl role.

## Audit evidence to retain

Retain administrative evidence of:

- operator creation event
- System Owner role assignment
- invitation acceptance
- successful named login
- any personal-code rotation performed
- any deliberate session-revocation test
- date named System Owner became the normal administration path

Do not retain plaintext secrets in the evidence record.

## Success condition

Bootstrap is complete when:

**Break-glass owner → creates named operator → global System Owner role assigned → invitation accepted → named login proven → identity administration proven → emergency owner preserved for recovery only.**
