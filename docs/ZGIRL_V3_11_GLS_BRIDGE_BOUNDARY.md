# Z-Girl v3.11 — GLS Pilot Bridge Boundary

## Principle

The bridge joins two systems without turning either into a duplicate of the other.

**Greene Leadership System (GLS)** is the institutional commercial relationship system.

**Z-Girl** is the governed implementation and evidence system for the Z-Girl solution.

## GLS → Z-Girl handoff data

Permitted handoff metadata includes:
- GLS opportunity ID and stage
- organization / decision-maker administrative metadata
- accepted/proposed solution
- proposal/agreement references and administrative status
- engagement ID and implementation window
- proposed/contracted commercial metadata needed for implementation planning
- next commercial action

## Z-Girl → GLS implementation data

Permitted return metadata includes:
- Z-Girl pilot ID/code
- pilot lifecycle stage
- readiness status
- implementation status
- evidence status (none/developing/usable/complete-type administrative state)
- renewal/expansion status
- next implementation action
- high-level implementation summary suitable for commercial relationship management

## Prohibited bridge data

Never transmit through the GLS bridge:
- participant private-reflection text
- participant journals
- individual youth/student/athlete case records
- diagnosis/treatment information
- counseling/therapy notes
- safeguarding narratives
- clinical records
- clergy/spiritual-direction records
- sports-medicine records
- detailed credential assessment/practicum evidence
- payment-card data

## Authentication

The bridge uses a dedicated server-to-server shared secret. It must not reuse a public token, browser credential, ordinary GLS pipeline administrator credential, Supabase service-role key, or Z-Girl operator session token.

Z-Girl environment:
- `ZGIRL_GLS_BRIDGE_URL`
- `ZGIRL_GLS_BRIDGE_SECRET`

GLS environment uses the corresponding dedicated Z-Girl bridge secret expected by its bridge endpoint.

## Failure behavior

Bridge unavailability must not weaken Z-Girl authorization. The UI may show synchronization unavailable, but local Z-Girl implementation records remain protected by named-operator RBAC and institutional scope.

A bridge error must not silently mark an agreement executed, a payment received, a license active, a credential issued, or a pilot live.

## Public commerce

The bridge is independent of public Z-Girl self-service checkout. Institutional invoicing/contracting can progress through GLS while public payment rails remain separately gated.
