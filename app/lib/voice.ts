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

const NATURAL_HINTS = [
  "natural",
  "neural",
  "premium",
  "enhanced",
  "online",
  "wavenet",
];

// Browsers do not expose voice gender. These name hints let us prefer a warm,
// feminine presentation without claiming that every device labels voices the
// same way. Language matching always takes priority.
const FEMININE_HINTS = [
  "female",
  "woman",
  "girl",
  "samantha",
  "victoria",
  "karen",
  "tessa",
  "serena",
  "zira",
  "aria",
  "jenny",
  "ava",
  "emma",
  "olivia",
  "susan",
  "hazel",
  "sonia",
  "michelle",
  "helena",
  "elvira",
  "dalia",
  "paloma",
  "monica",
  "paulina",
  "sabina",
  "amelie",
  "amélie",
  "hortense",
  "denise",
  "audrey",
  "marie",
  "francisca",
  "fernanda",
  "vitoria",
  "vitória",
  "katja",
  "hedda",
  "amala",
  "anna",
  "petra",
  "allison",
  "fiona",
  "kathy",
  "moira",
  "nicky",
  "vicki",
  "zoe",
  "google uk english female",
];

const MASCULINE_HINTS = [
  " male",
  "david",
  "mark",
  "george",
  "daniel",
  "ralph",
  "fred",
  "thomas",
  "guy",
];

// Apple and other operating systems may expose novelty, character, compact,
// or intentionally stylized voices through the same Web Speech API used for
// accessibility narration. They are valid device voices, but they are not
// appropriate defaults for a professional institutional Guided Coach.
const DISTRACTING_NARRATION_HINTS = [
  "albert",
  "bad news",
  "bahh",
  "bells",
  "boing",
  "bubbles",
  "cellos",
  "good news",
  "jester",
  "organ",
  "superstar",
  "trinoids",
  "whisper",
  "wobble",
  "zarvox",
  "eddy",
  "flo",
  "grandma",
  "grandpa",
  "reed",
  "rocko",
  "sandy",
  "shelley",
  "compact",
  "espeak",
  "festival",
];

const PROFESSIONAL_NARRATION_HINTS = [
  "siri",
  "microsoft",
  "google us english",
  "google uk english",
  ...NATURAL_HINTS,
  ...FEMININE_HINTS,
];

function languageBase(lang: string): string {
  return (lang || "").trim().toLowerCase().split("-")[0];
}

export function voiceMatchesLanguage(
  voice: SpeechSynthesisVoice,
  lang: string
): boolean {
  const target = languageBase(lang);
  return Boolean(target && languageBase(voice.lang) === target);
}

export function isSuitableNarrationVoice(
  voice: SpeechSynthesisVoice,
  lang = "en-US"
): boolean {
  if (!voiceMatchesLanguage(voice, lang)) return false;
  const name = (voice.name || "").toLowerCase();
  return !DISTRACTING_NARRATION_HINTS.some((hint) => name.includes(hint));
}

export function rankVoices(
  voices: SpeechSynthesisVoice[],
  lang: string
): SpeechSynthesisVoice[] {
  const exactLang = (lang || "").toLowerCase();

  const score = (voice: SpeechSynthesisVoice): number => {
    const name = (voice.name || "").toLowerCase();
    const voiceLang = (voice.lang || "").toLowerCase();
    let points = 0;

    if (voiceLang === exactLang) points += 70;
    else if (voiceMatchesLanguage(voice, lang)) points += 55;
    else points -= 100;

    if (NATURAL_HINTS.some((hint) => name.includes(hint))) points += 24;
    if (FEMININE_HINTS.some((hint) => name.includes(hint))) points += 36;
    if (MASCULINE_HINTS.some((hint) => name.includes(hint))) points -= 70;
    if (DISTRACTING_NARRATION_HINTS.some((hint) => name.includes(hint))) points -= 500;
    if (voice.default) points += 3;
    if (voice.localService) points += 1;

    return points;
  };

  return [...voices].sort((a, b) => {
    const difference = score(b) - score(a);
    return difference || a.name.localeCompare(b.name);
  });
}

export function curateNarrationVoices(
  voices: SpeechSynthesisVoice[],
  lang = "en-US",
  limit = 6
): SpeechSynthesisVoice[] {
  const safe = voices.filter((voice) => isSuitableNarrationVoice(voice, lang));
  const professional = safe.filter((voice) => {
    const name = (voice.name || "").toLowerCase();
    return PROFESSIONAL_NARRATION_HINTS.some((hint) => name.includes(hint));
  });
  const pool = professional.length ? professional : safe;
  return rankVoices(pool, lang).slice(0, Math.max(1, limit));
}

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

  const inLang = lang
    ? voices.filter((voice) => voiceMatchesLanguage(voice, lang))
    : voices.slice();

  // Do not silently substitute a voice from another language. An explicitly
  // selected device voice may still be used through preferredName above.
  if (!inLang.length) return null;

  const ranked = lang ? rankVoices(inLang, lang) : inLang;
  if (preferFemale) return ranked[0] || null;

  return inLang.find((voice) => voice.default) || inLang[0] || null;
}
