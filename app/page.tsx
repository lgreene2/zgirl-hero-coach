import Link from "next/link";
import InstallPWAButton from "@/components/InstallPWAButton";
import SiteHeader from "@/components/SiteHeader";

const roleCards = [
  {id:"parent",label:"Parent",title:"Parent listens first",copy:"A calm, supportive conversation after a difficult day.",accent:"#ff4db8",img:"https://images.unsplash.com/photo-1752652016199-a9ca574e08cb?auto=format&fit=crop&w=1800&q=95"},
  {id:"coach",label:"Coach",title:"Coach builds confidence",copy:"Encouragement before the next game or practice.",accent:"#4d9cff",img:"https://images.unsplash.com/photo-1768349027535-da4842dab8ba?auto=format&fit=crop&w=1800&q=95"},
  {id:"educator",label:"Educator",title:"Teacher creates space",copy:"A safe place to ask questions and keep learning.",accent:"#54d98c",img:"https://images.unsplash.com/photo-1758270705696-ec9caffc73dd?auto=format&fit=crop&w=1800&q=95"},
  {id:"counselor",label:"Counselor",title:"Counselor offers guidance",copy:"A trusted space to talk through challenges.",accent:"#c179ff",img:"https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=1800&q=95"},
  {id:"faith",label:"Faith Leader",title:"Faith leader brings hope",copy:"Real talk about life, values, purpose, and next steps.",accent:"#ffd34e",img:"https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=1800&q=95"},
  {id:"mentor",label:"Mentor",title:"Mentor walks alongside",copy:"Guidance, perspective, and real-world encouragement.",accent:"#ff8a42",img:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=95"},
  {id:"family",label:"Family",title:"Family stays connected",copy:"Stronger conversations. Stronger tomorrows.",accent:"#ff4d83",img:"https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=1800&q=95"},
  {id:"yourself",label:"Yourself",title:"Private reflection",copy:"A safe space just for you before deciding what to share.",accent:"#49d8c2",img:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=95"},
];

const heroImage = roleCards[7].img;

export default function Home(){
  return <main className="min-h-screen overflow-x-hidden bg-[#03111d] text-white">
    <SiteHeader/>
    <section className="relative isolate border-b border-white/10">
      <img src={heroImage} alt="Young person reflecting privately before a conversation." className="absolute inset-0 -z-20 h-full w-full object-cover object-center"/>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#03111d_0%,rgba(3,17,29,.94)_38%,rgba(3,17,29,.45)_67%,rgba(3,17,29,.2)_100%)]"/>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#03111d] via-transparent to-[#03111d]/20"/>
      <div className="mx-auto flex min-h-[670px] max-w-7xl items-center px-5 py-14 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[.24em] text-[#75ead7] sm:text-sm">Real conversations. Brighter tomorrows.</p>
          <h1 className="mt-4 font-display text-5xl font-black leading-[.95] tracking-[-.04em] sm:text-6xl lg:text-7xl">You’re not alone.<br/><span className="text-[#ff5ac8]">Real people.<br/>Real support.<br/>A brighter you.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">Z-Girl helps you reflect, prepare, and connect with the people who support you—at home, at school, on your team, and in your community.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/reflect" className="button-primary">Start a reflection →</Link><Link href="/support/visual-system" className="button-secondary">See how support works</Link></div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-slate-200 sm:text-sm"><span>♡ Safe & private</span><span>◎ Real people, real support</span><span>↗ Built for real life</span><span>★ You’ve got this</span><InstallPWAButton/></div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1500px] px-3 py-10 sm:px-6 lg:px-8">
      <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.23em] text-[#75ead7]">Choose who can help</p><h2 className="mt-2 font-display text-3xl font-black sm:text-5xl">Different roles. A stronger you.</h2></div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-8 lg:overflow-visible">
        {roleCards.map((r)=><Link key={r.id} href={`/support/visual-system#${r.id}`} className="group relative h-[390px] w-[76vw] max-w-[285px] shrink-0 snap-start overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0b2030] shadow-xl shadow-black/25 lg:h-[365px] lg:w-auto" style={{boxShadow:`inset 0 -4px 0 ${r.accent}`}}>
          <img src={r.img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#03111d] via-[#03111d]/62 to-transparent"/>
          <div className="absolute inset-x-0 bottom-0 p-4"><span className="inline-flex rounded-full border border-white/20 bg-[#03111d]/80 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] backdrop-blur" style={{color:r.accent}}>{r.label}</span><h3 className="mt-2 text-xl font-black leading-tight">{r.title}</h3><p className="mt-1 text-sm leading-5 text-slate-100">{r.copy}</p><span className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg" style={{borderColor:r.accent,color:r.accent}}>→</span></div>
        </Link>)}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-12">
      <div className="grid gap-6 rounded-[2rem] border border-[#49d8c2]/20 bg-[#071a29] p-6 shadow-xl shadow-black/20 sm:p-8 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
        <div><p className="text-xs font-black uppercase tracking-[.22em] text-[#75ead7]">Human first</p><h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">AI in service of the relationship.</h2><p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">Z-Girl helps you prepare, communicate, and take positive next steps. Trusted people remain in charge of the human relationship.</p><Link href="/support/adaptive" className="button-primary mt-6 w-full justify-center text-center sm:w-auto">Open AI-Adaptive Support →</Link><p className="mt-4 text-xs text-slate-500">Your privacy matters. You choose what to share and when.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><div><p className="font-black text-[#75ead7]">Real conversations</p><p className="text-sm text-slate-400">Built around real life.</p></div><div><p className="font-black text-[#ff7fd1]">Safe & supportive</p><p className="text-sm text-slate-400">A positive, judgment-free space.</p></div><div><p className="font-black text-[#75ead7]">Positive next steps</p><p className="text-sm text-slate-400">Tools, not labels.</p></div><div><p className="font-black text-[#ff7fd1]">Your privacy matters</p><p className="text-sm text-slate-400">No partner gets your private reflection.</p></div></div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-3 lg:px-12">
      <Link href="/institutions" className="rounded-[1.5rem] border border-white/10 bg-white/[.035] p-6 transition hover:border-[#ff5ac8]/40"><p className="text-xs font-black uppercase tracking-[.18em] text-[#ff75cf]">For schools</p><h3 className="mt-2 text-2xl font-black">Stronger students. Brighter futures.</h3><p className="mt-2 text-sm text-slate-400">Human-centered reflection and support pathways for learning communities.</p></Link>
      <Link href="/for-adults" className="rounded-[1.5rem] border border-white/10 bg-white/[.035] p-6 transition hover:border-[#ff5ac8]/40"><p className="text-xs font-black uppercase tracking-[.18em] text-[#ff75cf]">For families</p><h3 className="mt-2 text-2xl font-black">Real support. Real connection.</h3><p className="mt-2 text-sm text-slate-400">Parenting and family tools that preserve the young person’s voice and control.</p></Link>
      <Link href="/partners/channels" className="rounded-[1.5rem] border border-white/10 bg-white/[.035] p-6 transition hover:border-[#ff5ac8]/40"><p className="text-xs font-black uppercase tracking-[.18em] text-[#ff75cf]">For communities</p><h3 className="mt-2 text-2xl font-black">Real people. Real impact.</h3><p className="mt-2 text-sm text-slate-400">Community, faith, sponsored-access, and partner pathways designed around trust.</p></Link>
    </section>
  </main>
}
