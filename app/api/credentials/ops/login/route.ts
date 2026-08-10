import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { setCredentialSession } from "@/lib/credentials/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type LoginResult = { token: string; expiresAt: string; sessionId: string };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessCode?: unknown };
    const accessCode = typeof body.accessCode === "string" ? body.accessCode.trim() : "";
    if (accessCode.length < 24 || accessCode.length > 200) {
      return Response.json({ ok: false, error: "invalid_access_code" }, { status: 401 });
    }

    const result = await credentialRpc<LoginResult>("zgirl_credential_login", { p_access_code: accessCode });
    await setCredentialSession(result.token, result.expiresAt);
    return Response.json({ ok: true, expiresAt: result.expiresAt });
  } catch (error) {
    return credentialErrorResponse(error);
  }
}
