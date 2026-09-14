import Image from "next/image";
import Link from "next/link";

const contexts = {
  home: { src:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85", eyebrow:"Real people. Real support.", title:"Reflection is only the beginning.", copy:"Prepare for the conversations, relationships, and next steps that happen beyond the screen.", href:"/support/visual-system", cta:"Explore human support" },
  athlete: { src:"https://images.unsplash.com/photo-1768349027535-da4842dab8ba?auto=format&fit=crop&w=1600&q=92", eyebrow:"Athlete + trusted support", title:"Reset with support. Return with purpose.", copy:"Reflect privately, then choose whether a coach, parent, teammate, or trusted adult can help you move forward after pressure, mistakes, or a difficult result.", href:"/support/adaptive", cta:"Choose support" },
  faith: { src:"https://images.unsplash.com/photo-1651514645933-c26e0eb4ace3?auto=format&fit=crop&w=1600&q=92", eyebrow:"Values + community", title:"Reflection can lead back to people you trust.", copy:"Prepare your thoughts privately, then choose whether a family member, faith leader, mentor, or trusted adult belongs in the next conversation.", href:"/support/adaptive", cta:"Prepare a conversation" },
  share: { src:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85", eyebrow:"You choose the bridge", title:"Share with a person, not a platform.", copy:"You decide who receives your support brief and exactly what they can see. Z-Girl helps prepare the handoff; the relationship remains human.", href:"/support", cta:"Review handoff choices" },
} as const;

export default function HumanContextStrip({variant}:{variant:keyof typeof contexts}){
  const item=contexts[variant];
  return <section data-context-variant={variant} className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b2030] shadow-2xl shadow-black/20">
    <div className="relative min-h-[300px] sm:min-h-[340px]">
      <Image src={item.src} alt={variant === "athlete" ? "Coach speaking directly with an athlete during a pressure moment" : variant === "faith" ? "People encouraging one another in a faith-community conversation" : "People connecting in a supportive real-world setting"} fill className="object-cover" sizes="(max-width: 1200px) 100vw, 1200px" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#061521]/95 via-[#061521]/75 to-[#061521]/20" />
      <div className="relative z-10 max-w-2xl p-6 sm:p-9 lg:p-11">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">{item.eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">{item.title}</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">{item.copy}</p>
        <Link href={item.href} className="button-primary mt-6 !min-h-0">{item.cta} <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  </section>;
}
