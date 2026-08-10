import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CREDENTIAL_PATTERN = /^ZG-(AF|ALF|IT)-\d{4}-[A-F0-9]{10}$/i;

type VerifiedCredential = {
  credential_id: string;
  holder_name: string;
  organization: string | null;
  credential_level: string;
  scope: string;
  training_version: string;
  status: string;
  issue_date: string;
  expires_at: string;
  valid_now: boolean;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const credentialId = (url.searchParams.get("id") || "").trim().toUpperCase();

  if (!CREDENTIAL_PATTERN.test(credentialId)) {
    return Response.json({ ok: true, found: false });
  }

  try {
    const rows = await credentialRpc<VerifiedCredential[]>("zgirl_verify_credential", { p_credential_code: credentialId });
    const credential = Array.isArray(rows) ? rows[0] : undefined;
    return Response.json({ ok: true, found: Boolean(credential), credential: credential || null }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    return credentialErrorResponse(error);
  }
}
