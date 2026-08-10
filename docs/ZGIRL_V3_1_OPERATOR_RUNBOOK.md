# Z-Girl v3.1 Institutional Workflow Operator Runbook

## Restricted console
`/institutions/ops/workflows`

Uses the same Credential Operations access code and HttpOnly session as `/credentials/ops` and `/institutions/ops`.

## Normal renewal sequence
1. The 90-day automation creates a Renewal workflow automatically when an eligible license enters the renewal window.
2. Open the workflow and review the generated administrative evidence packet.
3. Refresh the evidence packet if institutional sites, seats, or credential linkages changed materially.
4. Record or link the renewal agreement.
5. Process each approval gate:
   - Program Quality
   - Privacy Governance
   - Agreement Authority
   - Commercial Authority
   - Executive Release
6. Only mark a gate Approved or Waived when a named decision-maker is recorded.
7. Only mark the agreement Executed when the authoritative reference and effective date are actually known.
8. When all gates are Approved/Waived and the linked agreement is Executed, the workflow reaches Release Review.
9. Enter the implementation owner and prepare the contract-to-delivery handoff.
10. Separately release the handoff with a release/kickoff reference.
11. If the approved effective date is future-dated, the handoff becomes Scheduled and the current license remains unchanged until that date.
12. The daily automation activates scheduled scope on its approved effective date.

## Expansion / change-order sequence
1. Create the workflow manually from an existing institutional license.
2. Enter only the scope elements that are changing; blank fields inherit the current license.
3. The system rejects requested seat/site/trainer limits below current use.
4. Review the structured evidence packet.
5. Create/link the expansion agreement or change order.
6. Process all approval gates.
7. Prepare and release/schedule the delivery handoff.

## Train-the-Trainer addendum
Use `train_the_trainer_addendum` only when the institutional pathway is actually approved for internal trainer capacity.

Do not represent a Train-the-Trainer addendum as professional licensure, accreditation, clinical qualification, or external professional certification.

## Agreement status rules
- Draft — internal working record
- Internal Review — being reviewed internally
- Counterparty Review — sent for external/institutional review
- Approved — approved but not executed
- Executed — authoritative reference and effective date confirmed
- Superseded — replaced by a later agreement/version
- Expired — recorded term ended
- Void — no longer operative

The authoritative executed agreement—not the metadata record—governs contractual terms.

## Approval gate rules
### Program Quality
Confirm delivery capacity, facilitator readiness, and implementation support.

### Privacy Governance
Confirm no request requires private reflection dashboards, participant-level surveillance, diagnosis/treatment use, or other prohibited data expansion.

### Agreement Authority
Confirm the appropriate authorized institutional/business approval path has been documented.

### Commercial Authority
Confirm the commercial pathway is authorized. This field is **not** proof of payment and must not be auto-approved from checkout.

For a formally approved noncommercial or mission use, Waived may be used with a documented decision-maker/reference.

### Executive Release
Record the final release decision before a handoff can be prepared.

## Handoff states
- Ready — approved workflow prepared for human release
- Scheduled — human release completed, but approved effective date is in the future
- Released — approved scope is active for delivery
- Cancelled — handoff should not proceed

## Evidence privacy rule
Evidence packets may contain institutional administrative counts only.

Never enter or attach:
- participant reflection text
- student/youth/athlete rosters
- diagnoses
- counseling/therapy notes
- safeguarding narratives
- clinical records
- clergy/spiritual-direction records
- sports-medicine records

## Commercial boundary
Do not use this console as a payment ledger. Do not record charitable donations as license payments. Do not treat a commercial payment as an approval, credential, renewal, expansion, agreement execution, or delivery release event.

## Scheduled jobs
1. `zgirl-institution-workflow-daily` — 10:07 UTC
2. `zgirl-credential-renewal-daily` — 10:17 UTC
3. `zgirl-institution-license-daily` — 10:27 UTC

The ordering is intentional so a previously approved and released future-dated renewal can activate before the older license term is processed as lapsed.
