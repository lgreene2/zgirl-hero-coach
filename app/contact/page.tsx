import Link from "next/link";

export default function ContactPage() {
  const email = "info@zgirlinitiative.org";

  const pilotHref =
    "mailto:" +
    email +
    "?subject=" +
    encodeURIComponent("Z-Girl Pilot Interest") +
    "&body=" +
    encodeURIComponent(
      "Hello,\n\nI’m interested in learning more about the Z-Girl pilot.\n\nSchool/District/Organization:\nRole/Title:\nGrades/Age Group:\nPreferred timeframe:\n\nThank you,\n"
    );

  const sponsorHref =
    "mailto:" +
    email +
    "?subject=" +
    encodeURIComponent("Sponsor a School") +
    "&body=" +
    encodeURIComponent(
      "Hello,\n\nI’m interested in sponsoring a Z-Girl pilot for a school.\n\nOrganization:\nContact name/title:\nTarget school/district (if known):\nSponsorship range (if known):\n\nThank you,\n"
    );

  const generalHref =
    "mailto:" +
    email +
    "?subject=" +
    encodeURIComponent("Z-Girl Inquiry") +
    "&body=" +
    encodeURIComponent("Hello,\n\nI have a question about Z-Girl.\n\nThank you,\n");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Contact Z-Girl Initiative</h1>

        <p className="mt-4 text-slate-300">
          We welcome inquiries from educators, schools, districts, nonprofit
          partners, and sponsors interested in the Z-Girl pilot program.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="mt-2 text-slate-300">
            Reach us at{" "}
            <a
              className="text-cyan-400 hover:underline"
              href={`mailto:${email}`}
            >
              {email}
            </a>
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a
              href={pilotHref}
              className="rounded-xl bg-sky-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-sky-400"
            >
              Pilot Interest
            </a>
            <a
              href={sponsorHref}
              className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-400"
            >
              Sponsor a School
            </a>
            <a
              href={generalHref}
              className="rounded-xl border border-slate-700 bg-slate-900/30 px-4 py-3 text-center text-sm font-semibold text-slate-100 hover:bg-slate-900"
            >
              General Question
            </a>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-sm text-slate-200">
            Z-Girl is a supportive digital coach for reflection and
            encouragement. It does not provide therapy, diagnosis, or emergency
            services. If someone is in immediate danger or needs urgent help,
            contact local emergency services or a trusted adult/school support
            team right away.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-slate-400">
          <Link className="hover:text-slate-200" href="/pilot">
            Pilot Overview
          </Link>
          <span aria-hidden="true">•</span>
          <Link className="hover:text-slate-200" href="/sponsor">
            Sponsor a School
          </Link>
          <span aria-hidden="true">•</span>
          <Link className="hover:text-slate-200" href="/safety">
            Safety & Trust
          </Link>
          <span aria-hidden="true">•</span>
          <Link className="hover:text-slate-200" href="/">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
