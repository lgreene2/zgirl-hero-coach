export type HumanSupportRole = "parent" | "coach" | "educator" | "therapist" | "faith" | "mentor";
export type HumanSupportAgeBand = "child" | "teen" | "adult";

export type HumanVisualScenario = {
  id: string;
  role: HumanSupportRole;
  title: string;
  moment: string;
  visualBrief: string;
  alt: string;
  safetyBoundary: string;
  status: "candidate" | "approved";
};

export const HUMAN_SUPPORT_SCENARIOS: HumanVisualScenario[] = [
  { id:"parent-listens", role:"parent", title:"Parent listens first", moment:"A calm kitchen-table conversation after a difficult day.", visualBrief:"Warm natural-light documentary-style scene of a parent listening attentively to a school-age child, equal eye level, emotionally safe body language, no staged therapy cues, premium contemporary home, diverse casting, mobile-safe composition.", alt:"A parent listening closely to a child during a calm conversation.", safetyBoundary:"Do not imply surveillance, discipline, diagnosis, or crisis intervention.", status:"candidate" },
  { id:"coach-checkin", role:"coach", title:"Coach checks in", moment:"A supportive conversation after practice before discussing performance.", visualBrief:"Premium candid sports environment, coach and teen athlete seated or standing side by side, collaborative posture, diverse casting, quiet post-practice moment, no yelling or scoreboard emphasis.", alt:"A coach and young athlete talking after practice.", safetyBoundary:"Do not imply medical or sports-medicine assessment.", status:"candidate" },
  { id:"educator-support", role:"educator", title:"Teacher creates space", moment:"A student asks for help before returning to learning.", visualBrief:"Modern classroom, teacher and student speaking at a respectful distance, warm natural light, visually calm, inclusive environment, premium editorial realism, no disciplinary cues.", alt:"A teacher speaking supportively with a student in a classroom.", safetyBoundary:"Do not imply special-education diagnosis, punishment, or confidential record access.", status:"candidate" },
  { id:"counselor-prep", role:"therapist", title:"Prepared for the conversation", moment:"A client arrives with a Z-Girl reflection ready to discuss with a counselor.", visualBrief:"Calm professional counseling office, counselor and teen or young adult in ordinary conversation, open posture, neutral warm environment, no clipboard diagnosis trope, no crisis imagery, premium editorial realism.", alt:"A counselor and young person having a calm conversation.", safetyBoundary:"Session preparation only. Never imply diagnosis, treatment outcome, or clinical recommendation.", status:"candidate" },
  { id:"faith-values", role:"faith", title:"Values-based support", moment:"A young person speaks with a trusted faith leader about values and next steps.", visualBrief:"Welcoming community setting, young person and faith leader in supportive conversation, respectful and non-denominational visual language, no proselytizing gesture, premium natural photography feel.", alt:"A young person talking with a trusted faith leader.", safetyBoundary:"Do not imply clergy replaces mental-health or emergency care.", status:"candidate" },
  { id:"mentor-walk", role:"mentor", title:"Mentor walks alongside", moment:"A mentor helps turn reflection into one practical next step.", visualBrief:"Outdoor community campus or park, mentor and young person walking side by side, relaxed supportive body language, diverse casting, premium cinematic editorial realism.", alt:"A mentor and young person walking and talking together.", safetyBoundary:"Do not imply authority, coercion, or professional credentials not established.", status:"candidate" },
  { id:"family-circle", role:"parent", title:"Family reflection", moment:"A family discusses one shared goal without forcing disclosure.", visualBrief:"Warm family living room, small diverse family circle in ordinary conversation, relaxed body language, no everyone-looking-at-camera stock-photo pose, premium natural realism.", alt:"A family having a relaxed conversation together.", safetyBoundary:"Show voluntary supportive conversation, not monitoring or forced disclosure.", status:"candidate" },
  { id:"self-reflection", role:"mentor", title:"Private reflection first", moment:"A young person uses Z-Girl privately before deciding whether to share.", visualBrief:"Young person alone in a comfortable bedroom, library nook, or quiet common area using a phone, reflective but not distressed, warm premium lighting, privacy-respecting framing.", alt:"A young person privately reflecting with Z-Girl on a phone.", safetyBoundary:"No depiction of acute distress or implied surveillance.", status:"candidate" }
];

const ROLE_ADAPTATION: Record<HumanSupportRole, {opening:string; handoff:string; returnPrompt:string; emphasis:string[]}> = {
  parent:{opening:"Help me say this clearly without turning it into an argument.",handoff:"Listen first, reflect back what you heard, then ask what kind of help is wanted.",returnPrompt:"What did we agree to try at home?",emphasis:["trust","communication","routines","school","family goals"]},
  coach:{opening:"Help me talk about what happened without making it only about the score.",handoff:"Separate effort, decision-making, confidence, and next practice focus.",returnPrompt:"What will I practice or notice before the next session?",emphasis:["confidence","effort","leadership","pressure","recovery"]},
  educator:{opening:"Help me explain what is getting in the way of learning or belonging.",handoff:"Focus on observable classroom needs and a practical support step.",returnPrompt:"What can I try before the next school check-in?",emphasis:["learning","belonging","self-management","communication","attendance"]},
  therapist:{opening:"Help me organize what I want to bring into the session.",handoff:"Use the reflection as session preparation only; professional judgment remains with the clinician.",returnPrompt:"What do I want to notice, practice, or discuss before the next session?",emphasis:["themes","questions","coping skills","goals","between-session reflection"]},
  faith:{opening:"Help me connect this moment with my values without replacing professional help when it is needed.",handoff:"Use the approved faith or values profile and keep safety/professional boundaries intact.",returnPrompt:"What value or practice do I want to carry forward?",emphasis:["values","meaning","community","service","reflection"]},
  mentor:{opening:"Help me turn this into one clear conversation and one next step.",handoff:"Listen, clarify, encourage, and agree on one realistic follow-through.",returnPrompt:"What will I do before we check in again?",emphasis:["goals","confidence","decisions","accountability","growth"]}
};

export function getHumanSupportAdaptation(role: HumanSupportRole, ageBand: HumanSupportAgeBand) {
  const base = ROLE_ADAPTATION[role];
  const ageTone = ageBand === "child" ? "Use short concrete language, one idea at a time, and offer simple choices." : ageBand === "teen" ? "Use respectful, non-patronizing language and preserve autonomy." : "Use concise adult language and let the user set depth and pace.";
  return {...base, ageTone};
}
