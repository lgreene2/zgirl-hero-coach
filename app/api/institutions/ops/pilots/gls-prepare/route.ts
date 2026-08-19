import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { credentialSessionToken, clearCredentialSession } from "@/lib/credentials/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const glsOpportunityId = typeof body.glsOpportunityId === "string" ? body.glsOpportunityId.trim() : "";
    if (!UUID.test(glsOpportunityId)) {
      return Response.json({ ok: false, error: "invalid_gls_opportunity" }, { status: 400 });
    }

    const token = await credentialSessionToken();
    if (!token) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const handoff = await credentialRpc<Record<string, unknown>>("zgirl_prepare_gls_pilot_workspace", {
      p_session_token: token,
      p_gls_opportunity_id: glsOpportunityId,
    });

    return Response.json(
      {
        ok: true,
        handoff,
        governance: {
          sourceOfTruth: "GLS",
          privateReflectionImported: false,
          liveActivated: false,
          nextGate: "Z-Girl operational readiness and human release",
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
