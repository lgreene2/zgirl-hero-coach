# Z-Girl v3.11.1 — First Named System Owner & Real Pilot Activation

## Purpose

This patch closes the gap between a production-ready pilot engine and the first real institutional operating record.

It adds:

- a **one-time database-admin-only first named System Owner bootstrap**;
- a **read-only GLS opportunity candidate queue** inside the Z-Girl Pilot Command Center;
- release guards proving that Z-Girl does not become a duplicate CRM and does not receive participant private-reflection data through the GLS handoff.

The patch does **not** create a real identity, institution, GLS opportunity or pilot automatically.

## Current governed activation state

At the v3.11.1 build checkpoint:

- named Z-Girl operators: 0
- active global System Owners: 0
- open/non-archived GLS opportunities: 0
- Z-Girl pilots: 0
- GLS↔Z-Girl implementation linkage rows: 0

These zero values are intentional. They must not be changed with fabricated production records merely to make a dashboard look active.

## First named System Owner bootstrap

The database function is:

`private.zgirl_bootstrap_first_system_owner(p_email text, p_display_name text)`

### Security properties

- The function is in the `private` schema.
- `PUBLIC`, `anon` and `authenticated` have no execute privilege.
- It can be run only through a trusted database-administrator operation.
- It refuses to run if **any named operator identity already exists**.
- It refuses to run if a global active `system_owner` role already exists.
- It creates one active `local_code` operator identity and one global `system_owner` role.
- It generates a high-entropy one-time invite code.
- Only the SHA-256 invite hash is stored.
- The invite expires in seven days.
- The plaintext invite is returned only in the trusted database-admin result at bootstrap time.
- The operator must still use the existing `/institutions/auth` invite-acceptance flow and choose a personal access code of at least 24 characters.

### Required real identity input

Do not infer or guess the email address for the first System Owner.

Use the exact operator email and display name deliberately selected for production administration. The System Owner email does not have to be the public storefront email, a donation mailbox, or a generic support alias.

### Trusted execution pattern

Run once from the trusted database administration channel:

```sql
select private.zgirl_bootstrap_first_system_owner(
  '<EXACT APPROVED OPERATOR EMAIL>',
  '<EXACT APPROVED DISPLAY NAME>'
);
```

Capture the returned invite code securely. Do not commit it to GitHub, documentation, logs, screenshots or issue comments.

After enrollment:

1. sign in at `/institutions/auth`;
2. confirm the identity dashboard shows one named operator;
3. confirm one active global `system_owner` assignment;
4. confirm normal pilot administration works with the named session;
5. preserve the break-glass path for emergency recovery only.

## GLS candidate queue

The Pilot Command Center now reads the canonical GLS queue through:

`public.zgirl_gls_pilot_candidates(p_session_token text)`

and application route:

`/api/institutions/ops/pilots/gls-candidates`

### Governance boundary

The queue:

- requires a valid named/break-glass session;
- requires global `pipeline.read` authority;
- does not grant institution-scoped administrators cross-institution prospect access;
- reads `public.gls_opportunities` as the source of truth;
- does not insert or duplicate GLS opportunity records;
- carries commercial/implementation metadata only;
- carries no participant reflection text, participant case data or credential assessment detail.

## First real institutional pilot activation sequence

Do not create the pilot until all of the following are true:

1. **Named System Owner active**
2. **Real GLS opportunity exists**
3. **Decision maker / contact is identifiable**
4. **Institutional use case is credible**
5. **Participant group is defined and manageable**
6. **Structured feedback access is realistic**
7. **Safety/privacy/accessibility requirements are understood**
8. **Pilot scope and contracting entity are explicit**
9. **Agreement/scope gate is satisfied before live implementation**
10. **Institutional implementation owner and facilitator roles are assigned**

Then use:

**GLS opportunity → Z-Girl institution → pilot workspace → intake/readiness → onboarding → cohort setup → pilot ready → live → evidence collection → closeout → renewal/expansion**.

## First-pilot selection rule

Availability alone is not enough.

Prefer an institution with:

- accessible decision authority;
- manageable pilot scale;
- a well-defined participant group;
- a real Z-Girl use case;
- willingness to provide structured feedback;
- realistic facilitator/implementation access;
- potential reference/case-study permission;
- credible renewal or broader adoption potential.

If no opportunity satisfies those conditions, continue GLS qualification rather than manufacturing a pilot.

## Commercial boundary

Institutional qualification, proposal, agreement preparation, invoice preparation and onboarding may proceed without public self-service checkout.

GLS remains authoritative for:

- opportunity and buyer stage;
- proposal state;
- agreement state;
- engagement/commercial record;
- invoice/payment state.

Z-Girl remains authoritative for:

- implementation readiness;
- pilot configuration;
- aggregate cohorts;
- facilitator/administrator operational assignments;
- aggregate adoption/activity;
- implementation evidence;
- closeout;
- renewal/expansion implementation signals.

Public Z-Girl checkout remains a separate commercial activation decision.

## Evidence boundary

Do not manufacture outcome claims.

Keep evidence provenance explicit:

- observed;
- participant reported;
- facilitator reported;
- administrator reported;
- system analytic;
- administrative fact.

Private reflection text never belongs in institutional evidence.

## Train-the-Trainer evidence path

The real pilot should create facilitator-learning signals for:

- required facilitation knowledge;
- common implementation mistakes;
- safeguarding expectations;
- escalation requirements;
- platform administration;
- reflection facilitation;
- accessibility/adaptation;
- institutional communication;
- evidence/reporting;
- fidelity.

Those signals feed later facilitator standards → training modules → assessment → authorization/credential → renewal → institutional licensing.

## Release posture

v3.11.1 may ship before the first owner or first pilot exists because the migration is additive and inert until an authorized activation action occurs.

Do not call the **first real institutional pilot active** until both the real named System Owner and a qualified real GLS opportunity have been deliberately established.
