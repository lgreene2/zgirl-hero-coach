# Z-Girl v3.7 Operator Runbook

## Entry points
Public product page: `/institutions/access-governance-evidence`
Session-gated evidence workspace: `/institutions/governance-evidence`
Audit-package generation workspace: `/institutions/governance-evidence/packages`
Printable report packet: `/institutions/governance-evidence/report/[id]`
Compatibility redirect: `/institutions/ops/evidence/report/[id]`

## Prepare a governance report
1. Sign in with an authorized named operator identity.
2. Open the governance evidence workspace.
3. Select the institution available to your role scope.
4. Choose report type: access review, annual governance, SSO readiness, or offboarding closeout.
5. Set a reporting period no longer than 400 days.
6. For access-review evidence, select a completed access review.
7. Enter title, preparer, and executive summary.
8. Create the draft report.

The draft stores an administrative snapshot. It does not modify roles, sessions, licenses, credentials, agreements, commerce, or SSO.

## Finalize a report
System Owner reviews the draft and finalizes it. Finalization records the responsible operator and timestamp. The frozen snapshot is not silently regenerated.

## Prepare and record an attestation
1. An authorized tenant administrator prepares an attestation against a finalized report.
2. System Owner reviews the report and supporting record.
3. System Owner records attestor name/title, attestation statement, and optional decision/reference identifier.
4. The attestation becomes `attested` with timestamp and operator record.

Attestation is an administrative governance affirmation, not legal certification or independent audit opinion.

## Create an audit package
1. Open the package workspace.
2. Select an institution.
3. Select a finalized report.
4. Generate the package.
5. The database creates an immutable package code and manifest referencing the report, source review, related attestations, evidence sections, and authority boundary.
6. Download the JSON manifest from the evidence workspace when a package appears in the package register.
7. Open the report packet and use browser Print / Save as PDF for the human-readable evidence packet.

## Access-review closeout rule
Change/remove decisions should have implementation evidence recorded through the v3.6 access-review process before the report is represented as fully closed out.

## Privacy check before distribution
Confirm the packet does not contain participant reflections, case data, diagnosis/treatment information, counseling notes, safeguarding narratives, clergy records, sports-medicine records, credential assessment answers, or practicum detail.

## Retention note
Institutions should apply their own lawful records-retention policy. Z-Girl v3.7 provides administrative evidence records; it does not determine statutory retention periods for an institution.
