import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireEntityCapability, requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const INSTITUTION_TYPES = new Set(["school","district","university","congregation","athletic_team","youth_org","municipal","nonprofit","other"]);
const INSTITUTION_STATUSES = new Set(["prospect","pilot","active","paused","closed"]);
const SITE_TYPES = new Set(["school","campus","congregation","team","department","program","branch","other"]);
const SITE_STATUSES = new Set(["active","paused","closed"]);
const LICENSE_TYPES = new Set(["pilot","annual","multisite","train_the_trainer"]);
const LICENSE_STATUSES = new Set(["draft","pending","active","conditional","suspended","lapsed","closed"]);
const AGREEMENT_STATUSES = new Set(["draft","review","executed","expired","closed"]);
const PROFILES = new Set(["general","edu","faith","athlete"]);
const LEVELS = new Set(["authorized_facilitator","authorized_lead_facilitator","institutional_trainer"]);
const SEAT_ROLES = new Set(["facilitator","lead_facilitator","institutional_trainer"]);

function bad(error: string) { return Response.json({ ok: false, error }, { status: 400 }); }
function strings(value: unknown) { return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []; }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "save_institution") {
      const id = typeof body.institutionId === "string" && UUID.test(body.institutionId) ? body.institutionId : null;
      const name = typeof body.name === "string" ? body.name.trim() : ""; const type = typeof body.institutionType === "string" ? body.institutionType : ""; const status = typeof body.status === "string" ? body.status : ""; const contactName = typeof body.contactName === "string" ? body.contactName.trim() : ""; const contactEmail = typeof body.contactEmail === "string" ? body.contactEmail.trim() : "";
      if (name.length < 2 || name.length > 180 || !INSTITUTION_TYPES.has(type) || !INSTITUTION_STATUSES.has(status) || contactName.length > 120 || contactEmail.length > 254) return bad("invalid_institution");
      const {token}=id?await requireEntityCapability("license.write","institution",id):await requireOperatorCapability("license.write");
      const institutionId = await credentialRpc<string>("zgirl_institution_save", { p_session_token: token, p_institution_id: id, p_name: name, p_institution_type: type, p_status: status, p_contact_name: contactName, p_contact_email: contactEmail });
      return Response.json({ ok: true, institutionId });
    }

    if (action === "save_site") {
      const siteId = typeof body.siteId === "string" && UUID.test(body.siteId) ? body.siteId : null; const institutionId = typeof body.institutionId === "string" ? body.institutionId : ""; const name = typeof body.name === "string" ? body.name.trim() : ""; const siteType = typeof body.siteType === "string" ? body.siteType : ""; const status = typeof body.status === "string" ? body.status : "";
      if (!UUID.test(institutionId) || name.length < 2 || name.length > 180 || !SITE_TYPES.has(siteType) || !SITE_STATUSES.has(status)) return bad("invalid_site");
      const {token}=await requireOperatorCapability("license.write",institutionId);
      const result = await credentialRpc<string>("zgirl_institution_save_site", { p_session_token: token, p_site_id: siteId, p_institution_id: institutionId, p_name: name, p_site_type: siteType, p_status: status });
      return Response.json({ ok: true, siteId: result });
    }

    if (action === "save_license") {
      const licenseId = typeof body.licenseId === "string" && UUID.test(body.licenseId) ? body.licenseId : null; const institutionId = typeof body.institutionId === "string" ? body.institutionId : ""; const licenseType = typeof body.licenseType === "string" ? body.licenseType : ""; const status = typeof body.status === "string" ? body.status : ""; const effectiveDate = typeof body.effectiveDate === "string" ? body.effectiveDate : ""; const expiresAt = typeof body.expiresAt === "string" ? body.expiresAt : "";
      const seatLimit = Number(body.seatLimit); const siteLimit = Number(body.siteLimit); const trainerLimit = Number(body.trainerLimit); const profiles = strings(body.allowedProfiles); const levels = strings(body.allowedLevels); const agreementStatus = typeof body.agreementStatus === "string" ? body.agreementStatus : "draft"; const agreementReference = typeof body.agreementReference === "string" ? body.agreementReference.trim() : "";
      if (!UUID.test(institutionId) || !LICENSE_TYPES.has(licenseType) || !LICENSE_STATUSES.has(status) || !DATE.test(effectiveDate) || !DATE.test(expiresAt) || !Number.isInteger(seatLimit) || !Number.isInteger(siteLimit) || !Number.isInteger(trainerLimit) || seatLimit < 1 || siteLimit < 1 || trainerLimit < 0 || profiles.length === 0 || profiles.some((v) => !PROFILES.has(v)) || levels.length === 0 || levels.some((v) => !LEVELS.has(v)) || !AGREEMENT_STATUSES.has(agreementStatus) || agreementReference.length > 180) return bad("invalid_license");
      const {token}=await requireOperatorCapability("license.write",institutionId);
      const result = await credentialRpc<string>("zgirl_institution_save_license", { p_session_token: token, p_license_id: licenseId, p_institution_id: institutionId, p_license_type: licenseType, p_status: status, p_effective_date: effectiveDate, p_expires_at: expiresAt, p_seat_limit: seatLimit, p_site_limit: siteLimit, p_trainer_limit: trainerLimit, p_allowed_profiles: profiles, p_allowed_levels: levels, p_agreement_status: agreementStatus, p_agreement_reference: agreementReference });
      return Response.json({ ok: true, licenseId: result });
    }

    if (action === "allocate_seat") {
      const licenseId = typeof body.licenseId === "string" ? body.licenseId : ""; const candidateId = typeof body.candidateId === "string" ? body.candidateId : ""; const siteId = typeof body.siteId === "string" && UUID.test(body.siteId) ? body.siteId : null; const seatRole = typeof body.seatRole === "string" ? body.seatRole : "";
      if (!UUID.test(licenseId) || !UUID.test(candidateId) || !SEAT_ROLES.has(seatRole)) return bad("invalid_seat");
      const {token}=await requireEntityCapability("license.write","license",licenseId);
      const allocationId = await credentialRpc<string>("zgirl_institution_allocate_seat", { p_session_token: token, p_license_id: licenseId, p_candidate_id: candidateId, p_site_id: siteId, p_seat_role: seatRole });
      return Response.json({ ok: true, allocationId });
    }

    if (action === "release_seat") {
      const allocationId = typeof body.allocationId === "string" ? body.allocationId : ""; if (!UUID.test(allocationId)) return bad("invalid_allocation");
      const {token}=await requireEntityCapability("license.write","allocation",allocationId);
      await credentialRpc<boolean>("zgirl_institution_release_seat", { p_session_token: token, p_allocation_id: allocationId }); return Response.json({ ok: true });
    }

    if (action === "link_credential") {
      const allocationId = typeof body.allocationId === "string" ? body.allocationId : ""; const credentialId = typeof body.credentialId === "string" ? body.credentialId : "";
      if (!UUID.test(allocationId) || !UUID.test(credentialId)) return bad("invalid_link");
      const {token}=await requireEntityCapability("license.write","allocation",allocationId);
      await credentialRpc<boolean>("zgirl_institution_link_credential", { p_session_token: token, p_allocation_id: allocationId, p_credential_id: credentialId }); return Response.json({ ok: true });
    }

    if (action === "renew_license") {
      const licenseId = typeof body.licenseId === "string" ? body.licenseId : ""; const expiresAt = typeof body.expiresAt === "string" ? body.expiresAt : ""; const seatLimit = Number(body.seatLimit); const agreementReference = typeof body.agreementReference === "string" ? body.agreementReference.trim() : "";
      if (!UUID.test(licenseId) || !DATE.test(expiresAt) || !Number.isInteger(seatLimit) || seatLimit < 1 || agreementReference.length < 1 || agreementReference.length > 180) return bad("invalid_license_renewal");
      const {token}=await requireEntityCapability("license.write","license",licenseId);
      await credentialRpc<boolean>("zgirl_institution_renew_license_v3", { p_session_token: token, p_license_id: licenseId, p_new_expires_at: expiresAt, p_new_seat_limit: seatLimit, p_agreement_reference: agreementReference });
      return Response.json({ ok: true });
    }

    if (action === "import_roster") {
      const licenseId = typeof body.licenseId === "string" ? body.licenseId : ""; const sourceLabel = typeof body.sourceLabel === "string" ? body.sourceLabel.trim() : ""; const rows = Array.isArray(body.rows) ? body.rows : [];
      if (!UUID.test(licenseId) || rows.length === 0 || rows.length > 250 || sourceLabel.length > 180) return bad("invalid_roster");
      const {token}=await requireEntityCapability("license.write","license",licenseId);
      const result = await credentialRpc<Record<string, unknown>>("zgirl_institution_import_roster", { p_session_token: token, p_license_id: licenseId, p_source_label: sourceLabel, p_rows: rows }); return Response.json({ ok: true, import: result });
    }

    if (action === "run_automation") {
      const {token}=await requireOperatorCapability("license.write");
      const automation = await credentialRpc<Record<string, unknown>>("zgirl_institution_run_automation", { p_session_token: token }); return Response.json({ ok: true, automation });
    }

    return bad("unsupported_action");
  } catch (error) {
    const response = credentialErrorResponse(error); if (response.status === 401) await clearCredentialSession(); return response;
  }
}
