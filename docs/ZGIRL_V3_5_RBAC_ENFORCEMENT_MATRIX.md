# Z-Girl v3.5 — RBAC Enforcement Matrix

## Enforcement principle

A valid session is necessary but is no longer sufficient for institutional administration.

Every protected operating route first resolves the current server-side HttpOnly operator session and then checks a named capability. Entity-level actions additionally resolve the target record back to its canonical institution before evaluating a scoped role.

## Global dashboard behavior

The following dashboards currently return portfolio-wide information and therefore require a **global** role assignment containing the capability:

| Surface | Capability |
|---|---|
| Portfolio dashboard | `portfolio.read` |
| Executive briefing dashboard/packets | `briefing.read` |
| Partner pipeline dashboard | `pipeline.read` |
| Agreement workflow dashboard | `workflow.read` |
| License administration dashboard / roster export | `license.read` |
| Credential Operations dashboard / roster | `credential.read` |
| Identity & Access dashboard | `identity.read` |

An institution-scoped role does not unlock a cross-institution dashboard.

## Entity-scoped action resolution

The database can resolve the following administrative entities to a canonical institution before capability evaluation:

- institution
- opportunity
- proposal
- follow-up
- partner contact
- partner activity
- agreement workflow
- delivery handoff
- institutional license
- seat allocation
- institution site
- agreement

This allows an institution-scoped role to perform permitted work on its own records without gaining broad portfolio access.

## Portfolio

| Operation | Capability | Scope |
|---|---|---|
| Read portfolio dashboard | `portfolio.read` | Global |
| Save institution executive review | `portfolio.review` | Institution |
| Create portfolio snapshot | `portfolio.review` | Global |

## Executive briefings

| Operation | Capability | Scope |
|---|---|---|
| View briefing dashboard/packet | `briefing.read` | Global |
| Generate brief | `briefing.manage` | Global |
| Change briefing settings | `briefing.manage` | Global |
| Run briefing automation manually | `briefing.manage` | Global |
| Mark briefing delivery | `briefing.delivery` | Global |

## Partner pipeline

| Operation | Capability | Scope |
|---|---|---|
| View full pipeline dashboard | `pipeline.read` | Global |
| Create a new prospect/institution | `pipeline.write` | Global |
| Update an opportunity | `pipeline.write` | Institution |
| Save contact/activity/proposal/follow-up | `pipeline.write` | Resolved from opportunity |
| Complete follow-up | `pipeline.write` | Resolved from follow-up |
| Handoff accepted proposal to agreement workflow | `pipeline.handoff` | Resolved from opportunity |

## Agreement workflow

| Operation | Capability | Scope |
|---|---|---|
| View full workflow dashboard | `workflow.read` | Global |
| Create/update agreement | `workflow.write` | Institution |
| Create workflow | `workflow.write` | Resolved from license |
| Link agreement | `workflow.write` | Resolved from workflow |
| Build evidence packet | `workflow.write` | Resolved from workflow |
| Decide approval gate | `workflow.approve` | Resolved from workflow |
| Finalize approved workflow/handoff | `workflow.write` | Resolved from workflow |
| Release delivery handoff | `workflow.release` | Resolved from handoff |
| Run workflow automation manually | `workflow.write` | Global |

`workflow.approve` and `workflow.release` are intentionally different capabilities.

## Institutional license administration

| Operation | Capability | Scope |
|---|---|---|
| View full license dashboard / export | `license.read` | Global |
| Create institution | `license.write` | Global |
| Update institution | `license.write` | Institution |
| Save site/license | `license.write` | Institution |
| Allocate seat | `license.write` | Resolved from license |
| Release seat / link credential | `license.write` | Resolved from allocation |
| Renew license | `license.write` | Resolved from license |
| Import adult facilitator/trainer roster | `license.write` | Resolved from license |
| Run license automation manually | `license.write` | Global |

## Credential Operations

Credential records are not yet canonically tenant-linked to institution IDs in all pathways. v3.5 therefore treats Credential Operations capabilities as global program-authority capabilities rather than pretending institution-level scoping exists where it does not.

| Operation | Capability |
|---|---|
| Read credential dashboard/candidate/roster | `credential.read` |
| Create/update candidate, evidence, notice operations | `credential.write` |
| Issue credential | `credential.issue` |
| Change credential status / renew | `credential.status` |

No payment or training completion can substitute for these capabilities or the pre-existing credential eligibility gates.

## Identity administration

| Operation | Capability |
|---|---|
| View named identities / audit | `identity.read` |
| Create operator | `identity.manage` |
| Assign/change roles | `identity.manage` |
| Change operator status/auth mode | `identity.manage` |
| Revoke another operator's sessions | `identity.manage` |
| Rotate break-glass owner secret | `identity.manage` |

Only System Owner / break-glass owner currently receives `identity.manage`.

Read-only identity viewers do not receive mutation controls in the UI.

## Personal operator security

Personal access-code rotation is a self-service action, not identity administration.

Any valid **named local-code operator** may rotate their own code by presenting the current code and a new 24+ character code. The database rejects break-glass, Supabase Auth, and SAML sessions for personal-code rotation. Other active sessions for the named operator are revoked.

## SSO boundary

The SSO bridge authenticates a pre-authorized named operator and then issues the same internal 12-hour application session. It does not assign roles from email domain membership.

A `sso_saml` operator must present a verified Supabase Auth JWT whose authentication-method reference includes `sso/saml`. An ordinary Supabase Auth session is rejected for an SSO-only operator.

## Authority remains layered

RBAC never bypasses the substantive workflow controls. For example:

- `credential.issue` does not bypass credential evidence requirements;
- `workflow.release` does not bypass executed-agreement/approval/handoff requirements;
- `license.write` does not equate payment with license authority;
- `pipeline.handoff` does not activate a license;
- `identity.manage` does not expose participant private reflections.
