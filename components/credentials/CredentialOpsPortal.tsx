"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Summary = { candidates: number; activeCredentials: number; renewalsDue60: number; suspendedOrRevoked: number };
type Candidate = { id: string; full_name: string; email: string; organization: string | null; pathway: string; status: string; training_version: string; created_at: string; updated_at: string };
type Requirement = { id?: string; requirement_key: string; status: string; score: number | null; completed_at?: string | null; updated_at?: string };
type Credential = { id: string; credential_id: string; candidate_id: string; holder_name: string; organization: string | null; credential_level: string; scope: string; training_version: string; status: string; status_reason_category: string | null; issue_date: string; expires_at: string; public_verification_enabled: boolean; created_at?: string; updated_at?: string };
type AuditEvent = { id: number; event_type: string; entity_type: string; entity_id: string; summary: string; occurred_at: string };
type Dashboard = { summary: Summary; candidates: Candidate[]; credentials: Credential[]; events: AuditEvent[] };
type CandidateDetail = { candidate: Candidate; requirements: Requirement[]; credentials: Credential[] };
type ApiResult = { ok?: boolean; error?: string; [key: string]: unknown };

type Tab = "overview" | "candidates" | "credentials" | "security";

const requirementLabels: Record<string, string> = {
  orientation: "Orientation complete",
  curriculum: "Core curriculum",
  knowledge_assessment: "Knowledge assessment",
  critical_items: "Critical privacy & safety items",
  practicum: "Observed practicum",
  conduct_ack: "Conduct standards acknowledged",
  local_safeguarding: "Local safeguarding / emergency orientation",
  lead_evidence: "Lead facilitator implementation evidence",
  trainer_teachback: "Trainer teach-back",
  trainer_calibration: "Trainer scoring calibration",
  institutional_trainer_license: "Institutional trainer license active",
};

const allRequirementKeys = Object.keys(requirementLabels);
const levelLabels: Record<string, string> = {
  authorized_facilitator: "Authorized Facilitator",
  authorized_lead_facilitator: "Authorized Lead Facilitator",
  institutional_trainer: "Institutional Trainer",
};

function pretty(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function datePlusYear() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

async function api<T extends ApiResult>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
  const data = (await response.json()) as T;
  if (!response.ok || !data.ok) {
    const error = new Error(data.error || "request_failed");
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return data;
}

function RequirementControl({ candidateId, requirement, onSaved }: { candidateId: string; requirement: Requirement; onSaved: () => Promise<void> }) {
  const [status, setStatus] = useState(requirement.status || "pending");
  const [score, setScore] = useState(requirement.score === null || requirement.score === undefined ? "" : String(requirement.score));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStatus(requirement.status || "pending");
    setScore(requirement.score === null || requirement.score === undefined ? "" : String(requirement.score));
  }, [requirement.status, requirement.score]);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await api<ApiResult>("/api/credentials/ops/action", {
        method: "POST",
        body: JSON.stringify({ action: "set_requirement", candidateId, requirementKey: requirement.requirement_key, status, score: score === "" ? null : Number(score) }),
      });
      setMessage("Saved");
      await onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#04111b]/60 p-4 lg:grid-cols-[1.4fr_.8fr_.55fr_auto] lg:items-center">
      <div>
        <p className="text-sm font-bold text-white">{requirementLabels[requirement.requirement_key] || pretty(requirement.requirement_key)}</p>
        {requirement.completed_at && <p className="mt-1 text-xs text-slate-500">Recorded {new Date(requirement.completed_at).toLocaleDateString()}</p>}
      </div>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-sm text-white">
        <option value="pending">Pending</option><option value="in_progress">In progress</option><option value="pass">Pass</option><option value="fail">Fail</option><option value="not_required">Not required</option>
      </select>
      <input value={score} onChange={(event) => setScore(event.target.value)} type="number" min="0" max="100" step="0.01" placeholder="Score" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-sm text-white" />
      <div className="flex items-center gap-2 lg:justify-end">
        {message && <span className="text-xs text-slate-400">{message}</span>}
        <button type="button" disabled={saving} onClick={save} className="rounded-xl border border-[#76ead6]/30 px-3 py-2 text-xs font-black text-[#76ead6] disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}

function CredentialControl({ credential, onSaved }: { credential: Credential; onSaved: () => Promise<void> }) {
  const [status, setStatus] = useState(credential.status);
  const [reason, setReason] = useState(credential.status_reason_category || "administrative");
  const [publicEnabled, setPublicEnabled] = useState(credential.public_verification_enabled);
  const [renewDate, setRenewDate] = useState(credential.expires_at);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(credential.status);
    setReason(credential.status_reason_category || "administrative");
    setPublicEnabled(credential.public_verification_enabled);
    setRenewDate(credential.expires_at);
  }, [credential]);

  async function saveStatus() {
    setSaving(true); setMessage("");
    try {
      await api<ApiResult>("/api/credentials/ops/action", { method: "POST", body: JSON.stringify({ action: "change_status", credentialId: credential.id, status, reasonCategory: reason, publicVerificationEnabled: publicEnabled }) });
      setMessage("Status saved"); await onSaved();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save"); }
    finally { setSaving(false); }
  }

  async function renew() {
    setSaving(true); setMessage("");
    try {
      await api<ApiResult>("/api/credentials/ops/action", { method: "POST", body: JSON.stringify({ action: "renew", credentialId: credential.id, expiresAt: renewDate }) });
      setMessage("Renewed"); await onSaved();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to renew"); }
    finally { setSaving(false); }
  }

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[.035] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="font-mono text-xs font-bold text-[#76ead6]">{credential.credential_id}</p><h3 className="mt-2 font-display text-2xl font-black">{credential.holder_name}</h3><p className="mt-1 text-sm text-slate-400">{levelLabels[credential.credential_level] || pretty(credential.credential_level)} · expires {credential.expires_at}</p></div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase tracking-[.12em] text-slate-300">{pretty(credential.status)}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{credential.scope}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[.8fr_.8fr_auto]">
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-sm text-white">
          <option value="active">Active</option><option value="conditional">Conditional</option><option value="suspended">Suspended</option><option value="revoked">Revoked</option><option value="lapsed">Lapsed</option>
        </select>
        <select value={reason} onChange={(event) => setReason(event.target.value)} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-sm text-white">
          {['administrative','quality','conduct','privacy','safety','scope','renewal','other'].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-xs font-bold text-slate-300"><input type="checkbox" checked={publicEnabled} onChange={(event) => setPublicEnabled(event.target.checked)} /> Public verification</label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" disabled={saving} onClick={saveStatus} className="rounded-xl border border-[#76ead6]/30 px-3 py-2 text-xs font-black text-[#76ead6] disabled:opacity-50">Save status</button>
        <input type="date" value={renewDate} onChange={(event) => setRenewDate(event.target.value)} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-sm text-white" />
        <button type="button" disabled={saving} onClick={renew} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-black text-white disabled:opacity-50">Record renewal</button>
        {message && <span className="text-xs text-slate-400">{message}</span>}
      </div>
    </article>
  );
}

export default function CredentialOpsPortal() {
  const [tab, setTab] = useState<Tab>("overview");
  const [state, setState] = useState<"loading" | "logged_out" | "ready">("loading");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidateDetail, setCandidateDetail] = useState<CandidateDetail | null>(null);
  const [notice, setNotice] = useState("");

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await api<{ ok: true; dashboard: Dashboard }>("/api/credentials/ops/dashboard");
      setDashboard(data.dashboard); setState("ready");
    } catch (error) {
      if ((error as Error & { status?: number }).status === 401) { setState("logged_out"); setDashboard(null); return; }
      setNotice("Unable to load credential operations."); setState("logged_out");
    }
  }, []);

  useEffect(() => { void refreshDashboard(); }, [refreshDashboard]);

  const refreshCandidate = useCallback(async (id = selectedCandidateId) => {
    if (!id) { setCandidateDetail(null); return; }
    const data = await api<{ ok: true; candidate: CandidateDetail }>(`/api/credentials/ops/candidate?id=${encodeURIComponent(id)}`);
    setCandidateDetail(data.candidate);
  }, [selectedCandidateId]);

  const candidateRequirements = useMemo(() => {
    const existing = new Map((candidateDetail?.requirements || []).map((item) => [item.requirement_key, item]));
    return allRequirementKeys.map((key) => existing.get(key) || { requirement_key: key, status: "pending", score: null });
  }, [candidateDetail]);

  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setLoginError("");
    try {
      await api<ApiResult>("/api/credentials/ops/login", { method: "POST", body: JSON.stringify({ accessCode }) });
      setAccessCode(""); await refreshDashboard();
    } catch { setLoginError("Access code not accepted."); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/credentials/ops/logout", { method: "POST" });
    setDashboard(null); setCandidateDetail(null); setSelectedCandidateId(null); setState("logged_out");
  }

  async function createCandidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const data = await api<{ ok: true; candidateId: string }>("/api/credentials/ops/candidate", { method: "POST", body: JSON.stringify({ fullName: form.get("fullName"), email: form.get("email"), organization: form.get("organization"), pathway: form.get("pathway"), status: "candidate", trainingVersion: form.get("trainingVersion") || "2.7" }) });
      event.currentTarget.reset(); setNotice("Candidate created."); await refreshDashboard(); setSelectedCandidateId(data.candidateId); await refreshCandidate(data.candidateId); setTab("candidates");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to create candidate."); }
    finally { setBusy(false); }
  }

  async function openCandidate(id: string) {
    setSelectedCandidateId(id); setBusy(true); setNotice("");
    try { await refreshCandidate(id); setTab("candidates"); }
    catch { setNotice("Unable to load candidate."); }
    finally { setBusy(false); }
  }

  async function updateCandidateStatus(status: string) {
    if (!candidateDetail) return;
    const candidate = candidateDetail.candidate;
    setBusy(true);
    try {
      await api<ApiResult>("/api/credentials/ops/candidate", { method: "POST", body: JSON.stringify({ id: candidate.id, fullName: candidate.full_name, email: candidate.email, organization: candidate.organization || "", pathway: candidate.pathway, status, trainingVersion: candidate.training_version }) });
      await refreshCandidate(candidate.id); await refreshDashboard(); setNotice("Candidate status updated.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to update candidate."); }
    finally { setBusy(false); }
  }

  async function issueCredential(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!candidateDetail) return;
    const form = new FormData(event.currentTarget); setBusy(true); setNotice("");
    try {
      const data = await api<{ ok: true; credential: { credentialId?: string } }>("/api/credentials/ops/action", { method: "POST", body: JSON.stringify({ action: "issue", candidateId: candidateDetail.candidate.id, credentialLevel: form.get("credentialLevel"), scope: form.get("scope"), expiresAt: form.get("expiresAt") }) });
      setNotice(`Credential issued${data.credential?.credentialId ? `: ${data.credential.credentialId}` : "."}`); await refreshCandidate(candidateDetail.candidate.id); await refreshDashboard(); setTab("credentials");
    } catch (error) { const message = error instanceof Error ? error.message : "Unable to issue credential"; setNotice(message.startsWith("missing_required_pass:") ? `Cannot issue: ${pretty(message.split(":")[1] || "required item")} has not passed.` : message); }
    finally { setBusy(false); }
  }

  async function rotateAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const newCode = String(form.get("newAccessCode") || ""); const confirm = String(form.get("confirmAccessCode") || "");
    if (newCode !== confirm) { setNotice("New access codes do not match."); return; }
    setBusy(true); setNotice("");
    try { await api<ApiResult>("/api/credentials/ops/rotate-access", { method: "POST", body: JSON.stringify({ newAccessCode: newCode }) }); event.currentTarget.reset(); setNotice("Access code rotated. All older sessions were revoked."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Unable to rotate access."); }
    finally { setBusy(false); }
  }

  if (state === "loading") return <div className="rounded-[2rem] border border-white/10 bg-white/[.03] p-8 text-sm text-slate-400">Loading credential operations…</div>;

  if (state === "logged_out") return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[.04] p-7 sm:p-9">
      <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Restricted operator access</p>
      <h2 className="mt-3 font-display text-3xl font-black">Credential Operations</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">Enter the credential-operations access code. Sessions expire automatically and the access code itself is never stored in the browser after login.</p>
      <form onSubmit={login} className="mt-7 space-y-3">
        <input type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoComplete="current-password" placeholder="Operator access code" className="w-full rounded-2xl border border-white/10 bg-[#04111b] px-4 py-3 text-white outline-none focus:border-[#76ead6]/50" />
        <button type="submit" disabled={busy || accessCode.length < 24} className="button-primary w-full disabled:opacity-50">{busy ? "Signing in…" : "Open operations portal"}</button>
        {loginError && <p className="text-sm font-bold text-rose-200">{loginError}</p>}
      </form>
      <p className="mt-6 text-xs leading-6 text-slate-500">Administrative records only. Do not enter participant reflections, diagnoses, counseling details, safeguarding incident narratives, or other youth/private reflection content.</p>
    </div>
  );

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[.035] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Credential Operations Portal</p><h2 className="mt-1 font-display text-2xl font-black">Govern the credential lifecycle.</h2></div>
        <div className="flex flex-wrap gap-2">{(["overview","candidates","credentials","security"] as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-xs font-black ${tab === item ? "bg-[#49d8c2] text-[#04151c]" : "border border-white/10 text-slate-300"}`}>{pretty(item)}</button>)}<button onClick={logout} className="rounded-full border border-rose-300/20 px-4 py-2 text-xs font-black text-rose-200">Log out</button></div>
      </div>

      {notice && <div className="rounded-2xl border border-[#76ead6]/20 bg-[#49d8c2]/[.07] p-4 text-sm font-bold text-[#b8fff3]">{notice}</div>}

      {tab === "overview" && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
          ["Candidates", dashboard.summary.candidates], ["Current credentials", dashboard.summary.activeCredentials], ["Renewals due ≤60 days", dashboard.summary.renewalsDue60], ["Suspended / revoked", dashboard.summary.suspendedOrRevoked],
        ].map(([label,value]) => <div key={String(label)} className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">{label}</p><p className="mt-3 font-display text-4xl font-black">{value}</p></div>)}</div>
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <form onSubmit={createCandidate} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
            <h3 className="font-display text-2xl font-black">Add credential candidate</h3><p className="mt-2 text-xs leading-5 text-slate-500">Candidate means the adult facilitator/trainer candidate—not a youth participant.</p>
            <div className="mt-5 grid gap-3"><input name="fullName" required minLength={2} maxLength={120} placeholder="Full name" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"/><input name="email" required type="email" maxLength={254} placeholder="Candidate email" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"/><input name="organization" maxLength={180} placeholder="Organization (optional)" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"/><div className="grid gap-3 sm:grid-cols-2"><select name="pathway" defaultValue="general" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"><option value="general">General</option><option value="edu">EDU</option><option value="faith">Faith & Values</option><option value="athlete">Athlete</option><option value="institutional">Institutional</option></select><input name="trainingVersion" defaultValue="2.7" maxLength={30} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"/></div><button disabled={busy} className="button-primary disabled:opacity-50">Create candidate</button></div>
          </form>
          <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><h3 className="font-display text-2xl font-black">Recent audit events</h3><div className="mt-5 space-y-3">{dashboard.events.slice(0,10).map((event) => <div key={event.id} className="border-b border-white/10 pb-3 last:border-0"><p className="text-sm font-bold text-slate-200">{event.summary}</p><p className="mt-1 text-xs text-slate-500">{new Date(event.occurred_at).toLocaleString()}</p></div>)}{dashboard.events.length === 0 && <p className="text-sm text-slate-500">No credential events yet.</p>}</div></div>
        </div>
      </>}

      {tab === "candidates" && <div className="grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-5"><h3 className="font-display text-2xl font-black">Candidates</h3><div className="mt-4 space-y-2">{dashboard.candidates.map((candidate) => <button key={candidate.id} onClick={() => void openCandidate(candidate.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedCandidateId === candidate.id ? "border-[#76ead6]/40 bg-[#49d8c2]/[.08]" : "border-white/10 bg-[#04111b]/50 hover:border-white/20"}`}><p className="font-bold text-white">{candidate.full_name}</p><p className="mt-1 text-xs text-slate-500">{candidate.organization || "Independent"} · {pretty(candidate.status)}</p></button>)}{dashboard.candidates.length === 0 && <p className="text-sm text-slate-500">No candidates yet.</p>}</div></div>
        <div>{candidateDetail ? <div className="space-y-5"><section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.15em] text-[#76ead6]">Candidate record</p><h3 className="mt-2 font-display text-3xl font-black">{candidateDetail.candidate.full_name}</h3><p className="mt-2 text-sm text-slate-400">{candidateDetail.candidate.email} · {candidateDetail.candidate.organization || "Independent"}</p></div><select value={candidateDetail.candidate.status} onChange={(event) => void updateCandidateStatus(event.target.value)} disabled={busy} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-2 text-sm text-white">{['candidate','eligible','training','assessment','practicum','decision','authorized','declined','withdrawn'].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#04111b] p-3"><p className="text-xs text-slate-500">Pathway</p><p className="mt-1 text-sm font-bold">{pretty(candidateDetail.candidate.pathway)}</p></div><div className="rounded-xl bg-[#04111b] p-3"><p className="text-xs text-slate-500">Training version</p><p className="mt-1 text-sm font-bold">{candidateDetail.candidate.training_version}</p></div><div className="rounded-xl bg-[#04111b] p-3"><p className="text-xs text-slate-500">Credentials</p><p className="mt-1 text-sm font-bold">{candidateDetail.credentials.length}</p></div></div></section>
          <section className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><h3 className="font-display text-2xl font-black">Evidence & requirements</h3><p className="mt-2 text-xs leading-5 text-slate-500">Scores are aggregate facilitator-assessment results only. Do not enter participant reflection text or youth case details.</p><div className="mt-5 space-y-3">{candidateRequirements.map((requirement) => <RequirementControl key={requirement.requirement_key} candidateId={candidateDetail.candidate.id} requirement={requirement} onSaved={async () => { await refreshCandidate(candidateDetail.candidate.id); await refreshDashboard(); }} />)}</div></section>
          <form onSubmit={issueCredential} className="rounded-[2rem] border border-[#76ead6]/20 bg-[#49d8c2]/[.06] p-6"><h3 className="font-display text-2xl font-black">Issue program credential</h3><p className="mt-2 text-xs leading-5 text-slate-400">The database will reject issuance until every requirement required for the selected level is recorded as Pass.</p><div className="mt-5 grid gap-3"><select name="credentialLevel" defaultValue="authorized_facilitator" className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"><option value="authorized_facilitator">Authorized Facilitator</option><option value="authorized_lead_facilitator">Authorized Lead Facilitator</option><option value="institutional_trainer">Institutional Trainer</option></select><textarea name="scope" required minLength={10} maxLength={500} defaultValue="Z-Girl facilitated reflection within approved institutional scope" rows={3} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"/><input name="expiresAt" required type="date" defaultValue={datePlusYear()} className="rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"/><button disabled={busy} className="button-primary disabled:opacity-50">Issue credential</button></div></form></div> : <div className="rounded-[2rem] border border-dashed border-white/15 p-10 text-center text-sm text-slate-500">Choose a candidate to manage training evidence and authorization.</div>}</div>
      </div>}

      {tab === "credentials" && <div className="space-y-4"><div><h3 className="font-display text-3xl font-black">Credential registry</h3><p className="mt-2 text-sm text-slate-400">Status, public-verification availability, and renewal are controlled here. Revocation/suspension changes the public verification result immediately.</p></div>{dashboard.credentials.map((credential) => <CredentialControl key={credential.id} credential={credential} onSaved={refreshDashboard} />)}{dashboard.credentials.length === 0 && <div className="rounded-[2rem] border border-dashed border-white/15 p-10 text-center text-sm text-slate-500">No credentials issued yet.</div>}</div>}

      {tab === "security" && <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]"><form onSubmit={rotateAccess} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.16em] text-[#76ead6]">Access security</p><h3 className="mt-2 font-display text-3xl font-black">Rotate operator access code</h3><p className="mt-3 text-sm leading-7 text-slate-400">Use at least 24 characters. Rotation invalidates every older operations session and replaces this browser session with a new one.</p><div className="mt-5 space-y-3"><input name="newAccessCode" type="password" required minLength={24} maxLength={200} placeholder="New access code" className="w-full rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"/><input name="confirmAccessCode" type="password" required minLength={24} maxLength={200} placeholder="Confirm new access code" className="w-full rounded-xl border border-white/10 bg-[#071925] px-3 py-3 text-sm text-white"/><button disabled={busy} className="button-primary disabled:opacity-50">Rotate access code</button></div></form><div className="rounded-[2rem] border border-white/10 bg-[#04111b] p-6"><h3 className="font-display text-2xl font-black">Data boundary</h3><div className="mt-4 space-y-3 text-sm leading-6 text-slate-400"><p>✓ Facilitator candidate contact and credential administration data only.</p><p>✓ Assessment results are limited to requirement status and optional aggregate score.</p><p>✓ No private participant reflection text.</p><p>✓ No youth/student/athlete diagnosis, counseling, or safeguarding narratives.</p><p>✓ Public verification requires an exact credential ID and exposes only approved credential fields.</p><p>✓ Commercial credential operations remain separate from charitable donations.</p></div></div></div>}
    </div>
  );
}
