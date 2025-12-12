"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
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
You are a youth-friendly “Hero Coach” who helps users calm down, name feelings, and take small positive steps.
You are not a therapist. Avoid medical/legal advice. Encourage reaching out to trusted adults for serious issues. 
If user mentions self-harm, suicide, abuse, or immediate danger: encourage contacting a trusted adult and emergency services. 
Keep responses short, kind, practical, and empowering.`;

const HERO_TIPS = [
  "Tiny steps still count as hero moves.",
  "Breathe first. Decide second.",
  "You don’t have to do this alone—find a trusted adult.",
  "Your feelings are real. You’re still the hero.",
  "Progress > perfection.",
];

const BREATHING_STEPS = [
  "Inhale… 4 seconds",
  "Hold… 4 seconds",
  "Exhale… 6 seconds",
  "Hold… 2 seconds",
];

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // 🔊 Sound effects (DOM <audio> elements live at the bottom of this file)
  const startupSoundRef = useRef<HTMLAudioElement | null>(null);
  const replyChimeRef = useRef<HTMLAudioElement | null>(null);
  const sendSoundRef = useRef<HTMLAudioElement | null>(null);
  const heroMomentSoundRef = useRef<HTMLAudioElement | null>(null);

  const [soundEnabled, setSoundEnabled] = useState(true);

  // 🎤 Voice (Web Speech API)
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const pickZGirlVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined") return null;
    const synth = window.speechSynthesis;
    if (!synth?.getVoices) return null;

    const voices = synth.getVoices() ?? [];
    if (!voices.length) return null;

    const isEnglish = (v: SpeechSynthesisVoice) =>
      (v.lang || "").toLowerCase().startsWith("en");

    const englishVoices = voices.filter(isEnglish);
    const pool = englishVoices.length ? englishVoices : voices;

    // Heuristic “female-leaning” names (gender isn't provided by the API)
    const preferred = [
      "google uk english female",
      "samantha",
      "victoria",
      "zira",
      "aria",
      "jenny",
      "natasha",
      "serena",
      "ava",
      "allison",
      "moira",
      "tessa",
    ];

    const byName = () => {
      for (const key of preferred) {
        const found = pool.find((v) =>
          (v.name || "").toLowerCase().includes(key)
        );
        if (found) return found;
      }
      return null;
    };

    return byName() || pool[0] || null;
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback(
    (textToSpeak: string) => {
      if (!ttsEnabled) return;
      if (typeof window === "undefined") return;
      if (!("speechSynthesis" in window)) return;

      const text = (textToSpeak || "").trim();
      if (!text) return;

      try {
        // Stop anything currently speaking
        window.speechSynthesis.cancel();

        const utter = new SpeechSynthesisUtterance(text);
        const voice = pickZGirlVoice();
        if (voice) utter.voice = voice;

        utter.rate = 1.0;
        utter.pitch = 1.05;
        utter.volume = 1.0;

        utter.onstart = () => setIsSpeaking(true);
        const done = () => setIsSpeaking(false);
        utter.onend = done;
        utter.onerror = done;

        window.speechSynthesis.speak(utter);
      } catch {
        setIsSpeaking(false);
      }
    },
    [pickZGirlVoice, ttsEnabled]
  );

  const playSfx = useCallback(
    (audioEl: HTMLAudioElement | null) => {
      if (!soundEnabled) return;
      if (!audioEl) return;
      try {
        audioEl.pause();
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {});
      } catch {
        // ignore
      }
    },
    [soundEnabled]
  );

  const playGreeting = useCallback(() => {
    // IMPORTANT: per your choice “B”, greeting does NOT auto-play — user taps to play it.
    playSfx(startupSoundRef.current);

    speakText(
      "Hey there, I'm Z-Girl, your hero coach. I'm here to help you unwrap the hero within, one small step at a time."
    );
  }, [playSfx, speakText]);

  // Load stored conversation + hero moments
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setMessages(JSON.parse(stored));

      const storedHero = window.localStorage.getItem(HERO_KEY);
      if (storedHero) setHeroMoments(JSON.parse(storedHero));
    } catch {
      // ignore
    }
  }, []);

  // Persist conversation + hero moments
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HERO_KEY, JSON.stringify(heroMoments));
    } catch {
      // ignore
    }
  }, [heroMoments]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Breathing step timer
  useEffect(() => {
    if (!showBreathing) return;

    setBreathingStepIndex(0);
    const interval = setInterval(() => {
      setBreathingStepIndex((prev) => (prev + 1) % BREATHING_STEPS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [showBreathing]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Clear any old error + video script for a fresh “episode”
    setErrorBanner(null);
    setShowVideoScript(false);
    setVideoScript("");

    const userMessage: ChatMessage = {
      id: makeId("u"),
      role: "user",
      text: input.trim(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // 🔊 Send sparkle (if present)
    playSfx(sendSoundRef.current);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        data.reply ??
        "I’m here with you. Let’s try that again in a moment. 💙";

      const assistantMessage: ChatMessage = {
        id: makeId("a"),
        role: "assistant",
        text: assistantText,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // 🔔 Reply chime + speak aloud (AUTO, as you chose “A”)
      playSfx(replyChimeRef.current);
      speakText(assistantText);
    } catch (err) {
      console.error(err);
      setErrorBanner(
        "Z-Girl had trouble reaching her hero HQ. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const speakLastReply = useCallback(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastAssistant) return;

    playSfx(replyChimeRef.current);
    speakText(lastAssistant.text);
  }, [messages, playSfx, speakText]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleMoodPick = (mood: string) => {
    setSelectedMood(mood);
    setShowChat(true);

    const starters: Record<string, string> = {
      Stressed: "I’m feeling stressed and overwhelmed.",
      Sad: "I’m feeling sad and I’m not sure why.",
      Worried: "I’m feeling worried and anxious.",
      Angry: "I’m feeling angry and frustrated.",
      Tired: "I’m feeling tired and worn out.",
      Excited: "I’m excited but also kind of nervous.",
    };

    setInput(`${starters[mood] ?? "I’m feeling a lot right now."} `);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleStartSession = () => {
    setShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSkipIntro = () => {
    setShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleToggleTips = (e?: MouseEvent) => {
    e?.preventDefault?.();
    setShowTips((v) => !v);
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
    if (messages.length === 0) return;

    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");

    if (!lastAssistant) {
      setErrorBanner(
        "Ask Z-Girl something first, then you can save a hero moment from her reply."
      );
      return;
    }

    const newMoment: HeroMoment = {
      id: makeId("h"),
      text: lastAssistant.text,
      mood: selectedMood,
      createdAt: Date.now(),
    };

    setHeroMoments((prev) => [newMoment, ...prev]);

    // ✨ Play hero-moment chime
    playSfx(heroMomentSoundRef.current);
  };

  const handleGenerateVideoScript = () => {
    if (!messages.length) return;

    const lastFew = messages.slice(-6);

    const userLines = lastFew
      .filter((m) => m.role === "user")
      .map((m) => `User: ${m.text}`);

    const assistantLines = lastFew
      .filter((m) => m.role === "assistant")
      .map((m) => `Z-Girl: ${m.text}`);

    const lines = [...userLines, ...assistantLines];

    const moodLine = selectedMood ? `Mood: ${selectedMood}` : "Mood: (unknown)";

    const script = [
      "🎬 Z-Girl Hero Coach — Short Script",
      moodLine,
      "",
      "Scene: Cozy hero HQ, gentle lights, calming vibe.",
      "Z-Girl (smiling): “Hey hero. Let’s take a small step together.”",
      "",
      ...lines,
      "",
      "Z-Girl (encouraging): “Your hero move: take one small action in the next 5 minutes. You’ve got this.”",
    ].join("\n");

    setVideoScript(script);
    setShowVideoScript(true);
  };

  const tip = HERO_TIPS[Math.floor(Math.random() * HERO_TIPS.length)];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300/90 font-semibold">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE COACH
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/safety"
              className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/40 text-[11px] sm:text-xs text-sky-200 hover:bg-sky-500/20 transition"
            >
              Safety & Use
            </Link>

            <div className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/40 text-[11px] sm:text-xs text-sky-200 flex items-center gap-1">
              <span className="inline-flex h-1.5 w-5 bg-gradient-to-r from-sky-300 to-emerald-300 rounded-full animate-pulse" />
              HOLIDAY HERO MODE
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-10 lg:py-16 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-start">
          {/* Left column: hero intro */}
          <div className="space-y-8">
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

            <p className="text-sm text-slate-300 max-w-xl">
              Feeling stressed, overwhelmed, or stuck? Z-Girl helps you manage
              challenges and{" "}
              <span className="text-teal-300 font-semibold">
                unwrap the hero within
              </span>{" "}
              — one small step at a time.
            </p>

            {/* Avatar */}
            <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48">
              <div
                className={[
                  "zgirl-hero-avatar",
                  isSpeaking ? "zgirl-hero-avatar--speaking" : "",
                  "bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 p-1 rounded-full",
                ].join(" ")}
              >
                <img
                  src="/icons/zgirl-icon-1024.png"
                  alt="Z-Girl Hero Coach"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl animate-pulse pointer-events-none" />
            </div>

            {/* Intro buttons */}
            <div className="space-y-3">
              <button
                onClick={handleStartSession}
                className="zgirl-hero-button w-full inline-flex items-center justify-center gap-2 rounded-full bg-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-400/40 hover:bg-teal-300 transition"
              >
                Start Session
              </button>

              <div className="flex flex-col items-center gap-1 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleSkipIntro}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
                >
                  Skip intro · Go to chat
                </button>

                {/* Voice + sound controls */}
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={playGreeting}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
                  >
                    <span aria-hidden="true">🔊</span>
                    <span>Play Z-Girl’s welcome</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTtsEnabled((v) => !v)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
                    aria-pressed={ttsEnabled}
                  >
                    <span aria-hidden="true">{ttsEnabled ? "🟢" : "⚪"}</span>
                    <span>{ttsEnabled ? "Voice on" : "Voice off"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSoundEnabled((v) => !v)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
                    aria-pressed={soundEnabled}
                  >
                    <span aria-hidden="true">{soundEnabled ? "🟢" : "⚪"}</span>
                    <span>{soundEnabled ? "Sound on" : "Sound off"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
                  >
                    <span aria-hidden="true">⏹️</span>
                    <span>Stop</span>
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] leading-relaxed text-slate-500 max-w-md">
              Private, judgment-free, hero-powered guidance. Z-Girl can&apos;t
              provide medical, crisis, or emergency help.
            </p>
          </div>

          {/* Right column: chat panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl shadow-sky-900/40 overflow-hidden flex flex-col min-h-[520px]">
            {/* Mood buttons */}
            <div className="px-4 pt-4 pb-2 border-b border-slate-800/60">
              <p className="text-xs text-slate-400 mb-2">
                How are you feeling today?{" "}
                <span className="opacity-60">(Optional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {["Stressed", "Sad", "Worried", "Angry", "Tired", "Excited"].map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMoodPick(m)}
                      className={[
                        "px-3 py-1 rounded-full text-[11px] border transition",
                        selectedMood === m
                          ? "bg-sky-500/20 border-sky-400 text-sky-100"
                          : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500",
                      ].join(" ")}
                    >
                      {m}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Chat log */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm bg-gradient-to-b from-slate-950/60 to-slate-900/80"
            >
              {!showChat && (
                <div className="text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-200">
                    Tap <span className="text-teal-300">Start Session</span> to
                    begin, or pick a mood to get a quick starter message.
                  </p>
                </div>
              )}

              {showChat && messages.length === 0 && (
                <div className="text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-200">
                    You can start with a mood above, or type what&apos;s on your
                    mind.
                  </p>
                  <div className="rounded-2xl border border-slate-700/70 bg-slate-900/50 p-3">
                    <div className="text-[11px] font-semibold text-sky-300 mb-1">
                      Z-GIRL
                    </div>
                    <div className="text-[12px] text-slate-200 leading-relaxed">
                      Hi hero. Want to do a quick reset together? Tell me what’s
                      going on and I’ll help you take one small step.
                    </div>
                  </div>
                </div>
              )}

              {showChat && (
                <>
                  {errorBanner && (
                    <div className="rounded-xl bg-rose-500/10 border border-rose-400/40 text-rose-100 px-3 py-2 text-xs">
                      {errorBanner}
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
                          "max-w-[85%] rounded-2xl px-3 py-2 text-xs sm:text-sm whitespace-pre-wrap transition-transform duration-200",
                          m.role === "user"
                            ? "bg-sky-600 text-white rounded-br-sm"
                            : "bg-slate-800 text-slate-50 rounded-bl-sm border border-slate-700/80",
                        ].join(" ")}
                      >
                        {m.role === "assistant" && (
                          <div className="mb-1 text-[10px] font-semibold text-sky-300 flex items-center justify-between gap-2">
                            <span>Z-GIRL</span>
                            <button
                              type="button"
                              onClick={() => speakText(m.text)}
                              className="text-[10px] text-slate-300 hover:text-slate-100 underline underline-offset-2"
                            >
                              Speak
                            </button>
                          </div>
                        )}
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 text-slate-50 border border-slate-700/80 rounded-2xl rounded-bl-sm px-3 py-2 text-xs">
                        <div className="mb-1 text-[10px] font-semibold text-sky-300">
                          Z-GIRL
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:120ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:240ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Tools & input */}
            <div className="border-t border-slate-800 bg-slate-950/80 rounded-b-2xl px-3 py-2 space-y-2">
              {showChat && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBreathing(true)}
                    className="text-[11px] px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 transition"
                  >
                    🫁 Breathing Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveHeroMoment}
                    className="text-[11px] px-3 py-1 rounded-full bg-emerald-400/90 text-slate-950 border border-emerald-300 hover:bg-emerald-300 transition"
                  >
                    ⭐ Save Hero Moment
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateVideoScript}
                    className="text-[11px] px-3 py-1 rounded-full bg-sky-500/90 text-slate-950 border border-sky-300 hover:bg-sky-300 transition"
                  >
                    🎬 Video Script
                  </button>
                </div>
              )}

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400"
                placeholder="Tell Z-Girl what’s going on, or ask a question…"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/40 hover:bg-sky-300 transition transform hover:-translate-y-0.5 active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed"
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

                <span className="text-[11px] text-slate-500">{tip}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTtsEnabled((v) => !v)}
                    className="underline underline-offset-2 hover:text-slate-200"
                    aria-pressed={ttsEnabled}
                  >
                    {ttsEnabled ? "Voice: On" : "Voice: Off"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled((v) => !v)}
                    className="underline underline-offset-2 hover:text-slate-200"
                    aria-pressed={soundEnabled}
                  >
                    {soundEnabled ? "Sound: On" : "Sound: Off"}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={speakLastReply}
                    className="underline underline-offset-2 hover:text-slate-200"
                  >
                    Speak last reply
                  </button>
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="underline underline-offset-2 hover:text-slate-200"
                  >
                    Stop
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Tip: Press <span className="text-slate-300">Enter</span> to
                  send, <span className="text-slate-300">Shift+Enter</span> for
                  a new line.
                </span>
                <InstallPWAButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating hero helper */}
      <div className="fixed bottom-4 right-4 z-40">
        {showTips && (
          <div className="mb-3 w-72 rounded-2xl border border-slate-700 bg-slate-950/90 backdrop-blur p-3 shadow-xl shadow-sky-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-sky-200">Hero Tips</div>
              <button
                type="button"
                onClick={handleToggleTips}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <ul className="text-[11px] text-slate-300 space-y-1">
              <li>• Name your feeling (no judgment).</li>
              <li>• Breathe for 30 seconds.</li>
              <li>• Choose one small next step.</li>
              <li>• Talk to a trusted adult if needed.</li>
            </ul>

            <div className="mt-2 text-[10px] text-slate-500">
              Z-Girl is not a crisis service. For emergencies, contact local
              emergency services.
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleTips}
          className="rounded-full bg-sky-500 text-slate-950 font-black h-12 w-12 shadow-xl shadow-sky-500/40 hover:bg-sky-300 transition flex items-center justify-center"
          aria-label="Open Hero Tips"
          title="Hero Tips"
        >
          Z
        </button>
      </div>

      {/* Video Script Modal */}
      {showVideoScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-2xl w-full rounded-3xl border border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-sky-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-sky-200">
                🎬 Video Script Draft
              </div>
              <button
                type="button"
                onClick={() => setShowVideoScript(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <textarea
              value={videoScript}
              readOnly
              className="w-full h-64 rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none"
            />

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(videoScript);
                  } catch {}
                }}
                className="rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-200 border border-slate-700 hover:border-slate-500 transition"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => setShowVideoScript(false)}
                className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/40 hover:bg-sky-300 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breathing Modal */}
      {showBreathing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-md w-full rounded-3xl border border-slate-700 bg-slate-950 p-5 shadow-2xl shadow-emerald-900/30 text-center">
            <div className="text-sm font-bold text-emerald-200 mb-2">
              🫁 Breathing Reset
            </div>
            <div className="text-xs text-slate-300 mb-4">
              Follow along for 30 seconds. You’re doing great.
            </div>

            <div className="text-2xl font-black text-slate-100 mb-4">
              {BREATHING_STEPS[breathingStepIndex]}
            </div>

            <button
              type="button"
              onClick={() => setShowBreathing(false)}
              className="rounded-full bg-emerald-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-400/40 hover:bg-emerald-300 transition"
            >
              Done · Back to chat
            </button>
          </div>
        </div>
      )}

      {/* 🔊 Global Audio Elements */}
      <audio
        ref={startupSoundRef}
        src="/sounds/zgirl-startup.mp3"
        preload="auto"
      />
      <audio
        ref={replyChimeRef}
        src="/sounds/zgirl-chime.wav"
        preload="auto"
      />
      <audio
        ref={sendSoundRef}
        src="/sounds/magic-sparkle-190030.mp3"
        preload="auto"
      />
      <audio ref={heroMomentSoundRef} src="/sounds/3183.wav" preload="auto" />
    </main>
  );
}
