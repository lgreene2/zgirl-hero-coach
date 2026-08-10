# Z-Girl v2.8 — Credential Operations Portal Release Candidate

## Release objective

Operationalize the v2.7 facilitator authorization framework with a secure, privacy-minimized credential administration system and exact-ID public verification.

## Release surfaces

### Public

- `/credentials/verify`
- `/api/credentials/verify`
- footer link: **Verify Credential**

### Restricted operations

- `/credentials/ops`
- `/api/credentials/ops/login`
- `/api/credentials/ops/logout`
- `/api/credentials/ops/dashboard`
- `/api/credentials/ops/candidate`
- `/api/credentials/ops/action`
- `/api/credentials/ops/rotate-access`

### Application support

- `lib/credentials/store.ts`
- `lib/credentials/session.ts`
- `components/credentials/CredentialVerifier.tsx`
- `components/credentials/CredentialOpsPortal.tsx`

### Operating documentation

- `docs/ZGIRL_V2_8_CREDENTIAL_OPERATIONS_PORTAL.md`
- `docs/ZGIRL_CREDENTIAL_DATA_BOUNDARY.md`
- `docs/ZGIRL_CREDENTIAL_OPERATIONS_RUNBOOK.md`
- `supabase/migrations/20260810_zgirl_credential_operations_v2_8.sql`

## Database status

Migration `zgirl_credential_operations_v2_8` has been applied successfully to the current Greene managed-cloud staging Supabase project.

The database includes:

- candidate registry
- requirement/evidence state
- credential registry
- renewal schedule
- administrative audit events
- private access-code hash
- private expiring session-token hashes
- controlled login/logout/rotation RPCs
- controlled candidate/requirement/issuance/status/renewal RPCs
- exact-ID public verification RPC

A database smoke test successfully completed:

`login → dashboard session validation → logout`

No plaintext session token was persisted or displayed as part of the test record.

## Security model

- application uses a publishable Supabase key only
- no service-role or privileged Supabase key is stored in the public repository
- direct table grants to `anon` and `authenticated` are revoked for credential tables
- credential public tables have RLS enabled
- administrative RPCs require a random, unexpired credential-operations session token
- only token hashes are stored in PostgreSQL
- browser receives the session token only in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie
- sessions expire after 12 hours
- rotating the access code revokes all older operations sessions
- public verification requires an exact random credential ID; no holder-name directory is provided

Supabase's security advisor identifies the SECURITY DEFINER operator RPCs as callable from the exposed API role. This is intentional for this custom token-gated design: each administrative RPC independently rejects calls without a valid credential-operations session, and the underlying tables are not directly exposed. The exact-ID verification RPC is intentionally public and returns only the approved public credential field set.

## Credential issuance gate

The database—not the UI—blocks issuance unless required requirements have status `pass`.

Authorized Facilitator requires:

- orientation
- curriculum
- knowledge assessment
- critical privacy/safety items
- observed practicum
- conduct acknowledgement
- local safeguarding/emergency orientation

Authorized Lead Facilitator adds:

- lead implementation evidence

Institutional Trainer adds:

- trainer teach-back
- scoring calibration
- active institutional trainer license

## Privacy boundary

The portal is for adult facilitator/trainer credential administration only.

Do not store:

- participant private reflection text
- youth/student/athlete journals or reflection responses
- diagnoses or counseling/therapy records
- safeguarding incident narratives
- medical, clergy/spiritual-direction, or sports medicine records
- participant case-management notes

## Credential claims boundary

v2.8 continues the v2.7 language:

- Z-Girl Authorized Facilitator
- Z-Girl Authorized Lead Facilitator
- Z-Girl Institutional Trainer — Authorized

These are Z-Girl **program credentials**. They are not represented as professional licensure, academic accreditation, government certification, clinical qualification, or third-party professional certification.

## Commerce boundary

v2.8 does not activate paid credential, training, license, or product checkout.

The existing commerce gate must remain unchanged until the approved commercial seller is configured separately.

## Final Preview gate

Release only if the complete branch head passes all of the following:

- [ ] reviewer activation self-test passes
- [ ] Next.js production compilation passes
- [ ] TypeScript passes
- [ ] all static pages/routes generate successfully
- [ ] `/credentials/verify` appears in the route manifest
- [ ] `/credentials/ops` appears in the route manifest
- [ ] all credential API routes appear in the route manifest
- [ ] public verifier page returns HTTP 200
- [ ] operator portal page returns HTTP 200 and is noindex
- [ ] unknown exact-format credential verification returns `found: false`
- [ ] existing v2.7 Train-the-Trainer route remains present
- [ ] GitHub/Vercel status for the exact final branch head is green
- [ ] `/api/commerce/status` remains gated after production release

## Version

Application release version: **2.8.0**
