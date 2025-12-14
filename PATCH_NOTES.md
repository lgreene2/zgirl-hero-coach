Z-Girl – Next Smart Steps Bundle
Generated: 2025-12-14

INCLUDED CHANGES
1) /4-lessons page upgraded:
   - Icon grid for the 4 Lessons
   - Youth vs Parent/Educator toggle
   - Back to Chat buttons
   - "Ask Z-Girl →" deep-links that open chat and prefill a prompt

2) /hero page:
   - Bottom CTA no longer points to the4lessons.com (now routes internally)
   - Added "Back to Chat" CTA
   - Added click tracking via new client component app/hero/FooterCtas.tsx

3) Analytics (local only):
   - Stored in localStorage key: zgirl-analytics-v1
   - Capped at last 200 events
   - No external services / no network calls

4) Deep-link support in app/page.tsx:
   - /?chat=1 opens chat automatically
   - /?chat=1&prompt=... pre-fills the chat input

UPLOAD
- Copy these files into your repo, overwriting existing where paths match:
  app/page.tsx
  app/hero/page.tsx
  app/hero/FooterCtas.tsx
  app/4-lessons/page.tsx
