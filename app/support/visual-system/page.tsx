import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { HUMAN_SUPPORT_SCENARIOS } from "@/lib/human-support-system";

export default function HumanSupportVisualSystemPage(){
  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:py-12">
      <p className="section-kicker">Z-Girl Human-Centered Visual System</p>
      <h1 className="mt-2 max-w-4xl font-display text-3xl font-black tracking-tight sm:text-5xl">Human support stays at the center.</h1>
      <p className="mt-4 max-w-4xl text-base leading-7 text-slate-300 sm:text-lg">Z-Girl helps a participant prepare for a real conversation with a trusted person. The participant controls what is shared; AI supports the relationship rather than replacing it.</p>

      <section className="mt-7 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b2030]/80 shadow-2xl shadow-black/25 sm:rounded-[2rem]">
        <div className="relative aspect-[16/9] w-full">
          <Image src="/visuals/zgirl-human-centered-system.svg" alt="Z-Girl human-centered support system showing a participant connected with a parent, coach, educator, counselor, faith leader, and mentor." fill priority className="object-contain" sizes="(max-width: 1280px) 100vw, 1280px" />
        </div>
        <div className="border-t border-white/10 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">How it works</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">You remain in control. Choose the trusted person who fits the moment, prepare what you want to say, and use Z-Girl to make the next human conversation clearer and more useful.</p>
          <Link href="/support/adaptive" className="button-primary mt-5 !min-h-0 w-full text-center sm:w-auto">Open AI-Adaptive Support</Link>
        </div>
      </section>

      <section className="mt-7">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Choose who can help</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HUMAN_SUPPORT_SCENARIOS.map((scene)=><article key={scene.id} className="rounded-[1.5rem] border border-white/10 bg-[#0b2030]/80 p-5">
            <div className="flex items-start gap-4">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#49d8c2] shadow-[0_0_18px_rgba(73,216,194,.55)]" />
              <div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#9af3e4]">{scene.role}</p>
                <h2 className="mt-1 text-xl font-black">{scene.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{scene.moment}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">{scene.safetyBoundary}</p>
              </div>
            </div>
          </article>)}
        </div>
      </section>

      <section className="mt-7 rounded-[1.75rem] border border-[#49d8c2]/20 bg-[#49d8c2]/[.045] p-5 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Z-Girl promise</p>
        <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">Human first. AI in service of the relationship.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Z-Girl does not diagnose, monitor, discipline, or replace a parent, coach, educator, counselor, faith leader, mentor, or other qualified human support.</p>
        <Link href="/support" className="button-secondary mt-5 !min-h-0 w-full text-center sm:w-auto">Open Support Handoff</Link>
      </section>
    </div>
  </main>
}
