import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const STAGING_SUPABASE_URL = "https://pysoqiubmmhsbfawrrrc.supabase.co";
const STAGING_PUBLISHABLE_KEY = "sb_publishable_l7Xnjeb-yym4OaVmGbcnYQ_g8i9UIsX";
const WORKER_URL = `${STAGING_SUPABASE_URL}/functions/v1/zgirl-30day-whole-library-qa`;

function responseHeaders(extra: HeadersInit = {}) {
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

async function workerFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("apikey", STAGING_PUBLISHABLE_KEY);
  return fetch(`${WORKER_URL}${path}`, { ...init, headers, cache: "no-store" });
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
  if (!enabled()) {
    return NextResponse.json({ ok: false, code: "MASTER_REVIEW_NOT_AVAILABLE_IN_PRODUCTION" }, { status: 404, headers: responseHeaders() });
  }

  const day = Number(req.nextUrl.searchParams.get("day"));
  const audio = req.nextUrl.searchParams.get("audio") === "1";
  const query = Number.isInteger(day) && day >= 1 && day <= 30
    ? `?day=${day}${audio ? "&audio=1" : ""}`
    : "";

  const response = await workerFetch(query);
  if (audio && response.ok) {
    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders({
        "Content-Type": response.headers.get("content-type") || "audio/wav",
        "Content-Length": String(body.byteLength),
        "X-ZGirl-Audio-Checksum-SHA256": response.headers.get("x-zgirl-audio-checksum-sha256") || "",
        "X-ZGirl-Audio-Release": "candidate-not-public",
      }),
    });
  }

  const payload = await parsePayload(response);
  return NextResponse.json(payload, { status: response.status, headers: responseHeaders() });
}

export async function POST(req: NextRequest) {
  if (!enabled()) {
    return NextResponse.json({ ok: false, code: "MASTER_REVIEW_NOT_AVAILABLE_IN_PRODUCTION" }, { status: 404, headers: responseHeaders() });
  }
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, code: "CROSS_ORIGIN_BLOCKED" }, { status: 403, headers: responseHeaders() });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400, headers: responseHeaders() });
  }

  const response = await workerFetch("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await parsePayload(response);
  return NextResponse.json(payload, { status: response.status, headers: responseHeaders() });
}
