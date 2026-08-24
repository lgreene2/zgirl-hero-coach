# Z-Girl v3.14 — Human Readiness & Governed Release Evidence

## Release objective

v3.14 closes the last intentional gap between an operationally prepared institutional pilot and participant-facing live release.

The controlled path is now:

**GLS qualification → executed agreement → Z-Girl workspace → operational readiness → release evidence → named human decision → separate Live-stage action**

No commercial event, automation, checklist total, or system recommendation can make a pilot live.

## Required release-evidence gates

Each pilot has 11 administrative review categories:

1. method fidelity;
2. safety and escalation route;
3. age and audience fit;
4. participant agency and voluntary disclosure;
5. privacy and data boundary;
6. accessibility and accommodations;
7. technical and device reliability;
8. family notice / consent or documented not-applicable basis;
9. staff orientation and named responsibilities;
10. cohort, schedule and device plan;
11. aggregate-only measurement plan.

Each gate is recorded as `Not assessed`, `Pass`, `Conditional`, or `Fail` with a named reviewer, evidence reference, timestamp, and reviewer note when conditional or failed.

Evidence references are administrative records, policies, QA receipts, or aggregate plans. Participant private reflections, journals, diagnoses, counseling notes, safeguarding narratives, and individual case records are prohibited.

## Human decision model

The authorized human decision options are:

- **Ready** — all 11 evidence gates pass and the operational corroboration gates are complete;
- **Ready with conditions** — every evidence category has been assessed, none failed, at least one is conditional, and explicit conditions are recorded;
- **Not ready** — the human reviewer determines that release should remain locked.

Decisions are append-only. A later decision supersedes the prior one without rewriting history.

The decision ledger snapshots the evidence and operational state that existed when the decision was made.

## Live-release authorization

`Ready` and `release authorized` are deliberately separate fields.

A named operator with `pilot.activate` authority may authorize release only when:

- the pilot is not a governed test record;
- all 11 release-evidence gates pass;
- all 12 operational intake checks pass;
- a named System Owner exists;
- an implementation contact exists;
- an active facilitator exists;
- a safety contact exists;
- an accessibility contact exists;
- at least one aggregate cohort is Ready or Active.

Even after authorization, the pilot does not become Live automatically. An authorized operator must perform the separate lifecycle transition.

The database rejects a `Live` transition unless the latest immutable decision is `Ready` with `release_authorized=true` and current release evidence remains complete.

Governed test pilots cannot receive real release authorization and cannot enter Live.

## Receipt and auditability

The restricted Readiness Decision Receipt shows:

- pilot and institution identity;
- latest immutable human decision;
- named decision maker and timestamp;
- rationale and conditions;
- current release-evidence status and references;
- current operational corroboration;
- explicit test/real and privacy boundaries.

The receipt can be printed or saved as PDF for controlled institutional review. It is not public evidence and does not authorize a case study, testimonial, outcome claim, contract, payment, credential, or renewal.

## Privacy and authority boundaries

- GLS remains authoritative for opportunity, qualification, proposal, agreement, engagement, invoice, payment, and renewal commerce.
- Z-Girl remains authoritative for implementation readiness, release evidence, live-pilot release decision, delivery evidence, and closeout.
- Institutional reporting remains aggregate-only.
- No raw participant reflection text is available to institutional operators.
- Z-Girl is an educational reflection tool, not therapy or crisis care.
- Deterministic safety handoff and trusted-adult guidance remain required.

## Operating principle

**Automation may assemble verified evidence. Only a named human may decide whether the pilot is ready, and release remains a separate accountable action.**
