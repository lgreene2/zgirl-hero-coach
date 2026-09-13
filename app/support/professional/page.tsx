import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "Professional Support | Z-Girl",
  description: "Prepare for a conversation with a counselor, therapist, school counselor, or other qualified professional while keeping people in charge of care.",
};

const pathways = [
  {
    eyebrow: "YOUR PROFESSIONAL",
    title: "Connect with someone you already trust.",
    body: "Prepare a participant-controlled brief for your existing counselor, therapist, school counselor, or other qualified professional. You decide what to include and what stays private.",
    cta: "Prepare my conversation",
    href: "/support",
  },
  {
    eyebrow: "TRAINING + CREDENTIALS",
    title: "Use Z-Girl with clear professional boundaries.",
    body: "Qualified professionals can follow the governed Z-Girl training and credential pathway while their independent license and professional authority remain separate.",
    cta: "Explore professional credentialing",
    href: "/professional-support",
  },
  {
    eyebrow: "VIRTUAL SUPPORT",
    title: "Licensed virtual support is the next governed connection layer.",
    body: "A future provider network can help eligible users locate an independently licensed professional based on location, age, service type, availability, and provider eligibility. Z-Girl will not diagnose, prescribe, or select treatment.",
    cta: "Join provider interest list",
    href: "/support/professional/provider",
  },
];

export default function ProfessionalSupportPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <section className="overflow-hidden rounded-[2.2rem] border border-[#49d8c2]/20 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,.18),transparent_32%),linear-gradient(135deg,#0b2030,#071824)] p-7 shadow-2xl shadow-black/20 sm:p-10 lg:p-14">
          <p className="section-kicker">PROFESSIONAL SUPPORT GATEWAY</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-black tracking-tight sm:text-6xl">Reflection can lead to the right human professional.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">Z-Girl helps you reflect, prepare, and communicate. Licensed professionals remain responsible for assessment, diagnosis, treatment, clinical records, mandated reporting, and clinical decisions.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/support" className="button-primary !min-h-0">Prepare for a conversation →</Link><a href="#pathways" className="button-secondary !min-h-0">See support pathways</a></div>
        </section>

        <section className="mt-8 grid gap-4 rounded-[2rem] border border-white/10 bg-[#0b2030]/80 p-6 sm:grid-cols-3 sm:p-8">
          <div><p className="section-kicker">Human first</p><p className="mt-2 text-sm leading-6 text-slate-300">AI can help organize your thoughts. It does not become your therapist or counselor.</p></div>
          <div><p className="section-kicker">Participant controlled</p><p className="mt-2 text-sm leading-6 text-slate-300">Your private reflection is not automatically sent to a professional, school, sponsor, parent, or partner.</p></div>
          <div><p className="section-kicker">Professional authority</p><p className="mt-2 text-sm leading-6 text-slate-300">Credentialing, consent, jurisdiction, clinical care, and emergency responsibilities stay with qualified providers and their organizations.</p></div>
        </section>

        <section id="pathways" className="mt-12">
          <p className="section-kicker">CHOOSE THE NEXT HUMAN STEP</p>
          <h2 className="section-title max-w-4xl">Professional support without turning Z-Girl into an AI therapist.</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">{pathways.map((item) => <article key={item.title} className="flex flex-col rounded-[2rem] border border-white/10 bg-[#0b2030]/90 p-6 shadow-xl shadow-black/10 sm:p-7"><p className="text-[11px] font-black tracking-[.18em] text-[#76ead6]">{item.eyebrow}</p><h3 className="mt-4 font-display text-2xl font-black">{item.title}</h3><p className="mt-4 flex-1 text-sm leading-7 text-slate-300">{item.body}</p><Link href={item.href} className="button-secondary mt-6 !min-h-0">{item.cta} →</Link></article>)}</div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-amber-200/20 bg-amber-200/[.045] p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.18em] text-amber-200">Safety + scope</p>
          <h2 className="mt-3 font-display text-2xl font-black">Z-Girl is not emergency or clinical care.</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">If you may hurt yourself or someone else, or you are in immediate danger, contact local emergency services or a trusted adult now. In the U.S., call or text 988 for the Suicide &amp; Crisis Lifeline. Provider discovery and virtual counseling connections remain gated until credentialing, jurisdiction, consent, privacy, safeguarding, and commercial terms are approved.</p>
        </section>
      </div>
    </main>
  );
}
