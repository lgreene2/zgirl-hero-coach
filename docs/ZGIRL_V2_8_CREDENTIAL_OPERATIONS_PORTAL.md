# Z-Girl v2.8 — Credential Operations Portal

## Purpose

Z-Girl v2.8 operationalizes the governed facilitator authorization system introduced in v2.7. It provides a controlled administrative workflow for candidate readiness, evidence status, credential issuance, verification, renewal, status changes, and access security.

This is a **program credential operations system**. It does not create professional licensure, academic accreditation, government certification, clinical qualification, or third-party professional certification.

## Product surfaces

### Public

- `/credentials/verify`
- `GET /api/credentials/verify?id=<credential-id>`

Verification requires the exact high-entropy credential ID. The public interface is not a name-search directory.

Public verification may return only:

- credential ID
- holder name
- organization, when recorded
- Z-Girl credential level
- authorized scope
- training version
- credential status
- issue date
- expiration date
- whether the credential is currently valid

It does **not** return candidate email, requirement details, assessment scores, practicum records, audit events, renewal records, access/security data, or participant information.

### Restricted operations

- `/credentials/ops`
- `/api/credentials/ops/login`
- `/api/credentials/ops/logout`
- `/api/credentials/ops/dashboard`
- `/api/credentials/ops/candidate`
- `/api/credentials/ops/action`
- `/api/credentials/ops/rotate-access`

The operations page is marked `noindex, nofollow` and is not linked from public navigation.

## Operator security model

v2.8 uses a dedicated credential-operations access code and database-backed session model.

1. The operator enters the access code over HTTPS.
2. The Next.js API sends it to the credential-login RPC.
3. PostgreSQL compares only a SHA-256 hash of the access code.
4. On success, the database creates a random 256-bit session token and stores only its hash.
5. The plaintext session token is placed in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie by the Next.js server.
6. Browser JavaScript never receives or persists the session token.
7. Sessions expire after 12 hours.
8. Access-code rotation revokes all existing sessions and creates a fresh session for the operator performing the rotation.

The repository contains no Supabase privileged/service-role key. It uses a Supabase publishable key only; every privileged database RPC independently validates the credential-operations session token.

## Database layer

Backing project during the current managed-cloud staging phase:

- Supabase project: `greene-managed-cloud-staging`
- project ref: `pysoqiubmmhsbfawrrrc`

Credential tables:

- `zgirl_credential_candidates`
- `zgirl_credential_requirements`
- `zgirl_credentials`
- `zgirl_credential_renewals`
- `zgirl_credential_audit_events`

Private security tables:

- `private.zgirl_credential_access`
- `private.zgirl_credential_sessions`

Direct `anon` and `authenticated` table access is revoked. RLS is enabled on public credential tables. Operations occur through narrowly scoped RPC functions.

## Credential issuance controls

A credential cannot be issued unless the database sees all required evidence recorded as `pass`.

### Authorized Facilitator

Required:

- orientation
- curriculum
- knowledge assessment
- critical privacy/safety items
- observed practicum
- conduct acknowledgement
- local safeguarding/emergency orientation

### Authorized Lead Facilitator

All Authorized Facilitator requirements plus:

- lead facilitator implementation evidence

### Institutional Trainer

All Lead Facilitator requirements plus:

- trainer teach-back
- trainer scoring calibration
- active institutional trainer license

The server does not rely on the UI to enforce these requirements. The database issuance function rejects incomplete evidence even when called directly.

## Credential IDs

Issued credential IDs use a non-sequential format:

- `ZG-AF-YYYY-XXXXXXXXXX`
- `ZG-ALF-YYYY-XXXXXXXXXX`
- `ZG-IT-YYYY-XXXXXXXXXX`

The random suffix reduces enumeration risk. Public verification requires the complete ID.

## Credential lifecycle states

Candidate states:

`candidate → eligible → training → assessment → practicum → decision → authorized`

Additional terminal/administrative states:

- declined
- withdrawn

Credential states:

- active
- conditional
- suspended
- revoked
- lapsed

Status reason categories are deliberately structured instead of storing unrestricted incident narratives:

- quality
- conduct
- privacy
- safety
- scope
- administrative
- renewal
- other

## Renewal

Each issued credential receives a scheduled renewal record. The default operational model is annual authorization, with a renewal work window beginning approximately 45 days before expiration.

Recording a renewal:

- updates the expiration date
- restores credential status to active
- closes the current renewal record as approved
- schedules the next renewal window
- records an audit event

## Audit history

The portal records non-sensitive operational events such as:

- candidate created/updated
- requirement updated
- credential issued
- credential status changed
- credential renewed
- access rotated
- session revoked

Audit summaries must never become a substitute location for participant private reflection text or case narratives.

## Data minimization boundary

The credential system may store facilitator/trainer candidate administrative data and credential evidence status. It must not store:

- participant private reflections
- youth/student/athlete reflection content
- diagnoses
- counseling or therapy notes
- detailed safeguarding incident narratives
- clergy/spiritual-direction records
- sports medicine records
- participant case files

See `ZGIRL_CREDENTIAL_DATA_BOUNDARY.md`.

## Commerce boundary

Credential administration does not activate paid checkout. Commercial training, authorization, renewal, and institutional trainer licensing remain separate from charitable donations and remain subject to the existing Z-Girl seller/commerce activation gate.

## Release gate

Before production release:

1. Next.js production build passes.
2. TypeScript passes.
3. Credential public and operator routes are generated.
4. Public verifier returns 200 and no result for an unknown credential ID.
5. Operator login succeeds with the bootstrap code.
6. Dashboard session check succeeds.
7. Direct table access remains unavailable to anonymous clients.
8. Credential issuance is tested to reject a candidate missing required passes.
9. Access rotation path is available.
10. Existing `/api/commerce/status` remains `readyForPaidLaunch: false` until commercial activation is separately approved.
