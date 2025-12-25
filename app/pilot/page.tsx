"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PilotPage() {
  const router = useRouter();

  // ✅ Replace useSearchParams() with a safe client-side read of the query string
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Runs client-side only
    const sp = new URLSearchParams(window.location.search);
    setSubmitted(sp.get("submitted") === "1");
  }, []);

  const [nameRoleOrg, setNameRoleOrg] = useState("");
  const [pilotDetails, setPilotDetails] = useState("");

  // ✅ NEW: District Pilot Overview (primary) — expects these files in /public/pilot
  // Make sure filenames match exactly.
  const DISTRICT_PNG = "/pilot/Z-Girl_District_Pilot_Overview.png";
  const DISTRICT_PDF = "/pilot/Z-Girl_District_Pilot_Overview.pdf";

  // ✅ Existing supporting docs (keep as-is so you don’t break old links)
  const VISUAL_ONEPAGER_PDF = "/Z-Girl_Visual_One-Pager_v1.1.pdf";
  const PILOT_30DAY_PDF = "/Z-Girl_30-Day_Pilot_Overview_v1.1_VISUAL.pdf";

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Z-Girl District Pilot Interest");
    const body = encodeURIComponent(
      `Hello,\n\nI’m interested in a Z-Girl District Pilot.\n\nName/Role/Organization:\n${nameRoleOrg}\n\nPilot details (grade level / group / setting):\n${pilotDetails}\n\nThank you.`
    );
    // Keep your current inbox
    return `mailto:info@zgirlinitiative.org?subject=${subject}&body=${body}`;
  }, [nameRoleOrg, pilotDetails]);

  function handleSubmit() {
    // Mark submitted for the thank-you state (no backend required)
    setSubmitted(true);
    router.replace("/pilot?submitted=1");
    // Open email draft
    window.location.href = mailtoHref;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-6 rounded-3xl bg-slate-900/80 border border-slate-800 px-6 py-8 shadow-xl">
        <header className="space-y-2">
          <p className="text-xs text-slate-400">
            <Link
              href="/"
              className="underline underline-offset-2 hover:text-slate-100"
            >
              ← Back to Z-Girl
            </Link>
          </p>

          <h1 className="text-2xl md:text-3xl font-bold">Z-Girl 30-Day Pilot</h1>

          <p className="text-sm text-slate-300">
            A low-risk, safety-first pilot for schools and youth organizations exploring a youth-friendly SEL reflection tool.
          </p>
        </header>

        <section className="rounded-2xl bg-sky-500/10 border border-sky-500/30 p-4 space-y-2">
          <h2 className="font-semibold">Safety &amp; Boundaries</h2>
          <p className="text-sm text-slate-200">
            Z-Girl is not therapy, not medical care, and not emergency support. Messages are screened for safety risk,
            and sensitive topics encourage trusted-adult involvement.
          </p>
        </section>

        {/* ✅ UPDATED: Primary + Supporting Downloads */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Pilot Materials</h2>

          {/* Primary: District Pilot Overview */}
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-slate-100">
                  District Pilot Overview (Primary)
                </div>
                <div className="text-sm text-slate-200">
                  Recommended for district leaders, principals, and funders.
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={DISTRICT_PDF}
                  download
                  className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-4 py-2 text-slate-950 font-semibold hover:bg-sky-300 transition"
                >
                  Download PDF
                </a>
                <a
                  href={DISTRICT_PDF}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2 text-slate-100 hover:bg-white/5 transition"
                >
                  Open
                </a>
              </div>
            </div>
          </div>

          {/* Embedded preview image */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DISTRICT_PNG}
              alt="Z-Girl District Pilot Overview"
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* Supporting downloads (keep existing PDFs available) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="font-semibold text-slate-100">Supporting downloads</div>
            <p className="mt-1 text-sm text-slate-300">
              Use these if someone wants a quick visual summary or the operational pilot timeline.
            </p>

            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a
                href={VISUAL_ONEPAGER_PDF}
                className="underline underline-offset-2 text-sky-300 hover:text-sky-200"
              >
                ⬇ Visual One-Pager (PDF) — quick overview
              </a>

              <a
                href={PILOT_30DAY_PDF}
                className="underline underline-offset-2 text-sky-300 hover:text-sky-200"
              >
                ⬇ 30-Day Pilot Overview (PDF) — timeline &amp; structure
              </a>
            </div>
          </div>
        </section>

        <section id="interest" className="space-y-3">
          <h2 className="text-lg font-semibold">Pilot Interest (2 Questions)</h2>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="font-semibold text-emerald-200">Thanks — request received.</div>
              <p className="mt-1 text-sm text-slate-200">
                If your email didn’t open automatically, you can click below to send your request:
              </p>
              <a
                className="mt-3 inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-4 py-2 text-slate-950 font-semibold hover:bg-emerald-300 transition"
                href={mailtoHref}
              >
                Send Pilot Request Email →
              </a>
              <p className="mt-3 text-xs text-slate-400">
                You can also review:{" "}
                <Link href="/for-adults" className="underline underline-offset-2 text-sky-300">
                  Parent &amp; Educator Guide
                </Link>{" "}
                and{" "}
                <Link href="/safety" className="underline underline-offset-2 text-sky-300">
                  Safety &amp; Use Guidelines
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <label className="block space-y-1">
                <span className="text-sm text-slate-200">1) Name, role, and organization</span>
                <input
                  value={nameRoleOrg}
                  onChange={(e) => setNameRoleOrg(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                  placeholder="e.g., Jordan Smith, School Counselor, Example Middle School"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm text-slate-200">
                  2) How would you like to pilot Z-Girl? (grade level, group type, or setting)
                </span>
                <textarea
                  value={pilotDetails}
                  onChange={(e) => setPilotDetails(e.target.value)}
                  className="w-full min-h-[110px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                  placeholder="e.g., 7th grade advisory, 2x/week SEL check-in, ~25 students"
                />
              </label>

              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-2 text-slate-950 font-semibold hover:bg-sky-400 transition"
              >
                Send Pilot Request →
              </button>

              <p className="text-xs text-slate-400">
                By submitting, you acknowledge Z-Girl is not therapy and not emergency services.
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
          <h3 className="text-base font-semibold text-slate-100">
            What happens after the pilot?
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            <li>We confirm your setting (age range, group type, and schedule).</li>
            <li>We share a short orientation and the Parent &amp; Educator Guide.</li>
            <li>You run the pilot for 30 days with light, optional check-ins.</li>
            <li>
              At the end, we review what worked and decide next steps together — no
              obligation.
            </li>
          </ul>
          <p className="text-xs text-slate-400">
            No student accounts required. Z-Girl is not therapy and not emergency
            services.
          </p>
        </section>
      </div>
    </main>
  );
}
