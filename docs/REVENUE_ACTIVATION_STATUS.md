# Z-Girl Revenue Activation Status

Last updated: 2026-08-15

## Live now

- Public product storefront
- Founding Partner conversion page
- Product reservation and invoice-request fallback
- Faith-profile inquiry
- Athlete-team pilot inquiry
- Secret-safe activation status endpoint
- Commercial-purchase / non-donation notice
- Checkout gate requiring an explicit commercial seller
- Institutional pilot, licensing, credential, agreement, renewal, partner-pipeline, executive-reporting, identity/RBAC, tenant-governance, evidence, governance-calendar, and board-reporting layers are built in the current release train

## Business activation milestones completed

The commercial legal-entity, tax-identity, and banking prerequisites are established:

- Commercial seller / operating entity: **Greene Leadership System LLC**
- Georgia formation: **complete**
- LLC effective date: **2026-08-06**
- EIN: **assigned / confirmed**
- Business banking relationship: **established**
- Formation / EIN / banking gate: **CLEARED**

These milestones do **not** automatically activate paid checkout. Merchant/payment-provider setup, application environment configuration, controlled transaction testing, and explicit launch authorization remain separate gates.

## GLS merchant validation completed

The shared Greene Leadership System commercial rail has now passed both major sandbox transaction paths under the GLS sandbox account:

- **$6,500 Stripe Checkout:** PASS
- **$6,500 Stripe Hosted Invoice:** PASS
- signed Stripe webhook delivery: PASS
- protected GLS order/payment-event ledger reconciliation: PASS
- protected post-payment fulfillment queue: PASS

These tests validate the shared GLS commerce architecture, but they do **not** authorize Z-Girl paid launch and do not make Z-Girl a separate merchant.

Z-Girl should inherit the approved GLS commercial seller/merchant architecture after GLS live activation rather than creating an unrelated merchant-of-record.

## Current application activation state

The public endpoint `/api/commerce/status` reports only configuration booleans and never exposes credentials.

Current intended state:

- Legal commercial seller selected: **yes — Greene Leadership System LLC**
- `ZGIRL_SELLER_NAME` application environment configuration: **not configured / not verified**
- GLS live merchant activation: **not yet authorized**
- Paid checkout links configured in Z-Girl: **0 of 4**
- Server-side lead delivery configured: **no**
- Lead delivery mode: **fallback**
- Reservation and prepared-email fallback: **active**
- `readyForPaidLaunch`: **false**
- Paid launch: **intentionally disabled until the full Z-Girl commerce gate passes**

This disabled state is correct while the broader GLS commercial-identity reconciliation is being completed.

## Remaining commercial activation actions

1. Complete the GLS pre-live commercial-alignment gate across Thinkific, Fourthwall, and Z-Girl seller mapping.
2. Complete live GLS Stripe verification and bank/webhook configuration under **Greene Leadership System LLC**.
3. Pass one controlled legitimate live GLS transaction and settlement/accounting reconciliation.
4. Add `ZGIRL_SELLER_NAME=Greene Leadership System LLC` in the deliberately selected Z-Girl Vercel environments.
5. Create four commercial checkout routes under the approved GLS merchant:
   - Christian Reflection Starter Pack — $19
   - Athlete Reflection Starter Pack — $19
   - Hero Within Coach Toolkit — $99
   - Congregation Starter Toolkit — $149
6. Add the four approved routes as `ZGIRL_CHECKOUT_LINKS_JSON`.
7. Configure one server-side lead-delivery method:
   - Resend: `RESEND_API_KEY`, `ZGIRL_LEAD_EMAIL_TO`, `ZGIRL_LEAD_EMAIL_FROM`
   - or webhook: `ZGIRL_LEAD_WEBHOOK_URL`
8. Redeploy after deliberately approved configuration changes.
9. Verify `/api/commerce/status` reports the intended seller, 4 of 4 checkout links, configured lead delivery, and `readyForPaidLaunch:true`.
10. Complete one controlled low-value Z-Girl test purchase and one test inquiry.
11. Verify merchant receipt, settlement path, customer-facing receipt/descriptor, product-delivery path, lead delivery, and refund/support routing.
12. Record the test evidence and explicitly authorize broad paid launch.

## Canonical activation sequence

**LLC formed → EIN confirmed → bank established → GLS sandbox merchant validated → cross-platform commercial identity reconciled → GLS live merchant validated → Z-Girl seller/checkout environment configured → Z-Girl test purchase/inquiry passed → paid launch explicitly authorized.**

Product development, institutional inquiry, licensing preparation, reviewer/credential operations, and other non-payment work do not need to pause while the remaining merchant/payment gate is completed.

## Release-train boundary

Z-Girl production-readiness work is **not** commerce activation. A successful software release does not set merchant credentials, create payment links, or authorize paid promotion. Release boundary tests should keep `readyForPaidLaunch:false` unless a separate commercial activation decision deliberately changes that posture.

## Governance boundary

Do not use a donation-oriented checkout link for these products. Product purchases and licenses are commercial transactions and must not be presented as tax-deductible charitable contributions.

Greene Leadership System LLC becoming the commercial seller does not itself transfer ownership of The 4 Lessons / Z-Girl intellectual property. Ownership, commercial-use authority, and nonprofit mission use remain governed through separate chain-of-title, license, permission, or other written records.
