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
const PROFILE = "zgirl-hero-within-30-day-en-us-candidate-v1";
const WINDOW_MS = 60_000;
const REQUESTS_PER_WINDOW = 6;

type RateEntry = { count: number; resetAt: number };
type GeneratedVoiceAudio = {
  channels?: number;
  data: string;
  mime_type?: string;
  sample_rate?: number;
};

const rateEntries = new Map<string, RateEntry>();

function noStoreHeaders(extra: HeadersInit = {}): HeadersInit {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
    ...extra,
  };
}

function candidateEnabled() {
  return process.env.VERCEL_ENV !== "production";
}

function requestKey(req: NextRequest): string {
  return (
    req.headers.get("x-vercel-forwarded-for") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateLimit(req: NextRequest): number | null {
  const now = Date.now();
  const key = requestKey(req);
  const current = rateEntries.get(key);

  if (!current || current.resetAt <= now) {
    rateEntries.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }

  current.count += 1;
  if (current.count <= REQUESTS_PER_WINDOW) return null;
  return Math.max(1, Math.ceil((current.resetAt - now) / 1_000));
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === req.nextUrl.host;
  } catch {
    return false;
  }
}

function buildPerformancePrompt(transcript: string): string {
  return `
# AUDIO PROFILE: Z-Girl — 30-Day Hero Within Guided Reflection Candidate

Read only the TRANSCRIPT below. The directions are not part of the transcript.

## DIRECTOR'S NOTES
- Warm, grounded, compassionate, confident, and human.
- Sound like the same approved Z-Girl voice identity used by the live English (US) Coach, but shift from conversational reply delivery into a guided-reflection performance.
- Youthful adult energy without sounding childish, clinical, theatrical, sleepy, or like a commercial announcer.
- Use an unhurried pace with meaningful natural pauses after reflection prompts, strength prompts, Hero Moves, and the affirmation.
- Do not simulate long silence; the learner controls when to pause or continue the experience.
- Pronounce “Z-Girl” as “Zee Girl.”
- Recite the transcript faithfully. Do not add commentary, stage directions, sound effects, music, laughter, breaths for effect, or extra words.
- No chime, click, sonic logo, or startup sound.

## TRANSCRIPT
${transcript}
  `.trim();
}

function voiceErrorStatus(err: unknown): number {
  if (!err || typeof err !== "object" || !("status" in err)) return 0;
  const status = Number((err as { status?: unknown }).status);
  return Number.isFinite(status) ? status : 0;
}

function isTransientVoiceError(err: unknown): boolean {
  const status = voiceErrorStatus(err);
  const message = String(
    err && typeof err === "object" && "message" in err
      ? (err as { message?: unknown }).message
      : err || ""
  );
  return (
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    /high demand|temporar|overload|unavailable|timeout|rate limit|quota/i.test(message)
  );
}

async function generateVoiceAudio(
  client: GoogleGenAI,
  input: string
): Promise<{ model: string; output: GeneratedVoiceAudio }> {
  let lastError: unknown = new Error("audio_candidate_unavailable");

  for (const model of [MODEL, FALLBACK_MODEL]) {
    try {
      const interaction = await client.interactions.create({
        model,
        input,
        response_format: { type: "audio" },
        generation_config: {
          speech_config: [{ voice: VOICE }],
        },
        store: false,
      });
      const output = interaction.output_audio;
      if (output?.data) return { model, output: { ...output, data: output.data } };
      lastError = new Error("audio_candidate_missing");
    } catch (err) {
      lastError = err;
      if (voiceErrorStatus(err) === 429) throw err;
      if (!isTransientVoiceError(err)) throw err;
    }
  }

  throw lastError;
}

function asWaveFile(
  pcm: Buffer,
  sampleRate = 24_000,
  channels = 1,
  bitsPerSample = 16
): Buffer {
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

export async function GET() {
  return NextResponse.json(
    {
      configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      enabled: candidateEnabled(),
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
      autoplay: false,
      deviceFallback: false,
      humanListeningRequired: true,
    },
    { headers: noStoreHeaders() }
  );
}

export async function POST(req: NextRequest) {
  if (!candidateEnabled()) {
    return NextResponse.json(
      { ok: false, code: "AUDIO_CANDIDATE_NOT_AVAILABLE_IN_PRODUCTION" },
      { status: 404, headers: noStoreHeaders() }
    );
  }

  if (!isSameOrigin(req)) {
    return NextResponse.json(
      { ok: false, code: "CROSS_ORIGIN_BLOCKED" },
      { status: 403, headers: noStoreHeaders() }
    );
  }

  const retryAfter = rateLimit(req);
  if (retryAfter) {
    return NextResponse.json(
      { ok: false, code: "AUDIO_CANDIDATE_RATE_LIMITED", retryAfter },
      {
        status: 429,
        headers: noStoreHeaders({
          "Retry-After": String(retryAfter),
          "X-ZGirl-Audio-Retryable": "true",
        }),
      }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, code: "AUDIO_CANDIDATE_NOT_CONFIGURED" },
      { status: 503, headers: noStoreHeaders() }
    );
  }

  const body = (await req.json().catch(() => null)) as { day?: unknown } | null;
  const dayNumber = Number(body?.day);
  const item = Number.isInteger(dayNumber)
    ? HERO_WITHIN_30_DAY.find((candidate) => candidate.day === dayNumber)
    : undefined;

  if (!item) {
    return NextResponse.json(
      { ok: false, code: "INVALID_AUDIO_CANDIDATE_DAY" },
      { status: 400, headers: noStoreHeaders() }
    );
  }

  const transcript = getHeroWithin30DayTranscript(item);
  const transcriptSha256 = createHash("sha256").update(transcript, "utf8").digest("hex");
  const requestStartedAt = Date.now();

  try {
    const client = new GoogleGenAI({ apiKey });
    const generated = await generateVoiceAudio(
      client,
      buildPerformancePrompt(transcript)
    );
    const output = generated.output;
    const generatedAudio = Buffer.from(output.data, "base64");
    const hasWaveHeader =
      generatedAudio.byteLength >= 12 &&
      generatedAudio.subarray(0, 4).toString("ascii") === "RIFF" &&
      generatedAudio.subarray(8, 12).toString("ascii") === "WAVE";
    const hasMp3Header =
      generatedAudio.subarray(0, 3).toString("ascii") === "ID3" ||
      (generatedAudio[0] === 0xff && (generatedAudio[1] & 0xe0) === 0xe0);
    const audio =
      hasWaveHeader || hasMp3Header
        ? generatedAudio
        : asWaveFile(
            generatedAudio,
            output.sample_rate || 24_000,
            output.channels || 1
          );
    const contentType = hasMp3Header ? "audio/mpeg" : "audio/wav";
    const durationMs = Date.now() - requestStartedAt;

    console.info("Z-Girl 30-day audio candidate generated", {
      day: item.day,
      durationMs,
      model: generated.model,
      profile: PROFILE,
      transcriptSha256,
    });

    return new NextResponse(Uint8Array.from(audio), {
      status: 200,
      headers: noStoreHeaders({
        "Content-Type": contentType,
        "Content-Length": String(audio.byteLength),
        "X-ZGirl-Audio-Candidate": "true",
        "X-ZGirl-Audio-Release": "not-approved",
        "X-ZGirl-Audio-Day": String(item.day),
        "X-ZGirl-Audio-Profile": PROFILE,
        "X-ZGirl-Audio-Model": generated.model,
        "X-ZGirl-Audio-Content-Version": HERO_WITHIN_30_DAY_VERSION,
        "X-ZGirl-Audio-Transcript-SHA256": transcriptSha256,
        "Server-Timing": `zgirl-30day-tts;dur=${durationMs}`,
      }),
    });
  } catch (error) {
    const status = voiceErrorStatus(error);
    const providerRateLimited = status === 429;

    console.error("Z-Girl 30-day audio candidate generation failed", {
      day: item.day,
      durationMs: Date.now() - requestStartedAt,
      status,
      profile: PROFILE,
      transcriptSha256,
    });

    return NextResponse.json(
      {
        ok: false,
        code: providerRateLimited
          ? "AUDIO_CANDIDATE_PROVIDER_RATE_LIMITED"
          : "AUDIO_CANDIDATE_GENERATION_FAILED",
        ...(providerRateLimited ? { retryAfter: 5 } : {}),
      },
      {
        status: providerRateLimited ? 429 : 502,
        headers: noStoreHeaders(
          providerRateLimited
            ? { "Retry-After": "5", "X-ZGirl-Audio-Retryable": "true" }
            : {}
        ),
      }
    );
  }
}
