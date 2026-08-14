# Z-Girl v3.6 — Institutional Tenant Dashboards, Access Reviews & SSO Onboarding

## Purpose
v3.6 turns the v3.5 named-identity foundation into an institution-facing governance layer without exposing participant private reflections or creating a second general-purpose CRM.

## Product chain
Institutional identity → tenant-scoped operations → periodic access recertification → SSO readiness → governed offboarding → executive oversight.

## Tenant dashboard
A tenant dashboard is scoped to one Z-Girl institution and may show administrative information only:
- institution identity/status
- licenses and renewal state
- sites
- agreement/workflow state
- institutional opportunities
- named operators assigned to that institution
- access-review status
- SSO onboarding readiness
- offboarding records

It must not show participant reflection text, student/youth/athlete case records, diagnosis, counseling/therapy notes, safeguarding narratives, clergy/spiritual-direction records, sports-medicine records, credential assessment answers, or practicum evidence.

## Access review lifecycle
1. Schedule — quarterly, semiannual, or annual.
2. Snapshot — current institution-scoped operator assignments are copied into an immutable review record.
3. Human review — each assignment is marked retain, change, or remove.
4. Completion — no pending decisions remain.
5. System Owner implementation — role changes are executed through the existing v3.5 Identity & Access Administration control.
6. Implementation evidence — v3.6 records the reference proving the identity action was completed.

Access review decisions do not silently rewrite identity roles.

## Automated preparation
The daily governance job runs at 09:47 UTC. It may prepare a due draft review and snapshot current administrative assignments. It never changes permissions, suspends operators, sends email, or activates SSO.

## SSO onboarding
SSO onboarding is a readiness and evidence process, not an identity-provider control plane.

Recommended sequence:
1. Discovery
2. Metadata pending
3. Configuration
4. Testing
5. Ready
6. System Owner activation approval
7. Active

A Z-Girl operator must still be pre-authorized. Email domain membership never grants a role. Supabase Auth/SAML proves identity; Z-Girl RBAC grants authority.

Do not store SAML private keys, client secrets, signing secrets, or raw confidential IdP credentials in tenant-governance records. Store references to approved configuration evidence instead.

## Offboarding
Offboarding is a controlled handoff to v3.5 Identity Administration:
- Institutional Admin may prepare/recommend the offboarding action.
- System Owner executes role/session changes using the verified identity controls.
- v3.6 records the administrative completion reference.
- Historical access-review and offboarding evidence remains available for audit.

## Roles
### System Owner
Enterprise-wide identity authority, final SSO activation approval, and final implementation recording.

### Executive
Enterprise oversight and review visibility; not routine identity mutation.

### Institutional Admin
Institution-scoped dashboard, access review, SSO-readiness administration, and offboarding preparation.

### Auditor
Read-only governance visibility.

Pipeline Manager and Credential Admin retain their v3.5 specialized operational authority and do not automatically receive tenant identity-governance administration.

## Governance rules
- Authentication is not authorization.
- SSO does not auto-provision authority.
- Payment does not activate a tenant, license, role, credential, or SSO identity.
- Agreement execution does not bypass access review.
- Access review does not replace credential eligibility.
- Tenant administration does not create access to private participant reflections.
- Break-glass owner access remains emergency/recovery access, not routine shared-user access.

## Monetization role
v3.6 supports an enterprise administration tier with:
- named institutional administrator seats
- tenant dashboards
- quarterly access reviews
- SSO onboarding support
- access-governance evidence packets
- offboarding administration
- annual governance review

This can be packaged into district, university, congregation-network, athletic-network, nonprofit-network, and municipal licenses.
