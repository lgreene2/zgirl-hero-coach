"use client";

import { useCallback, useEffect, useState } from "react";

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
  outreachStatus: string | null;
  responseStatus: string | null;
  qualificationConfirmedCount: number | null;
  qualificationReady: boolean;
  qualifiedAt: string | null;
  participantGroup: string | null;
  participantCapacity: number | null;
  implementationOwner: string | null;
  contractingEntityName: string | null;
  proposalId: string | null;
  proposalStatus: string | null;
  agreementId: string | null;
  agreementStatus: string | null;
  engagementId: string | null;
  engagementStatus: string | null;
  zGirlPilotId: string | null;
  zGirlPilotCode: string | null;
  zGirlStage: string | null;
  zGirlReadinessStatus: string | null;
  workspacePrepared: boolean;
  workspaceEligible: boolean;
  recommendedNextStep: string | null;
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
  const [preparingId, setPreparingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<Record<string, string>>({});

  const refreshQueue = useCallback(async () => {
    try {
      const response = await fetch("/api/institutions/ops/pilots/gls-candidates", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        setState("restricted");
        return;
      }
      setQueue(data.queue as Queue);
      setState("ready");
    } catch {
      setState("restricted");
    }
  }, []);

  useEffect(() => {
    void refreshQueue();
  }, [refreshQueue]);

  async function prepareWorkspace(opportunity: Candidate) {
    if (!opportunity.workspaceEligible || preparingId) return;
    setPreparingId(opportunity.id);
    setActionMessage((current) => ({ ...current, [opportunity.id]: "Preparing governed workspace…" }));
    try {
      const response = await fetch("/api/institutions/ops/pilots/gls-prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glsOpportunityId: opportunity.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        const code = String(data.error || "workspace_prepare_failed").replaceAll("_", " ");
        setActionMessage((current) => ({ ...current, [opportunity.id]: `Blocked: ${code}.` }));
        return;
      }
      const handoff = (data.handoff || {}) as Record<string, unknown>;
      const code = typeof handoff.pilotCode === "string" ? handoff.pilotCode : "workspace";
      setActionMessage((current) => ({
        ...current,
        [opportunity.id]: `${code} prepared. Live participant delivery is still blocked pending Z-Girl readiness and human release.`,
      }));
      await refreshQueue();
    } catch {
      setActionMessage((current) => ({ ...current, [opportunity.id]: "Could not prepare the workspace." }));
    } finally {
      setPreparingId(null);
    }
  }

  return (
    <section data-guide-target="gls-queue" className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6 sm:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">GLS source-of-truth queue</p>
          <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">Institutional pilot candidates</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
            Governed commercial handoff view. GLS owns outreach, qualification, proposal, agreement and engagement state. Z-Girl prepares implementation only after those gates are satisfied.
          </p>
        </div>
        {queue && (
          <div className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-black text-slate-300">
            {queue.count} GLS candidate{queue.count === 1 ? "" : "s"}
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
          <div className="text-sm font-black text-amber-100">No real GLS Z-Girl candidate is currently recorded.</div>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            That is a valid operating state. Do not manufacture an institution, qualification record or pilot. Complete institutional outreach and fit review in GLS first.
          </p>
        </div>
      )}

      {state === "ready" && queue && queue.count > 0 && (
        <div className="mt-6 space-y-4">
          {queue.opportunities.map((opportunity, index) => (
            <article key={opportunity.id} data-guide-target={index === 0 ? "gls-opportunity-card" : undefined} className="rounded-2xl border border-white/10 bg-[#04111b] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.12em] text-[#76ead6]">
                    {pretty(opportunity.priority)} priority · GLS {pretty(opportunity.stage)}
                  </div>
                  <h3 className="mt-2 font-display text-xl font-black">{opportunity.organization || "Unnamed organization"}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {opportunity.decisionMakerName || "Decision maker not recorded"}
                    {opportunity.decisionMakerRole ? ` · ${opportunity.decisionMakerRole}` : ""}
                  </p>
                  {opportunity.decisionMakerEmail && <p className="mt-1 text-xs text-slate-500">{opportunity.decisionMakerEmail}</p>}
                </div>
                <div className="grid min-w-[18rem] grid-cols-2 gap-2 text-xs">
                  <Fact label="Outreach" value={pretty(opportunity.outreachStatus)} />
                  <Fact label="Response" value={pretty(opportunity.responseStatus)} />
                  <Fact label="Fit gates" value={`${opportunity.qualificationConfirmedCount || 0} / 8`} />
                  <Fact label="Qualification" value={opportunity.qualifiedAt ? "Approved" : "Not approved"} />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Fact label="Participant group" value={opportunity.participantGroup || "—"} />
                <Fact label="Capacity" value={opportunity.participantCapacity ? String(opportunity.participantCapacity) : "—"} />
                <Fact label="Implementation owner" value={opportunity.implementationOwner || "—"} />
                <Fact label="Contracting entity" value={opportunity.contractingEntityName || "—"} />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Fact label="Proposal" value={pretty(opportunity.proposalStatus || "not generated")} />
                <Fact label="Agreement" value={pretty(opportunity.agreementStatus || "not generated")} />
                <Fact label="Engagement" value={pretty(opportunity.engagementStatus || "not created")} />
                <Fact label="Z-Girl workspace" value={opportunity.workspacePrepared ? `${opportunity.zGirlPilotCode || "Prepared"} · ${pretty(opportunity.zGirlStage)}` : "Not prepared"} />
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[.025] p-4">
                <div className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">Factory next action</div>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-200">{opportunity.recommendedNextStep || opportunity.nextAction || "—"}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {opportunity.workspaceEligible && !opportunity.workspacePrepared && (
                  <button
                    type="button"
                    onClick={() => void prepareWorkspace(opportunity)}
                    disabled={Boolean(preparingId)}
                    className="rounded-xl bg-[#76ead6] px-4 py-2.5 text-sm font-black text-[#04111b] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {preparingId === opportunity.id ? "Preparing…" : "Prepare governed Z-Girl workspace"}
                  </button>
                )}
                {opportunity.zGirlPilotId && (
                  <a
                    href={`/institutions/ops/pilots/${opportunity.zGirlPilotId}`}
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-black text-slate-100 hover:bg-white/[.05]"
                  >
                    Open Z-Girl workspace
                  </a>
                )}
                {!opportunity.workspaceEligible && !opportunity.workspacePrepared && (
                  <span className="rounded-xl border border-amber-300/20 bg-amber-300/[.04] px-3 py-2 text-xs font-bold text-amber-100">
                    Workspace gate locked
                  </span>
                )}
              </div>

              {actionMessage[opportunity.id] && (
                <p className="mt-3 text-xs leading-6 text-slate-400" aria-live="polite">{actionMessage[opportunity.id]}</p>
              )}

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[.025] p-3 font-mono text-[11px] text-slate-500">
                GLS opportunity ID: {opportunity.id}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs leading-6 text-slate-500">
        This queue carries adult institutional and aggregate implementation metadata only. No participant reflection text, participant case data, clinical records or credential-assessment detail crosses the commercial handoff. Preparing a workspace does not activate a live pilot.
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
