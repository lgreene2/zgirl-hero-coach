# Z-Girl v3.0 Institutional Administration Runbook

## Restricted console
`/institutions/ops`

Uses the existing Credential Operations HttpOnly operator session. The same rotating access code governs both credential and institutional administration.

## Standard operating sequence
1. Create the institution record.
2. Add sites/programs that will be covered.
3. Create the license record.
4. Keep the license in Draft or Pending until the implementation/agreement authority is actually approved.
5. Allocate adult facilitator/trainer seats.
6. Complete facilitator authorization in Credential Operations.
7. Link the issued credential to the appropriate institutional seat.
8. Monitor license and credential renewal separately.
9. Export an institutional credential roster when needed for an authorized administrative purpose.
10. Release seats when an adult leaves the approved implementation team.

## CSV roster import
Maximum: 250 adult facilitator/trainer rows per batch.

Required columns:
- Full Name
- Email

Optional columns:
- Pathway
- Training Version
- Site Name
- Seat Role

Allowed Pathway values:
`general`, `edu`, `faith`, `athlete`, `institutional`

Allowed Seat Role values:
`facilitator`, `lead_facilitator`, `institutional_trainer`

Bulk imports enforce the same seat, distinct-site, and institutional-trainer limits as manual allocation. Site names that do not yet exist may be created automatically only when the license site limit permits.

The import batch stores counts only; it does not preserve the uploaded raw CSV.

## License renewal
The daily database automation marks current licenses as renewal-due when they enter the 90-day window. After expiration, an Active or Conditional license becomes Lapsed and active/reserved seats are changed to Blocked.

Renewal requires an executed renewal agreement reference. Recording renewal restores the license to Active, records the new expiration and seat limit, marks the agreement Executed, and restores blocked seats to Active. The new seat limit cannot be lower than current allocated-seat usage.

## Important boundary
License lapse is an institutional-authority event, not an automatic individual-credential revocation event. Individual credential status must be governed through Credential Operations.

## Commercial boundary
Do not record donations as license payments. Do not activate institutional paid checkout until the approved commercial seller is configured. Agreement status and payment status are distinct concepts.
