# Z-Girl v3.5 — Institutional SSO Activation Runbook

## Current release posture

v3.5 is SSO-ready but does not automatically enable a SAML provider.

Supabase project SAML SSO must be deliberately configured and tested. Supabase currently documents project-level SAML SSO on Pro plans and above. Do not change an operator to `sso_saml` until the provider is confirmed working.

## Supported institutional identity-provider pattern

Supabase Auth SAML 2.0 can bridge common institutional IdPs such as:

- Google Workspace
- Microsoft Entra / Azure AD
- Okta
- Auth0
- PingIdentity
- OneLogin
- other SAML 2.0 compatible providers

The identity provider proves who the person is. Z-Girl RBAC still decides what the person may do.

## Non-negotiable safety rule

Never use an institutional email domain as an automatic role grant.

A user must have:

1. a pre-authorized `zgirl_operator_identities` record;
2. an allowed auth mode compatible with the login;
3. one or more deliberate Z-Girl role assignments;
4. an active operator status.

## Recommended activation sequence

### 1. Establish named recovery ownership first

Before SSO configuration:

- verify the break-glass owner code works;
- create at least one named System Owner;
- enroll and test that named owner using local access;
- verify Identity & Access Administration is reachable;
- keep the emergency owner path available.

### 2. Confirm Supabase plan / SAML availability

In the Supabase project Auth provider configuration, confirm SAML SSO is available for the current plan. Do not upgrade solely because the code supports SSO; upgrade only when an institutional deployment actually requires it.

### 3. Obtain IdP metadata

From the institution obtain the SAML 2.0 metadata URL or metadata XML file and the intended email domain(s), if SP-initiated routing will be used.

Do not request unrelated directory attributes.

Recommended minimum identity attributes:

- stable SAML subject / NameID
- email
- optional display name

Z-Girl roles remain inside the Z-Girl authorization layer unless a separately governed attribute-mapping design is approved later.

### 4. Configure the Supabase SAML provider

Use the supported Supabase SSO configuration workflow / CLI for the project.

The project provides SAML metadata / ACS endpoints under the project Auth URL. Follow the current Supabase documentation at activation time rather than copying stale endpoint assumptions from an old deployment note.

### 5. Keep auto-role behavior disabled

An IdP account or group membership does not create Z-Girl authorization.

Create the named Z-Girl operator first and set:

`allowed_auth_mode = sso_saml`

Assign the minimum appropriate role(s).

### 6. Test with one operator

Use a non-production test operator if possible.

Verify:

- SAML login succeeds;
- Supabase Auth returns a verified user;
- `zgirl_identity_exchange_auth_session` recognizes the `sso/saml` authentication method;
- first approved login binds the operator's Supabase Auth UUID;
- the internal 12-hour Z-Girl operator session is created;
- operator sees only capabilities permitted by assigned roles;
- changing auth mode revokes active sessions;
- suspension revokes active sessions;
- break-glass owner recovery remains functional.

### 7. Verify negative cases

Before rollout, prove that:

- a user with the institution's email domain but no Z-Girl operator record is denied;
- a named operator with no sufficient role receives 403 capability denial;
- an `sso_saml` operator cannot exchange an ordinary non-SAML Supabase Auth session;
- a suspended operator cannot use an existing session;
- a scoped institutional role cannot open broad portfolio dashboards that require global role scope;
- SSO login does not activate a license, issue a credential, satisfy an agreement gate, or expose participant reflections.

### 8. Roll out deliberately

Add operators individually or through a separately reviewed onboarding process.

Recommended starting roles:

- institution executive sponsor: Executive only if truly cross-portfolio/global; otherwise use a narrower institutional operational role;
- site/program administrator: Institutional Admin scoped to the institution;
- sales/partnership staff: Pipeline Manager;
- credential operations staff: Credential Admin;
- compliance reviewer: Auditor.

Avoid System Owner except for platform governance personnel.

## Identity binding rule

After first approved Supabase Auth / SAML login, `auth_user_id` becomes the durable external identity link.

Do not manually substitute another user's UUID merely because email matches.

If an institution changes identity providers, treat the re-binding as an identity-governance event and test it separately.

## Session and offboarding

When a person leaves a role or institution:

1. suspend or disable the Z-Girl operator immediately;
2. revoke active Z-Girl sessions;
3. remove or change role assignments;
4. disable the person in the institutional IdP where appropriate;
5. retain administrative audit events according to governance policy.

## SSO and privacy

SSO is an access-control feature. It does not change the Z-Girl data boundary.

SSO users never gain access to participant private reflections, youth/student/athlete case data, diagnoses, therapy/counseling notes, safeguarding narratives, clergy/spiritual-direction records, sports-medicine records, or credential assessment answers merely because they have authenticated.
