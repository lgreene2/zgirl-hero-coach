import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") || "";
    const institutionId = (url.searchParams.get("institutionId") || "").trim();
    const reviewId = (url.searchParams.get("reviewId") || "").trim();

    if (mode === "tenantDirectory") {
      const { token } = await requireOperatorCapability("portfolio.read");
      const directory = await credentialRpc<Record<string, unknown>>("zgirl_tenant_directory", { p_session_token: token });
      return Response.json({ ok: true, directory }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    }

    if (mode === "accessReviewPacket") {
      if (!UUID.test(institutionId) || !UUID.test(reviewId)) return Response.json({ ok: false, error: "invalid_access_review" }, { status: 400 });
      const { token } = await requireOperatorCapability("license.read", institutionId);
      const packet = await credentialRpc<Record<string, unknown>>("zgirl_tenant_access_review_packet", { p_session_token: token, p_review_id: reviewId });
      return Response.json({ ok: true, packet }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    }

    if (institutionId) {
      if (!UUID.test(institutionId)) return Response.json({ ok: false, error: "invalid_institution" }, { status: 400 });
      const { token } = await requireOperatorCapability("license.read", institutionId);
      const dashboard = await credentialRpc<Record<string, unknown>>("zgirl_tenant_dashboard", { p_session_token: token, p_institution_id: institutionId });
      return Response.json({ ok: true, dashboard }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    }

    const { token } = await requireOperatorCapability("license.read");
    const dashboard = await credentialRpc<Record<string, unknown>>("zgirl_institution_dashboard", { p_session_token: token });
    return Response.json({ ok: true, dashboard }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
