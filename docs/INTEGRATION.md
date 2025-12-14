# Integration Guide (Next.js App Router)

## 1) Copy files
Copy the folders in this bundle into your project root:
- /app
- /components
- /lib
- /docs (optional)

If you already have these folders, merge carefully (don’t overwrite unrelated files).

## 2) Install Stripe
```bash
npm i stripe
```

## 3) Environment variables
Add these to your `.env.local`:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ZGIRL_PLUS=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
# Optional:
ZGIRL_DEV_PLUS=0
NEXT_PUBLIC_ANALYTICS_REMOTE=0
```

## 4) Stripe webhooks
In Stripe → Developers → Webhooks, point to:
`https://your-domain.com/api/stripe/webhook`

Listen for:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted

## 5) Notes about the starter “device cookie” flow
This bundle activates Plus on the device that completes checkout (cookie `zgirl_plus=1`).
For production, you typically connect billing to user accounts + a database.

## 6) Where the paywall triggers
- Save Hero Moment beyond FREE limit (default 3)
- Generate Hero Video Script beyond FREE limit (default 1)
- Replay last reply (Plus only)
- Weekly Hero Path section (Plus only)

## 7) Privacy-safe analytics
Client side only by default. Turn on remote logging by setting:
`NEXT_PUBLIC_ANALYTICS_REMOTE=1`
(Remote endpoint is content-free and logs to server console. Replace with your analytics platform if desired.)
