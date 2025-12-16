// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { assessRisk, crisisReply, mediumRiskPrefix } from "@/lib/safety";

const systemSafety = `
You are Z-Girl, a warm, upbeat Black teen superhero and digital "hero coach" from The 4 Lessons universe.
Your audience is primarily kids and teens (about 10–16 years old), and sometimes caring adults.

You:
- Are kind, affirming, and never judgmental.
- Use simple, clear language and occasional gentle hero metaphors (hero move, power-up, shield, inner villain).
- NEVER give medical, diagnostic, medication, or legal advice.
- NEVER encourage self-harm, revenge, violence, or breaking the law.
- NEVER promise to keep secrets about serious danger.

If the user is struggling but not in crisis:
- Validate their feelings first.
- Ask up to 1–2 short clarifying questions if needed.
- Keep answers short (about 3–6 sentences).
- Offer exactly one small, realistic "hero move" they can try next.
`.trim();

const apiKey = process.env.GEMINI_API_KEY || "";

let model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

function isRateLimitError(err: any): { retryAfterSec: number; message: string } | null {
  const msg = String(err?.message || err || "");
  const status = err?.status || err?.response?.status;
  const looks429 =
    status === 429 || /\b429\b/.test(msg) || /quota/i.test(msg) || /rate limit/i.test(msg);
  if (!looks429) return null;

  const retryAfterRaw =
    err?.response?.headers?.get?.("retry-after") ||
    err?.response?.headers?.["retry-after"] ||
    err?.headers?.get?.("retry-after") ||
    err?.headers?.["retry-after"] ||
    null;

  let retryAfterSec = 20;
  if (retryAfterRaw != null) {
    const n = Number(retryAfterRaw);
    if (Number.isFinite(n) && n > 0) retryAfterSec = Math.floor(n);
  }

  return {
    retryAfterSec,
    message: "I’m getting a lot of hero-signals at once right now. Please wait a moment and try again. 💙",
  };
}

type FrontendMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    if (!apiKey || !model) {
      console.error("GEMINI_API_KEY missing or model not initialized");
      return NextResponse.json(
        {
          reply:
            "My hero-signal to Gemini isn’t working right now. Ask your grown-up dev to check my API key. 🛠️",
          riskLevel: "low",
        },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => null)) as
      | { systemPrompt?: string; messages?: FrontendMessage[] }
      | null;

    const messages = body?.messages ?? [];
    const frontendSystemPrompt = body?.systemPrompt ?? "";

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          reply:
            "Hey hero, I’m here whenever you’re ready. Tell me what’s going on, and we’ll take one small step together. 💙",
          riskLevel: "low",
        },
        { status: 200 }
      );
    }

    const userLast = messages[messages.length - 1]?.content ?? "";
    const risk = assessRisk(userLast);

    // ✅ Deterministic crisis override (do NOT call the model on high risk)
    if (risk.level === "high") {
      return NextResponse.json(
        {
          reply: crisisReply({ countryHint: "US" }),
          riskLevel: "high",
          safetyTags: risk.tags,
        },
        { status: 200 }
      );
    }

    // Convert conversation to plain text history (kept for context)
    const historyText = messages
      .map((m) => (m.role === "assistant" ? `Z-Girl: ${m.content}` : `User: ${m.content}`))
      .join("\n");

    const mediumPrefix = risk.level === "medium" ? `\n\n${mediumRiskPrefix(risk.tags)}\n` : "";

    // Final prompt = Backend safety belt + (optional) frontend persona prompt + medium safety bump
    const finalPrompt = `
${systemSafety}

${frontendSystemPrompt ? `Frontend persona guidance:\n${frontendSystemPrompt}\n` : ""}

${mediumPrefix}

Conversation so far:
${historyText}

Now respond as Z-Girl. Keep it to about 3–6 sentences.
Validate the user's feelings, speak gently, and offer exactly ONE small "hero move" they can try next.
Avoid medical or legal advice. Do not mention that you are an AI; just speak as Z-Girl.

User's latest message:
${userLast}

Z-Girl:
    `.trim();

    const result = await model.generateContent(finalPrompt);

    const rawText =
      result.response.text().trim() ||
      "I’m here with you. Let’s try that again in a moment. 💙";

    return NextResponse.json(
      { reply: rawText, riskLevel: risk.level, safetyTags: risk.tags },
      { status: 200 }
    );
  } catch (err: any) {
    const rl = isRateLimitError(err);
    if (rl) {
      return NextResponse.json(
        { reply: rl.message, rateLimited: true, retryAfterSec: rl.retryAfterSec, riskLevel: "low" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    console.error("Z-Girl /api/chat error:", err);
    return NextResponse.json(
      {
        reply:
          "My hero-signal glitched while talking to Gemini. Please try again in a moment — and let a trusted adult or your grown-up dev know if it keeps happening. 🛠️",
        riskLevel: "low",
      },
      { status: 500 }
    );
  }
}
