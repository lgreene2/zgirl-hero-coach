# Z-Girl v3.0 — Institutional Credential & License Administration

## Product role
Z-Girl v3.0 adds the institutional operating layer that sits above the v2.7 facilitator authorization system, v2.8 credential operations, and v2.9 issuance/renewal automation.

It manages the relationship between an organization, its approved license term, the sites/programs covered by that license, the adult facilitator/trainer seats allocated under the license, and the individual Z-Girl program credentials linked to those seats.

## Institutional lifecycle
1. Create institutional record.
2. Add approved sites/programs.
3. Record pilot, annual, multi-site, or Train-the-Trainer license scope.
4. Define approved profiles, credential levels, seat/site/trainer limits, term, and agreement status.
5. Allocate adult facilitator/trainer seats.
6. Link issued individual program credentials to institutional seats when appropriate.
7. Import adult facilitator/trainer rosters or manage seats individually.
8. Monitor 90-day license renewal readiness.
9. Renew, suspend, lapse, close, release, or block institutional authority.
10. Export controlled credential-seat rosters for institutional administration.

## Separation of authorities
The system deliberately separates:
- individual Z-Girl program credential status;
- institutional license status;
- institutional agreement status;
- commercial payment/merchant-of-record status.

A lapsed or suspended institutional license blocks delivery authority under that organization. It does not silently revoke an adult facilitator's separate individual program credential.

## Data boundary
Permitted administrative data:
- institution and site names;
- adult administrative contacts;
- adult facilitator/trainer candidate identity and email;
- credential IDs and credential status;
- license term, scope, approved profiles, seat/site/trainer limits;
- agreement reference/status;
- import batch counts and governance audit events.

Not permitted:
- private participant reflections;
- student/youth/athlete rosters;
- diagnosis, treatment, counseling, clinical or therapy records;
- safeguarding incident narratives;
- clergy/spiritual-direction records;
- sports-medicine records;
- youth case-management information.

## Productization role
v3.0 makes the institutional pathway operationally licensable:
Pilot → Annual License → Multi-Site License → Train-the-Trainer.

The software does not set or activate commercial pricing. Payment collection remains gated until the approved commercial seller/merchant-of-record workflow is configured.
