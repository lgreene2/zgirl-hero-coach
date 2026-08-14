# Z-Girl v3.10 — Release Train Consolidation & Production Readiness

## Release purpose

v3.10 is the single production-readiness candidate that consolidates the previously stacked v3.4–v3.9 institutional releases with the current production `main` lineage.

This release intentionally prioritizes **shipping the governed institutional operating system already built** rather than adding another customer-facing feature layer.

## Consolidated capability set

v3.10 contains the v3.4–v3.9 application capabilities as one deployable lineage:

- v3.4 — Executive Briefing & Renewal Intelligence Automation
- v3.5 — Institutional Identity, RBAC & SSO Foundation
- v3.6 — Institutional Tenant Dashboards & Access Governance
- v3.7 — Access Review Evidence & Audit Pack
- v3.8 — Governance Calendar, Evidence Retention & Annual Review
- v3.9 — Board Governance & Evidence Export

Earlier production capabilities remain included: credential operations, credential renewal, institutional licensing, agreement/workflow gates, partner pipeline, portfolio command center, participant reflection profiles, reviewer activation, and the commerce gate.

## Production reconciliation

The original stacked feature line descended from the v3.3 production head before PR #22. Current production later added PR #22, which updated only the revenue-activation status document.

v3.10 therefore uses a two-parent reconciliation commit:

- verified v3.9 feature lineage
- current production `main`

The current production activation-status document was deliberately preserved and then updated in v3.10 to reflect the completed GLS business milestones.

## Business activation status

Commercial operating prerequisites completed:

- Greene Leadership System LLC formation complete
- EIN assigned/confirmed
- business banking established

Software/payment launch prerequisites still gated:

- merchant / Stripe launch configuration not yet verified
- `ZGIRL_SELLER_NAME` application environment not configured/verified
- Z-Girl checkout links: 0 of 4
- server-side lead delivery: not configured
- controlled test purchase: not completed
- paid launch authorization: not granted

v3.10 release approval is **not** paid-launch approval.

## New v3.10 release-engineering assets

- machine-readable release train manifest
- release-train static verifier
- secret-safe `/api/release/status`
- custom-domain production boundary verifier
- GitHub Production Cutover Verify workflow
- read-only Supabase readiness verification pack
- production cutover runbook
- cross-version regression matrix
- first named System Owner bootstrap procedure
- application-first rollback plan

## Database baseline

At the v3.10 readiness checkpoint:

- Z-Girl public tables: 43
- RLS-enabled Z-Girl public tables: 43
- direct `anon` / `authenticated` Z-Girl table grants: 0
- institutions: 0
- licenses: 0
- opportunities: 0
- named operators: 0
- role assignments: 0
- credentials: 0
- access reviews: 0
- governance reports: 0
- attestations: 0
- audit packages: 0
- calendar items: 0
- annual cycles: 0
- retention records: 0
- executive briefings/deliveries: 0
- board packs: 0

The zero operational-data baseline makes this a particularly low-risk application cutover. Future real records must never be deleted merely to reproduce these original zero counts.

## Scheduler baseline

Active jobs remain:

1. tenant access review — 09:47 UTC
2. institutional workflow — 10:07 UTC
3. credential renewal — 10:17 UTC
4. institutional license — 10:27 UTC
5. executive briefing — 11:37 UTC
6. governance calendar — 12:07 UTC

v3.9 board reporting remains human-generated; v3.10 adds no new authority-changing scheduler.

## Security/privacy boundary

v3.10 does not change the participant privacy model.

Institutional/administrative layers remain outside:

- participant private-reflection text
- youth/student/athlete case records
- diagnoses and treatment data
- therapy/counseling notes
- safeguarding narratives
- clinical records
- clergy/spiritual-direction records
- sports-medicine records
- participant behavioral scoring
- detailed credential assessment/practicum evidence in executive/board reporting

High-power application routes remain session/RBAC-protected server-side.

## Authority boundary

Release consolidation cannot itself:

- execute an agreement
- satisfy an approval gate
- issue or renew a credential
- activate, renew, or expand a license
- release implementation
- attest governance evidence
- change named operator authority without the applicable identity controls
- mark payment received
- recognize pipeline value as revenue
- authorize paid launch

## Commerce boundary

The software continues to require an explicit commercial seller before checkout URLs can resolve and accepts HTTPS checkout URLs only.

Four digital offers remain inside the application checkout gate.

Unless a separate commercial activation decision is made, the production boundary suite requires `readyForPaidLaunch:false`.

Commercial product/license payments remain separate from charitable donations.

## Known bounded technical debt

`package-lock.json` predates the v2.9 QR dependency addition and still carries legacy root-version metadata. The repository's verified build path therefore uses:

`npm install --no-audit --no-fund`

rather than `npm ci`.

The v3.10 verifier makes this debt explicit and will fail if the build silently switches back to `npm ci` before the lockfile is genuinely regenerated. After the release train is stable, regenerate the lockfile through a normal networked npm operation, verify the result, remove the debt marker, and restore `npm ci`.

This lockfile debt is not a reason to weaken dependency or security checks.

## Required release gates

v3.10 is not production-ready until all of these pass on the consolidated lineage:

1. current `main` reconciled
2. release-train integrity check
3. exact-head GitHub production build
4. exact-head Reviewer Activation CI
5. exact-head Vercel Preview READY
6. Preview route/boundary checks
7. single merge to `main`
8. production deployment READY
9. custom-domain production boundary suite
10. database RLS/grant/migration/scheduler verification
11. production runtime error/fatal-log review

## Superseded PR policy

After successful v3.10 production verification, the following open stacked PRs should be commented as superseded and closed **without merge**:

- #20
- #21
- #23
- #25
- #26
- #28

Until v3.10 is live and verified, those PRs remain open as release-history/reference branches.

## Post-cutover operator activation

After v3.10 is production-stable, establish the first named global System Owner using the documented break-glass bootstrap procedure. Routine administration should then move to named identity while the break-glass path remains recovery-only.

## Rollback

The default rollback is application-first to the last verified pre-v3.10 Vercel production deployment. Because the v3.4–v3.9 schema is already additive and present in managed cloud, an ordinary application rollback must not destructively remove newer tables, RLS, audit history, evidence, or migration records.

## Release decision

The PR head itself is the authoritative exact candidate SHA. A successful build on an older commit does not satisfy this release record.

The release may be called **live** only after production deployment and custom-domain verification are complete.
