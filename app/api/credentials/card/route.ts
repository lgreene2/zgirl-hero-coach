import QRCode from "qrcode";

import { credentialLevelLabel, findPublicCredential, normalizeCredentialId } from "@/lib/credentials/public";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const XML_ENTITIES: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" };

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => XML_ENTITIES[char] || char);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const credentialId = normalizeCredentialId(url.searchParams.get("id") || "");
  const credential = await findPublicCredential(credentialId);
  if (!credential) return new Response("Not found", { status: 404 });

  const recordUrl = `https://zgirlinitiative.org/credentials/record/${encodeURIComponent(credential.credential_id)}`;
  const qr = await QRCode.toDataURL(recordUrl, { errorCorrectionLevel: "M", margin: 1, width: 220 });
  const level = credentialLevelLabel[credential.credential_level] || credential.credential_level;
  const organization = credential.organization || "Independent / approved scope";
  const status = credential.valid_now ? "CURRENT" : credential.status.toUpperCase();

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1050" height="600" viewBox="0 0 1050 600" role="img" aria-labelledby="title desc">
  <title id="title">Z-Girl program credential for ${escapeXml(credential.holder_name)}</title>
  <desc id="desc">Program authorization card with credential ID, authorization level, term, and verification QR code.</desc>
  <rect width="1050" height="600" rx="42" fill="#061521"/>
  <rect x="24" y="24" width="1002" height="552" rx="30" fill="none" stroke="#49d8c2" stroke-width="3" opacity="0.55"/>
  <circle cx="94" cy="94" r="44" fill="#49d8c2"/>
  <text x="94" y="107" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="900" fill="#04151c">Z</text>
  <text x="158" y="82" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#ffffff">Z-Girl</text>
  <text x="158" y="111" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="3" fill="#76ead6">PROGRAM AUTHORIZATION</text>
  <rect x="728" y="54" width="260" height="54" rx="27" fill="${credential.valid_now ? "#49d8c2" : "#fbbf24"}"/>
  <text x="858" y="88" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="900" letter-spacing="2" fill="#04151c">${escapeXml(status)}</text>
  <text x="70" y="210" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" letter-spacing="2" fill="#76ead6">AUTHORIZED HOLDER</text>
  <text x="70" y="260" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="900" fill="#ffffff">${escapeXml(credential.holder_name)}</text>
  <text x="70" y="302" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#b8fff3">${escapeXml(level)}</text>
  <text x="70" y="338" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#94a3b8">${escapeXml(organization)}</text>
  <text x="70" y="410" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="1.5" fill="#64748b">CREDENTIAL ID</text>
  <text x="70" y="442" font-family="Courier New, monospace" font-size="24" font-weight="700" fill="#ffffff">${escapeXml(credential.credential_id)}</text>
  <text x="70" y="500" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="1.5" fill="#64748b">TERM</text>
  <text x="70" y="532" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="#ffffff">${escapeXml(credential.issue_date)} — ${escapeXml(credential.expires_at)}</text>
  <image href="${qr}" x="770" y="178" width="210" height="210"/>
  <text x="875" y="414" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#76ead6">SCAN TO VERIFY</text>
  <text x="875" y="448" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#94a3b8">Training version ${escapeXml(credential.training_version)}</text>
  <text x="875" y="488" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#64748b">Program credential only</text>
  <text x="875" y="510" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#64748b">Not professional licensure</text>
</svg>`;

  const filename = `${credential.credential_id}-credential-card.svg`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
