import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getHeroWithin30DayTranscript,
  HERO_WITHIN_30_DAY,
  HERO_WITHIN_30_DAY_VERSION,
} from "@/app/lib/hero-within-30-day";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

const STAGING_SUPABASE_URL = "https://pysoqiubmmhsbfawrrrc.supabase.co";
const STAGING_ANON_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5c29xaXVibW1oc2JmYXdycnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDQ5MjUsImV4cCI6MjEwMTY4MDkyNX0.HxOADq3ImuKsfxpbdbb9O_Ujlf1ENig98pTdYWHoAAE";
const WORKER_URL = `${STAGING_SUPABASE_URL}/functions/v1/zgirl-audio-candidate-worker`;

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

function dayFrom(value: unknown) {
  const day = Number(value);
  return Number.isInteger(day) && day >= 1 && day <= 30 ? day : null;
}

async function callWorker(path: string, init?: RequestInit) {
  return fetch(`${WORKER_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: STAGING_ANON_JWT,
      Authorization: `Bearer ${STAGING_ANON_JWT}`,
      ...(init?.headers || {}),
    },
  });
}

export async function GET(req: NextRequest) {
  if (!enabled()) {
    return NextResponse.json(
      { ok: false, code: "AUDIO_REVIEW_NOT_AVAILABLE_IN_PRODUCTION" },
      { status: 404, headers: noStoreHeaders() }
    );
  }

  const day = dayFrom(req.nextUrl.searchParams.get("day"));
  if (!day) {
    return NextResponse.json(
      { ok: false, code: "INVALID_AUDIO_CANDIDATE_DAY" },
      { status: 400, headers: noStoreHeaders() }
    );
  }

  const wantsAudio = req.nextUrl.searchParams.get("audio") === "1";
  const worker = await callWorker(`?day=${day}${wantsAudio ? "&audio=1" : ""}`);
  const body = await worker.arrayBuffer();
  const headers = noStoreHeaders({
    "Content-Type": worker.headers.get("Content-Type") || (wantsAudio ? "audio/wav" : "application/json"),
    ...(worker.headers.get("Content-Length")
      ? { "Content-Length": worker.headers.get("Content-Length")! }
      : {}),
    ...(worker.headers.get("X-ZGirl-Audio-Checksum-SHA256")
      ? { "X-ZGirl-Audio-Checksum-SHA256": worker.headers.get("X-ZGirl-Audio-Checksum-SHA256")! }
      : {}),
    ...(worker.headers.get("X-ZGirl-Audio-Persistent-Review")
      ? { "X-ZGirl-Audio-Persistent-Review": worker.headers.get("X-ZGirl-Audio-Persistent-Review")! }
      : {}),
  });

  return new NextResponse(body, { status: worker.status, headers });
}

export async function POST(req: NextRequest) {
  if (!enabled()) {
    return NextResponse.json(
      { ok: false, code: "AUDIO_REVIEW_NOT_AVAILABLE_IN_PRODUCTION" },
      { status: 404, headers: noStoreHeaders() }
    );
  }
  if (!sameOrigin(req)) {
    return NextResponse.json(
      { ok: false, code: "CROSS_ORIGIN_BLOCKED" },
      { status: 403, headers: noStoreHeaders() }
    );
  }

  const body = (await req.json().catch(() => null)) as { day?: unknown } | null;
  const day = dayFrom(body?.day);
  const item = day ? HERO_WITHIN_30_DAY.find((candidate) => candidate.day === day) : undefined;
  if (!item) {
    return NextResponse.json(
      { ok: false, code: "INVALID_AUDIO_CANDIDATE_DAY" },
      { status: 400, headers: noStoreHeaders() }
    );
  }

  const providerApiKey = process.env.GEMINI_API_KEY?.trim();
  if (!providerApiKey) {
    return NextResponse.json(
      { ok: false, code: "AUDIO_CANDIDATE_NOT_CONFIGURED" },
      { status: 503, headers: noStoreHeaders() }
    );
  }

  const transcript = getHeroWithin30DayTranscript(item);
  const transcriptSha256 = createHash("sha256").update(transcript, "utf8").digest("hex");

  const worker = await callWorker("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      day: item.day,
      title: item.title,
      theme: item.theme,
      transcript,
      transcriptSha256,
      contentVersion: HERO_WITHIN_30_DAY_VERSION,
      providerApiKey,
    }),
  });

  const responseText = await worker.text();
  return new NextResponse(responseText, {
    status: worker.status,
    headers: noStoreHeaders({ "Content-Type": worker.headers.get("Content-Type") || "application/json" }),
  });
}
