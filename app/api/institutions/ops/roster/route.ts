import { credentialRpc, credentialErrorResponse } from "@/lib/credentials/store";
import { clearCredentialSession, credentialSessionToken } from "@/lib/credentials/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Dashboard = {
  licenses?: Array<Record<string, unknown>>;
  allocations?: Array<Record<string, unknown>>;
  institutions?: Array<Record<string, unknown>>;
};

function csv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const token = await credentialSessionToken();
  if (!token) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  try {
    const url = new URL(request.url);
    const licenseId = (url.searchParams.get("licenseId") || "").trim();
    if (licenseId && !UUID.test(licenseId)) return Response.json({ ok: false, error: "invalid_license" }, { status: 400 });
    const dashboard = await credentialRpc<Dashboard>("zgirl_institution_dashboard", { p_session_token: token });
    const licenses = Array.isArray(dashboard.licenses) ? dashboard.licenses : [];
    const allocations = Array.isArray(dashboard.allocations) ? dashboard.allocations : [];
    const targetLicenses = licenseId ? licenses.filter((item) => item.id === licenseId) : licenses;
    const allowed = new Set(targetLicenses.map((item) => String(item.id || "")));
    const rows = allocations.filter((item) => allowed.has(String(item.license_id || "")) && item.status !== "released");
    const byId = new Map(targetLicenses.map((item) => [String(item.id || ""), item]));
    const header = ["Institution","License Code","License Type","License Status","Seat Role","Seat Status","Site","Adult Facilitator / Trainer","Credential ID","Credential Level"].map(csv).join(",");
    const body = rows.map((item) => {
      const license = byId.get(String(item.license_id || "")) || {};
      return [license.institution_name,license.license_code,license.license_type,license.status,item.seat_role,item.status,item.site_name,item.full_name,item.credential_code,item.credential_level].map(csv).join(",");
    });
    const content = [header, ...body].join("\n");
    return new Response(content, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="zgirl-institutional-credential-roster.csv"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    const response = credentialErrorResponse(error); if (response.status === 401) await clearCredentialSession(); return response;
  }
}
