# Voice regression checklist (Z-Girl Hero Coach)

Use this quick checklist whenever you touch voice code.

## 1) Microphone input (SpeechRecognition)
- Click **Speak** once → button shows **Listening…** and input highlights.
- Say: “Hello Z-Girl” → words appear live **without repeating**.
- Stop talking → listening auto-stops after ~2–3 seconds of silence.
- Click **Speak** while listening → stops listening.
- After silence-stop with **Auto-send ON**:
  - If **Confirm ON** → shows “Did I hear you right?” with Edit / Yes, send.
  - If **Confirm OFF** → message sends automatically.
- Confirm auto-send guard:
  - If transcript < 2 words → should **not** auto-send.

## 2) Echo prevention
- Start Z-Girl speaking (Play welcome or speak last).
- While speaking, click **Speak**:
  - Z-Girl speech stops
  - mic begins listening
- While listening, trigger speech:
  - listening stops (no echo loop)

## 3) Text-to-speech (TTS)
- Toggle **Voice ON/OFF**:
  - OFF: nothing speaks (but chat still works)
  - ON: speaks on demand
- Voice selection:
  - Female-first voice chosen by default
  - Changing voice persists after refresh
- Rate & Pitch sliders affect speech.

## 4) Per-message controls
- Each assistant bubble:
  - “Speak last reply” works (unless muted)
  - Per-message mute toggles only that message
- Muted messages remain muted after refresh.

## 5) Accessibility fallbacks
- Screen reader announcements:
  - Start/stop listening announced
  - “Captured voice input” announced on final chunk
- If SpeechRecognition unsupported:
  - Speak button disabled + message shown
- If TTS unsupported:
  - Voice controls disabled + message shown

## 6) Smoke tests (browsers)
- Chrome (desktop): must pass all above
- Edge (desktop): should pass
- iOS Safari: SpeechRecognition may not work (expected); UI should degrade gracefully.

