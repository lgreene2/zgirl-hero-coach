# Z-Girl v3.9 Board Governance Calendar & Executive Evidence Pack Standard

## Purpose
Convert the v3.8 institutional governance calendar and v3.7 evidence system into board/committee-ready administrative reporting without creating new authority or exposing participant information.

## Product chain
Governance Calendar → Evidence Index → Action Ownership → Frozen Board Pack → Calendar / CSV Exports → Board or Executive Review.

## Allowed data
- institution identity/type/status
- governance calendar dates, status, type, owner and source code
- annual governance review cycle metadata
- finalized/draft governance report metadata
- administrative attestation metadata
- administrative audit-package metadata
- evidence-retention review metadata
- action-owner counts and next due dates
- board-pack preparation/finalization metadata.

## Prohibited data
- participant private-reflection text
- youth/student/athlete/family case records
- diagnosis or treatment information
- therapy/counseling notes
- safeguarding narratives
- clergy/spiritual-direction records
- sports-medicine records
- participant behavior scoring
- credential assessment answers/scores or practicum detail
- payment-card data.

## Authority separation
- Institutional Admin: may prepare and refresh draft board packs for an assigned institution.
- System Owner / break-glass owner: may finalize or archive a board pack.
- Read-only exports do not mutate any operational state.
- Finalization freezes the administrative snapshot. It does not execute an agreement, approve a workflow gate, activate/renew a license, issue/renew a credential, change operator access, attest evidence, release delivery or mark payment/revenue state.

## Board pack lifecycle
1. Select institution and period.
2. Review live calendar, evidence index and action-owner summary.
3. Export working ICS/CSV files if needed.
4. Institutional Admin prepares a frozen draft pack.
5. Draft may be refreshed while still draft.
6. System Owner finalizes the pack.
7. Finalized pack is immutable as a snapshot; later source changes do not rewrite it.
8. System Owner may mark it archived as administrative metadata.

## Exports
### ICS
Standards-based all-day calendar events using governance item due dates. Contains governance title, type, status and owner only.

### Evidence CSV
Administrative index of governance reports, attestations, audit packages and retention-review records.

### Action-owner CSV
Owner, open items, due items, completed items and next due date.

## Claims boundary
A Z-Girl board governance pack is an administrative governance record. It is not a regulatory certification, legal compliance opinion, accreditation, professional licensure record or independent audit opinion.
