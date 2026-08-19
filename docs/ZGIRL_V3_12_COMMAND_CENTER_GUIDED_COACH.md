# Z-Girl v3.12 — Command Center Guided Coach

## Purpose

Z-Girl v3.12 adds an embedded, voice-guided institutional training layer so authorized operators can learn the Command Centers while they work.

The Guided Coach addresses a real operating issue: the institutional platform now contains distinct workspaces for Executive Portfolio, Partner Pipeline, Pilot Command Center, Agreement Workflows, License Administration, Identity & Access, governance evidence, and related operations. Those boundaries are deliberate, but they are not automatically obvious to a new operator.

The design principle is:

**Listen → See → Do → Confirm**

The coach is operational guidance embedded in the live application, not a separate training website and not an authority engine.

## v1 training surfaces

The first release covers the current System Owner journey:

- Institutional Sign-In
- Executive Portfolio
- Partner Pipeline
- Pilot Command Center
- Agreement Workflows
- License Administration
- Identity & Access
- full operator orientation
- Command Center Map

The same engine can later support Institutional Admin, Facilitator, Executive, Auditor, school, university, nonprofit, faith, athletics, municipality/community, and multi-site profiles.

## Voice experience

Voice uses the browser/device Web Speech engine and the existing Z-Girl natural-voice ranking helper.

The guide:

- prefers natural English device voices when available;
- prefers warm/feminine voice-name hints where the device exposes them;
- allows the operator to choose among available English voices;
- supports slower/calm/natural/standard/faster speaking rates;
- supports play, pause, resume, replay, and stop;
- keeps captions/transcript available;
- never autoplays audio.

Mobile Safari and other browsers may expose different installed voices. The guide does not claim that a particular voice or gender is available on every device.

## Role awareness

When the current named operator has permission to read the identity dashboard, Guided Coach reads only the existing safe operator context needed to label the session role.

If that permission is unavailable, the guide falls back to neutral institutional-operator guidance rather than requesting broader authority.

The coach never grants roles, expands institution scope, creates identities, or changes access.

## Page/state awareness

On the Pilot Command Center, the coach may read the already-authorized GLS candidate queue through the same existing server-side session boundary.

For an operator with global pipeline-read authority, narration may summarize operational metadata already visible on the screen, such as:

- number of open GLS opportunities;
- organization name;
- opportunity stage and priority;
- whether audience size or commercial value is still unset;
- recorded next action.

The coach does not bypass pipeline permissions and does not create or mutate opportunity state.

## Guidance hierarchy

### This Page

Explains:

- what the current workspace is for;
- what action belongs here;
- what action belongs somewhere else;
- what data should not be entered;
- the appropriate next step.

### Command Center Map

Explains the distinction among:

- Executive Portfolio;
- Partner Pipeline;
- Pilot Command Center;
- Agreement Workflows;
- License Administration;
- Identity & Access.

### Full Orientation

Covers:

1. institutional operating lifecycle;
2. commercial vs implementation authority;
3. participant privacy;
4. qualification before pilot creation;
5. evidence provenance;
6. human approval gates;
7. closeout, renewal, and expansion;
8. use of just-in-time Guided Coach support.

## Highlight / “Show me” behavior

A guide step may point to a deliberately identified interface element. When the operator taps **Show me**, the UI scrolls that element into view and applies a temporary visible outline.

This highlighting is presentation-only. It does not click the control, submit a form, or bypass an approval gate.

## Completion tracking

v3.12 stores lightweight training-completion and preference state in browser local storage only:

- whether the first-time introduction was seen;
- which guide lessons were marked complete;
- selected voice;
- speaking rate;
- captions preference.

No participant data, credential data, institutional case data, or private reflection content is stored by the Guided Coach.

Completion is a usability marker only. It does **not**:

- grant an operator role;
- satisfy an agreement or governance gate;
- issue a credential or authorization;
- create professional licensure;
- create a regulatory/compliance determination;
- certify facilitator competency.

Future institution-level training records, if needed, should be built as a separate governed feature with explicit assessment and authorization semantics.

## Safety and privacy boundaries

Guided Coach must never narrate or intentionally capture:

- personal access codes;
- one-time invitation codes;
- passwords;
- session tokens;
- API keys or secrets;
- private participant reflection text;
- participant case records;
- diagnoses or treatment information;
- therapy/counseling notes;
- safeguarding narratives;
- clergy/spiritual-direction records;
- sports-medicine records;
- detailed credential assessment evidence not needed for the operator task.

The coach uses the minimum operational metadata necessary to explain the workspace.

## Human authority boundary

Guided Coach can explain a gate but cannot satisfy it.

It cannot autonomously:

- mark an opportunity qualified;
- create a real pilot;
- execute or approve an agreement;
- activate a license;
- attest evidence;
- change access;
- issue or renew a credential;
- mark payment received;
- authorize public paid launch;
- make legal, clinical, professional, accreditation, audit, or regulatory conclusions.

## Current CAU use case

The first state-aware pilot guidance is designed around the real operating pattern currently visible in the Pilot Command Center:

**GLS Opportunity → NEW → Qualification Conversation → QUALIFIED → governed pilot creation**

The coach explicitly teaches that **NEW does not mean QUALIFIED** and that audience size/value may remain intentionally unset until the qualification conversation establishes a defensible scope.

## Productization path

One Guided Coach engine can support:

- System Owner Orientation;
- Institutional Administrator Orientation;
- Facilitator Orientation;
- Executive Orientation;
- Auditor Orientation;
- School/District Orientation;
- University Orientation;
- Faith Organization Orientation;
- Athletics Program Orientation;
- Multi-Site Network Orientation.

Real usage friction can later inform facilitator standards and Train-the-Trainer design without prematurely presenting this operator guidance as a credential program.
