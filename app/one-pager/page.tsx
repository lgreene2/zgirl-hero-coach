import Link from "next/link";

export default function OnePagerPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl shadow-cyan-500/10 px-6 py-6 md:px-10 md:py-8 space-y-6">
        
        {/* Header */}
        <header className="space-y-3">
          <p className="text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-100 underline underline-offset-2">
              ← Back to Z-Girl: Hero Coach
            </Link>
          </p>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
            Z-Girl: Hero Coach
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl">
            A youth-friendly digital hero coach designed to support social-emotional learning,
            reflection, and healthy coping skills — with safety, transparency, and adult involvement
            built in.
          </p>

          <p className="text-xs text-slate-400">
            <span className="font-semibold">Version:</span> Z-Girl v1.1 — Safety &amp; Trust Layer
          </p>
        </header>

        {/* What It Is */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">What Z-Girl Is</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>A fictional, youth-appropriate <span className="font-semibold">hero coach</span> from <span className="font-semibold">The 4 Lessons</span> universe.</li>
            <li>A reflective tool that helps youth name emotions, reduce stress, and choose one small positive action (“hero move”).</li>
            <li>A conversation starter that complements SEL instruction, mentoring, and youth programs.</li>
            <li>Designed primarily for ages <span className="font-semibold">10–16</span>.</li>
          </ul>
        </section>

        {/* What It Is Not */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">What Z-Girl Is Not</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>Not a therapist, counselor, doctor, or lawyer.</li>
            <li>Not a crisis or emergency service.</li>
            <li>Not a replacement for trusted adults or professional support.</li>
          </ul>
        </section>

        {/* Safety */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Built-In Safety &amp; Trust</h2>
          <p className="text-sm text-slate-300">
            Z-Girl includes a dedicated <span className="font-semibold">Safety &amp; Trust Layer</span> designed
            specifically for youth use.
          </p>

          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>Messages are checked for safety risk before responses are generated.</li>
            <li>Higher-risk topics trigger calm “safety check-ins” and encourage trusted-adult involvement.</li>
            <li>Serious safety concerns bypass normal chat responses and provide crisis-appropriate guidance.</li>
            <li>Clear transparency (“Why did Z-Girl say this?”) explains safety decisions in plain language.</li>
          </ul>
        </section>

        {/* SEL Alignment */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">SEL &amp; Educational Alignment</h2>
          <p className="text-sm text-slate-300">
            Z-Girl supports core social-emotional learning practices, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>Emotional awareness and vocabulary</li>
            <li>Self-regulation and calming strategies</li>
            <li>Positive self-talk and confidence building</li>
            <li>Responsible decision-making through small, realistic actions</li>
          </ul>
        </section>

        {/* How Schools & Orgs Use It */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Common Use Cases</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>Classroom SEL warm-ups or reflection stations</li>
            <li>After-school programs and youth mentoring</li>
            <li>Check-ins during stressful periods (testing, transitions, behavior support)</li>
            <li>Supplement to counseling or advisory programs (not a replacement)</li>
          </ul>
        </section>

        {/* Adult Role */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Role of Adults</h2>
          <p className="text-sm text-slate-300">
            Z-Girl is designed to <span className="font-semibold">support adult-youth conversations</span>,
            not replace them.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
            <li>Adults are encouraged to review the app and safety guidance.</li>
            <li>Youth are encouraged to share takeaways and “hero moves.”</li>
            <li>Serious concerns should always be handled by qualified adults or professionals.</li>
          </ul>
        </section>

        {/* Privacy */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Privacy at a Glance</h2>
          <p className="text-sm text-slate-300">
            Z-Girl does not require accounts. Chat history is stored locally in the browser for the
            user’s reference and can be cleared at any time.
          </p>
        </section>

        {/* Links */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Learn More</h2>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/for-adults" className="text-sky-300 hover:text-sky-200 underline underline-offset-2">
              Parent &amp; Educator Guide
            </Link>
            <Link href="/safety" className="text-sky-300 hover:text-sky-200 underline underline-offset-2">
              Safety &amp; Use Guidelines
            </Link>
            <Link href="/hero" className="text-sky-300 hover:text-sky-200 underline underline-offset-2">
              About Z-Girl
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            This one-pager is intended for informational and educational purposes only.
          </p>
        </footer>
      </div>
    </main>
  );
}
