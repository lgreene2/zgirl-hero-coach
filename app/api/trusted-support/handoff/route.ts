import { NextRequest, NextResponse } from "next/server";
import { closeSupportHandoff, createSupportHandoff, respondSupportHandoff, viewSupportHandoff } from "@/lib/trusted-support-store";

const roles = new Set(["parent", "coach", "educator", "therapist", "faith", "mentor"]);
const ages = new Set(["child", "teen", "adult"]);

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "support_handoff_failed";
  const status = code === "handoff_not_found" ? 404 : code === "invalid_handoff_token" || code === "empty_support_response" ? 400 : 500;
  return NextResponse.json({ ok: false, error: code }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "create") {
      const role = String(body.role || "");
      const ageBand = String(body.ageBand || "");
      const supporterName = String(body.supporterName || "").slice(0, 100);
      const brief = String(body.brief || "").slice(0, 12000);
      const selectedFields = Array.isArray(body.selectedFields) ? body.selectedFields.filter((item: unknown) => typeof item === "string").slice(0, 12) : [];
      if (!roles.has(role) || !ages.has(ageBand) || !brief.trim()) return NextResponse.json({ ok: false, error: "invalid_handoff" }, { status: 400 });
      const created = await createSupportHandoff({ role, ageBand, supporterName, brief, selectedFields });
      return NextResponse.json({ ok: true, ...created }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "view") {
      const token = String(body.token || "");
      const mode = body.mode === "participant" ? "participant" : "supporter";
      const record = await viewSupportHandoff(token, mode);
      return NextResponse.json({ ok: true, handoff: record }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "respond") {
      const token = String(body.token || "");
      const supporterResponse = String(body.supporterResponse || "").slice(0, 5000);
      const nextFocus = String(body.nextFocus || "").slice(0, 3000);
      const result = await respondSupportHandoff(token, supporterResponse, nextFocus);
      return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "close") {
      const token = String(body.token || "");
      const result = await closeSupportHandoff(token);
      return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}
