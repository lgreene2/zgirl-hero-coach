import { credentialErrorResponse } from "@/lib/credentials/store";
import { findPublicCredential, normalizeCredentialId } from "@/lib/credentials/public";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const credentialId = normalizeCredentialId(url.searchParams.get("id") || "");

  try {
    const credential = await findPublicCredential(credentialId);
    return Response.json({ ok: true, found: Boolean(credential), credential: credential || null }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    return credentialErrorResponse(error);
  }
}
