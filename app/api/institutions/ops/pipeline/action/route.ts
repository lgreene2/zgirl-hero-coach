import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INSTITUTION_TYPES = new Set(["school", "district", "university", "congregation", "athletic_team", "youth_org", "municipal", "nonprofit", "other"]);
const OPPORTUNITY_TYPES = new Set(["pilot", "annual", "multisite", "train_the_trainer", "other"]);
const CONTRACT_PATHS = new Set(["initial_contract", "expansion", "train_the_trainer_addendum"]);
const STAGES = new Set(["identified", "outreach", "discovery", "fit_review", "qualified", "proposal", "negotiation", "agreement", "approval", "converted", "nurture", "closed_lost"]);
const PRIORITIES = new Set(["low", "normal", "high", "urgent"]);
const DECISION_ROLES = new Set(["champion", "decision_maker", "procurement", "legal", "implementation", "finance", "other"]);
const CONTACT_STATUSES = new Set(["active", "inactive"]);
const ACTIVITY_TYPES = new Set(["email", "call", "meeting", "note", "follow_up", "proposal", "decision", "system"]);
const DIRECTIONS = new Set(["inbound", "outbound", "internal"]);
const PROPOSAL_TYPES = new Set(["pilot", "annual", "multisite", "train_the_trainer", "expansion"]);
const PROPOSAL_STATUSES = new Set(["draft", "internal_review", "sent", "revised", "accepted", "declined", "expired", "withdrawn"]);
const PROFILES = new Set(["general", "edu", "faith", "athlete"]);
const LEVELS = new Set(["authorized_facilitator", "authorized_lead_facilitator", "institutional_trainer"]);

function bad(error: string) { return Response.json({ ok: false, error }, { status: 400 }); }
function text(value: unknown, max = 1200) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function optionalUuid(value: unknown) { return typeof value === "string" && UUID.test(value) ? value : null; }
function requiredUuid(value: unknown) { return typeof value === "string" && UUID.test(value) ? value : ""; }
function optionalDate(value: unknown) { if (value === null || value === undefined || value === "") return null; return typeof value === "string" && DATE.test(value) ? value : undefined; }
function optionalTimestamp(value: unknown) { if (value === null || value === undefined || value === "") return null; if (typeof value !== "string") return undefined; const d = new Date(value); return Number.isNaN(d.getTime()) ? undefined : d.toISOString(); }
function optionalInt(value: unknown) { if (value === null || value === undefined || value === "") return null; const n = Number(value); return Number.isInteger(n) ? n : undefined; }
function strings(value: unknown) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function cents(value: unknown) { if (value === null || value === undefined || value === "") return null; const n = Number(value); return Number.isInteger(n) ? n : undefined; }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = text(body.action, 80);
    const capability=action==="handoff_to_workflow"?"pipeline.handoff":"pipeline.write";
    const scopeInstitution=action==="save_opportunity"?optionalUuid(body.institutionId):null;
    const {token}=await requireOperatorCapability(capability,scopeInstitution);

    if (action === "create_prospect_opportunity") {
      const name = text(body.institutionName, 180);
      const institutionType = text(body.institutionType, 40);
      const contactName = text(body.contactName, 160);
      const contactEmail = text(body.contactEmail, 254).toLowerCase();
      if (name.length < 2 || !INSTITUTION_TYPES.has(institutionType) || (contactEmail && !EMAIL.test(contactEmail))) return bad("invalid_institution");
      const institutionId = await credentialRpc<string>("zgirl_institution_save", {
        p_session_token: token, p_institution_id: null, p_name: name, p_institution_type: institutionType, p_status: "prospect",
        p_contact_name: contactName, p_contact_email: contactEmail,
      });
      const opportunityType = text(body.opportunityType, 40);
      const contractPath = text(body.contractPath, 50);
      if (!OPPORTUNITY_TYPES.has(opportunityType) || contractPath !== "initial_contract") return bad("invalid_opportunity_type");
      const opportunityId = await credentialRpc<string>("zgirl_partner_save_opportunity", {
        p_session_token: token, p_opportunity_id: null, p_institution_id: institutionId, p_existing_license_id: null,
        p_opportunity_type: opportunityType, p_contract_path: contractPath, p_stage: "identified", p_priority: PRIORITIES.has(text(body.priority, 20)) ? text(body.priority, 20) : "normal",
        p_owner_name: text(body.ownerName, 120), p_source: text(body.source, 160), p_strategic_need: text(body.strategicNeed), p_use_case: text(body.useCase),
        p_estimated_value_cents: cents(body.estimatedValueCents), p_currency: "USD", p_probability_percent: optionalInt(body.probabilityPercent) ?? 10,
        p_target_decision_date: optionalDate(body.targetDecisionDate), p_target_start_date: optionalDate(body.targetStartDate), p_closed_reason: "",
      });
      if (contactName) {
        await credentialRpc<string>("zgirl_partner_save_contact", {
          p_session_token: token, p_contact_id: null, p_opportunity_id: opportunityId, p_full_name: contactName,
          p_role_title: text(body.contactRoleTitle, 160), p_email: contactEmail, p_phone: text(body.contactPhone, 60), p_decision_role: "champion", p_status: "active",
        });
      }
      return Response.json({ ok: true, institutionId, opportunityId });
    }

    if (action === "save_opportunity") {
      const opportunityId = optionalUuid(body.opportunityId);
      const institutionId = requiredUuid(body.institutionId);
      const existingLicenseId = optionalUuid(body.existingLicenseId);
      const opportunityType = text(body.opportunityType, 40);
      const contractPath = text(body.contractPath, 50);
      const stage = text(body.stage, 40);
      const priority = text(body.priority, 20);
      const estimatedValueCents = cents(body.estimatedValueCents);
      const probability = optionalInt(body.probabilityPercent);
      const targetDecisionDate = optionalDate(body.targetDecisionDate);
      const targetStartDate = optionalDate(body.targetStartDate);
      if (!institutionId || !OPPORTUNITY_TYPES.has(opportunityType) || !CONTRACT_PATHS.has(contractPath) || !STAGES.has(stage) || !PRIORITIES.has(priority) || estimatedValueCents === undefined || probability === undefined || probability === null || probability < 0 || probability > 100 || targetDecisionDate === undefined || targetStartDate === undefined) return bad("invalid_pipeline_stage");
      const id = await credentialRpc<string>("zgirl_partner_save_opportunity", {
        p_session_token: token, p_opportunity_id: opportunityId, p_institution_id: institutionId, p_existing_license_id: existingLicenseId,
        p_opportunity_type: opportunityType, p_contract_path: contractPath, p_stage: stage, p_priority: priority,
        p_owner_name: text(body.ownerName, 120), p_source: text(body.source, 160), p_strategic_need: text(body.strategicNeed), p_use_case: text(body.useCase),
        p_estimated_value_cents: estimatedValueCents, p_currency: "USD", p_probability_percent: probability,
        p_target_decision_date: targetDecisionDate, p_target_start_date: targetStartDate, p_closed_reason: text(body.closedReason, 600),
      });
      return Response.json({ ok: true, opportunityId: id });
    }

    if (action === "save_contact") {
      const opportunityId = requiredUuid(body.opportunityId); const contactId = optionalUuid(body.contactId);
      const fullName = text(body.fullName, 160); const email = text(body.email, 254).toLowerCase();
      const decisionRole = text(body.decisionRole, 30); const status = text(body.status, 20);
      if (!opportunityId || fullName.length < 2 || (email && !EMAIL.test(email)) || !DECISION_ROLES.has(decisionRole) || !CONTACT_STATUSES.has(status)) return bad("invalid_partner_contact");
      const id = await credentialRpc<string>("zgirl_partner_save_contact", {p_session_token: token, p_contact_id: contactId, p_opportunity_id: opportunityId, p_full_name: fullName,p_role_title: text(body.roleTitle, 160), p_email: email, p_phone: text(body.phone, 60), p_decision_role: decisionRole, p_status: status});
      return Response.json({ ok: true, contactId: id });
    }

    if (action === "log_activity") {
      const opportunityId = requiredUuid(body.opportunityId); const activityType = text(body.activityType, 30); const direction = text(body.direction, 20);
      const summary = text(body.summary, 1600); const occurredAt = optionalTimestamp(body.occurredAt);
      if (!opportunityId || !ACTIVITY_TYPES.has(activityType) || !DIRECTIONS.has(direction) || summary.length < 2 || occurredAt === undefined) return bad("invalid_partner_activity");
      const id = await credentialRpc<string>("zgirl_partner_log_activity", {p_session_token: token, p_opportunity_id: opportunityId, p_activity_type: activityType, p_direction: direction,p_summary: summary, p_actor_name: text(body.actorName, 120), p_occurred_at: occurredAt});
      return Response.json({ ok: true, activityId: id });
    }

    if (action === "save_proposal") {
      const opportunityId = requiredUuid(body.opportunityId); const proposalId = optionalUuid(body.proposalId);
      const proposalType = text(body.proposalType, 40); const status = text(body.status, 30); const version = optionalInt(body.version);
      const proposedValueCents = cents(body.proposedValueCents); const sentAt = optionalTimestamp(body.sentAt); const expiresAt = optionalDate(body.expiresAt);
      if (!opportunityId || !PROPOSAL_TYPES.has(proposalType) || !PROPOSAL_STATUSES.has(status) || version === undefined || version === null || version < 1 || proposedValueCents === undefined || sentAt === undefined || expiresAt === undefined || text(body.title, 220).length < 2) return bad("invalid_proposal");
      const id = await credentialRpc<string>("zgirl_partner_save_proposal", {p_session_token: token, p_proposal_id: proposalId, p_opportunity_id: opportunityId, p_proposal_type: proposalType, p_version: version,p_status: status, p_title: text(body.title, 220), p_scope_summary: text(body.scopeSummary, 2400), p_proposed_value_cents: proposedValueCents,p_currency: "USD", p_reference: text(body.reference, 180), p_sent_at: sentAt, p_expires_at: expiresAt});
      return Response.json({ ok: true, proposalId: id });
    }

    if (action === "save_followup") {
      const opportunityId = requiredUuid(body.opportunityId); const followupId = optionalUuid(body.followupId); const dueAt = optionalTimestamp(body.dueAt); const priority = text(body.priority, 20);
      if (!opportunityId || dueAt === undefined || dueAt === null || !PRIORITIES.has(priority) || text(body.actionText, 500).length < 2) return bad("invalid_followup");
      const id = await credentialRpc<string>("zgirl_partner_save_followup", {p_session_token: token, p_followup_id: followupId, p_opportunity_id: opportunityId, p_action_text: text(body.actionText, 500),p_due_at: dueAt, p_priority: priority, p_owner_name: text(body.ownerName, 120)});
      return Response.json({ ok: true, followupId: id });
    }

    if (action === "complete_followup") {
      const followupId = requiredUuid(body.followupId); if (!followupId) return bad("followup_not_found");
      await credentialRpc<boolean>("zgirl_partner_complete_followup", { p_session_token: token, p_followup_id: followupId, p_completion_note: text(body.completionNote, 600) });
      return Response.json({ ok: true });
    }

    if (action === "handoff_to_workflow") {
      const opportunityId = requiredUuid(body.opportunityId); const proposalId = requiredUuid(body.proposalId);
      const effectiveDate = optionalDate(body.effectiveDate); const expiresAt = optionalDate(body.expiresAt);
      const seatLimit = optionalInt(body.seatLimit); const siteLimit = optionalInt(body.siteLimit); const trainerLimit = optionalInt(body.trainerLimit);
      const profiles = strings(body.profiles); const levels = strings(body.levels);
      if (!opportunityId || !proposalId || effectiveDate === undefined || effectiveDate === null || expiresAt === undefined || expiresAt === null || seatLimit === undefined || seatLimit === null || siteLimit === undefined || siteLimit === null || trainerLimit === undefined || trainerLimit === null || seatLimit < 1 || siteLimit < 1 || trainerLimit < 0 || profiles.length === 0 || profiles.some((value) => !PROFILES.has(value)) || levels.length === 0 || levels.some((value) => !LEVELS.has(value))) return bad("invalid_license_limits");
      const handoff = await credentialRpc<Record<string, unknown>>("zgirl_partner_handoff_to_workflow", {p_session_token: token, p_opportunity_id: opportunityId, p_proposal_id: proposalId, p_effective_date: effectiveDate, p_expires_at: expiresAt,p_seat_limit: seatLimit, p_site_limit: siteLimit, p_trainer_limit: trainerLimit, p_profiles: profiles, p_levels: levels});
      return Response.json({ ok: true, handoff });
    }

    return bad("unsupported_action");
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
