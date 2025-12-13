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

// Persisted voice settings + per-message mute map
const VOICE_SETTINGS_KEY = "zgirl-voice-settings-v1";
const MUTED_MESSAGES_KEY = "zgirl-muted-message-ids-v1";

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

CRISIS & SAFETY (CRITICAL)
If the user mentions:
- wanting to die, kill themselves, self-harm, cutting, overdose, or "ending it"
- wanting to seriously hurt someone else
- being abused, assaulted, or feeling unsafe at home, at school, or in a relationship

THEN you MUST:
1) Respond gently and seriously
2) Clearly say that you are just a digital hero coach and not an emergency service
3) Encourage them to reach out to a trusted adult
4) If immediate danger: contact emergency services (911 in the U.S.) or local hotline

CONVERSATION STYLE
- Ask 1–2 short clarifying questions before giving long advice, unless urgent.
- Keep responses focused (3–6 sentences).
- Include one concrete "hero move" they can try.
- Validate feelings first.

HOLIDAY / SEASONAL MODE
- If the user mentions holidays or "Unwrap the Hero Within", connect it to courage/kindness.
- Keep it inclusive.

OVERALL GOAL
Help the user feel seen, calmer, and choose one small next hero move.`;

const STARTER_SUGGESTIONS: string[] = [
  "I’m feeling stressed about school.",
  "My family is arguing and it’s making me anxious.",
  "I want to feel more confident about myself.",
  "I’m sad and I don’t really know why.",
  "How can I calm down when my feelings feel too big?",
];

const MOODS = ["Stressed", "Sad", "Worried", "Angry", "Tired", "Excited"];

const QUICK_TIPS: {
  id: string;
  title: string;
  body: string;
  suggestion?: string;
}[] = [
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

const BREATHING_STEPS = [
  { id: "inhale", label: "Inhale", subtitle: "Breathe in gently through your nose.", countText: "4 seconds in" },
  { id: "hold", label: "Hold", subtitle: "Hold your breath softly. No need to strain.", countText: "2 seconds hold" },
  { id: "exhale", label: "Exhale", subtitle: "Breathe out slowly through your mouth.", countText: "4 seconds out" },
];

function makeId(suffix = ""): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return (crypto as any).randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}${suffix}`;
}

type LangOption = { code: string; label: string; nameForPrompt: string };

const LANG_OPTIONS: LangOption[] = [
  { code: "en-US", label: "English (US)", nameForPrompt: "English" },
  { code: "en-GB", label: "English (UK)", nameForPrompt: "English" },
  { code: "es-ES", label: "Español (ES)", nameForPrompt: "Spanish" },
  { code: "es-US", label: "Español (US)", nameForPrompt: "Spanish" },
  { code: "fr-FR", label: "Français", nameForPrompt: "French" },
  { code: "pt-BR", label: "Português (BR)", nameForPrompt: "Portuguese" },
  { code: "de-DE", label: "Deutsch", nameForPrompt: "German" },
];

function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window));
}

type VoiceSettingsPersist = {
  voiceEnabled: boolean;
  autoSpeakReplies: boolean;
  soundsEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  speechLang: LangOption["code"];
  selectedVoiceName: string;
};

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

  // Voice controls (persisted)
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState(false); // safer default
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechLang, setSpeechLang] = useState<LangOption["code"]>("en-US");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  // Per-message mute (persisted)
  const [mutedMessageIds, setMutedMessageIds] = useState<Record<string, boolean>>({});

  // Speech recognition (verbal input)
  const [isListening, setIsListening] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);
  const [autoSendVoice, setAutoSendVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Keep voice transcription stable (avoid repeated interim appends)
  const voiceBaseInputRef = useRef<string>("");
  const voiceFinalRef = useRef<string>("");
  const voiceHadResultRef = useRef<boolean>(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const handleSendRef = useRef<() => void>(() => {});

  // Sounds
  const sendSoundRef = useRef<HTMLAudioElement | null>(null);
  const heroMomentSoundRef = useRef<HTMLAudioElement | null>(null);
  const startupSoundRef = useRef<HTMLAudioElement | null>(null);
  const replyChimeRef = useRef<HTMLAudioElement | null>(null);

  // Load persisted voice settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(VOICE_SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<VoiceSettingsPersist>;
        if (typeof parsed.voiceEnabled === "boolean") setVoiceEnabled(parsed.voiceEnabled);
        if (typeof parsed.autoSpeakReplies === "boolean") setAutoSpeakReplies(parsed.autoSpeakReplies);
        if (typeof parsed.soundsEnabled === "boolean") setSoundsEnabled(parsed.soundsEnabled);
        if (typeof parsed.speechRate === "number") setSpeechRate(parsed.speechRate);
        if (typeof parsed.speechPitch === "number") setSpeechPitch(parsed.speechPitch);
        if (typeof parsed.speechLang === "string") setSpeechLang(parsed.speechLang as any);
        if (typeof parsed.selectedVoiceName === "string") setSelectedVoiceName(parsed.selectedVoiceName);
      }

      const mutedRaw = window.localStorage.getItem(MUTED_MESSAGES_KEY);
      if (mutedRaw) {
        const parsedMuted = JSON.parse(mutedRaw);
        if (parsedMuted && typeof parsedMuted === "object") setMutedMessageIds(parsedMuted);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist voice settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: VoiceSettingsPersist = {
      voiceEnabled,
      autoSpeakReplies,
      soundsEnabled,
      speechRate,
      speechPitch,
      speechLang,
      selectedVoiceName,
    };
    try {
      window.localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(payload));
    } catch {}
  }, [voiceEnabled, autoSpeakReplies, soundsEnabled, speechRate, speechPitch, speechLang, selectedVoiceName]);

  // Persist muted map
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(MUTED_MESSAGES_KEY, JSON.stringify(mutedMessageIds));
    } catch {}
  }, [mutedMessageIds]);

  // Load voices async
  useEffect(() => {
    if (!isSpeechSupported()) return;
    const synth = window.speechSynthesis;

    const load = () => setVoices(synth.getVoices() || []);
    load();
    synth.onvoiceschanged = load;

    return () => { synth.onvoiceschanged = null; };
  }, []);

  // Setup speech recognition for verbal input
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) return;
    if (typeof window === "undefined") return;

    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = speechLang;

    rec.onstart = () => {
      setIsListening(true);
      if (liveRegionRef.current) liveRegionRef.current.textContent = "Voice input started. Speak now.";
    };

    rec.onerror = () => {
      setIsListening(false);
      if (liveRegionRef.current) liveRegionRef.current.textContent = "Voice input stopped due to an error.";
    };

    rec.onend = () => {
      setIsListening(false);
      if (liveRegionRef.current) liveRegionRef.current.textContent = "Voice input stopped.";

      // Optional: auto-send when speech stops
      if (autoSendVoice && voiceHadResultRef.current) {
        // Give React state a tick to settle
        setTimeout(() => {
          // Only send if not already sending
          const current = (inputRef.current?.value ?? "").toString().trim();
          if (current && !loading) {
            handleSendRef.current();
          }
        }, 150);
      }
    };

    rec.onresult = (event: any) => {
      let interim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) finalChunk += transcript;
        else interim += transcript;
      }

      // Mark that we got voice content in this session
      if (interim.trim() || finalChunk.trim()) voiceHadResultRef.current = true;

      // Accumulate only FINAL chunks (stable), and show INTERIM live without re-appending repeatedly
      if (finalChunk) {
        voiceFinalRef.current = `${voiceFinalRef.current} ${finalChunk}`.replace(/\s+/g, " ").trim();
      }

      const combined = `${voiceBaseInputRef.current} ${voiceFinalRef.current} ${interim}`
        .replace(/\s+/g, " ")
        .trim();

      setInput(combined);

      if (finalChunk && liveRegionRef.current) {
        liveRegionRef.current.textContent = "Voice input captured. You can press Send.";
      }
    };

    recognitionRef.current = rec;
  }, [speechLang, autoSendVoice, loading]);

  // audio volumes
  useEffect(() => {
    const setVol = (ref: { current: HTMLAudioElement | null }, v: number) => {
      if (ref.current) ref.current.volume = v;
    };
    setVol(sendSoundRef, 0.75);
    setVol(heroMomentSoundRef, 0.75);
    setVol(replyChimeRef, 0.85);
    setVol(startupSoundRef, 0.85);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const resolveVoice = useCallback((langCode: string): SpeechSynthesisVoice | undefined => {
    if (!voices.length) return undefined;

    const byLang = voices.filter((v) => (v.lang || "").toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase()));
    const pool = byLang.length ? byLang : voices;

    if (selectedVoiceName) {
      const exact = pool.find((v) => v.name === selectedVoiceName);
      if (exact) return exact;
    }

    const preferredNames = [
      "Google UK English Female",
      "Microsoft Zira",
      "Microsoft Aria",
      "Microsoft Jenny",
      "Samantha",
      "Serena",
      "Zira",
      "Jenny",
      "Aria",
    ];

    return (
      pool.find((v) => preferredNames.some((n) => v.name.toLowerCase().includes(n.toLowerCase()))) ||
      pool.find((v) => /female|woman|girl/i.test(v.name)) ||
      pool[0]
    );
  }, [voices, selectedVoiceName]);

  const speakText = useCallback((text: string) => {
    if (!voiceEnabled) return;
    if (!isSpeechSupported()) return;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = Math.min(2, Math.max(0.5, speechRate));
    utterance.pitch = Math.min(2, Math.max(0, speechPitch));
    utterance.lang = speechLang;

    const chosen = resolveVoice(speechLang);
    if (chosen) utterance.voice = chosen;

    utterance.onstart = () => setIsSpeaking(true);
    const done = () => setIsSpeaking(false);
    utterance.onend = done;
    utterance.onerror = done;

    synth.cancel();
    synth.speak(utterance);
  }, [voiceEnabled, speechRate, speechPitch, speechLang, resolveVoice]);

  const speakMessage = useCallback((m: ChatMessage) => {
    if (m.role !== "assistant") return;
    if (mutedMessageIds[m.id]) return;
    speakText(m.text);
  }, [mutedMessageIds, speakText]);

  const toggleMuteMessage = useCallback((id: string) => {
    setMutedMessageIds((prev) => ({ ...prev, [id]: !Boolean(prev[id]) }));
    stopSpeaking();
  }, [stopSpeaking]);

  const startListening = useCallback(() => {
    if (!voiceInputEnabled) return;
    if (!isSpeechRecognitionSupported()) return;
    const rec = recognitionRef.current;
    if (!rec) return;

    // Capture whatever is currently in the input as the "base" (so interim doesn't multiply)
    const base = (inputRef.current?.value ?? input ?? "").toString();
    voiceBaseInputRef.current = base;
    voiceFinalRef.current = "";
    voiceHadResultRef.current = false;

    try {
      rec.lang = speechLang;
      rec.start();
    } catch {
      // Some browsers throw if start() called twice
    }
  }, [speechLang, voiceInputEnabled, input]);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try { rec.stop(); } catch {}
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const playGreeting = useCallback(() => {
    if (soundsEnabled && startupSoundRef.current) {
      startupSoundRef.current.currentTime = 0;
      startupSoundRef.current.play().catch(() => {});
    }
    const greeting = "Hey there, I'm Z-Girl, your hero coach. I'm here to help you unwrap the hero within, one small step at a time.";
    speakText(greeting);
  }, [speakText, soundsEnabled]);

  // auto greeting once per session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const already = window.sessionStorage.getItem("zgirlGreetingPlayed");
    if (already) return;
    playGreeting();
    window.sessionStorage.setItem("zgirlGreetingPlayed", "1");
  }, [playGreeting]);

  // Load conversation + moments
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(HERO_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setHeroMoments(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(HERO_KEY, JSON.stringify(heroMoments)); } catch {}
  }, [heroMoments]);

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Breathing cycle
  useEffect(() => {
    if (!showBreathing) return;
    setBreathingStepIndex(0);
    const interval = setInterval(() => setBreathingStepIndex((prev) => (prev + 1) % BREATHING_STEPS.length), 4000);
    return () => clearInterval(interval);
  }, [showBreathing]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    setErrorBanner(null);
    setShowVideoScript(false);
    setVideoScript("");

    const userMessage: ChatMessage = { id: makeId("u"), role: "user", text: input.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // stop mic when sending
    if (isListening) stopListening();

    if (soundsEnabled && sendSoundRef.current) {
      try {
        sendSoundRef.current.currentTime = 0;
        await sendSoundRef.current.play();
      } catch {}
    }

    const langMeta = LANG_OPTIONS.find((l) => l.code === speechLang);
    const langInstruction =
      langMeta && !langMeta.code.startsWith("en")
        ? `\n\nIMPORTANT: Reply in ${langMeta.nameForPrompt}. Keep the same kid-friendly tone and safety rules.`
        : "";

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          systemPrompt: SYSTEM_PROMPT + langInstruction,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      if (!resp.ok) throw new Error(`Server error: ${resp.status}`);

      const data = await resp.json();
      const assistantText = data.reply ?? "I’m here with you. Let’s try that again in a moment. 💙";

      const assistantMessage: ChatMessage = { id: makeId("a"), role: "assistant", text: assistantText };
      setMessages((prev) => [...prev, assistantMessage]);

      if (soundsEnabled && replyChimeRef.current) {
        replyChimeRef.current.currentTime = 0;
        replyChimeRef.current.play().catch(() => {});
      }

      if (voiceEnabled && autoSpeakReplies) {
        setTimeout(() => {
          if (!mutedMessageIds[assistantMessage.id]) speakText(assistantText);
        }, 250);
      }

      if (liveRegionRef.current) liveRegionRef.current.textContent = `Z-Girl says: ${assistantText}`;
    } catch (err) {
      console.error(err);
      setErrorBanner("Z-Girl had trouble reaching her hero HQ. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSendRef.current = () => {
      // call the latest handleSend
      void handleSend();
    };
  }, [handleSend]);


  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      stopSpeaking();
      if (isListening) stopListening();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleMoodClick = (mood: string) => setSelectedMood((prev) => (prev === mood ? null : mood));

  const handleClearConversation = () => {
    if (!window.confirm("Clear this hero conversation with Z-Girl?")) return;
    stopSpeaking();
    if (isListening) stopListening();
    setMessages([]);
    setErrorBanner(null);
    setShowVideoScript(false);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const handleSaveHeroMoment = () => {
    if (messages.length === 0) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) {
      setErrorBanner("Ask Z-Girl something first, then you can save a hero moment from her reply.");
      return;
    }
    const newMoment: HeroMoment = { id: makeId("h"), text: lastAssistant.text, mood: selectedMood, createdAt: Date.now() };
    setHeroMoments((prev) => [newMoment, ...prev]);

    if (soundsEnabled && heroMomentSoundRef.current) {
      try {
        heroMomentSoundRef.current.currentTime = 0;
        heroMomentSoundRef.current.play();
      } catch {}
    }
  };

  const handleClearHeroMoments = () => setHeroMoments([]);

  const handleVideoScript = () => {
    if (messages.length === 0) {
      setErrorBanner("Share something with Z-Girl first so we can turn it into a hero video script. 🎬");
      return;
    }
    const lastFew = messages.slice(-4);
    const userLines = lastFew.filter((m) => m.role === "user").map((m) => `User: ${m.text}`);
    const assistantLines = lastFew.filter((m) => m.role === "assistant").map((m) => `Z-Girl: ${m.text}`);
    const moodLine = selectedMood ? `Mood: ${selectedMood}\n` : "";
    const script = `Hero Video Script Idea
=======================

${moodLine}Scene: Cozy animated holiday room with gentle snowfall outside. 
Soft instrumental version of "Unwrap the Hero Within" is playing in the background.

${[...userLines, ...assistantLines].join("\n")}

Stage Direction: End on Z-Girl smiling with a gentle glow and the words:
"Unwrap the Hero Within."`;
    setVideoScript(script);
    setShowVideoScript(true);
    navigator.clipboard?.writeText(script).catch(() => {});
  };

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!(e.target instanceof HTMLElement)) return;
    const dataText = e.target.dataset["text"];
    if (dataText) handleSuggestionClick(dataText);
  };

  const handleQuickTipClick = (suggestion?: string) => {
    if (!suggestion) return;
    handleSuggestionClick(suggestion);
    setShowTips(false);
    setShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const currentBreathingStep = BREATHING_STEPS[breathingStepIndex];
  const speechOk = typeof window === "undefined" ? true : isSpeechSupported();
  const speechRecOk = typeof window === "undefined" ? true : isSpeechRecognitionSupported();

  const voiceOptions = (() => {
    const base = voices || [];
    const primary = base.filter((v) => (v.lang || "").toLowerCase().startsWith(speechLang.slice(0, 2).toLowerCase()));
    const rest = base.filter((v) => !primary.includes(v));
    return [...primary, ...rest];
  })();

  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const lastAssistantId = assistantMessages.length ? assistantMessages[assistantMessages.length - 1].id : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true" />

      {!showChat && (
        <section className="min-h-screen flex items-center justify-center px-6 py-10">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wide">
              <span className="px-2 py-1 rounded-full border border-emerald-400/70 bg-emerald-400/10 text-emerald-300 inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE COACH
              </span>
              <span className="px-2 py-1 rounded-full border border-sky-400/70 bg-sky-400/10 text-sky-300">
                HOLIDAY HERO MODE
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1">
              A gentle hero-coach for youth reflection — not a therapist or emergency service.
            </p>

            <h1 className="text-3xl font-bold leading-tight mt-2">
              Meet Z-Girl, <span className="text-teal-300">Your Hero Coach</span>
            </h1>

            <p className="text-sm text-slate-300">
              Feeling stressed, overwhelmed, or stuck? Z-Girl helps you manage challenges and{" "}
              <span className="text-teal-300 font-semibold">unwrap the hero within</span> — one small step at a time.
            </p>

            <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48">
              <div className={`zgirl-hero-avatar bg-gradient-to-b from-cyan-500/20 to-cyan-500/5 p-1 rounded-full ${isSpeaking ? "zgirl-hero-avatar--speaking" : ""}`}>
                <img src="/icons/zgirl-icon-1024.png" alt="Z-Girl Hero Coach" className="h-full w-full rounded-full object-cover" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-left space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-slate-200">Voice & Accessibility</div>
                <button type="button" onClick={stopSpeaking} className="text-[11px] text-red-300 hover:text-red-200 underline underline-offset-2" aria-label="Stop speaking">
                  ⏹ Stop voice
                </button>
              </div>

              {!speechOk && (
                <div className="text-[11px] text-amber-100 border border-amber-500/40 bg-amber-500/10 rounded-xl px-3 py-2">
                  Voice isn’t supported in this browser/device. You can still use chat normally.
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-[11px]">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={voiceEnabled} onChange={() => setVoiceEnabled((v) => !v)} disabled={!speechOk} aria-label="Enable voice" />
                  <span>Voice</span>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={autoSpeakReplies} onChange={() => setAutoSpeakReplies((v) => !v)} disabled={!speechOk || !voiceEnabled} aria-label="Auto speak replies" />
                  <span>Auto-speak replies</span>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={soundsEnabled} onChange={() => setSoundsEnabled((v) => !v)} aria-label="Enable sounds" />
                  <span>Sounds</span>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={voiceInputEnabled} onChange={() => setVoiceInputEnabled((v) => !v)} disabled={!speechRecOk} aria-label="Enable voice input" />
                  <span>Voice input</span>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoSendVoice}
                    onChange={() => setAutoSendVoice((v) => !v)}
                    disabled={!speechRecOk || !voiceInputEnabled}
                    aria-label="Auto send voice input"
                  />
                  <span>Auto-send</span>
                </label>
              </div>

              {!speechRecOk && (
                <div className="text-[11px] text-amber-100 border border-amber-500/40 bg-amber-500/10 rounded-xl px-3 py-2">
                  Voice input isn’t supported here. (You can still type.)
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <label className="text-[11px] text-slate-300">
                  Language
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-1.5 text-[12px] text-slate-50"
                    value={speechLang}
                    onChange={(e) => {
                      setSpeechLang(e.target.value as any);
                      setSelectedVoiceName("");
                      stopSpeaking();
                      if (isListening) stopListening();
                    }}
                    aria-label="Select language"
                  >
                    {LANG_OPTIONS.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-[11px] text-slate-300">
                  Voice (optional)
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-1.5 text-[12px] text-slate-50"
                    value={selectedVoiceName}
                    onChange={(e) => {
                      setSelectedVoiceName(e.target.value);
                      stopSpeaking();
                    }}
                    disabled={!speechOk || !voices.length}
                    aria-label="Select voice"
                  >
                    <option value="">Auto (female-first)</option>
                    {voiceOptions.map((v) => (
                      <option key={`${v.name}-${v.lang}`} value={v.name}>
                        {v.name} — {v.lang}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-[11px] text-slate-300">
                    Rate: {speechRate.toFixed(2)}
                    <input className="zgirl-range mt-1 w-full" type="range" min={0.5} max={2} step={0.05} value={speechRate} onChange={(e) => setSpeechRate(parseFloat(e.target.value))} disabled={!speechOk || !voiceEnabled} aria-label="Speech rate" />
                  </label>

                  <label className="text-[11px] text-slate-300">
                    Pitch: {speechPitch.toFixed(2)}
                    <input className="zgirl-range mt-1 w-full" type="range" min={0} max={2} step={0.05} value={speechPitch} onChange={(e) => setSpeechPitch(parseFloat(e.target.value))} disabled={!speechOk || !voiceEnabled} aria-label="Speech pitch" />
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowChat(true);
                if (soundsEnabled && startupSoundRef.current) {
                  startupSoundRef.current.currentTime = 0;
                  startupSoundRef.current.play().catch(() => {});
                }
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="w-full inline-flex items-center justify-center rounded-full bg-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-400/40 hover:bg-teal-300 active:bg-teal-500 transition transform hover:-translate-y-0.5 active:translate-y-[1px]"
            >
              Start Session
            </button>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => {
                  setShowChat(true);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
              >
                Skip intro · Go to chat
              </button>

              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  onClick={playGreeting}
                  disabled={!speechOk || !voiceEnabled}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Play welcome greeting"
                >
                  <span aria-hidden="true">🔊</span>
                  <span>Play Z-Girl’s welcome</span>
                </button>
              </div>
            </div>

            <div className="relative z-10 mt-3">
              <Link href="/hero" className="text-[11px] text-sky-300 hover:text-sky-200 underline underline-offset-2">
                Learn more about Z-Girl &amp; this app
              </Link>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              Private, judgment-free, hero-powered guidance. Z-Girl can&apos;t provide medical, crisis, or emergency help.
            </p>
          </div>
        </section>
      )}

      {showChat && (
        <main className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center px-4 py-10">
          <div className="w-full max-w-4xl rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl shadow-cyan-500/10 px-6 py-6 md:px-10 md:py-8">
            <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE COACH
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-3 py-1 text-sky-300 font-semibold">
                HOLIDAY HERO MODE
              </span>
            </div>

            <header className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
                Z-Girl: Hero Coach
                <span className="block text-lg md:text-xl text-sky-300">Unwrap the Hero Within</span>
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-300 max-w-xl">
                This is a cozy, kid-friendly space to talk about stress, big feelings, family drama, school, and self-confidence.
                Z-Girl is here as a gentle hero coach—not a doctor or therapist—to help you find your next small hero move.
              </p>
            </header>

            <section className="mb-4 space-y-2">
              <div>
                <p className="text-xs text-slate-400 mb-2">How are you feeling today? (Optional)</p>
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
                        aria-pressed={isSelected}
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

            {errorBanner && (
              <div className="mb-3 rounded-xl border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-100" role="alert">
                {errorBanner}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] gap-6">
              <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/60">
                <div ref={scrollRef} className="flex-1 min-h-[260px] max-h-[420px] overflow-y-auto px-3 pt-3 pb-2 space-y-2" role="log" aria-live="polite" aria-relevant="additions text">
                  {messages.length === 0 && (
                    <div className="text-xs text-slate-400 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-3 mb-2">
                      <p className="mb-1">
                        👋 Hey! I&apos;m <span className="font-semibold text-sky-300">Z-Girl</span>, your hero coach. You can:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Tell me what&apos;s stressing you out</li>
                        <li>Ask for help with big feelings or tricky situations</li>
                        <li>Practice a quick &quot;hero move&quot; to feel a bit better</li>
                      </ul>
                    </div>
                  )}

                  {messages.map((m) => {
                    const isMuted = m.role === "assistant" ? Boolean(mutedMessageIds[m.id]) : false;
                    const isLastAssistant = m.role === "assistant" && lastAssistantId === m.id;

                    return (
                      <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                        <div
                          className={[
                            "max-w-[85%] rounded-2xl px-3 py-2 text-xs md:text-sm whitespace-pre-wrap transition-transform duration-200",
                            m.role === "user"
                              ? "bg-sky-600 text-white rounded-br-sm"
                              : "bg-slate-800 text-slate-50 rounded-bl-sm border border-slate-700/80",
                          ].join(" ")}
                        >
                          {m.role === "assistant" && (
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <div className="text-[10px] font-semibold text-sky-300">Z-GIRL</div>

                              <div className="flex items-center gap-2 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => speakMessage(m)}
                                  disabled={!speechOk || !voiceEnabled || isMuted}
                                  className="text-sky-200 hover:text-sky-100 disabled:opacity-50 disabled:cursor-not-allowed underline underline-offset-2"
                                  aria-label={isLastAssistant ? "Speak last reply" : "Speak reply"}
                                  title={isMuted ? "This message is muted" : "Speak this reply"}
                                >
                                  {isLastAssistant ? "🔊 Speak last" : "🔊 Speak"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleMuteMessage(m.id)}
                                  className={[
                                    "underline underline-offset-2",
                                    isMuted ? "text-amber-200 hover:text-amber-100" : "text-slate-300 hover:text-slate-100",
                                  ].join(" ")}
                                  aria-label={isMuted ? "Unmute message" : "Mute message"}
                                  title={isMuted ? "Unmute this message" : "Mute this message"}
                                >
                                  {isMuted ? "🔇 Muted" : "🔈 Mute"}
                                </button>
                              </div>
                            </div>
                          )}

                          {m.text}
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="max-w-[70%] rounded-2xl px-3 py-2 bg-slate-800/90 border border-slate-700 text-xs text-slate-200 flex items-center gap-2">
                        <div className="flex items-center gap-1" aria-hidden="true">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-bounce [animation-delay:-0.2s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-bounce [animation-delay:-0.1s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-300 animate-bounce" />
                        </div>
                        <span className="text-[11px] text-slate-200">Z-Girl is thinking about your next hero move…</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 bg-slate-950/80 rounded-b-2xl px-3 py-2 space-y-2">
                  <label className="sr-only" htmlFor="zgirl-chat-input">Message Z-Girl</label>

                  <textarea
                    id="zgirl-chat-input"
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-1.5 text-xs md:text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400"
                    placeholder="Tell Z-Girl what’s going on, or ask a question…"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/40 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-400 transition transform hover:-translate-y-0.5 active:translate-y-[1px]"
                      >
                        <span>Send</span>
                      </button>

                      {/* NEW: voice input mic button */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={!speechRecOk || !voiceInputEnabled}
                        className={[
                          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                          isListening
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40 hover:bg-amber-300"
                            : "bg-slate-800 text-slate-100 border border-slate-700 hover:border-sky-400/70 hover:text-sky-100",
                          (!speechRecOk || !voiceInputEnabled) ? "opacity-50 cursor-not-allowed" : "",
                        ].join(" ")}
                        aria-label={isListening ? "Stop voice input" : "Start voice input"}
                        title={isListening ? "Listening… click to stop" : "Click to speak"}
                      >
                        {isListening ? "🎙️ Listening…" : "🎙️ Speak"}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="button" onClick={stopSpeaking} className="text-[11px] text-red-300 hover:text-red-200 underline underline-offset-2">
                        Stop voice
                      </button>

                      <button type="button" onClick={handleClearConversation} className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2">
                        Clear chat
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    Tip: Press <span className="text-slate-300 font-semibold">Esc</span> to stop speaking (and stop voice input).
                  </p>
                </div>
              </section>

              <aside className="space-y-4 text-xs">
                <section className="rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-3 space-y-2" onClick={handleCardClick}>
                  <h2 className="text-[11px] font-semibold text-slate-200 mb-1">Try one of these to start:</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {STARTER_SUGGESTIONS.map((s) => (
                      <button key={s} type="button" className="w-full text-left rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-[11px] text-slate-200 hover:border-sky-400/70 hover:bg-slate-900 transition" data-text={s}>
                        {s}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[11px] font-semibold text-emerald-200">Saved Hero Moments</h2>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={handleSaveHeroMoment} className="text-[11px] rounded-full bg-emerald-400/90 px-3 py-1 font-semibold text-slate-950 hover:bg-emerald-300 transition">
                        Save last reply
                      </button>
                      {heroMoments.length > 0 && (
                        <button type="button" onClick={handleClearHeroMoments} className="text-[10px] text-emerald-200/80 hover:text-emerald-100 underline underline-offset-2">
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {heroMoments.length === 0 ? (
                    <p className="text-[11px] text-emerald-100/80">
                      After Z-Girl says something that really helps, tap <span className="font-semibold">Save last reply</span> and it will show up here as a &quot;hero moment&quot; you can revisit.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {heroMoments.map((moment) => (
                        <div key={moment.id} className="rounded-xl bg-slate-900/90 border border-emerald-500/40 px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-emerald-200">Z-Girl Hero Moment</span>
                            {moment.mood && (
                              <span className="text-[10px] rounded-full bg-emerald-500/10 border border-emerald-400/60 px-2 py-0.5 text-emerald-100">
                                {moment.mood}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-emerald-50 whitespace-pre-wrap">{moment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-sky-500/50 bg-sky-500/5 px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-semibold text-sky-200">Turn this into a hero video script</h2>
                    <button type="button" onClick={handleVideoScript} className="text-[11px] rounded-full bg-sky-400/90 px-3 py-1 font-semibold text-slate-950 hover:bg-sky-300 transition">
                      Generate
                    </button>
                  </div>
                  <p className="text-[11px] text-sky-100/80">
                    We&apos;ll stitch together a short, cozy script idea based on your recent chat with Z-Girl that could work for a talking video, reel, or animated short.
                  </p>

                  {showVideoScript && (
                    <div className="mt-2 rounded-xl bg-slate-950/90 border border-sky-500/50 px-3 py-2 max-h-40 overflow-y-auto text-[11px] text-sky-50 whitespace-pre-wrap">
                      {videoScript}
                    </div>
                  )}
                </section>
              </aside>
            </div>

            <footer className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[10px] text-slate-500">
                <p className="max-w-xl leading-relaxed">
                  Z-Girl is a fictional &quot;hero coach&quot; based on <span className="font-semibold text-slate-300">The 4 Lessons</span> universe. This app is for learning, encouragement, and reflection.
                  It&apos;s not a replacement for a counselor, therapist, doctor, or emergency service. If you&apos;re feeling overwhelmed, in danger, or unsafe, please reach out to a trusted adult, counselor, or local professional right away.
                </p>

                <div className="flex flex-col items-start md:items-end gap-1">
                  <InstallPWAButton />
                  <Link href="/hero" className="text-[10px] text-sky-300 hover:text-sky-200 underline underline-offset-2">
                    About Z-Girl Hero Coach
                  </Link>
                  <Link href="/safety" className="text-[10px] text-slate-400 hover:text-slate-200 underline underline-offset-2">
                    Safety &amp; Use Guidelines
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </main>
      )}

      {/* Floating hero helper */}
      <div className="fixed bottom-4 right-4 z-40">
        {showTips && (
          <div className="mb-3 w-72 max-w-[80vw] rounded-2xl border border-slate-700 bg-slate-900/95 shadow-lg shadow-sky-500/20 px-3 py-3 text-xs text-slate-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full overflow-hidden border border-sky-400/70 shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                  <img src="/icons/zgirl-icon-192.png" alt="Z-Girl avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-semibold text-sky-200">Z-Girl&apos;s Hero Tips</span>
              </div>
              <button type="button" onClick={() => setShowTips(false)} className="text-[11px] text-slate-400 hover:text-slate-100" aria-label="Close tips">
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-300 mb-2">Need a quick hero move idea? Tap one of these, and I can help you use it in chat.</p>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-2 zgirl-scroll">
              {QUICK_TIPS.map((tip) => (
                <button key={tip.id} type="button" onClick={() => handleQuickTipClick(tip.suggestion)} className="w-full text-left rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-2 hover:border-sky-400/70 hover:bg-slate-800 transition">
                  <div className="text-[11px] font-semibold text-sky-200">{tip.title}</div>
                  <div className="text-[11px] text-slate-200 mt-0.5">{tip.body}</div>
                  {tip.suggestion && <div className="mt-1 text-[10px] text-sky-300 underline underline-offset-2">Use this in chat →</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="button" onClick={() => setShowTips((prev) => !prev)} className="relative h-12 w-12 rounded-full border border-sky-400/70 bg-slate-900/90 shadow-[0_0_20px_rgba(56,189,248,0.6)] flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105 active:scale-95" aria-label="Open Z-Girl hero tips">
          <div className="absolute inset-0 rounded-full bg-sky-400/10 animate-pulse" />
          <img src="/icons/zgirl-icon-192.png" alt="Z-Girl helper" className="relative h-9 w-9 rounded-full object-cover border border-slate-900" />
        </button>
      </div>

      {/* Breathing */}
      {showBreathing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm px-4">
          <div className="max-w-md w-full rounded-3xl border border-sky-500/40 bg-slate-900/90 shadow-[0_0_40px_rgba(56,189,248,0.6)] px-6 py-6 space-y-4 text-center">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-slate-400">Z-Girl&apos;s Hero Breathing</p>
              <button type="button" onClick={() => setShowBreathing(false)} className="text-[11px] text-slate-400 hover:text-slate-100">
                ✕ Close
              </button>
            </div>

            <h2 className="text-lg font-semibold text-slate-50">Let&apos;s take a few hero breaths together</h2>
            <p className="text-xs text-slate-300">
              You don&apos;t have to do it perfectly. Just follow the circle and the words. If your mind wanders, that&apos;s okay—just gently come back.
            </p>

            <div className="flex items-center justify-center py-2">
              <div
                className={[
                  "relative h-36 w-36 sm:h-40 sm:w-40 rounded-full border border-sky-400/80 bg-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.7)] flex items-center justify-center transition-transform duration-700 ease-out",
                  currentBreathingStep.id === "inhale" ? "scale-110" : currentBreathingStep.id === "hold" ? "scale-100" : "scale-90",
                ].join(" ")}
              >
                <div className="absolute inset-0 rounded-full bg-sky-400/20 blur-2xl animate-pulse" />
                <div className="relative text-center space-y-1">
                  <div className="text-sm font-semibold text-sky-100">{currentBreathingStep.label}</div>
                  <div className="text-[11px] text-slate-100">{currentBreathingStep.countText}</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-200">{currentBreathingStep.subtitle}</p>

            <p className="text-[11px] text-slate-400">
              Try a few full cycles. When you&apos;re ready, tap <span className="font-semibold text-slate-200">Done</span> to go back to chatting with Z-Girl.
            </p>

            <button type="button" onClick={() => setShowBreathing(false)} className="mt-1 inline-flex items-center justify-center rounded-full bg-sky-400/90 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-sky-500/40 hover:bg-sky-300 transition">
              Done · Back to chat
            </button>
          </div>
        </div>
      )}

      {/* Audio */}
      <audio ref={sendSoundRef} src="/sounds/zgirl-chime.wav" preload="auto" />
      <audio ref={heroMomentSoundRef} src="/sounds/zgirl-chime.wav" preload="auto" />
      <audio ref={startupSoundRef} src="/sounds/zgirl-startup.mp3" preload="auto" />
      <audio ref={replyChimeRef} src="/sounds/zgirl-chime.wav" preload="auto" />
    </div>
  );
}
