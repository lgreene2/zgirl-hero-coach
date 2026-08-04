# Z-Girl v2.2.3 — Reviewer Activation Automation

Z-Girl v2.2.3 converts the final reviewer-gateway setup from a multi-dashboard manual process into a controlled confidential activation workflow.

## Added

- `npm run review:activation-bundle`
  - validates the confidential activation record;
  - verifies that public and private bearer tokens match;
  - requires the fixed release candidate and all four language credentials;
  - normalizes the private gateway URL;
  - creates separate private and public Vercel environment files;
  - creates a reviewer credential CSV;
  - includes a Windows PowerShell environment-application script;
  - includes a standalone end-to-end reviewer activation verifier;
  - writes private files with owner-only permissions where supported;
  - never displays secrets in terminal output.

- `npm run review:verify-activation`
  - tests all four reviewer logins;
  - tests all 56 public reviewer audio requests;
  - confirms authenticated byte-range audio responses;
  - confirms private/no-store behavior;
  - confirms invalid-code rejection;
  - confirms unauthenticated audio blocking;
  - confirms language-scoped session isolation;
  - confirms protected review-page access;
  - confirms logout cookie clearing.

## Private gateway deployment

The paired private repository now provides a one-click Vercel import entry point and a dedicated `DEPLOY_TO_VERCEL.md` runbook.

## Security boundary

- Reviewer codes and deployment secrets remain outside Git.
- The generated activation bundle is confidential.
- The private bearer token is never sent to a reviewer browser.
- Review routes and review audio remain excluded from service-worker caches.
- The reviewer workspace remains fail-closed until all protected values are configured.

## Release boundary

Activation authorizes controlled native-language review only. It does not approve or publicly release any candidate recording.