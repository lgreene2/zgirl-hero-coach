# Z-Girl v2.5 — Institutional Pilot & Licensing Layer

Status: release candidate pending deployment verification

## Purpose

Create one governed pathway that connects the existing Z-Girl EDU, Faith & Values, Athlete Edition, and specialized design-partner experiences to a repeatable institutional model:

**fit review → pilot → aggregate learning → decision → annual license → train-the-trainer / expansion**

This layer is designed to support institutional growth without giving organizations access to private participant reflections.

## Public entry points

### Institutional hub

`/institutions`

The page serves as the institutional front door for:

- schools and youth programs
- congregations and faith communities
- athlete teams and leagues
- approved specialized design partners

The primary site navigation routes institutional buyers and partners to this hub.

### Institutional pilot brief

`/institutions/pilot-brief`

This is a concise, print-friendly sales brief designed to work as:

- a public shareable link
- a prospect-facing one-pager
- a meeting leave-behind
- the source for a future PDF export
- an institutional pilot conversation starter

The institutional hub links directly to the pilot brief.

## Product ladder

### 1. Pilot

A time-bounded implementation used to validate:

- audience fit
- workflow
- facilitator readiness
- accessibility
- family communication
- adoption and completion
- usefulness and safety
- support requirements

A pilot does not create access to raw participant reflections.

### 2. Annual license

An organizational right to use the approved Z-Girl implementation package for the documented:

- organization
- audience
- term
- facilitator scope
- content profile
- implementation setting
- support level
- renewal conditions

### 3. Train-the-Trainer

A controlled expansion pathway for organizations that need additional internal facilitators. Certification or trainer status should never be implied unless the corresponding standards, assessment, renewal, and revocation system has been formally released.

### 4. Strategic / Design Partner

A scoped engagement for approved specialized needs such as accessibility profiles, faith profiles, institutional integrations, or research-and-learning partnerships.

## Existing institutional lanes

### Z-Girl EDU

Current model: 30-day facilitated experience with staff orientation, family notice, facilitator resources, aggregate scorecard, and closeout decision.

### Faith & Values

Current model: opt-in faith/values implementation with governed profiles, congregation toolkit, facilitator guidance, and family-facing resources.

### Athlete Edition

Current model: four-week mindset and character pilot with coach orientation, athlete resources, family communication, accessibility guidance, and findings.

## Institutional asset stack

### Prospect / sales asset

`docs/ZGIRL_INSTITUTIONAL_PILOT_SELL_SHEET.md`

Purpose:

- prospect education
- founding-partner outreach
- sales follow-up
- institutional meeting handout
- future PDF / branded one-pager source

### Pilot contracting asset

`docs/ZGIRL_INSTITUTIONAL_PILOT_AGREEMENT_SOW_TEMPLATE.md`

Purpose:

- define parties and approved pilot profile
- define implementation scope and milestones
- preserve private-reflection boundaries
- define facilitator / Customer responsibilities
- define IP and pilot license limits
- define commercial terms
- identify legal / procurement clauses requiring counsel review

This is a business template for counsel and procurement review before execution.

### Annual-license negotiation asset

`docs/ZGIRL_ANNUAL_LICENSE_TERM_SHEET_TEMPLATE.md`

Purpose:

- move a successful pilot into annual commercial terms
- define approved audience, locations, facilitator seats, and institutional profile
- define licensed and excluded rights
- preserve private-reflection boundaries
- structure support levels and optional add-ons
- create the basis for future standardized pricing bands
- separate standard licensing from future train-the-trainer rights

This is a commercial planning template for counsel review before final agreement execution.

## Governance requirements

These remain non-negotiable across institutional versions:

1. Private participant reflections are not institutional reporting data.
2. Institutions do not receive a student, athlete, or youth reflection dashboard.
3. Z-Girl is not represented as therapy, diagnosis, treatment, clinical scoring, or emergency support.
4. Aggregate implementation and experience measures may be used for program learning only when appropriately de-identified.
5. Youth-facing experiences preserve pause, skip, stop, and trusted-person pathways.
6. Specialized content profiles are versioned and governed; they do not silently modify the core system.
7. Commercial purchases and licenses remain distinct from charitable donations.

## Privacy and legal-review posture

The standard institutional model intentionally minimizes the need for Customer transfer of:

- education records
- medical or mental-health records
- counseling records
- diagnoses
- safeguarding case files
- private participant reflection text

School, child, youth, and online data obligations must still be reviewed for the specific implementation. The agreement and term-sheet templates therefore avoid claiming universal legal compliance and instead require an implementation-specific privacy / procurement review where applicable.

## Commercial boundary

Paid checkout remains intentionally gated until the approved commercial seller is fully active.

The planned merchant of record is **Greene Leadership System LLC**. The Georgia formation filing was submitted on 2026-08-06 and was still awaiting acceptance at the last confirmed checkpoint.

Do not activate commercial checkout merely because this institutional layer is deployed. Continue using inquiry / reservation / proposal / invoicing workflows until seller activation requirements are complete.

## Institutional pricing

Do not invent a single universal institutional price before pilot data and delivery effort are validated.

Existing founding ranges remain the reference points already published:

- Founding Congregation: $750–$1,500 annual founding range
- Founding Athlete Team: $1,500–$2,500 founding range
- Specialized Design Partner: scoped after discovery

School / district / youth-program pilots should remain inquiry-based until a supported pricing model is approved from actual delivery assumptions and pilot evidence.

## Required institutional agreement fields

Every institutional pilot or license should document at least:

- legal customer / organization
- implementation owner
- approved audience and age/grade range
- estimated participant count
- approved facilitators / trainer scope
- start and end dates
- implementation profile
- support level
- accessibility requirements
- safeguarding responsibility boundary
- family communication responsibility
- technology / access assumptions
- aggregate measures permitted
- data and privacy boundary
- content / brand-use permissions
- renewal / termination terms
- commercial fee and payment terms

## Evidence framework

Recommended aggregate measures:

- sessions offered
- participation
- completion
- usefulness
- confidence / self-efficacy proxy
- return / reuse
- identified Hero Move / action
- accessibility experience
- safety / respect experience
- facilitator implementation quality

Do not include private reflection text in the institutional scorecard.

## Current activation sequence

1. Maintain PR #11 as the v2.5 release candidate.
2. Wait for the Vercel build-rate limit to permit a fresh Preview build, or verify through another trusted build path.
3. Confirm `/institutions` and `/institutions/pilot-brief` render correctly and responsively.
4. Test the institutional inquiry flow and fallback email behavior.
5. Print-test the public pilot brief.
6. Review the Pilot Agreement / SOW template with counsel before first execution.
7. Review the Annual License Term Sheet before first institutional renewal / conversion.
8. When Greene Leadership System LLC is accepted and payment infrastructure is ready, activate the commercial seller configuration separately under the v2.4 revenue gate.

## Release intent

v2.5 should make Z-Girl institution-ready without making it institution-controlled. The sellable asset is the governed implementation system—not access to a participant's inner life.
