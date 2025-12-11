"use client";

import React, {
  useEffect,
  useState,
  useRef,
  KeyboardEvent,
  MouseEvent,
} from "react";
import Link from "next/link";
import InstallPWAButton from "../components/InstallPWAButton";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type HeroMoment = {
  id: string;
  text: string;
  mood: string | null;
  createdAt: number;
};

const STORAGE_KEY = "zgirl-hero-chat-v1";
const HERO_KEY = "zgirl-hero-moments-v1";

const SYSTEM_PROMPT = `You are Z-Girl, a warm, upbeat Black teen superhero from The 4 Lessons universe. 
You are a *digital hero coach* for kids and teens, and sometimes for caring adults who want to support them.

WHO YOU ARE
- You speak like an encouraging big sister / mentor.
- You use simple, clear language that a 10–16 year old can understand.
- You sometimes use gentle "hero" metaphors (hero moves, power-ups, inner villain, shield, cape), but never so much that it feels cheesy or confusing.
- You are always respectful of different families, cultures, and beliefs.

WHAT YOU CAN HELP WITH
- Stress from school, homework, tests or grades
- Big feelings (worry, sadness, anger, frustration, feeling overwhelmed)
- Friend drama, bullying, social media stress
- Confidence, self-talk, and motivation
- Simple coping skills: breathing, grounding, journaling, talking to trusted adults
- Planning small, realistic "hero moves" the user can try in real life

BOUNDARIES (VERY IMPORTANT)
- You are NOT a doctor, therapist, counselor, lawyer, or emergency service.
- You NEVER give medical advice, clinical diagnoses, medication advice, or legal instructions.
- You NEVER tell someone to hide serious harm from a trusted adult.
- You NEVER encourage self-harm, revenge, violence, or breaking laws.
- You NEVER say you can keep someone completely safe or fix everything.

CRISIS & SAFETY (CRITICAL)
If the user mentions:
- wanting to die, kill themselves, self-harm, cutting, overdose, or "ending it"
- wanting to seriously hurt someone else
- being abused, assaulted, or feeling unsafe at home, at school, or in a relationship

THEN you MUST:
1) Respond gently and seriously, e.g.:
   - "I’m really glad you told me. Your safety matters a lot."
2) Clearly say that you are just a digital hero coach and *not* an emergency service.
3) Encourage them to reach out to:
   - a parent or caregiver they trust,
   - a school counselor, teacher, or coach,
   - another trusted adult in their life.
4) If they are in immediate danger, tell them to contact emergency services in their area
   (for example, 911 in the United States) or a local crisis hotline.

CONVERSATION STYLE
- Ask 1–2 short clarifying questions before giving long advice, unless the situation is clearly urgent.
- Keep responses focused and digestible: usually 3–6 sentences.
- Include one concrete "hero move" the user can try (a small step, not a huge life change).
- When the user is very stressed, often suggest a simple regulation skill:
  - breathing exercise
  - grounding ("name 3 things you can see right now")
  - taking a short break or getting a drink of water
- Validate feelings first ("It makes sense you feel that way") before giving suggestions.
- Avoid lecture-y or preachy tones. You are a partner, not a parent.

HOLIDAY / SEASONAL MODE
- If the user mentions holidays, winter break, family gatherings, or the song
  "Unwrap the Hero Within", you can lean into that theme.
- Connect "unwrapping the hero within" to noticing their strengths, courage, and kindness.
- Keep it gentle and inclusive; do not assume specific religious beliefs.

OVERALL GOAL
Help the user feel seen, calmer, and a little more hopeful, and help them choose one small
next "hero move" they can actually do in their real life.`;

const STARTER_SUGGESTIONS: string[] = [
  "I’m feeling stressed about school.",
  "My family is arguing and it’s making me anxious.",
  "I want to feel more confident about myself.",
  "I’m sad and I don’t really know why.",
  "How can I calm down when my feelings feel too big?",
];

const MOODS = ["Stressed", "Sad", "Worried", "Angry", "Tired", "Excited"];

// Floating helper quick tips
const QUICK_TIPS: { id: string; title: string; body: string; suggestion?: string }[] =
  [
    {
      id: "breathe-10",
      title: "10-second breathing hero move",
      body: "Breathe in for 4, hold for 2, out for 4. Try it twice and just notice how your body feels.",
      suggestion: "Can you walk me through that 10-second breathing hero move again?",
    },
    {
      id: "ground-3",
      title: "Look around hero scan",
      body: "Name 3 things you can see, 2 things you can feel, and 1 thing you can hear right now.",
      suggestion: "Help me do the 3-2-1 grounding exercise.",
    },
    {
      id: "tiny-win",
      title: "Tiny hero win",
      body: "Think of one tiny thing you did well today (even if it feels small). That still counts as a hero move.",
      suggestion: "Can you help me notice a small win from today?",
    },
    {
      id: "adult",
      title: "Trusted adult check-in",
      body: "If something feels heavy or scary, talking to a trusted adult is a powerful hero move, not a weakness.",
      suggestion: "I think I might need to talk to an adult. How should I start?",
    },
  ];

// Guided breathing steps
const BREATHING_STEPS = [
  {
    id: "inhale",
    label: "Inhale",
    subtitle: "Breathe in gently through your nose.",
    countText: "4 seconds in",
  },
  {
    id: "hold",
    label: "Hold",
    subtitle: "Hold your breath softly. No need to strain.",
    countText: "2 seconds hold",
  },
  {
    id: "exhale",
    label: "Exhale",
    subtitle: "Breathe out slowly through your mouth.",
    countText: "4 seconds out",
  },
];

function makeId(suffix = ""): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}${suffix}`;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [heroMoments, setHeroMoments] = useState<HeroMoment[]>([]);
  const [showVideoScript, setShowVideoScript] = useState(false);
  const [videoScript, setVideoScript] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingStepIndex, setBreathingStepIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Load stored conversation on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Load stored hero moments
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(HERO_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHeroMoments(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist conversation
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Persist hero moments
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HERO_KEY, JSON.stringify(heroMoments));
    } catch {
      // ignore
    }
  }, [heroMoments]);

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Breathing step cycle
  useEffect(() => {
    if (!showBreathing) return;

    setBreathingStepIndex(0);
    const interval = setInterval(() => {
      setBreathingStepIndex((prev) => (prev + 1) % BREATHING_STEPS.length);
    }, 4000); // 4 seconds per step (fits 4-2-4 rhythm enough for youth)

    return () => clearInterval(interval);
  }, [showBreathing]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    setErrorBanner(null);

    const userMessage: ChatMessage = {
      id: makeId("u"),
      role: "user",
      text: input.trim(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          systemPrompt: SYSTEM_PROMPT,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      if (!resp.ok) {
        throw new Error(`Server error: ${resp.status}`);
      }

      const data = await resp.json();
      const assistantText =
        data.reply ?? "I’m here with you. Let’s try that again in a moment. 💙";

      const assistantMessage: ChatMessage = {
        id: makeId("a"),
        role: "assistant",
        text: assistantText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setErrorBanner(
        "Z-Girl ran into a little tech glitch. Try again in a moment, or refresh if it keeps happening."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearConversation = () => {
    if (!window.confirm("Clear this hero conversation with Z-Girl?")) return;
    setMessages([]);
    setErrorBanner(null);
    setShowVideoScript(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  const handleSaveHeroMoment = () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) {
      setErrorBanner(
        "I need a message from Z-Girl to save as a hero moment. Ask her something first. 💬"
      );
      return;
    }

    const moment: HeroMoment = {
      id: makeId("hm"),
      text: lastAssistant.text,
      mood: selectedMood,
      createdAt: Date.now(),
    };

    setHeroMoments((prev) => {
      const updated = [moment, ...prev];
      return updated.slice(0, 20); // keep top 20
    });
  };

  const handleClearHeroMoments = () => {
    setHeroMoments([]);
  };

  const handleVideoScript = () => {
    if (messages.length === 0) {
      setErrorBanner(
        "Share something with Z-Girl first so we can turn it into a hero video script. 🎬"
      );
      return;
    }

    const lastFew = messages.slice(-4);
    const userLines = lastFew
      .filter((m) => m.role === "user")
      .map((m) => `User: ${m.text}`);
    const assistantLines = lastFew
      .filter((m) => m.role === "assistant")
      .map((m) => `Z-Girl: ${m.text}`);

    const lines = [...userLines, ...assistantLines];

    const moodLine = selectedMood ? `Mood: ${selectedMood}\n` : "";

    const script = `Hero Video Script Idea
=======================

${moodLine}Scene: Cozy animated holiday room with gentle snowfall outside. 
Soft instrumental version of "Unwrap the Hero Within" is playing in the background.

${lines.join("\n")}

Stage Direction: End on Z-Girl smiling with a gentle glow and the words:
"Unwrap the Hero Within."`;

    setVideoScript(script);
    setShowVideoScript(true);

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(script).catch(() => {
        // ignore
      });
    }
  };

  const handleMoodClick = (mood: string) => {
    setSelectedMood((prev) => (prev === mood ? null : mood));
  };

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!(e.target instanceof HTMLElement)) return;
    const dataText = e.target.dataset["text"];
    if (dataText) {
      handleSuggestionClick(dataText);
    }
  };

  const handleQuickTipClick = (suggestion?: string) => {
    if (!suggestion) return;
    handleSuggestionClick(suggestion);
    setShowTips(false);
    setShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const currentBreathingStep = BREATHING_STEPS[breathingStepIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* HERO INTRO SECTION */}
      {!showChat && (
        <section className="min-h-screen flex items-center justify-center px-6 py-10">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Top badges */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wide">
              <span className="px-2 py-1 rounded-full border border-emerald-400/70 bg-emerald-400/10 text-emerald-300 inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE COACH
              </span>
              <span className="px-2 py-1 rounded-full border border-sky-400/70 bg-sky-400/10 text-sky-300">
                HOLIDAY HERO MODE
              </span>
            </div>

            {/* Reassurance line for parents & educators */}
            <p className="text-[11px] text-slate-400 mt-1">
              A gentle hero-coach for youth reflection — not a therapist or emergency
              service.
            </p>

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight mt-2">
              Meet Z-Girl,{" "}
              <span className="text-teal-300">Your Hero Coach</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-slate-300">
              Feeling stressed, overwhelmed, or stuck? Z-Girl helps you manage
              challenges and{" "}
              <span className="text-teal-300 font-semibold">
                unwrap the hero within
              </span>{" "}
              — one small step at a time.
            </p>

       {/* Z-Girl portrait with hero glow animation */}
<div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48">
  <div className="zgirl-hero-avatar bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 p-1 rounded-full">
    <img
      src="/icons/zgirl-icon-1024.png"
      alt="Z-Girl Hero Coach"
      className="h-full w-full rounded-full object-cover"
    />
  </div>
</div>

         {/* CTA: Start Session */}
<button
  onClick={() => {
    setShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }}
  className="w-full inline-flex items-center justify-center rounded-full bg-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-400/40 hover:bg-teal-300 active:bg-teal-500 transition transform hover:-translate-y-0.5 active:translate-y-[1px]"
>
  Start Session
</button>

<div className="flex flex-col items-center gap-1">
  {/* Skip intro */}
  <button
    onClick={() => {
      setShowChat(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }}
    className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
  >
    Skip intro · Go to chat
  </button>

  {/* Learn more link */}
  <Link
    href="/hero"
    className="text-[11px] text-sky-300 hover:text-sky-200 underline underline-offset-2"
  >
    Learn more about Z-Girl &amp; this app
  </Link>
</div>

            {/* Microcopy */}
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Private, judgment-free, hero-powered guidance. Z-Girl can&apos;t
              provide medical, crisis, or emergency help.
            </p>
          </div>
        </section>
      )}

      {/* CHAT APP SECTION */}
      {showChat && (
        <main className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center px-4 py-10">
          <div className="w-full max-w-4xl rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl shadow-cyan-500/10 px-6 py-6 md:px-10 md:py-8">
            {/* Top badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE COACH
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-3 py-1 text-sky-300 font-semibold">
                HOLIDAY HERO MODE
              </span>
            </div>

            {/* Title + subtitle */}
            <header className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
                Z-Girl: Hero Coach
                <span className="block text-lg md:text-xl text-sky-300">
                  Unwrap the Hero Within
                </span>
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-300 max-w-xl">
                This is a cozy, kid-friendly space to talk about stress, big feelings,
                family drama, school, and self-confidence. Z-Girl is here as a gentle
                hero coach—not a doctor or therapist—to help you find your next small
                hero move.
              </p>
            </header>

            {/* Mood chips + breathing CTA */}
            <section className="mb-4 space-y-2">
              <div>
                <p className="text-xs text-slate-400 mb-2">
                  How are you feeling today? (Optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => {
                    const isSelected = selectedMood === mood;
                    return (
                      <button
                        key={mood}
                        onClick={() => handleMoodClick(mood)}
                        className={[
                          "px-3 py-1 rounded-full border text-xs font-medium transition",
                          isSelected
                            ? "bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.35)]"
                            : "bg-slate-800/80 border-slate-700 text-slate-200 hover:border-sky-400/60 hover:text-sky-200",
                        ].join(" ")}
                      >
                        {mood}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMood && (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] text-slate-400">
                    Feeling <span className="font-semibold text-slate-200">{selectedMood}</span>? Try a quick breathing hero move:
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowBreathing(true)}
                    className="inline-flex items-center gap-1 rounded-full bg-sky-500/90 px-3 py-1 text-[11px] font-semibold text-slate-950 shadow-md shadow-sky-500/40 hover:bg-sky-400 transition"
                  >
                    <span>Start breathing hero move</span>
                  </button>
                </div>
              )}
            </section>

            {/* Error banner */}
            {errorBanner && (
              <div className="mb-3 rounded-xl border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                {errorBanner}
              </div>
            )}

            {/* Chat + right panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] gap-6">
              {/* Chat column */}
              <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/60">
                {/* Chat scroll area */}
                <div
                  ref={scrollRef}
                  className="flex-1 min-h-[260px] max-h-[420px] overflow-y-auto px-3 pt-3 pb-2 space-y-2"
                >
                  {messages.length === 0 && (
                    <div className="text-xs text-slate-400 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-3 mb-2">
                      <p className="mb-1">
                        👋 Hey! I&apos;m{" "}
                        <span className="font-semibold text-sky-300">
                          Z-Girl
                        </span>
                        , your hero coach. You can:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Tell me what&apos;s stressing you out</li>
                        <li>Ask for help with big feelings or tricky situations</li>
                        <li>Practice a quick &quot;hero move&quot; to feel a bit better</li>
                      </ul>
                    </div>
                  )}

                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.role === "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >
                      <div
                        className={[
                          "max-w-[85%] rounded-2xl px-3 py-2 text-xs md:text-sm whitespace-pre-wrap transition-transform duration-200",
                          m.role === "user"
                            ? "bg-sky-600 text-white rounded-br-sm"
                            : "bg-slate-800 text-slate-50 rounded-bl-sm border border-slate-700/80",
                        ].join(" ")}
                      >
                        {m.role === "assistant" && (
                          <div className="mb-1 text-[10px] font-semibold text-sky-300">
                            Z-GIRL
                          </div>
                        )}
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator with animated dots */}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-2xl px-3 py-2 bg-slate-800/90 border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-bounce [animation-delay:-0.2s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-bounce [animation-delay:-0.1s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-bounce" />
                        </div>
                        <span className="text-[11px] text-slate-200">
                          Z-Girl is thinking about your next hero move…
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="border-t border-slate-800 bg-slate-950/80 rounded-b-2xl px-3 py-2 space-y-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-1.5 text-xs md:text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400"
                    placeholder="Tell Z-Girl what’s going on, or ask a question…"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/40 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-400 transition transform hover:-translate-y-0.5 active:translate-y-[1px]"
                    >
                      <span>Send</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearConversation}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
                    >
                      Clear chat
                    </button>
                  </div>
                </div>
              </section>

              {/* Right column: suggestions + hero moments + extras */}
              <aside className="space-y-4 text-xs">
                {/* Suggestions */}
                <section
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-3 space-y-2"
                  onClick={handleCardClick}
                >
                  <h2 className="text-[11px] font-semibold text-slate-200 mb-1">
                    Try one of these to start:
                  </h2>
                  <div className="grid grid-cols-1 gap-2">
                    {STARTER_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="w-full text-left rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-[11px] text-slate-200 hover:border-sky-400/70 hover:bg-slate-900 transition"
                        data-text={s}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Hero moments */}
                <section className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[11px] font-semibold text-emerald-200">
                      Saved Hero Moments
                    </h2>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSaveHeroMoment}
                        className="text-[11px] rounded-full bg-emerald-400/90 px-3 py-1 font-semibold text-slate-950 hover:bg-emerald-300 transition"
                      >
                        Save last reply
                      </button>
                      {heroMoments.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearHeroMoments}
                          className="text-[10px] text-emerald-200/80 hover:text-emerald-100 underline underline-offset-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {heroMoments.length === 0 ? (
                    <p className="text-[11px] text-emerald-100/80">
                      After Z-Girl says something that really helps, tap{" "}
                      <span className="font-semibold">Save last reply</span> and it
                      will show up here as a &quot;hero moment&quot; you can revisit.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {heroMoments.map((moment) => (
                        <div
                          key={moment.id}
                          className="rounded-xl bg-slate-900/90 border border-emerald-500/40 px-3 py-2"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-emerald-200">
                              Z-Girl Hero Moment
                            </span>
                            {moment.mood && (
                              <span className="text-[10px] rounded-full bg-emerald-500/10 border border-emerald-400/60 px-2 py-0.5 text-emerald-100">
                                {moment.mood}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-emerald-50 whitespace-pre-wrap">
                            {moment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Hero video script generator */}
                <section className="rounded-2xl border border-sky-500/50 bg-sky-500/5 px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-semibold text-sky-200">
                      Turn this into a hero video script
                    </h2>
                    <button
                      type="button"
                      onClick={handleVideoScript}
                      className="text-[11px] rounded-full bg-sky-400/90 px-3 py-1 font-semibold text-slate-950 hover:bg-sky-300 transition"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-[11px] text-sky-100/80">
                    We&apos;ll stitch together a short, cozy script idea based on your
                    recent chat with Z-Girl that could work for a talking video, reel,
                    or animated short.
                  </p>

                  {showVideoScript && (
                    <div className="mt-2 rounded-xl bg-slate-950/90 border border-sky-500/50 px-3 py-2 max-h-40 overflow-y-auto text-[11px] text-sky-50 whitespace-pre-wrap">
                      {videoScript}
                    </div>
                  )}
                </section>
              </aside>
            </div>

            {/* Footer disclaimer */}
            <footer className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[10px] text-slate-500">
                <p className="max-w-xl leading-relaxed">
                  Z-Girl is a fictional &quot;hero coach&quot; based on{" "}
                  <span className="font-semibold text-slate-300">
                    The 4 Lessons
                  </span>{" "}
                  universe. This app is for learning, encouragement, and reflection.
                  It&apos;s not a replacement for a counselor, therapist, doctor, or
                  emergency service. If you&apos;re feeling overwhelmed, in danger, or
                  unsafe, please reach out to a trusted adult, counselor, or local
                  professional right away.
                </p>

             <div className="flex flex-col items-start md:items-end gap-1">
  <InstallPWAButton />
  <Link
    href="/hero"
    className="text-[10px] text-sky-300 hover:text-sky-200 underline underline-offset-2"
  >
    About Z-Girl Hero Coach
  </Link>
  <Link
    href="/safety"
    className="text-[10px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
  >
    Safety &amp; Use Guidelines
  </Link>
</div>
              </div>
            </footer>
          </div>
        </main>
      )}

      {/* Floating hero helper (shows on both intro & chat) */}
      <div className="fixed bottom-4 right-4 z-40">
        {/* Tips panel */}
        {showTips && (
          <div className="mb-3 w-72 max-w-[80vw] rounded-2xl border border-slate-700 bg-slate-900/95 shadow-lg shadow-sky-500/20 px-3 py-3 text-xs text-slate-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full overflow-hidden border border-sky-400/70 shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                  <img
                    src="/icons/zgirl-icon-192.png"
                    alt="Z-Girl avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-semibold text-sky-200">
                  Z-Girl&apos;s Hero Tips
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTips(false)}
                className="text-[11px] text-slate-400 hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-300 mb-2">
              Need a quick hero move idea? Tap one of these, and I can help you use it
              in chat.
            </p>

            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {QUICK_TIPS.map((tip) => (
                <button
                  key={tip.id}
                  type="button"
                  onClick={() => handleQuickTipClick(tip.suggestion)}
                  className="w-full text-left rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 hover:border-sky-400/70 hover:bg-slate-800 transition"
                >
                  <div className="text-[11px] font-semibold text-sky-200">
                    {tip.title}
                  </div>
                  <div className="text-[11px] text-slate-200 mt-0.5">
                    {tip.body}
                  </div>
                  {tip.suggestion && (
                    <div className="mt-1 text-[10px] text-sky-300 underline underline-offset-2">
                      Use this in chat →
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floating button */}
        <button
          type="button"
          onClick={() => setShowTips((prev) => !prev)}
          className="relative h-12 w-12 rounded-full border border-sky-400/70 bg-slate-900/90 shadow-[0_0_20px_rgba(56,189,248,0.6)] flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label="Open Z-Girl hero tips"
        >
          <div className="absolute inset-0 rounded-full bg-sky-400/10 animate-pulse" />
          <img
            src="/icons/zgirl-icon-192.png"
            alt="Z-Girl helper"
            className="relative h-9 w-9 rounded-full object-cover border border-slate-900"
          />
        </button>
      </div>

      {/* Fullscreen Hero Breathing Flow */}
      {showBreathing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm px-4">
          <div className="max-w-md w-full rounded-3xl border border-sky-500/40 bg-slate-900/90 shadow-[0_0_40px_rgba(56,189,248,0.6)] px-6 py-6 space-y-4 text-center">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-slate-400">
                Z-Girl&apos;s Hero Breathing
              </p>
              <button
                type="button"
                onClick={() => setShowBreathing(false)}
                className="text-[11px] text-slate-400 hover:text-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <h2 className="text-lg font-semibold text-slate-50">
              Let&apos;s take a few hero breaths together
            </h2>
            <p className="text-xs text-slate-300">
              You don&apos;t have to do it perfectly. Just follow the circle and the
              words. If your mind wanders, that&apos;s okay—just gently come back.
            </p>

            {/* Glowing breathing orb */}
            <div className="flex items-center justify-center py-2">
              <div
                className={[
                  "relative h-36 w-36 sm:h-40 sm:w-40 rounded-full border border-sky-400/80 bg-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.7)] flex items-center justify-center transition-transform duration-700 ease-out",
                  currentBreathingStep.id === "inhale"
                    ? "scale-110"
                    : currentBreathingStep.id === "hold"
                    ? "scale-100"
                    : "scale-90",
                ].join(" ")}
              >
                <div className="absolute inset-0 rounded-full bg-sky-400/20 blur-2xl animate-pulse" />
                <div className="relative text-center space-y-1">
                  <div className="text-sm font-semibold text-sky-100">
                    {currentBreathingStep.label}
                  </div>
                  <div className="text-[11px] text-slate-100">
                    {currentBreathingStep.countText}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-200">
              {currentBreathingStep.subtitle}
            </p>

            <p className="text-[11px] text-slate-400">
              Try a few full cycles. When you&apos;re ready, tap{" "}
              <span className="font-semibold text-slate-200">Done</span> to go back
              to chatting with Z-Girl.
            </p>

            <button
              type="button"
              onClick={() => setShowBreathing(false)}
              className="mt-1 inline-flex items-center justify-center rounded-full bg-sky-400/90 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/40 hover:bg-sky-300 transition"
            >
              Done · Back to chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
