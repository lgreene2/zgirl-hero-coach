import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { assessRisk, crisisReply } from "@/app/lib/safety";
import { AGE_GUIDANCE, getSupportRole, type AgeBand, type ShareField, type SupportRole } from "@/lib/trusted-support";

const apiKey = process.env.GEMINI_API_KEY || "";
const model = apiKey ? new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-flash-latest" }) : null;

const allowedFields: ShareField[] = ["situation", "feeling", "theme", "strength", "heroMove", "question"];
const allowedRoles: SupportRole[] = ["parent", "coach", "educator", "therapist", "faith", "mentor"];
const allowedAgeBands: AgeBand[] = ["child", "teen", "adult"];

export async function POST(req: NextRequest) {
  try {
    if (!model) return NextResponse.json({ error: "AI brief polishing is temporarily unavailable." }, { status: 503 });

    const body: unknown = await req.json();
    const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const role = typeof payload.role === "string" && allowedRoles.includes(payload.role as SupportRole) ? payload.role as SupportRole : "mentor";
    const ageBand = typeof payload.ageBand === "string" && allowedAgeBands.includes(payload.ageBand as AgeBand) ? payload.ageBand as AgeBand : "adult";
    const selected: ShareField[] = Array.isArray(payload.selected)
      ? payload.selected.filter((field): field is ShareField => typeof field === "string" && allowedFields.includes(field as ShareField))
      : [];
    const values: Partial<Record<ShareField, string>> = payload.values && typeof payload.values === "object"
      ? payload.values as Partial<Record<ShareField, string>>
      : {};
    const supporterName = typeof payload.supporterName === "string" ? payload.supporterName.slice(0, 100) : "";

    const selectedContent = selected
      .map((field: ShareField) => `${field}: ${String(values[field] || "").slice(0, 1600)}`)
      .filter((line: string) => line.split(": ")[1]?.trim())
      .join("\n");

    if (!selectedContent.trim()) return NextResponse.json({ error: "Choose at least one non-empty item to share." }, { status: 400 });

    const risk = assessRisk(selectedContent);
    if (risk.level === "high") {
      return NextResponse.json({
        blocked: true,
        riskLevel: "high",
        safetyTags: risk.tags,
        reply: crisisReply({ countryHint: "US" }),
      }, { status: 200, headers: { "Cache-Control": "no-store" } });
    }

    const config = getSupportRole(role);
    const age = AGE_GUIDANCE[ageBand];
    const therapistBoundary = role === "therapist"
      ? "This is SESSION PREPARATION ONLY. Do not diagnose, infer a disorder, recommend medication, recommend treatment changes, or characterize clinical risk."
      : "Do not diagnose, make medical claims, or make high-stakes decisions for the participant.";

    const prompt = `You are the adaptive handoff writer inside Z-Girl: The Hero Within Reflection System.

Your task is to turn ONLY the participant-selected content into a concise human-to-human handoff brief for a ${config.label}.

GOVERNANCE:
- Preserve the participant's meaning. Do not invent facts, causes, motives, diagnoses, history, or conclusions.
- Clearly distinguish the participant's own selected information from your summary.
- ${therapistBoundary}
- Do not frame the recipient as having access to anything the participant did not select.
- Do not include hidden analysis, risk scoring, sentiment scoring, or diagnostic labels.
- Age/communication guidance: ${age.guidance}
- Handoff purpose: ${config.handoffGoal}
- Recipient guidance: ${config.supporterPrompt}
- Keep it useful, warm, neutral, and under 220 words.
- Use these exact headings: WHAT I CHOSE TO SHARE, MY HERO MOVE, WHAT I WANT FROM YOU, GOOD PLACE TO START.
- If a selected section is empty, omit its facts rather than inventing content.

Recipient name (optional): ${supporterName || config.label}
Participant-selected content:
${selectedContent}

Write the handoff brief now.`;

    const result = await model.generateContent(prompt);
    const brief = result.response.text().trim();

    return NextResponse.json({
      brief,
      role,
      ageBand,
      riskLevel: risk.level,
      safetyTags: risk.tags,
      aiGenerated: true,
      disclosure: "AI summarized only the items selected for sharing. Review and edit before handing this to another person.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error in trusted-support brief:", error);
    return NextResponse.json({ error: "The handoff brief could not be created." }, { status: 500 });
  }
}
