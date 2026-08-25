import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getHeroWithin30DayTranscript, HERO_WITHIN_30_DAY, HERO_WITHIN_30_DAY_VERSION } from "@/app/lib/hero-within-30-day";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

const DAY = 30;
const STAGING_SUPABASE_URL = "https://pysoqiubmmhsbfawrrrc.supabase.co";
const STAGING_ANON_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InB5c29xaXVibW1oc2JmYXdycnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMDQ5MjUsImV4cCI6MjEwMTY4MDkyNX0.HxOADq3ImuKsfxpbdbb9O_Ujlf1ENig98pTdYWHoAAE";
const WORKER_URL = `${STAGING_SUPABASE_URL}/functions/v1/zgirl-audio-candidate-worker`;

function headers() {
  return { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow" };
}

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ ok: false, code: "PREVIEW_ONLY" }, { status: 404, headers: headers() });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ ok: false, code: "AUDIO_CANDIDATE_NOT_CONFIGURED" }, { status: 503, headers: headers() });

  const item = HERO_WITHIN_30_DAY.find((candidate) => candidate.day === DAY);
  if (!item) return NextResponse.json({ ok: false, code: "CANON_DAY_MISSING" }, { status: 500, headers: headers() });

  const transcript = getHeroWithin30DayTranscript(item);
  const transcriptSha256 = createHash("sha256").update(transcript, "utf8").digest("hex");

  const worker = await fetch(WORKER_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: STAGING_ANON_JWT,
      Authorization: `Bearer ${STAGING_ANON_JWT}`,
      "Content-Type": "application/json",
    },
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
  return NextResponse.json({ ok: worker.ok, day: DAY, workerStatus: worker.status, worker: payload }, { status: worker.ok ? 202 : worker.status, headers: headers() });
}
