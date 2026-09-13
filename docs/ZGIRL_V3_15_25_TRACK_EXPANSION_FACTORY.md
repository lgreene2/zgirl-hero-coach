# Z-Girl v3.15 — 25-Track Audio Expansion Factory

Status: preview / governed production candidate generation

## Gate that unlocked this factory

The product owner completed human listening review of the five representative tracks:

- Day 1
- Day 8
- Day 15
- Day 22
- Day 30

All five current audio checksums are recorded as approved in Greene governance evidence. `zgirl_audio_human_review_gate_status()` reports:

- allReady: true
- readyCount: 5
- allApproved: true
- approvedCount: 5
- expansionUnlocked: true

This unlock is a candidate-production authorization only. It is not a master, rights, subscription, or public-release approval.

## Locked production recipe

Every remaining day must use:

- Google Gemini 3.1 Flash TTS preview
- Sulafat
- voice profile `zgirl-hero-within-30-day-en-us-candidate-v3`
- the exact provider prompt profile that produced the approved Day 1 / Day 8 baseline and the corrected approved representative set
- no Gemini 2.5 fallback
- no device voice fallback
- no autoplay
- provider interaction storage disabled

Any quota or generation failure must stop the factory rather than silently change model, voice, or character identity.

## Canonical scripts

All 30 Day 1–30 transcripts are now stored in the locked `zgirl_audio_review_scripts` staging registry for content version `30-day-foundation-v0.1`.

Each row contains an SHA-256 of the exact UTF-8 transcript. Expansion workers load the transcript server-side and verify its digest before any provider request.

## Expansion worker

Supabase Edge Function:

`zgirl-audio-expansion-worker`

Responsibilities:

- require the completed 5/5 representative human-listening gate;
- select only Days 1–30;
- treat Days 1, 8, 15, 22 and 30 as representative tracks and leave them to the existing review worker;
- render only one expansion track at a time;
- reject duplicate work when a candidate already exists or a render is active;
- stop on quota exhaustion unless an explicit one-attempt retry is requested;
- stop on other generation failure until an explicit retry;
- store successful audio privately in Greene-controlled `generated-artifacts` staging;
- write render job, render attempt, checksum, provenance and transcript-integrity evidence;
- keep each asset `IN_REVIEW` / `PENDING_REVIEW`;
- never promote a candidate to a master or release automatically.

## Preview UI

Route:

`/library/30-day/audio-expansion`

The page provides:

- 25-track expansion progress;
- 30-day status grid including the five representative baseline tracks;
- Start / Pause / Resume factory controls;
- one-at-a-time governed queue behavior;
- automatic stop on quota or generation failure;
- explicit one-attempt retry control;
- persisted server-side state so browser sleep or closure does not lose completed renders;
- stored candidate playback without a new Gemini request;
- checksum and release-state evidence.

## Release boundary

The expansion factory is preview-only. Production Z-Girl remains unchanged. PR #43 remains the release boundary.

Completion of all 30 review candidates still does not mean:

- studio master approved;
- commercial rights approved;
- subscription entitlement activated;
- public release approved;
- production deployment approved.

Those are separate gates.
