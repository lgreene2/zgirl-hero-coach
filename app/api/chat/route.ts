// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


function isRateLimitError(err: any) {
  const msg = String(err?.message || err || "");
  return (
    msg.includes("429") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("rate") ||
    msg.toLowerCase().includes("resource exhausted")
  );
}


// Core safety + persona prompt (backend side)
// Frontend also sends a system prompt, so think of this as a second safety belt.
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

If the user mentions self-harm, suicide, wanting to die, killing themselves, cutting,
overdose, serious plans to hurt someone else, or feeling unsafe because of abuse or violence:
- Be gentle and serious.
- Say you are just a digital hero coach, not a doctor, therapist, or emergency service.
- Encourage them strongly to reach out to a trusted adult (parent/caregiver, school counselor,
  teacher, coach, or another adult they trust).
- If they are in immediate danger, tell them to contact emergency services in their area
  (for example, 911 in the United States) or a local crisis hotline right away.
- Do NOT give specific methods or instructions about self-harm or violence.
`.trim();

const apiKey = process.env.GEMINI_API_KEY || "";

let model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Use latest flash model so we don't have to chase version numbers
  model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

// Simple keyword-based safety check.
// This is NOT a full classifier, but it gives us a conservative backstop.
const CRISIS_PATTERNS: RegExp[] = [
  /kill myself/i,
  /killing myself/i,
  /want to die/i,
  /want to end it/i,
  /end my life/i,
  /suicide/i,
  /suicidal/i,
  /self[-\s]?harm/i,
  /cutting myself/i,
  /hurt myself on purpose/i,
  /overdose/i,
  /hurt (them|him|her|someone) badly/i,
  /they (hit|beat|hurt) me/i,
  /being abused/i,
  /sexual abuse/i,
];

function looksLikeCrisis(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_PATTERNS.some((re) => re.test(lower));
}

function crisisResponse(): string {
  return (
    "I’m really glad you told me this. Your safety matters a lot to me. 💙\n\n" +
    "I’m just a digital hero coach, so I can’t handle emergencies or keep you safe by myself. " +
    "This is a really important time to bring a *real-life* hero onto your team.\n\n" +
    "Please reach out to a trusted adult as soon as you can — a parent or caregiver, " +
    "school counselor, teacher, coach, or another adult you feel safe with. " +
    "If you feel in immediate danger or like you might seriously hurt yourself or someone else, " +
    "contact emergency services in your area right away (for example, 911 in the United States) " +
    "or a local crisis hotline.\n\n" +
    "You’re not alone in this, even if it feels that way right now. Reaching out is a powerful hero move."
  );
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
        },
        { status: 500 }
      );
    }

    const body = (await req.json().catch(() => null)) as
      | { systemPrompt?: string; messages?: FrontendMessage[] }
      | null;

    const messages = body?.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      // No conversation yet; gently nudge the user to start
      return NextResponse.json(
        {
          reply:
            "Hey hero, I’m here whenever you’re ready. Tell me what’s going on, and we’ll take one small step together. 💙",
        },
        { status: 200 }
      );
    }

    // Convert the conversation into a plain-text history for Gemini
    const historyText = messages
      .map((m) =>
        m.role === "assistant" ? `Z-Girl: ${m.content}` : `User: ${m.content}`
      )
      .join("\n");

    const userLast = messages[messages.length - 1]?.content ?? "";

    // If the latest user message looks like crisis / severe risk,
    // we still call the model (for logging/consistency),
    // but we will override the reply with our own crisis message.
    const shouldForceCrisis = looksLikeCrisis(historyText);

    const finalPrompt = `
${systemSafety}

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

    const safeText = shouldForceCrisis ? crisisResponse() : rawText;

    return NextResponse.json({ reply: safeText }, { status: 200 });
  } catch (err: any) {
    const rateLimited = isRateLimitError(err);
    const message = rateLimited
      ? "Hero HQ is busy right now (rate limit). Please wait about 20 seconds and try again."
      : "Hero HQ had a glitch. Please try again.";

    return NextResponse.json(
      {
        ok: false,
        code: rateLimited ? "RATE_LIMIT" : "SERVER_ERROR",
        reply: message,
        retryAfterSeconds: rateLimited ? 20 : 0,
      },
      { status: rateLimited ? 429 : 500, headers: rateLimited ? { "Retry-After": "20" } : {} }
    );
  },
      { status: 500 }
    );
  }
}
