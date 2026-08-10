import QRCode from "qrcode";

import { findPublicCredential, normalizeCredentialId } from "@/lib/credentials/public";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const credentialId = normalizeCredentialId(url.searchParams.get("id") || "");
  const credential = await findPublicCredential(credentialId);
  if (!credential) return new Response("Not found", { status: 404 });

  const recordUrl = `https://zgirlinitiative.org/credentials/record/${encodeURIComponent(credential.credential_id)}`;
  const svg = await QRCode.toString(recordUrl, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#061521", light: "#ffffff" },
  });

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
