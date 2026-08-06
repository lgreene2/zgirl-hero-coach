# Z-Girl Revenue Activation Status

Last updated: 2026-08-06

## Live now

- Public product storefront
- Founding Partner conversion page
- Product reservation and invoice-request fallback
- Faith-profile inquiry
- Athlete-team pilot inquiry
- Secret-safe activation status endpoint
- Commercial-purchase / non-donation notice
- Checkout gate requiring an explicit commercial seller
- Four warm-contact outreach drafts prepared in Gmail

## Current activation state

The public endpoint `/api/commerce/status` reports only configuration booleans and never exposes credentials.

At the time of this update:

- Seller configured: no
- Paid checkout links configured: 0 of 4
- Server-side lead delivery configured: no
- Reservation and prepared-email fallback: active
- Paid launch: intentionally disabled

## Required external actions

1. Confirm the legal commercial seller / merchant of record.
2. Add `ZGIRL_SELLER_NAME` in Vercel Preview and Production.
3. Create four commercial Stripe Payment Links under the approved seller:
   - Christian Reflection Starter Pack — $19
   - Athlete Reflection Starter Pack — $19
   - Hero Within Coach Toolkit — $99
   - Congregation Starter Toolkit — $149
4. Add the four links as `ZGIRL_CHECKOUT_LINKS_JSON`.
5. Configure one lead delivery method:
   - Resend: `RESEND_API_KEY`, `ZGIRL_LEAD_EMAIL_TO`, `ZGIRL_LEAD_EMAIL_FROM`
   - or webhook: `ZGIRL_LEAD_WEBHOOK_URL`
6. Redeploy.
7. Verify `/api/commerce/status` returns `readyForPaidLaunch: true`.
8. Complete one low-value test purchase and one test inquiry.

## Governance boundary

Do not use a donation-oriented checkout link for these products. Product purchases and licenses are commercial transactions and must not be presented as tax-deductible charitable contributions.
