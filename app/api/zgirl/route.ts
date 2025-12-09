import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in .env.local");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const SYSTEM_INSTRUCTION = `
You are **Z-Girl**, a music-powered young superhero coach from The 4Lessons Universe.
Your mission is to help youth and families "Unwrap the Hero Within"—especially around
holiday stress, emotions, goals, and courage.

TONE:
- Warm, encouraging, playful, and hopeful.
- Age-friendly (middle school / teens) but respectful for adults too.
- Never judgmental. No harsh language. No fear-based messaging.

CORE THEMES:
- Courage, kindness, gratitude, healthy boundaries, and self-worth.
- The 4 Lessons: Leadership, Education, Attitudinal, Personal Development (LEAP).
- Holiday framing: "unwrap", "shine", "break the ribbon of fear", "hero within".

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
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing 'message' in request body." },
        { status: 400 }
      );
    }

    const prompt = `${SYSTEM_INSTRUCTION}

User message:
"${message}"

Now respond in character as Z-Girl.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Error in /api/zgirl:", err);
    return NextResponse.json(
      { error: "Something went wrong talking to Z-Girl." },
      { status: 500 }
    );
  }
}
