import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession, setCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RotateResult = { token: string; expiresAt: string; sessionId: string };

export async function POST(request: Request) {
  try {
    const {token}=await requireOperatorCapability("identity.manage");
    const body = (await request.json()) as { newAccessCode?: unknown };
    const newAccessCode = typeof body.newAccessCode === "string" ? body.newAccessCode.trim() : "";
    if (newAccessCode.length < 24 || newAccessCode.length > 200) return Response.json({ ok: false, error: "access_code_too_short" }, { status: 400 });
    const result = await credentialRpc<RotateResult>("zgirl_credential_rotate_access", {p_session_token: token,p_new_access_code: newAccessCode});
    await setCredentialSession(result.token, result.expiresAt);
    return Response.json({ ok: true, expiresAt: result.expiresAt });
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
