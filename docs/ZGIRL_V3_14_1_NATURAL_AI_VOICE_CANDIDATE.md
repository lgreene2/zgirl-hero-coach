# Z-Girl v3.14.1 — Natural AI Voice Release

## Objective

v3.14.1 replaces the iPhone/browser voice presented as “Z-Girl Natural Voice” with the approved server-generated speech voice for the live AI Coach.

The approved English (US) voice uses the dedicated `zgirl-live-coach-en-us-v1` performance profile with the Sulafat base voice. Direction is warm, grounded, compassionate, confident and conversational. “Z-Girl” is directed as “Zee Girl.” The profile is not Cedar, Bighawk, a 4 Lessons game narrator, or one of the protected native-language studio-review candidates.

## Listening gate

This release required product-owner listening approval before production promotion.

Before promotion, a product owner must use an iPhone and at least one desktop browser to confirm:

1. Preview Voice plays the approved AI voice rather than a named iPhone device voice;
2. Z-Girl is pronounced “Zee Girl”;
3. cadence is natural, warm and unhurried;
4. sensitive replies sound calm rather than cheerful, clinical or alarmed;
5. Stop Voice cancels generation or playback;
6. a voice-service or playback failure does not silently substitute a robotic device voice;
7. no greeting or reply autoplays unless the user explicitly enables auto-speak.

Lyndon Greene completed iPhone listening review and explicitly approved the voice on August 24, 2026. The governed release record now sets `humanListeningApproved` and `publicReleaseApproved` to true.

## Privacy and data flow

- The browser sends only the visible Z-Girl assistant reply selected for playback to `/api/voice/speech`.
- Microphone audio, the user’s raw message, and conversation history are not sent to the speech endpoint.
- The server uses its existing server-only Gemini credential; no key is exposed to the browser.
- Gemini Interactions is called with `store: false`.
- The route does not log the spoken transcript and returns `Cache-Control: private, no-store`.
- Generated audio is held only in a temporary browser object URL and is revoked after playback.
- Same-origin checking, bounded input and a short in-memory rate limit reduce public misuse.

The Coach visibly identifies the voice as AI-generated and explains the provider data flow before use.

## Language boundary

The approved AI voice is English (US) only. English (UK), Spanish, French, Portuguese and German continue to use an honestly labeled matching device voice. This does not publish, replace or bypass the protected native-language review workflow.

## Failure behavior

If the approved natural voice is unavailable, rate-limited, blocked by the browser, or cannot play, the Coach displays the failure and does not silently substitute a robotic device voice. A prepared-voice second tap is available when iPhone requires a fresh playback gesture. Chat remains usable when speech output is unavailable.

## Preserved boundaries

v3.14.1 does not alter institutional pilot activation, release evidence, commerce, Supabase schemas, native-language approval, or participant private-reflection access. v3.14 human release gates remain authoritative and unchanged.
