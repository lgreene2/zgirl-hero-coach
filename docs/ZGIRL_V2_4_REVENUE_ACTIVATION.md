# Z-Girl v2.4 Revenue and Lead Engine Activation

## What is already built

- Public storefront at `/store`
- Founding-partner page at `/partners`
- Product catalog and founding launch pricing
- Checkout redirect API at `/api/checkout/[offer]`
- Server-side lead API at `/api/leads`
- Lead forms on the store, founding-partner, faith-profile, and athlete-pilot pages
- Honeypot spam protection, consent requirement, basic IP rate limiting, input limits, and no youth/private-data prompts
- Mailto fallback when the secure delivery service is not configured

## Activate checkout links

Create Stripe Payment Links for the four digital products, then add one Vercel environment variable to Preview and Production:

`ZGIRL_CHECKOUT_LINKS_JSON`

Use valid JSON with HTTPS links:

```json
{
  "christian-reflection-starter-pack": "https://buy.stripe.com/REPLACE_ME",
  "athlete-reflection-starter-pack": "https://buy.stripe.com/REPLACE_ME",
  "hero-within-coach-toolkit": "https://buy.stripe.com/REPLACE_ME",
  "congregation-starter-toolkit": "https://buy.stripe.com/REPLACE_ME"
}
```

Do not add extra quotation marks around the complete JSON value in Vercel. Redeploy after saving the variable.

Institutional offers intentionally route to the founding-partner inquiry page instead of direct checkout:

- `congregation-annual-license`
- `athlete-team-pilot`

## Activate lead delivery with Resend

Add these Vercel environment variables to Preview and Production:

- `RESEND_API_KEY` — secret API key
- `ZGIRL_LEAD_EMAIL_TO` — destination inbox, such as `info@zgirlinitiative.org`
- `ZGIRL_LEAD_EMAIL_FROM` — verified sender, such as `Z-Girl Leads <leads@zgirlinitiative.org>`

After the domain is verified in Resend, redeploy the project. The lead form will send a formatted email and set the submitter’s address as the reply-to address.

## Optional webhook delivery

The lead API can also send the same structured JSON to a secure automation or CRM webhook:

- `ZGIRL_LEAD_WEBHOOK_URL`
- `ZGIRL_LEAD_WEBHOOK_SECRET` — optional bearer token

The webhook URL must use HTTPS. Resend and webhook delivery may be used together for redundancy.

## Lead fields

- Lead ID
- Lead type
- Offer
- Name
- Email
- Organization
- Role
- Audience or group
- Desired timeline
- Message
- Source page
- Submission timestamp

The API does not intentionally log the lead’s email, name, or message to Vercel logs. Runtime logs include only the lead ID, type, offer, and delivery status.

## Production verification

1. Submit a test product inquiry.
2. Confirm the success state appears.
3. Confirm the email reaches the destination inbox.
4. Reply to the lead and verify the reply-to address.
5. Test each of the four checkout offers.
6. Confirm each opens the correct Stripe Payment Link.
7. Test an institutional offer and confirm it opens `/partners` with the offer preselected.
8. Confirm a bot-filled `website` field is rejected.
9. Confirm six rapid submissions from one IP trigger a 429 response.
10. Check Vercel runtime logs for errors without exposing personal lead content.

## Recommended Stripe product names

- Z-Girl Christian Reflection Starter Pack — $19 one time
- Hero Within Athlete Reflection Starter Pack — $19 one time
- Hero Within Coach Toolkit — $99 one time
- Z-Girl Congregation Starter Toolkit — $149 one time

Use Stripe’s automatic receipt and tax settings appropriate to the operating entity. Confirm which PUF or for-profit entity is the merchant of record before activating public payment links.
