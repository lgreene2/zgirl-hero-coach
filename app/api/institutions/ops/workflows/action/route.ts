import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const AGREEMENT_TYPES = new Set(["pilot", "annual", "renewal", "expansion", "change_order", "train_the_trainer_addendum"]);
const AGREEMENT_STATUSES = new Set(["draft", "internal_review", "counterparty_review", "approved", "executed", "superseded", "expired", "void"]);
const WORKFLOW_TYPES = new Set(["initial_contract", "renewal", "expansion", "change_order", "train_the_trainer_addendum"]);
const GATES = new Set(["program_quality", "privacy_governance", "agreement_authority", "commercial_authority", "executive_release"]);
const GATE_STATUSES = new Set(["pending", "approved", "rejected", "waived"]);
const PROFILES = new Set(["general", "edu", "faith", "athlete"]);
const LEVELS = new Set(["authorized_facilitator", "authorized_lead_facilitator", "institutional_trainer"]);

function bad(error: string) { return Response.json({ ok: false, error }, { status: 400 }); }
function strings(value: unknown) { return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : []; }
function optionalDate(value: unknown) { if (value === null || value === undefined || value === "") return null; return typeof value === "string" && DATE.test(value) ? value : undefined; }
function optionalInt(value: unknown) { if (value === null || value === undefined || value === "") return null; const number = Number(value); return Number.isInteger(number) ? number : undefined; }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    const capability=action==="set_gate"?"workflow.approve":action==="release_handoff"?"workflow.release":"workflow.write";
    const scopeInstitution=action==="save_agreement"&&typeof body.institutionId==="string"&&UUID.test(body.institutionId)?body.institutionId:null;
    const {token}=await requireOperatorCapability(capability,scopeInstitution);
    if (action === "save_agreement") {
      const agreementId = typeof body.agreementId === "string" && UUID.test(body.agreementId) ? body.agreementId : null;
      const institutionId = typeof body.institutionId === "string" ? body.institutionId : "";
      const licenseId = typeof body.licenseId === "string" && UUID.test(body.licenseId) ? body.licenseId : null;
      const agreementType = typeof body.agreementType === "string" ? body.agreementType : "";
      const version = Number(body.version); const status = typeof body.status === "string" ? body.status : "";
      const reference = typeof body.reference === "string" ? body.reference.trim() : "";
      const effectiveDate = optionalDate(body.effectiveDate); const expiresAt = optionalDate(body.expiresAt);
      const scopeSummary = typeof body.scopeSummary === "string" ? body.scopeSummary.trim() : "";
      if (!UUID.test(institutionId) || !AGREEMENT_TYPES.has(agreementType) || !Number.isInteger(version) || version < 1 || version > 999 || !AGREEMENT_STATUSES.has(status) || effectiveDate === undefined || expiresAt === undefined || reference.length > 180 || scopeSummary.length > 1200) return bad("invalid_agreement");
      if (status === "executed" && (!reference || !effectiveDate)) return bad("executed_agreement_requires_reference");
      const id = await credentialRpc<string>("zgirl_institution_save_agreement", { p_session_token: token, p_agreement_id: agreementId, p_institution_id: institutionId, p_license_id: licenseId, p_agreement_type: agreementType, p_version: version, p_status: status, p_reference: reference, p_effective_date: effectiveDate, p_expires_at: expiresAt, p_scope_summary: scopeSummary });
      return Response.json({ ok: true, agreementId: id });
    }
    if (action === "create_workflow") {
      const workflowId = typeof body.workflowId === "string" && UUID.test(body.workflowId) ? body.workflowId : null;
      const licenseId = typeof body.licenseId === "string" ? body.licenseId : ""; const workflowType = typeof body.workflowType === "string" ? body.workflowType : "";
      const agreementId = typeof body.agreementId === "string" && UUID.test(body.agreementId) ? body.agreementId : null;
      const requestedEffectiveDate = optionalDate(body.requestedEffectiveDate); const requestedExpiresAt = optionalDate(body.requestedExpiresAt);
      const requestedSeatLimit = optionalInt(body.requestedSeatLimit); const requestedSiteLimit = optionalInt(body.requestedSiteLimit); const requestedTrainerLimit = optionalInt(body.requestedTrainerLimit);
      const requestedProfiles = strings(body.requestedProfiles); const requestedLevels = strings(body.requestedLevels); const targetStartDate = optionalDate(body.targetStartDate);
      const requestReference = typeof body.requestReference === "string" ? body.requestReference.trim() : "";
      if (!UUID.test(licenseId) || !WORKFLOW_TYPES.has(workflowType) || requestedEffectiveDate === undefined || requestedExpiresAt === undefined || requestedSeatLimit === undefined || requestedSiteLimit === undefined || requestedTrainerLimit === undefined || targetStartDate === undefined || requestReference.length > 180) return bad("invalid_workflow");
      if (requestedSeatLimit !== null && (requestedSeatLimit < 1 || requestedSeatLimit > 10000)) return bad("invalid_workflow_limits");
      if (requestedSiteLimit !== null && (requestedSiteLimit < 1 || requestedSiteLimit > 1000)) return bad("invalid_workflow_limits");
      if (requestedTrainerLimit !== null && (requestedTrainerLimit < 0 || requestedTrainerLimit > 1000)) return bad("invalid_workflow_limits");
      if (requestedProfiles.length && requestedProfiles.some((value) => !PROFILES.has(value))) return bad("invalid_profiles");
      if (requestedLevels.length && requestedLevels.some((value) => !LEVELS.has(value))) return bad("invalid_levels");
      const id = await credentialRpc<string>("zgirl_institution_create_workflow", { p_session_token: token, p_workflow_id: workflowId, p_license_id: licenseId, p_workflow_type: workflowType, p_agreement_id: agreementId, p_requested_effective_date: requestedEffectiveDate, p_requested_expires_at: requestedExpiresAt, p_requested_seat_limit: requestedSeatLimit, p_requested_site_limit: requestedSiteLimit, p_requested_trainer_limit: requestedTrainerLimit, p_requested_profiles: requestedProfiles.length ? requestedProfiles : null, p_requested_levels: requestedLevels.length ? requestedLevels : null, p_target_start_date: targetStartDate, p_request_reference: requestReference });
      return Response.json({ ok: true, workflowId: id });
    }
    if (action === "link_agreement") { const workflowId = typeof body.workflowId === "string" ? body.workflowId : ""; const agreementId = typeof body.agreementId === "string" ? body.agreementId : ""; if (!UUID.test(workflowId) || !UUID.test(agreementId)) return bad("invalid_workflow_agreement"); await credentialRpc<boolean>("zgirl_institution_link_workflow_agreement", { p_session_token: token, p_workflow_id: workflowId, p_agreement_id: agreementId }); return Response.json({ ok: true }); }
    if (action === "build_evidence") { const workflowId = typeof body.workflowId === "string" ? body.workflowId : ""; if (!UUID.test(workflowId)) return bad("workflow_not_found"); const packetId = await credentialRpc<string>("zgirl_institution_build_evidence_packet", { p_session_token: token, p_workflow_id: workflowId }); return Response.json({ ok: true, packetId }); }
    if (action === "set_gate") { const workflowId = typeof body.workflowId === "string" ? body.workflowId : ""; const gateKey = typeof body.gateKey === "string" ? body.gateKey : ""; const status = typeof body.status === "string" ? body.status : ""; const decidedBy = typeof body.decidedBy === "string" ? body.decidedBy.trim() : ""; const decisionReference = typeof body.decisionReference === "string" ? body.decisionReference.trim() : ""; if (!UUID.test(workflowId) || !GATES.has(gateKey) || !GATE_STATUSES.has(status) || decidedBy.length > 120 || decisionReference.length > 180 || (status !== "pending" && decidedBy.length < 2)) return bad("invalid_approval_gate"); await credentialRpc<boolean>("zgirl_institution_set_approval_gate", { p_session_token: token, p_workflow_id: workflowId, p_gate_key: gateKey, p_status: status, p_decided_by: decidedBy, p_decision_reference: decisionReference }); return Response.json({ ok: true }); }
    if (action === "finalize_workflow") { const workflowId = typeof body.workflowId === "string" ? body.workflowId : ""; const implementationOwner = typeof body.implementationOwner === "string" ? body.implementationOwner.trim() : ""; const handoffReference = typeof body.handoffReference === "string" ? body.handoffReference.trim() : ""; if (!UUID.test(workflowId) || implementationOwner.length < 2 || implementationOwner.length > 120 || handoffReference.length > 180) return bad("invalid_handoff"); const handoffId = await credentialRpc<string>("zgirl_institution_finalize_workflow", { p_session_token: token, p_workflow_id: workflowId, p_implementation_owner: implementationOwner, p_handoff_reference: handoffReference }); return Response.json({ ok: true, handoffId }); }
    if (action === "release_handoff") { const handoffId = typeof body.handoffId === "string" ? body.handoffId : ""; const releaseReference = typeof body.releaseReference === "string" ? body.releaseReference.trim() : ""; if (!UUID.test(handoffId) || releaseReference.length < 3 || releaseReference.length > 180) return bad("invalid_handoff"); await credentialRpc<boolean>("zgirl_institution_release_handoff", { p_session_token: token, p_handoff_id: handoffId, p_release_reference: releaseReference }); return Response.json({ ok: true }); }
    if (action === "run_automation") { const automation = await credentialRpc<Record<string, unknown>>("zgirl_institution_workflow_run_automation", { p_session_token: token }); return Response.json({ ok: true, automation }); }
    return bad("unsupported_action");
  } catch (error) { const response = credentialErrorResponse(error); if (response.status === 401) await clearCredentialSession(); return response; }
}
