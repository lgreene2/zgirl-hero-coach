import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

const STAGING_SUPABASE_URL = "https://pysoqiubmmhsbfawrrrc.supabase.co";
const STAGING_PUBLISHABLE_KEY = "sb_publishable_l7Xnjeb-yym4OaVmGbcnYQ_g8i9UIsX";
const WORKER_URL = `${STAGING_SUPABASE_URL}/functions/v1/zgirl-audio-expansion-worker`;

function headers(extra: HeadersInit = {}) {
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

function workerHeaders(extra: HeadersInit = {}) {
  return { apikey: STAGING_PUBLISHABLE_KEY, ...extra };
}

async function workerFetch(path: string, init: RequestInit = {}) {
  return fetch(`${WORKER_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: workerHeaders(init.headers),
  });
}

export async function GET(req: NextRequest) {
  if (!enabled()) return NextResponse.json({ ok: false, code: "AUDIO_EXPANSION_NOT_AVAILABLE_IN_PRODUCTION" }, { status: 404, headers: headers() });

  const day = Number(req.nextUrl.searchParams.get("day"));
  const audio = req.nextUrl.searchParams.get("audio") === "1";
  const path = Number.isInteger(day) && day >= 1 && day <= 30
    ? `?day=${day}${audio ? "&audio=1" : ""}`
    : "?summary=1";

  const response = await workerFetch(path);
  if (audio && response.ok) {
    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: response.status,
      headers: headers({
        "Content-Type": response.headers.get("content-type") || "audio/wav",
        "Content-Length": String(body.byteLength),
        "X-ZGirl-Audio-Candidate": "true",
        "X-ZGirl-Audio-Release": "not-approved",
        "X-ZGirl-Audio-Checksum-SHA256": response.headers.get("x-zgirl-audio-checksum-sha256") || "",
      }),
    });
  }

  const text = await response.text();
  let payload: unknown = null;
  try { payload = JSON.parse(text); } catch { payload = { ok: false, code: "WORKER_INVALID_JSON" }; }
  return NextResponse.json(payload, { status: response.status, headers: headers() });
}

export async function POST(req: NextRequest) {
  if (!enabled()) return NextResponse.json({ ok: false, code: "AUDIO_EXPANSION_NOT_AVAILABLE_IN_PRODUCTION" }, { status: 404, headers: headers() });
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, code: "CROSS_ORIGIN_BLOCKED" }, { status: 403, headers: headers() });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ ok: false, code: "AUDIO_CANDIDATE_NOT_CONFIGURED" }, { status: 503, headers: headers() });

  const body = (await req.json().catch(() => null)) as { day?: unknown; forceRetry?: unknown } | null;
  const day = Number(body?.day);
  const requestBody: Record<string, unknown> = { providerApiKey: apiKey };
  if (Number.isInteger(day) && day >= 1 && day <= 30) requestBody.day = day;
  if (body?.forceRetry === true) requestBody.forceRetry = true;

  const response = await workerFetch("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const text = await response.text();
  let payload: unknown = null;
  try { payload = JSON.parse(text); } catch { payload = { ok: false, code: "WORKER_INVALID_JSON" }; }
  return NextResponse.json(payload, { status: response.status, headers: headers() });
}
