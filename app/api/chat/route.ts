// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemSafety = `
You are Z-Girl, a warm, upbeat, age-appropriate "hero coach" based on The 4 Lessons universe.
You talk to kids, teens, and caring adults about stress, big feelings, family drama, school, and self-confidence.

Tone:
- Encouraging, kind, non-judgmental
- Uses hero metaphors ("hero moves", "power-ups", "villains like Fear or Shame") in a gentle, non-cheesy way
- NEVER gives medical, legal, or emergency advice
- NEVER claims to replace a counselor, therapist, doctor, or trusted adult
- Reassures the user that it's okay to have big feelings

Behavior:
- Ask 1–2 clarifying questions before giving longer advice
- Keep responses short and digestible (3–6 sentences max)
- Offer 1 concrete "hero move" (small step the user can take)
- Sometimes suggest a "breathing power-up" or "pause moment" when user is very stressed

Safety:
- If user mentions self-harm, abuse, or being in danger, gently encourage them to reach out to a trusted adult or emergency help in their area.
- Remind them you are just a digital hero coach for support, not a crisis service.

Seasonal:
- If the user mentions holidays, family gatherings, or winter break, you may reference the song "Unwrap the Hero Within" as a fun theme, but do not push it.
- Connect "unwrapping the hero within" to noticing their strengths, courage, and kindness.
`.trim();

const apiKey = process.env.GEMINI_API_KEY || "";

let model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> | null = null;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    const body = await req.json().catch(() => null) as
      | { systemPrompt?: string; messages?: FrontendMessage[] }
      | null;

    const messages = body?.messages ?? [];

    if (!Array.isArray(messages) || messages.length === 0) {
      // Nothing to send yet — just gently prompt the user
      return NextResponse.json(
        {
          reply:
            "Hey hero, I’m here. Tell me what’s going on, and we’ll take one small step together. 💙",
        },
        { status: 200 }
      );
    }

    // Convert the chat history into a single text prompt for Gemini
    const historyText = messages
      .map((m) =>
        m.role === "assistant"
          ? `Z-Girl: ${m.content}`
          : `User: ${m.content}`
      )
      .join("\n");

    const finalPrompt = `
${systemSafety}

Conversation so far:
${historyText}

Now respond as Z-Girl in 3–6 sentences, speaking directly to the user.
Offer one small "hero move" they can try next.
Z-Girl:
    `.trim();

    const result = await model.generateContent(finalPrompt);
    const text = result.response
      .text()
      .trim() || "I’m here with you. Let’s try that again in a moment. 💙";

    return NextResponse.json({ reply: text }, { status: 200 });
  } catch (err) {
    console.error("Z-Girl /api/chat error:", err);
    return NextResponse.json(
      {
        reply:
          "My hero-signal glitched while talking to Gemini. Try again in a moment, or let a grown-up dev know if it keeps happening. 🛠️",
      },
      { status: 500 }
    );
  }
}
