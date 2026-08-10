# Z-Girl v2.9 — Credential Issuance & Renewal Automation

## Purpose

v2.9 operationalizes the v2.8 credential registry after a credential is issued. It creates a reusable authorization record, QR verification asset, credential card, renewal schedule, controlled delivery queue, lapse automation, and roster export without broadening access to participant data.

## Public assets

### `/credentials/record/[credential-id]`
Printable exact-ID Program Authorization Record. It shows only public credential fields already permitted by the verifier:
- holder name
- organization when applicable
- credential level
- status
- training version
- issue date
- expiration date
- authorized scope
- QR verification link

The page is `noindex, nofollow` and is not a people-search directory.

### `/api/credentials/qr?id=...`
Returns an SVG QR code only when the exact credential ID resolves through the public verifier. The QR points to the corresponding Program Authorization Record.

### `/api/credentials/card?id=...`
Returns a downloadable SVG credential card with an embedded QR code. The card repeats the program-credential boundary and does not imply professional licensure.

### `/credentials/verify?id=...`
The existing verifier now supports exact-ID deep links and offers links to the authorization record and downloadable credential card after a successful match.

## Restricted automation console

### `/credentials/ops/automation`
Uses the same v2.8 credential-operations HttpOnly session.

Capabilities:
- renewal dashboard for 90-day and 60-day windows
- controlled notification delivery queue
- future scheduled notices
- manual automation run
- mark notice prepared, sent, or dismissed
- prepare a message in the operator's email client
- printable authorization-record links
- downloadable credential-card links
- exact-ID verifier links
- CSV credential roster export

## Notification schedule

Issuance creates:
- issuance confirmation — queued immediately
- 90-day renewal notice — scheduled
- 60-day renewal notice — scheduled
- 30-day renewal notice — scheduled

Renewal creates:
- renewal confirmation — queued immediately
- a new 90/60/30 schedule against the new expiration date
- old unsent renewal reminders are dismissed

Expiration processing creates:
- credential status `lapsed`
- renewal workflow status `lapsed`
- expiration/lapse notice — queued
- audit event recording the automatic lapse

## Daily automation

Supabase `pg_cron` job:
- job name: `zgirl-credential-renewal-daily`
- schedule: `17 10 * * *` UTC
- command: `select private.zgirl_process_credential_automation();`

The job:
1. promotes due scheduled notices to `queued`
2. moves eligible renewal workflows from `scheduled` to `in_progress` inside the 90-day window
3. lapses credentials after their expiration date
4. queues the lapse notification
5. records the credential-status audit event

The private automation function has no anon/authenticated execute grant.

The dashboard also executes the idempotent automation function after validating an operator session so the state self-heals whenever credential operations are opened.

## Delivery model

v2.9 deliberately does not activate an autonomous email provider.

The database generates the approved subject/body and stores it in a private notification queue. The operator can:
1. choose **Prepare email**
2. open the pre-addressed message in the local email client
3. send after review
4. mark the queue item sent

This preserves human review while the credential program is still in its initial operating stage. A future mail-provider adapter can consume the same queue without changing the data model.

## Institutional roster export

`/api/credentials/ops/roster`

Requires the credential-operations session and exports CSV fields:
- credential ID
- holder name
- organization
- credential level
- status
- issue date
- expiration date
- training version
- public-verification availability
- authorized scope
- authorization-record URL

Candidate email and assessment/practicum details are intentionally omitted from the roster export.

## Security and privacy boundaries

- No participant private reflection content is stored or exported.
- No youth/student/athlete case file is created.
- No diagnosis, counseling, therapy, clinical, safeguarding narrative, clergy/spiritual-direction, or sports-medicine data is used.
- Direct notification-table access is revoked from `anon` and `authenticated`.
- Operator mutations continue to require the random, unexpired v2.8 credential-operations session token.
- Public records require the high-entropy exact credential ID.
- Public credential records do not expose candidate email, assessment data, practicum data, renewal history, or audit data.

## Credential claim boundary

Z-Girl authorization remains a program credential. v2.9 does not claim:
- professional licensure
- academic accreditation
- government certification
- clinical qualification
- third-party professional certification

## Commerce boundary

v2.9 does not activate credential, training, renewal, or institutional checkout. Existing commercial seller and checkout gates remain separate.

## Product role

v2.9 converts the credential framework into a repeatable post-issuance operating system:

Train → Assess → Authorize → Issue → Verify → Remind → Renew/Lapse → Reissue/Continue

This supports future recurring authorization revenue and institutional licensing without requiring a redesign of credential evidence or participant privacy boundaries.
