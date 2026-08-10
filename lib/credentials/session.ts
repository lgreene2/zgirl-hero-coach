import "server-only";

import { cookies } from "next/headers";

export const CREDENTIAL_OPS_COOKIE = "zgirl-credential-ops-v1";

export async function credentialSessionToken() {
  return (await cookies()).get(CREDENTIAL_OPS_COOKIE)?.value || null;
}

export async function setCredentialSession(token: string, expiresAt: string) {
  const expires = new Date(expiresAt);
  (await cookies()).set(CREDENTIAL_OPS_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires,
  });
}

export async function clearCredentialSession() {
  (await cookies()).set(CREDENTIAL_OPS_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });
}
