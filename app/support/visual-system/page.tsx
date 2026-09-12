import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { HUMAN_SUPPORT_SCENARIOS } from "@/lib/human-support-system";

const sceneVisuals: Record<string,string> = {
  "parent-listens":"https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1400&q=88",
  "coach-checkin":"https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1400&q=88",
  "educator-support":"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=88",
  "counselor-prep":"https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=1400&q=88",
  "faith-values":"https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=1400&q=88",
  "mentor-walk":"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=88",
  "family-circle":"https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1400&q=88",
  "self-reflection":"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=88",
};

const roleColor: Record<string,string> = {
  parent:"#ff4db8", coach:"#4d9cff", educator:"#54d98c", therapist:"#a96cff", faith:"#ffd34e", mentor:"#ff8a42"
};

export default function HumanSupportVisualSystemPage(){
  return <main className="min-h-screen overflow-x-hidden bg-[#03111d] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-[1440px] px-3 pb-10 pt-3 sm:px-6 sm:pt-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0b2030] shadow-2xl shadow-black/40 sm:rounded-[2rem]">
        <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[560px]">
          <Image src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2000&q=90" alt="Young person in a warm everyday setting with supportive people nearby." fill priority className="object-cover object-center" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03111d] via-[#03111d]/75 to-[#03111d]/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03111d]/90 via-transparent to-[#03111d]/20" />
          <div className="relative z-10 flex min-h-[460px] max-w-2xl flex-col justify-end p-6 sm:min-h-[520px] sm:p-10 lg:min-h-[560px] lg:justify-center lg:p-12">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#75ead7]">Real conversations. Brighter tomorrows.</p>
            <h1 className="mt-3 font-display text-[2.45rem] font-black leading-[.98] tracking-tight sm:text-6xl lg:text-7xl">You’re not alone.<br/><span className="text-[#ff5ac8]">Real people.<br/>Real support.<br/>A brighter you.</span></h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">Reflect, prepare, and connect with the people who support you—without giving up control of your story.</p>
            <div className="mt-6 flex gap-3"><Link href="/reflect" className="button-primary !min-h-0">Reflect</Link><Link href="/support/adaptive" className="button-secondary !min-h-0">Connect</Link></div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#071a29] shadow-xl shadow-black/20 lg:grid-cols-[.9fr_1.1fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#75ead7]">AI-powered reflection. Human support.</p>
          <h2 className="mt-2 font-display text-3xl font-black leading-tight sm:text-4xl">You stay at the center.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">Z-Girl adapts to your age, goals, and situation. You choose who can help, what to share, and what happens next.</p>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-slate-200 sm:grid-cols-4"><span>① Reflect</span><span>② Choose</span><span>③ Prepare</span><span>④ Connect</span></div>
        </div>
        <div className="relative aspect-[16/9] min-h-[230px] border-t border-white/10 lg:border-l lg:border-t-0">
          <Image src="/visuals/zgirl-human-centered-system.svg" alt="You connected with a parent, coach, educator, counselor, faith leader, and mentor." fill className="object-contain p-2" sizes="(max-width:1024px) 100vw, 55vw" />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.22em] text-[#75ead7]">Choose who can help</p><h2 className="mt-1 font-display text-3xl font-black sm:text-4xl">Different roles. A stronger you.</h2></div><p className="hidden text-xs uppercase tracking-[.16em] text-slate-500 sm:block">Your story. Your control.</p></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HUMAN_SUPPORT_SCENARIOS.map((scene)=>{
            const accent=roleColor[scene.role] || "#49d8c2";
            return <article key={scene.id} className="group relative aspect-[4/3] min-h-[250px] overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b2030] shadow-xl shadow-black/25" style={{boxShadow:`inset 0 -4px 0 ${accent}`}}>
              <Image src={sceneVisuals[scene.id] || sceneVisuals["mentor-walk"]} alt={scene.alt} fill className="object-cover transition duration-500 group-hover:scale-[1.035]" sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03111d] via-[#03111d]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mb-2 inline-flex rounded-full border border-white/20 bg-[#03111d]/75 px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] backdrop-blur" style={{color:accent}}>{scene.role === "therapist" ? "Counselor" : scene.title === "Family reflection" ? "Family" : scene.title === "Private reflection first" ? "Private reflection" : scene.role}</div>
                <h3 className="text-2xl font-black leading-tight drop-shadow-lg">{scene.title}</h3>
                <p className="mt-1 max-w-[28rem] text-sm leading-5 text-slate-100 drop-shadow">{scene.moment}</p>
                <span className="sr-only">{scene.safetyBoundary}</span>
              </div>
            </article>
          })}
        </div>
      </section>

      <section className="mt-7 grid gap-5 rounded-[1.6rem] border border-[#49d8c2]/20 bg-[#071a29] p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#75ead7]">Human first</p><h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">AI in service of the relationship.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Z-Girl helps you prepare, communicate, and take positive next steps. Trusted people remain in charge of the human relationship.</p></div>
        <Link href="/support/adaptive" className="button-primary !min-h-0 w-full text-center md:w-auto">Open AI-Adaptive Support →</Link>
      </section>
    </div>
  </main>
}
