export type MarketResourceSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  callout?: string;
};

export type MarketResource = {
  slug: string;
  lane: "Faith & Values" | "Athlete Edition";
  title: string;
  subtitle: string;
  status: string;
  backHref: string;
  backLabel: string;
  boundary: string;
  sections: MarketResourceSection[];
};

export const marketResources: MarketResource[] = [
  {
    slug: "christian-reflection-starter-pack",
    lane: "Faith & Values",
    title: "Z-Girl Christian Reflection Starter Pack",
    subtitle: "Four guided themes for youth, families, and facilitators",
    status: "Independent faith-aligned resource",
    backHref: "/faith/christian",
    backLabel: "Christian Starter Pack",
    boundary:
      "This resource is not an official publication or endorsement of a church, denomination, ministry, or religious authority. Use your preferred Bible translation and locally approved teaching materials. Z-Girl is not clergy, spiritual direction, therapy, confession, counseling, or emergency support.",
    sections: [
      {
        heading: "How to use this pack",
        paragraphs: [
          "Each session follows the Hero Within method: Pause, Name It, Understand It, Find the Strength, Choose a Hero Move, and Reflect Forward. Use one session per week or select the theme that fits the moment.",
        ],
        bullets: [
          "Youth may write, speak, draw, point, use AAC, reflect silently, or pass.",
          "Prayer and scripture reading are optional and should use family- or organization-approved materials.",
          "Do not require private disclosure or evaluate a young person’s emotions.",
          "Use trusted-adult and safeguarding procedures whenever a concern involves safety or significant distress.",
        ],
      },
      {
        heading: "Four-session overview",
        table: {
          headers: ["Session", "Theme", "Reference", "Hero Move"],
          rows: [
            ["1", "Courage", "Joshua 1:9", "Take one brave, safe, and honest next step."],
            ["2", "Forgiveness", "Colossians 3:13", "Choose a truthful step toward peace without ignoring boundaries."],
            ["3", "Gratitude", "1 Thessalonians 5:18", "Express specific thanks through words or action."],
            ["4", "Service", "Galatians 5:13", "Complete one useful act of care without seeking recognition."],
          ],
        },
      },
      {
        heading: "Session 1 · Courage",
        paragraphs: [
          "Courage does not mean you feel no fear. It means you can choose a wise next step while fear is present.",
        ],
        bullets: [
          "What moment feels difficult or uncertain?",
          "What are you feeling?",
          "What can you control?",
          "What would a courageous and caring response look like?",
          "Hero Move options: ask for help, tell the truth calmly, try one small step, or pause before choosing words.",
        ],
        callout: "Optional practice: read an approved passage, pray briefly, or sit quietly before choosing the Hero Move.",
      },
      {
        heading: "Session 2 · Forgiveness",
        paragraphs: [
          "Forgiveness does not require pretending the hurt did not happen. Safety, truth, accountability, and boundaries still matter.",
        ],
        bullets: [
          "What happened?",
          "What part of the situation hurts or angers you?",
          "What boundary or support may be needed?",
          "What step could move you away from retaliation?",
          "Hero Move options: tell a trusted adult, explain the impact calmly, take space, or maintain a boundary without retaliation.",
        ],
        callout: "Optional practice: pray or reflect for wisdom, healing, truth, and the right support.",
      },
      {
        heading: "Session 3 · Gratitude",
        paragraphs: [
          "Gratitude is not denial. It is the practice of noticing support, growth, provision, and hope alongside difficulty.",
        ],
        bullets: [
          "What has been difficult?",
          "Who or what has helped?",
          "What strength have you used?",
          "How can you express genuine thanks?",
          "Hero Move options: thank someone specifically, write down three supports, return help, or notice one small sign of progress.",
        ],
      },
      {
        heading: "Session 4 · Service",
        paragraphs: [
          "Service begins by noticing a real need and responding with dignity rather than attention-seeking or pressure.",
        ],
        bullets: [
          "Who may need support?",
          "What would be truly useful?",
          "What can you offer without overpromising?",
          "How can you protect the other person’s dignity?",
          "Hero Move options: check on someone, complete a helpful task, share encouragement, or invite others to help.",
        ],
      },
      {
        heading: "Facilitator quick guide",
        bullets: [
          "Preview the session and use only approved references.",
          "Read prompts slowly and one at a time.",
          "Offer prayer, quiet reflection, or no faith-based closing.",
          "Let youth pass or respond privately.",
          "Do not interpret doctrine beyond your authorized role.",
          "Document attendance or completion—not private answers.",
          "Follow local safeguarding policies when concerns arise.",
        ],
      },
    ],
  },
  {
    slug: "congregation-starter-toolkit",
    lane: "Faith & Values",
    title: "Z-Girl Congregation Starter Toolkit",
    subtitle: "Self-service four-session implementation for youth leaders and faith communities",
    status: "Group-ready implementation resource",
    backHref: "/faith/congregations",
    backLabel: "Congregation Toolkit",
    boundary:
      "Youth are not required to disclose private experiences or share written reflections. This resource is not therapy, clergy, confession, spiritual direction, medical care, or emergency support. Follow local safeguarding procedures and approved content-governance practices.",
    sections: [
      {
        heading: "Toolkit components",
        bullets: [
          "Four-session facilitator plan",
          "Parent and caregiver information",
          "Participant reflection worksheets",
          "Implementation checklist",
          "QR access card instructions",
          "Accessible participation supports",
          "Safety and trusted-adult guidance",
          "Optional feedback and completion form",
        ],
      },
      {
        heading: "Five-step implementation path",
        table: {
          headers: ["Step", "Action", "Deliverable"],
          rows: [
            ["1. Choose", "Select an existing profile or request a custom profile.", "Profile decision"],
            ["2. Review", "Confirm age range, terminology, practices, source, and boundaries.", "Local approval record"],
            ["3. Prepare", "Orient facilitators and share family information.", "Ready-to-use group"],
            ["4. Facilitate", "Run four short sessions using approved materials.", "Completed program"],
            ["5. Learn", "Collect feedback without collecting private reflection content.", "Pilot summary"],
          ],
        },
      },
      {
        heading: "Four-session facilitator plan",
        table: {
          headers: ["Session", "Theme", "Objective", "Suggested Hero Move"],
          rows: [
            ["1", "Courage", "Distinguish fear from a safe, wise next step.", "Ask for support or take one brave action."],
            ["2", "Forgiveness & boundaries", "Support truth, non-retaliation, safety, and accountability.", "Use calm words or involve a trusted adult."],
            ["3", "Gratitude & hope", "Notice support and growth without denying difficulty.", "Express specific thanks."],
            ["4", "Service", "Connect values to a useful action that protects dignity.", "Complete one practical act of care."],
          ],
        },
      },
      {
        heading: "20-minute session format",
        table: {
          headers: ["Time", "Activity", "Facilitator note"],
          rows: [
            ["2 min", "Welcome and choice", "Remind youth they may pass or reflect privately."],
            ["3 min", "Pause and name the moment", "Use breathing or quiet settling without requiring eye-closing."],
            ["6 min", "Theme and approved connection", "Use locally approved references; avoid improvised doctrinal claims."],
            ["5 min", "Private reflection", "Allow writing, speech, drawing, pointing, AAC, or silence."],
            ["3 min", "Hero Move", "Choose one realistic action; sharing is optional."],
            ["1 min", "Close", "Offer approved prayer, quiet reflection, or neutral closing."],
          ],
        },
      },
      {
        heading: "Accessible participation",
        bullets: [
          "Show one prompt at a time.",
          "Use concrete language and two-choice options when helpful.",
          "Allow extra processing time and optional breaks.",
          "Keep audio optional and avoid unnecessary chimes or motion.",
          "Accept speech, typing, drawing, pointing, AAC, or supported communication.",
          "Use the same predictable session sequence.",
          "Follow individualized accommodations and local procedures.",
        ],
      },
      {
        heading: "Safeguarding boundary",
        bullets: [
          "Never promise secrecy when safety may be at risk.",
          "Do not investigate disclosures during a group session.",
          "Follow established reporting and safeguarding procedures.",
          "Do not collect private reflection pages for scoring or discipline.",
          "Move medical, abuse, self-harm, violence, or significant distress concerns to qualified adults and established procedures.",
        ],
      },
    ],
  },
  {
    slug: "catholic-youth-pilot-concept",
    lane: "Faith & Values",
    title: "Z-Girl Catholic Youth Reflection Pilot",
    subtitle: "A founding design-partner concept for Catholic youth ministry, schools, and faith formation",
    status: "Concept for review only",
    backHref: "/faith/catholic",
    backLabel: "Catholic Preview",
    boundary:
      "This concept has not been approved by a parish, Catholic school, diocese, bishops’ conference, or ecclesial authority. Any institution-branded edition requires review and authorization by the participating organization.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "A guided reflection experience that helps youth listen to the moment, connect choices to Catholic virtues and approved scripture, pray or reflect, and choose a practical Hero Move.",
        ],
      },
      {
        heading: "What it is not",
        paragraphs: [
          "It is not a replacement for catechesis, clergy, spiritual direction, confession, sacramental preparation, pastoral care, counseling, diagnosis, or emergency services.",
        ],
      },
      {
        heading: "How it is governed",
        paragraphs: [
          "The participating Catholic authority approves scripture sources, doctrine, prayers, terminology, safeguarding, family communication, accessibility, and release status.",
        ],
      },
      {
        heading: "Four-week founding pilot",
        table: {
          headers: ["Week", "Focus", "Youth response", "Hero Move"],
          rows: [
            ["1", "Listen", "Name the moment and support needed.", "Ask for help or take one honest step."],
            ["2", "Teach", "Use prudence and fortitude to compare choices.", "Practice one better response."],
            ["3", "Send", "Connect charity and justice to repair or service.", "Complete one act of repair or service."],
            ["4", "Continue", "Reflect on faith, hope, charity, and next steps.", "Create a personal virtue plan."],
          ],
        },
      },
      {
        heading: "Pilot includes",
        bullets: [
          "Six to eight approved reflections",
          "Facilitator orientation",
          "Youth leader and accessibility guides",
          "Family information and implementation checklist",
          "Evaluation tools and findings memo",
          "Founding parish or school review pathway",
        ],
      },
    ],
  },
  {
    slug: "catholic-leadership-package",
    lane: "Faith & Values",
    title: "Z-Girl Catholic Leadership Discussion Package",
    subtitle: "Concept, pilot structure, governance, questions, and decision paths",
    status: "Leadership discussion resource",
    backHref: "/faith/catholic",
    backLabel: "Catholic Preview",
    boundary:
      "This package is a discussion resource—not an approved Catholic curriculum. Do not imply endorsement or institutional approval without written authorization.",
    sections: [
      {
        heading: "Executive concept",
        paragraphs: [
          "Z-Girl Catholic Faith & Virtue is an optional, church-reviewed content profile that connects guided reflection, Catholic virtue formation, prayerful discernment, and practical acts of service or repair.",
        ],
      },
      {
        heading: "Product architecture",
        bullets: [
          "One Z-Girl reflection engine",
          "Church-approved scripture, virtue, prayer, and service content",
          "Facilitator and accessibility guidance",
          "Age and reading-level adaptation",
          "Clear approval and release records",
        ],
      },
      {
        heading: "Leadership discovery questions",
        bullets: [
          "Which ministry or school setting should the first pilot serve?",
          "Which age group should participate?",
          "Who has authority to approve theological and youth-safety content?",
          "Which scripture translation and catechetical materials are authorized?",
          "Should use be individual, family, classroom, youth ministry, or retreat based?",
          "What accessibility, safeguarding, parent-communication, and data boundaries are required?",
        ],
      },
      {
        heading: "Pilot options",
        table: {
          headers: ["Option", "Starting range", "Scope"],
          rows: [
            ["Founding parish pilot", "$2,500", "One site, four weeks, orientation, approved content, findings memo"],
            ["Customized parish or school pilot", "$5,000", "Expanded content, local review, accessibility adaptation, implementation support"],
            ["Multi-site / diocesan discovery", "Scoped proposal", "Leadership discovery, governance, pilot plan, approval workflow"],
          ],
        },
      },
      {
        heading: "Recommended decision path",
        bullets: [
          "Proceed to pilot design",
          "Proceed to formal discovery",
          "Schedule a second meeting with parish, school, or diocesan decision-makers",
          "Pause for internal review",
        ],
      },
    ],
  },
  {
    slug: "athlete-reflection-starter-pack",
    lane: "Athlete Edition",
    title: "Hero Within Athlete Reflection Starter Pack",
    subtitle: "Private reflection tools for focus, mistakes, confidence, teamwork, and growth",
    status: "Individual and family resource",
    backHref: "/athletes",
    backLabel: "Athlete Hub",
    boundary:
      "This pack supports mindset, character, communication, and reflection. It is not sports medicine, therapy, diagnosis, injury evaluation, talent assessment, medical clearance, or emergency support.",
    sections: [
      {
        heading: "The athlete reset",
        table: {
          headers: ["Step", "Question", "Purpose"],
          rows: [
            ["Pause", "What is happening in my body and attention?", "Create space before reacting."],
            ["Name It", "What am I feeling?", "Reduce confusion and self-attack."],
            ["Learn", "What feedback is actually useful?", "Separate correction from identity."],
            ["Choose", "What can I control next?", "Select one Hero Move."],
            ["Return", "Where does my attention belong now?", "Rejoin the next play, practice, or recovery plan."],
          ],
        },
      },
      {
        heading: "Pregame focus",
        bullets: [
          "Name the current feeling.",
          "Identify the first responsibility.",
          "Choose one controllable action.",
          "Select a short cue such as steady, ready, or next play.",
          "Hero Move options: breathe, ask one assignment question, encourage a teammate, or visualize the first responsible action.",
        ],
        callout: "Nerves do not mean you are unprepared. Focus on the next controllable action.",
      },
      {
        heading: "After a mistake",
        bullets: [
          "State what happened without insults.",
          "Identify the useful correction.",
          "Return attention to the next responsibility.",
          "Ask for specific coaching when needed.",
          "Hero Move options: reset breath, next-play cue, one technique correction, or a mature response to coaching.",
        ],
        callout: "A mistake is information, not your identity.",
      },
      {
        heading: "Confidence after a setback",
        bullets: [
          "Notice the current self-talk.",
          "Identify evidence of preparation or growth.",
          "Choose one small action that rebuilds trust.",
          "Involve grounded support rather than seeking guarantees.",
        ],
      },
      {
        heading: "Teamwork and coachability",
        bullets: [
          "What does the team need from me?",
          "How did I respond to feedback?",
          "Did my words strengthen or weaken the group?",
          "What can I repair or improve?",
        ],
      },
      {
        heading: "Postgame reflect forward",
        bullets: [
          "Name one strength.",
          "Name one adjustment.",
          "Thank one person specifically.",
          "Choose one next-practice goal.",
        ],
        callout: "Your value is bigger than the scoreboard, statistics, and playing time.",
      },
      {
        heading: "Parent conversation guide",
        bullets: [
          "Ask whether the athlete wants listening, problem-solving, or space.",
          "Avoid making the ride home an immediate performance review.",
          "Separate effort, decisions, and learning from the child’s worth.",
          "Celebrate preparation, recovery, teamwork, honesty, and character—not only results.",
        ],
      },
    ],
  },
  {
    slug: "coach-toolkit",
    lane: "Athlete Edition",
    title: "Hero Within Coach Toolkit",
    subtitle: "Four weeks of five-minute team reflection for mindset, character, and culture",
    status: "Coach and team-leader resource",
    backHref: "/athletes/coach",
    backLabel: "Coach Toolkit",
    boundary:
      "Use reflection to strengthen behavior, communication, and next-step choices—never to force disclosure, diagnose athletes, assess injury status, or publicly score emotions.",
    sections: [
      {
        heading: "Five-minute format",
        table: {
          headers: ["Time", "Step", "Coach language"],
          rows: [
            ["1 min", "Pause", "Take a breath. Notice the team moment without blaming."],
            ["2 min", "Reflect", "Ask one question. Athletes may answer privately, choose a response, or pass."],
            ["1 min", "Hero Move", "What is one action we can control next?"],
            ["1 min", "Close", "Reinforce the next responsibility, support route, and team standard."],
          ],
        },
      },
      {
        heading: "Four-week implementation",
        table: {
          headers: ["Week", "Focus", "Core question", "Team Hero Move"],
          rows: [
            ["1", "Composure", "What can we control when pressure rises?", "Use a shared reset cue and first-responsibility plan."],
            ["2", "Mistakes", "How do we correct without shame or excuses?", "Name one correction and return to the next play."],
            ["3", "Team culture", "What does the team need from each of us?", "Complete one act of encouragement, accountability, or service."],
            ["4", "Reflect forward", "What strength and adjustment should we carry forward?", "Choose one individual and one team practice goal."],
          ],
        },
      },
      {
        heading: "Inclusive participation",
        bullets: [
          "Use one prompt at a time and concrete language.",
          "Offer visual or two-choice responses.",
          "Allow speech, writing, drawing, pointing, AAC, or silence.",
          "Provide extra processing time and optional breaks.",
          "Avoid unnecessary chimes, motion, or sensory overload.",
          "Follow individualized accommodations and organizational procedures.",
          "Never use nonparticipation as evidence of poor attitude.",
        ],
      },
      {
        heading: "Parent communication",
        paragraphs: [
          "Our team is using the Hero Within Athlete Reflection approach for four weeks. Athletes will practice short pregame, mistake-reset, teamwork, and postgame reflections. Participation may be private, and athletes will not be required to disclose personal experiences.",
        ],
      },
      {
        heading: "Safety and referral boundary",
        bullets: [
          "Do not use the toolkit to assess injury status or medical readiness.",
          "Do not investigate abuse, self-harm, violence, or significant distress in a team group.",
          "Follow established safeguarding and reporting procedures.",
          "Move medical concerns to qualified healthcare and athletic staff.",
          "Do not collect private reflection sheets for performance evaluation.",
        ],
      },
    ],
  },
  {
    slug: "team-pilot-sell-sheet",
    lane: "Athlete Edition",
    title: "Athlete Mindset & Character Team Pilot",
    subtitle: "One team · Four weeks · Supported implementation",
    status: "Founding institutional offer",
    backHref: "/athletes/pilot",
    backLabel: "Team Pilot",
    boundary:
      "Mindset, character, and reflection—not sports medicine, therapy, diagnosis, injury evaluation, talent assessment, athlete surveillance, or performance guarantees.",
    sections: [
      {
        heading: "Who it serves",
        paragraphs: [
          "Youth teams, school athletics, clubs, leagues, church-sports ministries, and youth organizations.",
        ],
      },
      {
        heading: "Problem it solves",
        paragraphs: [
          "Teams discuss mindset and character but often lack a short, repeatable reflection process that protects athlete privacy and supports different ways of participating.",
        ],
      },
      {
        heading: "Pilot includes",
        bullets: [
          "One team or organization",
          "Coach or team-leader orientation",
          "Four-week reflection sequence",
          "Athlete worksheets and digital samples",
          "Parent and caregiver information",
          "Accessible participation guidance",
          "Implementation check-in and completion feedback",
          "Pilot findings and next-step recommendations",
        ],
      },
      {
        heading: "Four-week focus",
        table: {
          headers: ["Week", "Focus", "Practical outcome"],
          rows: [
            ["1", "Focus & composure", "Pregame reset and controllable next-step language"],
            ["2", "Mistakes & resilience", "Correct, reset, and return without shame or excuses"],
            ["3", "Team culture", "Coachability, encouragement, accountability, and sportsmanship"],
            ["4", "Reflect forward", "Strengths, adjustments, identity, and next practice goals"],
          ],
        },
      },
      {
        heading: "Founding pilot range",
        paragraphs: [
          "$1,500–$2,500 for one team or organization. Multi-team and customized implementations are scoped separately.",
        ],
        callout: "Begin at zgirlinitiative.org/athletes/pilot or email info@zgirlinitiative.org.",
      },
    ],
  },
];

export function getMarketResource(slug: string) {
  return marketResources.find((resource) => resource.slug === slug);
}
