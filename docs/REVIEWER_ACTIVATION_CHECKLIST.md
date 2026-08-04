# Z-Girl v2.2.2 Reviewer Activation Checklist

## Release control

- [ ] Private asset-gateway pull request is merged to `main`.
- [ ] Public reviewer-activation pull request is merged to `main`.
- [ ] Public production deployment is `READY` and displays v2.2.2.
- [ ] Private gateway is deployed as a separate Vercel project.
- [ ] No candidate files were copied into the public Z-Girl repository.

## Confidential credential generation

- [ ] Run `npm run review:credentials -- --out <private absolute path>`.
- [ ] Confirm the output file was created with owner-only permissions.
- [ ] Confirm four unique reviewer codes are present.
- [ ] Confirm one public session secret is present.
- [ ] Confirm one shared gateway bearer token is present in both project sections.
- [ ] Replace the gateway-base-URL placeholder with the actual private gateway route.
- [ ] Keep the generated file outside Git, shared cloud folders, and public messages.

## Private Vercel project

- [ ] Set `ZGIRL_ASSET_GATEWAY_BEARER_TOKEN` as a sensitive Preview and Production variable.
- [ ] Redeploy after setting the variable.
- [ ] An unauthenticated gateway request returns `401`.
- [ ] A request with a wrong token returns `401`.
- [ ] A request with the correct token and `Range: bytes=0-0` returns `206` and `audio/mpeg`.
- [ ] A direct `/language-review-assets/...` request returns `404`.
- [ ] `npm run gateway:verify` passes all 56 candidate tracks and the direct-path gate.

## Public Z-Girl Vercel project

- [ ] Set `ZGIRL_REVIEW_ACCESS_HASHES_JSON` as sensitive.
- [ ] Set `ZGIRL_REVIEW_SESSION_SECRET` as sensitive.
- [ ] Set `ZGIRL_REVIEW_ASSET_BASE_URL` to the private `/api/review-assets` route.
- [ ] Set `ZGIRL_REVIEW_ASSET_BEARER_TOKEN` to the exact private gateway token.
- [ ] Redeploy after setting all four values.
- [ ] `npm run review:verify-assets` passes all 56 candidate tracks.

## Reviewer authorization tests

- [ ] The `/review` page redirects an unauthenticated user to `/review/login`.
- [ ] The login button is enabled only after the assigned language is selected and the deployment is configured.
- [ ] A wrong code returns a generic invalid-code response.
- [ ] A valid Spanish code cannot open French, Portuguese, or German audio.
- [ ] Repeat the cross-language denial test for all four locale assignments.
- [ ] A valid session can stream both voice and calm versions for all seven assigned days.
- [ ] An expired or altered session token is rejected.
- [ ] Review pages and audio responses contain private/no-store and no-index protections.
- [ ] Reviewer pages and audio are absent from service-worker caches.

## Reviewer assignment

- [ ] One qualified reviewer is approved for each locale.
- [ ] Reviewer name, email, role, dialect/region, and target date are recorded privately.
- [ ] The invitation is sent without the access code.
- [ ] The assigned code is sent in a separate one-to-one message.
- [ ] The reviewer confirms receipt and confidentiality.
- [ ] No reviewer receives another locale's code or candidate files.

## Completion and promotion

- [ ] All 49 criteria per language are marked Pass or Changes Needed.
- [ ] Required corrections are documented and resolved.
- [ ] Reviewer identity, confirmations, signature, and date are complete.
- [ ] The signed approval JSON and issue log are exported.
- [ ] The product owner validates the candidate ID and review record.
- [ ] Promotion is performed separately for each approved language.
- [ ] Public release notes clearly distinguish approved studio audio from device-voice fallback.
- [ ] Reviewer credentials are rotated or retired after the review cycle.

The portal remains fail-closed until every applicable pre-invitation item above is complete.
