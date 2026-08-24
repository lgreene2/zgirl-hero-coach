// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { assessRisk, crisisReply, mediumRiskPrefix } from "../../lib/safety";

export const runtime = "nodejs";
export const maxDuration = 30;

const systemSafety = `
You are Z-Girl, a warm, upbeat Black teen superhero and digital "hero coach" from The 4 Lessons universe.
You guide youth, adults, and caring supporters. Match the selected audience without becoming childish or clinical.

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
- When useful, follow the Hero Within Method: Pause, Name It, Understand It, Find the Strength, Choose a Hero Move, Reflect Forward.
`.trim();

const apiKey = process.env.GEMINI_API_KEY || "";
const CHAT_MODEL_PRIMARY = "gemini-3.5-flash-lite";
const CHAT_MODEL_FALLBACK = "gemini-2.5-flash-lite";

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

function errorStatus(err: unknown): number {
  if (!err || typeof err !== "object" || !("status" in err)) return 0;
  const status = Number((err as { status?: unknown }).status);
  return Number.isFinite(status) ? status : 0;
}

function isTransientModelError(err: unknown): boolean {
  const status = errorStatus(err);
  const message = String(
    err && typeof err === "object" && "message" in err
      ? (err as { message?: unknown }).message
      : err || ""
  );
  return (
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    /high demand|temporar|overload|unavailable|timeout|rate limit|quota/i.test(message)
  );
}

async function generateCoachReply(prompt: string): Promise<string> {
  const client = new GoogleGenAI({ apiKey });
  const attempts = [
    { model: CHAT_MODEL_PRIMARY, delayMs: 0 },
    { model: CHAT_MODEL_PRIMARY, delayMs: 350 },
    { model: CHAT_MODEL_FALLBACK, delayMs: 0 },
  ];
  let lastError: unknown = new Error("coach_generation_failed");

  for (const attempt of attempts) {
    if (attempt.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, attempt.delayMs));
    }
    try {
      const interaction = await client.interactions.create({
        model: attempt.model,
        input: prompt,
        store: false,
      });
      const reply = interaction.output_text?.trim();
      if (reply) return reply;
      lastError = new Error("coach_reply_empty");
    } catch (err) {
      lastError = err;
      if (!isTransientModelError(err)) throw err;
    }
  }

  throw lastError;
}

type FrontendMessage = {
  role: "user" | "assistant";
  content: string;
};

type CoachAudience = "youth" | "adult" | "supporter";

const audienceGuidance: Record<CoachAudience, string> = {
  youth: "Use language appropriate for ages 10–17. Encourage trusted-adult support when a challenge feels heavy, unsafe, or hard to manage alone.",
  adult: "Speak to an adult warmly but not childishly. Support reflection about decisions, goals, relationships, resilience, and personal growth.",
  supporter: "Help a parent, caregiver, educator, or mentor support another person without diagnosing, interrogating, or replacing professional help.",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { audience?: CoachAudience; language?: string; messages?: FrontendMessage[] }
      | null;

    const rawMessages = body?.messages ?? [];
    const audience: CoachAudience = body?.audience && body.audience in audienceGuidance ? body.audience : "youth";
    const language = typeof body?.language === "string" && body.language.length <= 30 ? body.language : "English";

    if (!Array.isArray(rawMessages) || rawMessages.length > 40) {
      return NextResponse.json({ reply: "That conversation is too long to process safely. Please clear it and begin a new reflection.", riskLevel: "low" }, { status: 400 });
    }

    const messages: FrontendMessage[] = rawMessages
      .filter((message): message is FrontendMessage => Boolean(message) && (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
      .slice(-16)
      .map((message) => ({ role: message.role, content: message.content.slice(0, 4000) }));

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

    if (!apiKey) {
      console.error("GEMINI_API_KEY missing");
      return NextResponse.json(
        {
          reply: "The AI Coach is temporarily unavailable. You can still use Private Reflection and the 7-Day Journey.",
          riskLevel: risk.level,
          safetyTags: risk.tags,
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Convert conversation to plain text history (kept for context)
    const historyText = messages
      .map((m) => (m.role === "assistant" ? `Z-Girl: ${m.content}` : `User: ${m.content}`))
      .join("\n");

    const mediumPrefix = risk.level === "medium" ? `\n\n${mediumRiskPrefix(risk.tags)}\n` : "";

    // All behavioral instructions are controlled on the server. The client can
    // select a bounded audience and language, but cannot replace the safety prompt.
    const finalPrompt = `
${systemSafety}

Selected audience guidance:
${audienceGuidance[audience]}

Reply language: ${language}.

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

    let serviceDegraded = false;
    let rawText: string;
    try {
      rawText = await generateCoachReply(finalPrompt);
    } catch (err) {
      if (!isTransientModelError(err)) throw err;
      serviceDegraded = true;
      console.warn("Z-Girl chat models temporarily unavailable", {
        status: errorStatus(err),
      });
      rawText =
        risk.level === "medium"
          ? `${mediumRiskPrefix(risk.tags)} Your one hero move right now is to move toward a calm, trusted person and tell them plainly that you need support.`
          : "That sounds difficult, and I’m glad you paused to name it. Your one hero move is to move to the calmest safe place available and take three slow breaths before deciding what to do next. If anyone may be unsafe, reach out to a trusted person or emergency help right away.";
    }

    return NextResponse.json(
      {
        reply: rawText,
        riskLevel: risk.level,
        safetyTags: risk.tags,
        serviceDegraded,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
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
