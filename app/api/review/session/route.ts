import { NextResponse } from "next/server";
import {
  REVIEW_COOKIE,
  reviewIsConfigured,
  reviewSessionToken,
  validateReviewAccessCode,
} from "@/app/review/auth";
import { isReviewLocale } from "@/app/review/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!reviewIsConfigured()) {
    return NextResponse.json(
      { error: "The protected review workspace has not been configured." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { code?: unknown; locale?: unknown };
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!isReviewLocale(body.locale) || !reviewIsConfigured(body.locale) || !validateReviewAccessCode(body.locale, code)) {
    return NextResponse.json({ error: "The access code is not valid." }, { status: 401 });
  }

  const token = reviewSessionToken(body.locale);
  if (!token) {
    return NextResponse.json({ error: "Review access is unavailable." }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true, locale: body.locale });
  response.cookies.set(REVIEW_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(REVIEW_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
