import { credentialRpc } from "@/lib/credentials/store";
import { clearCredentialSession, credentialSessionToken } from "@/lib/credentials/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  const token = await credentialSessionToken();
  if (token) {
    try {
      await credentialRpc<boolean>("zgirl_credential_logout", { p_session_token: token });
    } catch {
      // Clear the browser session even if the backing session already expired.
    }
  }
  await clearCredentialSession();
  return Response.json({ ok: true });
}
