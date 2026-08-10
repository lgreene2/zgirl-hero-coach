# Z-Girl Credential Data Boundary

## Rule

The Credential Operations Portal governs **adult facilitator/trainer authorization records**. It is not a participant case-management, counseling, clinical, safeguarding-incident, or reflection-record system.

## Permitted data

Credential operations may store only what is needed to administer the facilitator credential lifecycle:

- facilitator/trainer candidate name
- facilitator/trainer candidate email
- affiliated organization
- implementation pathway
- training/version assignment
- candidate workflow status
- requirement completion status
- aggregate facilitator assessment score when needed
- credential level
- credential scope
- issue and expiration dates
- credential status
- structured status-reason category
- public-verification enabled/disabled flag
- renewal state
- non-sensitive operational audit events

## Prohibited data

Do not enter or import:

- participant private reflection text
- youth/student/athlete journals or reflection responses
- diagnoses or disability details
- counseling, therapy, clinical, or medical notes
- safeguarding or abuse incident narratives
- crisis reports
- clergy/spiritual-direction records
- sports medicine records
- individual participant behavior case notes
- parent/family disputes or case details
- assessment answers containing participant private information
- uploaded files containing participant reflection content

## Assessment evidence

Credential assessment data should be minimized to:

- requirement status: pending / in progress / pass / fail / not required
- aggregate score from 0–100 when a score is needed
- completion timestamp

The system does not need item-by-item candidate answers for routine credential operations. Critical privacy/safety requirements must still be recorded as passed before credential issuance.

## Audit events

Audit events document **the administrative action**, not the underlying incident narrative.

Good:

- `Credential status changed to suspended`
- `Critical privacy/safety requirement updated`
- `Credential renewed`

Do not use audit events to record:

- participant names
- incident narratives
- health/diagnostic information
- counseling content
- private reflection excerpts

## Public verification

Public verification is exact-ID only and may reveal only the approved public credential record. Candidate email, assessment scores, requirement details, audit history, and renewal administration are private.

## Institutional reporting boundary

The credential portal evaluates and governs **facilitator authorization**. It does not expand an institution's access to participant private reflections. Z-Girl's existing no-private-reflection-dashboard and aggregate-learning boundaries remain unchanged.

## Commercial boundary

Program credential fees, training fees, renewal fees, and institutional trainer-license fees are commercial transactions and must remain separate from charitable donations.
