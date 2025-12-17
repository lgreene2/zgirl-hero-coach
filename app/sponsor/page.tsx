import Link from "next/link";

export default function SponsorPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-semibold">Sponsor a School</h1>
        <p className="mt-4 text-lg text-slate-300">
          School sponsorships fund access to Z-Girl pilots—without ads, student
          subscriptions, or data monetization.
        </p>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["What Sponsors Support", "Student access, educator onboarding, and pilot reporting."],
            ["What Sponsors Do Not Get", "No branding inside the student experience. No data resale."],
            ["Impact Reporting", "Aggregate, privacy-respecting summaries focused on implementation."]
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-slate-300">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-xl font-semibold">How to Start</h2>
          <ol className="mt-3 space-y-2 text-slate-300">
            <li>1) Identify a school or district</li>
            <li>2) Confirm pilot scope (30–60 days)</li>
            <li>3) Launch with educator support</li>
          </ol>
        </section>

        <div className="mt-10 flex gap-3">
          <Link href="/contact" className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">
            Start a Conversation
          </Link>
          <Link href="/pilot" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-900">
            View Pilot Overview
          </Link>
        </div>
      </div>
    </main>
  );
}
