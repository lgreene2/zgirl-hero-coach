import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  REVIEW_CANDIDATE_ID,
  REVIEW_LANGUAGES,
  type ReviewLocale,
} from "@/app/review/config";

export const REVIEW_COOKIE = "zgirl-review-session-v2";
const HASH_PATTERN = /^[a-f0-9]{64}$/;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
function accessHashes(): Partial<Record<ReviewLocale, string>> {
  try {
    const parsed = JSON.parse(process.env.ZGIRL_REVIEW_ACCESS_HASHES_JSON || "{}") as Record<string, unknown>;
    return Object.fromEntries(
      REVIEW_LANGUAGES.flatMap(({ locale }) => {
        const value = parsed[locale];
        return typeof value === "string" && HASH_PATTERN.test(value) ? [[locale, value]] : [];
      })
    );
  } catch {
    return {};
  }
}

export function reviewIsConfigured(locale?: ReviewLocale) {
  if (!process.env.ZGIRL_REVIEW_SESSION_SECRET) return false;
  const hashes = accessHashes();
  return locale ? Boolean(hashes[locale]) : Object.keys(hashes).length > 0;
}

export function validateReviewAccessCode(locale: ReviewLocale, code: string) {
  const expected = accessHashes()[locale];
  const supplied = createHash("sha256").update(code.trim(), "utf8").digest("hex");
  return Boolean(expected && safeEqual(supplied, expected));
}

export function reviewSessionToken(locale: ReviewLocale) {
  const secret = process.env.ZGIRL_REVIEW_SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update(`${REVIEW_CANDIDATE_ID}:${locale}:authorized`)
    .digest("base64url");
}

export async function authorizedReviewLocale(): Promise<ReviewLocale | null> {
  const supplied = (await cookies()).get(REVIEW_COOKIE)?.value;
  if (!supplied) return null;
  for (const { locale } of REVIEW_LANGUAGES) {
    if (!reviewIsConfigured(locale)) continue;
    const expected = reviewSessionToken(locale);
    if (expected && safeEqual(supplied, expected)) return locale;
  }
  return null;
}
