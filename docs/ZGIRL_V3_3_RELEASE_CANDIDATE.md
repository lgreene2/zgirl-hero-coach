# Z-Girl v3.3 Release Candidate

## Release name
Institutional Portfolio & Executive Reporting Command Center

## Required product routes
- Public: `/institutions/portfolio-command-center`
- Restricted: `/institutions/ops/portfolio`
- Restricted API: `/api/institutions/ops/portfolio/dashboard`
- Restricted mutation API: `/api/institutions/ops/portfolio/action`

## Required data objects
- `zgirl_portfolio_reviews`
- `zgirl_portfolio_snapshots`
- `zgirl_portfolio_dashboard`
- `zgirl_portfolio_save_review`
- `zgirl_portfolio_create_snapshot`

## Release gates
- package version 3.3.0;
- reviewer activation self-test passes without displaying secrets;
- Next.js build and TypeScript pass;
- all routes generate successfully;
- public product page returns 200 and displays v3.3 positioning;
- restricted page contains noindex/nofollow;
- unauthenticated portfolio dashboard API returns 401;
- existing v3.2 pipeline, v3.1 workflow, v3.0 license, and credential API boundaries remain unchanged;
- commerce stays intentionally gated unless separately activated;
- portfolio tables start clean with no synthetic institution ratings or snapshots;
- RLS enabled and direct anon/authenticated table access revoked;
- existing governance cron order remains unchanged;
- production runtime logs show no new fatal/error events.

## Data-boundary gate
No participant reflection content, youth/student/athlete case data, diagnoses, counseling notes, safeguarding narratives, clinical data, clergy records, or sports-medicine data may be introduced into v3.3.

## Authority gate
Portfolio ratings and snapshots are reporting metadata only. They cannot execute an agreement, issue a credential, activate a license, release delivery, or mark a commercial payment complete.
