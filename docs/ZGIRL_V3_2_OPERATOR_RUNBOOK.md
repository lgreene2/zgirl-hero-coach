# Z-Girl v3.2 Partner Pipeline Operator Runbook

## Restricted console
`/institutions/ops/pipeline`

Use the same Credential Operations access code used by Credential Operations, License Administration, and Agreement Workflow administration.

## Normal new-partner sequence
1. Create the institutional Prospect and initial-contract opportunity.
2. Add adult institutional contacts and identify champion, decision-maker, procurement/legal/finance, and implementation roles where known.
3. Record discovery activity and the institutional need/use case.
4. Move the opportunity through Fit Review and Qualified only when the institutional pathway is credible.
5. Schedule a concrete next action. Avoid open opportunities with no next action.
6. Create and version the proposal.
7. Mark a proposal Accepted only when acceptance is actually documented.
8. Use **Hand accepted proposal to governed workflow** to prepare contract operations.
9. For a new partner, the handoff creates only a Draft license and Draft agreement plus an `initial_contract` approval workflow.
10. Continue in `/institutions/ops/workflows` for evidence, five human approval gates, agreement execution, release review, and contract-to-delivery handoff.
11. Do not treat the opportunity as Converted until the governed workflow becomes Released.

## Existing-partner expansion
Use `expansion` only when the existing institutional license is selected. The v3.2 handoff creates the draft expansion agreement and the normal v3.1 Expansion workflow.

## Train-the-Trainer addendum
Use `train_the_trainer_addendum` only for an institution with an existing license. Internal trainer authority remains dependent on the governed institutional scope and valid individual program authorization.

## Stage discipline
- Identified — possible institutional fit recorded.
- Outreach — contact effort underway.
- Discovery — needs/timing/authority being clarified.
- Fit Review — Z-Girl implementation fit being evaluated.
- Qualified — credible institutional opportunity with a plausible decision path.
- Proposal — proposal issued or being prepared for issue.
- Negotiation — proposal accepted in principle or terms being resolved.
- Agreement — governed contract workflow has begun.
- Approval — v3.1 agreement/release review is underway.
- Converted — governed workflow Released.
- Nurture — valid relationship without an active buying/implementation cycle.
- Closed Lost — active cycle ended; record a reason.

## Follow-up rule
Every active institutional opportunity should have a clear next action or a deliberate Nurture status. Use the dashboard's due/overdue/stale indicators to prevent relationship drift.

## Proposal rule
Proposal value is a planning/forecast field only. It is not proof of invoice, payment, merchant configuration, agreement execution, or authority to deliver.

## Privacy rule
Never enter participant reflection text, student/youth/athlete rosters, diagnoses, counseling/therapy notes, clinical records, safeguarding narratives, clergy/spiritual-direction records, or sports-medicine records in opportunity notes, activities, contacts, proposals, or follow-ups.

## Commercial boundary
Do not record charitable donations as commercial institutional revenue. Do not let a payment or proposal status automatically alter license, credential, agreement, approval-gate, or delivery status.

## Handoff boundary
Accepted Proposal → Draft institutional records + governed workflow.

It is **not**:
Accepted Proposal → Active License.
