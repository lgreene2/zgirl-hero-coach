# Z-Girl v3.4 — Executive Briefing & Renewal Intelligence Automation

## Purpose
v3.4 turns the governed institutional portfolio created in v3.0–v3.3 into a repeatable executive briefing rhythm. It derives renewal, expansion, exception, owner-reminder, and portfolio intelligence from authoritative institutional records rather than creating a second CRM, licensing ledger, credential registry, or implementation database.

## Operating chain
Portfolio → Forecast → Exceptions → Owner Actions → Briefing → Board Packet

## Intelligence products
### Renewal forecast
- 30/60/90/180-day institutional license exposure
- renewal workflow presence
- seat utilization
- linked credential-capacity exposure
- executive portfolio health and owner
- recommended administrative next action

### Expansion forecast
Signals may include:
- executive expansion readiness
- seat-capacity pressure
- active expansion / Train-the-Trainer opportunity
- trainer-capacity pressure

Expansion signals are planning indicators only. They do not create or enlarge license authority.

### Exception report
Examples:
- license due within 30 days
- license due within 90 days with no open renewal workflow
- overdue executive portfolio review
- overdue pipeline decision
- seat utilization at or above 85%

### Action-owner reminders
Reminders are derived from institution-level executive owners, next-review dates, and governed renewal deadlines. They do not assign tasks to participants, students, youth, athletes, or families.

## Briefing automation
A daily pg_cron pass runs at `37 11 * * *` UTC.

The process checks:
- weekly brief: Monday, once per ISO week
- monthly brief: first day of month, once per month
- exception brief: only when exceptions exist, once per day

If there is no real institution, license, or opportunity data, the automation returns a no-data result and creates no briefing.

## Human-controlled delivery
If an operator configures a default executive recipient, new briefings may prepare an email draft in the controlled delivery queue. v3.4 never autonomously sends that email. An operator opens the draft and deliberately marks it sent.

## Board-ready packets
Each generated briefing freezes the current institutional administrative intelligence into a point-in-time packet. Packets support Print / Save PDF and contain:
- executive summary metrics
- renewal forecast
- expansion forecast
- executive exceptions
- action-owner reminders

## Authority boundary
A v3.4 brief, forecast, exception, reminder, or packet cannot:
- execute an agreement
- satisfy an approval gate
- activate, renew, expand, suspend, or terminate a license
- issue, renew, suspend, or revoke a credential
- release implementation
- mark payment received
- convert pipeline value into recognized revenue

All controlling v3.0–v3.3 workflows remain authoritative.

## Commercial productization
v3.4 can be packaged as:
- Executive Briefing add-on
- Annual Institutional Intelligence subscription
- Multi-site renewal and capacity monitoring layer
- District/university executive portfolio reporting package
- Strategic partner / board reporting add-on

Commercial payments remain separate from charitable donations and do not create operational authority.
