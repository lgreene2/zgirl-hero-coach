import Image from "next/image";
import Link from "next/link";

type Variant = "athlete" | "faith" | "institution" | "family" | "partner";

type Props = {
  variant: Variant;
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
};

const VISUALS: Record<Variant, { src: string; label: string; headline: string; copy: string; alt: string }> = {
  athlete: {
    src: "/visuals/human-scenes/athlete.svg",
    label: "Athlete + Coach",
    headline: "Better resets. Better conversations. Stronger team culture.",
    copy: "Hero Within supports private athlete reflection and more useful human conversations with coaches, teammates, and family.",
    alt: "Illustration of an athlete and coach talking together after practice",
  },
  faith: {
    src: "/visuals/human-scenes/faith.svg",
    label: "Faith + Community",
    headline: "Values become real through people, practice, and reflection.",
    copy: "A private reflection tool that can prepare a better conversation with family, mentors, ministry leaders, and trusted community.",
    alt: "Illustration of a family and faith community sharing a warm conversation",
  },
  institution: {
    src: "/visuals/human-scenes/institution.svg",
    label: "Schools + Youth Programs",
    headline: "A human-support layer for the moments between programs and conversations.",
    copy: "Z-Girl helps learners prepare, reflect, and choose a next step while educators and facilitators keep their real-world roles.",
    alt: "Illustration of an educator and student having a supportive conversation",
  },
  family: {
    src: "/visuals/human-scenes/family.svg",
    label: "Family + Trusted Support",
    headline: "Private first. Human when invited.",
    copy: "Reflection stays with the participant unless they choose to bring a specific question or next step to someone they trust.",
    alt: "Illustration of a family member listening supportively to a young person",
  },
  partner: {
    src: "/visuals/human-scenes/partner.svg",
    label: "Partners + Access",
    headline: "Help more communities reach the right kind of support.",
    copy: "Founding partners can help expand access, sponsor implementation, and open doors without becoming the support authority.",
    alt: "Illustration of community partners collaborating around a table",
  },
};

export default function CommercialHumanHero({ variant, ctaHref, ctaLabel, className = "" }: Props) {
  const visual = VISUALS[variant];

  return (
    <section className={`overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0b2030] shadow-2xl shadow-black/25 ${className}`}>
      <div className="grid lg:grid-cols-[.94fr_1.06fr] lg:items-stretch">
        <div className="relative min-h-[300px] overflow-hidden border-b border-white/10 bg-[#071a29] sm:min-h-[360px] lg:min-h-[440px] lg:border-b-0 lg:border-r">
          <Image src={visual.src} alt={visual.alt} fill sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" priority={variant === "institution"} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061521]/55 via-transparent to-transparent" aria-hidden="true" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-[#061521]/75 px-4 py-3 text-xs font-bold leading-5 text-slate-200 backdrop-blur-md">
            Original Greene-controlled illustration · no third-party photography
          </div>
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#76ead6]">{visual.label}</p>
          <h2 className="mt-4 font-display text-3xl font-black tracking-tight sm:text-4xl">{visual.headline}</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">{visual.copy}</p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.12em] text-slate-300">
            <span className="rounded-full border border-[#49d8c2]/25 bg-[#49d8c2]/10 px-3 py-2">Human support</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Bounded roles</span>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2">Participant control</span>
          </div>
          {ctaHref && ctaLabel ? <Link href={ctaHref} className="button-primary mt-8 w-fit">{ctaLabel} →</Link> : null}
        </div>
      </div>
    </section>
  );
}
