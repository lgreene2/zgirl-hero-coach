import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { credentialRpc } from "@/lib/credentials/store";
import { credentialSessionToken } from "@/lib/credentials/session";
import PrintDecisionPacketButton from "@/components/institutions/PrintDecisionPacketButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Institutional Decision Packet",
  description: "Restricted Z-Girl institutional renewal, expansion, and change-order decision packet.",
  robots: { index: false, follow: false },
};

type Workflow = {
  id: string; institution_id: string; license_id: string; agreement_id: string | null; workflow_code: string; workflow_type: string; status: string;
  requested_effective_date: string | null; requested_expires_at: string | null; requested_seat_limit: number | null; requested_site_limit: number | null; requested_trainer_limit: number | null;
  requested_profiles: string[] | null; requested_credential_levels: string[] | null; target_start_date: string | null; request_reference: string | null;
  institution_name: string; license_code: string; agreement_code: string | null; agreement_status: string | null;
};
type License = { id: string; license_code: string; license_type: string; status: string; renewal_status: string; effective_date: string; expires_at: string; seat_limit: number; site_limit: number; trainer_limit: number; allowed_profiles: string[]; allowed_credential_levels: string[]; agreement_status: string; agreement_reference: string | null };
type Agreement = { id: string; agreement_code: string; agreement_type: string; version: number; status: string; reference: string | null; effective_date: string | null; expires_at: string | null; executed_at: string | null; scope_summary: string | null };
type Evidence = { workflow_id: string; period_start: string; period_end: string; active_sites: number; allocated_seats: number; linked_credentials: number; facilitator_seats: number; trainer_seats: number; license_status: string; license_expires_at: string; license_days_remaining: number; packet_status: string; generated_at: string };
type Gate = { workflow_id: string; gate_key: string; required: boolean; status: string; decided_by: string | null; decision_reference: string | null; decided_at: string | null };
type Handoff = { workflow_id: string; status: string; implementation_owner: string | null; target_start_date: string | null; release_reference: string | null; released_at: string | null };
type Dashboard = { workflows: Workflow[]; licenses: License[]; agreements: Agreement[]; evidencePackets: Evidence[]; approvalGates: Gate[]; handoffs: Handoff[] };

const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
const list = (items: string[] | null | undefined) => items?.length ? items.map(pretty).join(", ") : "—";

export default async function InstitutionalDecisionPacketPage({ params }: { params: Promise<{ id: string }> }) {
  const token = await credentialSessionToken();
  if (!token) redirect("/institutions/ops/workflows");
  const { id } = await params;
  let dashboard: Dashboard;
  try {
    dashboard = await credentialRpc<Dashboard>("zgirl_institution_workflow_dashboard", { p_session_token: token });
  } catch {
    redirect("/institutions/ops/workflows");
  }
  const workflow = dashboard.workflows.find((item) => item.id === id);
  if (!workflow) notFound();
  const license = dashboard.licenses.find((item) => item.id === workflow.license_id);
  if (!license) notFound();
  const agreement = workflow.agreement_id ? dashboard.agreements.find((item) => item.id === workflow.agreement_id) : undefined;
  const evidence = dashboard.evidencePackets.find((item) => item.workflow_id === workflow.id);
  const gates = dashboard.approvalGates.filter((item) => item.workflow_id === workflow.id);
  const handoff = dashboard.handoffs.find((item) => item.workflow_id === workflow.id);

  return <main className="min-h-screen bg-[#061521] px-5 py-10 text-white print:bg-white print:px-0 print:py-0 print:text-black sm:px-8">
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden"><Link href="/institutions/ops/workflows" className="button-secondary">← Workflow administration</Link><PrintDecisionPacketButton /></div>
      <article className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7 print:rounded-none print:border-0 print:bg-white print:p-0">
        <header className="border-b border-white/10 pb-7 print:border-slate-300">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#49d8c2] print:text-slate-600">Z-Girl Institutional Decision Packet · v3.1</p>
          <h1 className="mt-3 font-display text-4xl font-black">{workflow.institution_name}</h1>
          <p className="mt-2 text-lg font-bold">{workflow.workflow_code} · {pretty(workflow.workflow_type)}</p>
          <p className="mt-2 text-sm text-slate-400 print:text-slate-600">License {workflow.license_code} · workflow status {pretty(workflow.status)}</p>
        </header>

        <section className="grid gap-5 border-b border-white/10 py-7 md:grid-cols-2 print:border-slate-300">
          <div><h2 className="font-display text-xl font-black">Current institutional license</h2><dl className="mt-4 space-y-2 text-sm"><Row label="Type" value={pretty(license.license_type)} /><Row label="Status" value={pretty(license.status)} /><Row label="Term" value={`${license.effective_date} → ${license.expires_at}`} /><Row label="Seat / site / trainer limits" value={`${license.seat_limit} / ${license.site_limit} / ${license.trainer_limit}`} /><Row label="Profiles" value={list(license.allowed_profiles)} /><Row label="Credential levels" value={list(license.allowed_credential_levels)} /></dl></div>
          <div><h2 className="font-display text-xl font-black">Requested scope</h2><dl className="mt-4 space-y-2 text-sm"><Row label="Effective date" value={workflow.requested_effective_date || "Inherit current"} /><Row label="Expiration" value={workflow.requested_expires_at || "Inherit current"} /><Row label="Seat / site / trainer limits" value={`${workflow.requested_seat_limit ?? license.seat_limit} / ${workflow.requested_site_limit ?? license.site_limit} / ${workflow.requested_trainer_limit ?? license.trainer_limit}`} /><Row label="Profiles" value={list(workflow.requested_profiles || license.allowed_profiles)} /><Row label="Credential levels" value={list(workflow.requested_credential_levels || license.allowed_credential_levels)} /><Row label="Target start" value={workflow.target_start_date || "—"} /></dl></div>
        </section>

        <section className="border-b border-white/10 py-7 print:border-slate-300">
          <h2 className="font-display text-xl font-black">Aggregate administrative evidence</h2>
          <p className="mt-2 text-xs leading-6 text-slate-500 print:text-slate-600">This packet intentionally excludes participant reflections, youth/student/athlete rosters, diagnoses, counseling notes, safeguarding narratives, clergy records, and sports-medicine records.</p>
          {evidence ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Active sites" value={evidence.active_sites} /><Metric label="Allocated seats" value={evidence.allocated_seats} /><Metric label="Linked credentials" value={evidence.linked_credentials} /><Metric label="Trainer seats" value={evidence.trainer_seats} /><div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-white/10 p-4 print:border-slate-300"><p className="text-xs text-slate-500">Evidence period</p><p className="mt-1 font-bold">{evidence.period_start} → {evidence.period_end} · generated {new Date(evidence.generated_at).toLocaleString()}</p><p className="mt-1 text-sm text-slate-400 print:text-slate-600">License snapshot: {pretty(evidence.license_status)} · expires {evidence.license_expires_at} · {evidence.license_days_remaining} days remaining at snapshot</p></div></div> : <p className="mt-4 text-sm text-amber-200 print:text-slate-700">Evidence packet not yet generated.</p>}
        </section>

        <section className="border-b border-white/10 py-7 print:border-slate-300">
          <h2 className="font-display text-xl font-black">Approval gates</h2>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10 print:border-slate-300"><table className="w-full border-collapse text-left text-sm"><thead className="bg-white/[.04] print:bg-slate-100"><tr><th className="p-3">Gate</th><th className="p-3">Decision</th><th className="p-3">Decision maker</th><th className="p-3">Reference</th></tr></thead><tbody>{gates.map((gate) => <tr key={gate.gate_key} className="border-t border-white/10 print:border-slate-300"><td className="p-3 font-bold">{pretty(gate.gate_key)}</td><td className="p-3">{pretty(gate.status)}</td><td className="p-3">{gate.decided_by || "—"}</td><td className="p-3">{gate.decision_reference || "—"}</td></tr>)}</tbody></table></div>
          <p className="mt-3 text-xs leading-6 text-slate-500 print:text-slate-600">Commercial Authority records authorization of the commercial pathway; it is not a payment-status field. Payment cannot automatically approve, renew, expand, credential, or release institutional delivery.</p>
        </section>

        <section className="grid gap-5 border-b border-white/10 py-7 md:grid-cols-2 print:border-slate-300">
          <div><h2 className="font-display text-xl font-black">Agreement record</h2>{agreement ? <dl className="mt-4 space-y-2 text-sm"><Row label="Agreement" value={`${agreement.agreement_code} · v${agreement.version}`} /><Row label="Type" value={pretty(agreement.agreement_type)} /><Row label="Status" value={pretty(agreement.status)} /><Row label="Reference" value={agreement.reference || "—"} /><Row label="Term" value={`${agreement.effective_date || "—"} → ${agreement.expires_at || "—"}`} /></dl> : <p className="mt-4 text-sm text-amber-200 print:text-slate-700">No agreement linked.</p>}</div>
          <div><h2 className="font-display text-xl font-black">Contract-to-delivery handoff</h2>{handoff ? <dl className="mt-4 space-y-2 text-sm"><Row label="Status" value={pretty(handoff.status)} /><Row label="Implementation owner" value={handoff.implementation_owner || "—"} /><Row label="Target start" value={handoff.target_start_date || "—"} /><Row label="Release reference" value={handoff.release_reference || "—"} /></dl> : <p className="mt-4 text-sm text-slate-500">No handoff prepared yet.</p>}</div>
        </section>

        <footer className="pt-7 text-xs leading-6 text-slate-500 print:text-slate-600"><p><strong className="text-slate-300 print:text-black">Governance note:</strong> This packet is an internal administrative decision record and implementation aid. The authoritative executed agreement governs contractual terms. Z-Girl program authorization is not professional licensure, accreditation, clinical qualification, clergy authority, or sports-medicine qualification.</p><p className="mt-3">Private participant reflection text is not evidence for institutional renewal, expansion, credentialing, or license administration.</p></footer>
      </article>
    </div>
  </main>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-3"><dt className="w-40 shrink-0 text-slate-500 print:text-slate-600">{label}</dt><dd className="font-bold">{value}</dd></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-white/10 p-4 print:border-slate-300"><p className="text-xs text-slate-500 print:text-slate-600">{label}</p><p className="mt-1 font-display text-2xl font-black">{value}</p></div>;
}
