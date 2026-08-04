# Confidential Z-Girl Reviewer Credential Handoff

## Send separately from the invitation

Use a direct message, phone text, or other one-to-one channel that is separate from the invitation email. Do not copy additional recipients. Do not attach the confidential credential-generation file.

## Handoff message

Hello [Reviewer First Name],

Your protected Z-Girl reviewer access is ready.

Assigned language: [Language / Locale]
Reviewer portal: https://zgirlinitiative.org/review
Access code: [Assigned Plaintext Code]

Select only your assigned language when signing in. Your protected session expires after eight hours, but your review draft remains in the browser you use until you export or clear it.

Please keep this code private. Do not forward it, place it in a shared document, or send it to another reviewer. Contact me directly if the code does not work or you believe it has been exposed.

Thank you,
Lyndon

## Security handling rules

- Copy only the code assigned to the named reviewer and locale.
- Never send the full generated credential JSON file.
- Never store plaintext codes in GitHub, Vercel notes, issue trackers, shared spreadsheets, CRM notes, or public chat channels.
- Store only reviewer identity, locale, assignment date, completion status, and the last four code characters in the private assignment log.
- Rotate the affected language code and reviewer session secret if a code is exposed.
- Rotate the gateway token only if the server-side deployment secret is exposed; reviewers never receive that token.
- Delete temporary clipboard or draft copies after confirming delivery.

## Receipt confirmation

Ask the reviewer to reply with:

> Received. I will use this code only for my assigned Z-Girl [Language] review and will keep the candidate materials confidential.
