# Z-Girl v3.4 Operator Runbook

## Restricted console
`/institutions/ops/briefings`

Use the existing Credential Operations access code.

## Intelligence tab
Review:
- 180-day renewal forecast
- expansion forecast
- executive exception report
- action-owner reminders

These are derived from authoritative institutional records and do not change those records.

## Generate a manual briefing
1. Open **Briefings**.
2. Choose Board, Renewal, Executive, Weekly, Monthly, or Exception brief.
3. Enter a title and optional preparer.
4. Generate the brief.
5. Open the report packet.
6. Review before external distribution.
7. Use Print / Save PDF when needed.

## Automation settings
The scheduler runs daily at 11:37 UTC.

Defaults:
- Weekly: enabled
- Monthly: enabled
- Exception: enabled
- Recipient: not configured

When the portfolio has no real data, the process creates nothing.

## Delivery queue
A default recipient email is optional. When configured, a new briefing prepares an email draft. Use **Prepare email** to open the local mail client, then **Mark sent** only after actual delivery. The system does not send autonomously.

## Renewal workflow discipline
A renewal forecast or exception should direct the operator to the existing agreement/renewal workflow. Do not treat the briefing as renewal approval.

## Expansion discipline
An expansion signal should be reviewed in the Portfolio Command Center and Partner Pipeline. Expansion still requires the applicable governed agreement/license workflow.

## Security checks
Expected unauthenticated responses:
- `/api/institutions/ops/briefings/dashboard` → 401
- `/api/institutions/ops/briefings/packet?id=<uuid>` → 401
- existing portfolio/pipeline/workflow/license dashboards → 401

All v3.4 operational tables have RLS enabled and direct anon/authenticated table access revoked.

## Empty-state verification
Before first institutional record, expected counts are:
- executive briefings: 0
- delivery drafts: 0

Running automation should return `noData: true` and `generated: 0`.
