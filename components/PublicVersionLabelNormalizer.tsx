"use client";

import { useEffect } from "react";

const LEGACY_LABELS = new Map([
  [["HERO WITHIN", "v2.2"].join(" "), "HERO WITHIN"],
  [["HERO WITHIN", "v2.2.1"].join(" "), "HERO WITHIN"],
  [["Z-Girl Open", "v2.2"].join(" "), "Z-Girl Open"],
  [["Z-Girl Open", "v2.2.1"].join(" "), "Z-Girl Open"],
]);

export default function PublicVersionLabelNormalizer() {
  useEffect(() => {
    const normalize = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const current = node.nodeValue?.trim();
        if (current && LEGACY_LABELS.has(current) && node.nodeValue) {
          node.nodeValue = node.nodeValue.replace(current, LEGACY_LABELS.get(current) ?? current);
        }
        node = walker.nextNode();
      }
    };

    normalize();
    const observer = new MutationObserver(normalize);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
