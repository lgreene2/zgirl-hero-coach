import { createHash } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import {
  getHeroWithin30DayTranscript,
  HERO_WITHIN_30_DAY,
  HERO_WITHIN_30_DAY_VERSION,
} from "@/app/lib/hero-within-30-day";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "gemini-3.1-flash-tts-preview";
const FALLBACK_MODEL = "gemini-2.5-flash-preview-tts";
const VOICE = "Sulafat";
const PROFILE = "zgirl-hero-within-30-day-en-us-candidate-v2";
const RETRY_DELAY_MS = 8_000;
const CACHE_TTL_MS = 10 * 60_000;

type GeneratedVoiceAudio = {
  channels?: number;
  data: string;
  mime_type?: string;
  sample_rate?: number;
};

type CachedCandidate = {
  audio: Buffer;
  contentType: string;
  model: string;
  transcriptSha256: string;
  expiresAt: number;
};

const candidateCache = new Map<string, CachedCandidate>();
const inFlight = new Map<string, Promise<CachedCandidate>>();

function noStoreHeaders(extra: HeadersInit = {}): HeadersInit {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
    ...extra,
  };
}

function enabled() {
  return process.env.VERCEL_ENV !== "production";
}

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.nextUrl.host;
  } catch {
    return false;
  }
}

function statusOf(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) return 0;
  const status = Number((error as { status?: unknown }).status);
  return Number.isFinite(status) ? status : 0;
}

function transient(error: unknown) {
  const status = statusOf(error);
  const message = String(
    error && typeof error === "object" && "message" in error
      ? (error as { message?: unknown }).message
      : error || ""
  );
  return status === 408 || status === 429 || status >= 500 || /temporar|busy|overload|unavailable|timeout|quota|rate limit/i.test(message);
}

function promptFor(transcript: string) {
  return `
# AUDIO PROFILE: Z-Girl — 30-Day Hero Within Guided Reflection Candidate

Read only the TRANSCRIPT below. The directions are not part of the transcript.

## DIRECTOR'S NOTES
- Warm, grounded, compassionate, confident, and human.
- Match the approved Z-Girl English (US) voice identity, with a guided-reflection delivery rather than a chat-reply delivery.
- Youthful adult energy; never childish, clinical, theatrical, sleepy, or commercial.
- Use an unhurried natural pace with meaningful pauses after the reflection, strength, Hero Move, and affirmation prompts.
- Pronounce “Z-Girl” as “Zee Girl.”
- Recite faithfully. Add no commentary, stage directions, sound effects, music, laughter, extra words, chime, click, or sonic logo.

## TRANSCRIPT
${transcript}
  `.trim();
}

function asWaveFile(pcm: Buffer, sampleRate = 24_000, channels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.byteLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.byteLength, 40);
  return Buffer.concat([header, pcm]);
}

async function callModel(client: GoogleGenAI, model: string, input: string) {
  const interaction = await client.interactions.create({
    model,
    input,
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice: VOICE }] },
    store: false,
  });
  const output = interaction.output_audio;
  if (!output?.data) throw new Error("audio_candidate_missing");
  return { model, output: { ...output, data: output.data } as GeneratedVoiceAudio };
}

async function generateCandidate(transcript: string, transcriptSha256: string): Promise<CachedCandidate> {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!.trim() });
  const input = promptFor(transcript);
  let generated: { model: string; output: GeneratedVoiceAudio } | null = null;
  let lastError: unknown = null;

  try {
    generated = await callModel(client, MODEL, input);
  } catch (error) {
    lastError = error;
    if (!transient(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    try {
      generated = await callModel(client, MODEL, input);
    } catch (retryError) {
      lastError = retryError;
      if (statusOf(retryError) !== 429 && transient(retryError)) {
        generated = await callModel(client, FALLBACK_MODEL, input).catch(() => null);
      }
    }
  }

  if (!generated) throw lastError || new Error("audio_candidate_unavailable");

  const raw = Buffer.from(generated.output.data, "base64");
  const isWave = raw.byteLength >= 12 && raw.subarray(0, 4).toString("ascii") === "RIFF" && raw.subarray(8, 12).toString("ascii") === "WAVE";
  const isMp3 = raw.subarray(0, 3).toString("ascii") === "ID3" || (raw[0] === 0xff && (raw[1] & 0xe0) === 0xe0);
  const audio = isWave || isMp3 ? raw : asWaveFile(raw, generated.output.sample_rate || 24_000, generated.output.channels || 1);
  return {
    audio,
    contentType: isMp3 ? "audio/mpeg" : "audio/wav",
    model: generated.model,
    transcriptSha256,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

export async function GET() {
  return NextResponse.json(
    {
      configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      enabled: enabled(),
      candidate: true,
      releaseApproved: false,
      language: "en-US",
      model: MODEL,
      fallbackModel: FALLBACK_MODEL,
      profile: PROFILE,
      voice: VOICE,
      contentVersion: HERO_WITHIN_30_DAY_VERSION,
      trackCount: HERO_WITHIN_30_DAY.length,
      providerStorageDisabled: true,
      persistentAudioStorage: false,
      ephemeralReplayCache: true,
      autoplay: false,
      deviceFallback: false,
      humanListeningRequired: true,
    },
    { headers: noStoreHeaders() }
  );
}

export async function POST(req: NextRequest) {
  if (!enabled()) return NextResponse.json({ ok: false, code: "AUDIO_CANDIDATE_NOT_AVAILABLE_IN_PRODUCTION" }, { status: 404, headers: noStoreHeaders() });
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, code: "CROSS_ORIGIN_BLOCKED" }, { status: 403, headers: noStoreHeaders() });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ ok: false, code: "AUDIO_CANDIDATE_NOT_CONFIGURED" }, { status: 503, headers: noStoreHeaders() });

  const body = (await req.json().catch(() => null)) as { day?: unknown } | null;
  const day = Number(body?.day);
  const item = Number.isInteger(day) ? HERO_WITHIN_30_DAY.find((candidate) => candidate.day === day) : undefined;
  if (!item) return NextResponse.json({ ok: false, code: "INVALID_AUDIO_CANDIDATE_DAY" }, { status: 400, headers: noStoreHeaders() });

  const transcript = getHeroWithin30DayTranscript(item);
  const transcriptSha256 = createHash("sha256").update(transcript, "utf8").digest("hex");
  const cacheKey = `${HERO_WITHIN_30_DAY_VERSION}:${item.day}:${transcriptSha256}`;
  const existing = candidateCache.get(cacheKey);
  if (existing && existing.expiresAt > Date.now()) {
    return new NextResponse(Uint8Array.from(existing.audio), {
      status: 200,
      headers: noStoreHeaders({
        "Content-Type": existing.contentType,
        "Content-Length": String(existing.audio.byteLength),
        "X-ZGirl-Audio-Candidate": "true",
        "X-ZGirl-Audio-Release": "not-approved",
        "X-ZGirl-Audio-Day": String(item.day),
        "X-ZGirl-Audio-Profile": PROFILE,
        "X-ZGirl-Audio-Model": existing.model,
        "X-ZGirl-Audio-Content-Version": HERO_WITHIN_30_DAY_VERSION,
        "X-ZGirl-Audio-Transcript-SHA256": existing.transcriptSha256,
        "X-ZGirl-Audio-Replay-Cache": "HIT",
      }),
    });
  }

  const startedAt = Date.now();
  try {
    let pending = inFlight.get(cacheKey);
    if (!pending) {
      pending = generateCandidate(transcript, transcriptSha256);
      inFlight.set(cacheKey, pending);
    }
    const candidate = await pending;
    candidateCache.set(cacheKey, candidate);
    inFlight.delete(cacheKey);

    console.info("Z-Girl 30-day audio candidate v2 generated", {
      day: item.day,
      durationMs: Date.now() - startedAt,
      model: candidate.model,
      profile: PROFILE,
      transcriptSha256,
    });

    return new NextResponse(Uint8Array.from(candidate.audio), {
      status: 200,
      headers: noStoreHeaders({
        "Content-Type": candidate.contentType,
        "Content-Length": String(candidate.audio.byteLength),
        "X-ZGirl-Audio-Candidate": "true",
        "X-ZGirl-Audio-Release": "not-approved",
        "X-ZGirl-Audio-Day": String(item.day),
        "X-ZGirl-Audio-Profile": PROFILE,
        "X-ZGirl-Audio-Model": candidate.model,
        "X-ZGirl-Audio-Content-Version": HERO_WITHIN_30_DAY_VERSION,
        "X-ZGirl-Audio-Transcript-SHA256": transcriptSha256,
        "X-ZGirl-Audio-Replay-Cache": "MISS",
        "Server-Timing": `zgirl-30day-tts;dur=${Date.now() - startedAt}`,
      }),
    });
  } catch (error) {
    inFlight.delete(cacheKey);
    const status = statusOf(error);
    console.error("Z-Girl 30-day audio candidate v2 failed", {
      day: item.day,
      durationMs: Date.now() - startedAt,
      status,
      profile: PROFILE,
      transcriptSha256,
    });
    const busy = status === 429 || transient(error);
    return NextResponse.json(
      { ok: false, code: busy ? "AUDIO_CANDIDATE_PROVIDER_BUSY" : "AUDIO_CANDIDATE_GENERATION_FAILED", ...(busy ? { retryAfter: 30 } : {}) },
      { status: busy ? 429 : 502, headers: noStoreHeaders(busy ? { "Retry-After": "30", "X-ZGirl-Audio-Retryable": "true" } : {}) }
    );
  }
}
