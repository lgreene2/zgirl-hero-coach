"use client";

/**
 * Privacy-safe analytics.
 * - Never send message text or personal identifiers.
 * - Stores aggregated counts locally.
 * - Optional server logging via /api/analytics (disabled by default).
 */

type EventName =
  | "app_open"
  | "chat_send"
  | "mood_select"
  | "breathing_start"
  | "hero_moment_save"
  | "video_script_generate"
  | "paywall_view"
  | "upgrade_click"
  | "audio_replay";

type Props = Record<string, string | number | boolean | null | undefined>;

const KEY = "zgirl-analytics-v1";
const ENABLE_REMOTE = process.env.NEXT_PUBLIC_ANALYTICS_REMOTE === "1";

function safeProps(props: Props) {
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || typeof v === "undefined") continue;
    if (/(text|message|content|prompt|transcript)/i.test(k)) continue;
    if (typeof v === "string" && v.length > 80) continue;
    if (typeof v === "boolean" || typeof v === "number" || typeof v === "string") {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

export function track(name: EventName, props: Props = {}) {
  if (typeof window === "undefined") return;

  const event = { name, props: safeProps(props), t: Date.now() };

  // Local aggregation (counts by name)
  try {
    const raw = window.localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : { counts: {}, last: null };
    data.counts[name] = (data.counts[name] || 0) + 1;
    data.last = event;
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore
  }

  // Optional remote logging (content-free)
  if (ENABLE_REMOTE) {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }).catch(() => {});
  }
}
