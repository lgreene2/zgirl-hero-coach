import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import GuidedMarketSampler, { type MarketScenario } from "@/components/GuidedMarketSampler";

export const metadata: Metadata = {
  title: "Faith & Values Reflection",
  description:
    "Try a private, faith-aligned Z-Girl reflection centered on courage, forgiveness, gratitude, and service.",
};

const scenarios: MarketScenario[] = [
  {
    id: "courage",
    label: "I need courage",
    tag: "Courage",
    standardPrompt:
      "Think about the moment ahead of you. Courage does not mean you feel no fear. It means you can choose a wise next step even while you feel nervous.",
    simplifiedPrompt: "You can feel nervous and still take one brave, safe step.",
    reflection: "What would a courageous and caring response look like here?",
    simplifiedReflection: "What is one brave and kind thing you can do?",
    heroMoves: [
      "Ask a trusted adult for help before I act.",
      "Tell the truth calmly, even if it feels uncomfortable.",
      "Try one small step instead of avoiding the whole situation.",
      "Pause, pray or reflect, and choose words that do not harm anyone.",
    ],
    closing:
      "Courage grows through practiced choices. Your Hero Move can be small, safe, and honest.",
  },
  {
    id: "forgiveness",
    label: "I am hurt or upset",
    tag: "Forgiveness",
    standardPrompt:
      "Forgiveness does not require pretending the hurt did not happen. You can protect healthy boundaries while choosing not to let anger make every decision for you.",
    simplifiedPrompt: "You can name the hurt, stay safe, and choose what helps you heal.",
    reflection: "What do you need before you can take a healthy step toward peace?",
    simplifiedReflection: "What would help you feel safer or calmer?",
    heroMoves: [
      "Tell a trusted adult what happened.",
      "Use calm words to explain how the situation affected me.",
      "Take space now and revisit the conversation later.",
      "Choose not to retaliate, while keeping a clear boundary.",
    ],
    closing:
      "Forgiveness and reconciliation are not always the same thing. Safety, truth, accountability, and support still matter.",
  },
  {
    id: "service",
    label: "I want to help",
    tag: "Service",
    standardPrompt:
      "Service begins by noticing what another person may need and responding with dignity, not attention-seeking or pressure.",
    simplifiedPrompt: "Notice a need. Help in a respectful way.",
    reflection: "What is one useful act of kindness or service you can complete today?",
    simplifiedReflection: "What is one helpful thing you can do today?",
    heroMoves: [
      "Check on someone who seems left out.",
      "Complete one helpful task without being asked twice.",
      "Share time, encouragement, or a resource respectfully.",
      "Invite others to help with a need in our community.",
    ],
    closing:
      "A meaningful act of service does not have to be large. Consistent care can change the atmosphere around you.",
  },
];

export default function FaithStartPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Link href="/faith" className="text-sm font-bold text-slate-400 transition hover:text-white">
            ← Faith &amp; Values Hub
          </Link>
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-bold text-amber-100">
            Independent faith-aligned resource
          </span>
        </div>

        <GuidedMarketSampler
          eyebrow="Faith & Values sample"
          title="Connect the moment to a value, then choose one Hero Move."
          intro="Choose a theme and try a short reflection. The optional faith practice can be prayer, quiet contemplation, scripture reading selected by your family or congregation, or no additional practice."
          scenarios={scenarios}
          accent="gold"
          supportLabel="Z-Girl is not clergy, spiritual direction, therapy, confession, counseling, or emergency support. Young people should involve a trusted adult when a situation feels unsafe, overwhelming, or difficult to handle alone."
          optionalPracticeLabel="Pause for a brief prayer, quiet reflection, or reading chosen by your family or faith community."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/faith/christian" className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:bg-white/[.07]">
            <span className="text-xs font-black uppercase tracking-[.17em] text-amber-200">Starter pack</span>
            <h2 className="mt-2 text-xl font-black">Christian Reflection</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Four guided themes for youth, families, and facilitators.</p>
          </Link>
          <Link href="/faith/catholic" className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:bg-white/[.07]">
            <span className="text-xs font-black uppercase tracking-[.17em] text-amber-200">Preview</span>
            <h2 className="mt-2 text-xl font-black">Catholic Faith &amp; Virtue</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">A controlled concept for family, parish, and Catholic-school use.</p>
          </Link>
          <Link href="/faith/congregations" className="rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:bg-white/[.07]">
            <span className="text-xs font-black uppercase tracking-[.17em] text-amber-200">Group use</span>
            <h2 className="mt-2 text-xl font-black">Congregation Toolkit</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">A self-service path for youth leaders and faith communities.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
