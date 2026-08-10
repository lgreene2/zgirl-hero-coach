"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Summary = {
  openWorkflows: number;
  renewalsOpen: number;
  expansionsOpen: number;
  approvalQueue: number;
  agreementQueue: number;
  releaseReview: number;
  handoffsReady: number;
  executedAgreements: number;
};

type Institution = { id: string; institution_code: string; name: string; institution_type: string; status: string };
type License = {
  id: string;
  institution_id: string;
  institution_name: string;
  license_code: string;
  license_type: string;
  status: string;
  renewal_status: string;
  effective_date: string;
  expires_at: string;
  seat_limit: number;
  site_limit: number;
  trainer_limit: number;
  allowed_profiles: string[];
  allowed_credential_levels: string[];
  agreement_status: string;
  agreement_reference: string | null;
};
type Agreement = {
  id: string;
  institution_id: string;
  license_id: string | null;
  agreement_code: string;
  agreement_type: string;
  version: number;
  status: string;
  reference: string | null;
  effective_date: string | null;
  expires_at: string | null;
  executed_at: string | null;
  scope_summary: string | null;
  institution_name: string;
  license_code: string | null;
};
type Workflow = {
  id: string;
  institution_id: string;
  license_id: string;
  agreement_id: string | null;
  workflow_code: string;
  workflow_type: string;
  status: string;
  requested_effective_date: string | null;
  requested_expires_at: string | null;
  requested_seat_limit: number | null;
  requested_site_limit: number | null;
  requested_trainer_limit: number | null;
  requested_profiles: string[] | null;
  requested_credential_levels: string[] | null;
  target_start_date: string | null;
  request_reference: string | null;
  institution_name: string;
  license_code: string;
  agreement_code: string | null;
  agreement_status: string | null;
};
type Evidence = {
  id: string;
  workflow_id: string;
  period_start: string;
  period_end: string;
  active_sites: number;
  allocated_seats: number;
  linked_credentials: number;
  facilitator_seats: number;
  trainer_seats: number;
  license_status: string;
  license_expires_at: string;
  license_days_remaining: number;
  packet_status: string;
  generated_at: string;
};
type Gate = {
  id: string;
  workflow_id: string;
  gate_key: string;
  required: boolean;
  status: string;
  decided_by: string | null;
  decision_reference: string | null;
  decided_at: string | null;
};
type Handoff = {
  id: string;
  workflow_id: string;
  institution_id: string;
  license_id: string;
  status: string;
  implementation_owner: string | null;
  target_start_date: string | null;
  release_reference: string | null;
  released_at: string | null;
  institution_name: string;
  license_code: string;
  workflow_code: string;
};
type Event = { id: string; event_type: string; summary: string; occurred_at: string };
type Dashboard = {
  summary: Summary;
  institutions: Institution[];
  licenses: License[];
  agreements: Agreement[];
  workflows: Workflow[];
  evidencePackets: Evidence[];
  approvalGates: Gate[];
  handoffs: Handoff[];
  events: Event[];
};
type Tab = "overview" | "agreements" | "workflows" | "handoffs";

const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
const today = () => new Date().toISOString().slice(0, 10);
const plusYear = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
};

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.error || "request_failed");
  return data as T;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><p className="text-xs font-black uppercase tracking-[.12em] text-slate-500">{label}</p><p className="mt-2 font-display text-3xl font-black">{value}</p></div>;
}

function StatusPill({ value }: { value: string }) {
  const tone = value === "released" || value === "executed" || value === "approved" || value === "ready_for_handoff" || value === "release_review"
    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
    : value === "rejected" || value === "expired" || value === "void" || value === "cancelled"
      ? "border-rose-300/20 bg-rose-300/10 text-rose-100"
      : "border-amber-300/20 bg-amber-300/10 text-amber-100";
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[.1em] ${tone}`}>{pretty(value)}</span>;
}

export default function InstitutionWorkflowConsole() {
  const [state, setState] = useState<"loading" | "logged_out" | "ready">("loading");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [code, setCode] = useState("");

  async function refresh() {
    try {
      const data = await call<{ ok: true; dashboard: Dashboard }>("/api/institutions/ops/workflows/dashboard");
      setDashboard(data.dashboard);
      setState("ready");
    } catch (error) {
      if (error instanceof Error && error.message === "unauthorized") setState("logged_out");
      else setNotice(error instanceof Error ? pretty(error.message) : "Unable to load institutional workflow data.");
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function act(body: Record<string, unknown>, success: string) {
    setBusy(true);
    setNotice("");
    try {
      await call("/api/institutions/ops/workflows/action", { method: "POST", body: JSON.stringify(body) });
      setNotice(success);
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? pretty(error.message) : "Operation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      await call("/api/credentials/ops/login", { method: "POST", body: JSON.stringify({ accessCode: code }) });
      setCode("");
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? pretty(error.message) : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") return <div className="rounded-[2rem] border border-white/10 bg-white/[.03] p-8 text-sm text-slate-400">Loading institutional agreement workflow…</div>;

  if (state === "logged_out") {
    return <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[.04] p-8">
      <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Restricted operator access</p>
      <h2 className="mt-3 font-display text-3xl font-black">Agreement, Renewal & Expansion Workflow</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">Use the existing Credential Operations access code. This console manages institutional agreements, approval gates, aggregate administrative evidence, and delivery handoff only.</p>
      <form onSubmit={login} className="mt-6 space-y-3">
        <input type="password" value={code} onChange={(event) => setCode(event.target.value)} minLength={24} className="w-full rounded-xl border border-white/10 bg-[#04111b] px-4 py-3" placeholder="Operator access code" />
        <button disabled={busy || code.length < 24} className="button-primary w-full disabled:opacity-50">Open workflow administration</button>
      </form>
      {notice && <p className="mt-4 text-sm font-bold text-rose-200">{notice}</p>}
    </div>;
  }

  if (!dashboard) return null;

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[.035] p-5 lg:flex-row lg:items-center lg:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Z-Girl v3.1</p><h2 className="mt-1 font-display text-2xl font-black">Institutional Agreement, Renewal & Expansion</h2></div>
      <div className="flex flex-wrap gap-2">
        {(["overview", "agreements", "workflows", "handoffs"] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-xs font-black ${tab === item ? "bg-[#49d8c2] text-[#04151c]" : "border border-white/10"}`}>{pretty(item)}</button>)}
        <a href="/institutions/ops" className="rounded-full border border-white/10 px-4 py-2 text-xs font-black">License Admin</a>
      </div>
    </div>

    {notice && <div className="rounded-2xl border border-[#76ead6]/20 bg-[#49d8c2]/[.07] p-4 text-sm font-bold text-[#b8fff3]">{notice}</div>}

    {tab === "overview" && <Overview dashboard={dashboard} busy={busy} act={act} />}
    {tab === "agreements" && <Agreements dashboard={dashboard} busy={busy} act={act} />}
    {tab === "workflows" && <Workflows dashboard={dashboard} busy={busy} act={act} />}
    {tab === "handoffs" && <Handoffs dashboard={dashboard} busy={busy} act={act} />}
  </div>;
}

function Overview({ dashboard, busy, act }: { dashboard: Dashboard; busy: boolean; act: (body: Record<string, unknown>, success: string) => Promise<void> }) {
  return <>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Open workflows" value={dashboard.summary.openWorkflows} />
      <Stat label="Renewals open" value={dashboard.summary.renewalsOpen} />
      <Stat label="Release review" value={dashboard.summary.releaseReview} />
      <Stat label="Handoffs ready" value={dashboard.summary.handoffsReady} />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#76ead6]">Decision pipeline</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Stat label="Expansion requests" value={dashboard.summary.expansionsOpen} />
          <Stat label="Approval queue" value={dashboard.summary.approvalQueue} />
          <Stat label="Agreement queue" value={dashboard.summary.agreementQueue} />
          <Stat label="Executed agreements" value={dashboard.summary.executedAgreements} />
        </div>
        <button disabled={busy} onClick={() => void act({ action: "run_automation" }, "Workflow automation completed.")} className="button-secondary mt-5 disabled:opacity-50">Run renewal workflow automation</button>
        <p className="mt-4 text-xs leading-6 text-slate-500">The daily automation creates a governed renewal workflow and aggregate administrative evidence packet when an eligible institutional license enters its 90-day renewal window.</p>
      </section>
      <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#76ead6]">Hard governance boundary</p>
        <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
          <p>✓ Approval gates are human decisions; payment cannot auto-approve a workflow.</p>
          <p>✓ Commercial authority is a separate gate and is not a payment-status field.</p>
          <p>✓ Evidence packets use institutional administrative counts only—never private reflection text.</p>
          <p>✓ Final approval creates a ready handoff; a separate human release action starts delivery.</p>
          <p>✓ Credential status, institutional license status, agreement status, and commercial payment status remain separate records.</p>
        </div>
      </section>
    </div>
    <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
      <h3 className="font-display text-2xl font-black">Recent agreement & workflow events</h3>
      <div className="mt-4 space-y-3">
        {dashboard.events.slice(0, 15).map((event) => <div key={event.id} className="border-b border-white/10 pb-3"><p className="text-sm font-bold">{event.summary}</p><p className="mt-1 text-xs text-slate-500">{new Date(event.occurred_at).toLocaleString()} · {pretty(event.event_type)}</p></div>)}
        {dashboard.events.length === 0 && <p className="text-sm text-slate-500">No agreement or workflow events yet.</p>}
      </div>
    </section>
  </>;
}

function Agreements({ dashboard, busy, act }: { dashboard: Dashboard; busy: boolean; act: (body: Record<string, unknown>, success: string) => Promise<void> }) {
  return <div className="space-y-6">
    <AgreementForm institutions={dashboard.institutions} licenses={dashboard.licenses} busy={busy} onSubmit={(payload) => act({ action: "save_agreement", ...payload }, "Agreement record saved.")} />
    <div className="grid gap-5 lg:grid-cols-2">
      {dashboard.agreements.map((agreement) => <article key={agreement.id} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#76ead6]">{agreement.agreement_code} · v{agreement.version}</p><h3 className="mt-2 font-display text-2xl font-black">{agreement.institution_name}</h3></div><StatusPill value={agreement.status} /></div>
        <p className="mt-3 text-sm text-slate-400">{pretty(agreement.agreement_type)}{agreement.license_code ? ` · ${agreement.license_code}` : " · institution-level"}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Reference</dt><dd className="mt-1 font-bold">{agreement.reference || "Not recorded"}</dd></div><div><dt className="text-slate-500">Term</dt><dd className="mt-1 font-bold">{agreement.effective_date || "—"} → {agreement.expires_at || "—"}</dd></div></dl>
        {agreement.scope_summary && <p className="mt-4 rounded-2xl bg-[#04111b] p-4 text-sm leading-7 text-slate-300">{agreement.scope_summary}</p>}
      </article>)}
      {dashboard.agreements.length === 0 && <div className="rounded-[2rem] border border-dashed border-white/15 p-10 text-center text-sm text-slate-500 lg:col-span-2">No institutional agreements have been recorded yet.</div>}
    </div>
  </div>;
}

function AgreementForm({ institutions, licenses, busy, onSubmit }: { institutions: Institution[]; licenses: License[]; busy: boolean; onSubmit: (payload: Record<string, unknown>) => Promise<void> }) {
  const [institutionId, setInstitutionId] = useState("");
  const matchingLicenses = useMemo(() => licenses.filter((license) => !institutionId || license.institution_id === institutionId), [licenses, institutionId]);
  return <form onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void onSubmit({
      institutionId: form.get("institutionId"), licenseId: form.get("licenseId"), agreementType: form.get("agreementType"), version: Number(form.get("version")), status: form.get("status"), reference: form.get("reference"), effectiveDate: form.get("effectiveDate"), expiresAt: form.get("expiresAt"), scopeSummary: form.get("scopeSummary"),
    }).then(() => event.currentTarget.reset());
  }} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
    <h3 className="font-display text-2xl font-black">Record institutional agreement / change order</h3>
    <p className="mt-2 text-xs leading-6 text-slate-500">This is an administrative agreement record, not legal advice or a payment ledger. Only mark Executed when the authoritative agreement reference and effective date are actually confirmed.</p>
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <select name="institutionId" required value={institutionId} onChange={(event) => setInstitutionId(event.target.value)} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 md:col-span-2"><option value="">Choose institution</option>{institutions.map((institution) => <option key={institution.id} value={institution.id}>{institution.name}</option>)}</select>
      <select name="licenseId" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3"><option value="">Institution-level</option>{matchingLicenses.map((license) => <option key={license.id} value={license.id}>{license.license_code} · {pretty(license.license_type)}</option>)}</select>
      <select name="agreementType" defaultValue="renewal" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3">{["pilot", "annual", "renewal", "expansion", "change_order", "train_the_trainer_addendum"].map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select>
      <input name="version" type="number" min={1} max={999} defaultValue={1} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" />
      <select name="status" defaultValue="draft" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3">{["draft", "internal_review", "counterparty_review", "approved", "executed", "superseded", "expired", "void"].map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select>
      <input name="reference" placeholder="Agreement / e-sign / contract reference" maxLength={180} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 md:col-span-3" />
      <input name="effectiveDate" type="date" defaultValue={today()} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" />
      <input name="expiresAt" type="date" defaultValue={plusYear()} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" />
      <textarea name="scopeSummary" maxLength={1200} rows={3} placeholder="Administrative scope summary only. Do not enter participant cases, reflections, diagnoses, counseling notes, or safeguarding narratives." className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 md:col-span-3" />
      <button disabled={busy || !institutionId} className="button-primary md:col-span-3 disabled:opacity-50">Save agreement record</button>
    </div>
  </form>;
}

function Workflows({ dashboard, busy, act }: { dashboard: Dashboard; busy: boolean; act: (body: Record<string, unknown>, success: string) => Promise<void> }) {
  return <div className="space-y-6">
    <WorkflowForm dashboard={dashboard} busy={busy} onSubmit={(payload) => act({ action: "create_workflow", ...payload }, "Workflow created with an evidence packet and approval gates.")} />
    {dashboard.workflows.map((workflow) => <WorkflowCard key={workflow.id} workflow={workflow} dashboard={dashboard} busy={busy} act={act} />)}
    {dashboard.workflows.length === 0 && <div className="rounded-[2rem] border border-dashed border-white/15 p-10 text-center text-sm text-slate-500">No institutional renewal, expansion, or change-order workflows yet.</div>}
  </div>;
}

function WorkflowForm({ dashboard, busy, onSubmit }: { dashboard: Dashboard; busy: boolean; onSubmit: (payload: Record<string, unknown>) => Promise<void> }) {
  const [licenseId, setLicenseId] = useState("");
  const selected = dashboard.licenses.find((license) => license.id === licenseId);
  const agreements = dashboard.agreements.filter((agreement) => agreement.institution_id === selected?.institution_id && (!agreement.license_id || agreement.license_id === licenseId));
  return <form onSubmit={(event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void onSubmit({
      licenseId: form.get("licenseId"), workflowType: form.get("workflowType"), agreementId: form.get("agreementId"), requestedEffectiveDate: form.get("requestedEffectiveDate"), requestedExpiresAt: form.get("requestedExpiresAt"), requestedSeatLimit: form.get("requestedSeatLimit"), requestedSiteLimit: form.get("requestedSiteLimit"), requestedTrainerLimit: form.get("requestedTrainerLimit"), requestedProfiles: form.getAll("requestedProfiles"), requestedLevels: form.getAll("requestedLevels"), targetStartDate: form.get("targetStartDate"), requestReference: form.get("requestReference"),
    }).then(() => event.currentTarget.reset());
  }} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
    <h3 className="font-display text-2xl font-black">Open renewal / expansion / change-order workflow</h3>
    <p className="mt-2 text-xs leading-6 text-slate-500">Blank limits inherit the current license. A new workflow immediately receives a structured administrative evidence packet and five governed approval gates.</p>
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <select name="licenseId" required value={licenseId} onChange={(event) => setLicenseId(event.target.value)} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 md:col-span-2"><option value="">Choose institutional license</option>{dashboard.licenses.map((license) => <option key={license.id} value={license.id}>{license.institution_name} — {license.license_code} · expires {license.expires_at}</option>)}</select>
      <select name="workflowType" defaultValue="renewal" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3">{["renewal", "expansion", "change_order", "train_the_trainer_addendum"].map((value) => <option key={value} value={value}>{pretty(value)}</option>)}</select>
      <select name="agreementId" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 md:col-span-3"><option value="">Agreement can be linked later</option>{agreements.map((agreement) => <option key={agreement.id} value={agreement.id}>{agreement.agreement_code} · {pretty(agreement.status)}</option>)}</select>
      <input name="requestedEffectiveDate" type="date" placeholder="Requested effective date" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" />
      <input name="requestedExpiresAt" type="date" placeholder="Requested expiration" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" />
      <input name="targetStartDate" type="date" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" />
      <input name="requestedSeatLimit" type="number" min={1} placeholder={selected ? `Seats · current ${selected.seat_limit}` : "Seat limit"} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" />
      <input name="requestedSiteLimit" type="number" min={1} placeholder={selected ? `Sites · current ${selected.site_limit}` : "Site limit"} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" />
      <input name="requestedTrainerLimit" type="number" min={0} placeholder={selected ? `Trainers · current ${selected.trainer_limit}` : "Trainer limit"} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" />
      <fieldset className="rounded-xl border border-white/10 p-3 md:col-span-3"><legend className="px-2 text-xs text-slate-500">Requested profiles — leave all unchecked to inherit</legend>{["general", "edu", "faith", "athlete"].map((value) => <label key={value} className="mr-4 inline-flex items-center gap-2 text-xs"><input type="checkbox" name="requestedProfiles" value={value} /> {pretty(value)}</label>)}</fieldset>
      <fieldset className="rounded-xl border border-white/10 p-3 md:col-span-3"><legend className="px-2 text-xs text-slate-500">Requested credential levels — leave all unchecked to inherit</legend>{["authorized_facilitator", "authorized_lead_facilitator", "institutional_trainer"].map((value) => <label key={value} className="mr-4 inline-flex items-center gap-2 text-xs"><input type="checkbox" name="requestedLevels" value={value} /> {pretty(value)}</label>)}</fieldset>
      <input name="requestReference" maxLength={180} placeholder="Internal request / board / procurement reference (optional)" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 md:col-span-3" />
      <button disabled={busy || !licenseId} className="button-primary md:col-span-3 disabled:opacity-50">Create governed workflow</button>
    </div>
  </form>;
}

function WorkflowCard({ workflow, dashboard, busy, act }: { workflow: Workflow; dashboard: Dashboard; busy: boolean; act: (body: Record<string, unknown>, success: string) => Promise<void> }) {
  const evidence = dashboard.evidencePackets.find((packet) => packet.workflow_id === workflow.id);
  const gates = dashboard.approvalGates.filter((gate) => gate.workflow_id === workflow.id);
  const agreements = dashboard.agreements.filter((agreement) => agreement.institution_id === workflow.institution_id && (!agreement.license_id || agreement.license_id === workflow.license_id));
  const handoff = dashboard.handoffs.find((item) => item.workflow_id === workflow.id);
  return <article className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[.14em] text-[#76ead6]">{workflow.workflow_code} · {pretty(workflow.workflow_type)}</p><h3 className="mt-2 font-display text-3xl font-black">{workflow.institution_name}</h3><p className="mt-2 text-sm text-slate-400">{workflow.license_code} · target {workflow.target_start_date || workflow.requested_effective_date || "not set"}</p></div>
      <div className="flex flex-wrap gap-2"><StatusPill value={workflow.status} /><a href={`/institutions/ops/workflows/packet/${workflow.id}`} className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[.08em]">Decision packet</a></div>
    </div>

    <div className="mt-6 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-[#04111b] p-4">
          <div className="flex items-center justify-between gap-3"><h4 className="font-bold">Aggregate administrative evidence</h4><button disabled={busy} onClick={() => void act({ action: "build_evidence", workflowId: workflow.id }, "Evidence packet refreshed.")} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-black">Refresh</button></div>
          {evidence ? <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><Metric label="Active sites" value={evidence.active_sites} /><Metric label="Allocated seats" value={evidence.allocated_seats} /><Metric label="Linked credentials" value={evidence.linked_credentials} /><Metric label="Trainer seats" value={evidence.trainer_seats} /><div className="col-span-2 rounded-xl border border-white/10 p-3"><p className="text-xs text-slate-500">Current license snapshot</p><p className="mt-1 font-bold">{pretty(evidence.license_status)} · expires {evidence.license_expires_at} · {evidence.license_days_remaining} days</p></div></div> : <p className="mt-3 text-sm text-slate-500">No evidence snapshot yet.</p>}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#04111b] p-4">
          <h4 className="font-bold">Agreement linkage</h4>
          <p className="mt-2 text-xs text-slate-500">Current: {workflow.agreement_code ? `${workflow.agreement_code} · ${pretty(workflow.agreement_status || "unknown")}` : "No agreement linked"}</p>
          {!["released", "rejected", "cancelled"].includes(workflow.status) && <select defaultValue="" onChange={(event) => { if (event.target.value) void act({ action: "link_agreement", workflowId: workflow.id, agreementId: event.target.value }, "Agreement linked to workflow."); }} className="mt-3 w-full rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-sm"><option value="">Link / replace agreement…</option>{agreements.map((agreement) => <option key={agreement.id} value={agreement.id}>{agreement.agreement_code} · {pretty(agreement.status)}</option>)}</select>}
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#04111b] p-4">
        <h4 className="font-bold">Approval gates</h4>
        <p className="mt-2 text-xs leading-6 text-slate-500">Approved or Waived gates require a named decision-maker. Commercial Authority is not a payment-status field and must never be auto-approved by checkout.</p>
        <div className="mt-4 space-y-3">
          {gates.map((gate) => <GateRow key={gate.id} gate={gate} workflowId={workflow.id} busy={busy} act={act} />)}
        </div>
      </section>
    </div>

    {workflow.status === "release_review" && <form onSubmit={(event) => {
      event.preventDefault(); const form = new FormData(event.currentTarget);
      void act({ action: "finalize_workflow", workflowId: workflow.id, implementationOwner: form.get("implementationOwner"), handoffReference: form.get("handoffReference") }, "Approved scope applied and delivery handoff prepared.");
    }} className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/[.06] p-5">
      <h4 className="font-display text-xl font-black">Release review passed — prepare delivery handoff</h4>
      <p className="mt-2 text-xs leading-6 text-slate-400">This applies the approved license scope and creates a Ready handoff. It still does not start delivery; release remains a separate human action.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2"><input name="implementationOwner" required minLength={2} maxLength={120} placeholder="Implementation owner" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" /><input name="handoffReference" maxLength={180} placeholder="Handoff / project reference (optional)" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" /><button disabled={busy} className="button-primary md:col-span-2">Prepare contract-to-delivery handoff</button></div>
    </form>}

    {handoff && <div className="mt-5 rounded-2xl border border-white/10 bg-[#04111b] p-4 text-sm"><p className="font-bold">Handoff: {pretty(handoff.status)}</p><p className="mt-1 text-slate-500">Owner: {handoff.implementation_owner || "—"} · target {handoff.target_start_date || "—"}</p></div>}
  </article>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-white/10 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-display text-2xl font-black">{value}</p></div>;
}

function GateRow({ gate, workflowId, busy, act }: { gate: Gate; workflowId: string; busy: boolean; act: (body: Record<string, unknown>, success: string) => Promise<void> }) {
  return <form onSubmit={(event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void act({ action: "set_gate", workflowId, gateKey: gate.gate_key, status: form.get("status"), decidedBy: form.get("decidedBy"), decisionReference: form.get("decisionReference") }, `${pretty(gate.gate_key)} updated.`);
  }} className="rounded-2xl border border-white/10 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold">{pretty(gate.gate_key)}</p><p className="mt-1 text-[11px] text-slate-500">{gate.required ? "Required gate" : "Optional gate"}</p></div><StatusPill value={gate.status} /></div>
    <div className="mt-3 grid gap-2 md:grid-cols-[.7fr_1fr_1fr_auto]">
      <select name="status" defaultValue={gate.status} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-xs"><option value="pending">Pending</option><option value="approved">Approved</option><option value="waived">Waived</option><option value="rejected">Rejected</option></select>
      <input name="decidedBy" defaultValue={gate.decided_by || ""} maxLength={120} placeholder="Decision maker" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-xs" />
      <input name="decisionReference" defaultValue={gate.decision_reference || ""} maxLength={180} placeholder="Decision / approval reference" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-xs" />
      <button disabled={busy} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black disabled:opacity-50">Save</button>
    </div>
  </form>;
}

function Handoffs({ dashboard, busy, act }: { dashboard: Dashboard; busy: boolean; act: (body: Record<string, unknown>, success: string) => Promise<void> }) {
  return <div className="space-y-5">
    <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.14em] text-[#76ead6]">Contract-to-delivery control</p><h3 className="mt-2 font-display text-3xl font-black">Approval is not delivery.</h3><p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">Finalizing an approved workflow creates a Ready handoff. Delivery authority becomes Released only when an operator records a separate release reference. This preserves a deliberate contract-to-implementation boundary.</p></section>
    {dashboard.handoffs.map((handoff) => <article key={handoff.id} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#76ead6]">{handoff.workflow_code} · {handoff.license_code}</p><h3 className="mt-2 font-display text-2xl font-black">{handoff.institution_name}</h3><p className="mt-2 text-sm text-slate-400">Implementation owner: {handoff.implementation_owner || "—"} · target {handoff.target_start_date || "—"}</p></div><StatusPill value={handoff.status} /></div>{handoff.status === "ready" && <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void act({ action: "release_handoff", handoffId: handoff.id, releaseReference: form.get("releaseReference") }, "Delivery handoff released."); }} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]"><input name="releaseReference" required minLength={3} maxLength={180} placeholder="Required release / implementation kickoff reference" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3" /><button disabled={busy} className="button-primary">Release to delivery</button></form>}{handoff.status === "released" && <p className="mt-4 text-sm text-emerald-200">Released {handoff.released_at ? new Date(handoff.released_at).toLocaleString() : ""} · {handoff.release_reference}</p>}</article>)}
    {dashboard.handoffs.length === 0 && <div className="rounded-[2rem] border border-dashed border-white/15 p-10 text-center text-sm text-slate-500">No delivery handoffs yet.</div>}
  </div>;
}
