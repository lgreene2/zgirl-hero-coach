"use client";

import { useEffect } from "react";

const resourceRedirects: Record<string, string> = {
  "/resources/ZGirl_Christian_Reflection_Starter_Pack.pdf":
    "/resources/christian-reflection-starter-pack",
  "/resources/ZGirl_Congregation_Starter_Toolkit.pdf":
    "/resources/congregation-starter-toolkit",
  "/resources/ZGirl_Catholic_Youth_Pilot_Concept_OnePager.pdf":
    "/resources/catholic-youth-pilot-concept",
  "/resources/ZGirl_Catholic_Leadership_Meeting_Package.pdf":
    "/resources/catholic-leadership-package",
  "/resources/Hero_Within_Athlete_Reflection_Starter_Pack.pdf":
    "/resources/athlete-reflection-starter-pack",
  "/resources/Hero_Within_Coach_Toolkit.pdf": "/resources/coach-toolkit",
  "/resources/Hero_Within_Team_Pilot_Sell_Sheet.pdf":
    "/resources/team-pilot-sell-sheet",
};

export default function LegacyResourceLinks() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const url = new URL(anchor.href, window.location.href);
      const replacement = resourceRedirects[url.pathname];
      if (!replacement) return;

      event.preventDefault();
      window.location.assign(replacement);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
