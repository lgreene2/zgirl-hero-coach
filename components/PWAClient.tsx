"use client";

import { useEffect, useState } from "react";

export default function PWAClient() {
  const [updateReady, setUpdateReady] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let reloading = false;

    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
          setUpdateReady(true);
        }
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(registration.waiting ?? installing);
              setUpdateReady(true);
            }
          });
        });
        void registration.update();
      } catch {
        // A registration failure should not block the reflection experience.
      }
    };

    void register();
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  if (!updateReady) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-xl rounded-2xl border border-[#49d8c2]/40 bg-[#071a28]/95 p-4 text-white shadow-2xl backdrop-blur" role="status" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-black">A Z-Girl update is ready</p><p className="mt-1 text-xs leading-5 text-slate-300">Update now to use the newest journey, language, transcript, and offline features.</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setUpdateReady(false)} className="rounded-full px-3 py-2 text-xs font-black text-slate-300">Later</button>
          <button type="button" onClick={() => waitingWorker?.postMessage({ type: "SKIP_WAITING" })} className="rounded-full bg-[#49d8c2] px-4 py-2 text-xs font-black text-[#04151c]">Update now</button>
        </div>
      </div>
    </div>
  );
}
