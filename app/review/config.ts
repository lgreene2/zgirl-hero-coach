import type { JourneyLocale } from "@/app/lib/journey";

export const REVIEW_CANDIDATE_ID = "ZGIRL-AUDIO-RC2-F5-2026-08-03";
export const REVIEW_SCHEMA_VERSION = "1.0";

export type ReviewLocale = Exclude<JourneyLocale, "en-US">;
export type ReviewCriterion =
  | "meaning"
  | "naturalness"
  | "pronunciation"
  | "tone"
  | "pacing"
  | "safety"
  | "captions";

export const REVIEW_LANGUAGES: Array<{
  locale: ReviewLocale;
  label: string;
  region: string;
}> = [
  { locale: "es-US", label: "Spanish", region: "United States" },
  { locale: "fr-FR", label: "French", region: "France" },
  { locale: "pt-BR", label: "Portuguese", region: "Brazil" },
  { locale: "de-DE", label: "German", region: "Germany" },
];

export const REVIEW_CRITERIA: Array<{
  key: ReviewCriterion;
  label: string;
  prompt: string;
}> = [
  { key: "meaning", label: "Meaning", prompt: "The adapted language preserves the intended meaning." },
  { key: "naturalness", label: "Naturalness", prompt: "The wording sounds natural to a native speaker in this region." },
  { key: "pronunciation", label: "Pronunciation", prompt: "Names, recurring terms, and all spoken words are pronounced correctly." },
  { key: "tone", label: "Tone", prompt: "The voice remains warm, calm, strength-based, and nonjudgmental." },
  { key: "pacing", label: "Pacing", prompt: "The pace and reflection pauses feel intentional and unhurried." },
  { key: "safety", label: "Safety", prompt: "Choice, pause/stop, trusted-person, and local-support language remain intact." },
  { key: "captions", label: "Transcript match", prompt: "The supplied transcript matches the spoken candidate exactly." },
];

export const REVIEW_DAYS = 7;
