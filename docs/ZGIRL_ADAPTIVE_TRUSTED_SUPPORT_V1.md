# Z-Girl Adaptive Trusted-Support Handoff v1.0

Status: RELEASE CANDIDATE — OWNER REVIEW REQUIRED
Target train: Z-Girl v3.15
Public release: LOCKED pending owner approval

## Product outcome

Z-Girl now supports a consent-driven bridge from private reflection to a human support conversation and back into follow-through:

Participant → Z-Girl reflection → explicit share gate → trusted human → agreed next focus → Z-Girl reinforcement.

This is an extension of the existing Z-Girl platform, not a separate product, source of truth, or reflection engine.

## Supported handoff roles

- Parent or guardian
- Coach
- Teacher or educator
- Therapist or counselor
- Faith leader
- Mentor or trusted adult

Each role changes the handoff purpose, recipient guidance, and safety/governance boundaries without changing the participant's ownership of the reflection.

## Adaptive behavior

The handoff adjusts for child, teen, and adult communication styles. The user can write across six reflection fields and independently choose which fields are included in the handoff. Unselected fields are excluded even when they contain text.

The default handoff is generated locally on-device. Optional AI polish sends only the selected fields to the existing Z-Girl AI endpoint path and requires explicit opt-in. AI output remains editable and is marked AI-assisted.

## Parenting model

Parenting is a first-class support role. Normal private reflections do not automatically become parent reports. The participant chooses ordinary handoff content. Safety concerns remain governed by the separate Z-Girl safety pathway.

## Therapist / counselor boundary

Therapist mode is session preparation and communication support only. Z-Girl does not diagnose, infer disorders, recommend medication, alter treatment, or replace clinical risk assessment or professional judgment. The generated brief is participant-selected preparation material, not a clinical record or clinical conclusion.

## Handoff return loop

After the human conversation, the interface captures:

1. A shared understanding of what was important.
2. One agreed next focus or support action.
3. A direct path back into the Z-Girl 7-Day Journey or a new reflection.

This preserves the intended role of AI: prepare, personalize, reinforce, and summarize—not replace the human relationship.

## Privacy and governance

- Private by default.
- Explicit field-by-field sharing.
- Optional AI processing requires a separate consent checkbox.
- AI is instructed to summarize only selected content and not invent causes, diagnoses, motives, history, or conclusions.
- High-risk content blocks the normal AI handoff flow and prioritizes direct human/crisis support.
- No automated performance, discipline, diagnosis, treatment, or other high-stakes decision is produced.

## Files

- `app/support/page.tsx` — complete participant-to-supporter handoff and return-loop UI.
- `app/api/trusted-support/brief/route.ts` — adaptive AI brief endpoint with safety gate and role-specific constraints.
- `lib/trusted-support.ts` — support roles, age guidance, sharing fields, governance copy, deterministic local brief builder.
- `components/SiteHeader.tsx` — primary navigation entry.

## Release-blocking QA

Before merge/public release:

- Next.js production build passes.
- TypeScript and lint checks pass or any pre-existing exceptions are documented.
- `/support` renders on mobile and desktop.
- Local brief excludes unchecked fields.
- AI brief sends only selected fields.
- High-risk content cannot use normal AI brief generation.
- Parent, coach, educator, therapist, faith, and mentor modes display the correct boundaries.
- Native share falls back to clipboard when unavailable.
- No production deployment or merge occurs without owner approval.
