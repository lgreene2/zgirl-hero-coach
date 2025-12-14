// app/hero/page.tsx
import Link from "next/link";
import FooterCtas from "./FooterCtas";

export const metadata = {
  title: "Z-Girl Hero Coach · Hero Info",
  description:
    "Learn more about Z-Girl, the digital hero coach helping youth build calm, confidence, and inner strength.",
};

export default function HeroPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-10 md:px-8 lg:py-16">
        {/* Hero banner */}
        <section className="flex flex-col-reverse items-center gap-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-8 shadow-[0_0_35px_rgba(56,189,248,0.3)] md:flex-row md:gap-10 md:px-10 md:py-10">
          {/* Text side */}
          <div className="w-full space-y-4 md:w-3/5">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Hero Coach for Youth · Ages 10–16
            </p>

            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              Meet{" "}
              <span className="text-sky-300">
                Z-Girl, Your Hero Coach
              </span>
            </h1>

            <p className="text-sm text-slate-200 md:text-base">
              Z-Girl is a gentle, fictional hero coach from{" "}
              <span className="font-semibold text-slate-50">
                The 4 Lessons®
              </span>{" "}
              universe. She helps young people talk about stress, big feelings,
              and everyday challenges while learning simple tools to{" "}
              <span className="font-semibold text-sky-300">
                unwrap the hero within.
              </span>
            </p>

            <div className="space-y-2 text-xs text-slate-300 md:text-sm">
              <p className="font-semibold text-slate-100">
                Z-Girl can help with:
              </p>
              <ul className="grid grid-cols-1 gap-x-4 gap-y-1 text-[11px] md:grid-cols-2 md:text-sm">
                <li>• School stress and test anxiety</li>
                <li>• Friend drama and social tension</li>
                <li>• Feeling sad, worried, or overwhelmed</li>
                <li>• Building confidence and self-talk</li>
                <li>• Calming down after big emotions</li>
                <li>• Planning tiny “hero moves” in real life</li>
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-400/40 transition hover:bg-sky-300 active:bg-sky-500 md:text-sm"
              >
                Start a Session with Z-Girl
              </Link>
              <Link
                href="/?chat=1"
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-[11px] font-semibold text-slate-100 hover:border-sky-400 hover:text-sky-200 md:text-xs"
              >
                Back to Chat
              </Link>
              <a
                href="#about"
                className="text-[11px] text-slate-300 underline underline-offset-4 hover:text-slate-100 md:text-xs"
              >
                Learn how the hero coach works ↓
              </a>
            </div>
          </div>

          {/* Image side */}
          <div className="relative w-40 shrink-0 sm:w-48 md:w-56">
            <div className="absolute inset-0 rounded-full bg-sky-400/25 blur-3xl" />
            <div className="relative overflow-hidden rounded-full border border-slate-700 bg-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.6)]">
              <img
                src="/icons/zgirl-icon-1024.png"
                alt="Z-Girl Hero Coach"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* How it works + safety */}
        <section
          id="about"
          className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
        >
          {/* How it works */}
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-5 md:px-7 md:py-7">
            <h2 className="text-lg font-semibold text-slate-50 md:text-xl">
              How the Hero Coach Works
            </h2>
            <p className="text-xs text-slate-300 md:text-sm">
              Z-Girl talks with youth in a calm, clear, and encouraging way.
              She&apos;s like a big sister or mentor who helps them slow down,
              name what they&apos;re feeling, and practice simple coping
              skills.
            </p>
            <ul className="space-y-2 text-[11px] text-slate-200 md:text-sm">
              <li>
                <span className="font-semibold text-sky-300">
                  🧠 Reflective conversation:
                </span>{" "}
                youth can share what&apos;s going on, vent, or ask questions
                about their feelings.
              </li>
              <li>
                <span className="font-semibold text-sky-300">
                  🌬 Calm-down tools:
                </span>{" "}
                guided breathing, grounding, and small regulation exercises
                (like the fullscreen Hero Breathing Flow).
              </li>
              <li>
                <span className="font-semibold text-sky-300">
                  ⭐ “Hero moves”:
                </span>{" "}
                Z-Girl helps students choose tiny, realistic next steps instead
                of big, overwhelming changes.
              </li>
              <li>
                <span className="font-semibold text-sky-300">
                  🎥 Creative scripts:
                </span>{" "}
                students can turn a conversation into a short “hero video
                script” for class projects, reels, or reflection.
              </li>
            </ul>
          </div>

          {/* Safety card */}
          <div className="space-y-3 rounded-3xl border border-amber-500/60 bg-amber-500/5 px-5 py-5 md:px-7 md:py-7">
            <h2 className="text-lg font-semibold text-amber-100 md:text-xl">
              Safety · What Z-Girl Can & Can&apos;t Do
            </h2>
            <p className="text-[11px] text-amber-50/90 md:text-sm">
              Z-Girl is a{" "}
              <span className="font-semibold">fictional hero coach</span> for
              learning, encouragement, and reflection. She is{" "}
              <span className="font-semibold">not</span> a doctor, therapist, or
              emergency service.
            </p>
            <ul className="space-y-1.5 text-[11px] text-amber-50 md:text-sm">
              <li>✔ No medical, diagnostic, or medication advice</li>
              <li>✔ No legal or emergency instructions</li>
              <li>✔ No promises to keep someone completely safe</li>
              <li>✔ Always encourages youth to talk to trusted adults</li>
            </ul>
            <p className="text-[11px] text-amber-100/90 md:text-xs">
              If someone is in immediate danger or talking about self-harm,
              Z-Girl gently reminds them to reach out to a parent, caregiver,
              school counselor, or to contact local emergency services or
              crisis support right away.
            </p>
            <div className="pt-1">
              <Link
                href="/safety"
                className="text-[11px] font-semibold text-amber-200 underline underline-offset-4 hover:text-amber-100"
              >
                Read full Safety &amp; Use Guidelines →
              </Link>
            </div>
          </div>
        </section>

        {/* For parents & schools */}
        <section className="grid gap-8 md:grid-cols-2">
          {/* Parents */}
          <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/90 px-5 py-5 md:px-7 md:py-7">
            <h2 className="text-lg font-semibold text-slate-50 md:text-xl">
              For Parents &amp; Caregivers
            </h2>
            <p className="text-xs text-slate-300 md:text-sm">
              Z-Girl is designed to be a calm, judgment-free space for your
              child to explore feelings and practice healthy coping skills.
              It&apos;s a conversation starter, not a replacement for your love,
              guidance, or professional care.
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-200 md:text-sm">
              <li>• Helps kids find words for what they feel</li>
              <li>• Teaches simple breathing and grounding tools</li>
              <li>• Normalizes asking for help from trusted adults</li>
              <li>• Gives you a gentle way to start hard conversations</li>
            </ul>
          </div>

          {/* Schools */}
          <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/90 px-5 py-5 md:px-7 md:py-7">
            <h2 className="text-lg font-semibold text-slate-50 md:text-xl">
              For Schools &amp; Youth Programs
            </h2>
            <p className="text-xs text-slate-300 md:text-sm">
              Z-Girl supports Social-Emotional Learning (SEL) by reinforcing
              reflection, self-management, and healthy problem-solving in a way
              that feels natural to youth.
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-200 md:text-sm">
              <li>• Works alongside SEL lessons and calm corners</li>
              <li>• Great for advisory, reset rooms, and reflection time</li>
              <li>• No student accounts, logins, or data collection</li>
              <li>• Built with youth-friendly, culturally aware language</li>
            </ul>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="rounded-3xl border border-slate-800 bg-slate-950/90 px-5 py-6 md:px-7 md:py-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-50 md:text-xl">
                Start Your Hero Journey
              </h2>
              <p className="mt-1 text-[11px] text-slate-300 md:text-sm">
                Z-Girl is part of{" "}
                <span className="font-semibold text-slate-100">
                  The 4 Lessons®
                </span>{" "}
                universe, created by Lyndon Greene and People United
                Foundation. Together, we&apos;re helping young people discover
                their courage, calm, and inner leader.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 md:pt-0">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-sky-400/40 transition hover:bg-sky-300 active:bg-sky-500 md:text-sm"
              >
                Open Z-Girl Hero Coach App
              </Link>

              <FooterCtas />
            </div>
          </div>
          <p className="mt-3 text-[10px] text-slate-500">
            Z-Girl and The 4 Lessons® are fictional works used to support youth
            empowerment, education, and social-emotional learning. This page is
            informational and not a source of clinical or emergency care.
          </p>
        </section>
      </main>
    </div>
  );
}
