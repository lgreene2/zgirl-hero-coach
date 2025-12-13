// app/lib/voice.ts
// Small, testable helpers for Web Speech (TTS + SpeechRecognition) used by Z-Girl Hero Coach.

export type SpeechResultEvent = any;

export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof (window as any).SpeechSynthesisUtterance !== "undefined"
  );
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window));
}

export function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function wordCount(s: string): number {
  const t = normalizeSpaces(s);
  if (!t) return 0;
  return t.split(" ").filter(Boolean).length;
}

export type TranscriptUpdate = {
  base: string;          // text already in the input when listening starts
  finalSoFar: string;    // accumulated FINAL speech chunks (no interim)
  event: SpeechResultEvent;
};

export type TranscriptUpdateResult = {
  finalSoFar: string;
  interim: string;
  combined: string;      // base + final + interim (normalized)
  gotAny: boolean;
  gotFinal: boolean;
};

export function applyTranscriptUpdate({ base, finalSoFar, event }: TranscriptUpdate): TranscriptUpdateResult {
  let interim = "";
  let finalChunk = "";

  const results = event?.results;
  const startIndex = typeof event?.resultIndex === "number" ? event.resultIndex : 0;

  if (results && typeof results.length === "number") {
    for (let i = startIndex; i < results.length; i++) {
      const res = results[i];
      const t = res?.[0]?.transcript ? String(res[0].transcript) : "";
      if (!t) continue;
      if (res.isFinal) finalChunk += t;
      else interim += t;
    }
  }

  const gotAny = Boolean(interim.trim() || finalChunk.trim());
  const gotFinal = Boolean(finalChunk.trim());

  let nextFinal = finalSoFar || "";
  if (finalChunk) {
    const add = normalizeSpaces(finalChunk);
    if (add) nextFinal = normalizeSpaces(nextFinal ? `${nextFinal} ${add}` : add);
  }

  const live = normalizeSpaces(`${nextFinal} ${interim}`);
  const combined = normalizeSpaces(`${base}${base && live ? " " : ""}${live}`);

  return { finalSoFar: nextFinal, interim: normalizeSpaces(interim), combined, gotAny, gotFinal };
}

// A light heuristic to prefer female-sounding voices (name-based; browser-dependent).
const FEMALE_HINTS = ["female", "woman", "girl", "zira", "samantha", "victoria", "karen", "tessa", "amelie", "ava", "emma", "olivia"];

export function pickVoice(
  voices: SpeechSynthesisVoice[],
  opts: { lang?: string; preferredName?: string; preferFemale?: boolean } = {}
): SpeechSynthesisVoice | null {
  const { lang, preferredName, preferFemale = true } = opts;

  if (!voices || voices.length === 0) return null;

  if (preferredName) {
    const exact = voices.find((v) => v.name === preferredName);
    if (exact) return exact;
  }

  const inLang = lang ? voices.filter((v) => (v.lang || "").toLowerCase().startsWith(lang.toLowerCase().slice(0, 2))) : voices.slice();

  if (preferFemale) {
    const female = inLang.find((v) => FEMALE_HINTS.some((h) => (v.name || "").toLowerCase().includes(h)));
    if (female) return female;
  }

  const defaultVoice = inLang.find((v) => (v as any).default);
  return defaultVoice || inLang[0] || voices[0] || null;
}
