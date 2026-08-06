export type OfferLane = "Faith & Values" | "Athlete Edition" | "Institutional";
export type OfferMode = "checkout" | "inquiry";

export type CommerceOffer = {
  slug: string;
  title: string;
  lane: OfferLane;
  audience: string;
  summary: string;
  includes: string[];
  priceLabel: string;
  launchNote: string;
  mode: OfferMode;
  resourceHref?: string;
  featured?: boolean;
};

export const commerceOffers: CommerceOffer[] = [
  {
    slug: "christian-reflection-starter-pack",
    title: "Christian Reflection Starter Pack",
    lane: "Faith & Values",
    audience: "Youth, families, and individual facilitators",
    summary:
      "Four faith-aligned reflection sessions centered on courage, forgiveness, gratitude, and service.",
    includes: [
      "Four guided youth sessions",
      "Parent and caregiver prompts",
      "Facilitator guidance",
      "Accessible participation options",
      "Print and save-as-PDF access",
    ],
    priceLabel: "$19 founding digital price",
    launchNote: "Single-household or individual-facilitator use.",
    mode: "checkout",
    resourceHref: "/resources/christian-reflection-starter-pack",
  },
  {
    slug: "athlete-reflection-starter-pack",
    title: "Athlete Reflection Starter Pack",
    lane: "Athlete Edition",
    audience: "Athletes and families",
    summary:
      "Private reflection tools for pregame focus, mistakes, confidence, teamwork, and postgame growth.",
    includes: [
      "Pregame focus page",
      "Mistake-reset reflection",
      "Confidence and teamwork prompts",
      "Postgame reflection",
      "Parent conversation guide",
    ],
    priceLabel: "$19 founding digital price",
    launchNote: "Single-athlete or household use.",
    mode: "checkout",
    resourceHref: "/resources/athlete-reflection-starter-pack",
  },
  {
    slug: "hero-within-coach-toolkit",
    title: "Hero Within Coach Toolkit",
    lane: "Athlete Edition",
    audience: "One coach or team leader",
    summary:
      "A four-week, five-minute team-reflection system for composure, mistakes, coachability, and culture.",
    includes: [
      "Four-week implementation plan",
      "Coach scripts and team prompts",
      "Parent communication template",
      "Inclusive participation guidance",
      "Safety and referral boundaries",
    ],
    priceLabel: "$99 founding digital price",
    launchNote: "Licensed to one coach or team leader for one team.",
    mode: "checkout",
    resourceHref: "/resources/coach-toolkit",
    featured: true,
  },
  {
    slug: "congregation-starter-toolkit",
    title: "Congregation Starter Toolkit",
    lane: "Faith & Values",
    audience: "One youth leader or small-group facilitator",
    summary:
      "A self-service four-session implementation package for a congregation, ministry, or faith-based youth group.",
    includes: [
      "Four-session facilitator sequence",
      "Family information sheet",
      "Participant worksheets",
      "Accessibility and safeguarding guidance",
      "Implementation checklist",
    ],
    priceLabel: "$149 founding digital price",
    launchNote: "Facilitator edition. Organization-wide use requires a license.",
    mode: "checkout",
    resourceHref: "/resources/congregation-starter-toolkit",
  },
  {
    slug: "congregation-annual-license",
    title: "Congregation Annual License",
    lane: "Institutional",
    audience: "Churches, ministries, and faith-based organizations",
    summary:
      "A group-use license with facilitator access, implementation support, family resources, and approved profile options.",
    includes: [
      "One congregation or ministry",
      "Up to five facilitators",
      "Four-session starter library",
      "Family and accessibility resources",
      "Implementation support",
    ],
    priceLabel: "Founding range: $750–$1,500 annually",
    launchNote: "Final scope depends on number of facilitators and customization.",
    mode: "inquiry",
  },
  {
    slug: "athlete-team-pilot",
    title: "Athlete Mindset & Character Team Pilot",
    lane: "Institutional",
    audience: "Teams, schools, clubs, leagues, and youth organizations",
    summary:
      "A supported four-week implementation for one team, including orientation, family communication, and findings.",
    includes: [
      "One team or organization",
      "Coach orientation",
      "Four-week reflection sequence",
      "Athlete and family resources",
      "Implementation check-in and findings summary",
    ],
    priceLabel: "Founding range: $1,500–$2,500",
    launchNote: "Multi-team and customized implementations are scoped separately.",
    mode: "inquiry",
    featured: true,
  },
];

export function getCommerceOffer(slug: string) {
  return commerceOffers.find((offer) => offer.slug === slug);
}

export function getCheckoutLink(slug: string) {
  const raw = process.env.ZGIRL_CHECKOUT_LINKS_JSON?.trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const candidate = parsed[slug];
    if (typeof candidate !== "string") return null;

    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
