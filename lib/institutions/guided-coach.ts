export type GuideStep = {
  id: string;
  title: string;
  body: string;
  target?: string;
  href?: string;
  actionLabel?: string;
  safety?: string;
};

export type GuideLesson = {
  key: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  steps: GuideStep[];
};

export type GuideState = {
  displayName?: string | null;
  roleKeys?: string[];
  opportunityCount?: number | null;
  topOpportunity?: {
    organization?: string | null;
    stage?: string | null;
    priority?: string | null;
    audienceSize?: string | null;
    estimatedValue?: number | null;
    nextAction?: string | null;
  } | null;
};

const pretty = (value?: string | null) =>
  (value || "").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());

export function primaryRoleLabel(roleKeys: string[] = []) {
  const order = ["system_owner", "executive", "institutional_admin", "pipeline_manager", "credential_admin", "auditor"];
  const role = order.find((key) => roleKeys.includes(key)) || roleKeys[0];
  return role ? pretty(role) : "Institutional Operator";
}

export function commandCenterMapLesson(): GuideLesson {
  return {
    key: "command-center-map",
    title: "Command Center Map",
    subtitle: "Know which workspace to use before you act.",
    estimatedMinutes: 3,
    steps: [
      {
        id: "map-portfolio",
        title: "Executive Portfolio",
        body: "Use Executive Portfolio for portfolio-wide oversight: institutional health, executive briefings, renewals, capacity, expansion signals, and governed reporting. It is an oversight view, not the place to create a new pilot.",
        href: "/institutions/ops/portfolio",
        actionLabel: "Open Executive Portfolio",
      },
      {
        id: "map-pipeline",
        title: "Partner Pipeline",
        body: "Use the Partner Pipeline for institutional business-development discipline: prospect, discovery, qualification, proposal, agreement handoff, and next action. GLS remains the commercial source of truth.",
        href: "/institutions/ops/pipeline",
        actionLabel: "Open Partner Pipeline",
        safety: "Do not place participant case data, private reflections, diagnoses, counseling notes, or safeguarding narratives in the sales pipeline.",
      },
      {
        id: "map-pilots",
        title: "Pilot Command Center",
        body: "Use the Pilot Command Center after a credible GLS opportunity exists. This is where a qualified institution becomes a governed implementation with onboarding, cohorts, facilitators, milestones, evidence, closeout, renewal, and expansion.",
        href: "/institutions/ops/pilots",
        actionLabel: "Open Pilot Command Center",
      },
      {
        id: "map-workflows",
        title: "Agreement Workflows",
        body: "Use Agreement Workflows for the human approval gates and executed-scope controls required before institutional authority is released. A proposal or payment alone does not satisfy these gates.",
        href: "/institutions/ops/workflows",
        actionLabel: "Open Agreement Workflows",
      },
      {
        id: "map-license",
        title: "License Administration",
        body: "Use License Administration after the required agreement and release gates are satisfied. It manages institutional licensing state and capacity; it does not replace qualification or implementation evidence.",
        href: "/institutions/ops",
        actionLabel: "Open License Administration",
      },
      {
        id: "map-identity",
        title: "Identity & Access",
        body: "Use Identity & Access for named operators, least-privilege roles, institution scope, authentication mode, suspension, and audit events. Never share a personal access code or one-time invitation code.",
        href: "/institutions/ops/identity",
        actionLabel: "Open Identity & Access",
        safety: "Credentials, invite codes, access codes, and private participant content must never be narrated, copied into notes, or displayed in training transcripts.",
      },
    ],
  };
}

export function fullOrientationLesson(roleLabel: string): GuideLesson {
  return {
    key: "operator-orientation",
    title: `${roleLabel} Orientation`,
    subtitle: "A governed 15-minute overview of the institutional operating model.",
    estimatedMinutes: 15,
    steps: [
      {
        id: "orientation-1",
        title: "How the institutional system works",
        body: "The operating lifecycle is Opportunity, Qualification, Agreement and Scope, Institution Setup, Onboarding, Pilot Ready, Live Implementation, Evidence Collection, Completion, Renewal, and Expansion. Each stage has a different authority boundary.",
      },
      {
        id: "orientation-2",
        title: "Commercial and implementation authority stay separate",
        body: "Greene Leadership System owns opportunity, proposal, agreement, invoice, payment, and commercial relationship state. Z-Girl owns governed implementation readiness, pilot configuration, aggregate adoption, evidence, closeout, and implementation signals for renewal or expansion.",
      },
      {
        id: "orientation-3",
        title: "Private reflection stays private",
        body: "Institutional operators work with aggregate implementation signals and permissioned administrative evidence. Private participant reflection text, participant case files, diagnoses, therapy or counseling notes, and other sensitive records do not belong in institutional administration.",
        safety: "If a field or workflow does not explicitly call for sensitive participant information, do not enter it.",
      },
      {
        id: "orientation-4",
        title: "Qualification comes before pilot creation",
        body: "A credible prospect is not automatically a pilot. Confirm a real use case, defined participant group, sponsor or decision authority, implementation access, privacy and accessibility fit, timeline, and contracting path before advancing to Qualified.",
      },
      {
        id: "orientation-5",
        title: "Pilot evidence must preserve provenance",
        body: "Keep observed evidence, participant-reported outcomes, facilitator observations, administrator feedback, and system analytics clearly distinguished. Do not convert impressions into outcome claims the evidence cannot support.",
      },
      {
        id: "orientation-6",
        title: "Human gates remain human",
        body: "The system can organize work, surface deadlines, prepare packets, and automate reminders. It does not autonomously attest evidence, execute agreements, approve authority, change access, or create a legal or regulatory compliance conclusion.",
      },
      {
        id: "orientation-7",
        title: "Pilot closeout begins the next relationship",
        body: "Pilot completion should produce an implementation summary, executive outcome brief, permission status, renewal readiness, expansion opportunity, and facilitator-learning signals. Closeout is the bridge to recurring institutional value.",
      },
      {
        id: "orientation-8",
        title: "Use Guide Me at the point of work",
        body: "Every major institutional workspace now includes this Guided Coach. Use This Page for immediate guidance, Command Center Map when you are unsure where to go, and Full Orientation when onboarding a new authorized operator.",
      },
    ],
  };
}

export function pageLesson(pathname: string, state: GuideState = {}): GuideLesson {
  const roleLabel = primaryRoleLabel(state.roleKeys || []);
  const name = state.displayName ? `, ${state.displayName}` : "";

  if (pathname === "/institutions/auth") {
    return {
      key: "institutional-sign-in",
      title: "Institutional Sign-In",
      subtitle: "Named access keeps institutional actions attributable and role-scoped.",
      estimatedMinutes: 2,
      steps: [
        { id: "auth-1", title: "Choose the right mode", body: "Use Accept invite only once when enrolling a newly invited operator. After enrollment, use Sign in with the operator email and the personal access code created during enrollment.", target: "[data-guide-target='auth-mode']" },
        { id: "auth-2", title: "Personal access stays personal", body: "The one-time invitation code is single-use. Your personal access code should be at least 24 characters and should not be shared with colleagues, pasted into notes, or sent through chat.", safety: "The Guided Coach never reads access codes, invitation codes, passwords, or other authentication secrets aloud." },
        { id: "auth-3", title: "Where sign-in takes you", body: "A successful named sign-in opens institutional operations. From there, use the Command Center Map if you are unsure whether you need portfolio oversight, pipeline work, pilot operations, agreements, licensing, or identity administration." },
      ],
    };
  }

  if (pathname === "/institutions/ops/portfolio") {
    return {
      key: "executive-portfolio",
      title: "Executive Portfolio",
      subtitle: `Portfolio-wide oversight for ${roleLabel}${name}.`,
      estimatedMinutes: 3,
      steps: [
        { id: "portfolio-1", title: "What this command center is for", body: "This is the executive oversight layer. Use it to understand portfolio health, executive briefings, renewal signals, capacity, expansion readiness, and governance attention across institutions.", target: "h1" },
        { id: "portfolio-2", title: "Do not create pilots here", body: "Executive Portfolio is not the implementation workspace. When a GLS opportunity is ready for pilot qualification or setup, move to the Pilot Command Center.", target: "a[href='/institutions/ops/pilots']", href: "/institutions/ops/pilots", actionLabel: "Open Pilot Command Center" },
        { id: "portfolio-3", title: "Use Partner Pipeline for commercial progression", body: "Prospecting, qualification, proposed scope, value, decision status, and next action belong in the commercial opportunity lifecycle. Use Partner Pipeline when the next decision is commercial or qualification-related.", href: "/institutions/ops/pipeline", actionLabel: "Open Partner Pipeline" },
        { id: "portfolio-4", title: "Executive reporting is aggregate", body: "Executive views should surface administrative and aggregate implementation evidence, not private participant reflections or individual case records.", safety: "Never paste private reflection text or sensitive participant case information into executive reporting." },
      ],
    };
  }

  if (pathname === "/institutions/ops/pilots") {
    const top = state.topOpportunity;
    const opportunityCopy = top?.organization
      ? `You currently have ${state.opportunityCount ?? 1} open GLS opportunity${state.opportunityCount === 1 ? "" : "ies"}. ${top.organization} is ${pretty(top.stage) || "not yet staged"}${top.priority ? ` and ${pretty(top.priority)} Priority` : ""}. ${!top.audienceSize || top.audienceSize === "—" ? "Audience size is intentionally unset until qualification establishes a real cohort." : `The recorded audience is ${top.audienceSize}.`} ${typeof top.estimatedValue === "number" ? `The current estimated value is $${top.estimatedValue.toLocaleString()}.` : "Commercial value is not yet set."}`
      : "This page shows GLS opportunities that are eligible for governed pilot qualification and the Z-Girl implementation workspaces created from them.";
    return {
      key: "pilot-command-center",
      title: "Pilot Command Center",
      subtitle: `Turn qualified opportunity into governed implementation, ${roleLabel}.`,
      estimatedMinutes: 4,
      steps: [
        { id: "pilot-1", title: "GLS opportunity queue", body: opportunityCopy, target: "[data-guide-target='gls-queue']" },
        { id: "pilot-2", title: "NEW does not mean QUALIFIED", body: "A New opportunity is a credible prospect, not an approved pilot. Before advancing it, confirm a specific use case, participant group, sponsor or decision authority, facilitator or implementation access, privacy and accessibility fit, timeline, and contracting path.", target: "[data-guide-target='gls-opportunity-card']" },
        { id: "pilot-3", title: "Create the pilot only after qualification", body: "Once qualification is supported by real institutional facts, create the institution record and governed pilot workspace. The pilot then carries intake, roles, cohorts, milestones, launch readiness, aggregate adoption, implementation evidence, closeout, renewal, and expansion.", target: "[data-guide-target='pilot-operations']" },
        { id: "pilot-4", title: "Evidence without surveillance", body: "Record aggregate adoption and clearly labeled evidence provenance. Facilitator observations, participant-reported outcomes, administrator feedback, and system analytics are different evidence types and should remain distinguishable.", safety: "Private reflection text and participant case data do not belong in the Pilot Command Center." },
        { id: "pilot-5", title: "Your next action", body: top?.nextAction || "Use the GLS next-action record to determine whether the institution needs outreach, fit review, proposal work, agreement preparation, onboarding, or implementation follow-up." },
      ],
    };
  }

  if (pathname === "/institutions/ops/pipeline") {
    return {
      key: "partner-pipeline-ops",
      title: "Partner Pipeline",
      subtitle: "Institutional opportunity discipline without duplicating implementation authority.",
      estimatedMinutes: 3,
      steps: [
        { id: "pipeline-1", title: "Commercial source of truth", body: "Use this workspace for institution, decision maker, opportunity stage, proposed solution, scope, price, next action, renewal date, and expansion opportunity. GLS remains authoritative for commercial state." },
        { id: "pipeline-2", title: "Qualification is an evidence gate", body: "Advance an opportunity only when the use case, participant group, decision authority, implementation access, privacy/accessibility fit, timing, and contracting pathway are sufficiently understood." },
        { id: "pipeline-3", title: "Handoff instead of duplication", body: "When the opportunity is ready, hand it into Z-Girl pilot operations. Do not recreate a second prospect record or try to manage implementation evidence inside the sales pipeline.", href: "/institutions/ops/pilots", actionLabel: "Open Pilot Command Center" },
        { id: "pipeline-4", title: "Keep participant data out", body: "The pipeline is for institutional business development. Participant identities, private reflections, diagnoses, counseling or clinical notes, and safeguarding narratives do not belong here.", safety: "Use only the minimum institutional/commercial metadata needed for the opportunity." },
      ],
    };
  }

  if (pathname === "/institutions/ops/workflows") {
    return {
      key: "agreement-workflows",
      title: "Agreement Workflows",
      subtitle: "Human approval gates between commercial intent and institutional authority.",
      estimatedMinutes: 3,
      steps: [
        { id: "workflow-1", title: "Agreement is more than a proposal", body: "An accepted proposal may begin agreement operations, but it does not activate delivery authority by itself. The required human approval gates and executed agreement still matter." },
        { id: "workflow-2", title: "Do not collapse approval roles", body: "Program Quality, Privacy Governance, Agreement Authority, Commercial Authority, and Executive Release remain separate governed decisions even when the same organization moves quickly." },
        { id: "workflow-3", title: "Implementation follows release", body: "After the agreement and release gates are satisfied, institutional setup and pilot onboarding can proceed through the Pilot Command Center.", href: "/institutions/ops/pilots", actionLabel: "Open Pilot Command Center" },
      ],
    };
  }

  if (pathname === "/institutions/ops/identity") {
    return {
      key: "identity-access",
      title: "Identity & Access",
      subtitle: "Named identity, least privilege, institution scope, and auditability.",
      estimatedMinutes: 3,
      steps: [
        { id: "identity-1", title: "Named operators first", body: "Routine institutional work should use named operator identities. The break-glass owner path is for emergency recovery, not shared daily access." },
        { id: "identity-2", title: "Roles and scope work together", body: "A role determines capabilities; institution scope determines where those capabilities apply. Do not grant a global role merely to solve a navigation problem." },
        { id: "identity-3", title: "Facilitator assignment is not automatic platform access", body: "An implementation team assignment and an authenticated operator role are separate concepts. Only grant platform access when the person actually needs it and the institution approves it." },
        { id: "identity-4", title: "Credentials stay out of training", body: "Do not paste, narrate, screenshot, or store personal access codes, invitation codes, session tokens, or other secrets inside training notes or institutional evidence.", safety: "The Guided Coach is designed to discuss controls without reading secret values." },
      ],
    };
  }

  if (pathname === "/institutions/ops") {
    return {
      key: "license-administration",
      title: "License Administration",
      subtitle: "Institutional authority and capacity after governed release.",
      estimatedMinutes: 2,
      steps: [
        { id: "license-1", title: "License state is downstream", body: "A license belongs downstream of qualification, agreement, and release. Payment, proposal acceptance, or enthusiasm do not independently activate institutional authority." },
        { id: "license-2", title: "Capacity should match approved scope", body: "Seats, credential capacity, dates, and institution scope should reflect the approved commercial and implementation record rather than informal expectations." },
        { id: "license-3", title: "Renewal uses real evidence", body: "Renewal and expansion decisions should draw from implementation evidence and governance readiness, not automatically roll forward because a prior license existed." },
      ],
    };
  }

  if (pathname === "/institutions/ops/guide") {
    return fullOrientationLesson(roleLabel);
  }

  return {
    key: "institutional-operations-general",
    title: "Institutional Operations Guide",
    subtitle: "Use the right governed workspace for the action you are taking.",
    estimatedMinutes: 2,
    steps: [
      { id: "general-1", title: "Start with the purpose of this page", body: "Before entering or changing a record, identify whether you are doing commercial qualification, identity administration, agreement approval, implementation, evidence review, licensing, or executive reporting. Each belongs to a different authority boundary." },
      { id: "general-2", title: "Use the Command Center Map", body: "If you are unsure where an action belongs, open the Command Center Map. It explains the difference between Executive Portfolio, Partner Pipeline, Pilot Command Center, Agreement Workflows, License Administration, and Identity & Access." },
      { id: "general-3", title: "Protect participant privacy", body: "Institutional operations should use minimum necessary administrative and aggregate data. Private participant reflection text and sensitive case information stay outside these workspaces." },
    ],
  };
}
