# Z-Girl Commit (F)
Files:
- app/page.tsx
- app/globals.css
- app/api/chat/route.ts

Includes:
- Voice input (Web Speech API) with no-repeat transcript handling
- Optional auto-send on speech end + silence auto-stop
- Speech synthesis (female-first voice selection), rate/pitch sliders, language switching
- Per-message mute + Speak Last button on assistant bubbles
- Speaking ring + mouth movement while speaking (CSS)
- Reply chime/startup sound hooks (frontend already references your audio assets)
- Backend: Gemini 429 rate-limit handling (returns 429 + Retry-After, frontend shows countdown)
