# Z-Girl v3.15 — 30-Day Whole-Library QA + Master Promotion Gate

Status: preview-only governed production review. Production remains unchanged until explicit release approval.

## Current production state

- 30/30 candidate audio files are stored in Greene-controlled private storage.
- All 30 latest candidate renders succeeded.
- All 30 use Gemini 3.1 Flash TTS, Sulafat, and the locked Z-Girl guided-reflection profile.
- All 30 have transcript/audio checksum evidence.
- Automated whole-library technical validation is recorded for 30/30 candidates.
- Five representative candidates already carry checksum-bound human listening approval from the representative gate.
- Remaining candidates require whole-library human listening QA.
- Rights status remains PENDING_REVIEW until separately cleared.

## Console

Route: `/library/30-day/master-review`

The console provides:

1. 30-track day navigator.
2. Stored candidate playback with no provider regeneration.
3. Exact SHA-256 display.
4. Exact canonical transcript display.
5. Local review notes.
6. Checksum-bound Approve / Reject actions.
7. Automatic progression to the next unreviewed track after approval.
8. Technical / Human / Rights / Master gate counters.
9. Fail-closed master promotion control.

## Human listening evidence

Each whole-library decision creates a `HUMAN_LISTENING_REVIEW` evidence record bound to the current candidate checksum. A later regenerated checksum cannot inherit an earlier approval.

Approval scope is candidate audio QA only. It does not approve public release, subscriptions, licensing, or distribution.

## Technical validation

Each stored candidate has a `TECHNICAL_VALIDATION` evidence record verifying at least:

- private storage object metadata is present;
- SHA-256 checksum is present;
- latest render succeeded;
- model is `gemini-3.1-flash-tts-preview`;
- voice is `Sulafat`;
- governed voice profile and transcript hash metadata are present.

Technical validation does not substitute for human listening.

## Master promotion gate

Master promotion remains locked until all of the following are true:

- 30/30 technical validations are verified;
- 30/30 checksum-bound human listening decisions are approved;
- 30/30 source candidate rights statuses are `CLEARED`;
- product owner types the explicit final confirmation phrase.

When unlocked, promotion creates separate governed master asset records (`...-master-v01`) referencing the approved candidate, retaining the exact checksum and storage object. Candidate history remains intact.

Master promotion creates `APPROVED_NOT_PUBLIC` masters only. It does not publish to the public site, activate billing, enable membership entitlements, or authorize distribution.

## Rights boundary

The listening console intentionally cannot self-clear commercial rights. Rights review remains a separate governance step so an audio-quality approval cannot silently become a commercial-use authorization.

## Release boundary

PR #43 remains preview-only. Merge/public release requires whole-library QA, rights clearance, master promotion, final product-owner approval, and production release verification.
