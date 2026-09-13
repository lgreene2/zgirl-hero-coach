import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Professional Support | Z-Girl",
  description: "A governed pathway connecting qualified human professionals with Z-Girl training, credentialing, and participant-controlled support handoffs.",
};

const pathway = [
  ["1", "Verify", "Confirm identity and applicable independent professional qualification."],
  ["2", "Learn", "Complete role-specific Z-Girl human-first, privacy, safeguarding, AI-boundary, and handoff training."],
  ["3", "Demonstrate", "Pass knowledge checks and a scenario-based competency practicum."],
  ["4", "Authorize", "Receive Z-Girl program authorization only after the required operational approval gates."],
  ["5", "Support", "Receive participant-initiated, minimum-necessary handoffs inside the governed professional workspace."],
  ["6", "Renew", "Maintain qualification, calibration, policy learning, and Z-Girl credential status."],
];

const modules = [
  "Human-first doctrine and role boundaries",
  "Participant-controlled reflection and handoff",
  "Privacy and clinical-record separation",
  "Youth, guardian, institutional, and safeguarding boundaries",
  "AI limitations, transparency, and appropriate reliance",
  "Crisis and emergency escalation boundaries",
  "Receiving participant-generated conversation briefs",
  "Consent withdrawal and minimum-necessary sharing",
];

export default function ProfessionalSupportPage() {
  return (
    <main className="min-h-screen bg-[#04151c] text-white">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <p className="text-sm font-black uppercase tracking-[.28em] text-[#64dfd0]">Human professional support</p>
        <h1 className="mt-5 max-w-5xl font-display text-5xl font-black leading-[.96] tracking-[-.045em] sm:text-7xl">
          Z-Girl prepares the conversation. Qualified people provide the professional care.
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
          Extend Z-Girl into counseling, school support, social work, psychology, and other approved professional settings without turning AI into the provider. Participants remain in control of what they share and with whom.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/institutions/train-the-trainer" className="rounded-full bg-[#49d8c2] px-6 py-3 font-black text-[#04151c]">Explore training pathway</Link>
          <Link href="/credentials/verify" className="rounded-full border border-[#49d8c2]/50 px-6 py-3 font-bold text-[#8af0e3]">Verify a credential</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {pathway.map(([n, title, body]) => (
            <article key={n} className="rounded-[2rem] border border-[#49d8c2]/20 bg-[#0a202b] p-7">
              <div className="text-sm font-black text-[#ff4bb5]">{n.padStart(2, "0")}</div>
              <h2 className="mt-3 text-2xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-slate-300">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-white/10 bg-[#0a202b] p-8">
          <p className="text-sm font-black uppercase tracking-[.24em] text-[#64dfd0]">Professional specialization</p>
          <h2 className="mt-4 text-4xl font-black">Z-Girl Professional Support Certified User</h2>
          <p className="mt-5 leading-8 text-slate-300">A Z-Girl product-competency specialization for independently qualified professionals. The professional qualification and the Z-Girl credential are verified and displayed as separate records.</p>
          <div className="mt-7 rounded-2xl border border-amber-300/25 bg-amber-200/5 p-5 text-sm leading-6 text-amber-100">
            Z-Girl authorization is a program credential—not professional licensure, clinical qualification, academic accreditation, or government certification.
          </div>
        </article>
        <article className="rounded-[2rem] border border-white/10 bg-[#0a202b] p-8">
          <p className="text-sm font-black uppercase tracking-[.24em] text-[#ff4bb5]">Required learning</p>
          <h2 className="mt-4 text-4xl font-black">Built for responsible handoff.</h2>
          <ul className="mt-6 space-y-3 text-slate-300">
            {modules.map((item) => <li key={item} className="flex gap-3"><span className="font-black text-[#49d8c2]">✓</span><span>{item}</span></li>)}
          </ul>
        </article>
      </section>

      <section className="border-y border-white/10 bg-[#071b25]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-sm font-black uppercase tracking-[.24em] text-[#64dfd0]">Participant-controlled handoff</p>
          <h2 className="mt-4 max-w-4xl text-4xl font-black">Reflect → Prepare → Choose what to share → Choose a person → Consent → Human support</h2>
          <p className="mt-5 max-w-3xl leading-8 text-slate-300">Credentialing never unlocks a participant's private journal by default. A professional receives only the participant-authorized handoff content permitted by the governed workflow.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-black uppercase tracking-[.24em] text-[#64dfd0]">Commercial pathway</p>
        <h2 className="mt-4 text-4xl font-black">One ecosystem. Multiple recurring-value layers.</h2>
        <p className="mt-5 max-w-4xl leading-8 text-slate-300">Training, competency assessment, credential administration, professional workspace access, institutional implementation, continuing Z-Girl education, renewal, and approved Train-the-Trainer expansion can operate as governed product layers. Public credential activation and paid launch remain owner-gated.</p>
      </section>
    </main>
  );
}
