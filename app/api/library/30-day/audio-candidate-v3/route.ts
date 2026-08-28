import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

const REVIEW_DAYS = new Set([1, 8, 15, 22, 30]);
const STAGING_SUPABASE_URL = "https://pysoqiubmmhsbfawrrrc.supabase.co";
const STAGING_PUBLISHABLE_KEY = "sb_publishable_l7Xnjeb-yym4OaVmGbcnYQ_g8i9UIsX";
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
  return Number.isInteger(day) && REVIEW_DAYS.has(day) ? day : null;
}

async function callWorker(path: string, init?: RequestInit) {
  return fetch(`${WORKER_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: STAGING_PUBLISHABLE_KEY,
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
      { ok: false, code: "INVALID_AUDIO_REVIEW_DAY" },
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
    ...(worker.headers.get("X-ZGirl-Audio-Candidate")
      ? { "X-ZGirl-Audio-Candidate": worker.headers.get("X-ZGirl-Audio-Candidate")! }
      : {}),
    ...(worker.headers.get("X-ZGirl-Audio-Release")
      ? { "X-ZGirl-Audio-Release": worker.headers.get("X-ZGirl-Audio-Release")! }
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
  if (!day) {
    return NextResponse.json(
      { ok: false, code: "INVALID_AUDIO_REVIEW_DAY" },
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

  const worker = await callWorker("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day, providerApiKey }),
  });

  const responseText = await worker.text();
  return new NextResponse(responseText, {
    status: worker.status,
    headers: noStoreHeaders({ "Content-Type": worker.headers.get("Content-Type") || "application/json" }),
  });
}
