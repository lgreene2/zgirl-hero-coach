import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REQUIREMENTS = new Set(["orientation", "curriculum", "knowledge_assessment", "critical_items", "practicum", "conduct_ack", "local_safeguarding", "lead_evidence", "trainer_teachback", "trainer_calibration", "institutional_trainer_license"]);
const REQUIREMENT_STATUSES = new Set(["pending", "in_progress", "pass", "fail", "not_required"]);
const LEVELS = new Set(["authorized_facilitator", "authorized_lead_facilitator", "institutional_trainer"]);
const CREDENTIAL_STATUSES = new Set(["active", "conditional", "suspended", "revoked", "lapsed"]);
const REASONS = new Set(["quality", "conduct", "privacy", "safety", "scope", "administrative", "renewal", "other"]);
const NOTIFICATION_STATUSES = new Set(["prepared", "sent", "dismissed"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function bad(error: string) { return Response.json({ ok: false, error }, { status: 400 }); }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    const capability=action==="issue"?"credential.issue":action==="change_status"||action==="renew"?"credential.status":"credential.write";
    const {token}=await requireOperatorCapability(capability);

    if (action === "set_requirement") {
      const candidateId = typeof body.candidateId === "string" ? body.candidateId : "";
      const requirementKey = typeof body.requirementKey === "string" ? body.requirementKey : "";
      const status = typeof body.status === "string" ? body.status : "pending";
      const score = body.score === null || body.score === "" || body.score === undefined ? null : Number(body.score);
      if (!UUID_PATTERN.test(candidateId) || !REQUIREMENTS.has(requirementKey) || !REQUIREMENT_STATUSES.has(status)) return bad("invalid_requirement");
      if (score !== null && (!Number.isFinite(score) || score < 0 || score > 100)) return bad("invalid_score");
      const requirementId = await credentialRpc<string>("zgirl_credential_set_requirement", { p_session_token: token, p_candidate_id: candidateId, p_requirement_key: requirementKey, p_status: status, p_score: score });
      return Response.json({ ok: true, requirementId });
    }

    if (action === "issue") {
      const candidateId = typeof body.candidateId === "string" ? body.candidateId : "";
      const credentialLevel = typeof body.credentialLevel === "string" ? body.credentialLevel : "";
      const scope = typeof body.scope === "string" ? body.scope.trim() : "";
      const expiresAt = typeof body.expiresAt === "string" ? body.expiresAt : "";
      if (!UUID_PATTERN.test(candidateId) || !LEVELS.has(credentialLevel) || scope.length < 10 || scope.length > 500 || !DATE_PATTERN.test(expiresAt)) return bad("invalid_issue_request");
      const credential = await credentialRpc<Record<string, unknown>>("zgirl_credential_issue", { p_session_token: token, p_candidate_id: candidateId, p_credential_level: credentialLevel, p_scope: scope, p_expires_at: expiresAt });
      return Response.json({ ok: true, credential });
    }

    if (action === "change_status") {
      const credentialId = typeof body.credentialId === "string" ? body.credentialId : "";
      const status = typeof body.status === "string" ? body.status : "";
      const reason = typeof body.reasonCategory === "string" ? body.reasonCategory : "administrative";
      const publicVerificationEnabled = body.publicVerificationEnabled !== false;
      if (!UUID_PATTERN.test(credentialId) || !CREDENTIAL_STATUSES.has(status) || !REASONS.has(reason)) return bad("invalid_status_request");
      await credentialRpc<boolean>("zgirl_credential_change_status", { p_session_token: token, p_credential_id: credentialId, p_status: status, p_reason_category: reason, p_public_verification_enabled: publicVerificationEnabled });
      return Response.json({ ok: true });
    }

    if (action === "renew") {
      const credentialId = typeof body.credentialId === "string" ? body.credentialId : "";
      const expiresAt = typeof body.expiresAt === "string" ? body.expiresAt : "";
      if (!UUID_PATTERN.test(credentialId) || !DATE_PATTERN.test(expiresAt)) return bad("invalid_renewal_request");
      await credentialRpc<boolean>("zgirl_credential_renew", { p_session_token: token, p_credential_id: credentialId, p_new_expires_at: expiresAt });
      return Response.json({ ok: true });
    }

    if (action === "mark_notification") {
      const notificationId = typeof body.notificationId === "string" ? body.notificationId : "";
      const status = typeof body.status === "string" ? body.status : "";
      const deliveryReference = typeof body.deliveryReference === "string" ? body.deliveryReference.trim() : "";
      if (!UUID_PATTERN.test(notificationId) || !NOTIFICATION_STATUSES.has(status) || deliveryReference.length > 240) return bad("invalid_notification_request");
      await credentialRpc<boolean>("zgirl_credential_mark_notification", { p_session_token: token, p_notification_id: notificationId, p_status: status, p_delivery_reference: deliveryReference || null });
      return Response.json({ ok: true });
    }

    if (action === "run_automation") {
      const automation = await credentialRpc<Record<string, unknown>>("zgirl_credential_run_automation", { p_session_token: token });
      return Response.json({ ok: true, automation });
    }

    return bad("unsupported_action");
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
