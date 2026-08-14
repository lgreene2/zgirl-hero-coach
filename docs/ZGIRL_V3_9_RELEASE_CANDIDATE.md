# Z-Girl v3.9 Release Candidate

## Release
Z-Girl v3.9.0 — Board Governance Calendar, Executive Evidence Pack & Calendar Export

## Required routes
- `/institutions/board-governance-reporting`
- `/institutions/governance-board`
- `/institutions/governance-board/pack/[id]`
- `/api/institutions/ops/board-governance/dashboard`
- `/api/institutions/ops/board-governance/action`
- `/api/institutions/ops/board-governance/packet`
- `/api/institutions/ops/board-governance/export`

## Database
- `public.zgirl_board_governance_packs`
- `private.zgirl_build_board_governance_snapshot`
- `public.zgirl_board_governance_dashboard`
- `public.zgirl_board_create_pack`
- `public.zgirl_board_refresh_pack`
- `public.zgirl_board_finalize_pack`
- `public.zgirl_board_archive_pack`
- `public.zgirl_board_pack_packet`

## Required verification
- package version 3.9.0
- prebuild reviewer automation self-test passes without secrets
- Next.js compile succeeds
- TypeScript passes
- new routes appear in route manifest
- public product page returns 200 in Preview
- restricted workspace has noindex/nofollow
- unauthenticated board-governance APIs return 401
- board-pack table has RLS enabled and zero direct anon/authenticated table grants
- database has zero synthetic board packs after QA
- v3.8/v3.7 privacy and authority boundaries remain unchanged
- commerce remains unchanged unless separately activated
- no new cron job introduced by v3.9

## Export verification
- ICS uses `text/calendar` and contains only authorized governance-calendar metadata
- evidence CSV contains only administrative evidence index metadata
- action-owner CSV contains only owner/count/due-date metadata
- exports are read-only

## Authority verification
- Institutional Admin can prepare/refresh draft pack only for authorized tenant scope
- System Owner required to finalize/archive
- finalized snapshot does not rewrite when source records later change
- no pack action changes access, agreement, workflow gate, license, credential, evidence attestation, payment or revenue state

## Release order
Do not merge/deploy v3.9 ahead of v3.8. Keep the release stacked and unmerged until predecessor releases are advanced and verified in order.
