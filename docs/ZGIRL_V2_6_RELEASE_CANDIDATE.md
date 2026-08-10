# Z-Girl v2.6 Release Candidate

Release candidate: Institutional Onboarding & Implementation Kit

## Product objective

Turn the v2.5 institutional pilot/licensing architecture into a repeatable delivery operating system that supports implementation quality, governance, evidence, renewal, licensing, and future Train-the-Trainer scale.

## Public product layer

### New route

- `/institutions/implementation-kit`

The page explains the seven-stage implementation system:

1. Readiness
2. Implementation planning
3. Facilitator orientation
4. Family communication
5. Aggregate learning
6. Closeout
7. Renewal & expansion

It also connects the kit to the Institutional Pilot, Annual License, Multi-site Expansion, and future Train-the-Trainer product ladder.

### Updated routes

- `/institutions` now links directly to the implementation kit and explains that the kit operationalizes the pilot-to-license lifecycle.
- `/institutions/pilot-brief` now links directly to the implementation kit and states that the pilot is backed by the complete onboarding/implementation system.

## Institutional asset stack

### Master operating system

- `docs/ZGIRL_INSTITUTIONAL_IMPLEMENTATION_KIT.md`

### Pre-launch

- `docs/ZGIRL_INSTITUTIONAL_READINESS_ASSESSMENT.md`
- `docs/ZGIRL_INSTITUTIONAL_IMPLEMENTATION_CALENDAR.md`
- `docs/ZGIRL_FACILITATOR_ORIENTATION_GUIDE.md`
- `docs/ZGIRL_FAMILY_NOTICE_TEMPLATE.md`

### Evidence & closeout

- `docs/ZGIRL_AGGREGATE_PILOT_SCORECARD.md`
- `docs/ZGIRL_PILOT_CLOSEOUT_REPORT_TEMPLATE.md`
- `docs/ZGIRL_RENEWAL_EXPANSION_DECISION_PACKAGE.md`

## Governance requirements preserved

- private participant reflection text is not routine institutional reporting data;
- no institutional private-reflection dashboard;
- no forced disclosure;
- pause / skip / stop / trusted-person pathways preserved;
- no diagnosis, treatment, clinical scoring, medical-care, crisis-service, clergy/spiritual-direction, or sports-medicine claims;
- safeguarding/emergency/mandated-reporting duties remain with the institution and applicable professionals;
- accessibility support does not require diagnosis disclosure to Z-Girl as a standard condition;
- specialized profiles remain approved and versioned;
- commercial product/license payments remain separate from charitable donations.

## Productization role

The implementation kit is designed to be reusable across:

- institutional pilot delivery;
- premium implementation support;
- annual license onboarding;
- multi-site / district / network / league expansion;
- future Train-the-Trainer prerequisites;
- future facilitator credential / certification evidence.

## Release verification checklist

- [ ] Next.js build compiles.
- [ ] TypeScript passes.
- [ ] `/institutions/implementation-kit` appears in route manifest.
- [ ] `/institutions/implementation-kit` returns HTTP 200 in Preview.
- [ ] `/institutions` returns HTTP 200 and includes implementation-kit link.
- [ ] `/institutions/pilot-brief` returns HTTP 200 and includes implementation-kit link.
- [ ] Existing institutional inquiry form still uses supported `founding-partner` lead type.
- [ ] Commerce activation remains unchanged and gated.
- [ ] No private-reflection collection feature introduced.
- [ ] No unsupported universal legal-compliance claim introduced.

## Commercial activation boundary

v2.6 does not activate paid checkout. Commerce activation remains governed by the existing seller/checkout/lead-delivery gate. Institutional pilots and licenses should use approved commercial contracting/invoicing/checkout processes only after the merchant-of-record requirements are satisfied.

## Deployment retry status

On 2026-08-10, the prior final-head Preview check remained stale at Vercel's account build-rate-limit failure. This release-status commit intentionally retriggers Preview verification without changing v2.6 product behavior or governance boundaries.

## Recommended post-release build

After this kit is validated through live institutional use, build the **Z-Girl Train-the-Trainer & Facilitator Credential System** with:

- facilitator competency framework;
- training modules;
- knowledge checks;
- observation rubric;
- remediation pathway;
- authorization tiers;
- version-control requirements;
- renewal / recredential standards;
- institutional trainer license terms;
- certification boundary and evidence rules.
