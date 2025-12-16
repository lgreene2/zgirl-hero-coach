import Link from "next/link";

export default function ForAdultsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl shadow-cyan-500/10 px-6 py-6 md:px-10 md:py-8 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-xs text-slate-400">
            <Link
              href="/"
              className="hover:text-slate-100 underline underline-offset-2"
            >
              ← Back to Z-Girl: Hero Coach
            </Link>
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
            Parent &amp; Educator Guide
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Z-Girl: Hero Coach is a gentle reflection and encouragement tool for
            youth. This page helps adults understand how to use the app safely,
            what to expect, and how to support young people after a session.
          </p>

          <div className="mt-3 rounded-2xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
            <div className="font-semibold text-sky-100">Quick note</div>
            <div className="mt-1 text-sky-100/90">
              Z-Girl is a <span className="font-semibold">digital hero coach</span>{" "}
              (not therapy, not medical care, not emergency services). If a child
              is in danger or you suspect self-harm, contact local emergency
              services and/or a qualified professional immediately.
            </div>
          </div>
        </header>

        {/* What this app is */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            What Z-Girl Is (and Is Not)
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>
              <span className="font-semibold">Is:</span> a kid-friendly coach
              that helps youth name feelings, de-stress, and choose one small
              “hero move.”
            </li>
            <li>
              <span className="font-semibold">Is:</span> a conversation starter
              that can support SEL, journaling, mentoring, and youth programs.
            </li>
            <li>
              <span className="font-semibold">Is not:</span> a therapist,
              counselor, doctor, lawyer, or crisis hotline.
            </li>
            <li>
              <span className="font-semibold">Is not:</span> a substitute for
              adult supervision, professional care, or emergency help.
            </li>
          </ul>
        </section>

        {/* Recommended ages */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Recommended Ages
          </h2>
          <p className="text-sm text-slate-300">
            Z-Girl is designed primarily for ages{" "}
            <span className="font-semibold">10–16</span>. Younger children can
            still benefit, but we recommend using the app{" "}
            <span className="font-semibold">with a parent/caregiver nearby</span>{" "}
            to help them process emotions and put “hero moves” into practice.
          </p>
        </section>

        {/* What the safety banners mean */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            What the Safety Banners Mean
          </h2>
          <p className="text-sm text-slate-300">
            Sometimes the app may show a short “safety check-in” banner (for
            example, amber or rose). This happens when a message could involve
            safety risk. It’s designed to keep responses calm and careful and to
            encourage reaching out to trusted adults.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <div className="font-semibold">Amber (caution)</div>
              <div className="mt-1 text-amber-100/90">
                The message may be sensitive or risky. Z-Girl will keep guidance
                gentle and encourage support from trusted adults if needed.
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <div className="font-semibold">Rose (safety check-in)</div>
              <div className="mt-1 text-rose-100/90">
                The message may suggest serious risk (self-harm, violence, or
                unsafe situations). Z-Girl will focus on immediate support and
                adult involvement. If urgent, call emergency services.
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Z-Girl may also offer a “Why did Z-Girl say this?” link for
            transparency.
          </p>
        </section>

        {/* How adults can use it */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Best Ways to Use Z-Girl with Youth
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>
              Try the app yourself first to understand tone, boundaries, and
              “hero moves.”
            </li>
            <li>
              Invite youth to share{" "}
              <span className="font-semibold">one takeaway</span> and{" "}
              <span className="font-semibold">one hero move</span> they want to
              try.
            </li>
            <li>
              Keep it low-pressure: “You don’t have to tell me everything. I’m
              here if you want support.”
            </li>
            <li>
              Encourage follow-through: help them do the hero move (breathing,
              a short plan, a check-in with a teacher, journaling, etc.).
            </li>
            <li>
              For classrooms/programs: pair with SEL prompts, journaling, or
              small-group reflection.
            </li>
          </ul>
        </section>

        {/* Suggested adult follow-up questions */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Helpful Follow-Up Questions (Adult Script)
          </h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
              <li>“What’s one thing Z-Girl said that felt helpful?”</li>
              <li>“What feeling did you notice most today?”</li>
              <li>“What’s your one small hero move for the next hour?”</li>
              <li>“Would you like me to help you do that hero move?”</li>
              <li>
                “Do you want help talking to a teacher, counselor, or another
                trusted adult?”
              </li>
            </ul>
          </div>
        </section>

        {/* Privacy and device guidance */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Privacy &amp; Device Notes
          </h2>
          <p className="text-sm text-slate-300">
            This early version does not use accounts. Chat history is stored{" "}
            <span className="font-semibold">locally in the browser</span> so the
            user can revisit past chats and saved “Hero Moments.”
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>
              Clearing chat inside the app removes the visible conversation from
              that device.
            </li>
            <li>
              Clearing browser data or using private/incognito mode may remove
              stored conversations.
            </li>
            <li>
              If you share a device, consider clearing chat after use or using a
              separate profile.
            </li>
          </ul>
        </section>

        {/* When to escalate */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            When to Escalate (Adult Safety Checklist)
          </h2>
          <p className="text-sm text-slate-300">
            If a young person mentions self-harm, suicide, abuse, assault, or
            being unsafe, treat it as serious. Consider these steps:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>
              Stay calm and present: “I’m here with you. You’re not in trouble.”
            </li>
            <li>
              Ensure immediate safety. If urgent in the U.S., call{" "}
              <span className="font-semibold">911</span> (or your local emergency
              number).
            </li>
            <li>
              Contact appropriate supports (school counselor, clinician,
              crisis line, or local services).
            </li>
            <li>
              Don’t rely on the app for crisis support. Use the app only as a
              supplement to real-world help.
            </li>
          </ul>
        </section>

        {/* Links */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">More Info</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/safety"
              className="text-sky-300 hover:text-sky-200 underline underline-offset-2"
            >
              Safety &amp; Use Guidelines
            </Link>
            <Link
              href="/hero"
              className="text-sky-300 hover:text-sky-200 underline underline-offset-2"
            >
              About Z-Girl
            </Link>
            <Link
              href="/"
              className="text-sky-300 hover:text-sky-200 underline underline-offset-2"
            >
              Back to the app
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Want a one-page summary for schools or partners? We can package this
            guidance into a printable PDF.
          </p>
        </footer>
      </div>
    </main>
  );
}
