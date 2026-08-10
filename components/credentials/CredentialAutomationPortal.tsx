"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Summary = {
  candidates: number;
  activeCredentials: number;
  renewalsDue60: number;
  renewalsDue90: number;
  queuedNotices: number;
  suspendedOrRevoked: number;
};

type Credential = {
  id: string;
  credential_id: string;
  holder_name: string;
  organization: string | null;
  credential_level: string;
  status: string;
  issue_date: string;
  expires_at: string;
  public_verification_enabled: boolean;
};

type Notification = {
  id: string;
  credential_id: string;
  credential_code: string;
  notice_type: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  scheduled_for: string;
  status: string;
  delivery_reference: string | null;
  sent_at: string | null;
  created_at: string;
  holder_name: string;
  expires_at: string;
};

type Dashboard = {
  summary: Summary;
  credentials: Credential[];
  notifications: Notification[];
};

type ApiResult = { ok?: boolean; error?: string; [key: string]: unknown };

type View = "queue" | "scheduled" | "records";

function pretty(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function displayDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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

export default function CredentialAutomationPortal() {
  const [state, setState] = useState<"loading" | "logged_out" | "ready">("loading");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [view, setView] = useState<View>("queue");
  const [accessCode, setAccessCode] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ ok: true; dashboard: Dashboard }>("/api/credentials/ops/dashboard");
      setDashboard(data.dashboard);
      setState("ready");
    } catch (error) {
      if ((error as Error & { status?: number }).status === 401) {
        setDashboard(null);
        setState("logged_out");
        return;
      }
      setMessage("Unable to load credential automation.");
      setState("logged_out");
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const queue = useMemo(() => (dashboard?.notifications || []).filter((item) => item.status === "queued" || item.status === "prepared"), [dashboard]);
  const scheduled = useMemo(() => (dashboard?.notifications || []).filter((item) => item.status === "scheduled"), [dashboard]);
  const sent = useMemo(() => (dashboard?.notifications || []).filter((item) => item.status === "sent"), [dashboard]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setBusyId("login"); setMessage("");
    try {
      await api<ApiResult>("/api/credentials/ops/login", { method: "POST", body: JSON.stringify({ accessCode }) });
      setAccessCode("");
      await refresh();
    } catch {
      setMessage("Access code not accepted.");
    } finally {
      setBusyId(null);
    }
  }

  async function mark(notification: Notification, status: "prepared" | "sent" | "dismissed", deliveryReference = "") {
    setBusyId(notification.id); setMessage("");
    try {
      await api<ApiResult>("/api/credentials/ops/action", {
        method: "POST",
        body: JSON.stringify({ action: "mark_notification", notificationId: notification.id, status, deliveryReference }),
      });
      await refresh();
      setMessage(status === "sent" ? "Delivery marked sent." : status === "prepared" ? "Delivery marked prepared." : "Notice dismissed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update notice.");
    } finally {
      setBusyId(null);
    }
  }

  async function prepareEmail(notification: Notification) {
    await mark(notification, "prepared", "prepared-email");
    const href = `mailto:${encodeURIComponent(notification.recipient_email)}?subject=${encodeURIComponent(notification.subject)}&body=${encodeURIComponent(notification.body)}`;
    window.location.href = href;
  }

  async function runAutomation() {
    setBusyId("automation"); setMessage("");
    try {
      const result = await api<{ ok: true; automation: { queuedNotices?: number; lapsedCredentials?: number } }>("/api/credentials/ops/action", {
        method: "POST",
        body: JSON.stringify({ action: "run_automation" }),
      });
      await refresh();
      setMessage(`Automation complete: ${result.automation?.queuedNotices || 0} notice(s) promoted, ${result.automation?.lapsedCredentials || 0} credential(s) lapsed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to run automation.");
    } finally {
      setBusyId(null);
    }
  }

  if (state === "loading") return <div className="rounded-[2rem] border border-white/10 bg-white/[.03] p-8 text-sm text-slate-400">Loading credential automation…</div>;

  if (state === "logged_out") return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[.04] p-7 sm:p-9">
      <p className="text-xs font-black uppercase tracking-[.18em] text-[#76ead6]">Restricted operator access</p>
      <h2 className="mt-3 font-display text-3xl font-black">Renewal & delivery automation</h2>
      <p className="mt-3 text-sm leading-7 text-slate-400">Use the same Credential Operations access code. The browser receives only a short-lived HttpOnly operations session.</p>
      <form onSubmit={login} className="mt-7 space-y-3">
        <input type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} autoComplete="current-password" placeholder="Operator access code" className="w-full rounded-2xl border border-white/10 bg-[#04111b] px-4 py-3 text-white outline-none focus:border-[#76ead6]/50" />
        <button type="submit" disabled={busyId === "login" || accessCode.length < 24} className="button-primary w-full disabled:opacity-50">{busyId === "login" ? "Signing in…" : "Open automation console"}</button>
      </form>
      {message && <p className="mt-4 text-sm font-bold text-amber-100">{message}</p>}
    </div>
  );

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Renewals due ≤90 days", dashboard.summary.renewalsDue90],
          ["Renewals due ≤60 days", dashboard.summary.renewalsDue60],
          ["Queued / prepared notices", dashboard.summary.queuedNotices],
          ["Current credentials", dashboard.summary.activeCredentials],
        ].map(([label, value]) => <div key={String(label)} className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">{label}</p><p className="mt-3 font-display text-4xl font-black">{value}</p></div>)}
      </div>

      <div className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/[.035] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["queue", "scheduled", "records"] as View[]).map((item) => <button key={item} onClick={() => setView(item)} className={`rounded-full px-4 py-2 text-xs font-black ${view === item ? "bg-[#49d8c2] text-[#04151c]" : "border border-white/10 text-slate-300"}`}>{item === "queue" ? `Delivery queue (${queue.length})` : item === "scheduled" ? `Scheduled (${scheduled.length})` : "Records & roster"}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={runAutomation} disabled={busyId === "automation"} className="button-secondary disabled:opacity-50">{busyId === "automation" ? "Running…" : "Run renewal automation now"}</button>
          <a href="/api/credentials/ops/roster" className="button-secondary">Export roster CSV</a>
          <a href="/credentials/ops" className="button-secondary">Credential operations</a>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-[#76ead6]/20 bg-[#49d8c2]/[.07] p-4 text-sm font-bold text-[#b8fff3]">{message}</div>}

      {view === "queue" && <div className="space-y-4">
        <div><h3 className="font-display text-3xl font-black">Controlled delivery queue</h3><p className="mt-2 max-w-4xl text-sm leading-7 text-slate-400">The database schedules notices automatically. Email delivery remains operator-controlled: open the prepared message in your email client, then mark it sent. No autonomous email provider has been activated.</p></div>
        {queue.map((notification) => (
          <article key={notification.id} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-[#76ead6]/25 px-3 py-1 text-xs font-black uppercase tracking-[.12em] text-[#76ead6]">{pretty(notification.notice_type)}</span><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase tracking-[.12em] text-slate-400">{pretty(notification.status)}</span></div>
                <h4 className="mt-4 font-display text-2xl font-black">{notification.recipient_name}</h4>
                <p className="mt-1 text-sm text-slate-400">{notification.recipient_email} · {notification.credential_code} · expires {displayDate(notification.expires_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busyId === notification.id} onClick={() => void prepareEmail(notification)} className="button-primary disabled:opacity-50">Prepare email</button>
                <button type="button" disabled={busyId === notification.id} onClick={() => void mark(notification, "sent", "operator-confirmed")} className="button-secondary disabled:opacity-50">Mark sent</button>
                <button type="button" disabled={busyId === notification.id} onClick={() => void mark(notification, "dismissed", "operator-dismissed")} className="button-secondary disabled:opacity-50">Dismiss</button>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#04111b]/70 p-5"><p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">{notification.subject}</p><pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-7 text-slate-300">{notification.body}</pre></div>
          </article>
        ))}
        {queue.length === 0 && <div className="rounded-[2rem] border border-dashed border-white/15 p-10 text-center text-sm text-slate-500">No notices are waiting for operator delivery.</div>}
        {sent.length > 0 && <div className="rounded-[2rem] border border-white/10 bg-white/[.025] p-6"><h4 className="font-display text-xl font-black">Recently sent</h4><div className="mt-4 space-y-2">{sent.slice(0, 8).map((item) => <div key={item.id} className="flex flex-col gap-1 border-b border-white/10 pb-3 text-sm last:border-0"><span className="font-bold text-slate-200">{item.recipient_name} · {pretty(item.notice_type)}</span><span className="text-xs text-slate-500">{item.sent_at ? new Date(item.sent_at).toLocaleString() : "Marked sent"} · {item.credential_code}</span></div>)}</div></div>}
      </div>}

      {view === "scheduled" && <div className="space-y-4">
        <div><h3 className="font-display text-3xl font-black">Scheduled renewal notices</h3><p className="mt-2 text-sm text-slate-400">90-, 60-, and 30-day notices are created when a credential is issued or renewed. The daily database job promotes due notices into the delivery queue.</p></div>
        <div className="overflow-hidden rounded-[2rem] border border-white/10"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-white/[.04] text-xs uppercase tracking-[.12em] text-slate-500"><tr><th className="px-5 py-4">Scheduled</th><th className="px-5 py-4">Notice</th><th className="px-5 py-4">Holder</th><th className="px-5 py-4">Credential</th><th className="px-5 py-4">Expires</th></tr></thead><tbody>{scheduled.map((item) => <tr key={item.id} className="border-t border-white/10"><td className="px-5 py-4 font-bold">{displayDate(item.scheduled_for)}</td><td className="px-5 py-4 text-slate-300">{pretty(item.notice_type)}</td><td className="px-5 py-4 text-slate-300">{item.recipient_name}</td><td className="px-5 py-4 font-mono text-xs text-[#76ead6]">{item.credential_code}</td><td className="px-5 py-4 text-slate-400">{displayDate(item.expires_at)}</td></tr>)}</tbody></table></div></div>
        {scheduled.length === 0 && <div className="rounded-[2rem] border border-dashed border-white/15 p-10 text-center text-sm text-slate-500">No future renewal notices are scheduled yet.</div>}
      </div>}

      {view === "records" && <div className="space-y-4">
        <div><h3 className="font-display text-3xl font-black">Authorization records & roster</h3><p className="mt-2 text-sm text-slate-400">Open the premium printable record, download the QR credential card, or export the current credential registry as CSV.</p></div>
        <div className="grid gap-4 lg:grid-cols-2">{dashboard.credentials.map((credential) => <article key={credential.id} className="rounded-[2rem] border border-white/10 bg-white/[.035] p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold text-[#76ead6]">{credential.credential_id}</p><h4 className="mt-2 font-display text-2xl font-black">{credential.holder_name}</h4><p className="mt-1 text-sm text-slate-400">{credential.organization || "Independent"} · {pretty(credential.status)}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase tracking-[.12em] text-slate-400">expires {credential.expires_at}</span></div><div className="mt-5 flex flex-wrap gap-2"><a href={`/credentials/record/${encodeURIComponent(credential.credential_id)}`} className="button-primary">Authorization record</a><a href={`/api/credentials/card?id=${encodeURIComponent(credential.credential_id)}`} className="button-secondary">Download card</a><a href={`/credentials/verify?id=${encodeURIComponent(credential.credential_id)}`} className="button-secondary">Verify</a></div></article>)}</div>
        {dashboard.credentials.length === 0 && <div className="rounded-[2rem] border border-dashed border-white/15 p-10 text-center text-sm text-slate-500">No credentials issued yet.</div>}
      </div>}

      <div className="rounded-[2rem] border border-white/10 bg-[#04111b] p-6 text-xs leading-6 text-slate-500">
        <strong className="text-slate-300">Automation boundary:</strong> This console automates credential administration and renewal timing only. It does not ingest participant reflections, youth records, diagnoses, counseling notes, safeguarding narratives, clinical information, clergy/spiritual-direction records, or sports-medicine records. Credential payments remain separate from charitable donations.
      </div>
    </div>
  );
}
