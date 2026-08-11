# Z-Girl v3.2 — Institutional Partner Pipeline & Contract Operations

## Product purpose
v3.2 closes the front end of the Z-Girl institutional lifecycle by organizing institutional prospecting, fit review, decision-makers, proposals, follow-up, and the governed transition into v3.1 agreement/release operations.

**Prospect → Discovery → Fit Review → Qualified → Proposal → Negotiation → Agreement → Approval → License/Delivery**

The pipeline is an institutional business-development system. It is not a participant reflection dashboard, youth/student/athlete case-management system, payment ledger, clinical record, clergy record, safeguarding case file, or sports-medicine record.

## Public product layer
`/institutions/partner-pipeline`

## Restricted operator layer
`/institutions/ops/pipeline`

Uses the existing Credential Operations rotating access code and HttpOnly operator session.

## Private decision packet
`/institutions/ops/pipeline/packet/[opportunityId]`

Print/save-as-PDF packet containing opportunity summary, decision-maker map, proposal record, open follow-up, recent institutional interactions, and linked governed workflow status.

## Data model
- `zgirl_partner_opportunities`
- `zgirl_partner_contacts`
- `zgirl_partner_activities`
- `zgirl_partner_proposals`
- `zgirl_partner_followups`

All five tables have RLS enabled and direct anon/authenticated table access revoked.

## Opportunity paths
- `initial_contract`
- `expansion`
- `train_the_trainer_addendum`

## Opportunity stages
Identified → Outreach → Discovery → Fit Review → Qualified → Proposal → Negotiation → Agreement → Approval → Converted

Alternative terminal/holding states: Nurture, Closed Lost.

## Proposal states
Draft → Internal Review → Sent/Revised → Accepted or Declined.

Proposal value is administrative pipeline metadata. It is not a payment record.

## Governed contract handoff
`zgirl_partner_handoff_to_workflow` is the only v3.2 bridge into institutional authority operations.

It requires an Accepted proposal.

For a new institutional relationship it creates:
1. a **Draft** institutional license,
2. a **Draft** institutional agreement,
3. a governed `initial_contract` workflow,
4. a structured administrative evidence packet,
5. the five existing v3.1 human approval gates.

For an expansion or Train-the-Trainer addendum it links to the existing license and creates the appropriate draft agreement/workflow.

The handoff **does not activate delivery**. Activation remains controlled by the v3.1 sequence:

Evidence → Program Quality → Privacy Governance → Agreement Authority → Commercial Authority → Executive Release → Executed Agreement → Release Review → Delivery Handoff → Human Release / Scheduled Activation.

## Workflow synchronization
After pipeline handoff:
- v3.1 release-review/ready/scheduled status moves the opportunity to Approval.
- v3.1 Released moves the opportunity to Converted.
- only a Released workflow can move the authoritative institution from Prospect to Pilot/Active.

## Follow-up discipline
The dashboard surfaces:
- follow-ups due today,
- overdue follow-ups,
- opportunities stale for 14+ days,
- open proposals,
- agreement/approval queue,
- gross pipeline value,
- probability-weighted pipeline value.

## Contact boundary
Pipeline contacts are adult institutional/business contacts such as:
- champion,
- decision-maker,
- procurement,
- legal,
- finance,
- implementation lead.

Do not place participant/youth data in contacts.

## Commercial boundary
v3.2 does not configure a merchant of record or checkout. Estimated value, proposal value, commercial authority, payment status, agreement execution, license status, credential status, and delivery status remain separate records/events.

Payment can never auto-accept a proposal, approve a gate, execute an agreement, issue a credential, activate a license, prepare a handoff, or release delivery.

## Product ladder
Institutional Prospect → Pilot → Annual License → Renewal → Multi-Site Expansion → Train-the-Trainer → Network Scale
