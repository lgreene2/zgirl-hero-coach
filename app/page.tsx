// app/page.tsx
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  KeyboardEvent,
  MouseEvent,
} from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
};

type HeroMoment = {
  id: string;
  text: string;
  mood?: string | null;
  createdAt: number;
};

const STORAGE_KEY = "zgirl-hero-coach-chat-v1";
const HERO_KEY = "zgirl-hero-moments-v1";

const STARTER_PROMPTS = [
  "I’m stressed about money and family drama this holiday.",
  "I feel lonely and left out during the holidays.",
  "I’m overwhelmed with school, family, and everything.",
  "I want to feel more confident about myself.",
];

const MOODS = ["Stressed", "Sad", "Worried", "Angry", "Tired", "Excited"];

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

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Load conversation + hero moments on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }

    try {
      const rawHero = window.localStorage.getItem(HERO_KEY);
      if (rawHero) {
        const parsed = JSON.parse(rawHero) as HeroMoment[];
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

  // Auto-scroll when messages or loading change
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = async () => {
    if (loading) return;
    const trimmed = input.trim();
    if (!trimmed) return;

    setErrorBanner(null);
    setShowVideoScript(false); // hide old script when new chat continues

    const newUserMessage: ChatMessage = {
      id: makeId("u"),
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
    };

    const newHistory = [...messages, newUserMessage];

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    try {
      const historyForServer = newHistory.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historyForServer,
          mood: selectedMood,
        }),
      });

      const data = await res.json();
      const replyText: string =
        (data && typeof data.reply === "string" && data.reply) ||
        (res.ok
          ? "Hmm, my connection glitched for a second. Try again, hero. 💚"
          : "Something went wrong talking to my AI brain. 💻");

      const newAssistant: ChatMessage = {
        id: makeId("a"),
        role: "assistant",
        text: replyText,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, newAssistant]);

      if (!res.ok) {
        setErrorBanner(
          "Z-Girl had a hiccup talking to Gemini. Check your API key or console logs."
        );
      }
    } catch (err) {
      console.error(err);
      const fallback: ChatMessage = {
        id: makeId("err"),
        role: "assistant",
        text: "Z-Girl here — I hit a network snag. Please check your internet and try again, hero. 🌐",
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, fallback]);
      setErrorBanner("Network error while calling the Gemini API.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleStarterClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleNewConversation = () => {
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
      // keep top 20 to avoid huge storage
      return updated.slice(0, 20);
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

    const recent = messages.slice(-8);
    const moodLine = selectedMood ? `Current mood tag: ${selectedMood}\n\n` : "";

    const lines = recent.map((m) => {
      const speaker = m.role === "user" ? "HERO" : "Z-GIRL";
      return `${speaker}: ${m.text}`;
    });

    const script = `Z-Girl "Unwrap the Hero Within" Pep Talk Script
${new Date().toLocaleString()}

${moodLine}Scene: Cozy animated holiday room with gentle snowfall outside. 
Soft instrumental version of "Unwrap the Hero Within" is playing in the background.

${lines.join("\n")}

Stage Direction: End on Z-Girl smiling with a gentle glow and the words:
"Unwrap the Hero Within."`;

    setVideoScript(script);
    setShowVideoScript(true);

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(script).catch(() => {
        // ignore clipboard failures
      });
    }
  };

  const handleMoodClick = (m: string) => {
    setSelectedMood((prev) => (prev === m ? null : m));
  };

  const handleClearConversationLink = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleNewConversation();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl shadow-cyan-500/10 px-6 py-6 md:px-10 md:py-8">
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
         <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Z-Girl: <span className="text-sky-400">Hero Coach</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300">
          Feeling stressed, tired, or stuck? Tell Z-Girl what&apos;s going on and
          she&apos;ll help you <span className="text-sky-300 font-semibold">“Unwrap the Hero Within.”</span>
        </p>

          <button
            onClick={handleClearConversationLink}
            className="mt-2 text-xs text-sky-300 hover:text-sky-200 underline underline-offset-4"
          >
            Clear conversation
          </button>
        </header>

        {/* Mood selector */}
        <section className="mb-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase mb-1">
            How are you feeling right now?
          </p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => {
              const active = selectedMood === mood;
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => handleMoodClick(mood)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    active
                      ? "border-sky-400 bg-sky-500/20 text-sky-100"
                      : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-sky-400/70 hover:text-sky-100",
                  ].join(" ")}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </section>

        {/* Error banner */}
        {errorBanner && (
          <div className="mb-4 rounded-xl border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            {errorBanner}
          </div>
        )}

        {/* Conversation */}
        <section className="mb-5">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase mb-1">
            Conversation
          </p>

          <div
            ref={scrollRef}
            className="h-64 md:h-72 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 md:p-4 overflow-y-auto space-y-3"
          >
            {messages.length === 0 && (
              <div className="text-xs text-slate-400">
                Start by telling Z-Girl what&apos;s going on with your holidays, stress,
                or goals. She&apos;s your encouraging hero coach, not a therapist or
                doctor.
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
                    "max-w-[85%] rounded-2xl px-3 py-2 text-xs md:text-sm whitespace-pre-wrap",
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

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                Z-Girl is thinking about your next hero move…
              </div>
            )}
          </div>
        </section>

        {/* Quick starters */}
        <section className="mb-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase mb-1">
            Quick starters
          </p>
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleStarterClick(prompt)}
                className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200 hover:border-sky-400 hover:text-sky-100 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        {/* Input */}
        <section className="mb-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase mb-1">
            Tell Z-Girl what&apos;s going on…
          </p>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Holiday stress, family drama, goals, worries, etc."
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
          />
        </section>

        {/* Actions row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNewConversation}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 hover:border-sky-400 hover:text-sky-100"
            >
              Start a new conversation
            </button>
            <button
              type="button"
              onClick={handleSaveHeroMoment}
              className="inline-flex items-center justify-center rounded-full border border-emerald-500/70 bg-emerald-600/20 px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-500/25"
            >
              ❤️ Save hero moment
            </button>
            <button
              type="button"
              onClick={handleVideoScript}
              className="inline-flex items-center justify-center rounded-full border border-sky-500/70 bg-sky-600/20 px-3 py-1.5 text-xs text-sky-100 hover:bg-sky-500/25"
            >
              🎬 Copy video script
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={sendMessage}
            className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
              loading
                ? "bg-slate-700 text-slate-300 cursor-not-allowed"
                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            }`}
          >
            {loading ? "Z-Girl is thinking…" : "Ask Z-Girl"}
          </button>
        </div>

        {/* Hero moments panel */}
        {heroMoments.length > 0 && (
          <section className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 px-3 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-200 uppercase">
                Saved hero moments
              </p>
              <button
                type="button"
                onClick={handleClearHeroMoments}
                className="text-[10px] text-emerald-200/80 hover:text-emerald-100 underline underline-offset-4"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {heroMoments.map((hm) => (
                <div
                  key={hm.id}
                  className="rounded-xl bg-emerald-900/40 border border-emerald-700/60 px-3 py-2 text-[11px] text-emerald-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">Z-Girl</span>
                    <span className="text-[10px] text-emerald-200/70">
                      {new Date(hm.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {hm.mood && (
                    <div className="mb-1 text-[10px] text-emerald-200/80">
                      Mood tag: {hm.mood}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{hm.text}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Video script panel */}
        {showVideoScript && (
          <section className="mb-4 rounded-2xl border border-sky-500/50 bg-sky-950/30 px-3 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-sky-200 uppercase">
                Hero video script draft
              </p>
              <button
                type="button"
                onClick={() => setShowVideoScript(false)}
                className="text-[10px] text-sky-200/80 hover:text-sky-100 underline underline-offset-4"
              >
                Hide
              </button>
            </div>
            <p className="text-[11px] text-sky-100 mb-2">
              This script has been copied to your clipboard (when allowed). Paste
              it into Google AI Studio, a video maker, or your editor and adjust as
              needed.
            </p>
            <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-950/70 px-3 py-2 text-[11px] text-sky-50 font-mono">
              {videoScript}
            </pre>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-4 border-t border-slate-800 pt-3">
          <p className="text-[10px] leading-relaxed text-slate-500">
            Z-Girl is here to encourage you and help you practice healthy coping
            skills. She&apos;s not a therapist or doctor, and she can&apos;t give
            medical, legal, or emergency help. If you&apos;re feeling overwhelmed
            or unsafe, please reach out to a trusted adult, counselor, or local
            professional right away.
          </p>
        </footer>
      </div>
    </main>
  );
}
