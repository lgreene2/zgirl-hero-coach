import { credentialRpc, credentialErrorResponse, CredentialStoreError } from "@/lib/credentials/store";
import { credentialSessionToken, clearCredentialSession } from "@/lib/credentials/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const token = await credentialSessionToken();
    if (!token) throw new CredentialStoreError("unauthorized", 401);

    const queue = await credentialRpc<Record<string, unknown>>("zgirl_gls_pilot_candidates", {
      p_session_token: token,
    });

    return Response.json(
      { ok: true, queue },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
