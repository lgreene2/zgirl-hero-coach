# Z-Girl v3.13 Production Activation Receipt

Date: 2026-08-24  
Status: **Production bridge operational; live institutional activation remains locked**

## Canonical release state

- Z-Girl repository: `lgreene2/zgirl-hero-coach`
- Z-Girl release: `3.13.0`
- Z-Girl production commit: `cec7b709f2dd059be611d3187c097ab99cdfaeb6`
- Z-Girl production deployment: `dpl_6gvfEinBtgecV2Mb7VQ3APQyE79z`
- Public domain: `https://zgirlinitiative.org`
- GLS repository: `lgreene2/lead-with-greene`
- GLS bridge repair commit: `34f6b8e5421f8a047eae48a6c0bf877a598c1ee5`
- GLS production deployment: `dpl_GYbbeLnSLzkEJzAw3xfqmHosHboZ`
- Canonical GLS bridge route: `https://greeneleadershipsystem.com/api/gls-zgirl-pilot`
- Shared Supabase project used by this controlled rehearsal: `pysoqiubmmhsbfawrrrc`

Secret values are intentionally omitted. Production and Preview hold the matching server-only bridge secret; the Z-Girl app also holds the canonical GLS bridge URL.

## Bridge permission repair

Production rehearsal initially failed closed with Postgres `42501` because the newly created `public.gls_solution_implementations` table did not expose DML to `service_role`.

GLS PR [#55](https://github.com/lgreene2/lead-with-greene/pull/55) added and deployed the additive migration:

`supabase/migrations/20260824_grant_gls_solution_implementation_bridge_service_role_dml.sql`

Effective privilege posture after migration:

- `service_role`: `SELECT`, `INSERT`, `UPDATE`
- `service_role`: no `DELETE`
- `anon`: no DML
- `authenticated`: no DML
- Row Level Security: enabled

## Controlled rehearsal record

The rehearsal used one synthetic, staging-only institution and no real participant data.

- GLS opportunity: `7ccb2a73-9d36-4013-a58d-c5127111608a`
- Z-Girl pilot: `0a4a6d86-0d60-4cf5-a91a-2929f36350f2`
- Pilot code: `ZG-PILOT-2026-273864FA73`
- Test flag: `true`
- Stage: `opportunity`
- Readiness: `not_assessed`
- Activation date: `null`
- Commercial status after sync: `agreement_executed`
- Implementation rows for the opportunity and solution: exactly `1`
- Pilot rows for the GLS opportunity: exactly `1`

## Production verification

Two consecutive authenticated production synchronization attempts completed successfully.

- Z-Girl `POST /api/institutions/ops/pilots/gls-sync`: `200`, then `200`
- GLS `GET /api/gls-zgirl-pilot`: `200`
- GLS `PATCH /api/gls-zgirl-pilot`: `200`, then `200`
- Second synchronization preserved the same pilot ID, pilot code, and single implementation row.

## Safety and privacy result

- Live pilots: `0`
- Real live pilots: `0`
- Participants invited: `0`
- Participants activated: `0`
- Metric snapshots: `0`
- Evidence records: `0`
- Private reflection content transferred: `false`
- QA sessions remaining: `0`
- QA credentials remaining: `0`

The synthetic pilot remains blocked by the operational safety route, pilot-team review, cohort readiness, and final human release. Nothing in this receipt authorizes a real institution, public case study, participant delivery, commerce, or outcome claim.

## Next governed product step

The next numbered product release should focus on the human readiness decision and release-evidence workflow. It must preserve the existing test/live separation and may not manufacture completion of safety, team, cohort, permission, accessibility, or human-release gates.
