// lib/safety.ts

export type RiskLevel = "low" | "medium" | "high";

export type RiskAssessment = {
  level: RiskLevel;
  tags: string[];
};

const HIGH_PATTERNS: { re: RegExp; tag: string }[] = [
  // self-harm / suicide
  { re: /\b(kill myself|killing myself|suicide|suicidal|end my life|want to die|ending it)\b/i, tag: "self_harm_high" },
  { re: /\b(self[-\s]?harm|cutting myself|overdose)\b/i, tag: "self_harm_high" },

  // credible violence toward others
  { re: /\b(kill (him|her|them|someone)|shoot (him|her|them|someone)|stab (him|her|them|someone))\b/i, tag: "violence_high" },
  { re: /\b(i'?m going to hurt (him|her|them|someone) badly)\b/i, tag: "violence_high" },

  // abuse / unsafe environment
  { re: /\b(being abused|sexual abuse|assaulted|raped)\b/i, tag: "abuse_high" },
  { re: /\b(they (hit|beat|hurt) me|i don'?t feel safe at home|i'?m not safe)\b/i, tag: "unsafe_high" },
];

const MEDIUM_PATTERNS: { re: RegExp; tag: string }[] = [
  // passive/self-harm-ish but not explicit intent
  { re: /\b(i don'?t want to be here|i wish i could disappear|i feel like giving up)\b/i, tag: "self_harm_medium" },
  { re: /\b(thoughts of self[-\s]?harm|hurting myself)\b/i, tag: "self_harm_medium" },

  // medical/legal boundary requests
  { re: /\b(what medication should i take|dose|diagnose me|is this a concussion|i think i broke)\b/i, tag: "medical_boundary" },
  { re: /\b(help me sue|write a legal defense|how do i beat a charge)\b/i, tag: "legal_boundary" },

  // violence ideation without explicit plan
  { re: /\b(i want to hurt someone|i want revenge|i want to fight)\b/i, tag: "violence_medium" },
];

export function assessRisk(text: string): RiskAssessment {
  const tags: string[] = [];
  const t = String(text || "");

  for (const p of HIGH_PATTERNS) {
    if (p.re.test(t)) tags.push(p.tag);
  }
  if (tags.length > 0) return { level: "high", tags };

  for (const p of MEDIUM_PATTERNS) {
    if (p.re.test(t)) tags.push(p.tag);
  }
  if (tags.length > 0) return { level: "medium", tags };

  return { level: "low", tags: [] };
}

export function crisisReply(opts?: { countryHint?: "US" | "OTHER" }): string {
  const usLine =
    "If you feel in immediate danger or like you might seriously hurt yourself or someone else, call 911 (in the United States) or your local emergency number right now.";
  const intlLine =
    "If you feel in immediate danger, contact your local emergency number right now.";

  return (
    "I’m really glad you told me this. Your safety matters a lot. 💙\n\n" +
    "I’m just a digital hero coach, so I can’t handle emergencies or keep you safe by myself.\n\n" +
    "Please reach out to a trusted adult *right now* — a parent/caregiver, school counselor, teacher, coach, or another adult you trust.\n\n" +
    (opts?.countryHint === "US" ? usLine : intlLine) +
    "\n\n" +
    "If you want, tell me: are you safe *right this second*, and is there a trusted adult you can contact first?"
  );
}

export function mediumRiskPrefix(tags: string[]): string {
  // This gets appended to the system prompt for “extra caution”
  return `
SAFETY MODE (MEDIUM RISK):
- The user may be discussing sensitive or risky topics: ${tags.join(", ")}.
- Be extra gentle and cautious.
- Do NOT provide medical or legal instructions.
- Encourage reaching out to a trusted adult if the situation feels unsafe, scary, or overwhelming.
- Keep the reply short (3–6 sentences) and include exactly ONE small "hero move".
`.trim();
}
