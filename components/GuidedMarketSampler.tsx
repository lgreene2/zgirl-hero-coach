"use client";

import { useMemo, useState } from "react";

export type MarketScenario = {
  id: string;
  label: string;
  tag: string;
  standardPrompt: string;
  simplifiedPrompt: string;
  reflection: string;
  simplifiedReflection: string;
  heroMoves: string[];
  closing: string;
};

type GuidedMarketSamplerProps = {
  eyebrow: string;
  title: string;
  intro: string;
  scenarios: MarketScenario[];
  accent: "teal" | "gold";
  supportLabel: string;
  optionalPracticeLabel?: string;
};

const feelings = [
  "Calm",
  "Nervous",
  "Frustrated",
  "Disappointed",
  "Hopeful",
  "Proud",
  "Unsure",
];

export default function GuidedMarketSampler({
  eyebrow,
  title,
  intro,
  scenarios,
  accent,
  supportLabel,
  optionalPracticeLabel,
}: GuidedMarketSamplerProps) {
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const [step, setStep] = useState(0);
  const [feeling, setFeeling] = useState("");
  const [reflection, setReflection] = useState("");
  const [heroMove, setHeroMove] = useState("");
  const [simplified, setSimplified] = useState(false);

  const scenario = useMemo(
    () => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0],
    [scenarioId, scenarios]
  );

  if (!scenario) return null;

  const accentButton =
    accent === "gold"
      ? "bg-amber-300 text-[#201400] hover:bg-amber-200"
      : "bg-[#49d8c2] text-[#04151c] hover:bg-[#76ead6]";
  const accentBorder =
    accent === "gold" ? "border-amber-300/35" : "border-[#49d8c2]/35";
  const accentText = accent === "gold" ? "text-amber-200" : "text-[#76ead6]";

  function restart() {
    setStep(0);
    setFeeling("");
    setReflection("");
    setHeroMove("");
  }

  return (
    <section className={`rounded-[2rem] border ${accentBorder} bg-[#0a2030]/85 p-5 shadow-2xl shadow-black/25 sm:p-8`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className={`text-xs font-black uppercase tracking-[.22em] ${accentText}`}>{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{intro}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={simplified}
            onChange={(event) => setSimplified(event.target.checked)}
            className="h-5 w-5 rounded border-slate-500 bg-slate-950"
          />
          Use shorter prompts
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-xs leading-5 text-slate-400">
        This sample runs only in this browser tab. It does not create an account, send your reflection to Z-Girl, or save your words after you leave the page.
      </div>

      <div className="mt-7" aria-live="polite">
        {step === 0 && (
          <div>
            <h3 className="text-lg font-extrabold">Choose a moment</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {scenarios.map((item) => {
                const selected = item.id === scenarioId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScenarioId(item.id)}
                    className={`min-h-28 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? `${accentBorder} bg-white/[.09]`
                        : "border-white/10 bg-white/[.035] hover:bg-white/[.07]"
                    }`}
                  >
                    <span className={`text-xs font-black uppercase tracking-[.16em] ${accentText}`}>{item.tag}</span>
                    <span className="mt-2 block text-base font-extrabold text-white">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setStep(1)} className={`mt-5 rounded-full px-5 py-3 text-sm font-black transition ${accentButton}`}>
              Begin this reflection →
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className={`text-xs font-black uppercase tracking-[.18em] ${accentText}`}>1 · Pause</p>
            <h3 className="mt-2 text-2xl font-black">Take one slow breath.</h3>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              {simplified ? scenario.simplifiedPrompt : scenario.standardPrompt}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {feelings.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFeeling(item)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    feeling === item
                      ? `${accentBorder} bg-white/[.12] text-white`
                      : "border-white/10 text-slate-300 hover:bg-white/[.06]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setStep(2)} disabled={!feeling} className={`mt-5 rounded-full px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${accentButton}`}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className={`text-xs font-black uppercase tracking-[.18em] ${accentText}`}>2 · Reflect</p>
            <h3 className="mt-2 text-2xl font-black">
              {simplified ? scenario.simplifiedReflection : scenario.reflection}
            </h3>
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              className="mt-5 min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-sky-300/50"
              placeholder="Write, dictate, draw elsewhere, or simply think about it. A written answer is optional."
              aria-label="Optional private reflection"
            />
            <button type="button" onClick={() => setStep(3)} className={`mt-5 rounded-full px-5 py-3 text-sm font-black transition ${accentButton}`}>
              Choose a Hero Move →
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className={`text-xs font-black uppercase tracking-[.18em] ${accentText}`}>3 · Choose</p>
            <h3 className="mt-2 text-2xl font-black">What is one realistic next step?</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {scenario.heroMoves.map((move) => (
                <button
                  key={move}
                  type="button"
                  onClick={() => setHeroMove(move)}
                  className={`min-h-20 rounded-2xl border p-4 text-left text-sm font-bold leading-6 transition ${
                    heroMove === move
                      ? `${accentBorder} bg-white/[.12] text-white`
                      : "border-white/10 bg-white/[.035] text-slate-300 hover:bg-white/[.07]"
                  }`}
                >
                  {move}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setStep(4)} disabled={!heroMove} className={`mt-5 rounded-full px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${accentButton}`}>
              Finish reflection →
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className={`text-xs font-black uppercase tracking-[.18em] ${accentText}`}>Your Hero Move</p>
            <h3 className="mt-2 font-display text-3xl font-black">{heroMove}</h3>
            <p className="mt-4 max-w-2xl leading-7 text-slate-300">{scenario.closing}</p>
            {optionalPracticeLabel && (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm leading-6 text-slate-300">
                <strong className="text-white">Optional:</strong> {optionalPracticeLabel}
              </p>
            )}
            <p className="mt-4 text-sm leading-6 text-slate-400">{supportLabel}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={restart} className={`rounded-full px-5 py-3 text-sm font-black transition ${accentButton}`}>
                Start another reflection
              </button>
              <button type="button" onClick={() => window.print()} className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-slate-200 transition hover:bg-white/[.06]">
                Print this page
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
