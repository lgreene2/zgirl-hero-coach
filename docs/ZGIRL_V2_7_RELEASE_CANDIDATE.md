# Z-Girl v2.7 Release Candidate

Release candidate: Train-the-Trainer & Facilitator Authorization System

## Product objective

Turn the v2.6 institutional implementation operating system into a controlled people-and-quality scaling system that can prepare, assess, authorize, renew, remediate, suspend, revoke, and—where licensed—develop internal institutional trainers.

## Public product layer

### New route

- `/institutions/train-the-trainer`

The page presents:
- Level 0 Orientation Complete;
- Level 1 Authorized Facilitator;
- Level 2 Authorized Lead Facilitator;
- Level 3 Institutional Trainer Authorization;
- evidence-before-title assessment architecture;
- credential lifecycle;
- privacy/governance boundaries;
- institutional expansion path.

### Updated route

- `/institutions/implementation-kit` now links directly to facilitator authorization / Train-the-Trainer and positions the institutional ladder as Pilot → License → Authorize → Scale.

## Credential asset stack

### Master system
- `docs/ZGIRL_TRAIN_THE_TRAINER_SYSTEM.md`

### Competency & training
- `docs/ZGIRL_FACILITATOR_COMPETENCY_FRAMEWORK.md`
- `docs/ZGIRL_FACILITATOR_TRAINING_CURRICULUM.md`

### Assessment & practicum
- `docs/ZGIRL_FACILITATOR_KNOWLEDGE_CHECKS.md`
- `docs/ZGIRL_PRACTICUM_OBSERVATION_RUBRIC.md`

### Authorization governance
- `docs/ZGIRL_FACILITATOR_AUTHORIZATION_POLICY.md`
- `docs/ZGIRL_FACILITATOR_AGREEMENT_AND_AUTHORIZATION_RECORD.md`
- `docs/ZGIRL_REMEDIATION_SUSPENSION_REVOCATION_POLICY.md`
- `docs/ZGIRL_RENEWAL_RECREDENTIALING_STANDARD.md`

### Scale & licensing
- `docs/ZGIRL_INSTITUTIONAL_TRAINER_LICENSE_FRAMEWORK.md`
- `docs/ZGIRL_CREDENTIAL_REGISTRY_VERSION_CONTROL.md`
- `docs/ZGIRL_TRAIN_THE_TRAINER_PRODUCT_SHEET.md`

## Initial operating standards

Knowledge assessment:
- 25 items;
- at least 22/25 correct;
- 100% correct on designated critical privacy/safety items.

Initial practicum:
- 16 domains;
- at least 40/48 total;
- all critical domains at least Competent (2/3);
- no critical-fail behavior.

Default credential term:
- 12 months.

Credential statuses:
- Pending
- Active
- Active — Conditions
- Expiring
- Lapsed
- Suspended
- Revoked
- Retired

## Credential boundary

v2.7 uses **Z-Girl program authorization** language.

Approved titles:
- Z-Girl Authorized Facilitator
- Z-Girl Authorized Lead Facilitator
- Z-Girl Institutional Trainer — Authorized

v2.7 does **not** claim:
- professional licensure;
- academic accreditation;
- government accreditation/certification;
- clinical qualification;
- third-party professional certification.

Training completion alone does not create authorization.

## Governance requirements preserved

- private participant reflection text is not routine institutional reporting data;
- no institutional private-reflection dashboard;
- no forced disclosure;
- pause / skip / stop / trusted-person pathways preserved;
- no diagnosis, treatment, clinical scoring, medical-care, crisis-service, clergy/spiritual-direction, or sports-medicine claims;
- safeguarding/emergency/mandated-reporting duties remain with the institution and applicable professionals;
- accessibility support does not require diagnosis disclosure to Z-Girl as a standard condition;
- specialized profiles remain approved and versioned;
- institutional trainer rights require both individual authorization and institutional trainer license;
- commercial product/license/training/authorization payments remain separate from charitable donations.

## Commercial activation boundary

v2.7 does not activate paid credential checkout.

Training, authorization, renewal, and institutional trainer-license pricing should not be publicly activated until:
- merchant-of-record requirements are satisfied;
- prices/refunds/support terms are approved;
- credential administration workflow is operational;
- customer and institutional terms are approved;
- payment routes remain clearly separate from donations.

## Package version

- `package.json`: `2.7.0`

Note: the repository's existing `package-lock.json` root package metadata remains older than the app package version. Prior Next.js/Vercel builds have completed successfully with this metadata mismatch; it should be normalized in a future dependency-maintenance pass rather than manually rewriting the lockfile without npm regeneration.

## Release verification checklist

- [ ] Reviewer activation self-test passes without displaying secrets.
- [ ] Next.js build compiles.
- [ ] TypeScript passes.
- [ ] `/institutions/train-the-trainer` appears in route manifest.
- [ ] `/institutions/train-the-trainer` returns HTTP 200 in Preview.
- [ ] page displays v2.7.0.
- [ ] `/institutions/implementation-kit` returns HTTP 200 and includes facilitator-authorization link.
- [ ] existing `/institutions` route remains generated.
- [ ] commerce activation remains unchanged and gated.
- [ ] no private-reflection collection feature introduced.
- [ ] no unsupported professional certification/licensure claim introduced.
- [ ] PR head receives successful Vercel status before merge.

## Recommended post-release build

Build the **Z-Girl Credential Operations Portal** as a secure administrative layer with:
- candidate intake;
- training enrollment/status;
- assessment result entry/import;
- practicum observation forms;
- authorization decision workflow;
- credential ID issuance;
- limited public verification;
- 60/30/7-day renewal reminders;
- version update assignments;
- suspension/revocation controls;
- role-based access and audit logs;
- no participant private-reflection storage.
