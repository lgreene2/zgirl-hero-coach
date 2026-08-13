import "server-only";

const DEFAULT_SUPABASE_URL = "https://pysoqiubmmhsbfawrrrc.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_l7Xnjeb-yym4OaVmGbcnYQ_g8i9UIsX";

const SUPABASE_URL = (process.env.ZGIRL_CREDENTIAL_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
const SUPABASE_KEY = process.env.ZGIRL_CREDENTIAL_SUPABASE_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY;

export class CredentialStoreError extends Error {
  code: string;
  status: number;

  constructor(code: string, status = 400) {
    super(code);
    this.name = "CredentialStoreError";
    this.code = code;
    this.status = status;
  }
}

function normalizeRpcError(raw: string, status: number) {
  const known = [
    "invalid_access_code", "access_code_too_short", "unauthorized", "candidate_not_found", "credential_not_found",
    "invalid_expiration", "invalid_credential_level", "institution_not_found", "invalid_institution", "invalid_institution_type",
    "invalid_institution_status", "site_not_found", "invalid_site", "license_not_found", "invalid_license", "invalid_license_term",
    "invalid_license_limits", "invalid_profiles", "invalid_levels", "invalid_agreement_status", "license_not_allocatable",
    "invalid_license_site", "invalid_seat_role", "trainer_limit_reached", "seat_limit_reached", "site_limit_reached",
    "allocation_not_found", "credential_candidate_mismatch", "credential_level_mismatch", "credential_level_not_allowed",
    "invalid_license_renewal", "invalid_roster", "agreement_required_for_active_license", "renewal_agreement_required",
    "seat_limit_below_usage", "site_limit_below_usage", "trainer_limit_below_usage",
    "invalid_agreement", "invalid_agreement_license", "invalid_agreement_type", "invalid_agreement_version", "invalid_agreement_term",
    "executed_agreement_requires_reference", "invalid_scope_summary", "agreement_not_found", "invalid_workflow", "invalid_workflow_type",
    "invalid_workflow_agreement", "invalid_workflow_limits", "invalid_workflow_term", "workflow_not_found", "workflow_locked",
    "workflow_not_ready", "workflow_already_open", "license_not_releasable", "executed_agreement_required", "evidence_packet_required",
    "approval_gates_incomplete", "invalid_approval_gate", "invalid_approval_status", "approval_actor_required", "approval_gate_not_found",
    "implementation_owner_required", "invalid_handoff", "handoff_not_found", "handoff_not_ready", "handoff_reference_required",
    "invalid_pipeline_license", "invalid_opportunity_type", "invalid_contract_path", "existing_license_required", "invalid_pipeline_stage",
    "invalid_priority", "invalid_pipeline_value", "invalid_currency", "invalid_probability", "invalid_pipeline_summary", "closed_reason_required",
    "opportunity_locked", "opportunity_not_found", "invalid_partner_contact", "partner_contact_not_found", "invalid_partner_activity",
    "invalid_proposal", "proposal_not_found", "invalid_followup", "followup_not_found", "opportunity_already_handed_off",
    "accepted_proposal_required", "invalid_initial_contract_proposal", "initial_contract_requires_draft_license",
    "invalid_portfolio_health", "invalid_portfolio_priority", "invalid_expansion_readiness", "invalid_portfolio_summary", "invalid_portfolio_snapshot",
  ];

  const missingRequirement = raw.match(/missing_required_pass:([a-z_]+)/i);
  if (missingRequirement) return new CredentialStoreError(`missing_required_pass:${missingRequirement[1]}`, 409);

  const matched = known.find((code) => raw.includes(code));
  if (matched) {
    const conflict = matched.endsWith("_reached") || matched.endsWith("_below_usage") || [
      "agreement_required_for_active_license", "renewal_agreement_required", "workflow_locked", "workflow_not_ready",
      "workflow_already_open", "license_not_releasable", "executed_agreement_required", "evidence_packet_required",
      "approval_gates_incomplete", "handoff_not_ready", "opportunity_locked", "opportunity_already_handed_off",
      "accepted_proposal_required", "existing_license_required", "initial_contract_requires_draft_license",
    ].includes(matched);
    const mappedStatus = matched === "unauthorized" || matched === "invalid_access_code" ? 401 : conflict ? 409 : 400;
    return new CredentialStoreError(matched, mappedStatus);
  }

  if (status === 401 || status === 403) return new CredentialStoreError("unauthorized", 401);
  return new CredentialStoreError("credential_store_request_failed", status >= 500 ? 502 : 400);
}

export async function credentialRpc<T>(functionName: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload), cache: "no-store",
  });
  if (!response.ok) { const raw = await response.text(); throw normalizeRpcError(raw, response.status); }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function credentialErrorResponse(error: unknown) {
  if (error instanceof CredentialStoreError) return Response.json({ ok: false, error: error.code }, { status: error.status });
  if (typeof error === "object" && error !== null && "code" in error && "status" in error) {
    const code = typeof error.code === "string" ? error.code : "credential_store_request_failed";
    const status = typeof error.status === "number" ? error.status : 500;
    return Response.json({ ok: false, error: code }, { status });
  }
  return Response.json({ ok: false, error: "credential_store_request_failed" }, { status: 500 });
}
