"use client";

import { useEffect, useMemo, useState } from "react";
import { getDayTranscript, getJourneyTrack } from "@/app/lib/journey";
import {
  REVIEW_CANDIDATE_ID,
  REVIEW_CRITERIA,
  REVIEW_DAYS,
  REVIEW_LANGUAGES,
  REVIEW_SCHEMA_VERSION,
  type ReviewCriterion,
  type ReviewLocale,
} from "@/app/review/config";

type CheckStatus = "Pending" | "Pass" | "Changes Needed";
type ReviewSession = {
  criteria: Record<ReviewCriterion, CheckStatus>;
  notes: string;
  proposedCorrection: string;
  reviewedAt: string;
};
type Reviewer = {
  name: string;
  email: string;
  roleOrganization: string;
  dialectRegion: string;
  fluencyConfirmed: boolean;
  exactCandidateConfirmed: boolean;
  confidentialityConfirmed: boolean;
  signature: string;
  signedDate: string;
};
type LanguageReview = { reviewer: Reviewer; sessions: ReviewSession[] };
type ReviewStore = Record<ReviewLocale, LanguageReview>;

const STORAGE_KEY = `zgirl-native-review-${REVIEW_CANDIDATE_ID}`;

function emptyCriteria(): Record<ReviewCriterion, CheckStatus> {
  return Object.fromEntries(REVIEW_CRITERIA.map(({ key }) => [key, "Pending"])) as Record<ReviewCriterion, CheckStatus>;
}

function emptyLanguageReview(): LanguageReview {
  return {
    reviewer: {
      name: "",
      email: "",
      roleOrganization: "",
      dialectRegion: "",
      fluencyConfirmed: false,
      exactCandidateConfirmed: false,
      confidentialityConfirmed: false,
      signature: "",
      signedDate: "",
    },
    sessions: Array.from({ length: REVIEW_DAYS }, () => ({
      criteria: emptyCriteria(),
      notes: "",
      proposedCorrection: "",
      reviewedAt: "",
    })),
  };
}

function emptyStore(): ReviewStore {
  return Object.fromEntries(
    REVIEW_LANGUAGES.map(({ locale }) => [locale, emptyLanguageReview()])
  ) as ReviewStore;
}

function downloadFile(contents: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function sessionDecision(session: ReviewSession) {
  const values = Object.values(session.criteria);
  if (values.includes("Changes Needed")) return "Changes Needed";
  if (values.every((value) => value === "Pass")) return "Approved";
  return "Not Reviewed";
}

function criteriaProgress(review: LanguageReview) {
  const values = review.sessions.flatMap((session) => Object.values(session.criteria));
  return {
    complete: values.filter((value) => value !== "Pending").length,
    passed: values.filter((value) => value === "Pass").length,
    total: REVIEW_DAYS * REVIEW_CRITERIA.length,
  };
}

export default function ReviewerWorkspace() {
  const [activeLocale, setActiveLocale] = useState<ReviewLocale>("es-US");
  const [activeDay, setActiveDay] = useState(0);
  const [store, setStore] = useState<ReviewStore>(emptyStore);
  const [loaded, setLoaded] = useState(false);
  const [audioProblem, setAudioProblem] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<ReviewStore>;
          setStore((current) => ({ ...current, ...parsed }));
        }
      } catch {
        // A damaged browser draft must not prevent a fresh review.
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Review exports remain available even when browser storage is blocked.
    }
  }, [loaded, store]);

  const review = store[activeLocale];
  const track = getJourneyTrack(activeLocale);
  const day = track.days[activeDay];
  const session = review.sessions[activeDay];
  const transcript = useMemo(
    () => getDayTranscript(track, activeDay),
    [activeDay, track]
  );
  const progress = criteriaProgress(review);
  const readyForSignature = progress.passed === progress.total;
  const reviewerComplete = Boolean(
    review.reviewer.name.trim() &&
      review.reviewer.email.trim() &&
      review.reviewer.dialectRegion.trim() &&
      review.reviewer.fluencyConfirmed &&
      review.reviewer.exactCandidateConfirmed &&
      review.reviewer.confidentialityConfirmed
  );
  const signed = Boolean(
    review.reviewer.signature.trim() === review.reviewer.name.trim() && review.reviewer.signedDate
  );

  function updateReviewer<K extends keyof Reviewer>(key: K, value: Reviewer[K]) {
    setStore((current) => ({
      ...current,
      [activeLocale]: {
        ...current[activeLocale],
        reviewer: { ...current[activeLocale].reviewer, [key]: value },
      },
    }));
  }

  function updateSession(mutator: (current: ReviewSession) => ReviewSession) {
    setStore((current) => ({
      ...current,
      [activeLocale]: {
        ...current[activeLocale],
        sessions: current[activeLocale].sessions.map((item, index) =>
          index === activeDay ? mutator(item) : item
        ),
      },
    }));
  }

  function updateCriterion(key: ReviewCriterion, value: CheckStatus) {
    updateSession((current) => ({
      ...current,
      criteria: { ...current.criteria, [key]: value },
      reviewedAt: new Date().toISOString(),
    }));
  }

  function exportIssueCsv() {
    const rows = [
      ["Candidate ID", "Language", "Locale", "Day", "Session", "Criterion", "Status", "Notes", "Proposed correction", "Reviewed at"],
      ...review.sessions.flatMap((item, index) =>
        REVIEW_CRITERIA.filter(({ key }) => item.criteria[key] === "Changes Needed").map(({ key, label }) => [
          REVIEW_CANDIDATE_ID,
          track.languageEnglish,
          activeLocale,
          index + 1,
          track.days[index].title,
          label,
          item.criteria[key],
          item.notes,
          item.proposedCorrection,
          item.reviewedAt,
        ])
      ),
    ];
    downloadFile(
      rows.map((row) => row.map(csvCell).join(",")).join("\n"),
      `Z-Girl-${activeLocale}-${REVIEW_CANDIDATE_ID}-Issue-Log.csv`,
      "text/csv;charset=utf-8"
    );
    setNotice("Issue log exported. Keep it with the candidate review record.");
  }

  function exportSignedJson() {
    if (!readyForSignature || !reviewerComplete || !signed) {
      setNotice("Complete all 49 checks, reviewer certifications, typed signature, and date before exporting approval.");
      return;
    }

    const record = {
      schemaVersion: REVIEW_SCHEMA_VERSION,
      candidateId: REVIEW_CANDIDATE_ID,
      publicRelease: "Z-Girl Open v2.2 candidate review",
      language: track.languageEnglish,
      locale: activeLocale,
      reviewer: review.reviewer,
      checksExpected: REVIEW_DAYS * REVIEW_CRITERIA.length,
      checksPassed: progress.passed,
      sessions: review.sessions.map((item, index) => ({
        day: index + 1,
        title: track.days[index].title,
        decision: sessionDecision(item),
        criteria: item.criteria,
        notes: item.notes,
        proposedCorrection: item.proposedCorrection,
        reviewedAt: item.reviewedAt,
      })),
      reviewerDisposition: "Approved for product-owner review",
      promotionAuthorized: false,
      exportedAt: new Date().toISOString(),
      notice: "This reviewer record does not publish or promote audio. Product-owner authorization is still required.",
    };
    downloadFile(
      `${JSON.stringify(record, null, 2)}\n`,
      `Z-Girl-${activeLocale}-${REVIEW_CANDIDATE_ID}-Signed-Approval.json`,
      "application/json;charset=utf-8"
    );
    setNotice("Signed approval exported. Product-owner validation is still required before promotion.");
  }

  function clearLanguage() {
    if (!window.confirm(`Clear the ${track.languageEnglish} review draft from this browser?`)) return;
    setStore((current) => ({ ...current, [activeLocale]: emptyLanguageReview() }));
    setActiveDay(0);
    setNotice("Language draft cleared from this browser.");
  }

  async function logout() {
    await fetch("/api/review/session", { method: "DELETE" });
    window.location.assign("/review/login");
  }

  return (
    <main className="min-h-screen bg-[#061521] text-white">
      <header className="border-b border-white/10 bg-[#04111b]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#76ead6]">Confidential · internal review only</p>
            <h1 className="mt-1 font-display text-2xl font-black">Z-Girl native-language approval workspace</h1>
            <p className="mt-1 text-xs text-slate-400">Candidate {REVIEW_CANDIDATE_ID}</p>
          </div>
          <button type="button" onClick={logout} className="button-secondary !min-h-0 !px-4 !py-2 text-sm">End review session</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <section className="rounded-3xl border border-amber-300/25 bg-amber-300/[.07] p-5 text-sm leading-6 text-amber-50">
          <strong>Release boundary:</strong> Candidate audio may not be shared or published. All seven sessions and all 49 checks must pass. A signed export is a reviewer record, not permission to promote the language.
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEW_LANGUAGES.map((language) => {
            const itemProgress = criteriaProgress(store[language.locale]);
            const percent = Math.round((itemProgress.complete / itemProgress.total) * 100);
            return (
              <button
                key={language.locale}
                type="button"
                onClick={() => { setActiveLocale(language.locale); setActiveDay(0); setAudioProblem(""); setNotice(""); }}
                aria-pressed={activeLocale === language.locale}
                className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#49d8c2]/25 ${activeLocale === language.locale ? "border-[#49d8c2]/60 bg-[#49d8c2]/10" : "border-white/10 bg-white/[.025] hover:border-white/25"}`}
              >
                <span className="block font-black">{language.label}</span>
                <span className="mt-1 block text-xs text-slate-400">{language.region} · {percent}% reviewed</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-[#0b2030] p-5">
              <h2 className="font-black">Reviewer identity</h2>
              <div className="mt-4 space-y-3">
                {[
                  ["name", "Full name", "text"],
                  ["email", "Email", "email"],
                  ["roleOrganization", "Role / organization", "text"],
                  ["dialectRegion", "Dialect / region", "text"],
                ].map(([key, label, type]) => (
                  <label key={key} className="block text-xs font-bold text-slate-300">
                    {label}
                    <input
                      type={type}
                      value={String(review.reviewer[key as keyof Reviewer])}
                      onChange={(event) => updateReviewer(key as keyof Reviewer, event.target.value as never)}
                      className="mt-1.5 min-h-10 w-full rounded-xl border border-white/15 bg-[#061521] px-3 text-sm text-white outline-none focus:border-[#49d8c2]"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 space-y-3 text-xs leading-5 text-slate-300">
                {[
                  ["fluencyConfirmed", "I confirm native or professional-level fluency in the named dialect."],
                  ["exactCandidateConfirmed", `I confirm I reviewed candidate ${REVIEW_CANDIDATE_ID}.`],
                  ["confidentialityConfirmed", "I will not redistribute candidate audio or sensitive review files."],
                ].map(([key, label]) => (
                  <label key={key} className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(review.reviewer[key as keyof Reviewer])}
                      onChange={(event) => updateReviewer(key as keyof Reviewer, event.target.checked as never)}
                      className="mt-1 h-4 w-4 accent-[#49d8c2]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#0b2030] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-black">Seven sessions</h2>
                <span className="text-xs font-bold text-[#76ead6]">{progress.complete}/{progress.total}</span>
              </div>
              <div className="mt-4 grid gap-2">
                {track.days.map((item, index) => {
                  const decision = sessionDecision(review.sessions[index]);
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => { setActiveDay(index); setAudioProblem(""); setNotice(""); }}
                      aria-current={activeDay === index ? "step" : undefined}
                      className={`rounded-xl border px-3 py-2.5 text-left text-sm ${activeDay === index ? "border-[#49d8c2]/60 bg-[#49d8c2]/10" : "border-white/10 bg-[#061521]"}`}
                    >
                      <span className="block text-xs text-slate-400">Day {index + 1} · {decision}</span>
                      <span className="mt-0.5 block font-black">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>

          <section className="rounded-[2rem] border border-white/10 bg-[#0b2030] p-5 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">{track.language} · Day {activeDay + 1} of 7</p>
                <h2 className="mt-2 font-display text-3xl font-black">{day.title}</h2>
                <p className="mt-2 text-slate-300">{day.focus}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-black text-slate-300">{sessionDecision(session)}</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(["voice", "calm"] as const).map((mix) => (
                <div key={mix} className="rounded-2xl border border-white/10 bg-[#061521] p-4">
                  <h3 className="text-sm font-black">{mix === "voice" ? "Voice-only candidate" : "Calm-background candidate"}</h3>
                  <audio
                    key={`${activeLocale}-${activeDay}-${mix}`}
                    controls
                    preload="none"
                    onCanPlay={() => setAudioProblem("")}
                    onError={() => setAudioProblem("Candidate audio is not yet connected or this track is unavailable.")}
                    className="mt-3 w-full"
                    src={`/api/review/audio?locale=${activeLocale}&day=${activeDay + 1}&mix=${mix}`}
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ))}
            </div>
            {audioProblem && <p role="status" className="mt-3 rounded-xl border border-amber-300/25 bg-amber-300/[.07] p-3 text-sm text-amber-50">{audioProblem}</p>}

            <details className="mt-5 rounded-2xl border border-white/10 bg-[#061521] p-4" open>
              <summary className="cursor-pointer font-black">Exact review transcript</summary>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7 text-slate-300">{transcript}</pre>
            </details>

            <div className="mt-6 space-y-3">
              <h3 className="font-display text-xl font-black">Seven quality checks</h3>
              {REVIEW_CRITERIA.map((criterion) => (
                <div key={criterion.key} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:grid-cols-[1fr_180px] sm:items-center">
                  <div>
                    <p className="font-black">{criterion.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{criterion.prompt}</p>
                  </div>
                  <select
                    aria-label={`${criterion.label} status`}
                    value={session.criteria[criterion.key]}
                    onChange={(event) => updateCriterion(criterion.key, event.target.value as CheckStatus)}
                    className="min-h-11 rounded-xl border border-white/15 bg-[#061521] px-3 text-sm font-black text-white outline-none focus:border-[#49d8c2]"
                  >
                    <option>Pending</option>
                    <option>Pass</option>
                    <option>Changes Needed</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-black text-slate-200">
                Review notes
                <textarea
                  value={session.notes}
                  onChange={(event) => updateSession((current) => ({ ...current, notes: event.target.value }))}
                  className="mt-2 min-h-32 w-full rounded-2xl border border-white/15 bg-[#061521] p-4 font-normal text-white outline-none focus:border-[#49d8c2]"
                  placeholder="Timestamp, phrase, pronunciation, pacing, or cultural note…"
                />
              </label>
              <label className="text-sm font-black text-slate-200">
                Proposed correction
                <textarea
                  value={session.proposedCorrection}
                  onChange={(event) => updateSession((current) => ({ ...current, proposedCorrection: event.target.value }))}
                  className="mt-2 min-h-32 w-full rounded-2xl border border-white/15 bg-[#061521] p-4 font-normal text-white outline-none focus:border-[#49d8c2]"
                  placeholder="Supply replacement wording or direction when changes are needed…"
                />
              </label>
            </div>

            <section className="mt-8 rounded-3xl border border-[#76ead6]/25 bg-[#49d8c2]/[.06] p-5">
              <h3 className="font-display text-xl font-black">Approval record</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Approval unlocks only after all 49 checks pass and reviewer certifications are complete. Type your full name exactly as entered above.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-black text-slate-200">Typed signature
                  <input value={review.reviewer.signature} onChange={(event) => updateReviewer("signature", event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-[#061521] px-3 font-normal text-white outline-none focus:border-[#49d8c2]" />
                </label>
                <label className="text-sm font-black text-slate-200">Approval date
                  <input type="date" value={review.reviewer.signedDate} onChange={(event) => updateReviewer("signedDate", event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-[#061521] px-3 font-normal text-white outline-none focus:border-[#49d8c2]" />
                </label>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={exportSignedJson} disabled={!readyForSignature || !reviewerComplete || !signed} className="button-primary disabled:cursor-not-allowed disabled:opacity-40">Export signed approval JSON</button>
                <button type="button" onClick={exportIssueCsv} className="button-secondary">Export correction CSV</button>
                <button type="button" onClick={clearLanguage} className="rounded-full px-4 py-3 text-sm font-black text-rose-200 underline underline-offset-4">Clear language draft</button>
              </div>
              {notice && <p role="status" className="mt-4 text-sm font-bold text-[#b8fff3]">{notice}</p>}
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
