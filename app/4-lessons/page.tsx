export default function FourLessonsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-12 flex justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-sky-300">
            The 4 Lessons
          </h1>
          <p className="text-slate-300">
            The 4 Lessons is a youth empowerment framework that helps kids and teens
            build confidence, character, and emotional strength — starting from the inside.
          </p>
        </header>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-emerald-300">Leadership</h2>
            <p className="text-slate-300">
              Learning to lead yourself first — making positive choices, showing integrity,
              and standing up for what’s right even when it’s hard.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-300">Education</h2>
            <p className="text-slate-300">
              Believing in your ability to learn, grow, and ask questions.
              Education is about curiosity, effort, and progress — not perfection.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-300">Attitude</h2>
            <p className="text-slate-300">
              Understanding that mindset matters. Your thoughts and self-talk
              influence how you handle challenges and setbacks.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-300">Personal Development</h2>
            <p className="text-slate-300">
              Building habits that support emotional well-being, confidence,
              and long-term growth — one small step at a time.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-sky-200 mb-2">
            How Z-Girl Fits In
          </h3>
          <p className="text-slate-300">
            Z-Girl is a character from The 4 Lessons universe. She acts as a gentle
            hero coach — helping users reflect, calm big emotions, and practice
            small real-life “hero moves.”
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Z-Girl is not a therapist, doctor, or emergency service. She is here
            to encourage growth, reflection, and confidence.
          </p>
        </section>
      </div>
    </main>
  );
}
