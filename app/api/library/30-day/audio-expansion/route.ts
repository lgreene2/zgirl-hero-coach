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

async function parsePayload(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { ok: false, code: "WORKER_INVALID_JSON" };
  }
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

  const payload = await parsePayload(response);
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

  let response = await workerFetch("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  let payload = await parsePayload(response);

  // A FREE_TIER_ROUTE status is historical evidence from the last provider
  // attempt, not proof that the credential on this new deployment is still
  // free-tier. After billing/key alignment, the first explicit user queue
  // action gets exactly one same-day retest with forceRetry=true. This sends
  // the current runtime key to the worker without changing model, voice, or
  // fallback policy. If Google still reports free-tier routing, the worker
  // records that new evidence and the factory remains fail-closed.
  if (
    response.status === 409 &&
    payload.code === "RUNTIME_KEY_STILL_FREE_TIER" &&
    body?.forceRetry !== true
  ) {
    const failedDay = Number(payload.day);
    if (Number.isInteger(failedDay) && failedDay >= 1 && failedDay <= 30) {
      response = await workerFetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerApiKey: apiKey, day: failedDay, forceRetry: true }),
      });
      payload = await parsePayload(response);
      if (response.ok) payload = { ...payload, paidTierRouteRetest: true };
    }
  }

  // Gemini 3.1 TTS preview can occasionally surface HTTP 400 "invalid argument"
  // even when the same request schema and locked transcript are valid. If the
  // worker explicitly reports that exact provider error on the unfinished day,
  // make one same-model/same-voice retry. Do not broaden this to other failures.
  if (
    response.status === 409 &&
    payload.code === "TRACK_REQUIRES_EXPLICIT_RETRY" &&
    body?.forceRetry !== true
  ) {
    const failedDay = Number(payload.day);
    const summary = payload.summary as { statuses?: Record<string, { errorCode?: string | null }> } | undefined;
    const errorCode = summary?.statuses?.[String(failedDay)]?.errorCode;

    if (Number.isInteger(failedDay) && failedDay >= 1 && failedDay <= 30 && errorCode === "PROVIDER_INVALID_ARGUMENT") {
      response = await workerFetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerApiKey: apiKey, day: failedDay, forceRetry: true }),
      });
      payload = await parsePayload(response);
      if (response.ok) payload = { ...payload, transientProviderRetry: true };
    }
  }

  return NextResponse.json(payload, { status: response.status, headers: headers() });
}
