import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { credentialSessionToken, clearCredentialSession } from "@/lib/credentials/session";
import { pushGlsPilotImplementation, GlsPilotBridgeError } from "@/lib/gls/pilot-bridge";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let workspacePrepared = false;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const glsOpportunityId = stringValue(body.glsOpportunityId);
    if (!UUID.test(glsOpportunityId)) {
      return Response.json({ ok: false, error: "invalid_gls_opportunity" }, { status: 400 });
    }

    const token = await credentialSessionToken();
    if (!token) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const handoff = await credentialRpc<Record<string, unknown>>("zgirl_prepare_gls_pilot_workspace", {
      p_session_token: token,
      p_gls_opportunity_id: glsOpportunityId,
    });
    workspacePrepared = true;

    const pilotId = stringValue(handoff.pilotId);
    if (!UUID.test(pilotId)) {
      return Response.json(
        { ok: false, error: "prepared_workspace_missing_pilot_id", workspacePrepared: true, retrySafe: true },
        { status: 502 },
      );
    }

    const dashboard = await credentialRpc<Record<string, unknown>>("zgirl_pilot_dashboard", {
      p_session_token: token,
      p_pilot_id: pilotId,
      p_institution_id: null,
    });
    const pilot = (dashboard.pilot || {}) as Record<string, unknown>;
    const engagementId = stringValue(pilot.gls_engagement_id);

    const implementation = await pushGlsPilotImplementation({
      action: "sync_implementation",
      opportunityId: glsOpportunityId,
      engagementId: engagementId || null,
      zGirlPilotId: pilotId,
      zGirlPilotCode: stringValue(pilot.pilot_code) || stringValue(handoff.pilotCode),
      zGirlStage: stringValue(pilot.stage),
      implementationStatus: stringValue(pilot.completion_status),
      readinessStatus: stringValue(pilot.readiness_status),
      renewalStatus: stringValue(pilot.renewal_status),
      expansionStatus: stringValue(pilot.expansion_status),
      nextAction: stringValue(pilot.next_action),
      contractingEntity: stringValue(pilot.contracting_entity_name),
      engagementNature: stringValue(pilot.engagement_nature),
    });

    return Response.json(
      {
        ok: true,
        handoff,
        implementation,
        governance: {
          sourceOfTruth: "GLS",
          implementationSourceOfTruth: "Z-Girl",
          privateReflectionImported: false,
          liveActivated: false,
          nextGate: "Z-Girl operational readiness and human release",
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    if (error instanceof GlsPilotBridgeError) {
      return Response.json(
        {
          ok: false,
          error: error.code,
          workspacePrepared,
          retrySafe: workspacePrepared,
          note: workspacePrepared
            ? "The Z-Girl workspace exists, but the GLS implementation pointer was not synchronized. Retry this governed action or use the existing GLS sync control; live activation remains blocked."
            : undefined,
        },
        { status: error.status },
      );
    }
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
