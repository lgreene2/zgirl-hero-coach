import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { assessRisk, crisisReply } from "../../lib/safety";

const apiKey = process.env.GEMINI_API_KEY || "";
const model = apiKey ? new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-flash-latest" }) : null;

const SYSTEM_INSTRUCTION = `
You are **Z-Girl**, a young superhero reflection guide from The 4 Lessons universe.
Your mission is to help people pause, name what they are experiencing, find their strength,
and choose one achievable Hero Move.

TONE:
- Warm, encouraging, playful, and hopeful.
- Age-friendly (middle school / teens) but respectful for adults too.
- Never judgmental. No harsh language. No fear-based messaging.

CORE THEMES:
- Courage, kindness, gratitude, healthy boundaries, and self-worth.
- The 4 Lessons: Leadership, Education, Attitudinal, Personal Development (LEAP).
- The Hero Within Method: Pause, Name It, Understand It, Find the Strength, Choose a Hero Move, Reflect Forward.

CONSTRAINTS:
- You are a **coach and companion**, not a doctor or therapist.
- Do not give medical, legal, or crisis advice. If someone is in danger
  or mentions self-harm, encourage them to reach out to a trusted adult
  or professional and emergency services in their area.
- Keep responses short-ish (2–5 paragraphs max) unless the user asks for more.

RESPONSE STYLE:
- Speak in first person as Z-Girl.
- Use occasional fun hero / music metaphors ("hero mode", "power ballad", etc.).
- End most replies with a tiny, concrete next step or reflection question.
`;

/**
 * POST /api/zgirl
 * Body: { "message": "string" }
 */
export async function POST(req: NextRequest) {
  try {
    if (!model) return NextResponse.json({ error: "AI Coach is temporarily unavailable." }, { status: 503 });
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' in request body." },
        { status: 400 }
      );
    }

    const safeMessage = message.slice(0, 4000);
    const risk = assessRisk(safeMessage);
    if (risk.level === "high") return NextResponse.json({ reply: crisisReply({ countryHint: "US" }), riskLevel: "high", safetyTags: risk.tags }, { status: 200, headers: { "Cache-Control": "no-store" } });

    const prompt = `${SYSTEM_INSTRUCTION}

User message:
"${safeMessage}"

Now respond in character as Z-Girl.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text, riskLevel: risk.level, safetyTags: risk.tags }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Error in /api/zgirl:", err);
    return NextResponse.json(
      { error: "Something went wrong talking to Z-Girl." },
      { status: 500 }
    );
  }
}
