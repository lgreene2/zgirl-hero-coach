export const runtime = "nodejs";

import { NextResponse } from "next/server";

// Content-free analytics logger. Replace with your DB / PostHog / etc if desired.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Never log message text; this endpoint expects content-free events only.
    console.log("[zgirl_analytics]", JSON.stringify(body));
  } catch {
    // ignore malformed
  }
  return NextResponse.json({ ok: true });
}
