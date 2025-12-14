export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  if (process.env.ZGIRL_DEV_PLUS === "1") {
    return NextResponse.json({ isPlus: true });
  }
  const c = cookies();
  const isPlus = c.get("zgirl_plus")?.value === "1";
  return NextResponse.json({ isPlus });
}
