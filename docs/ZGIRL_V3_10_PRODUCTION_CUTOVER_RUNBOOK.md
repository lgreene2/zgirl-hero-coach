# Z-Girl v3.10 — Consolidated Production Cutover Runbook

## Purpose

v3.10 is the production-readiness release that consolidates the previously stacked v3.4–v3.9 institutional releases into one candidate based on the current production `main` branch.

It is deliberately a release-engineering layer rather than another participant-facing feature release.

The target production sequence is:

**Current production v3.3 + activation-status sync → consolidated v3.10 candidate → exact-head verification → one merge → one production deployment → custom-domain boundary verification → supersede old stacked PRs.**

## Current baseline recorded at build time

- Production `main`: `f92fa742199d8fbc5719ec8562e781f1b63af6ff`
- Current production application family: v3.3 plus the PR #22 revenue-activation status update
- Current production Vercel deployment recorded by v3.10: `dpl_Dzoz8yuouerxooTed6sWrWa4Zro8`
- Z-Girl managed-cloud Supabase project: `pysoqiubmmhsbfawrrrc`
- Z-Girl public tables: 43
- Z-Girl public tables with RLS: 43
- Direct `anon` / `authenticated` Z-Girl table grants: 0
- Institutions/licenses/operators/credentials/evidence/briefings/board packs: 0 at the v3.10 baseline check
- Paid launch: intentionally disabled

Before cutover, re-check that `main` has not moved. If it has moved, stop and reconcile the new production commit into the v3.10 candidate before proceeding.

## Consolidation lineage

The v3.10 reconciliation commit has two parents:

1. v3.9 verified feature head: `9cb86e713e5ba71c80839ddd946304db918b49da`
2. current production `main`: `f92fa742199d8fbc5719ec8562e781f1b63af6ff`

The only known divergence between the old v3.4 feature base and current production was `docs/REVENUE_ACTIVATION_STATUS.md`; v3.10 deliberately carries the current production version.

After successful v3.10 production cutover, these stacked PRs become superseded rather than sequential merge requirements:

- #20 — v3.4
- #21 — v3.5
- #23 — v3.6
- #25 — v3.7
- #26 — v3.8
- #28 — v3.9

Do **not** close those PRs until v3.10 is production-verified.

## Gate 0 — release freeze

Before enabling the final Preview:

1. Confirm the v3.10 branch is the only release-train branch receiving new release-engineering changes.
2. Do not merge any of #20, #21, #23, #25, #26, or #28 independently.
3. Confirm `package.json` is `3.10.0`.
4. Run the static release train check:

```bash
npm run release:train-check
```

5. Confirm the expected database baseline:
   - 43 Z-Girl public tables
   - 43 RLS-enabled
   - zero direct anon/authenticated table grants
   - no unexpected institutional operational records
6. Confirm the production commerce endpoint remains separately governed. Unless a separate paid-launch authorization has been made, `readyForPaidLaunch` must remain `false`.
7. Record the current production Vercel deployment ID as the application rollback point.

## Gate 1 — exact-head CI

Create or update the consolidated PR to `main` and require both repository gates on the exact v3.10 head:

### Verify Release

Must pass:

- Node 22 dependency installation
- `npm run release:train-check`
- reviewer activation self-test without secret disclosure
- Next.js optimized production build
- TypeScript
- route generation

### Reviewer Activation CI

Must pass:

- activation-script syntax checks
- application production build
- confidential activation-bundle generator exercise

A green build on an older head does not satisfy this gate.

## Gate 2 — exact-head Vercel Preview

Intermediate commits are intentionally Preview-suppressed.

When the candidate is frozen:

1. Remove only the v3.10 branch from `vercel.json` deployment suppression.
2. Create one no-functional-change release-verification commit if necessary to trigger Git integration.
3. Require the resulting Vercel deployment to be `READY` for the exact current head.
4. Inspect build logs for:
   - `zgirl-hero-coach@3.10.0`
   - release-train verifier pass
   - reviewer activation self-test pass
   - successful Next.js compile
   - TypeScript pass
   - all v3.4–v3.9 public/restricted/API routes in the route manifest
   - `/api/release/status`
5. Do not weaken Vercel Preview Authentication merely to inspect restricted surfaces. Use authenticated Vercel inspection when needed.

A Vercel account build-rate rejection is an infrastructure hold, not a successful Preview.

## Gate 3 — Preview application checks

On the exact Preview, verify at minimum:

### Public capabilities

- `/institutions/executive-briefing-automation`
- `/institutions/identity-access`
- `/institutions/access-governance-evidence`
- `/institutions/governance-calendar`
- `/institutions/board-governance-reporting`
- `/credentials/verify`
- `/api/release/status`

### Restricted boundaries

Confirm restricted institutional and credential APIs still require an operator session.

Do not create synthetic institutional users, credentials, licenses, reports, or board packs solely to make Preview screens look populated.

## Gate 4 — merge

Only after Gates 0–3 pass:

1. Reconfirm the consolidated PR is mergeable.
2. Reconfirm `main` is still the expected production base or reconcile any new main change.
3. Squash-merge the v3.10 consolidated PR with the expected exact head SHA.
4. Do not separately merge the old stacked PRs.

The squash commit on `main` becomes the authoritative application release commit for v3.10.

## Gate 5 — production deployment

Require the production Vercel deployment to:

- target production
- be `READY`
- originate from the new v3.10 `main` commit
- restore/retain the `zgirlinitiative.org` custom-domain aliases

Do not call v3.10 live until the custom-domain verification passes.

## Gate 6 — production boundary suite

Run:

```bash
npm run release:verify-production -- \
  --base-url https://zgirlinitiative.org \
  --expected-version 3.10.0 \
  --expected-git-commit <NEW_MAIN_SHA>
```

The suite proves:

- secret-safe release identity
- v3.4–v3.9 public product routes return HTTP 200
- high-power institutional and credential APIs return 401 without a session
- a fake exact-format credential does not disclose a credential
- commerce still reports four checkout-required offers
- paid launch remains false unless `--allow-paid-launch` is supplied after separate commercial authorization

The GitHub `Production Cutover Verify` workflow performs the same public custom-domain checks without production credentials.

## Gate 7 — database post-cutover verification

The v3.4–v3.9 schema has already been applied to the managed-cloud project. v3.10 introduces no new application-authority database table.

Re-check:

- all Z-Girl public tables remain RLS-enabled
- zero direct anon/authenticated table grants
- migration inventory contains all v3.4–v3.9 migrations
- no synthetic institutional records were created by cutover
- scheduled jobs remain active in this order:
  1. tenant access review — 09:47 UTC
  2. institutional workflow — 10:07 UTC
  3. credential renewal — 10:17 UTC
  4. institutional license — 10:27 UTC
  5. executive briefing — 11:37 UTC
  6. governance calendar — 12:07 UTC

v3.9 board packs remain human-generated and have no cron job.

## Gate 8 — runtime health

After production requests exercise the new application:

- inspect Vercel production runtime errors/fatal logs
- investigate any unexpected 5xx response before closing the release
- verify the commerce status endpoint is still secret-safe
- verify the release status endpoint exposes no credentials or tokens

## Gate 9 — release-train cleanup

Only after production is verified:

1. Add a supersession comment to PRs #20, #21, #23, #25, #26, and #28 identifying the v3.10 consolidated release PR and production commit.
2. Close those six PRs without merging them.
3. Retain their branches temporarily for audit/history; branch deletion is a separate housekeeping decision.
4. Record the production deployment ID and production commit in the v3.10 release candidate document.

## Gate 10 — first named System Owner

After application cutover is stable, move routine administration away from shared break-glass access:

1. Use the existing emergency owner path to authenticate.
2. Open Identity & Access Administration.
3. Create the first named `System Owner` operator.
4. Complete named enrollment/login.
5. Re-authenticate using the named System Owner.
6. Verify identity administration and session revocation.
7. Preserve break-glass access for recovery only.

Use `docs/ZGIRL_V3_10_SYSTEM_OWNER_BOOTSTRAP.md` for the detailed procedure.

## Commerce boundary

v3.10 is **not** commerce activation.

Current release acceptance does not set:

- `ZGIRL_SELLER_NAME`
- checkout links
- Stripe merchant configuration
- lead-delivery secrets
- `readyForPaidLaunch`

Commercial activation remains a separate governed decision under Greene Leadership System LLC. Product/license payments remain separate from charitable donations.

## Participant privacy boundary

Release consolidation does not alter the core participant boundary. Institutional operators still do not receive routine access to participant private-reflection text, youth/student/athlete case records, diagnoses, therapy/counseling notes, safeguarding narratives, clinical records, clergy/spiritual-direction records, sports-medicine records, or credential assessment detail.

## Rollback trigger

Use the rollback plan if any of these occur after merge:

- production deployment fails or never becomes READY
- release status does not identify v3.10/new main commit
- new public routes are unavailable
- an unauthenticated high-power API becomes accessible
- credential verifier discloses an unknown credential
- commerce unexpectedly becomes ready for paid launch without separate authorization
- material 5xx/runtime failures appear

See `docs/ZGIRL_V3_10_ROLLBACK_PLAN.md`.
