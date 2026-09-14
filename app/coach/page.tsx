"use client";

import { useEffect, useRef } from "react";
import CoachExperience from "./CoachExperience";

export default function CoachPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const normalizePublicVersionLabels = () => {
      const root = rootRef.current;
      if (!root) return;
      root.querySelectorAll("span").forEach((element) => {
        if (element.textContent?.trim() === "HERO WITHIN v2.2") {
          element.textContent = "HERO WITHIN";
        }
      });
    };

    normalizePublicVersionLabels();
    const observer = new MutationObserver(normalizePublicVersionLabels);
    if (rootRef.current) {
      observer.observe(rootRef.current, { childList: true, subtree: true, characterData: true });
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef}>
      <CoachExperience />
    </div>
  );
}
