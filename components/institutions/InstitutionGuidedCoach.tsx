"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { curateNarrationVoices, isSpeechSupported, pickVoice } from "@/app/lib/voice";
import {
  commandCenterMapLesson,
  fullOrientationLesson,
  pageLesson,
  primaryRoleLabel,
  type GuideLesson,
  type GuideState,
} from "@/lib/institutions/guided-coach";

type Mode = "page" | "map" | "orientation";
type VoiceStatus = "idle" | "speaking" | "paused" | "unsupported";
type TargetNotice = { title: string; body: string };
type HighlightSnapshot = {
  element: HTMLElement;
  outline: string;
  outlineOffset: string;
  boxShadow: string;
  transition: string;
};

type CandidateQueueResponse = {
  ok?: boolean;
  queue?: {
    count?: number;
    opportunities?: Array<{
      organization?: string | null;
      stage?: string | null;
      priority?: string | null;
      audienceSize?: string | null;
      estimatedValue?: number | null;
      nextAction?: string | null;
    }>;
  };
};

type IdentityResponse = {
  ok?: boolean;
  dashboard?: {
    context?: {
      displayName?: string | null;
      roles?: Array<{ roleKey?: string | null }>;
    };
  };
};

const SEEN_KEY = "zgirl-guided-coach-seen-v3.12";
const COMPLETED_KEY = "zgirl-guided-coach-completed-v3.12";
const VOICE_KEY = "zgirl-guided-coach-voice-v3.12";
const RATE_KEY = "zgirl-guided-coach-rate-v3.12";
const CAPTIONS_KEY = "zgirl-guided-coach-captions-v3.12";

function safeLocalGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Training preferences are optional. Do not fail the workflow if storage is unavailable.
  }
}

function completedLessons(): string[] {
  try {
    const parsed = JSON.parse(safeLocalGet(COMPLETED_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default function InstitutionGuidedCoach() {
  const pathname = usePathname();
  const supportedPath = pathname === "/institutions/auth" || pathname.startsWith("/institutions/ops") || pathname === "/institutions/partner-pipeline";
  const [open, setOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mode, setMode] = useState<Mode>("page");
  const [stepIndex, setStepIndex] = useState(0);
  const [guideState, setGuideState] = useState<GuideState>({ roleKeys: [] });
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(0.95);
  const [captions, setCaptions] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);
  const [targetNotice, setTargetNotice] = useState<TargetNotice | null>(null);
  const [showFeedback, setShowFeedback] = useState("");
  const highlightRef = useRef<HighlightSnapshot | null>(null);

  const roleLabel = primaryRoleLabel(guideState.roleKeys || []);
  const lesson: GuideLesson = useMemo(() => {
    if (mode === "map") return commandCenterMapLesson();
    if (mode === "orientation") return fullOrientationLesson(roleLabel);
    return pageLesson(pathname, guideState);
  }, [mode, pathname, guideState, roleLabel]);

  const step = lesson.steps[Math.min(stepIndex, Math.max(lesson.steps.length - 1, 0))];
  const lessonComplete = completed.includes(lesson.key);

  useEffect(() => {
    if (!supportedPath) return;
    setCompleted(completedLessons());
    const storedRate = Number(safeLocalGet(RATE_KEY));
    if (storedRate >= 0.75 && storedRate <= 1.15) setRate(storedRate);
    const storedCaptions = safeLocalGet(CAPTIONS_KEY);
    if (storedCaptions === "off") setCaptions(false);
    const timer = window.setTimeout(() => {
      if (!safeLocalGet(SEEN_KEY) && pathname.startsWith("/institutions/ops")) setShowWelcome(true);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [pathname, supportedPath]);

  useEffect(() => {
    if (!supportedPath || pathname === "/institutions/auth") return;
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/institutions/ops/identity/dashboard", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as IdentityResponse;
        const context = data.dashboard?.context;
        if (!active || !response.ok || !data.ok || !context) return;
        setGuideState((current) => ({
          ...current,
          displayName: context.displayName || null,
          roleKeys: (context.roles || []).map((role) => role.roleKey).filter((value): value is string => Boolean(value)),
        }));
      } catch {
        // Lower-privilege operators may not have identity.read. Page guidance remains available.
      }
    })();
    return () => {
      active = false;
    };
  }, [pathname, supportedPath]);

  useEffect(() => {
    if (pathname !== "/institutions/ops/pilots") return;
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/institutions/ops/pilots/gls-candidates", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as CandidateQueueResponse;
        if (!active || !response.ok || !data.ok) return;
        const top = data.queue?.opportunities?.[0] || null;
        setGuideState((current) => ({
          ...current,
          opportunityCount: data.queue?.count ?? 0,
          topOpportunity: top
            ? {
                organization: top.organization,
                stage: top.stage,
                priority: top.priority,
                audienceSize: top.audienceSize,
                estimatedValue: top.estimatedValue,
                nextAction: top.nextAction,
              }
            : null,
        }));
      } catch {
        // The guide never bypasses the existing pipeline-read boundary.
      }
    })();
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!supportedPath || !isSpeechSupported()) {
      if (supportedPath) setVoiceStatus("unsupported");
      return;
    }
    const synth = window.speechSynthesis;
    const load = () => {
      const list = synth.getVoices();
      const curated = curateNarrationVoices(list, "en-US", 6);
      setVoices(curated);
      const stored = safeLocalGet(VOICE_KEY);
      const storedAllowed = stored && curated.some((voice) => voice.name === stored) ? stored : undefined;
      const preferred = pickVoice(curated, { lang: "en-US", preferredName: storedAllowed, preferFemale: true });
      if (preferred) {
        setVoiceName(preferred.name);
        if (stored !== preferred.name) safeLocalSet(VOICE_KEY, preferred.name);
      } else {
        setVoiceName("");
      }
    };
    load();
    synth.addEventListener?.("voiceschanged", load);
    return () => synth.removeEventListener?.("voiceschanged", load);
  }, [supportedPath]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setVoiceStatus(isSpeechSupported() ? "idle" : "unsupported");
  }, []);

  function restoreHighlight() {
    const snapshot = highlightRef.current;
    if (!snapshot) return;
    snapshot.element.style.outline = snapshot.outline;
    snapshot.element.style.outlineOffset = snapshot.outlineOffset;
    snapshot.element.style.boxShadow = snapshot.boxShadow;
    snapshot.element.style.transition = snapshot.transition;
    highlightRef.current = null;
  }

  useEffect(() => {
    stopSpeech();
    setStepIndex(0);
    restoreHighlight();
    setTargetNotice(null);
    setShowFeedback("");
  }, [mode, pathname, stopSpeech]);

  useEffect(() => () => {
    stopSpeech();
    restoreHighlight();
  }, [stopSpeech]);

  const speak = useCallback(() => {
    if (!step || !isSpeechSupported()) {
      setVoiceStatus("unsupported");
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(`${step.title}. ${step.body}${step.safety ? ` Safety note. ${step.safety}` : ""}`);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    const selected = voices.find((voice) => voice.name === voiceName) || pickVoice(voices, { lang: "en-US", preferredName: voiceName || undefined, preferFemale: true });
    if (selected) utterance.voice = selected;
    utterance.onstart = () => setVoiceStatus("speaking");
    utterance.onpause = () => setVoiceStatus("paused");
    utterance.onresume = () => setVoiceStatus("speaking");
    utterance.onend = () => setVoiceStatus("idle");
    utterance.onerror = () => setVoiceStatus("idle");
    synth.speak(utterance);
  }, [step, rate, voices, voiceName]);

  function pauseResume() {
    if (!isSpeechSupported()) return;
    const synth = window.speechSynthesis;
    if (voiceStatus === "speaking") {
      synth.pause();
      setVoiceStatus("paused");
    } else if (voiceStatus === "paused") {
      synth.resume();
      setVoiceStatus("speaking");
    }
  }

  function showTarget() {
    setShowFeedback("");
    if (!step?.target) return;
    restoreHighlight();
    const element = document.querySelector(step.target) as HTMLElement | null;
    if (!element) {
      setShowFeedback("I couldn't locate that item on the current page. Nothing was changed.");
      return;
    }

    stopSpeech();
    highlightRef.current = {
      element,
      outline: element.style.outline,
      outlineOffset: element.style.outlineOffset,
      boxShadow: element.style.boxShadow,
      transition: element.style.transition,
    };

    setTargetNotice({
      title: step.title,
      body: "The bright teal outline marks the exact item this step refers to. The Guide panel is hidden temporarily so the page is easy to see.",
    });
    setOpen(false);

    window.setTimeout(() => {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.style.transition = "outline-color 160ms ease, box-shadow 160ms ease";
      element.style.outline = "6px solid #76ead6";
      element.style.outlineOffset = "8px";
      element.style.boxShadow = "0 0 0 12px rgba(118,234,214,.18), 0 0 44px rgba(73,216,194,.42)";
      try {
        element.animate(
          [
            { opacity: 1 },
            { opacity: 0.72 },
            { opacity: 1 },
          ],
          { duration: 750, iterations: 2 }
        );
      } catch {
        // The persistent teal outline remains sufficient if Web Animations is unavailable.
      }
    }, 120);
  }

  function returnToGuide() {
    restoreHighlight();
    setTargetNotice(null);
    setOpen(true);
  }

  function dismissTarget() {
    restoreHighlight();
    setTargetNotice(null);
  }

  function markComplete() {
    const next = Array.from(new Set([...completedLessons(), lesson.key]));
    safeLocalSet(COMPLETED_KEY, JSON.stringify(next));
    setCompleted(next);
  }

  function begin(modeToUse: Mode) {
    safeLocalSet(SEEN_KEY, "seen");
    setShowWelcome(false);
    setMode(modeToUse);
    setStepIndex(0);
    setOpen(true);
  }

  if (!supportedPath) return null;

  return (
    <>
      {showWelcome && (
        <div className="fixed bottom-24 left-4 right-4 z-[79] mx-auto max-w-md rounded-[1.7rem] border border-[#76ead6]/30 bg-[#061521] p-5 shadow-2xl shadow-black/40 sm:left-auto sm:right-6">
          <button aria-label="Dismiss guided coach introduction" onClick={() => { safeLocalSet(SEEN_KEY, "seen"); setShowWelcome(false); }} className="absolute right-4 top-3 text-xl text-slate-400 hover:text-white">×</button>
          <div className="text-[11px] font-black uppercase tracking-[.16em] text-[#76ead6]">New · Guided Coach</div>
          <h2 className="mt-2 font-display text-2xl font-black">Want a quick map of the Command Centers?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Voice is always user-started. Captions stay available, and the guide never reads authentication secrets or private participant reflections.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => begin("map")} className="button-primary">Start 3-minute tour</button>
            <button onClick={() => begin("page")} className="button-secondary">Guide this page</button>
          </div>
        </div>
      )}

      {targetNotice && (
        <div className="fixed left-3 right-3 top-3 z-[92] mx-auto max-w-lg rounded-[1.4rem] border border-[#76ead6]/40 bg-[#04111b] p-4 shadow-2xl shadow-black/50" role="status" aria-live="polite">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#49d8c2] text-lg" aria-hidden="true">👀</div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-[.14em] text-[#76ead6]">Showing on page</div>
              <div className="mt-1 text-sm font-black text-white">{targetNotice.title}</div>
              <p className="mt-1 text-xs leading-5 text-slate-300">{targetNotice.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={returnToGuide} className="button-primary">Return to Guide</button>
                <button onClick={dismissTarget} className="button-secondary">Close highlight</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => { safeLocalSet(SEEN_KEY, "seen"); restoreHighlight(); setTargetNotice(null); setOpen(true); }}
        className="fixed bottom-5 right-4 z-[78] inline-flex items-center gap-2 rounded-full border border-[#76ead6]/30 bg-[#49d8c2] px-4 py-3 text-sm font-black text-[#04151c] shadow-xl shadow-black/30 transition hover:bg-[#76ead6] sm:right-6"
        aria-label="Open Z-Girl Guided Coach"
      >
        <span aria-hidden="true">🎧</span> Guide Me
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/55 p-3 backdrop-blur-sm sm:flex sm:items-end sm:justify-end sm:p-6" role="dialog" aria-modal="true" aria-label="Z-Girl Guided Coach">
          <section className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#061521] shadow-2xl sm:max-w-xl">
            <header className="border-b border-white/10 bg-[#04111b] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[.16em] text-[#76ead6]">Z-Girl Command Center Guided Coach · v1.1</div>
                  <h2 className="mt-1 font-display text-2xl font-black text-white">{lesson.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{lesson.subtitle} · About {lesson.estimatedMinutes} min</p>
                </div>
                <button onClick={() => { stopSpeech(); setOpen(false); }} aria-label="Close Guided Coach" className="rounded-full border border-white/10 px-3 py-1.5 text-lg text-slate-300 hover:text-white">×</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                <button onClick={() => setMode("page")} className={mode === "page" ? "rounded-full bg-[#49d8c2] px-3 py-2 text-[#04151c]" : "rounded-full border border-white/10 px-3 py-2 text-slate-300"}>This page</button>
                <button onClick={() => setMode("map")} className={mode === "map" ? "rounded-full bg-[#49d8c2] px-3 py-2 text-[#04151c]" : "rounded-full border border-white/10 px-3 py-2 text-slate-300"}>Command Center map</button>
                <button onClick={() => setMode("orientation")} className={mode === "orientation" ? "rounded-full bg-[#49d8c2] px-3 py-2 text-[#04151c]" : "rounded-full border border-white/10 px-3 py-2 text-slate-300"}>Full orientation</button>
              </div>
            </header>

            <div className="overflow-y-auto px-5 py-5">
              <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{roleLabel}</span>
                <span>Step {stepIndex + 1} of {lesson.steps.length}{lessonComplete ? " · Completed" : ""}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#49d8c2] transition-all" style={{ width: `${((stepIndex + 1) / lesson.steps.length) * 100}%` }} /></div>

              {step && (
                <article className="mt-5 rounded-[1.6rem] border border-white/10 bg-white/[.035] p-5">
                  <h3 className="font-display text-2xl font-black text-white">{step.title}</h3>
                  {captions && <p className="mt-3 text-sm leading-7 text-slate-300" aria-live="polite">{step.body}</p>}
                  {step.safety && <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[.06] p-3 text-xs leading-6 text-amber-100"><strong>Safety boundary:</strong> {step.safety}</div>}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button onClick={speak} disabled={voiceStatus === "unsupported"} className="button-primary disabled:opacity-40">{voiceStatus === "speaking" ? "Replay voice" : "▶ Play voice"}</button>
                    {(voiceStatus === "speaking" || voiceStatus === "paused") && <button onClick={pauseResume} className="button-secondary">{voiceStatus === "paused" ? "Resume" : "Pause"}</button>}
                    {voiceStatus !== "idle" && voiceStatus !== "unsupported" && <button onClick={stopSpeech} className="button-secondary">Stop</button>}
                    {step.target && <button onClick={showTarget} className="button-secondary">👀 Show on page</button>}
                    {step.href && <Link href={step.href} onClick={stopSpeech} className="button-secondary">{step.actionLabel || "Go there"}</Link>}
                  </div>
                  {step.target && <p className="mt-3 text-xs leading-5 text-slate-500">“Show on page” temporarily hides this Guide, scrolls to the exact item, and marks it with a bright teal outline. Tap “Return to Guide” when you are ready to continue.</p>}
                  {showFeedback && <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/[.05] p-3 text-xs leading-5 text-amber-100" role="status">{showFeedback}</p>}
                  {voiceStatus === "unsupported" && <p className="mt-3 text-xs leading-5 text-slate-500">Voice playback is not available in this browser. The complete caption/transcript remains available.</p>}
                </article>
              )}

              <details className="mt-4 rounded-2xl border border-white/10 bg-[#04111b] p-4">
                <summary className="cursor-pointer text-xs font-black uppercase tracking-[.12em] text-slate-300">Voice & accessibility controls</summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-slate-400">Recommended voice
                    <select value={voiceName} onChange={(event) => { setVoiceName(event.target.value); safeLocalSet(VOICE_KEY, event.target.value); stopSpeech(); }} className="mt-2 w-full rounded-xl border border-white/10 bg-[#061521] p-3 text-sm text-white">
                      {voices.length === 0 && <option value="">Device default</option>}
                      {voices.map((voice) => <option key={`${voice.name}-${voice.lang}`} value={voice.name}>{voice.name} · {voice.lang}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-slate-400">Speaking speed
                    <select value={rate} onChange={(event) => { const next = Number(event.target.value); setRate(next); safeLocalSet(RATE_KEY, String(next)); stopSpeech(); }} className="mt-2 w-full rounded-xl border border-white/10 bg-[#061521] p-3 text-sm text-white">
                      <option value={0.8}>Slower</option>
                      <option value={0.9}>Calm</option>
                      <option value={0.95}>Natural</option>
                      <option value={1}>Standard</option>
                      <option value={1.1}>Faster</option>
                    </select>
                  </label>
                </div>
                <label className="mt-4 flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={captions} onChange={(event) => { setCaptions(event.target.checked); safeLocalSet(CAPTIONS_KEY, event.target.checked ? "on" : "off"); }} /> Show captions/transcript</label>
                <p className="mt-3 text-xs leading-5 text-slate-500">Only curated professional English narration voices are shown when the device provides them. Known novelty, character, compact, and distracting voices are filtered out. Audio never starts automatically.</p>
              </details>

              <div className="mt-5 flex items-center justify-between gap-3">
                <button onClick={() => { stopSpeech(); setShowFeedback(""); setStepIndex((index) => Math.max(0, index - 1)); }} disabled={stepIndex === 0} className="button-secondary disabled:opacity-30">← Previous</button>
                {stepIndex < lesson.steps.length - 1 ? (
                  <button onClick={() => { stopSpeech(); setShowFeedback(""); setStepIndex((index) => Math.min(lesson.steps.length - 1, index + 1)); }} className="button-primary">Next →</button>
                ) : (
                  <button onClick={markComplete} className="button-primary">{lessonComplete ? "Completed ✓" : "Mark complete ✓"}</button>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-4 text-xs leading-6 text-slate-500">
                Guided Coach training is operational guidance, not legal, clinical, regulatory, professional-licensure, or independent-audit advice. Human approval gates and institutional policies remain authoritative.
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
