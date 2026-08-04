import { NextResponse } from "next/server";
import { authorizedReviewLocale } from "@/app/review/auth";
import {
  REVIEW_CANDIDATE_ID,
  REVIEW_LANGUAGES,
} from "@/app/review/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorizedLocale = await authorizedReviewLocale();
  if (!authorizedLocale) {
    return NextResponse.json({ error: "Review authorization required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "";
  const day = Number(searchParams.get("day"));
  const mix = searchParams.get("mix");
  const validLocale = REVIEW_LANGUAGES.some((language) => language.locale === locale);

  if (!validLocale || !Number.isInteger(day) || day < 1 || day > 7 || !["voice", "calm"].includes(mix || "")) {
    return NextResponse.json({ error: "Invalid review-audio request." }, { status: 400 });
  }
  if (locale !== authorizedLocale) {
    return NextResponse.json({ error: "This session is not assigned to that language." }, { status: 403 });
  }

  const baseUrl = process.env.ZGIRL_REVIEW_ASSET_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Candidate audio has not been connected to this workspace." },
      { status: 404 }
    );
  }

  const assetUrl = `${baseUrl}/${encodeURIComponent(REVIEW_CANDIDATE_ID)}/${encodeURIComponent(locale)}/day-${day}-${mix}.mp3`;
  const headers = new Headers();
  const bearer = process.env.ZGIRL_REVIEW_ASSET_BEARER_TOKEN;
  if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);

  const upstream = await fetch(assetUrl, { headers, cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "This candidate track is not available." }, { status: 404 });
  }

  const responseHeaders = new Headers({
    "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  });
  for (const name of ["accept-ranges", "content-length", "content-range"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
