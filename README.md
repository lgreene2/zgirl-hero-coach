# Z-Girl: The Hero Within Reflection System

Z-Girl Open v2.0.2 is a character-powered, safety-first reflection experience for youth, adults, families, and guided groups.

## Public experiences

- `/` — v2.0 public gateway
- `/reflect` — private, no-login six-step reflection
- `/journey` — interactive 7-Day Hero Within Journey
- `/coach` — optional AI-guided reflection with youth, adult, and supporter editions
- `/privacy` — plain-language data guide
- `/accessibility` — accessibility commitments and known limitations
- `/safety` — safety boundaries and crisis guidance
- `/for-adults` — parent, caregiver, educator, and mentor guidance
- `/pilot` — archived v1.1 pilot materials and v2 institutional pathway

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add a valid `GEMINI_API_KEY` to enable AI Coach replies.
3. Run `npm install`.
4. Run `npm run dev`.

Private Reflection and the 7-Day Journey work without an AI key. The production build also succeeds without a key; AI Coach returns a clear unavailable response while the deterministic crisis response remains active.

## Quality gates

```bash
npm run lint
npm run build
```

## Release

Current package version: `2.0.2`.

The v2.0 release replaces seasonal framing, introduces the reusable Hero Within Method, clarifies AI data flow, prevents client-supplied safety prompt overrides, updates the PWA cache, and preserves older pilot files only as labeled archive materials.

The v2.0.1 Natural Voice Patch waits for the browser voice catalog before greeting, prefers a natural feminine voice in the selected language, remembers a different device voice for each language, adds a voice preview, and moves speed, pitch, and device-specific choices under Advanced voice options.


The v2.0.2 Sound Cue Refinement removes completion, send, save, and launch chimes. An optional low-volume cue can play only when spoken output begins; it is separate from voice output and defaults to Off, including for users migrating from v2.0.1.
