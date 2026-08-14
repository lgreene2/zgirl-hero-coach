# Z-Girl Revenue Activation Status

Last updated: 2026-08-14

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

The commercial legal-entity, tax-identity, and banking prerequisites are now established:

- Commercial seller / operating entity: **Greene Leadership System LLC**
- Georgia formation: **complete**
- LLC effective date: **2026-08-06**
- EIN: **assigned / confirmed**
- Business banking relationship: **established**
- Formation / EIN / banking gate: **CLEARED**

These milestones do **not** automatically activate paid checkout. Merchant/payment-provider setup, application environment configuration, controlled transaction testing, and explicit launch authorization remain separate gates.

## Current application activation state

The public endpoint `/api/commerce/status` reports only configuration booleans and never exposes credentials.

Verified production state on 2026-08-14:

- Legal commercial seller selected: **yes — Greene Leadership System LLC**
- `ZGIRL_SELLER_NAME` application environment configuration: **not configured / not verified**
- Commercial merchant / Stripe configuration: **not yet verified for Z-Girl launch**
- Paid checkout links configured in Z-Girl: **0 of 4**
- Server-side lead delivery configured: **no**
- Lead delivery mode: **fallback**
- Reservation and prepared-email fallback: **active**
- `readyForPaidLaunch`: **false**
- Paid launch: **intentionally disabled until the full commerce gate passes**

## Remaining commercial activation actions

1. Configure / confirm the commercial merchant or Stripe account under **Greene Leadership System LLC**.
2. Confirm the business-bank settlement connection used by the merchant account.
3. Add `ZGIRL_SELLER_NAME=Greene Leadership System LLC` in the deliberately selected Vercel environments.
4. Create four commercial Stripe Payment Links under the approved seller:
   - Christian Reflection Starter Pack — $19
   - Athlete Reflection Starter Pack — $19
   - Hero Within Coach Toolkit — $99
   - Congregation Starter Toolkit — $149
5. Add the four links as `ZGIRL_CHECKOUT_LINKS_JSON`.
6. Configure one server-side lead-delivery method:
   - Resend: `RESEND_API_KEY`, `ZGIRL_LEAD_EMAIL_TO`, `ZGIRL_LEAD_EMAIL_FROM`
   - or webhook: `ZGIRL_LEAD_WEBHOOK_URL`
7. Redeploy after the deliberately approved configuration changes.
8. Verify `/api/commerce/status` reports the intended seller, 4 of 4 checkout links, configured lead delivery, and `readyForPaidLaunch:true`.
9. Complete one controlled low-value test purchase and one test inquiry.
10. Verify merchant receipt, bank settlement path, customer-facing receipt/descriptor, product-delivery path, lead delivery, and refund/support routing.
11. Record the test evidence and explicitly authorize broad paid launch.

## Canonical activation sequence

**LLC formed → EIN confirmed → bank established → merchant configured → seller/payment environment configured → test purchase/inquiry passed → paid launch explicitly authorized.**

Product development, institutional inquiry, licensing preparation, reviewer/credential operations, and other non-payment work do not need to pause while the remaining merchant/payment gate is completed.

## Release-train boundary

Z-Girl v3.10 production-readiness work is **not** commerce activation. A successful software release does not set merchant credentials, create payment links, or authorize paid promotion. The v3.10 release boundary suite is expected to keep `readyForPaidLaunch:false` unless a separate commercial activation decision deliberately changes that posture.

## Governance boundary

Do not use a donation-oriented checkout link for these products. Product purchases and licenses are commercial transactions and must not be presented as tax-deductible charitable contributions.

Greene Leadership System LLC becoming the commercial seller does not itself transfer ownership of The 4 Lessons / Z-Girl intellectual property. Ownership, commercial-use authority, and nonprofit mission use remain governed through separate chain-of-title, license, permission, or other written records.
