import Link from "next/link";

export default function SafetyPage() {
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
            Safety &amp; Use Guidelines
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Z-Girl: Hero Coach is designed to be a gentle, supportive space for
            kids and teens to reflect, de-stress, and practice simple “hero
            moves” for everyday life. This page explains what the app is, what it
            is not, and how we encourage it to be used safely.
          </p>
        </header>

        {/* What Z-Girl Is */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            What Z-Girl Is
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>
              A <span className="font-semibold">fictional hero coach</span> based
              on the world of{" "}
              <span className="font-semibold">The 4 Lessons</span>.
            </li>
            <li>
              A friendly, kid-appropriate guide who helps users think through
              feelings, stress, and everyday challenges.
            </li>
            <li>
              A space to practice simple coping skills like breathing,
              grounding, positive self-talk, and choosing small “hero moves.”
            </li>
            <li>
              Designed primarily for young people roughly{" "}
              <span className="font-semibold">ages 10–16</span>, and for caring
              adults who want to explore the experience themselves.
            </li>
            <li>
              If you’re under 10, we recommend using Z-Girl with a parent,
              caregiver, or trusted adult nearby.
            </li>
          </ul>
        </section>

        {/* What Z-Girl Is NOT */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            What Z-Girl Is Not
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>
              Not a doctor, therapist, counselor, or lawyer, and{" "}
              <span className="font-semibold">not a replacement</span> for
              professional care.
            </li>
            <li>
              Not an emergency or crisis service. Z-Girl cannot contact help,
              call anyone, or intervene in real-life situations.
            </li>
            <li>
              Not a place to receive medical advice, diagnoses, medication
              guidance, or legal instructions.
            </li>
            <li>
              Not a promise of privacy in unsafe situations. When users talk
              about serious harm, Z-Girl encourages them to involve a{" "}
              <span className="font-semibold">trusted adult</span>.
            </li>
          </ul>
        </section>

        {/* How Z-Girl Responds */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            How Z-Girl Responds to Difficult Topics
          </h2>

          <p className="text-sm text-slate-300">
            Sometimes the app may show a short “safety check-in” note (for
            example, an amber or rose banner) when a message might involve
            safety risk. This is meant to keep responses calm and careful and to
            encourage reaching out to trusted adults when needed.
          </p>

          <p className="text-sm text-slate-300">
            Z-Girl is designed to respond gently and thoughtfully when users
            bring up serious or frightening situations, including:
          </p>

          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>Self-harm, suicide, or wanting to die</li>
            <li>Serious thoughts about hurting someone else</li>
            <li>
              Abuse, assault, or feeling unsafe at home, school, or online
            </li>
          </ul>

          <p className="text-sm text-slate-300">In these moments, Z-Girl:</p>

          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>Uses a calm, caring tone and validates the user’s feelings.</li>
            <li>
              Clearly explains that she is{" "}
              <span className="font-semibold">
                a digital hero coach, not an emergency service
              </span>
              .
            </li>
            <li>
              Encourages the user to talk to a{" "}
              <span className="font-semibold">trusted adult</span> such as a
              parent or caregiver, school counselor, teacher, coach, or another
              safe person in their life.
            </li>
            <li>
              If there seems to be immediate danger, encourages contacting
              local emergency services (for example,{" "}
              <span className="font-semibold">911 in the United States</span>) or
              a local crisis hotline.
            </li>
          </ul>
        </section>

        {/* Parents & Educators */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Guidance for Parents &amp; Educators
          </h2>
          <p className="text-sm text-slate-300">
            We encourage parents, caregivers, and educators to think of Z-Girl
            as a{" "}
            <span className="font-semibold">
              conversation starter and reflection tool
            </span>
            , not a standalone solution.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>
              Try the app yourself first to understand how Z-Girl communicates
              and what she focuses on.
            </li>
            <li>
              Invite young people to share how they feel after using the app
              and what “hero moves” they want support with.
            </li>
            <li>
              Reinforce that it’s always okay — and encouraged — to ask for
              help in real life.
            </li>
            <li>
              For school or program use, Z-Girl can complement SEL lessons,
              journaling, or small-group discussions.
            </li>
          </ul>
        </section>

        {/* Privacy */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Privacy &amp; Data Behavior
          </h2>
          <p className="text-sm text-slate-300">
            This early version of Z-Girl: Hero Coach does not use logins or
            accounts. Conversations are stored locally in the browser so users
            can revisit past chats and saved “Hero Moments.”
          </p>
          <p className="text-sm text-slate-300">
            This means your chat history stays on your device or browser — not
            in an online account for this app.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>
              Clearing the chat inside the app removes the visible conversation
              from that device.
            </li>
            <li>
              Clearing browser data or using private/incognito mode may remove
              stored conversations.
            </li>
            <li>
              As the app evolves, more detailed privacy information may be added
              here or on a separate policy page.
            </li>
          </ul>
        </section>

        {/* When in Doubt */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            When in Doubt, Reach Out
          </h2>
          <p className="text-sm text-slate-300">
            Z-Girl is here to help users feel seen, supported, and a little more
            hopeful — but real-life heroes are essential too. If you are
            concerned about a young person, please connect them with a trusted
            adult, school support, or professional help in your community.
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Ready to return to the app?{" "}
            <Link
              href="/"
              className="text-sky-300 hover:text-sky-200 underline underline-offset-2"
            >
              Go back to Z-Girl: Hero Coach
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
