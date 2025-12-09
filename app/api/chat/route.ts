// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are Z-Girl, a music-powered young superhero from The 4Lessons Universe.

Your mission is to encourage, empower, and gently coach youth and families
to "Unwrap the Hero Within," especially around holiday stress and emotions.

Tone: warm, upbeat, kind, never shaming, never giving medical, legal,
or financial advice. Always remind users that you're a hero coach,
not a therapist or doctor. Never claim to diagnose or treat anything.
`.trim();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI
  ? genAI.getGenerativeModel({ model: "gemini-flash-latest" })
  : null;

type HistoryItem = { role: "user" | "assistant"; text: string };

export async function POST(req: NextRequest) {
  try {
    if (!apiKey || !genAI || !model) {
      console.error("GEMINI_API_KEY is missing or invalid.");
      return NextResponse.json(
        {
          reply:
            "My hero-signal to Gemini isn’t working right now. Ask your grown-up dev to check my API key. 🛠️",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const message = (body?.message ?? "").toString();
    const history = (body?.history ?? []) as HistoryItem[];
    const mood = typeof body?.mood === "string" ? body.mood : "";

    if (!message.trim()) {
      return NextResponse.json(
        {
          reply:
            "I didn’t catch anything, hero. Try typing your feelings or question again. 💫",
        },
        { status: 400 }
      );
    }

    // Keep prompt lean: only the last few turns
    const trimmedHistory = (history || []).slice(-6);

    const historyText = trimmedHistory
      .map((m) => (m.role === "user" ? `Hero: ${m.text}` : `Z-Girl: ${m.text}`))
      .join("\n");

    const heroLine = mood
      ? `New message from hero (current mood: ${mood}): ${message}`
      : `New message from hero: ${message}`;

    const fullPrompt =
      SYSTEM_PROMPT +
      (historyText
        ? `

Here’s our recent conversation. Use it to stay consistent and remember what
the hero is going through:

${historyText}`
        : "") +
      `

Now the hero just said: "${heroLine}".

Respond as Z-Girl in 3–6 sentences. Be kind, specific, and practical.
You can offer grounding ideas, reframes, or small next steps, but
never give medical, legal, financial, or physical-safety instructions.
Always remind them they can reach out to a trusted adult, counselor,
or professional for specialized help if things feel too heavy.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        },
      ],
    });

    const text = result.response.text().trim();

    if (!text) {
      return NextResponse.json(
        {
          reply:
            "My hero radio went quiet for a second. Can you try asking that one more time?",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ reply: text }, { status: 200 });
  } catch (err: any) {
    console.error("Gemini error:", err);
    const msg = typeof err?.message === "string" ? err.message : "";

    if (msg.includes("429") || msg.includes("rate limit")) {
      return NextResponse.json(
        {
          reply:
            "Whew, I just hit my chat limit for a moment. Give me a few seconds and try again, hero. 🌟",
        },
        { status: 200 }
      );
    }

    if (
      msg.includes("API key not valid") ||
      msg.includes("API_KEY_INVALID")
    ) {
      return NextResponse.json(
        {
          reply:
            "My access key to hero HQ isn’t working. Please ask your developer to double-check the Gemini API key. 🛠️",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        reply:
          "Something glitched on my side. Try refreshing the page and asking again — I’m still here for you. 💚",
      },
      { status: 200 }
    );
  }
}
