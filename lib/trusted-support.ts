export type SupportRole = "parent" | "coach" | "educator" | "therapist" | "faith" | "mentor";
export type AgeBand = "child" | "teen" | "adult";
export type ShareField = "situation" | "feeling" | "theme" | "strength" | "heroMove" | "question";

export type SupportRoleConfig = {
  id: SupportRole;
  label: string;
  shortLabel: string;
  description: string;
  handoffGoal: string;
  supporterPrompt: string;
  boundaries: string[];
};

export const SUPPORT_ROLES: SupportRoleConfig[] = [
  {
    id: "parent",
    label: "Parent or Guardian",
    shortLabel: "Parent",
    description: "Turn a private reflection into a calmer, clearer family conversation without turning Z-Girl into a surveillance tool.",
    handoffGoal: "Help me explain what I want support with and what would help next.",
    supporterPrompt: "Listen first. Reflect back what you heard, ask what kind of help is wanted, and agree on one realistic next step.",
    boundaries: ["Private reflection is not automatically shared.", "The young person chooses the normal handoff content.", "Safety concerns follow the separate Z-Girl safety pathway."],
  },
  {
    id: "coach",
    label: "Coach",
    shortLabel: "Coach",
    description: "Prepare for practice, performance, confidence, leadership, setbacks, communication, and post-game learning.",
    handoffGoal: "Help my coach understand my focus, what I learned, and the support I want next.",
    supporterPrompt: "Use the brief to start the human conversation. Confirm the athlete's goal, agree on one observable action, and avoid treating an AI summary as a performance diagnosis.",
    boundaries: ["No medical or injury diagnosis.", "No automated playing-time or discipline decisions.", "Participant-selected sharing remains the default."],
  },
  {
    id: "educator",
    label: "Teacher or Educator",
    shortLabel: "Educator",
    description: "Support learning, self-management, belonging, classroom communication, and student-led problem solving.",
    handoffGoal: "Help an educator understand the learning or relationship support I am asking for.",
    supporterPrompt: "Treat the brief as a conversation starter, not a student record or diagnosis. Clarify the student's request and agree on one classroom support or next action.",
    boundaries: ["Avoid unnecessary identifying details.", "No disability or mental-health diagnosis.", "Institutional policies and required accommodations remain authoritative."],
  },
  {
    id: "therapist",
    label: "Therapist or Counselor",
    shortLabel: "Therapist",
    description: "Prepare themes, questions, goals, and between-session reflections for discussion with a licensed or otherwise qualified human professional.",
    handoffGoal: "Help me arrive at my human session with the themes and questions I chose to share.",
    supporterPrompt: "Use the participant-selected brief as session-preparation material. Clinical interpretation, diagnosis, treatment planning, and risk assessment remain with the qualified human professional.",
    boundaries: ["Z-Girl is not therapy and does not diagnose.", "Z-Girl does not recommend medication or alter treatment.", "Crisis or imminent-safety concerns bypass the normal reflection handoff flow."],
  },
  {
    id: "faith",
    label: "Faith Leader",
    shortLabel: "Faith",
    description: "Connect reflection, values, meaning, community support, and an approved faith profile without replacing professional care.",
    handoffGoal: "Help me share the value, question, or support need I want to discuss with a faith leader.",
    supporterPrompt: "Respond within the participant's chosen faith or values context, avoid coercion, and refer clinical, legal, or emergency concerns to appropriate qualified help.",
    boundaries: ["Faith framing is opt-in.", "Do not present spiritual interpretation as clinical diagnosis.", "Participant choice and safety boundaries remain in force."],
  },
  {
    id: "mentor",
    label: "Mentor or Trusted Adult",
    shortLabel: "Mentor",
    description: "Create a simple bridge to a mentor, youth leader, family member, or other trusted adult.",
    handoffGoal: "Help me tell a trusted person what is going on, what strength I am using, and what support I want.",
    supporterPrompt: "Listen, ask what support is wanted, help identify one safe next step, and bring in a qualified professional when the situation is beyond your role.",
    boundaries: ["Do not over-interpret the AI summary.", "Respect what was not selected for sharing.", "Escalate safety concerns to appropriate human help."],
  },
];

export const AGE_GUIDANCE: Record<AgeBand, { label: string; guidance: string }> = {
  child: { label: "Child", guidance: "Use short, concrete language; offer choices; encourage appropriate caregiver support; never pressure disclosure." },
  teen: { label: "Teen", guidance: "Respect growing autonomy and privacy; explain sharing clearly; use collaborative, non-patronizing language." },
  adult: { label: "Adult", guidance: "Use direct, respectful language and preserve the participant's ownership of goals, interpretation, and sharing." },
};

export const SHARE_FIELDS: { id: ShareField; label: string; helper: string }[] = [
  { id: "situation", label: "What happened", helper: "The situation or moment I want them to understand." },
  { id: "feeling", label: "How I feel", helper: "The feeling or state I chose to name." },
  { id: "theme", label: "What may be influencing it", helper: "Pressures, needs, patterns, or context I want to share." },
  { id: "strength", label: "Strength I can use", helper: "A value, skill, relationship, or past win." },
  { id: "heroMove", label: "My Hero Move", helper: "The next action I chose for myself." },
  { id: "question", label: "What I want help with", helper: "The question, conversation, or support request I want to bring forward." },
];

export function getSupportRole(role: SupportRole) {
  return SUPPORT_ROLES.find((item) => item.id === role) ?? SUPPORT_ROLES[0];
}

export function buildLocalHandoff(input: {
  role: SupportRole;
  ageBand: AgeBand;
  selected: ShareField[];
  values: Record<ShareField, string>;
  supporterName?: string;
}) {
  const config = getSupportRole(input.role);
  const selected = new Set(input.selected);
  const parts = [
    "Z-GIRL TRUSTED-SUPPORT BRIEF",
    `For: ${input.supporterName?.trim() || config.label}`,
    `Support role: ${config.label}`,
    "",
    "This brief contains only the items I chose to share.",
  ];

  const append = (field: ShareField, label: string) => {
    if (!selected.has(field)) return;
    const value = input.values[field]?.trim();
    if (value) parts.push("", `${label}:`, value);
  };

  append("situation", "WHAT I WANT YOU TO KNOW");
  append("feeling", "HOW I FEEL");
  append("theme", "WHAT MAY BE INFLUENCING THIS");
  append("strength", "STRENGTH I AM BRINGING");
  append("heroMove", "MY HERO MOVE");
  append("question", "WHAT I WANT HELP WITH");

  parts.push("", "HOW TO USE THIS", config.supporterPrompt, "", "Note: Z-Girl supports reflection and communication. It does not replace qualified professional judgment or emergency services.");
  return parts.join("\n");
}
