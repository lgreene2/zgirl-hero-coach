import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const globalRateLimit = globalThis as typeof globalThis & {
  zgirlLeadRateLimit?: Map<string, number[]>;
};
const rateLimit =
  globalRateLimit.zgirlLeadRateLimit ?? new Map<string, number[]>();
globalRateLimit.zgirlLeadRateLimit = rateLimit;

type LeadPayload = {
  leadType?: unknown;
  offer?: unknown;
  name?: unknown;
  email?: unknown;
  organization?: unknown;
  role?: unknown;
  audience?: unknown;
  timeline?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown;
  sourcePath?: unknown;
};

type NormalizedLead = {
  leadId: string;
  leadType: string;
  offer: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  audience: string;
  timeline: string;
  message: string;
  sourcePath: string;
  submittedAt: string;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function allowedByRateLimit(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const recent = (rateLimit.get(key) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS
  );

  if (recent.length >= MAX_REQUESTS) {
    rateLimit.set(key, recent);
    return false;
  }

  recent.push(now);
  rateLimit.set(key, recent);
  return true;
}

function normalize(payload: LeadPayload): NormalizedLead | null {
  if (text(payload.website, 200)) return null;

  const name = text(payload.name, 120);
  const email = text(payload.email, 180).toLowerCase();
  const leadType = text(payload.leadType, 80) || "general-inquiry";
  const consent = payload.consent === true;

  if (!name || !isValidEmail(email) || !consent) return null;

  return {
    leadId: randomUUID(),
    leadType,
    offer: text(payload.offer, 120),
    name,
    email,
    organization: text(payload.organization, 180),
    role: text(payload.role, 120),
    audience: text(payload.audience, 180),
    timeline: text(payload.timeline, 120),
    message: text(payload.message, 3000),
    sourcePath: text(payload.sourcePath, 300) || "/",
    submittedAt: new Date().toISOString(),
  };
}

function leadText(lead: NormalizedLead) {
  return [
    `Lead ID: ${lead.leadId}`,
    `Type: ${lead.leadType}`,
    `Offer: ${lead.offer || "Not specified"}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Organization: ${lead.organization || "Not provided"}`,
    `Role: ${lead.role || "Not provided"}`,
    `Audience / group: ${lead.audience || "Not provided"}`,
    `Timeline: ${lead.timeline || "Not provided"}`,
    `Source: ${lead.sourcePath}`,
    `Submitted: ${lead.submittedAt}`,
    "",
    "Message:",
    lead.message || "No additional message.",
  ].join("\n");
}

function leadHtml(lead: NormalizedLead) {
  const rows = [
    ["Lead ID", lead.leadId],
    ["Type", lead.leadType],
    ["Offer", lead.offer || "Not specified"],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Organization", lead.organization || "Not provided"],
    ["Role", lead.role || "Not provided"],
    ["Audience / group", lead.audience || "Not provided"],
    ["Timeline", lead.timeline || "Not provided"],
    ["Source", lead.sourcePath],
    ["Submitted", lead.submittedAt],
  ];

  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;color:#10202b">
      <h1 style="font-size:24px">New Z-Girl lead</h1>
      <table style="width:100%;border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><th style="text-align:left;padding:8px;border:1px solid #d7e0e5;background:#eef4f6">${escapeHtml(
                label
              )}</th><td style="padding:8px;border:1px solid #d7e0e5">${escapeHtml(
                value
              )}</td></tr>`
          )
          .join("")}
      </table>
      <h2 style="font-size:18px;margin-top:24px">Message</h2>
      <p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(
        lead.message || "No additional message."
      )}</p>
    </div>
  `;
}

async function sendWithResend(lead: NormalizedLead) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ZGIRL_LEAD_EMAIL_TO?.trim();
  if (!apiKey || !to) return { configured: false, delivered: false };

  const from =
    process.env.ZGIRL_LEAD_EMAIL_FROM?.trim() ||
    "Z-Girl Leads <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: lead.email,
      subject: `Z-Girl lead: ${lead.offer || lead.leadType}`,
      text: leadText(lead),
      html: leadHtml(lead),
    }),
  });

  return { configured: true, delivered: response.ok };
}

async function sendToWebhook(lead: NormalizedLead) {
  const url = process.env.ZGIRL_LEAD_WEBHOOK_URL?.trim();
  if (!url) return { configured: false, delivered: false };

  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    return { configured: true, delivered: false };
  }

  const secret = process.env.ZGIRL_LEAD_WEBHOOK_SECRET?.trim();
  const response = await fetch(parsed, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify(lead),
  });

  return { configured: true, delivered: response.ok };
}

export async function POST(request: Request) {
  if (!allowedByRateLimit(request)) {
    return NextResponse.json(
      { ok: false, code: "RATE_LIMITED" },
      { status: 429 }
    );
  }

  let payload: LeadPayload;
  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { ok: false, code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const lead = normalize(payload);
  if (!lead) {
    return NextResponse.json(
      { ok: false, code: "INVALID_LEAD" },
      { status: 400 }
    );
  }

  const results = await Promise.allSettled([
    sendWithResend(lead),
    sendToWebhook(lead),
  ]);

  const deliveryResults = results
    .filter(
      (result): result is PromiseFulfilledResult<{
        configured: boolean;
        delivered: boolean;
      }> => result.status === "fulfilled"
    )
    .map((result) => result.value);

  const configured = deliveryResults.some((result) => result.configured);
  const delivered = deliveryResults.some((result) => result.delivered);

  console.info("ZGIRL_LEAD_ATTEMPT", {
    leadId: lead.leadId,
    leadType: lead.leadType,
    offer: lead.offer,
    configured,
    delivered,
  });

  if (!configured) {
    return NextResponse.json(
      { ok: false, code: "DELIVERY_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  if (!delivered) {
    return NextResponse.json(
      { ok: false, code: "DELIVERY_FAILED" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, leadId: lead.leadId });
}
