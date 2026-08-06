import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Christian Reflection Starter Pack",
  description:
    "A four-theme Christian reflection starter pack for youth, families, and facilitators using the Hero Within method.",
};

const sessions = [
  {
    number: "01",
    theme: "Courage",
    focus: "Move forward wisely even when fear is present.",
    text: "Joshua 1:9",
    heroMove: "Take one brave, safe, and honest next step.",
  },
  {
    number: "02",
    theme: "Forgiveness",
    focus: "Name the hurt, maintain healthy boundaries, and resist retaliation.",
    text: "Colossians 3:13",
    heroMove: "Choose a truthful step toward peace without ignoring safety or accountability.",
  },
  {
    number: "03",
    theme: "Gratitude",
    focus: "Notice support, growth, provision, and small reasons for hope.",
    text: "1 Thessalonians 5:18",
    heroMove: "Express specific thanks through words or action.",
  },
  {
    number: "04",
    theme: "Service",
    focus: "Use strength, time, and attention to help with dignity.",
    text: "Galatians 5:13",
    heroMove: "Complete one useful act of care without seeking recognition.",
  },
];

export default function ChristianStarterPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_20%,rgba(251,191,36,.16),transparent_30%)]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <Link href="/faith" className="text-sm font-bold text-slate-400 transition hover:text-white">← Faith &amp; Values Hub</Link>
          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <span className="eyebrow">Sellable starter product</span>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-amber-100">Youth · Family · Group</span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-tight tracking-[-.04em] sm:text-6xl">Christian Reflection Starter Pack</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Four guided reflections that connect everyday decisions to courage, forgiveness, gratitude, service, and one practical Hero Move.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/resources/ZGirl_Christian_Reflection_Starter_Pack.pdf" download className="rounded-full bg-amber-300 px-6 py-3.5 text-sm font-black text-[#201400] transition hover:bg-amber-200">Download starter pack PDF</a>
              <Link href="/faith/start" className="button-secondary">Try the online sample</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => (
            <article key={session.number} className="rounded-3xl border border-white/10 bg-white/[.035] p-6">
              <div className="flex items-start justify-between gap-5">
                <span className="font-display text-4xl font-black text-amber-200">{session.number}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">Reference: {session.text}</span>
              </div>
              <h2 className="mt-4 font-display text-3xl font-black">{session.theme}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{session.focus}</p>
              <div className="mt-5 rounded-2xl border border-[#49d8c2]/20 bg-[#49d8c2]/5 p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#76ead6]">Hero Move</p>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-200">{session.heroMove}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-2 lg:px-12">
          <div className="rounded-3xl border border-white/10 bg-[#071925] p-6">
            <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Included</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>Four youth reflection sessions</li>
              <li>Parent and caregiver discussion prompts</li>
              <li>Facilitator notes for group use</li>
              <li>Prayer, quiet reflection, or no-faith-closing options</li>
              <li>Accessible participation adaptations</li>
              <li>Safety, trusted-adult, and nonclinical boundaries</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#071925] p-6">
            <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Use boundary</p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              This independent resource uses brief scripture references and original reflection language. It is not an official publication or endorsement of a church, denomination, ministry, or religious authority. Families and organizations should use their preferred Bible translation and locally approved teaching materials.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Z-Girl is not clergy, spiritual direction, therapy, confession, counseling, or emergency support.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-amber-300/20 bg-gradient-to-br from-[#173044] to-[#0b2130] p-7 sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-black">Need a group-ready version?</h2>
            <p className="mt-3 leading-7 text-slate-300">Use the self-service congregation toolkit, or submit approved content for a custom faith profile.</p>
          </div>
          <div className="mt-6 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
            <Link href="/faith/congregations" className="rounded-full bg-amber-300 px-5 py-3 text-center text-sm font-black text-[#201400] transition hover:bg-amber-200">Congregation toolkit</Link>
            <Link href="/faith/create-a-profile" className="button-secondary text-center">Create a profile</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
