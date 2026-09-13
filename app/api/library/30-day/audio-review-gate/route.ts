import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

const REVIEW_DAYS = [1, 8, 15, 22, 30] as const;
const ACTIVE_STATES = new Set(["QUEUED", "ROUTING", "RENDERING", "RETRYING", "FALLBACK", "QA"]);
const STAGING_SUPABASE_URL = "https://pysoqiubmmhsbfawrrrc.supabase.co";
const STAGING_PUBLISHABLE_KEY = "sb_publishable_l7Xnjeb-yym4OaVmGbcnYQ_g8i9UIsX";
const WORKER_URL = `${STAGING_SUPABASE_URL}/functions/v1/zgirl-audio-candidate-worker`;
const ATTEMPT_STATUS_URL = `${STAGING_SUPABASE_URL}/rest/v1/rpc/zgirl_audio_review_attempt_status`;
const HUMAN_GATE_URL = `${STAGING_SUPABASE_URL}/rest/v1/rpc/zgirl_audio_human_review_gate_status`;

type AttemptStatus = {
  day?: number;
  jobId?: string | null;
  jobStatus?: string | null;
  attemptNumber?: number | null;
  attemptStatus?: string | null;
  errorCode?: string | null;
  failureClass?: "QUOTA_EXHAUSTED" | "PROVIDER_BUSY" | "GENERATION_FAILED" | null;
  completedAt?: string | null;
  jobUpdatedAt?: string | null;
};

type HumanReviewDay = {
  day?: number;
  assetId?: string;
  ready?: boolean;
  approved?: boolean;
  decision?: string;
  reviewStatus?: string;
  reviewedAt?: string | null;
};

type HumanGate = {
  reviewDays?: HumanReviewDay[];
  readyCount?: number;
  approvedCount?: number;
  allReady?: boolean;
  allApproved?: boolean;
  expansionUnlocked?: boolean;
};

type WorkerStatus = {
  ok?: boolean;
  day?: number;
  ready?: boolean;
  persistentReviewCandidate?: boolean;
  profile?: string;
  contentVersion?: string;
  releaseApproved?: boolean;
  asset?: {
    asset_id?: string;
    state?: string;
    storage_bucket?: string;
    storage_path?: string;
    checksum_sha256?: string;
    rights_status?: string;
    updated_at?: string;
  } | null;
  job?: {
    job_id?: string;
    status?: string;
    selected_provider_id?: string;
    selected_model?: string;
    updated_at?: string;
  } | null;
  attempt?: AttemptStatus | null;
};

function headers() {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
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

function supabaseHeaders(extra?: HeadersInit) {
  return {
    apikey: STAGING_PUBLISHABLE_KEY,
    ...extra,
  };
}

async function workerFetch(path: string, init?: RequestInit) {
  return fetch(`${WORKER_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: supabaseHeaders(init?.headers),
  });
}

async function attemptSummary(): Promise<Record<string, AttemptStatus>> {
  try {
    const response = await fetch(ATTEMPT_STATUS_URL, {
      method: "POST",
      cache: "no-store",
      headers: supabaseHeaders({ "Content-Type": "application/json" }),
      body: "{}",
    });
    if (!response.ok) return {};
    const payload = (await response.json().catch(() => null)) as Record<string, AttemptStatus> | null;
    return payload && typeof payload === "object" ? payload : {};
  } catch {
    return {};
  }
}

async function humanGateSummary(): Promise<HumanGate> {
  try {
    const response = await fetch(HUMAN_GATE_URL, {
      method: "POST",
      cache: "no-store",
      headers: supabaseHeaders({ "Content-Type": "application/json" }),
      body: "{}",
    });
    if (!response.ok) return {};
    const payload = (await response.json().catch(() => null)) as HumanGate | null;
    return payload && typeof payload === "object" ? payload : {};
  } catch {
    return {};
  }
}

async function statusFor(day: number, attempts: Record<string, AttemptStatus>): Promise<WorkerStatus & { statusError?: string }> {
  try {
    const response = await workerFetch(`?day=${day}`);
    const text = await response.text();
    if (!response.ok) {
      let code = `worker_${response.status}`;
      try { code = (JSON.parse(text) as { code?: string }).code || code; } catch {}
      return { day, ready: false, statusError: code, attempt: attempts[String(day)] || null };
    }
    try {
      return { ...(JSON.parse(text) as WorkerStatus), attempt: attempts[String(day)] || null };
    } catch {
      return { day, ready: false, statusError: "worker_invalid_json", attempt: attempts[String(day)] || null };
    }
  } catch {
    return { day, ready: false, statusError: "worker_unreachable", attempt: attempts[String(day)] || null };
  }
}

async function summary() {
  const [attempts, humanGate] = await Promise.all([attemptSummary(), humanGateSummary()]);
  const statuses: Record<string, WorkerStatus & { statusError?: string }> = {};
  for (const day of REVIEW_DAYS) statuses[String(day)] = await statusFor(day, attempts);

  const readyCount = REVIEW_DAYS.filter((day) => statuses[String(day)]?.ready).length;
  const activeDay = REVIEW_DAYS.find((day) => ACTIVE_STATES.has(statuses[String(day)]?.job?.status || "")) || null;
  const quotaBlockedDay = REVIEW_DAYS.find((day) => statuses[String(day)]?.attempt?.failureClass === "QUOTA_EXHAUSTED" && !statuses[String(day)]?.ready) || null;
  const failedDay = REVIEW_DAYS.find((day) => ["FAILED", "REJECTED"].includes(statuses[String(day)]?.job?.status || "") && !statuses[String(day)]?.ready) || null;

  return {
    ok: true,
    reviewDays: REVIEW_DAYS,
    readyCount,
    activeDay,
    quotaBlockedDay,
    failedDay,
    statuses,
    humanGate,
  };
}

export async function GET() {
  if (!enabled()) return NextResponse.json({ ok: false, code: "AUDIO_REVIEW_NOT_AVAILABLE_IN_PRODUCTION" }, { status: 404, headers: headers() });
  return NextResponse.json(await summary(), { headers: headers() });
}

export async function POST(req: NextRequest) {
  if (!enabled()) return NextResponse.json({ ok: false, code: "AUDIO_REVIEW_NOT_AVAILABLE_IN_PRODUCTION" }, { status: 404, headers: headers() });
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, code: "CROSS_ORIGIN_BLOCKED" }, { status: 403, headers: headers() });

  const body = (await req.json().catch(() => null)) as { action?: string } | null;
  const action = body?.action || "prepare-next";
  if (!new Set(["prepare-next", "retry-blocked"]).has(action)) {
    return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400, headers: headers() });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ ok: false, code: "AUDIO_CANDIDATE_NOT_CONFIGURED" }, { status: 503, headers: headers() });

  const current = await summary();
  if (current.readyCount === REVIEW_DAYS.length) {
    return NextResponse.json({ ...current, queued: false, complete: true }, { headers: headers() });
  }
  if (current.activeDay) {
    return NextResponse.json({ ...current, queued: false, alreadyRendering: true, day: current.activeDay }, { status: 202, headers: headers() });
  }

  if (current.quotaBlockedDay && action !== "retry-blocked") {
    return NextResponse.json({
      ...current,
      queued: false,
      code: "PROVIDER_QUOTA_EXHAUSTED",
      day: current.quotaBlockedDay,
      message: "Google Gemini quota is exhausted for the current voice project. Existing stored candidates remain available; automatic retries are paused to prevent wasted requests.",
    }, { status: 429, headers: headers() });
  }

  const nextDay = current.quotaBlockedDay && action === "retry-blocked"
    ? current.quotaBlockedDay
    : REVIEW_DAYS.find((day) => !current.statuses[String(day)]?.ready);

  if (!nextDay) return NextResponse.json({ ...current, queued: false, complete: true }, { headers: headers() });

  const worker = await workerFetch("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day: nextDay, providerApiKey: apiKey }),
  });

  const text = await worker.text();
  if (!worker.ok) {
    let code = `worker_${worker.status}`;
    try { code = (JSON.parse(text) as { code?: string }).code || code; } catch {}
    return NextResponse.json({ ok: false, code, day: nextDay }, { status: worker.status, headers: headers() });
  }

  let workerPayload: unknown = null;
  try { workerPayload = JSON.parse(text); } catch { workerPayload = { raw: text.slice(0, 200) }; }
  return NextResponse.json({ ok: true, queued: true, day: nextDay, worker: workerPayload, retryingQuotaBlockedTrack: action === "retry-blocked" }, { status: 202, headers: headers() });
}
