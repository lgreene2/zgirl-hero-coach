"use client";

import { useEffect } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const SELECTOR = "textarea.reflection-field, textarea[aria-label='Editable support brief']";

function setNativeValue(el: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

export default function VoiceToTextEnhancer() {
  useEffect(() => {
    const w = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) return;

    const enhance = (textarea: HTMLTextAreaElement) => {
      if (textarea.dataset.voiceEnhanced === "true" || textarea.dataset.voiceDisabled === "true") return;
      textarea.dataset.voiceEnhanced = "true";

      const row = document.createElement("div");
      row.className = "mt-2 flex flex-wrap items-center gap-2";
      row.dataset.voiceControl = "true";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "rounded-full border border-[#49d8c2]/35 bg-[#49d8c2]/10 px-3.5 py-2 text-xs font-black text-[#8ef0e3] transition hover:border-[#49d8c2]";
      button.textContent = "🎙 Speak instead";
      button.setAttribute("aria-label", "Use voice to enter text");

      const status = document.createElement("span");
      status.className = "text-[11px] leading-5 text-slate-500";
      status.textContent = "Voice transcript stays editable and is not shared automatically.";

      let recognition: SpeechRecognitionLike | null = null;
      let listening = false;
      let baseValue = "";

      const finish = () => {
        listening = false;
        button.textContent = "🎙 Speak instead";
        button.setAttribute("aria-pressed", "false");
      };

      button.addEventListener("click", () => {
        if (listening && recognition) {
          recognition.stop();
          return;
        }

        recognition = new Recognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = document.documentElement.lang || "en-US";
        baseValue = textarea.value.trimEnd();
        listening = true;
        button.textContent = "■ Stop listening";
        button.setAttribute("aria-pressed", "true");
        status.textContent = "Listening… speak naturally. Review the transcript before continuing.";

        recognition.onresult = (event) => {
          let finalText = "";
          let interim = "";
          for (let i = 0; i < event.results.length; i += 1) {
            const result = event.results[i];
            const text = result[0]?.transcript || "";
            if (result.isFinal) finalText += text;
            else interim += text;
          }
          const spoken = `${finalText}${interim}`.trim();
          const next = [baseValue, spoken].filter(Boolean).join(baseValue && spoken ? " " : "");
          setNativeValue(textarea, next);
        };
        recognition.onend = () => {
          finish();
          status.textContent = "Voice added. Review or edit before sharing.";
        };
        recognition.onerror = () => {
          finish();
          status.textContent = "Voice input was unavailable. You can keep typing or use your device keyboard dictation.";
        };
        recognition.start();
      });

      row.append(button, status);
      textarea.insertAdjacentElement("afterend", row);
    };

    const scan = () => document.querySelectorAll<HTMLTextAreaElement>(SELECTOR).forEach(enhance);
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
