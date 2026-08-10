# Z-Girl v2.9 Release Candidate

## Release objective

Release the Credential Issuance & Renewal Automation layer behind the v2.8 Credential Operations Portal.

## New public routes

- `/credentials/record/[id]` — printable Program Authorization Record
- `/api/credentials/qr?id=...` — QR SVG for exact-ID public record
- `/api/credentials/card?id=...` — downloadable SVG credential card
- `/credentials/verify?id=...` — exact-ID deep-link verification

## New restricted routes

- `/credentials/ops/automation` — renewal and controlled-delivery console
- `/api/credentials/ops/roster` — credential roster CSV export

## Extended restricted API

`/api/credentials/ops/action` adds:
- `mark_notification`
- `run_automation`

## Database migration

`zgirl_credential_issuance_renewal_v2_9`

Adds:
- `public.zgirl_credential_notifications`
- private notification scheduling helpers
- private daily renewal/lapse processor
- operator notification-status RPC
- operator manual automation RPC
- extended credential dashboard payload
- updated issue and renewal RPCs
- Supabase `pg_cron` daily automation job

## Daily automation verification

Expected cron row:
- job: `zgirl-credential-renewal-daily`
- schedule: `17 10 * * *`
- active: true

Manual smoke result on empty registry should return:
- queuedNotices: 0
- lapsedCredentials: 0

## Required release checks

- [ ] `npm install` resolves `qrcode` and type package
- [ ] reviewer activation self-test passes
- [ ] Next.js production compilation passes
- [ ] TypeScript passes
- [ ] `/credentials/record/[id]` route appears in manifest
- [ ] `/credentials/ops/automation` route appears in manifest
- [ ] `/api/credentials/qr` appears in manifest
- [ ] `/api/credentials/card` appears in manifest
- [ ] `/api/credentials/ops/roster` appears in manifest
- [ ] unknown exact-format credential remains `found:false`
- [ ] unknown credential record is not exposed
- [ ] unauthenticated automation dashboard remains unauthorized
- [ ] v2.9.0 version badge visible
- [ ] existing `/institutions/train-the-trainer` remains present
- [ ] commerce status remains `readyForPaidLaunch:false`

## Privacy release gates

- no public people search
- no candidate email in public record/card/verifier
- no assessment or practicum data in public surfaces
- no participant private reflection data in credential automation
- no youth/student/athlete case data
- roster export requires operator session and omits candidate email and evidence data

## Claim boundary

The public record and credential card must use program-authorization language only and must not imply professional licensure, academic accreditation, government certification, clinical qualification, or third-party certification.

## Commerce boundary

Do not activate paid training, credential, renewal, or institutional checkout as part of v2.9.
