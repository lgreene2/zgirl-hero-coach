# Z-Girl v3.1 — Institutional Agreement, Renewal & Expansion Workflow

## Product purpose
v3.1 turns the v3.0 institutional license record into a repeatable institutional lifecycle for renewal, expansion, change orders, and Train-the-Trainer addenda.

The operating chain is:

**Evidence → Human Approval Gates → Executed Agreement → Release Review → Contract-to-Delivery Handoff → Human Release / Scheduled Activation**

This is an institutional administration system. It is not a participant reflection dashboard, legal opinion engine, payment ledger, professional licensing authority, clinical record, clergy record, or sports-medicine record.

## Product roles
### Public product layer
`/institutions/agreement-workflow`

Explains how Z-Girl governs annual renewal, multi-site expansion, change orders, and Train-the-Trainer addenda.

### Restricted operator layer
`/institutions/ops/workflows`

Uses the existing Credential Operations HttpOnly operator session and rotating access code.

### Executive decision packet
`/institutions/ops/workflows/packet/[workflowId]`

Produces a print-ready internal decision packet comparing current and requested institutional scope, aggregate administrative evidence, approval gates, agreement status, and delivery handoff state.

## Workflow types
- `renewal`
- `expansion`
- `change_order`
- `train_the_trainer_addendum`

## Agreement types
- Pilot
- Annual
- Renewal
- Expansion
- Change Order
- Train-the-Trainer Addendum

## Approval gates
Every workflow starts with five required human decision gates:
1. **Program Quality** — Is the requested scope operationally supportable?
2. **Privacy Governance** — Does the request preserve Z-Girl privacy and participant-choice boundaries?
3. **Agreement Authority** — Is the appropriate institutional/agreement authority documented?
4. **Commercial Authority** — Is the commercial pathway authorized? This is **not** a payment-status field. It may be formally waived for an approved noncommercial use.
5. **Executive Release** — Has the final release decision been documented?

A gate may be Approved, Rejected, Waived, or Pending. Payment cannot automatically change a gate.

## Evidence packet
The evidence packet intentionally measures institutional administration rather than participant content. It contains only:
- evidence period
- active institutional sites
- allocated adult facilitator/trainer seats
- linked individual Z-Girl credentials
- facilitator-seat count
- trainer-seat count
- current institutional license status
- license expiration
- days remaining at snapshot

It does **not** contain private participant reflection text, youth/student/athlete rosters, diagnoses, counseling or therapy records, safeguarding narratives, clinical notes, clergy/spiritual-direction records, or sports-medicine records.

## Agreement boundary
An agreement can move through Draft, Internal Review, Counterparty Review, Approved, Executed, Superseded, Expired, or Void.

Only an **Executed** agreement with an authoritative reference and effective date can satisfy release review.

The agreement record is administrative metadata. The authoritative executed agreement controls contractual terms.

## Release and effective-date architecture
Approval does not immediately change the license.

1. Final approval prepares a **Ready** contract-to-delivery handoff.
2. A separate human release action records a required release reference.
3. If the approved effective date is today or earlier, the approved license scope activates immediately.
4. If the approved effective date is in the future, the handoff becomes **Scheduled** and the existing active license remains unchanged.
5. The daily workflow automation activates scheduled scope on the approved effective date.

This prevents an early renewal from prematurely changing the active term, seat limits, sites, trainer capacity, profiles, or credential levels.

## Daily automation
`zgirl-institution-workflow-daily`

Schedule: `07 10 * * *` UTC.

It runs before:
- credential renewal automation at 10:17 UTC
- institutional license lifecycle automation at 10:27 UTC

Functions:
- creates a renewal workflow when an eligible institutional license enters the 90-day renewal window
- creates the structured administrative evidence packet
- seeds all five approval gates
- expires agreement records whose recorded expiration has passed
- activates previously released future-dated handoffs on the approved effective date

## Database objects
### Tables
- `zgirl_institution_agreements`
- `zgirl_institution_workflows`
- `zgirl_institution_evidence_packets`
- `zgirl_institution_approval_gates`
- `zgirl_institution_delivery_handoffs`

### Core RPCs
- `zgirl_institution_save_agreement`
- `zgirl_institution_create_workflow`
- `zgirl_institution_link_workflow_agreement`
- `zgirl_institution_build_evidence_packet`
- `zgirl_institution_set_approval_gate`
- `zgirl_institution_finalize_workflow`
- `zgirl_institution_release_handoff`
- `zgirl_institution_workflow_run_automation`
- `zgirl_institution_workflow_dashboard`

All restricted RPCs require the existing high-entropy credential-operator session token.

## Commercial boundary
v3.1 does not configure a merchant of record, activate checkout, record charitable donations as payments, or allow payment to activate an institutional license.

Agreement authority, commercial authority, payment status, license status, credential status, and delivery status remain separate concepts.

## Product ladder
Pilot → Annual License → Renewal → Multi-Site Expansion → Train-the-Trainer → Network Scale

v3.1 is the operational bridge that makes annual recurring institutional revenue and controlled expansion practical without weakening governance.
