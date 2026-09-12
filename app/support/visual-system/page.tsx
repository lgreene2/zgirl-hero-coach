import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { HUMAN_SUPPORT_SCENARIOS } from "@/lib/human-support-system";

const roleColor: Record<string,string> = {parent:"#ff4db8",coach:"#4d9cff",educator:"#54d98c",therapist:"#a96cff",faith:"#ffd34e",mentor:"#ff8a42"};
const supportNodes = [
  ["Parent","#ff4db8","Home support"],["Coach","#4d9cff","Encouragement"],["Educator","#54d98c","Learning support"],
  ["Counselor","#a96cff","Safe space"],["Faith Leader","#ffd34e","Values & perspective"],["Mentor","#ff8a42","Guidance"]
] as const;

const sprite: Record<string,{x:number;y:number}> = {
  "parent-listens":{x:0,y:0},
  "coach-checkin":{x:1,y:0},
  "educator-support":{x:2,y:0},
  "counselor-prep":{x:3,y:0},
  "faith-values":{x:0,y:1},
  "mentor-walk":{x:1,y:1},
  "family-circle":{x:2,y:1},
  "self-reflection":{x:3,y:1},
};

function RoleScene({id,alt}:{id:string;alt:string}){
  const p=sprite[id] || sprite["mentor-walk"];
  return <div role="img" aria-label={alt} className="absolute inset-0 bg-[url('/visuals/human-scenes/role-sprite.jpg')] bg-no-repeat" style={{backgroundSize:"400% 200%",backgroundPosition:`${p.x*33.333333}% ${p.y*100}%`}}/>;
}

export default function HumanSupportVisualSystemPage(){
  return <main className="min-h-screen overflow-x-hidden bg-[#03111d] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-[1440px] px-3 pb-10 pt-3 sm:px-6 sm:pt-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#0b2030] shadow-2xl shadow-black/40 sm:rounded-[2rem]">
        <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[560px]">
          <div className="absolute inset-0 bg-[url('/visuals/human-scenes/role-sprite.jpg')] bg-cover bg-no-repeat" style={{backgroundSize:"400% 200%",backgroundPosition:"100% 100%"}} aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#03111d] via-[#03111d]/78 to-[#03111d]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#03111d]/90 via-transparent to-[#03111d]/20" />
          <div className="relative z-10 flex min-h-[460px] max-w-2xl flex-col justify-end p-6 sm:min-h-[520px] sm:p-10 lg:min-h-[560px] lg:justify-center lg:p-12">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#75ead7]">Real conversations. Brighter tomorrows.</p>
            <h1 className="mt-3 font-display text-[2.45rem] font-black leading-[.98] tracking-tight sm:text-6xl lg:text-7xl">You’re not alone.<br/><span className="text-[#ff5ac8]">Real people.<br/>Real support.<br/>A brighter you.</span></h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">Reflect, prepare, and connect with the people who support you—without giving up control of your story.</p>
            <div className="mt-6 flex gap-3"><Link href="/reflect" className="button-primary !min-h-0">Reflect</Link><Link href="/support/adaptive" className="button-secondary !min-h-0">Connect</Link></div>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#071a29] shadow-xl shadow-black/20">
        <div className="grid lg:grid-cols-[.8fr_1.2fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#75ead7]">AI-powered reflection. Human support.</p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight sm:text-4xl">A circle of support. You at the center.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">Z-Girl adapts to your age, goals, and situation. You choose who can help, what to share, and what happens next.</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-slate-200 sm:grid-cols-4"><span>① Reflect</span><span>② Choose</span><span>③ Prepare</span><span>④ Connect</span></div>
          </div>
          <div className="border-t border-white/10 p-5 sm:p-7 lg:border-l lg:border-t-0">
            <div className="relative mx-auto max-w-2xl rounded-[1.5rem] border border-white/10 bg-[#041521] p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">{supportNodes.slice(0,3).map(([name,color,sub])=><div key={name} className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-black shadow-lg" style={{borderColor:color,color,boxShadow:`0 0 24px ${color}33`}}>{name[0]}</div><p className="mt-2 text-xs font-black">{name}</p><p className="hidden text-[10px] text-slate-500 sm:block">{sub}</p></div>)}</div>
              <div className="my-4 flex items-center justify-center"><div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#ff5ac8] bg-[#10283a] shadow-[0_0_35px_rgba(255,90,200,.28)] sm:h-32 sm:w-32"><Image src="/icons/zgirl-icon-1024.png" alt="You at the center of your support circle" fill className="object-cover" sizes="128px" /></div></div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">{supportNodes.slice(3).map(([name,color,sub])=><div key={name} className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-black shadow-lg" style={{borderColor:color,color,boxShadow:`0 0 24px ${color}33`}}>{name[0]}</div><p className="mt-2 text-xs font-black">{name}</p><p className="hidden text-[10px] text-slate-500 sm:block">{sub}</p></div>)}</div>
              <p className="mt-5 text-center text-xs font-bold text-[#75ead7]">Your story. Your control.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-4"><p className="text-xs font-black uppercase tracking-[.22em] text-[#75ead7]">Choose who can help</p><h2 className="mt-1 font-display text-2xl font-black sm:text-4xl">Different roles. A stronger you.</h2></div>
        <div className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {HUMAN_SUPPORT_SCENARIOS.map((scene)=>{
            const accent=roleColor[scene.role] || "#49d8c2";
            const label=scene.role === "therapist" ? "Counselor" : scene.title === "Family reflection" ? "Family" : scene.title === "Private reflection first" ? "Private reflection" : scene.role;
            return <article key={scene.id} className="group relative h-[360px] w-[calc(100vw-3.25rem)] max-w-[390px] shrink-0 snap-start overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0b2030] shadow-xl shadow-black/25 sm:h-auto sm:aspect-[4/3] sm:w-auto sm:max-w-none" style={{boxShadow:`inset 0 -4px 0 ${accent}`}}>
              <RoleScene id={scene.id} alt={scene.alt}/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#03111d] via-[#03111d]/28 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mb-2 inline-flex rounded-full border border-white/20 bg-[#03111d]/80 px-3 py-1 text-[10px] font-black uppercase tracking-[.15em] backdrop-blur" style={{color:accent}}>{label}</div>
                <h3 className="text-2xl font-black leading-tight drop-shadow-lg">{scene.title}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-100 drop-shadow">{scene.moment}</p>
                <span className="sr-only">{scene.safetyBoundary}</span>
              </div>
            </article>
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500 sm:hidden">Swipe to explore every support role →</p>
      </section>

      <section className="mt-6 grid gap-5 rounded-[1.6rem] border border-[#49d8c2]/20 bg-[#071a29] p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-[#75ead7]">Human first</p><h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">AI in service of the relationship.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Z-Girl helps you prepare, communicate, and take positive next steps. Trusted people remain in charge of the human relationship.</p></div>
        <Link href="/support/adaptive" className="button-primary !min-h-0 w-full text-center md:w-auto">Open AI-Adaptive Support →</Link>
      </section>
    </div>
  </main>
}
