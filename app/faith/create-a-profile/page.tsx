import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import CommerceLeadForm from "@/components/CommerceLeadForm";

export const metadata: Metadata = {
  title: "Create a Faith Profile",
  description:
    "Submit approved values, references, practices, accessibility needs, and governance boundaries for a Z-Girl faith profile.",
};

const profileInputs = [
  "Faith tradition or denomination",
  "Age range and intended setting",
  "Approved values, virtues, and themes",
  "Approved sacred-text or curriculum references",
  "Prayer, contemplation, or closing preferences",
  "Language, claims, and topics to avoid",
  "Approving leader or content owner",
  "Accessibility and communication needs",
];

export default function FaithProfileIntakePage() {
  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <Link href="/faith" className="text-sm font-bold text-slate-400 transition hover:text-white">← Faith &amp; Values Hub</Link>

        <div className="mt-7 max-w-4xl">
          <div className="flex flex-wrap gap-2">
            <span className="eyebrow">Structured onboarding</span>
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.15em] text-amber-100">No meeting required to begin</span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-black leading-tight tracking-[-.035em] sm:text-5xl">Create a Z-Girl Faith Profile</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            Submit the language, values, references, optional practices, boundaries, and approving role your family or organization already uses. The first profiles are assembled manually so the content and governance remain clear.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {profileInputs.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm font-bold leading-6 text-slate-200">
              <span className="mr-2 text-amber-200">✓</span>{item}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm leading-7 text-slate-300">
          <strong className="text-white">Content ownership:</strong> Do not submit copyrighted full-text materials unless you own them or have permission to provide them. References, original summaries, locally written prayers, approved terminology, and links to authorized source material are preferred.
        </div>

        <div className="mt-8">
          <CommerceLeadForm
            leadType="faith-profile"
            defaultOffer="congregation-annual-license"
            heading="Begin the faith-profile intake."
            intro="Use the message field to describe the tradition, setting, approved references, optional practices, content boundaries, approving role, and accessibility needs. Do not include private information about youth or safeguarding incidents."
            submitLabel="Send faith-profile intake"
          />
        </div>
      </div>
    </main>
  );
}
