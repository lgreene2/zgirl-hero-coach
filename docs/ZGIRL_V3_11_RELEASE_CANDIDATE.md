# Z-Girl v3.11 — Operational Activation & Institutional Pilot Engine

## Release objective

Convert the live governed Z-Girl platform into a reusable institution-ready implementation system capable of taking a real qualified institutional opportunity through onboarding, configured pilot, implementation, evidence, closeout, renewal and expansion.

## Production baseline

This branch was created from Z-Girl `main` at `169482c26c144869fa3333830cddbdfe54d35899`, after v3.10 production consolidation and the subsequent GLS merchant-rail alignment commit.

## Built in v3.11

- reusable institution-agnostic pilot data model
- pilot intake/qualification/readiness
- role-scoped operational team assignments
- aggregate cohort structures
- implementation milestones/checklists
- aggregate activity/adoption metrics
- provenance-labeled evidence register
- testimonial/case-study/reference/funder permission controls
- facilitator-learning signals for later Train-the-Trainer design
- closeout/renewal/expansion workflow
- pilot executive command center
- per-pilot workspace
- printable implementation evidence package
- commercial/SOW implementation package
- GLS server-to-server pilot bridge client
- lifecycle and evidence-integrity guards

## Safety / governance

The institutional pilot layer does not create an individual participant registry and does not store private participant reflections, diagnosis/treatment data, counseling notes, safeguarding narratives, clinical/clergy/sports-medicine records, detailed credential assessment evidence, or payment-card data.

A pilot team role does not grant platform access. Access remains controlled by the named-operator/RBAC system.

## Real vs test

A real non-test pilot requires a real named global System Owner. A commercial real pilot also requires a GLS opportunity reference.

Governed QA pilots use `is_test=true` and cannot be represented as production evidence/case studies.

## Lifecycle gates

The normal path is:

Opportunity → Qualified → Agreement/Scope → Institution Setup → Onboarding → Pilot Ready → Live → Evidence Collection → Completed → Renewal → Expansion

Database guards prevent stage skipping and require the appropriate readiness/team/cohort/commercial/evidence prerequisites.

## GLS boundary

GLS remains the source of truth for the commercial relationship and contract/payment state. Z-Girl remains the implementation/evidence source of truth. The bridge exchanges only approved institutional/implementation metadata.

## Commerce

The institutional pilot engine does not depend on public self-service checkout. No v3.11 code change authorizes broad paid public launch.

## Database checkpoint

The v3.11 pilot schema has been applied to managed cloud. At the pre-release checkpoint:
- pilot tables: 11
- RLS enabled: 11/11
- direct anon/authenticated table grants: 0
- pilots: 0
- team assignments: 0
- cohorts: 0
- evidence records: 0

No fake production institution/evidence has been created.

## Release gates

Before production merge:
1. package and lockfile are both 3.11.0
2. static v3.11 verifier passes
3. `npm ci` succeeds
4. Next.js/TypeScript production build passes
5. Reviewer Activation CI passes
6. exact-head Preview is READY
7. pilot public product route returns 200
8. restricted pilot APIs reject unauthenticated access
9. credential non-disclosure remains intact
10. commerce remains separately gated
11. database RLS/grant/zero-fake-data checks pass
12. runtime errors are clean

Only after those gates pass should the release be merged, deployed and followed by named System Owner/first real institution activation.
