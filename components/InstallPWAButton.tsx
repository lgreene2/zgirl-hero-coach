"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __zgirl_deferred_prompt?: BeforeInstallPromptEvent | null;
  }
}

function isStandalone() {
  return Boolean(
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  );
}

export default function InstallPWAButton() {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [userAgent, setUserAgent] = useState("");

  useEffect(() => {
    setUserAgent(window.navigator.userAgent);
    setInstalled(isStandalone());
    if (window.__zgirl_deferred_prompt) setReady(true);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      window.__zgirl_deferred_prompt = event as BeforeInstallPromptEvent;
      setReady(true);
    };
    const onInstalled = () => {
      window.__zgirl_deferred_prompt = null;
      setInstalled(true);
      setReady(false);
      setShowGuide(false);
    };
    const displayMode = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayMode = () => setInstalled(isStandalone());
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setShowGuide(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("keydown", onKeyDown);
    displayMode?.addEventListener?.("change", onDisplayMode);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("keydown", onKeyDown);
      displayMode?.removeEventListener?.("change", onDisplayMode);
    };
  }, []);

  const instructions = useMemo(() => {
    const ua = userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua);
    const android = /android/.test(ua);
    const safari = /safari/.test(ua) && !/chrome|crios|edg/.test(ua);
    if (iOS) return ["Open this page in Safari.", "Tap the Share button.", "Choose Add to Home Screen, then tap Add."];
    if (android) return ["Open the browser menu (⋮).", "Choose Install app or Add to Home screen.", "Confirm Install."];
    if (safari) return ["Open the File menu in Safari.", "Choose Add to Dock.", "Confirm the app name and select Add."];
    return ["Look for the install icon in the right side of the address bar.", "Or open the browser menu and choose Apps, then Install Z-Girl.", "Confirm Install."];
  }, [userAgent]);

  const handleClick = async () => {
    const prompt = window.__zgirl_deferred_prompt;
    if (!prompt) {
      setShowGuide(true);
      return;
    }
    await prompt.prompt();
    try {
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
    } finally {
      window.__zgirl_deferred_prompt = null;
      setReady(false);
    }
  };

  if (installed) {
    return <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-200">Installed ✓</span>;
  }

  return (
    <>
      <button type="button" onClick={handleClick} className="inline-flex items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-200 transition-colors hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/30" aria-haspopup={ready ? undefined : "dialog"}>
        <span aria-hidden="true" className="mr-1">↧</span>
        {ready ? "Install Z-Girl" : "How to install"}
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#020914]/80 p-5 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowGuide(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="install-guide-title" className="w-full max-w-lg rounded-[2rem] border border-white/15 bg-[#0b2030] p-6 text-left text-white shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div><p className="section-kicker">Use Z-Girl like an app</p><h2 id="install-guide-title" className="font-display text-2xl font-black">Install on this device</h2></div>
              <button type="button" onClick={() => setShowGuide(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-xl text-slate-300 hover:bg-white/5" aria-label="Close installation guide">×</button>
            </div>
            <ol className="mt-6 space-y-4">
              {instructions.map((instruction, index) => (
                <li key={instruction} className="flex gap-3 text-sm leading-6 text-slate-200"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#49d8c2] text-xs font-black text-[#04151c]">{index + 1}</span><span>{instruction}</span></li>
              ))}
            </ol>
            <p className="mt-6 rounded-2xl border border-white/10 bg-white/[.035] p-4 text-xs leading-5 text-slate-400">Once installed, Z-Girl opens in its own window. Previously visited reflection pages can reopen offline; AI Coach replies still require an internet connection.</p>
          </section>
        </div>
      )}
    </>
  );
}
