import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { HUMAN_SUPPORT_SCENARIOS } from "@/lib/human-support-system";

const sceneVisuals: Record<string,string> = {
  "parent-listens":"https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=82",
  "coach-checkin":"https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=82",
  "educator-support":"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=82",
  "counselor-prep":"https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=1200&q=82",
  "faith-values":"https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=1200&q=82",
  "mentor-walk":"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82",
  "family-circle":"https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1200&q=82",
  "self-reflection":"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=82",
};

export default function HumanSupportVisualSystemPage(){
  return <main className="min-h-screen bg-[#061521] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:py-12">
      <section className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b2030] shadow-2xl shadow-black/30 lg:grid-cols-[.85fr_1.15fr]">
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <p className="section-kicker">Real conversations. Brighter tomorrows.</p>
          <h1 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-6xl">You’re not alone. <span className="text-[#76ead6]">Real people. Real support.</span></h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Z-Girl helps you reflect, prepare, and connect with the people who support you—parents, coaches, teachers, counselors, mentors, faith leaders, and family.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/reflect" className="button-primary !min-h-0">Start reflecting</Link>
            <Link href="/support/adaptive" className="button-secondary !min-h-0">Find support</Link>
          </div>
        </div>
        <div className="relative min-h-[320px] sm:min-h-[460px]">
          <Image src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=85" alt="Young person in a warm, supportive everyday setting." fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061521]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0b2030]/55 lg:via-transparent lg:to-transparent" />
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b2030]/80 sm:rounded-[2rem]">
        <div className="relative aspect-[16/9] w-full">
          <Image src="/visuals/zgirl-human-centered-system.svg" alt="Participant connected with parent, coach, educator, counselor, faith leader, and mentor." fill className="object-contain" sizes="(max-width: 1280px) 100vw, 1280px" />
        </div>
        <div className="grid gap-5 border-t border-white/10 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-end">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">AI-powered reflection. Human support.</p><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Reflect → choose the right person → prepare what you want to say → connect. AI adapts the preparation while trusted people remain in charge of the relationship.</p></div>
          <Link href="/support/adaptive" className="button-primary !min-h-0 w-full text-center md:w-auto">Open AI-Adaptive Support</Link>
        </div>
      </section>

      <section className="mt-9">
        <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Choose who can help</p><h2 className="mt-2 font-display text-3xl font-black">Different roles. A stronger you.</h2></div><p className="text-sm text-slate-400">Your story. Your control.</p></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HUMAN_SUPPORT_SCENARIOS.map((scene)=><article key={scene.id} className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b2030] shadow-lg shadow-black/15">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#0a1b29]">
              <Image src={sceneVisuals[scene.id] || sceneVisuals["mentor-walk"]} alt={`${scene.title} — human-centered support scene.`} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071722] via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-[#061521]/80 px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] text-[#9af3e4] backdrop-blur">{scene.role}</span>
            </div>
            <div className="p-5"><h3 className="text-xl font-black">{scene.title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{scene.moment}</p><p className="mt-3 text-[11px] leading-5 text-slate-500">{scene.safetyBoundary}</p></div>
          </article>)}
        </div>
      </section>

      <section className="mt-9 grid gap-5 rounded-[2rem] border border-[#49d8c2]/20 bg-[#49d8c2]/[.045] p-6 sm:p-9 md:grid-cols-[1fr_auto] md:items-center">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Z-Girl promise</p><h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">Human first. AI in service of the relationship.</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">Z-Girl helps you prepare, communicate, and take positive next steps. It does not diagnose, monitor, discipline, or replace trusted adults or qualified professionals.</p></div>
        <Link href="/support" className="button-primary !min-h-0 w-full text-center md:w-auto">Open Support Handoff</Link>
      </section>
    </div>
  </main>
}
