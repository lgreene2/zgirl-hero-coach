# Z-Girl v3.13 — GLS Qualification & Governed Activation Handoff

## Release objective

v3.13 closes the operational gap between a real GLS institutional prospect and a safely prepared Z-Girl pilot workspace.

It does **not** automate a prospect into a live participant pilot.

The controlled flow is:

**GLS candidate → response → governed qualification → proposal → executed agreement → engagement → Z-Girl workspace preparation → Z-Girl readiness → human live release**

## Candidate queue upgrade

The Pilot Command Center GLS queue now surfaces the administrative signals needed to understand where a candidate actually is:

- outreach status;
- response status;
- fit-gate progress (0–8);
- explicit qualification approval;
- participant group and capacity;
- implementation owner;
- explicit contracting entity;
- latest proposal status;
- latest agreement status;
- latest engagement status;
- existing Z-Girl pilot workspace, stage and readiness state;
- recommended next factory action.

The queue remains a governed view over GLS. It does not duplicate GLS opportunity records inside a separate Z-Girl CRM.

## Workspace eligibility

The Command Center exposes **Prepare governed Z-Girl workspace** only when the database confirms:

- GLS qualification type is `zgirl_institutional_pilot`;
- response is positive or legitimately exploratory / neutral;
- all eight GLS fit gates are confirmed;
- human qualification approval has been recorded;
- participant group and capacity are explicit;
- implementation owner is explicit;
- facilitator model is explicit;
- structured feedback plan is explicit;
- contracting path is explicit;
- client-side contracting entity is explicit;
- latest GLS agreement is `executed`;
- a GLS engagement exists;
- no Z-Girl pilot workspace already exists for the opportunity.

## Preparation behavior

`public.zgirl_prepare_gls_pilot_workspace(...)` is a controlled, idempotent operator action requiring global `pilot.write` authority.

When eligible, preparation can create:

1. a Z-Girl institution record or reuse the existing non-closed institutional record;
2. a pilot workspace linked to the real GLS opportunity, agreement and engagement;
3. a Z-Girl commercial snapshot showing the executed GLS agreement;
4. an aggregate planned cohort shell using the qualified participant-group description and capacity;
5. a planned institutional implementation-contact assignment;
6. an initial Z-Girl intake populated with reusable administrative fit information.

No participant roster is imported.

No private reflection text is imported.

## Intentional separation between GLS qualification and Z-Girl readiness

GLS qualification proves that the institutional opportunity is commercially and operationally credible enough to scope and contract.

Z-Girl readiness proves that the actual implementation is safe and prepared to launch.

Those are not the same gate.

The initial intake maps appropriate verified GLS signals into Z-Girl, but **safety-route confirmation is deliberately left false**. Workspace preparation also records readiness blockers for:

- safety-route confirmation;
- pilot-team review;
- cohort readiness;
- final human release.

Therefore an executed commercial agreement still cannot make a pilot live on its own.

## Privacy boundary

The v3.13 handoff carries adult institutional and aggregate implementation metadata only.

It must not contain or transmit:

- participant private reflections;
- participant journals;
- participant case narratives;
- diagnoses or treatment information;
- counseling notes;
- safeguarding narratives;
- individual mental-health profiles;
- credential-assessment detail unrelated to the institutional handoff;
- payment-card data.

Institutional evidence remains aggregate and provenance-labeled.

## UI behavior

A candidate card now shows the complete handoff chain and one context-specific factory next action.

Before eligibility, the workspace gate is visibly locked.

After eligibility, an authorized operator may prepare the workspace.

After preparation, the card links to the Z-Girl pilot workspace, where the normal readiness, team, cohort, safety, accessibility and release controls continue.

## Failure posture

The system fails closed.

If qualification, contracting entity, agreement execution, engagement, named System Owner or any required handoff detail is absent, workspace creation is rejected.

If a workspace already exists, the function returns the existing pilot instead of creating a duplicate.

## Operating principle

**Automate movement of verified administrative facts; never automate away institutional judgment, participant privacy, safety review or human release authority.**
