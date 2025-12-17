import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-100">
      <h1 className="text-3xl font-bold">Contact Z-Girl Initiative</h1>

      <p className="mt-4 text-slate-300">
        We welcome inquiries from educators, schools, districts, nonprofit
        partners, and sponsors interested in learning more about the Z-Girl
        pilot program.
      </p>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold">General Inquiries</h2>
        <p className="mt-2 text-slate-300">
          For pilot participation, sponsorship opportunities, or general
          questions, please contact:
        </p>

        <p className="mt-4 text-slate-200 font-medium">
          📧 <a
            href="mailto:info@zgirlinitiative.org"
            className="text-cyan-400 hover:underline"
          >
            info@zgirlinitiative.org
          </a>
        </p>
      </section>

      <section className="mt-8 text-sm text-slate-400">
        <p>
          Z-Girl is a supportive digital coach for reflection and encouragement.
          It does not provide therapy, diagnosis, or emergency services.
        </p>
      </section>

      <div className="mt-10">
        <Link
          href="/"
          className="text-sm text-cyan-400 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
