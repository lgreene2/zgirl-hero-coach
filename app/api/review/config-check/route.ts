import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const LOCALES = ["es-US", "fr-FR", "pt-BR", "de-DE"] as const;

export async function GET() {
  const hashesRaw = process.env.ZGIRL_REVIEW_ACCESS_HASHES_JSON || "";
  const sessionSecret = process.env.ZGIRL_REVIEW_SESSION_SECRET || "";
  const assetBaseUrl = process.env.ZGIRL_REVIEW_ASSET_BASE_URL || "";
  const bearerToken = process.env.ZGIRL_REVIEW_ASSET_BEARER_TOKEN || "";

  let hashesJsonValid = false;
  let validLocales: string[] = [];
  let parsedType = "missing";

  try {
    const parsed = JSON.parse(hashesRaw) as unknown;
    parsedType = Array.isArray(parsed) ? "array" : typeof parsed;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const record = parsed as Record<string, unknown>;
      validLocales = LOCALES.filter((locale) => {
        const value = record[locale];
        return typeof value === "string" && HASH_PATTERN.test(value);
      });
      hashesJsonValid = validLocales.length === LOCALES.length;
    }
  } catch {
    parsedType = "invalid-json";
  }

  let assetBaseUrlValid = false;
  try {
    const url = new URL(assetBaseUrl);
    assetBaseUrlValid =
      url.protocol === "https:" &&
      url.pathname.replace(/\/+$/, "") === "/api/review-assets";
  } catch {
    assetBaseUrlValid = false;
  }

  const result = {
    configured:
      hashesJsonValid &&
      sessionSecret.length >= 32 &&
      assetBaseUrlValid &&
      bearerToken.length >= 32,
    accessHashes: {
      present: hashesRaw.length > 0,
      length: hashesRaw.length,
      parsedType,
      allFourLocalesValid: hashesJsonValid,
      validLocales,
    },
    sessionSecret: {
      present: sessionSecret.length > 0,
      length: sessionSecret.length,
      minimumLengthMet: sessionSecret.length >= 32,
    },
    assetBaseUrl: {
      present: assetBaseUrl.length > 0,
      length: assetBaseUrl.length,
      valid: assetBaseUrlValid,
    },
    bearerToken: {
      present: bearerToken.length > 0,
      length: bearerToken.length,
      minimumLengthMet: bearerToken.length >= 32,
    },
  };

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
