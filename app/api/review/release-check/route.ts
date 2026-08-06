import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  reviewIsConfigured,
  reviewSessionToken,
  validateReviewAccessCode,
} from "@/app/review/auth";
import {
  REVIEW_CANDIDATE_ID,
  REVIEW_LANGUAGES,
} from "@/app/review/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NONCE_HASH = "48af576c61ff84cc7a7c1469610a8da44d25c6923904d4ab0c76e87373a84936";

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!safeEqual(sha256(token), NONCE_HASH)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const accessHashesRaw = process.env.ZGIRL_REVIEW_ACCESS_HASHES_JSON || "";
  const sessionSecret = process.env.ZGIRL_REVIEW_SESSION_SECRET || "";
  const baseUrl = (process.env.ZGIRL_REVIEW_ASSET_BASE_URL || "").replace(/\/+$/, "");
  const bearerToken = process.env.ZGIRL_REVIEW_ASSET_BEARER_TOKEN || "";
  const locales = REVIEW_LANGUAGES.map(({ locale }) => locale);

  const sessionTokens = locales.map((locale) => reviewSessionToken(locale));
  const sessionsConfigured = locales.every((locale) => reviewIsConfigured(locale));
  const sessionsUnique =
    sessionTokens.every(Boolean) && new Set(sessionTokens).size === locales.length;
  const invalidCodesRejected = locales.every(
    (locale) => !validateReviewAccessCode(locale, `release-check-invalid-${locale}`)
  );

  const tracks = locales.flatMap((locale) =>
    Array.from({ length: 7 }, (_, index) => index + 1).flatMap((day) =>
      (["voice", "calm"] as const).map((mix) => ({ locale, day, mix }))
    )
  );

  const results = await Promise.all(
    tracks.map(async ({ locale, day, mix }) => {
      const url = `${baseUrl}/${REVIEW_CANDIDATE_ID}/${locale}/day-${day}-${mix}.mp3`;
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            Range: "bytes=0-0",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(20_000),
        });
        const contentType = response.headers.get("content-type") || "";
        const contentRange = response.headers.get("content-range") || "";
        return {
          ok:
            response.status === 206 &&
            contentType.startsWith("audio/") &&
            /^bytes 0-0\/\d+$/.test(contentRange),
          status: response.status,
        };
      } catch {
        return { ok: false, status: 0 };
      }
    })
  );

  const passedTracks = results.filter(({ ok }) => ok).length;
  const statusCounts = Object.fromEntries(
    [...new Set(results.map(({ status }) => status))].map((status) => [
      String(status),
      results.filter((result) => result.status === status).length,
    ])
  );

  return NextResponse.json(
    {
      configured: sessionsConfigured,
      sessionsUnique,
      invalidCodesRejected,
      fingerprints: {
        accessHashes: sha256(accessHashesRaw),
        sessionSecret: sha256(sessionSecret),
        bearerToken: sha256(bearerToken),
      },
      assetBaseUrlExact:
        baseUrl === "https://zgirl-review-asset-gateway.vercel.app/api/review-assets",
      protectedTracks: {
        passed: passedTracks,
        total: tracks.length,
        statusCounts,
      },
      releaseCheckPassed:
        sessionsConfigured &&
        sessionsUnique &&
        invalidCodesRejected &&
        passedTracks === tracks.length,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    }
  );
}
