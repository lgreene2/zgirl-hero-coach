# Z-Girl Revenue Activation Status

Last updated: 2026-08-13

## Live now

- Public product storefront
- Founding Partner conversion page
- Product reservation and invoice-request fallback
- Faith-profile inquiry
- Athlete-team pilot inquiry
- Secret-safe activation status endpoint
- Commercial-purchase / non-donation notice
- Checkout gate requiring an explicit commercial seller
- Institutional pilot, licensing, credential, agreement, renewal, partner-pipeline, and executive-reporting layers through the current production release

## Formation contingency — resolved

The prior commerce gate required an approved commercial legal seller before paid checkout could be activated.

That legal-entity decision is now resolved:

- Commercial seller / operating entity: **Greene Leadership System LLC**
- Georgia formation: **complete**
- Effective date: **2026-08-06**
- Formation gate: **CLEARED**

This does **not** mean paid checkout is automatically ready. The remaining financial and technical activation requirements below still govern.

## Current activation state

The public endpoint `/api/commerce/status` reports only configuration booleans and never exposes credentials.

Current governed state:

- Legal commercial seller selected: **yes — Greene Leadership System LLC**
- `ZGIRL_SELLER_NAME` environment configuration: **not yet verified**
- EIN: **not yet confirmed in the activation record**
- Business bank / merchant setup: **pending**
- Paid checkout links: **not yet verified/configured for launch**
- Server-side lead delivery: **not yet verified for launch**
- Reservation and prepared-email fallback: **active**
- Paid launch: **intentionally disabled until the full commerce gate passes**

## Remaining external actions

1. Obtain and archive the Greene Leadership System LLC EIN.
2. Open / confirm the GLS LLC business banking relationship.
3. Configure the commercial merchant / Stripe account under the approved seller.
4. Add `ZGIRL_SELLER_NAME=Greene Leadership System LLC` in Vercel Preview and Production.
5. Create four commercial Stripe Payment Links under the approved seller:
   - Christian Reflection Starter Pack — $19
   - Athlete Reflection Starter Pack — $19
   - Hero Within Coach Toolkit — $99
   - Congregation Starter Toolkit — $149
6. Add the four links as `ZGIRL_CHECKOUT_LINKS_JSON`.
7. Configure one lead delivery method:
   - Resend: `RESEND_API_KEY`, `ZGIRL_LEAD_EMAIL_TO`, `ZGIRL_LEAD_EMAIL_FROM`
   - or webhook: `ZGIRL_LEAD_WEBHOOK_URL`
8. Redeploy after configuration changes.
9. Verify `/api/commerce/status` returns `readyForPaidLaunch: true`.
10. Complete one low-value test purchase and one test inquiry.
11. Record the test result before authorizing broad paid promotion.

## Canonical activation sequence

**LLC formed → EIN confirmed → bank activated → merchant configured → seller/payment environment configured → test purchase passed → paid launch authorized.**

Product development, institutional inquiry, licensing preparation, reviewer/credential operations, and other non-payment work do not need to pause while the financial gate is being completed.

## Governance boundary

Do not use a donation-oriented checkout link for these products. Product purchases and licenses are commercial transactions and must not be presented as tax-deductible charitable contributions.

Greene Leadership System LLC becoming the commercial seller does not itself transfer ownership of The 4 Lessons / Z-Girl intellectual property. Ownership, commercial-use authority, and nonprofit mission use remain governed through separate chain-of-title, license, permission, or other written records.
