# Z-Girl Executive Reporting Data Boundary

## Allowed executive data
- institution identity, type, and lifecycle status;
- institutional license type, status, term, limits, and renewal state;
- aggregate adult facilitator/trainer seat utilization;
- aggregate linked credential counts and renewal exposure;
- institutional workflow status and target dates;
- implementation handoff status and adult implementation owner;
- institutional opportunity stage, owner, probability, target dates, and planning value;
- executive portfolio health, strategic priority, expansion readiness, next action, and review date;
- aggregate portfolio snapshots.

## Prohibited executive data
The portfolio command center must not contain or derive:
- private participant reflection text;
- student, youth, athlete, or family case records;
- diagnosis, treatment, therapy, counseling, or clinical notes;
- safeguarding incident narratives;
- clergy or spiritual-direction records;
- sports-medicine records;
- individual participant behavior scores;
- facilitator knowledge-test scores or practicum detail unless a separate credential-operations use explicitly requires them;
- private institutional contact directories in board/executive snapshots.

## Interpretation rules
- Institution health is an executive operating assessment, not a participant outcome score.
- Pipeline value is planning metadata, not payment status, recognized revenue, donation value, or license authority.
- Credential capacity metrics summarize adult program authorization only.
- An executive snapshot is a reporting artifact, not an approval or release instrument.

## Public/private boundary
The public `/institutions/portfolio-command-center` route explains the product and governance model. Operational portfolio data is restricted to `/institutions/ops/portfolio` and the session-gated API.
