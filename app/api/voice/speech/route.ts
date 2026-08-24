import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "gemini-3.1-flash-tts-preview";
const FALLBACK_MODEL = "gemini-2.5-flash-preview-tts";
const VOICE = "Sulafat";
const PROFILE = "zgirl-live-coach-en-us-v1";
const MAX_TEXT_LENGTH = 1_200;
const WINDOW_MS = 60_000;
const REQUESTS_PER_WINDOW = 10;

type RateEntry = { count: number; resetAt: number };

const rateEntries = new Map<string, RateEntry>();

function noStoreHeaders(extra: HeadersInit = {}): HeadersInit {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    ...extra,
  };
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

function normalizeForSpeech(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|mailto:)[^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\[\]{}<>]/g, " ")
    .replace(/[*_#~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPerformancePrompt(transcript: string): string {
  return `
# AUDIO PROFILE: Z-Girl — The Grounded Hero Coach

Read only the TRANSCRIPT below. The directions are not part of the transcript.

## DIRECTOR'S NOTES
- Warm, grounded, compassionate, and confident.
- Youthful adult energy without sounding childish, clinical, theatrical, or like a commercial announcer.
- Natural conversational rhythm with small, human pauses and a gentle vocal smile.
- Calm down the energy for sensitive feelings; never sound alarmed, diagnosing, or overly cheerful.
- Speak clearly at an unhurried everyday pace.
- Pronounce “Z-Girl” as “Zee Girl.”
- Recite the transcript faithfully. Do not add commentary, stage directions, sound effects, laughter, or extra words.

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

type GeneratedVoiceAudio = {
  channels?: number;
  data: string;
  mime_type?: string;
  sample_rate?: number;
};

async function generateVoiceAudio(
  client: GoogleGenAI,
  input: string
): Promise<{ model: string; output: GeneratedVoiceAudio }> {
  let lastError: unknown = new Error("voice_generation_unavailable");

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
      lastError = new Error("voice_audio_missing");
    } catch (err) {
      lastError = err;
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
      candidate: false,
      language: "en-US",
      model: MODEL,
      fallbackModel: FALLBACK_MODEL,
      profile: PROFILE,
      voice: VOICE,
      providerStorageDisabled: true,
      deviceFallback: false,
      humanListeningApproved: true,
      publicReleaseApproved: true,
    },
    { headers: noStoreHeaders() }
  );
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json(
      { ok: false, code: "CROSS_ORIGIN_BLOCKED" },
      { status: 403, headers: noStoreHeaders() }
    );
  }

  const retryAfter = rateLimit(req);
  if (retryAfter) {
    return NextResponse.json(
      { ok: false, code: "VOICE_RATE_LIMITED", retryAfter },
      {
        status: 429,
        headers: noStoreHeaders({ "Retry-After": String(retryAfter) }),
      }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, code: "VOICE_NOT_CONFIGURED" },
      { status: 503, headers: noStoreHeaders() }
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { text?: unknown; language?: unknown }
    | null;
  const rawText = typeof body?.text === "string" ? body.text.trim() : "";
  const language = body?.language === "en-US" ? "en-US" : null;

  if (!rawText || rawText.length > MAX_TEXT_LENGTH || !language) {
    return NextResponse.json(
      { ok: false, code: "INVALID_VOICE_REQUEST" },
      { status: 400, headers: noStoreHeaders() }
    );
  }

  const transcript = normalizeForSpeech(rawText);
  if (!transcript) {
    return NextResponse.json(
      { ok: false, code: "EMPTY_SPOKEN_TRANSCRIPT" },
      { status: 400, headers: noStoreHeaders() }
    );
  }

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
    const responseBody = Uint8Array.from(audio);

    return new NextResponse(responseBody, {
      status: 200,
      headers: noStoreHeaders({
        "Content-Type": contentType,
        "Content-Length": String(audio.byteLength),
        "X-ZGirl-Voice-Profile": PROFILE,
        "X-ZGirl-Voice-Candidate": "true",
        "X-ZGirl-Voice-Model": generated.model,
      }),
    });
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? Number((error as { status?: unknown }).status)
        : 0;
    console.error("Z-Girl voice generation failed", {
      status: Number.isFinite(status) ? status : 0,
      profile: PROFILE,
    });

    return NextResponse.json(
      { ok: false, code: "VOICE_GENERATION_FAILED" },
      { status: status === 429 ? 429 : 502, headers: noStoreHeaders() }
    );
  }
}
