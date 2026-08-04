# Z-Girl Open v2.2.2 — Reviewer Asset Gateway

## Release purpose

This release completes the code-side security boundary between the public Z-Girl reviewer workspace and the confidential native-language studio candidates. Reviewers continue to enter through `zgirlinitiative.org/review`, but candidate audio is delivered only through a separate private, bearer-protected Vercel gateway.

## Public application changes

- Sets the application package and visible version to `2.2.2`.
- Requires both a configured private gateway URL and bearer token before candidate audio can be requested.
- Keeps the gateway token server-only and never exposes it in browser markup or requests.
- Adds a 15-second upstream timeout and rejects redirects.
- Rejects non-audio upstream responses.
- Preserves authorized byte ranges for browser playback and release verification.
- Sends private/no-store, no-index, no-referrer, and no-sniff headers on reviewer audio responses.
- Generates the shared gateway token together with the four language-scoped reviewer credentials in one confidential owner-only file.
- Bumps the PWA cache to `zgirl-cache-v2-2-2` while continuing to exclude all reviewer routes from service-worker storage.

## Private gateway dependency

The paired private release in `lgreene2/zgirl-native-language-review-portal`:

- accepts only the fixed release candidate and approved locale/day/mix combinations;
- requires a constant-time-checked bearer token;
- supports authenticated `GET`, `HEAD`, and byte-range requests;
- returns `404` for direct `/language-review-assets/*` requests;
- remains unavailable when its secret is missing.

## Activation gate

The public reviewer portal must remain fail-closed until all of the following are complete:

- the private repository is deployed as a separate Vercel project;
- the same gateway bearer token is stored in both Vercel projects;
- the public reviewer hashes and session secret are configured;
- all 56 candidate tracks pass the private gateway verifier;
- all 56 candidate tracks pass the public verifier;
- invalid-code, expired-session, and cross-language denial tests pass.

## Release boundary

This release does not approve or publish the translated studio recordings. A completed reviewer export is evidence for product-owner review, not automatic authorization for promotion. Each language remains a confidential candidate until its corrections, signed approval, and separate promotion decision are complete.
