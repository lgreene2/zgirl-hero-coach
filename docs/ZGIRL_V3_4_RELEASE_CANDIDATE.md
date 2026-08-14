# Z-Girl v3.4 Release Candidate

## Release
Z-Girl v3.4.0 — Executive Briefing & Renewal Intelligence Automation

## Core release scope
- restricted executive briefing console
- live 180-day institutional renewal forecast
- expansion forecast and capacity signals
- executive exception report
- action-owner reminders
- manual board/renewal/executive briefing generation
- printable briefing packets
- controlled email-draft delivery queue
- weekly/monthly/exception scheduled briefing automation
- public institutional product page
- v3.3 Portfolio Command Center cross-link

## Database
New tables:
- `zgirl_executive_briefing_settings`
- `zgirl_executive_briefings`
- `zgirl_executive_briefing_deliveries`

New private functions:
- `private.zgirl_build_executive_intelligence`
- `private.zgirl_generate_executive_brief`
- `private.zgirl_process_executive_briefing_automation`

New session-gated RPCs:
- `zgirl_executive_briefing_dashboard`
- `zgirl_executive_briefing_generate`
- `zgirl_executive_briefing_save_settings`
- `zgirl_executive_briefing_mark_delivery`
- `zgirl_executive_briefing_get`
- `zgirl_executive_briefing_run_automation`

## Scheduled automation
`zgirl-executive-briefing-daily` → `37 11 * * *` UTC

The daily process is designed to run after the existing institutional workflow, credential renewal, and institutional license automation jobs.

## Empty-state safety
At build time the institutional operating database contains zero institutions, licenses, opportunities, portfolio reviews, and portfolio snapshots. v3.4 must not create synthetic executive intelligence. Manual smoke verification must show the scheduled process returns `noData: true`, `generated: 0` and leaves briefing/delivery tables at zero.

## Required release verification
- package version 3.4.0
- reviewer activation safety self-test passes
- Next.js compile passes
- TypeScript passes
- all routes generate
- public product page HTTP 200 and correct title
- restricted briefing page `noindex,nofollow`
- briefing dashboard API unauthenticated 401
- packet API unauthenticated 401
- existing portfolio/pipeline/workflow/license APIs remain 401 unauthenticated
- commerce remains off
- fabricated credential verification remains `found:false`
- v3.4 tables RLS enabled with zero direct anon/authenticated grants
- briefing/delivery counts remain zero in empty state
- automation cron active
- runtime error/fatal logs clean after production release

## Governance
No briefing, forecast, exception, reminder, packet, delivery draft, or scheduled run may bypass the existing agreement, approval, credential, license, implementation-release, payment, or nonprofit/commercial boundaries.
