import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CommerceLeadForm from "@/components/CommerceLeadForm";

export const metadata = {
  title: "Professional Provider Network | Z-Girl",
  description: "Provider interest pathway for the governed Z-Girl Professional Support Gateway.",
};

export default function ProviderInterestPage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <Link href="/support/professional" className="text-sm font-bold text-[#76ead6]">← Professional Support Gateway</Link>
        <section className="mt-7 rounded-[2rem] border border-white/10 bg-[#0b2030]/90 p-7 sm:p-10">
          <p className="section-kicker">PROVIDER NETWORK · PRE-ACTIVATION</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-black sm:text-5xl">Help build the human professional layer around Z-Girl.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">We are collecting interest from independently licensed professionals, counseling practices, school counseling programs, and qualified virtual-care organizations. This is not an active referral network yet.</p>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[['Credentialing','License and professional standing must be independently verified before activation.'],['Jurisdiction','Connections must respect where the participant and provider are located and authorized to receive/provide care.'],['Consent','Youth, guardian, institutional, and provider consent requirements must be resolved before clinical handoff.'],['Data boundary','Private Z-Girl reflections do not become provider records unless the participant intentionally shares information through an approved flow.']].map(([title,body])=><article key={title} className="rounded-[1.6rem] border border-white/10 bg-white/[.025] p-5"><h2 className="font-black text-[#76ead6]">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{body}</p></article>)}
        </section>

        <section className="mt-8 rounded-[2rem] border border-rose-300/20 bg-rose-300/[.04] p-6 sm:p-8">
          <h2 className="font-display text-2xl font-black">Commercial and clinical independence</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">No provider is paid or ranked for making a diagnosis, selecting treatment, escalating a user, or influencing a participant's clinical decision. Referral compensation, if ever used, must pass legal, ethical, licensure, payer, disclosure, and conflict review before activation. Z-Girl does not practice counseling or medicine.</p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-black uppercase tracking-[.16em] text-[#76ead6]">Step 1</p><h2 className="mt-2 font-black">Express interest</h2><p className="mt-2 text-sm leading-6 text-slate-400">Tell us about your professional role, organization, population, and jurisdiction.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-black uppercase tracking-[.16em] text-[#76ead6]">Step 2</p><h2 className="mt-2 font-black">Verify + train</h2><p className="mt-2 text-sm leading-6 text-slate-400">Professional qualification verification and Z-Girl competency are separate controlled gates.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs font-black uppercase tracking-[.16em] text-[#76ead6]">Step 3</p><h2 className="mt-2 font-black">Activate only when approved</h2><p className="mt-2 text-sm leading-6 text-slate-400">Directory, matching, booking, workspace access, and compensation remain inactive until formally approved.</p></div>
        </section>

        <section id="interest" className="mx-auto mt-10 max-w-5xl"><CommerceLeadForm leadType="founding-partner" heading="Professional provider interest" intro="Tell us about your practice, organization, population, jurisdiction, and the professional-support role you may want to explore. Do not include patient, student, client, or participant health information in this form." submitLabel="Submit provider interest" showOfferSelect={false}/></section>
      </div>
    </main>
  );
}
