import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PATHWAYS = new Set(["general", "edu", "faith", "athlete", "institutional"]);
const STATUSES = new Set(["candidate", "eligible", "training", "assessment", "practicum", "decision", "authorized", "declined", "withdrawn"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  try {
    const {token}=await requireOperatorCapability("credential.read");
    const id = new URL(request.url).searchParams.get("id") || "";
    if (!UUID_PATTERN.test(id)) return Response.json({ ok: false, error: "invalid_candidate_id" }, { status: 400 });
    const candidate = await credentialRpc<Record<string, unknown>>("zgirl_credential_get_candidate", { p_session_token: token, p_candidate_id: id });
    return Response.json({ ok: true, candidate });
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}

export async function POST(request: Request) {
  try {
    const {token}=await requireOperatorCapability("credential.write");
    const body = (await request.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" && body.id ? body.id : null;
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const organization = typeof body.organization === "string" ? body.organization.trim() : "";
    const pathway = typeof body.pathway === "string" ? body.pathway : "general";
    const status = typeof body.status === "string" ? body.status : "candidate";
    const trainingVersion = typeof body.trainingVersion === "string" ? body.trainingVersion.trim() : "2.7";

    if (id && !UUID_PATTERN.test(id)) return Response.json({ ok: false, error: "invalid_candidate_id" }, { status: 400 });
    if (fullName.length < 2 || fullName.length > 120 || email.length > 254 || !email.includes("@")) return Response.json({ ok: false, error: "invalid_candidate" }, { status: 400 });
    if (organization.length > 180 || !PATHWAYS.has(pathway) || !STATUSES.has(status) || trainingVersion.length > 30) return Response.json({ ok: false, error: "invalid_candidate" }, { status: 400 });

    const candidateId = await credentialRpc<string>("zgirl_credential_save_candidate", {p_session_token: token,p_candidate_id: id,p_full_name: fullName,p_email: email,p_organization: organization,p_pathway: pathway,p_status: status,p_training_version: trainingVersion});
    return Response.json({ ok: true, candidateId });
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
