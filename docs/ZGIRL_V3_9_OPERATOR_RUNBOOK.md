# Z-Girl v3.9 Operator Runbook

## Access
Use the existing named institutional operator session. Break-glass access remains recovery/System Owner access, not routine multi-user administration.

## Board governance workspace
Restricted route: `/institutions/governance-board`

1. Choose an authorized institution.
2. Select the reporting period.
3. Review governance item, due-item, evidence and retention-review counts.
4. Review action owners and next due dates.
5. Use read-only exports as needed:
   - Download ICS
   - Evidence CSV
   - Action-owner CSV
6. Institutional Admin may create a frozen draft board pack.
7. Draft packs may be refreshed before finalization.
8. System Owner reviews the packet and finalizes it when appropriate.
9. Use Print / Save PDF on the packet route for board/committee distribution.

## Packet route
`/institutions/governance-board/pack/[id]`

The packet includes:
- institution and pack identity
- period and status
- executive summary
- governance-calendar table
- executive action-owner report
- governance report index
- attestation index
- audit-package index
- evidence-retention review register
- data/authority boundary.

## System Owner controls
System Owner may finalize or archive a pack. These operations do not alter source governance/evidence records.

## Export safety
Exports are generated server-side after tenant authorization. They contain administrative governance metadata only. ICS and CSV exports are read-only and do not create or modify calendar records in Z-Girl.

## Empty state
With no institutional records, the workspace must remain empty. Do not create fake institutions, board members, reports, attestations, evidence, action owners or board packs for demonstration in staging.

## Release-order rule
v3.9 must remain stacked behind v3.8 until the earlier held release chain is advanced and verified in order. Do not merge v3.9 directly to production ahead of its dependencies.
