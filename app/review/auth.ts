import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { REVIEW_CANDIDATE_ID } from "@/app/review/config";

export const REVIEW_COOKIE = "zgirl-review-session-v1";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
export function reviewIsConfigured() {
  return Boolean(process.env.ZGIRL_REVIEW_ACCESS_CODE && process.env.ZGIRL_REVIEW_SESSION_SECRET);
}

export function validateReviewAccessCode(code: string) {
  const expected = process.env.ZGIRL_REVIEW_ACCESS_CODE;
  return Boolean(expected && safeEqual(code, expected));
}

export function reviewSessionToken() {
  const secret = process.env.ZGIRL_REVIEW_SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update(`${REVIEW_CANDIDATE_ID}:authorized`)
    .digest("base64url");
}

export async function isReviewAuthorized() {
  const expected = reviewSessionToken();
  if (!expected) return false;
  const supplied = (await cookies()).get(REVIEW_COOKIE)?.value;
  return Boolean(supplied && safeEqual(supplied, expected));
}
