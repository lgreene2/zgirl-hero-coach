import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getHeroWithin30DayTranscript, HERO_WITHIN_30_DAY, HERO_WITHIN_30_DAY_VERSION } from "@/app/lib/hero-within-30-day";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

const STAGING_SUPABASE_URL = "https://pysoqiubmmhsbfawrrrc.supabase.co";
const STAGING_ANON_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InB5c29xaXVibW1oc2JmYXdycnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDQ5MjUsImV4cCI6MjEwMTY4MDkyNX0.HxOADq3ImuKsfxpbdbb9O_Ujlf1ENig98pTdYWHoAAE";
const WORKER_URL = `${STAGING_SUPABASE_URL}/functions/v1/zgirl-audio-candidate-worker`;
const STATUS_URL = `${STAGING_SUPABASE_URL}/rest/v1/rpc/zgirl_audio_expansion_status`;

function responseHeaders() {
  return { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" };
}

function stagingHeaders(extra?: HeadersInit) {
  return { apikey: STAGING_ANON_JWT, Authorization: `Bearer ${STAGING_ANON_JWT}`, ...(extra || {}) };
}

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === req.nextUrl.host; } catch { return false; }
}

async function status() {
  const response = await fetch(STATUS_URL, {
    method: "POST",
    cache: "no-store",
    headers: stagingHeaders({ "Content-Type": "application/json" }),
    body: "{}",
  });
  if (!response.ok) throw new Error(`expansion_status_${response.status}`);
  return (await response.json()) as {
    storedCount?: number;
    remainingCount?: number;
    activeDay?: number | null;
    nextExpansionDay?: number | null;
    expansionUnlocked?: boolean;
    representativeGate?: unknown;
  };
}

export async function GET() {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ ok: false, code: "EXPANSION_NOT_AVAILABLE_IN_PRODUCTION" }, { status: 404, headers: responseHeaders() });
  try { return NextResponse.json({ ok: true, ...(await status()) }, { headers: responseHeaders() }); }
  catch { return NextResponse.json({ ok: false, code: "EXPANSION_STATUS_UNAVAILABLE" }, { status: 503, headers: responseHeaders() }); }
}

export async function POST(req: NextRequest) {
  if (process.env.VERCEL_ENV === "production") return NextResponse.json({ ok: false, code: "EXPANSION_NOT_AVAILABLE_IN_PRODUCTION" }, { status: 404, headers: responseHeaders() });
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, code: "CROSS_ORIGIN_BLOCKED" }, { status: 403, headers: responseHeaders() });

  const current = await status();
  if (!current.expansionUnlocked) {
    return NextResponse.json({ ok: false, code: "HUMAN_LISTENING_GATE_LOCKED", ...current }, { status: 423, headers: responseHeaders() });
  }
  if (current.activeDay) return NextResponse.json({ ok: true, queued: false, alreadyRendering: true, day: current.activeDay, ...current }, { status: 202, headers: responseHeaders() });
  if (!current.nextExpansionDay) return NextResponse.json({ ok: true, complete: true, ...current }, { headers: responseHeaders() });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ ok: false, code: "AUDIO_CANDIDATE_NOT_CONFIGURED" }, { status: 503, headers: responseHeaders() });

  const item = HERO_WITHIN_30_DAY.find((candidate) => candidate.day === current.nextExpansionDay);
  if (!item) return NextResponse.json({ ok: false, code: "CANON_DAY_MISSING" }, { status: 500, headers: responseHeaders() });

  const transcript = getHeroWithin30DayTranscript(item);
  const transcriptSha256 = createHash("sha256").update(transcript, "utf8").digest("hex");
  const worker = await fetch(WORKER_URL, {
    method: "POST",
    cache: "no-store",
    headers: stagingHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      day: item.day,
      title: item.title,
      theme: item.theme,
      transcript,
      transcriptSha256,
      contentVersion: HERO_WITHIN_30_DAY_VERSION,
      providerApiKey: apiKey,
    }),
  });
  const payload = await worker.json().catch(() => null);
  if (!worker.ok) return NextResponse.json({ ok: false, code: "EXPANSION_WORKER_REJECTED", day: item.day, workerStatus: worker.status }, { status: worker.status, headers: responseHeaders() });

  return NextResponse.json({ ok: true, queued: true, day: item.day, worker: payload }, { status: 202, headers: responseHeaders() });
}
