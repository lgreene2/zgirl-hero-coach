# Z-Girl Credential Operations Runbook

## Entry points

Public verification:

- `/credentials/verify`

Restricted operations:

- `/credentials/ops`

## First access

The initial v2.8 database migration seeds only the **hash** of a one-time bootstrap access code. The plaintext bootstrap code is not stored in the repository.

On first successful login:

1. Open `/credentials/ops`.
2. Enter the bootstrap credential-operations access code.
3. Open **Security**.
4. Rotate to a new access code of at least 24 characters.
5. Store the replacement code in the approved password manager / secret-management process.

Rotation revokes every existing credential-operations session.

## Routine candidate workflow

1. Create the facilitator/trainer candidate.
2. Select pathway and training version.
3. Move the candidate through the appropriate workflow status.
4. Record each requirement as pending, in progress, pass, fail, or not required where permitted.
5. Record only aggregate assessment score when needed.
6. Do not enter participant/youth/private-reflection information.
7. When evidence is complete, use **Issue program credential**.

The database—not the browser—enforces required passes.

## Issuance

Credential levels:

- Authorized Facilitator
- Authorized Lead Facilitator
- Institutional Trainer

Before issuance, confirm:

- correct candidate identity
- correct organization
- correct training version
- required evidence is passed
- intended scope is accurate
- expiration date matches current credential policy

A generated credential ID is returned after successful issuance.

## Public verification

Provide the credential holder or institution with the exact credential ID. The verifier does not support browsing by name.

If public verification should be temporarily unavailable, disable **Public verification** on the credential record and save status.

## Suspension / revocation

Use structured status and reason category only.

Statuses:

- active
- conditional
- suspended
- revoked
- lapsed

Reason categories:

- quality
- conduct
- privacy
- safety
- scope
- administrative
- renewal
- other

Do not place an incident narrative in the credential system. Handle detailed personnel/safeguarding/legal records in the institution's appropriate system.

## Renewal

1. Review current authorization evidence and version requirements.
2. Complete refresher/reobservation requirements outside the participant-reflection record.
3. Enter the approved new expiration date.
4. Select **Record renewal**.
5. Confirm public verification displays the updated term.

## Access incident response

If the operator access code may be compromised:

1. Log in from a trusted device if possible.
2. Rotate the access code immediately.
3. Rotation revokes all older sessions.
4. Review recent audit events for unexpected credential actions.
5. If access cannot be regained, rotate/reset the access hash through controlled database administration rather than modifying public application code.

## Environment portability

The application defaults to the current Greene managed-cloud staging project and publishable key. These may be overridden later with:

- `ZGIRL_CREDENTIAL_SUPABASE_URL`
- `ZGIRL_CREDENTIAL_SUPABASE_PUBLISHABLE_KEY`

No service-role key is required by the application.

Before moving to a production managed-cloud database:

1. Apply the credential schema migration.
2. Set a new one-time bootstrap access hash.
3. Configure the production project URL/publishable key.
4. Test login, issuance rejection, issuance success, status change, renewal, and public verification.
5. Verify security advisors and table grants.
6. Rotate the bootstrap code after first operator login.

## Do not activate commerce here

Credential operations and credential commerce are separate. v2.8 does not change the existing seller/checkout gate. Paid credential/training checkout should be activated only through the approved commercial seller process.
