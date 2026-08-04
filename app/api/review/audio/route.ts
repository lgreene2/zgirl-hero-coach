import { NextResponse } from "next/server";
import { authorizedReviewLocale } from "@/app/review/auth";
import {
  REVIEW_CANDIDATE_ID,
  REVIEW_LANGUAGES,
} from "@/app/review/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function privateError(error: string, status: number) {
  return NextResponse.json(
    { error },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}

export async function GET(request: Request) {
  const authorizedLocale = await authorizedReviewLocale();
  if (!authorizedLocale) {
    return privateError("Review authorization required.", 401);
  }

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "";
  const day = Number(searchParams.get("day"));
  const mix = searchParams.get("mix");
  const validLocale = REVIEW_LANGUAGES.some(
    (language) => language.locale === locale,
  );

  if (
    !validLocale ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 7 ||
    !["voice", "calm"].includes(mix || "")
  ) {
    return privateError("Invalid review-audio request.", 400);
  }
  if (locale !== authorizedLocale) {
    return privateError(
      "This session is not assigned to that language.",
      403,
    );
  }

  const baseUrl = process.env.ZGIRL_REVIEW_ASSET_BASE_URL?.replace(/\/$/, "");
  const bearer = process.env.ZGIRL_REVIEW_ASSET_BEARER_TOKEN?.trim();
  if (!baseUrl || !bearer) {
    return privateError(
      "Candidate audio has not been connected to this workspace.",
      404,
    );
  }

  const assetUrl = `${baseUrl}/${encodeURIComponent(REVIEW_CANDIDATE_ID)}/${encodeURIComponent(locale)}/day-${day}-${mix}.mp3`;
  const headers = new Headers({ Authorization: `Bearer ${bearer}` });
  const range = request.headers.get("range");
  if (range) headers.set("Range", range);

  let upstream: Response;
  try {
    upstream = await fetch(assetUrl, {
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return privateError("This candidate track is not available.", 404);
  }

  if (!upstream.ok || !upstream.body) {
    await upstream.body?.cancel();
    return privateError("This candidate track is not available.", 404);
  }

  const contentType = upstream.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("audio/")) {
    await upstream.body.cancel();
    return privateError("This candidate track is not available.", 404);
  }

  const responseHeaders = new Headers({
    "Content-Type": contentType,
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Disposition": "inline",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
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
