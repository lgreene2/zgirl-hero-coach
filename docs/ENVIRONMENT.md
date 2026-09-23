# Environment variables — Z-Girl Hero Coach

Every variable this repository reads, why it exists, and what happens when it
is missing. Derived from the code: each entry names the file that reads it.

Where to set these: **Vercel → Project `zgirl-hero-coach` → Settings →
Environment Variables**, marked sensitive. Never commit a value.
`.env.example` carries the shape of a local `.env.local`.

Everything here fails closed. The recurring pattern is that an unset variable
disables a capability — it never opens one.

## Public demo mode

| Variable | Why | Default |
| --- | --- | --- |
| `ZGIRL_PUBLIC_DEMO_MODE` | Whether this deployment is the public demo, with live-data and metered-AI routes blocked (`middleware.ts`). | **On.** Demo mode is active unless the value is exactly the string `false`. |

This is the one variable whose default is the restrictive setting rather than
the absent one. `process.env.ZGIRL_PUBLIC_DEMO_MODE !== "false"` means unset,
empty, `0`, `off` and `no` all leave the demo lock **on**. Only the literal
`false` unlocks it.

Blocked page requests redirect to `/demo-access`; blocked API requests get
`403 DEMO_ACCESS_REQUIRED` with `Cache-Control: no-store`, so a blocked
response is never cached and served to someone who should have been allowed.

## Reviewer workspace (native-language review)

| Variable | Why | Without it |
| --- | --- | --- |
| `ZGIRL_REVIEW_ACCESS_HASHES_JSON` | JSON object mapping each review locale to the **SHA-256 hash** of that locale's reviewer code (`app/review/auth.ts`). | `reviewIsConfigured()` is false for every locale and no code is accepted. |
| `ZGIRL_REVIEW_SESSION_SECRET` | HMAC key for the `zgirl-review-session-v2` cookie. | `reviewIsConfigured()` returns false before looking at anything else. No session can be issued or verified. |

Store **hashes, not plaintext reviewer codes.** A value is only accepted as a
hash when it matches `^[a-f0-9]{64}$`; anything else is dropped, so a plaintext
code pasted into this variable does not become a working credential — that
locale simply reports unconfigured. Malformed JSON is caught and treated as an
empty map, which also fails closed.

Comparison is length-checked and constant-time, and a locale is only tried when
it is configured.

## Private asset gateway

| Variable | Why | Without it |
| --- | --- | --- |
| `ZGIRL_REVIEW_ASSET_BASE_URL` | Base URL of the private gateway, ending at its route — for example `https://<private-gateway-host>/api/review-assets`. | Review assets cannot be fetched. |
| `ZGIRL_REVIEW_ASSET_BEARER_TOKEN` | Bearer token presented to that gateway. **Must exactly match `ZGIRL_ASSET_GATEWAY_BEARER_TOKEN` in the `zgirl-native-language-review-portal` project.** | The gateway rejects the request. |

Generate the token once and set it in both projects. A mismatch produces an
upstream rejection rather than a message naming the credential, so it is worth
confirming both ends after any rotation.

## Commerce

| Variable | Why | Without it |
| --- | --- | --- |
| `ZGIRL_SELLER_NAME` | Names the commercial seller (`lib/commerce.ts`). | **Paid checkout is disabled entirely.** `getCheckoutLink()` returns null before it even looks at the links. |
| `ZGIRL_CHECKOUT_LINKS_JSON` | JSON object mapping offer slug → checkout URL. | No checkout link is offered. |

The seller-name precondition is deliberate: paid checkout stays off until an
explicit commercial seller is named, so a donation-oriented payment account
cannot be used for a commercial sale by accident.

Each URL is parsed and **must be `https:`**. A non-HTTPS or unparseable link is
dropped rather than rendered, and a malformed JSON document disables all of
them rather than some.

## GLS bridge

| Variable | Why | Without it |
| --- | --- | --- |
| `ZGIRL_GLS_BRIDGE_URL` | Base URL of the Greene Leadership System pilot bridge (`lib/gls/pilot-bridge.ts`). | The bridge is unconfigured and reports so. |
| `ZGIRL_GLS_BRIDGE_SECRET` | Credential presented to it. **Must match `GLS_ZGIRL_BRIDGE_SECRET` in the `lead-with-greene` project.** | Same. |

Note the name inversion between the two projects: `ZGIRL_GLS_BRIDGE_SECRET`
here, `GLS_ZGIRL_BRIDGE_SECRET` there. Same value, mirrored names — each
project prefixes with its own identifier.

## Institutional credentials

| Variable | Why |
| --- | --- |
| `ZGIRL_CREDENTIAL_SUPABASE_URL` | Supabase project holding institutional credential records (`app/api/institutions/auth/exchange/route.ts`). Has a built-in default. |
| `ZGIRL_CREDENTIAL_SUPABASE_PUBLISHABLE_KEY` | The **publishable** key for that project. |

This path uses a publishable key on purpose — the credential-exchange route
does not need, and should not hold, a service-role key.

## Leads and mail

| Variable | Why | Without it |
| --- | --- | --- |
| `ZGIRL_LEAD_WEBHOOK_URL` | Destination for lead submissions (`app/api/leads/route.ts`). | The webhook step is skipped. |
| `ZGIRL_LEAD_WEBHOOK_SECRET` | Credential sent with it. | Sent without. |
| `RESEND_API_KEY` | Resend API key for lead email. | No lead email is sent. |
| `ZGIRL_LEAD_EMAIL_TO` / `ZGIRL_LEAD_EMAIL_FROM` | Recipient and sender. | No lead email is sent; all three are needed together. |

## AI

| Variable | Why | Without it |
| --- | --- | --- |
| `GEMINI_API_KEY` | Gemini access for voice/speech and coaching (`app/api/voice/speech/route.ts`). | The route reports `configured: false` and the capability is unavailable. It does not fall back to a canned response. |

## Platform-provided

Set by Vercel; do not configure by hand.

`VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`, `NODE_ENV`, `npm_package_version`.
