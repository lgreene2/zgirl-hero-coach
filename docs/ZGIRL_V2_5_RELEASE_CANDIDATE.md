# Z-Girl v2.5 Release Candidate

Release candidate: Institutional Pilot & Licensing Layer

## Included

### Product / platform layer

- `/institutions` institutional hub
- `/institutions/pilot-brief` public print-friendly institutional pilot sell sheet
- schools / youth programs pathway
- Faith & Values pathway
- Athlete Edition pathway
- controlled design-partner pathway
- pilot-to-license lifecycle
- train-the-trainer expansion architecture
- institutional governance boundaries
- primary navigation update
- Founding Partners school / youth-program path

### Institutional sales / contracting assets

- `docs/ZGIRL_INSTITUTIONAL_PILOT_SELL_SHEET.md`
- `docs/ZGIRL_INSTITUTIONAL_PILOT_AGREEMENT_SOW_TEMPLATE.md`
- `docs/ZGIRL_ANNUAL_LICENSE_TERM_SHEET_TEMPLATE.md`
- `docs/ZGIRL_V2_5_INSTITUTIONAL_LICENSING.md`

The agreement and term-sheet materials are business templates for counsel / procurement review before execution. They intentionally avoid treating private participant reflection text as routine institutional reporting data and preserve a minimum-necessary data posture.

## Intentionally not activated

- paid checkout
- commercial seller environment configuration
- Stripe payment links

Those remain governed by the separate v2.4 commerce activation gate until Greene Leadership System LLC is accepted and configured as merchant of record.

## Preview verification checklist

- build passes TypeScript
- `/institutions` renders
- `/institutions/pilot-brief` renders and prints cleanly
- primary navigation opens `/institutions`
- `/institutions` links to `/edu`, `/faith`, `/athletes`, and `/partners`
- institutional inquiry form renders using the supported `founding-partner` lead type
- Founding Partners renders four pathways responsively
- no private-reflection collection or institutional dashboard language introduced
- production commerce activation remains unchanged

## Deployment status

The first v2.5 Preview surfaced and led to correction of an unsupported lead-type value. The corrected branch no longer contains that type error.

On 2026-08-10, Vercel resumed accepting Preview builds after the earlier account build-rate limit. Multiple corrected v2.5 branch commits subsequently built successfully with `READY` status. This release-candidate commit intentionally retriggers Vercel so the complete current PR head can receive one clean Preview verification before merge.
