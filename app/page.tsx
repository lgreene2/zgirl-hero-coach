"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
  ts: number;
};

type HeroMoment = {
  id: string;
  text: string;
  createdAt: number;
};

type SuggestedPrompt = {
  id: string;
  label: string;
  prompt: string;
};

type MoodTag = "Stressed" | "Sad" | "Worried" | "Angry" | "Tired" | "Excited";

const STORAGE_KEYS = {
  CHAT: "zgirl-hero-chat",
  HERO_MOMENTS: "zgirl-hero-moments",
  ONBOARDING_SEEN: "zgirl-onboarding-seen",
};

/** Quick helpers for safe localStorage access in the browser */
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

/** Main page component */
export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() =>
    loadFromStorage<Message[]>(STORAGE_KEYS.CHAT, [])
  );
  const [pendingText, setPendingText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [heroMoments, setHeroMoments] = useState<HeroMoment[]>(() =>
    loadFromStorage<HeroMoment[]>(STORAGE_KEYS.HERO_MOMENTS, [])
  );
  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.ONBOARDING_SEEN);
      return raw ? false : true;
    } catch {
      return true;
    }
  });

  const chatRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /** --- NEW: voice + avatar “speaking” state --- */
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [greetingPlayed, setGreetingPlayed] = useState(false);

  const playGreeting = useCallback(() => {
    if (typeof window === "undefined") return;

    const hasSpeech =
      typeof window.speechSynthesis !== "undefined" &&
      typeof window.SpeechSynthesisUtterance !== "undefined";
    const hasAudio = typeof Audio !== "undefined";

    // Soft startup sound when greeting begins
    if (hasAudio) {
      try {
        const startup = new Audio("/sounds/zgirl-startup.mp3");
        startup.volume = 0.8;
        void startup.play().catch(() => {});
      } catch {
        // ignore audio errors
      }
    }

    if (!hasSpeech) {
      console.warn("Speech synthesis not supported.");
      return;
    }

    const synth = window.speechSynthesis;

    const utterance = new SpeechSynthesisUtterance(
      "Hey there! I'm Z-Girl, your hero coach. I'm here to help you manage big feelings and unwrap the hero within, one small step at a time."
    );

    // Prefer a friendly English female voice if possible
    const pickVoice = () => {
      const voices = synth.getVoices();
      if (!voices || !voices.length) return null;

      const preferred = voices.find((v) => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        return (
          (lang.startsWith("en-us") || lang.startsWith("en")) &&
          (name.includes("female") ||
            name.includes("woman") ||
            name.includes("girl") ||
            name.includes("emma") ||
            name.includes("olivia") ||
            name.includes("sara") ||
            name.includes("sarah"))
        );
      });

      if (preferred) return preferred;

      return (
        voices.find((v) => v.lang.toLowerCase().startsWith("en-us")) ??
        voices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
        voices[0]
      );
    };

    const voice = pickVoice();
    if (voice) utterance.voice = voice;

    utterance.pitch = 1.1; // slightly bright
    utterance.rate = 1.02; // just a little faster than default
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);

      // Gentle sparkle chime after the greeting
      if (hasAudio) {
        try {
          const chime = new Audio("/sounds/zgirl-chime.wav");
          chime.volume = 0.85;
          void chime.play().catch(() => {});
        } catch {
          // ignore
        }
      }
    };

    if (synth.speaking) {
      synth.cancel();
    }

    synth.speak(utterance);
    setGreetingPlayed(true);
  }, []);

  // Auto-run greeting once after first load
  useEffect(() => {
    if (greetingPlayed) return;

    const timer = setTimeout(() => {
      try {
        playGreeting();
      } catch (err) {
        console.error("Error playing greeting", err);
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [greetingPlayed, playGreeting]);

  /** Hero tips + prompts — unchanged from your version */
  const suggestedPrompts: SuggestedPrompt[] = useMemo(
    () => [
      {
        id: "school-stress",
        label: "I'm feeling stressed about school.",
        prompt:
          "I'm feeling stressed about school. Can you help me figure out one or two small things I can do next?",
      },
      {
        id: "family-arguing",
        label: "My family is arguing & it's making me anxious.",
        prompt:
          "My family has been arguing a lot and it's making me anxious. Can you help me calm down and think of a hero move I can make?",
      },
      {
        id: "confidence",
        label: "I want to feel more confident about myself.",
        prompt:
          "I want to feel more confident about myself. Can you coach me through one small confidence-building step?",
      },
      {
        id: "sad-dont-know-why",
        label: "I'm sad and I don't really know why.",
        prompt:
          "I'm feeling sad and I don't really know why. Can you help me name my feelings and find one gentle thing I can do for myself?",
      },
      {
        id: "big-feelings",
        label: "How can I calm down when my feelings feel too big?",
        prompt:
          "Sometimes my feelings get really big and overwhelming. Can you walk me through a calm-down plan, step by step?",
      },
    ],
    []
  );

  const heroTips: string[] = useMemo(
    () => [
      "Tiny steps still count as hero moves.",
      "You don't have to fix everything to make a difference.",
      "Talking about your feelings is a sign of strength, not weakness.",
      "Heroes ask for help when they need it.",
      "Rest is part of your training, not a failure.",
    ],
    []
  );

  /** Scroll helpers */
  useEffect(() => {
    if (!autoScroll) return;
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, autoScroll]);

  /** Persist chat + hero moments */
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CHAT, messages);
  }, [messages]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.HERO_MOMENTS, heroMoments);
  }, [heroMoments]);

  /** Onboarding dismiss helper */
  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEYS.ONBOARDING_SEEN, "true");
      } catch {
        // ignore
      }
    }
  }, []);

  /** Mood shortcuts */
  const handleMoodClick = (mood: MoodTag) => {
    setSelectedMood(mood);
    setShowChat(true);

    const starter =
      {
        Stressed: "I'm feeling stressed and overwhelmed.",
        Sad: "I'm feeling really sad today.",
        Worried: "I'm feeling worried and anxious.",
        Angry: "I'm feeling angry and frustrated.",
        Tired: "I'm feeling really tired and worn out.",
        Excited: "I'm excited but also a little nervous.",
      }[mood] ?? "I'm not sure how I'm feeling yet.";

    setPendingText(starter + " ");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /** Quick prompts */
  const handleQuickTipClick = (suggestion: string) => {
    setShowChat(true);
    setPendingText(suggestion);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  /** Save “hero moment” */
  const handleSaveHeroMoment = () => {
    if (!messages.length) return;
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");

    if (!lastAssistant) return;

    const moment: HeroMoment = {
      id: `${Date.now()}`,
      text: lastAssistant.text,
      createdAt: Date.now(),
    };
    setHeroMoments((prev) => [moment, ...prev].slice(0, 8));
  };

  /** Clear conversation */
  const handleClearChat = () => {
    setMessages([]);
    setPendingText("");
  };

  /** Send message to API */
  const handleSend = async () => {
    if (!pendingText.trim() || isSending) return;

    const userMessage: Message = {
      role: "user",
      text: pendingText.trim(),
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPendingText("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages,
          message: userMessage,
          mood: selectedMood,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as { reply: string };

      const assistantMessage: Message = {
        role: "assistant",
        text: data.reply,
        ts: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const assistantMessage: Message = {
        role: "assistant",
        text:
          "Whoops — my hero-signal is a little glitchy right now. Ask a grown-up to check the connection, or try again in a bit.",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const currentHeroTip = useMemo(
    () => heroTips[Math.floor(Math.random() * heroTips.length)],
    [heroTips]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top banner tabs */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300/90 font-semibold">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE COACH
          </div>
          <div className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/40 text-[11px] sm:text-xs text-sky-200 flex items-center gap-1">
            <span className="inline-flex h-1.5 w-5 bg-gradient-to-r from-sky-300 to-emerald-300 rounded-full animate-pulse" />
            HOLIDAY HERO MODE
          </div>
        </div>
      </header>

      {/* Main content container */}
      <section className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-10 lg:py-16 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-start">
          {/* LEFT COLUMN: hero intro + avatar */}
          <div className="space-y-8">
            {/* Safety tagline */}
            <p className="text-[11px] sm:text-xs text-slate-400 tracking-wide uppercase">
              A gentle hero-coach for youth reflection — not a therapist or
              emergency service.
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-50">
              Meet Z-Girl,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sky-300 to-cyan-300">
                Your Hero Coach
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-slate-300 max-w-xl">
              Feeling stressed, overwhelmed, or stuck? Z-Girl helps you manage
              challenges and{" "}
              <span className="text-teal-300 font-semibold">
                unwrap the hero within
              </span>{" "}
              — one small step at a time.
            </p>

            {/* Avatar with hero glow + speaking animation */}
            <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48">
              <div
                className={`zgirl-hero-avatar bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 p-1 rounded-full ${
                  isSpeaking ? "zgirl-hero-avatar--speaking" : ""
                }`}
              >
                <img
                  src="/icons/zgirl-icon-1024.png"
                  alt="Z-Girl Hero Coach"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl animate-pulse pointer-events-none" />
            </div>

            {/* START SESSION + PLAY GREETING */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowChat(true);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-400/40 hover:bg-teal-300 transition"
              >
                Start Session
              </button>

              <div className="flex flex-col items-center gap-1 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={playGreeting}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-300 hover:text-sky-200 underline underline-offset-2"
                >
                  ▶ Play greeting again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChat(true);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
                >
                  Skip intro · Go to chat
                </button>
              </div>
            </div>

            {/* Tiny safety line */}
            <p className="text-[10px] leading-relaxed text-slate-500 max-w-md">
              Private, judgment-free, hero-powered guidance. Z-Girl can&apos;t
              provide medical, crisis, or emergency help.
            </p>
          </div>

          {/* RIGHT COLUMN: chat UI (kept as in your app) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl shadow-sky-900/40 overflow-hidden flex flex-col min-h-[420px]">
            {/* Mood buttons */}
            <div className="px-4 pt-4 pb-2 border-b border-slate-800/60">
              <p className="text-xs text-slate-400 mb-2">
                How are you feeling today? <span className="opacity-60">(Optional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {(["Stressed", "Sad", "Worried", "Angry", "Tired", "Excited"] as MoodTag[]).map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMoodClick(m)}
                      className={`px-3 py-1 rounded-full text-[11px] border transition ${
                        selectedMood === m
                          ? "bg-sky-500/20 border-sky-400 text-sky-100"
                          : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      {m}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Chat area */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm bg-gradient-to-b from-slate-950/60 to-slate-900/80"
            >
              {!messages.length && (
                <div className="text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-200">
                    Z-Girl ran into a little tech glitch. Try again in a moment,
                    or refresh if it keeps happening.
                  </p>
                  <p>
                    You can start with a quick prompt below, or just type what&apos;s
                    on your mind.
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.ts}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                      m.role === "user"
                        ? "bg-sky-500 text-slate-950 rounded-br-sm"
                        : "bg-slate-800 text-slate-50 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick prompts & hero moments */}
            <div className="border-t border-slate-800/60 bg-slate-900/80 px-4 py-2 space-y-2">
              <p className="text-[11px] text-slate-400 mb-1">
                Try one of these to start:
              </p>
              <div className="grid gap-1">
                {suggestedPrompts.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleQuickTipClick(s.prompt)}
                    className="text-left text-[11px] px-3 py-1 rounded-xl border border-slate-700/80 bg-slate-900/60 text-slate-200 hover:border-sky-500/70 hover:text-sky-100 transition"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Saved hero moments */}
              <div className="mt-3 flex items-start gap-2">
                <div className="flex-1 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">Saved Hero Moments</span>
                    <button
                      type="button"
                      onClick={handleSaveHeroMoment}
                      className="px-2 py-1 rounded-full bg-emerald-400/90 text-slate-950 text-[10px] font-semibold hover:bg-emerald-300 transition"
                    >
                      Save last reply
                    </button>
                  </div>
                  {heroMoments.length ? (
                    <p className="text-slate-400">
                      After Z-Girl says something that really helps, tap{" "}
                      <span className="font-semibold text-emerald-300">
                        Save last reply
                      </span>{" "}
                      and it will show up here as a “hero moment” you can
                      revisit.
                    </p>
                  ) : (
                    <p className="text-slate-500">
                      After Z-Girl says something that really helps, tap Save
                      last reply and it will show up here as a “hero moment”.
                    </p>
                  )}
                </div>

                {/* Tiny video-script teaser card */}
                <div className="w-[160px] rounded-2xl bg-gradient-to-br from-sky-950 via-slate-900 to-slate-950 border border-sky-800/70 px-3 py-2 text-[10px] text-slate-200 shadow-lg shadow-sky-900/50">
                  <p className="font-semibold mb-1">
                    Turn this into a hero video script
                  </p>
                  <p className="text-slate-400 mb-2">
                    We’ll stitch together a short, cozy script idea based on
                    your recent chat with Z-Girl that could work for a talking
                    video, reel, or animated short.
                  </p>
                  <button
                    type="button"
                    className="w-full text-center rounded-full bg-sky-500/90 text-slate-950 font-semibold py-1 hover:bg-sky-400 transition"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-slate-800/80 bg-slate-950/95 px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={pendingText}
                  onChange={(e) => setPendingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Tell Z-Girl what’s going on, or ask a question..."
                  className="flex-1 rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-50 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending || !pendingText.trim()}
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 text-slate-950 px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-400 transition"
                >
                  {isSending ? "Sending…" : "Send"}
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="underline underline-offset-2 hover:text-slate-300"
                >
                  Clear chat
                </button>
                <span>{currentHeroTip}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="max-w-md mx-4 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl shadow-sky-900/40 p-6 space-y-4 text-sm text-slate-100">
            <h2 className="text-lg font-bold text-sky-100">
              Welcome to Z-Girl: Hero Coach
            </h2>
            <p>
              This cozy space is for learning, encouragement, and reflection —
              especially around holiday stress and big feelings.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[13px]">
              <li>Z-Girl is a fictional hero-coach, not a doctor or therapist.</li>
              <li>
                She can&apos;t handle emergencies. If you&apos;re in danger or very
                upset, please talk to a trusted adult right away.
              </li>
              <li>
                Everything you type here is meant to help you{" "}
                <span className="font-semibold text-teal-300">
                  unwrap the hero within
                </span>{" "}
                — one small step at a time.
              </li>
            </ul>
            <button
              type="button"
              onClick={dismissOnboarding}
              className="mt-2 w-full rounded-full bg-sky-500 text-slate-950 font-semibold py-2 text-sm hover:bg-sky-400 transition"
            >
              Got it — enter hero mode
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
