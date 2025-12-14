"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

// Global singleton storage so multiple mounts don't add multiple listeners
declare global {
  interface Window {
    __zgirl_bip_listener_added?: boolean;
    __zgirl_deferred_prompt?: BeforeInstallPromptEvent | null;
  }
}

export default function InstallPWAButton() {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkInstalled = () => {
      const standalone =
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        (window.navigator as any).standalone === true;
      setInstalled(Boolean(standalone));
    };

    checkInstalled();

    // Attach listeners only once (even if component mounts multiple times)
    if (!window.__zgirl_bip_listener_added) {
      window.__zgirl_bip_listener_added = true;

      window.addEventListener("beforeinstallprompt", (e: Event) => {
        // Prevent the mini-infobar and let OUR button trigger the prompt
        e.preventDefault();
        window.__zgirl_deferred_prompt = e as BeforeInstallPromptEvent;
        setReady(true);
      });

      window.addEventListener("appinstalled", () => {
        window.__zgirl_deferred_prompt = null;
        setInstalled(true);
        setReady(false);
      });
    }

    // If the event already happened before this mount, still show the button
    if (window.__zgirl_deferred_prompt) setReady(true);

    // Track display-mode changes (installed/uninstalled behavior)
    const mm = window.matchMedia?.("(display-mode: standalone)");
    const onChange = () => checkInstalled();
    mm?.addEventListener?.("change", onChange);

    return () => {
      mm?.removeEventListener?.("change", onChange);
    };
  }, []);

  const handleClick = async () => {
    const dp = window.__zgirl_deferred_prompt;
    if (!dp) return;

    await dp.prompt();
    try {
      await dp.userChoice;
    } finally {
      // Can only be used once
      window.__zgirl_deferred_prompt = null;
      setReady(false);
    }
  };

  // Hide if already installed or if prompt isn't available
  if (installed || !ready) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-3 inline-flex items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-100 transition-colors"
      aria-label="Install Z-Girl Hero Coach"
    >
      <span className="mr-1">📲</span>
      Install Z-Girl Hero Coach
    </button>
  );
}
