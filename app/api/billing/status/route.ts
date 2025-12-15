import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // No billing yet — safe default for public preview/production
  return NextResponse.json({ active: false });
}
