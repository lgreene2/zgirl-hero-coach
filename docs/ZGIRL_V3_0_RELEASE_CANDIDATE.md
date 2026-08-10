# Z-Girl v3.0 Release Candidate — Institutional Credential & License Administration

## Release objective
Turn the institutional pilot/licensing pathway into an operational system that can govern organization records, sites, license terms, credential-seat allocations, adult facilitator/trainer rosters, individual credential linkage, license renewal, and multi-site reporting.

## New public route
- `/institutions/license-administration`

## New restricted route
- `/institutions/ops`

## New APIs
- `/api/institutions/ops/dashboard`
- `/api/institutions/ops/action`
- `/api/institutions/ops/roster`

## Database objects
- `zgirl_institutions`
- `zgirl_institution_sites`
- `zgirl_institution_licenses`
- `zgirl_institution_seat_allocations`
- `zgirl_institution_import_batches`
- `zgirl_institution_license_events`

## Daily governance automation
Job: `zgirl-institution-license-daily`
Schedule: `27 10 * * *` UTC

Responsibilities:
- mark current licenses due within 90 days;
- lapse expired active/conditional institutional licenses;
- block active/reserved institutional seats after license lapse;
- create institutional governance audit events.

## Release boundaries
- institutional license authority and individual credential authority remain separate;
- no private participant reflection dashboard is created;
- no youth/student/athlete roster import is allowed by product design;
- raw uploaded CSV is not persisted by the institutional import batch;
- paid institutional checkout remains gated/off;
- program credential language does not become professional licensure/accreditation language.

## Verification gates before merge
- staging migration applied successfully;
- cron job active;
- exact branch head passes Next.js build and TypeScript;
- restricted dashboard/roster APIs reject unauthenticated requests;
- public product page renders;
- institutional operations route is `noindex, nofollow`;
- existing Credential Operations and public exact-ID verifier remain present;
- existing commerce status remains `readyForPaidLaunch:false` unless separately and deliberately activated.
