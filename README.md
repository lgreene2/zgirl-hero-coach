# Z-Girl: The Hero Within Reflection System

Z-Girl is currently released as platform package v3.13.0. The public reflection experience remains Z-Girl Open v2.2.2: a character-powered, safety-first experience for youth, adults, families, and guided groups that is private by default and requires no account. Institutional operations are on v3.13.0 and add governed GLS qualification-to-pilot handoff without changing the public reflection privacy model. The native-language studio-review workflow remains protected by unique language-scoped reviewer credentials and a separate server-only media gateway.

## Current version model

- **Platform package:** v3.13.0
- **Public reflection baseline:** Z-Girl Open v2.2.2
- **Institutional operations:** v3.13.0
- **Commercial source of truth:** Greene Leadership System
- **Implementation source of truth:** Z-Girl
- **Live activation:** always requires final human readiness and release approval

The v2.x and v3.x labels describe different surfaces of one product; v2.x is not a pending development branch and should not be resumed as a separate rebuild.

## Public experiences

- `/` — v2.2 public gateway
- `/reflect` — private, no-login six-step reflection
- `/journey` — interactive 7-Day Hero Within Journey in English, Spanish, French, Brazilian Portuguese, and German, with matching device voices and exact downloadable transcripts
- `/coach` — optional AI-guided reflection with youth, adult, and supporter editions
- `/privacy` — plain-language data guide
- `/accessibility` — accessibility commitments and known limitations
- `/safety` — safety boundaries and crisis guidance
- `/for-adults` — parent, caregiver, educator, and mentor guidance
- `/pilot` — archived v1.1 pilot materials and v2 institutional pathway
- `/edu` — current Z-Girl EDU institutional overview and downloadable package summary
- `/review` — protected native-language review workspace; fail-closed until server-side activation is complete

## v2.2.2 protected reviewer architecture

Each reviewer receives one unique code assigned to exactly one language. The public server stores only a SHA-256 hash of the code, signs an eight-hour locale-specific session, and rejects audio requests for every locale except the one assigned to that session.

Candidate recordings remain in the separate private `zgirl-native-language-review-portal` project. The browser never receives the private gateway bearer token. The public Z-Girl server requests media through the protected gateway and streams it to the authorized reviewer with no-store and no-index controls.

Direct candidate paths in the private project return `404`. The private gateway accepts only the fixed candidate identifier, four approved review locales, seven day numbers, and the `voice` or `calm` mix.

## Activation procedure

1. Import the private `lgreene2/zgirl-native-language-review-portal` repository into a separate Vercel project.
2. Deploy its `main` branch after the v2.2.2 asset-gateway pull request is merged.
3. Generate the confidential credential and deployment record outside both repositories:

```bash
npm run review:credentials -- --out /absolute/private/path/private-review-credentials.json
```

4. In the private gateway project, set the generated sensitive variable:

```text
ZGIRL_ASSET_GATEWAY_BEARER_TOKEN
```

5. In the public `zgirl-hero-coach` project, set the generated sensitive variables:

```text
ZGIRL_REVIEW_ACCESS_HASHES_JSON
ZGIRL_REVIEW_SESSION_SECRET
ZGIRL_REVIEW_ASSET_BASE_URL=https://<private-gateway-host>/api/review-assets
ZGIRL_REVIEW_ASSET_BEARER_TOKEN
```

6. Verify the private gateway, including all 56 authenticated byte-range responses and the direct-path `404` gate:

```bash
ZGIRL_ASSET_GATEWAY_BASE_URL=https://<private-gateway-host>/api/review-assets \
ZGIRL_ASSET_GATEWAY_BEARER_TOKEN=<generated-token> \
npm run gateway:verify
```

7. Verify all 56 objects through the public project configuration:

```bash
npm run review:verify-assets
```

8. Confirm invalid codes fail, expired sessions redirect to login, and a valid reviewer session cannot request another locale.
9. Send the invitation and plaintext access code through separate messages. Never place plaintext reviewer codes in Vercel, Git, issue trackers, shared worksheets, or public messages.
10. Keep the portal fail-closed until all checks pass.

See:

- `RELEASE_NOTES_v2.2.2_REVIEWER_ASSET_GATEWAY.md`
- `docs/REVIEWER_INVITATION_TEMPLATE.md`
- `docs/REVIEWER_CREDENTIAL_HANDOFF_TEMPLATE.md`
- `docs/REVIEWER_ACTIVATION_CHECKLIST.md`

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add a valid `GEMINI_API_KEY` to enable AI Coach replies.
3. Add reviewer variables only when testing the protected workflow.
4. Run `npm install`.
5. Run `npm run dev`.

Private Reflection and the 7-Day Journey work without an AI key. The production build also succeeds without a key; AI Coach returns a clear unavailable response while the deterministic crisis response remains active.

## Quality gates

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Release

Current platform package version: `3.13.0`.

Public reflection baseline: `2.2.2`.

Institutional operations release: `3.13.0`.

The v2.0 release replaces seasonal framing, introduces the reusable Hero Within Method, clarifies AI data flow, prevents client-supplied safety prompt overrides, updates the PWA cache, and preserves older pilot files only as labeled archive materials.

The v2.0.1 Natural Voice Patch waits for the browser voice catalog before greeting, prefers a natural feminine voice in the selected language, remembers a different device voice for each language, adds a voice preview, and moves speed, pitch, and device-specific choices under Advanced voice options.

The v2.0.2 Sound Cue Refinement removes completion, send, save, and launch chimes. An optional low-volume cue can play only when spoken output begins; it is separate from voice output and defaults to Off, including for users migrating from v2.0.1.

The v2.1 Multilingual Journey & PWA release localizes all seven journey days into five public language tracks, uses an explicitly selected matching browser voice with no autoplay, generates visible and downloadable transcripts from the exact spoken source, registers the service worker, adds browser-specific installation guidance, supports visited-page offline fallback, and gives installed users control over updates. Translated studio audio remains outside the public build until native-language review is complete.

The v2.2 EDU & Native-Language Review release adds the public Z-Girl EDU institutional pathway, a protected exact-candidate reviewer workspace, signed approval exports, reviewer correction exports, and network-only review routes. The studio-audio candidate remains internal, and an approval export does not authorize public promotion without a separate product-owner decision.

The v2.2.1 Reviewer Activation release replaces a shared access code with four hashed, language-scoped credentials, limits each signed session to its assigned locale, validates the 56-track candidate set, and keeps the portal fail-closed until protected deployment inputs are configured.

The v2.2.2 Reviewer Asset Gateway release moves candidate delivery behind a separate server-only bearer-protected gateway, blocks predictable direct asset paths, supports authenticated byte-range playback, generates the shared gateway token with the confidential reviewer record, hardens the public audio proxy, and updates the PWA cache and visible application version.


The v3.13 GLS Qualification & Governed Activation Handoff release accepts only qualified, agreement-backed GLS opportunities, prepares one idempotent Z-Girl implementation workspace, synchronizes aggregate institutional metadata back to GLS, and never transfers participant rosters or private reflection content. Workspace preparation cannot activate a live pilot; safety, team, cohort, and final human-release gates remain authoritative.

Production verification and the cross-repository bridge repair are recorded in `docs/ZGIRL_V3_13_PRODUCTION_ACTIVATION_RECEIPT.md`.
