import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { HUMAN_SUPPORT_SCENARIOS } from "@/lib/human-support-system";

export default function HumanSupportVisualSystemPage(){
  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-7 lg:py-12">
      <p className="section-kicker">Z-Girl Human-Centered Visual System · v1 candidate set</p>
      <h1 className="mt-2 max-w-4xl font-display text-4xl font-black tracking-tight sm:text-5xl">Show the human relationship—not just the interface.</h1>
      <p className="mt-4 max-w-4xl text-base leading-7 text-slate-300 sm:text-lg">These governed scenarios define the visual language for parenting, coaching, education, counseling, faith, mentoring, family reflection, and private self-reflection. Human support stays primary; AI helps prepare, adapt, and reinforce the conversation.</p>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b2030]/80 shadow-2xl shadow-black/25">
        <div className="relative aspect-[16/9] w-full">
          <Image src="/visuals/zgirl-human-centered-system.svg" alt="Z-Girl human-centered support system showing a young person connected with a parent, coach, educator, counselor, faith leader, and mentor." fill priority className="object-cover" sizes="(max-width: 1280px) 100vw, 1280px" />
        </div>
        <div className="grid gap-4 border-t border-white/10 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Approved visual direction reference</p><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">The participant remains visually central while trusted humans surround the experience. Final photographic/illustrative scene masters will follow this relational hierarchy without implying surveillance, diagnosis, or replacement of professional judgment.</p></div>
          <Link href="/support/adaptive" className="button-primary !min-h-0">Open AI-Adaptive Support</Link>
        </div>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {HUMAN_SUPPORT_SCENARIOS.map((scene)=><article key={scene.id} className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b2030]/80">
          <div className="aspect-[4/3] bg-[radial-gradient(circle_at_30%_25%,rgba(73,216,194,.22),transparent_34%),linear-gradient(145deg,#102c3e,#071824_58%,#04111b)] p-5">
            <div className="flex h-full flex-col justify-between rounded-[1.4rem] border border-white/10 bg-black/10 p-4">
              <span className="w-fit rounded-full border border-[#49d8c2]/30 bg-[#49d8c2]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#9af3e4]">{scene.role}</span>
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">Scene master · candidate</p><p className="mt-2 text-xl font-black">{scene.title}</p></div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm leading-6 text-slate-300">{scene.moment}</p>
            <p className="mt-3 text-xs leading-5 text-slate-500">{scene.safetyBoundary}</p>
          </div>
        </article>)}
      </div>
      <section className="mt-8 rounded-[2rem] border border-[#49d8c2]/20 bg-[#49d8c2]/[.045] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Production rule</p><h2 className="mt-2 font-display text-3xl font-black">Human first. AI in service of the relationship.</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Visuals must feel believable, warm, diverse, mobile-safe, and contextually accurate. No generic stock-photo posing, no unauthorized likenesses, no clinical-outcome implication, and no visual that weakens participant consent or privacy.</p></div><Link href="/support" className="button-secondary !min-h-0">Open Support Handoff</Link></div>
      </section>
    </div>
  </main>
}
