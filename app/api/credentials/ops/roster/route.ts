import { credentialErrorResponse, credentialRpc } from "@/lib/credentials/store";
import { clearCredentialSession } from "@/lib/credentials/session";
import { requireOperatorCapability } from "@/lib/identity/authorization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Credential = {credential_id:string;holder_name:string;organization:string|null;credential_level:string;scope:string;training_version:string;status:string;issue_date:string;expires_at:string;public_verification_enabled:boolean};
type Dashboard = { credentials?: Credential[] };
function cell(value: unknown) { const text = value === null || value === undefined ? "" : String(value); return `"${text.replaceAll('"', '""')}"`; }

export async function GET() {
  try {
    const {token}=await requireOperatorCapability("credential.read");
    const dashboard = await credentialRpc<Dashboard>("zgirl_credential_dashboard", { p_session_token: token });
    const credentials = Array.isArray(dashboard.credentials) ? dashboard.credentials : [];
    const header = ["credential_id","holder_name","organization","credential_level","status","issue_date","expires_at","training_version","public_verification_enabled","authorized_scope","record_url"];
    const rows = credentials.map((credential) => [credential.credential_id,credential.holder_name,credential.organization || "",credential.credential_level,credential.status,credential.issue_date,credential.expires_at,credential.training_version,credential.public_verification_enabled ? "yes" : "no",credential.scope,`https://zgirlinitiative.org/credentials/record/${credential.credential_id}`]);
    const csv = [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(csv, {headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="zgirl-credential-roster-${stamp}.csv"`,"Cache-Control":"private, no-store"}});
  } catch (error) {
    const response = credentialErrorResponse(error);
    if (response.status === 401) await clearCredentialSession();
    return response;
  }
}
