# Z-Girl v3.7 Access Governance Evidence Standard

## Purpose
Define what may and may not become institutional access-governance evidence in Z-Girl v3.7.

## Evidence lifecycle
Review → Draft Report → System Owner Finalization → Human Attestation → Audit-Package Manifest → Retention.

## Allowed administrative evidence
- institution identity and status
- reporting period
- access-review cadence and next review date
- institution-scoped named operator assignments
- role, authentication mode, administrative status, and last-login metadata
- access-review status and retain/change/remove decisions
- implementation-reference completion state
- SSO readiness metadata and references
- offboarding administrative references
- high-level institutional license/site context
- human attestation statement and approval reference
- report/package identifiers, timestamps, and source references

## Prohibited evidence
The evidence layer must not contain:
- participant reflection text
- youth, student, or athlete case records
- diagnosis or treatment information
- therapy or counseling notes
- safeguarding narratives
- clergy/spiritual-direction records
- sports-medicine records
- participant behavior scoring
- credential assessment answers or scores
- practicum detail
- payment card data

## Authority separation
Institutional Admin may prepare draft reports and draft attestations within assigned tenant scope.
System Owner finalizes governance reports, records attestations, and creates audit-package manifests.

## Evidence status
A finalized report is an internal administrative governance record. It is not:
- regulatory certification
- legal compliance opinion
- professional accreditation
- professional licensure
- independent audit opinion
- clinical documentation

## Snapshot rule
A report snapshot freezes the authorized administrative facts available at report creation. Later operational changes do not silently rewrite that snapshot.

## Manifest rule
An audit package stores a manifest of source evidence and authority boundaries. It does not duplicate participant data and does not auto-execute any operational change.

## Access rule
All report, attestation, and package data remains behind existing named-session, role, and institution-scope controls. Direct anon/authenticated table access is revoked and RLS remains enabled.
