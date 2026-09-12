import Image from "next/image";
import Link from "next/link";

type Variant = "athlete" | "faith" | "school" | "family" | "partner";

const variants: Record<Variant,{src:string;eyebrow:string;title:string;copy:string;accent:string}> = {
  athlete:{src:"https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1800&q=88",eyebrow:"Coach + athlete + team",title:"Build the human system around the next play.",copy:"Give athletes a private reflection path and coaches a practical, bounded way to support confidence, composure, teamwork, and growth.",accent:"#76ead6"},
  faith:{src:"https://images.unsplash.com/photo-1520857014576-2c4f4c972b57?auto=format&fit=crop&w=1800&q=88",eyebrow:"Youth + family + faith community",title:"Bring reflection back into trusted community.",copy:"Help facilitators create values-centered moments without forcing disclosure or turning private reflection into a group record.",accent:"#fde68a"},
  school:{src:"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=88",eyebrow:"Educator + student",title:"Support the learner, not just the workflow.",copy:"Use a bounded reflection system that strengthens communication while preserving participant privacy and educator judgment.",accent:"#86efac"},
  family:{src:"https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1800&q=88",eyebrow:"Family + trusted support",title:"Create better conversations at home.",copy:"Private reflection first, then an optional bridge into a parent, guardian, or family conversation chosen by the participant.",accent:"#f9a8d4"},
  partner:{src:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=88",eyebrow:"Partners expand access",title:"Help more people reach the right support.",copy:"Referral, implementation, reseller, and sponsored-access pathways can extend Z-Girl while preserving participant trust, commercial governance, and role boundaries.",accent:"#76ead6"},
};

export default function CommercialHumanHero({variant,ctaHref,ctaLabel}:{variant:Variant;ctaHref?:string;ctaLabel?:string}){
  const item=variants[variant];
  return <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#071a29] shadow-2xl shadow-black/30">
    <div className="relative min-h-[390px] sm:min-h-[440px]">
      <Image src={item.src} alt="People connecting in a real-world Z-Girl support setting" fill priority className="object-cover" sizes="(max-width: 1200px) 100vw, 1200px"/>
      <div className="absolute inset-0 bg-gradient-to-r from-[#03111d]/95 via-[#03111d]/80 to-[#03111d]/15"/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#03111d]/80 via-transparent to-transparent"/>
      <div className="relative z-10 flex min-h-[390px] max-w-2xl flex-col justify-end p-6 sm:min-h-[440px] sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.2em]" style={{color:item.accent}}>{item.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">{item.title}</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-200">{item.copy}</p>
        {ctaHref&&ctaLabel&&<Link href={ctaHref} className="button-primary mt-6 !min-h-0 w-fit">{ctaLabel} →</Link>}
      </div>
    </div>
  </section>;
}
