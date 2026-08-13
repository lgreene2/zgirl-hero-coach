import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const {token}=await requireOperatorCapability("credential.read");
    const dashboard = await credentialRpc<Record<string, unknown>>("zgirl_credential_dashboard", { p_session_token: token });
    return Response.json({ ok: true, dashboard });
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
