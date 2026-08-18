"use client";

import { useEffect, useState } from "react";

type Candidate = {
  id: string;
  decisionMakerName: string | null;
  decisionMakerEmail: string | null;
  organization: string | null;
  decisionMakerRole: string | null;
  organizationType: string | null;
  interestLabel: string | null;
  audienceSize: string | null;
  timeline: string | null;
  stage: string | null;
  priority: string | null;
  estimatedValue: number | null;
  nextAction: string | null;
  nextActionAt: string | null;
};

type Queue = {
  sourceOfTruth: string;
  duplicateCrmCreated: boolean;
  participantPrivateReflectionData: boolean;
  count: number;
  opportunities: Candidate[];
};

const pretty = (value: string | null | undefined) =>
  (value || "—").replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());

export default function GlsPilotCandidateQueue() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "restricted">("loading");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/institutions/ops/pilots/gls-candidates", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok || !data.ok) {
          setState("restricted");
          return;
        }
        setQueue(data.queue as Queue);
        setState("ready");
      } catch {
        if (active) setState("restricted");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6 sm:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">GLS source-of-truth queue</p>
          <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">Qualified opportunity candidates</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
            Read-only commercial handoff view. GLS owns opportunity, proposal, agreement, invoice and payment state; Z-Girl owns implementation after a governed pilot is created.
          </p>
        </div>
        {queue && (
          <div className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-black text-slate-300">
            {queue.count} open GLS opportunit{queue.count === 1 ? "y" : "ies"}
          </div>
        )}
      </div>

      {state === "loading" && <p className="mt-6 text-sm text-slate-400">Loading GLS opportunity queue…</p>}

      {state === "restricted" && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#04111b] p-5 text-sm leading-7 text-slate-400">
          This queue is available only to named operators with global pipeline-read authority. Institution-scoped administrators do not receive cross-institution prospect access.
        </div>
      )}

      {state === "ready" && queue?.count === 0 && (
        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[.05] p-5">
          <div className="text-sm font-black text-amber-100">No qualified GLS opportunity is currently recorded.</div>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            That is a valid operating state. Do not manufacture an institution or pilot. Complete institutional outreach and fit review in GLS first; once a real opportunity exists, it will appear here automatically.
          </p>
        </div>
      )}

      {state === "ready" && queue && queue.count > 0 && (
        <div className="mt-6 space-y-3">
          {queue.opportunities.map((opportunity) => (
            <article key={opportunity.id} className="rounded-2xl border border-white/10 bg-[#04111b] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.12em] text-[#76ead6]">
                    {pretty(opportunity.priority)} priority · {pretty(opportunity.stage)}
                  </div>
                  <h3 className="mt-2 font-display text-xl font-black">{opportunity.organization || "Unnamed organization"}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {opportunity.decisionMakerName || "Decision maker not recorded"}
                    {opportunity.decisionMakerRole ? ` · ${opportunity.decisionMakerRole}` : ""}
                  </p>
                  {opportunity.decisionMakerEmail && <p className="mt-1 text-xs text-slate-500">{opportunity.decisionMakerEmail}</p>}
                </div>
                <div className="grid min-w-[18rem] grid-cols-2 gap-2 text-xs">
                  <Fact label="Profile" value={pretty(opportunity.organizationType)} />
                  <Fact label="Audience" value={opportunity.audienceSize || "—"} />
                  <Fact label="Timeline" value={opportunity.timeline || "—"} />
                  <Fact label="Value" value={typeof opportunity.estimatedValue === "number" ? `$${opportunity.estimatedValue.toLocaleString()}` : "—"} />
                </div>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <Fact label="Interest" value={opportunity.interestLabel || "—"} />
                <Fact label="Next action" value={opportunity.nextAction || "—"} />
              </div>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[.025] p-3 font-mono text-[11px] text-slate-500">
                GLS opportunity ID: {opportunity.id}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs leading-6 text-slate-500">
        This view carries commercial/implementation metadata only. It does not carry participant reflection text, participant case data or credential assessment detail.
      </p>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.025] p-3">
      <div className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-bold text-slate-200">{value}</div>
    </div>
  );
}
