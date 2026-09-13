import Link from "next/link";

type Variant = "athlete" | "faith" | "institution" | "family" | "partner";

type Props = { variant: Variant; ctaHref?: string; ctaLabel?: string; className?: string };

const VISUALS: Record<Variant, { src: string; label: string; headline: string; copy: string; alt: string; position?: string }> = {
  athlete: {
    src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1800&q=90",
    label: "Athlete + Coach",
    headline: "Better resets. Better conversations. Stronger team culture.",
    copy: "Hero Within supports private athlete reflection and more useful human conversations with coaches, teammates, and family.",
    alt: "Athletes connecting in a real-world team setting",
    position: "center",
  },
  faith: {
    src: "https://images.unsplash.com/photo-1520857014576-2c4f4c972b57?auto=format&fit=crop&w=1800&q=90",
    label: "Faith + Community",
    headline: "Values become real through people, practice, and reflection.",
    copy: "A private reflection tool that can prepare a better conversation with family, mentors, ministry leaders, and trusted community.",
    alt: "People connecting in a supportive community setting",
    position: "center",
  },
  institution: {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=90",
    label: "Schools + Youth Programs",
    headline: "A human-support layer for the moments between programs and conversations.",
    copy: "Z-Girl helps learners prepare, reflect, and choose a next step while educators and facilitators keep their real-world roles.",
    alt: "Students learning and connecting together",
    position: "center",
  },
  family: {
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=90",
    label: "Family + Trusted Support",
    headline: "Private first. Human when invited.",
    copy: "Reflection stays with the participant unless they choose to bring a specific question or next step to someone they trust.",
    alt: "People sharing a supportive real-world moment",
    position: "center",
  },
  partner: {
    src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=90",
    label: "Partners + Access",
    headline: "Help more communities reach the right kind of support.",
    copy: "Founding partners can help expand access, sponsor implementation, and open doors without becoming the support authority.",
    alt: "Community partners collaborating together",
    position: "center",
  },
};

export default function CommercialHumanHero({ variant, ctaHref, ctaLabel, className = "" }: Props) {
  const visual = VISUALS[variant];
  return (
    <section className={`overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0b2030] shadow-2xl shadow-black/25 ${className}`}>
      <div className="grid lg:grid-cols-[1.04fr_.96fr] lg:items-stretch">
        <div className="relative min-h-[330px] overflow-hidden border-b border-white/10 bg-[#071a29] sm:min-h-[390px] lg:min-h-[470px] lg:border-b-0 lg:border-r">
          <img
            src={visual.src}
            alt={visual.alt}
            loading={variant === "institution" ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: visual.position }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061521]/80 via-transparent to-[#061521]/10" aria-hidden="true" />
          <div className="absolute bottom-5 left-5 rounded-full border border-white/15 bg-[#061521]/80 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-white backdrop-blur-md">{visual.label}</div>
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
